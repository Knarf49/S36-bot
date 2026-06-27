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
    b64 = qr_cache.pop(user_id, None)
    if not b64:
        return "QR not found", 404
    return send_file(io.BytesIO(base64.b64decode(b64)), mimetype="image/png")


@handler.add(MessageEvent, message=TextMessage)
def handle_text(event):
    user_id = event.source.user_id
    text = event.message.text
    msgs = get_convo(user_id)
    msgs.append({"role": "user", "content": text})

    try:
        msgs = run_tool_loop(msgs, user_id)
    except Exception as e:
        line_api.reply_message(event.reply_token, TextSendMessage(text="เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลังค่ะ"))
        return

    conversations[user_id] = msgs
    last = msgs[-1]
    reply_text = last.get("content", "")
    if not reply_text:
        return

    if "QR_CODE:" in reply_text:
        import re as _re
        m = _re.search(r"QR_CODE:([A-Za-z0-9+/=]+)", reply_text)
        if m:
            qr_b64 = m.group(1)
            qr_cache[user_id] = qr_b64
            qr_url = f"https://{NGROK_DOMAIN}/qr/{user_id}.png"
            clean_text = reply_text.split("QR_CODE:")[0].strip()
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
        line_api.reply_message(event.reply_token, TextSendMessage(text=reply_text))


@app.route("/health")
def health():
    return "OK"


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
