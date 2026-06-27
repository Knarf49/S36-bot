import os
import io
import base64
import re as _re
from flask import Flask, request, abort, send_file
from linebot import WebhookHandler, LineBotApi
from linebot.exceptions import InvalidSignatureError
from linebot.models import (
    MessageEvent, TextMessage, ImageMessage,
    TextSendMessage, ImageSendMessage,
)

from tools_agent import (
    SYSTEM_PROMPT, TOOLS,
    execute_tool, set_pending_slip, get_pending_slip,
    call_ollama, run_tool_loop,
)

app = Flask(__name__)

CHANNEL_SECRET = os.getenv("LINE_CHANNEL_SECRET", "")
CHANNEL_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN", "")
NGROK_DOMAIN = os.getenv("NGROK_DOMAIN", "s36bot.ngrok-free.app")

handler = WebhookHandler(CHANNEL_SECRET)
line_api = LineBotApi(CHANNEL_TOKEN)

conversations = {}  # { user_id: [messages] }
qr_cache = {}  # { user_id: base64 }


def get_convo(user_id):
    if user_id not in conversations:
        conversations[user_id] = [{"role": "system", "content": SYSTEM_PROMPT}]
    msgs = conversations[user_id]
    if len(msgs) > 21:
        conversations[user_id] = [msgs[0]] + msgs[-20:]
    return conversations[user_id]


@app.route("/callback", methods=["POST"])
def callback():
    signature = request.headers.get("X-Line-Signature", "")
    body = request.get_data(as_text=True)
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)
    return "OK"


@app.route("/qr/<user_id>.png")
def serve_qr(user_id):
    b64 = qr_cache.get(user_id)
    if not b64:
        return "QR not found", 404
    return send_file(io.BytesIO(base64.b64decode(b64)), mimetype="image/png")


@handler.add(MessageEvent, message=TextMessage)
def handle_text(event):
    user_id = event.source.user_id
    text = event.message.text
    print(f"[TEXT] user={user_id} text={text}")
    msgs = get_convo(user_id)
    msgs.append({"role": "user", "content": text})

    try:
        print(f"[BOT] calling run_tool_loop...")
        msgs = run_tool_loop(msgs, user_id)
        print(f"[BOT] run_tool_loop done, {len(msgs)} messages")
    except Exception as e:
        print(f"[ERROR] run_tool_loop failed: {e}")
        import traceback; traceback.print_exc()
        line_api.reply_message(event.reply_token, TextSendMessage(text="เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลังค่ะ"))
        return

    conversations[user_id] = msgs

    qr_data = None
    for m in reversed(msgs):
        c = m.get("content", "")
        if "QR_CODE:" in c:
            m2 = _re.search(r"QR_CODE:([A-Za-z0-9+/=]+)", c)
            if m2:
                qr_data = m2.group(1)
                break

    last = msgs[-1]
    reply_text = last.get("content", "")
    print(f"[BOT] reply_text ({len(reply_text)} chars): {reply_text[:100]}")
    if not reply_text and not qr_data:
        print(f"[BOT] empty reply - not sending")
        return

    if qr_data:
        qr_cache[user_id] = qr_data
        qr_url = f"https://{NGROK_DOMAIN}/qr/{user_id}.png"
        clean_text = reply_text.replace(f"QR_CODE:{qr_data}", "").replace(f"|AMOUNT:", " ").strip()
        line_api.reply_message(
            event.reply_token,
            [
                TextSendMessage(text=clean_text or "สแกนเพื่อชำระเงิน"),
                ImageSendMessage(original_content_url=qr_url, preview_image_url=qr_url),
            ],
        )
        return

    line_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))


@handler.add(MessageEvent, message=ImageMessage)
def handle_image(event):
    user_id = event.source.user_id
    msg_id = event.message.id

    try:
        content = line_api.get_message_content(msg_id)
        img_bytes = b""
        for chunk in content.iter_content():
            img_bytes += chunk
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")
    except Exception as e:
        line_api.reply_message(event.reply_token, TextSendMessage(text="ไม่สามารถดาวน์โหลดรูปได้ กรุณาลองใหม่ค่ะ"))
        return

    set_pending_slip(img_b64, user_id)

    msgs = get_convo(user_id)
    msgs.append({"role": "user", "content": "ผู้ใช้ส่งสลิปการโอนเงินมาให้ตรวจสอบ"})

    try:
        msgs = run_tool_loop(msgs, user_id)
    except Exception as e:
        line_api.reply_message(event.reply_token, TextSendMessage(text="เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลังค่ะ"))
        return

    conversations[user_id] = msgs
    last = msgs[-1]
    reply_text = last.get("content", "")
    if reply_text:
        print(f"[BOT] sending reply to user={user_id}")
        line_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))


@app.route("/health")
def health():
    return "OK"


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
