import os
import io
import time
import hmac
import hashlib
import json
import base64
import re as _re
from flask import Flask, request, abort, send_file
from linebot.v3 import WebhookHandler
from linebot.v3.exceptions import InvalidSignatureError
from linebot.v3.messaging import (
    Configuration,
    ApiClient,
    MessagingApi,
    MessagingApiBlob,
    ReplyMessageRequest,
    TextMessage,
    ImageMessage,
)
from linebot.v3.webhooks import MessageEvent, TextMessageContent, ImageMessageContent

from tools_agent import (
    SYSTEM_PROMPT, TOOLS,
    execute_tool, set_pending_slip, get_pending_slip,
    call_ollama, run_tool_loop, get_cached_qr, handle_slip_verification_direct,
)


def _is_ollama_unavailable_error(exc):
    text = str(exc).lower()
    return any(token in text for token in ["connection refused", "timed out", "name or service not known", "temporary failure", "failed to connect", "urlopen"])
from session_state import get_session, save_session, detect_courier, build_state_block, Stage, advance_if_prices, needs_qr, parse_info_fields, reset_session, is_reset_command, is_bulk_command, parse_multi_items, is_slip_test_command, extract_amount, get_convo as s_get_convo, save_convo, delete_convo, validate_address_fields
from image_utils import normalize_binary_payload

app = Flask(__name__)

CHANNEL_SECRET = os.getenv("LINE_CHANNEL_SECRET", "")
CHANNEL_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN", "")
NGROK_DOMAIN = os.getenv("NGROK_DOMAIN", "s36bot.ngrok-free.app")

handler = WebhookHandler(CHANNEL_SECRET)
configuration = Configuration(access_token=CHANNEL_TOKEN)

qr_cache = {}  # { user_id: base64 }


def get_convo(user_id):
    msgs = s_get_convo(user_id)
    if not msgs:
        msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
        save_convo(user_id, msgs)
    if len(msgs) > 21:
        msgs = [msgs[0]] + msgs[-20:]
        save_convo(user_id, msgs)
    return msgs


def send_reply(reply_token, messages):
    with ApiClient(configuration) as api_client:
        messaging_api = MessagingApi(api_client)
        messaging_api.reply_message(
            ReplyMessageRequest(reply_token=reply_token, messages=messages)
        )


def download_message_content(message_id):
    with ApiClient(configuration) as api_client:
        blob_api = MessagingApiBlob(api_client)
        try:
            payload = blob_api.get_message_content(message_id)
            data = normalize_binary_payload(payload)
            if data:
                return data
        except Exception as e:
            print(f"[WARN] primary blob download failed: {e}", flush=True)

        try:
            import requests
            headers = {"Authorization": f"Bearer {CHANNEL_TOKEN}"}
            url = f"https://api-data.line.me/v2/bot/message/{message_id}/content"
            resp = requests.get(url, headers=headers, timeout=20)
            resp.raise_for_status()
            return resp.content
        except Exception as e:
            print(f"[WARN] fallback download failed: {e}", flush=True)
            raise


@app.route("/callback", methods=["POST"])
def callback():
    signature = request.headers.get("X-Line-Signature", "")
    body = request.get_data(cache=True, as_text=False)  # raw bytes — needed for HMAC
    body_text = body.decode("utf-8", errors="replace")   # str — needed for handler.handle()

    expected_signature = base64.b64encode(
        hmac.new(CHANNEL_SECRET.encode("utf-8"), body, hashlib.sha256).digest()
    ).decode("ascii")

    print(f"[WEBHOOK] received body={body_text[:600]}", flush=True)
    print(f"[WEBHOOK] signature_header={signature}", flush=True)
    print(f"[WEBHOOK] signature_expected={expected_signature}", flush=True)

    try:
        handler.handle(body_text, signature)   # ← use body_text, not body
    except InvalidSignatureError:
        print("[WEBHOOK] invalid signature", flush=True)
        abort(400)
    return "OK"


@app.route("/qr/<uid>.png")
def serve_qr(uid):
    # uid = user_id or user_id.key
    b64 = qr_cache.get(uid)
    if not b64:
        return "QR not found", 404
    return send_file(io.BytesIO(base64.b64decode(b64)), mimetype="image/png")


@handler.add(MessageEvent)
def handle_any_message(event):
    msg = getattr(event, "message", None)
    msg_type = getattr(msg, "type", None)
    msg_id = getattr(msg, "id", None)
    print(f"[WEBHOOK] event_type={getattr(event, 'type', None)} message_type={msg_type} message_id={msg_id}", flush=True)


