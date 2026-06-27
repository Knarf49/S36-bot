"""gemma_gradio.py — Gradio chat UI for Gemma4 with streaming + tool-call loop"""
import base64
import json
import mimetypes
import os
import sys
import urllib.request
from datetime import datetime as dt

import gradio as gr

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools_agent import (
    SYSTEM_PROMPT, MODEL, TOOLS, NUM_CTX, execute_tool, set_pending_slip,
)
from session_state import get_session, detect_courier, build_state_block, Stage, STAGE_TOOLS, advance_if_prices

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_NATIVE = f"{OLLAMA_HOST}/api/chat"

_conv_file = None

def _log_conv(user_text, bot_text):
    global _conv_file
    try:
        os.makedirs('conversations', exist_ok=True)
        if _conv_file is None:
            _conv_file = f"conversations/{dt.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(_conv_file, 'a', encoding='utf-8') as f:
            ts = dt.now().strftime('%H:%M:%S')
            if user_text:
                f.write(f"[{ts}] User: {user_text}\n")
            if bot_text:
                f.write(f"[{ts}] Bot: {bot_text}\n")
            f.write("\n")
    except Exception:
        pass

TOOL_INFO_MAP = {
    'shipping_fee_calculator': 'กำลังคำนวณค่าส่ง...',
    'check_schedule': 'กำลังเช็คเวลาเปิดร้าน...',
    'get_shipping_status': 'กำลังค้นหาสถานะพัสดุ...',
    'generate_promptpay_qr': 'กำลังสร้าง QR พร้อมเพย์...',
    'verify_slip': 'กำลังตรวจสอบสลิปด้วย AI...',
    'create_shipping_order': 'กำลังสร้างออเดอร์...',
}


def _encode_file(path):
    try:
        if not os.path.isfile(path):
            return None
        with open(path, 'rb') as f:
            return base64.b64encode(f.read()).decode()
    except Exception:
        return None


def _is_image_file(path):
    if not path:
        return False
    ext = os.path.splitext(path)[1].lower()
    if ext in ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'):
        return True
    mime, _ = mimetypes.guess_type(path)
    return bool(mime and mime.startswith('image/'))

import re as _re_html
_HTML_RE = _re_html.compile(r'<[^>]*>')
_IMG_SRC_RE = _re_html.compile(r'src="data:image/[^"]+')


def _clean_html(text):
    if not text:
        return text
    text = _IMG_SRC_RE.sub('src="[QR_CODE]"', text)
    return _HTML_RE.sub('', text)


def stream_ollama(messages, tools=None):
    if tools is None:
        tools = TOOLS
    first = True
    for iteration in range(5):
        if first:
            yield ("thinking", None)
            first = False

        body = json.dumps({
            "model": MODEL,
            "messages": messages,
            "tools": tools,
            "stream": True,
            "options": {"num_ctx": NUM_CTX, "temperature": 0},
        }).encode('utf-8')
        req = urllib.request.Request(OLLAMA_NATIVE, data=body, method='POST')
        req.add_header('Content-Type', 'application/json')

        full_content = ''
        full_tool_calls = None

        try:
            with urllib.request.urlopen(req, timeout=180) as resp:
                for line in resp:
                    line = line.decode('utf-8').strip()
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                    except json.JSONDecodeError:
                        continue

                    token = chunk.get('message', {}).get('content', '')
                    if token:
                        full_content += token
                        yield ("token", token)

                    tc = chunk.get('message', {}).get('tool_calls')
                    if tc:
                        full_tool_calls = tc

                    if chunk.get('done'):
                        break
        except Exception as e:
            if "Connection refused" in str(e) or "Errno 111" in str(e):
                yield ("error", "ระบบปิดทำการอยู่ กรุณาลองใหม่อีกครั้งในช่วงเวลาเปิดทำการ")
            else:
                yield ("error", f"Ollama error: {e}")
            return

        if full_tool_calls:
            assistant_msg = {
                "role": "assistant",
                "content": full_content,
                "tool_calls": full_tool_calls,
            }
            messages.append(assistant_msg)

            for tc in full_tool_calls:
                tool_name = tc['function']['name']
                info = TOOL_INFO_MAP.get(tool_name, 'กำลังดำเนินการ...')
                yield ("tool", info)
                tool_result = execute_tool(tc)

                if tool_result and "QR_CODE:" in tool_result:
                    import re as _re
                    m = _re.search(r'QR_CODE:([A-Za-z0-9+/=]+)', tool_result)
                    if m:
                        yield ("qr", m.group(1))

                messages.append({
                    "role": "tool",
                    "tool_call_id": tc['id'],
                    "content": tool_result,
                })

            yield ("thinking", None)
            continue
        else:
            messages.append({"role": "assistant", "content": full_content})
            break
    else:
        yield ("error", "ถึงขีดจำกัดการค้นหา")

    yield ("done", None)


