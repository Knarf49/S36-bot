"""gemma_gradio.py — Gradio chat UI for Gemma4 with streaming + tool-call loop"""
import json
import os
import sys
import urllib.request

import gradio as gr

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools_agent import (
    SYSTEM_PROMPT, MODEL, TOOLS, NUM_CTX, execute_tool,
)

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_NATIVE = f"{OLLAMA_HOST}/api/chat"

TOOL_INFO_MAP = {
    'shipping_fee_calculator': 'กำลังคำนวณค่าส่ง...',
    'check_schedule': 'กำลังเช็คเวลาเปิดร้าน...',
    'get_shipping_status': 'กำลังค้นหาสถานะพัสดุ...',
}


def stream_ollama(messages):
    first = True
    for iteration in range(5):
        if first:
            yield ("thinking", None)
            first = False

        body = json.dumps({
            "model": MODEL,
            "messages": messages,
            "tools": TOOLS,
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


def chat_fn(message, history):
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in history:
            role = h.get("role")
            content = h.get("content", "")
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})

        user_text = message if isinstance(message, str) else message.get("content", "")
        if user_text and (not history or history[-1].get("content") != user_text):
            messages.append({"role": "user", "content": user_text})

        response = ""
        tool_msgs = []
        for status, data in stream_ollama(messages):
            if status == "token":
                if tool_msgs:
                    tool_msgs = []
                response += data
                yield response
            elif status == "tool":
                tool_msgs.append(f"🔄 {data}")
                yield "\n".join(tool_msgs)
            elif status == "error":
                response += f"\n\n❌ {data}\n"
                yield response
            elif status == "thinking":
                if not response and not tool_msgs:
                    yield "⏳ กำลังประมวลผล..."
                else:
                    pass
            elif status == "done":
                pass

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
    )
    demo.launch(server_name="0.0.0.0", server_port=7860)