@handler.add(MessageEvent, message=TextMessageContent)
def handle_text(event):
    user_id = event.source.user_id
    text = event.message.text
    print(f"[TEXT] user={user_id} text={text}", flush=True)

    sess = get_session(user_id)

    # Reset command: clear session + conversation
    if is_reset_command(text):
        reset_session(user_id)
        delete_convo(user_id)
        qr_cache_keys = [k for k in qr_cache if k.startswith(user_id + '.')]
        for k in qr_cache_keys:
            qr_cache.pop(k, None)
        send_reply(event.reply_token, [TextMessage(text="เริ่มรายการใหม่แล้วค่ะ ต้องการสอบถามอะไรคะ?")])
        print(f"[STATE] user={user_id} session reset", flush=True)
        return

    # Bulk command: parse multi items and quote each
    if is_bulk_command(text):
        items = parse_multi_items(text)
        if items:
            from tools_agent import compare_all_couriers, COURIER_NAMES, normalize_province
            lines = []
            for i, it in enumerate(items, 1):
                prov = normalize_province(it['province'])
                if not prov:
                    lines.append(f"ชิ้นที่ {i}: ไมพบบจังหวัด '{it['province']}'")
                    continue
                w = it['w_cm'] or 0; l = it['l_cm'] or 0; h = it['h_cm'] or 0
                results = compare_all_couriers(prov, it['weight_kg'], w, l, h)
                lines.append(f"ชิ้นที่ {i} ({prov} {it['weight_kg']}kg):")
                for r in results[:6]:
                    if r.get('rejected'):
                        lines.append(f"  {COURIER_NAMES.get(r['courier_code'], r['courier_code'])}: {r.get('reason', 'N/A')}")
                    else:
                        lines.append(f"  {COURIER_NAMES.get(r['courier_code'], r['courier_code'])}: {r['price']} บาท")
                lines.append("")
            reply_text = '\n'.join(lines) + '\nเลือกขนส่งทีละรายการโดยพิมพ์ชื่อจังหวัดและน้ำหนักนะคะ'
            send_reply(event.reply_token, [TextMessage(text=reply_text)])
            print(f"[BULK] user={user_id} quoted {len(items)} items", flush=True)
        else:
            send_reply(event.reply_token, [TextMessage(text="ระบบยังไม่รองรับการคิดค่าส่งหลายชิ้นพร้อมกันนะคะ\n"
                     "ลองพิมพ์แบบนี้:\n"
                     "ชิ้น1: เชียงใหม่ 2kg 20x30x10\n"
                     "ชิ้น2: กรุงเทพ 5kg 30x40x20")])
        return

    # Slip test mode: verify slip directly without order flow
    if is_slip_test_command(text):
        sess.stage = Stage.SLIP_TEST
        amt = extract_amount(text)
        if amt:
            sess.qr_amount = amt
            save_session(user_id, sess)
            send_reply(event.reply_token, [TextMessage(text=f"โหมดตรวจสอบสลิป\nกรุณาส่งรูปสลิปเพื่อตรวจสอบยอด {amt:.0f} บาท\nพิม 'ออก' เพื่อออกจากโหมดนี้")])
        else:
            save_session(user_id, sess)
            send_reply(event.reply_token, [TextMessage(text="โหมดตรวจสอบสลิป\nกรุณาส่งรูปสลิปพร้อมแจ้งจำนวนเงิน\nพิม 'ออก' เพื่อออกจากโหมดนี้")])
        print(f"[STATE] user={user_id} entered SLIP_TEST mode", flush=True)
        return

    if sess.stage == Stage.SLIP_TEST:
        if is_reset_command(text) or text.strip().lower() in ('ออก', 'exit', 'quit', 'done', 'เสร็จ', 'พอ'):
            reset_session(user_id)
            delete_convo(user_id)
            send_reply(event.reply_token, [TextMessage(text="ออกจากโหมดตรวจสอบสลิปแล้ว ต้องการสอบถามอะไรคะ?")])
            print(f"[STATE] user={user_id} exited SLIP_TEST", flush=True)
            return
        amt = extract_amount(text)
        if amt:
            sess.qr_amount = amt
            save_session(user_id, sess)
            send_reply(event.reply_token, [TextMessage(text=f"รับยอด {amt:.0f} บาทแล้ว กรุณาส่งรูปสลิปเพื่อตรวจสอบ")])
        else:
            send_reply(event.reply_token, [TextMessage(text="กรุณาส่งรูปสลิปพร้อมแจ้งจำนวนเงิน หรือพิม 'ออก' เพื่อออกจากโหมดนี้")])
        return

    # Courier detection: if user types a courier name, Python captures it
    picked = detect_courier(text)
    if picked:
        if sess.stage == Stage.AWAIT_PICK:
            sess.selected_courier = picked
            sess.stage = Stage.COLLECT_INFO
            save_session(user_id, sess)
            print(f"[STATE] user={user_id} picked courier={picked}, advanced to COLLECT_INFO", flush=True)
        elif sess.stage == Stage.COLLECT_INFO and picked != sess.selected_courier:
            sess.selected_courier = picked
            save_session(user_id, sess)
            print(f"[STATE] user={user_id} re-picked courier to {picked}", flush=True)

    # Auto-reset stale session: text in AWAIT_PAYMENT means new intent
    if sess.stage == Stage.AWAIT_PAYMENT:
        reset_session(user_id)
        delete_convo(user_id)
        qr_cache_keys = [k for k in qr_cache if k.startswith(user_id + '.')]
        for k in qr_cache_keys:
            qr_cache.pop(k, None)
        sess = get_session(user_id)
        print(f"[STATE] user={user_id} auto-reset from AWAIT_PAYMENT (text received)", flush=True)

    msgs = get_convo(user_id)
    msg_count_before = len(msgs)
    msgs.append({"role": "user", "content": text})

    try:
        # Address validation: check structured address fields against Thai geography DB
        if sess.stage == Stage.COLLECT_INFO and any([
            sess.sender_subdistrict, sess.sender_district, sess.sender_province, sess.sender_zip,
            sess.receiver_subdistrict, sess.receiver_district, sess.receiver_province, sess.receiver_zip,
        ]):
            ok, msg = validate_address_fields(sess)
            if not ok:
                save_session(user_id, sess)
                save_convo(user_id, msgs)
                send_reply(event.reply_token, [TextMessage(text=f"{msg}\n\nกรุณาตรวจสอบและส่งข้อมูลที่อยู่อีกครั้งค่ะ")])
                return
            if msg:
                save_session(user_id, sess)
                save_convo(user_id, msgs)
                send_reply(event.reply_token, [TextMessage(text=f"รับทราบข้อมูลค่ะ\n{msg}")])
                return

        # Force QR generation when all info collected (8B model compliance gap)
        parse_info_fields(text, sess)
        if needs_qr(sess):
            price = sess.quoted_prices[sess.selected_courier]
            result = execute_tool({"function": {"name": "generate_promptpay_qr", "arguments": {"amount": price}}})
            if "QR_CODE:" in result:
                sess.stage = Stage.AWAIT_PAYMENT
                print(f"[STATE] user={user_id} Python-forced QR, advanced to AWAIT_PAYMENT", flush=True)
                msgs.append({"role": "assistant", "content": "", "tool_calls": [
                    {"index": 0, "function": {"name": "generate_promptpay_qr", "arguments": json.dumps({"amount": price})}}
                ]})
                msgs.append({"role": "tool", "content": result})
                save_convo(user_id, msgs)
                sess.slip_baseline_msg_count = len(msgs)
                save_session(user_id, sess)
                # Build reply directly — skip model (8B hallucinates English)
                qr_b64 = get_cached_qr(price)
                if qr_b64:
                    qr_key = f"{user_id}.{int(time.time())}"
                    qr_cache[qr_key] = qr_b64
                    qr_url = f"https://{NGROK_DOMAIN}/qr/{qr_key}.png"
                    send_reply(
                        event.reply_token,
                        [
                            TextMessage(text=f"สแกนเพื่อชำระเงิน {price:.0f} บาท"),
                            ImageMessage(original_content_url=qr_url, preview_image_url=qr_url),
                        ],
                    )
                    print(f"[BOT] QR sent to user={user_id} ({price:.0f} THB)", flush=True)
                    return

        # Bypass model in AWAIT_PICK when user provides contact info — 8B unreliable
        if sess.stage == Stage.AWAIT_PICK and (
            _re.search(r'(ผู้ส่ง|ผู้รับ|ที่อยู่)', text) or
            _re.search(r'0[689]\d{8,9}', text)
        ):
            save_convo(user_id, msgs)
            save_session(user_id, sess)
            send_reply(event.reply_token, [TextMessage(text="เลือกขนส่งเจ้าไหนคะ?")])
            print(f"[STATE] user={user_id} AWAIT_PICK bypass (model skipped)", flush=True)
            return

        # In COLLECT_INFO, if fields incomplete → skip model, ask missing only
        if sess.stage == Stage.COLLECT_INFO and not needs_qr(sess):
            missing = []
            if not sess.sender: missing.append("ชื่อ-นามสกุลผู้ส่ง")
            if not sess.sender_phone: missing.append("เบอร์โทรผู้ส่ง")
            if not sess.id_number: missing.append("เลขบัตรประชาชน/หนังสือเดินทาง")
            if not sess.sender_addr: missing.append("ที่อยู่ผู้ส่ง (ตำบล อำเภอ จังหวัด รหัสไปรษณีย์)")
            if not sess.receiver: missing.append("ชื่อ-นามสกุลผู้รับ")
            if not sess.receiver_phone: missing.append("เบอร์โทรผู้รับ")
            if not sess.receiver_addr: missing.append("ที่อยู่ผู้รับ (ตำบล อำเภอ จังหวัด รหัสไปรษณีย์)")
            if missing:
                save_convo(user_id, msgs)
                save_session(user_id, sess)
                send_reply(event.reply_token, [TextMessage(text=f"รับทราบข้อมูลค่ะ\nยังขาด: {', '.join(missing)}")])
                print(f"[STATE] user={user_id} COLLECT_INFO incomplete, missing: {missing}", flush=True)
                return

        print(f"[BOT] calling run_tool_loop (stage={sess.stage.name})...", flush=True)
        msgs = run_tool_loop(msgs, user_id, sess)
        print(f"[BOT] run_tool_loop done, {len(msgs)} messages", flush=True)
    except Exception as e:
        print(f"[ERROR] run_tool_loop failed: {e}", flush=True)
        import traceback; traceback.print_exc()
        send_reply(event.reply_token, [TextMessage(text="เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลังค่ะ")])
        return

    # Advance stage based on tool results in new messages only
    advance_if_prices(sess, msgs)

    # After QR generated: advance to AWAIT_PAYMENT (scan new messages only)
    for m in msgs[msg_count_before:]:
        if m.get("role") == "system":
            continue
        content = m.get("content", "")
        if "QR_CODE:" in content:
            sess.stage = Stage.AWAIT_PAYMENT
            print(f"[STATE] user={user_id} QR generated, advanced to AWAIT_PAYMENT", flush=True)
            break

    save_convo(user_id, msgs)
    save_session(user_id, sess)

    qr_data = None
    last = msgs[-1]
    reply_text = last.get("content", "")
    qr_amt_match = _re.search(r'AMOUNT:([\d.]+)', reply_text)
    if qr_amt_match:
        qr_data = get_cached_qr(float(qr_amt_match.group(1)))
    print(f"[BOT] reply_text ({len(reply_text)} chars): {reply_text[:100]}", flush=True)
    if not reply_text and not qr_data:
        print(f"[BOT] empty reply - not sending", flush=True)
        return

    if qr_data:
        qr_key = f"{user_id}.{int(time.time())}"
        qr_cache[qr_key] = qr_data
        qr_url = f"https://{NGROK_DOMAIN}/qr/{qr_key}.png"
        clean_text = _re.sub(r'QR_CODE:\[image_data\]\|AMOUNT:[\d.]+', '', reply_text).strip() or "สแกนเพื่อชำระเงิน"
        send_reply(
            event.reply_token,
            [
                TextMessage(text=clean_text or "สแกนเพื่อชำระเงิน"),
                ImageMessage(original_content_url=qr_url, preview_image_url=qr_url),
            ],
        )
        return

    send_reply(event.reply_token, [TextMessage(text=reply_text)])