def chat_fn(message, history, request: gr.Request | None = None):
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in history:
            role = h.get("role")
            content = h.get("content", "")
            if role in ("user", "assistant") and content:
                content = _clean_html(content)
                if content.strip():
                    messages.append({"role": role, "content": content})

        user_text = ""
        files = []

        if isinstance(message, dict):
            user_text = message.get("text", "")
            files = message.get("files", [])
        elif isinstance(message, str):
            user_text = message

        if files:
            image_b64 = None
            for f in files:
                if isinstance(f, dict):
                    fpath = f.get("path", "")
                else:
                    fpath = f
                if _is_image_file(fpath):
                    image_b64 = _encode_file(fpath)
                    break

            if image_b64:
                set_pending_slip(image_b64)
                user_content = user_text or "ผู้ใช้ส่งสลิปการโอนเงินมาให้ตรวจสอบ"
            else:
                user_content = user_text
        else:
            user_content = user_text

        if user_content and (not history or history[-1].get("content") != user_content):
            messages.append({"role": "user", "content": user_content})
            _log_conv(user_content, None)

        # State machine: detect courier choice, gate tools, inject state block
        sess = get_session(str(request.session_hash) if request and hasattr(request, 'session_hash') else 'gradio_default')
        # Detect courier + advance stage based on tool results
        picked = detect_courier(user_content or "")
        if picked and sess.stage == Stage.AWAIT_PICK:
            sess.selected_courier = picked
            sess.stage = Stage.COLLECT_INFO

        advance_if_prices(sess, messages)

        state_block = build_state_block(sess)
        print(f"[STATE] stage={sess.stage.name} courier={sess.selected_courier} prices={list(sess.quoted_prices.keys())}")
        messages[0] = {"role": "system", "content": SYSTEM_PROMPT + "\n\n" + state_block}
        allowed = STAGE_TOOLS.get(sess.stage, None)
        gated_tools = [t for t in TOOLS if t["function"]["name"] in allowed] if allowed is not None else TOOLS

        response = ""
        tool_msgs = []
        qr_base64 = None
        for status, data in stream_ollama(messages, gated_tools):
            if status == "token":
                if tool_msgs:
                    tool_msgs = []
                response += data
                yield response
            elif status == "tool":
                if data.startswith("🔄 ") and "QR" in data:
                    pass
                tool_msgs.append(f"🔄 {data}")
                yield "\n".join(tool_msgs)
            elif status == "qr":
                qr_base64 = data
            elif status == "error":
                response += f"\n\n{data}\n"
                yield response
            elif status == "thinking":
                if not response and not tool_msgs:
                    yield "⏳ กำลังประมวลผล..."
                else:
                    pass
            elif status == "done":
                pass

        _log_conv(None, response or ('\n'.join(tool_msgs) if tool_msgs else ''))

        if qr_base64:
            sess.stage = Stage.AWAIT_PAYMENT
            if response:
                yield response
            yield f'<div style="text-align:center;margin:10px 0;"><img src="data:image/png;base64,{qr_base64}" alt="PromptPay QR" style="max-width:280px;border-radius:8px;border:2px solid #e5e7eb;"/><br><small>สแกนเพื่อชำระเงิน</small></div>'
            qr_base64 = None
            return

        if not response and not tool_msgs:
            yield "ขออภัย ไม่สามารถประมวลผลได้ในขณะนี้"
        elif not response and tool_msgs:
            yield "\n".join(tool_msgs)
    except Exception as e:
        yield f"❌ เกิดข้อผิดพลาด: {e}"


if __name__ == "__main__":
    demo = gr.ChatInterface(
        fn=chat_fn,
        title="🚚 S36 Bot — Gemma4",
        description="ถามค่าส่ง · เช็คเวลาเปิดร้าน · ติดตามพัสดุ",
        examples=[
            "ส่งของไปเชียงใหม่ 5 กิโล",
            "ร้านเปิดมั้ย",
            "เช็คสถานะ 0812345678",
            "จ-ศ เปิดกี่โมง",
        ],
        type="messages",
        theme="soft",
        multimodal=True,
    )
    demo.launch(server_name="0.0.0.0", server_port=7860)