@handler.add(MessageEvent, message=ImageMessageContent)
def handle_image(event):
    user_id = event.source.user_id
    msg_id = event.message.id

    try:
        print(f"[IMAGE] downloading image msg_id={msg_id} user={user_id}", flush=True)
        img_bytes = download_message_content(msg_id)
        if not img_bytes:
            raise ValueError("empty image content")
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")
        print(f"[IMAGE] downloaded bytes={len(img_bytes)} user={user_id}", flush=True)
    except Exception as e:
        print(f"[ERROR] image download failed: {e}", flush=True)
        send_reply(event.reply_token, [TextMessage(text="ไม่สามารถดาวน์โหลดรูปได้ กรุณาลองใหม่ค่ะ")])
        return

    set_pending_slip(img_b64, user_id)

    sess = get_session(user_id)

    # Slip test mode: verify directly, bypass Ollama
    if sess.stage == Stage.SLIP_TEST:
        expected = sess.qr_amount or 0
        if expected <= 0:
            send_reply(event.reply_token, [TextMessage(text="กรุณาแจ้งจำนวนเงินที่ต้องการตรวจสอบก่อนส่งรูปสลิป")])
            return
        try:
            result = execute_tool({"function": {"name": "verify_slip", "arguments": {"expected_amount": expected}}}, user_id)
            reset_session(user_id)
            delete_convo(user_id)
            send_reply(event.reply_token, [TextMessage(text=result)])
            print(f"[SLIP_TEST] verified slip for user={user_id} amount={expected}", flush=True)
        except Exception as e:
            send_reply(event.reply_token, [TextMessage(text=f"ตรวจสอบสลิปไม่สำเร็จ: {e}")])
        return

    # Normal shipping flow: verify slip directly, bypass Ollama
    if sess.stage == Stage.AWAIT_PAYMENT:
        expected = sess.quoted_prices.get(sess.selected_courier, 0)
        if expected <= 0:
            send_reply(event.reply_token, [TextMessage(text="ไม่พบราคาสินค้า กรุณาเริ่มรายการใหม่")])
            return
        try:
            result = handle_slip_verification_direct(img_b64, expected, user_id, sess)
            if "สร้างออเดอร์สำเร็จ" in result:
                reset_session(user_id)
                delete_convo(user_id)
            send_reply(event.reply_token, [TextMessage(text=result)])
            print(f"[SLIP] direct verify for user={user_id} amount={expected}", flush=True)
        except Exception as e:
            send_reply(event.reply_token, [TextMessage(text=f"ตรวจสอบสลิปไม่สำเร็จ: {e}")])
        return

    msgs = get_convo(user_id)
    baseline = sess.slip_baseline_msg_count
    if baseline > 0 and len(msgs) > baseline:
        msgs = msgs[:baseline]
    msgs.append({"role": "user", "content": "ผู้ใช้ส่งสลิปการโอนเงินมาให้ตรวจสอบ"})

    try:
        print(f"[IMAGE] running tool loop for user={user_id}", flush=True)
        msgs = run_tool_loop(msgs, user_id, get_session(user_id))
        print(f"[IMAGE] tool loop completed for user={user_id}", flush=True)
    except Exception as e:
        print(f"[ERROR] image tool loop failed: {e}", flush=True)
        if _is_ollama_unavailable_error(e):
            send_reply(event.reply_token, [TextMessage(text="ระบบกำลังประมวลผลรูปอยู่ กรุณาลองใหม่อีกครั้งในอีกสักครู่ค่ะ")])
        else:
            send_reply(event.reply_token, [TextMessage(text="เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลังค่ะ")])
        return

    save_convo(user_id, msgs)
    last = msgs[-1]
    reply_text = last.get("content", "")
    print(f"[BOT] image reply_text ({len(reply_text)} chars): {reply_text[:120]}", flush=True)
    if reply_text:
        send_reply(event.reply_token, [TextMessage(text=reply_text)])


@app.route("/health")
def health():
    return "OK"


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print("[STARTUP] warming up Ollama model...", flush=True)
    try:
        import urllib.request, json, threading
        def _warm():
            body = json.dumps({
                "model": "gemma4:e4b",
                "messages": [{"role": "user", "content": "hi"}],
                "stream": False,
                "keep_alive": "30m",
                "options": {"num_ctx": 128, "temperature": 0},
            }).encode()
            req = urllib.request.Request(f"{os.getenv('OLLAMA_HOST', 'http://localhost:11434')}/v1/chat/completions", data=body, method="POST")
            req.add_header("Content-Type", "application/json")
            try:
                urllib.request.urlopen(req, timeout=120)
                print("[STARTUP] Ollama warm-up complete", flush=True)
            except Exception as e:
                print(f"[STARTUP] Ollama warm-up failed: {e}", flush=True)
        threading.Thread(target=_warm, daemon=True).start()
    except Exception as e:
        print(f"[STARTUP] warm-up error: {e}", flush=True)
    app.run(host="0.0.0.0", port=port)
