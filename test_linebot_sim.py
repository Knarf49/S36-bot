"""
test_linebot_sim.py — Interactive Line bot simulator
Mirrors handle_text() from S36_bot/line_bot.py exactly.
stdin text → same state machine → same run_tool_loop → stdout reply.

Usage:
  $env:TEST_MODE = "1"
  $env:OLLAMA_HOST = "http://localhost:11434"
  python test_linebot_sim.py

Commands:
  @image <path>  — simulate slip upload (e.g. @image C:/Users/Frank/Downloads/test_slip.jpg)
  /reset         — reset session + conversation
  /state         — show current session state
  /quit          — exit
"""
import base64
import io
import json
import os
import re as _re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'S36_bot'))

from tools_agent import (
    SYSTEM_PROMPT, TOOLS, execute_tool, set_pending_slip, get_pending_slip,
    call_ollama, run_tool_loop, COURIER_NAMES, normalize_province, compare_all_couriers,
    PROMPTPAY_PHONE, MODEL, TEST_MODE, get_cached_qr, handle_slip_verification_direct,
)
from session_state import (
    get_session, save_session, detect_courier, build_state_block, Stage,
    advance_if_prices, needs_qr, parse_info_fields, reset_session,
    is_reset_command, is_bulk_command, parse_multi_items, is_slip_test_command, extract_amount,
    get_convo as s_get_convo, save_convo, delete_convo,
)

USER_ID = 'test_user'


def get_convo(user_id):
    msgs = s_get_convo(user_id)
    if not msgs:
        msgs = [{"role": "system", "content": SYSTEM_PROMPT}]
        save_convo(user_id, msgs)
    if len(msgs) > 21:
        msgs = [msgs[0]] + msgs[-20:]
        save_convo(user_id, msgs)
    return msgs


def handle_image(user_id, filepath):
    try:
        with open(filepath, 'rb') as f:
            img_bytes = f.read()
        img_b64 = base64.b64encode(img_bytes).decode('utf-8')
        print(f"[SIM] loaded image: {filepath} ({len(img_bytes)} bytes)")
    except Exception as e:
        print(f"[SIM] failed to load image: {e}")
        return "ไม่สามารถโหลดรูปได้"

    set_pending_slip(img_b64, user_id)

    sess = get_session(user_id)

    if sess.stage == Stage.SLIP_TEST:
        expected = sess.qr_amount or 0
        if expected <= 0:
            return "กรุณาแจ้งจำนวนเงินที่ต้องการตรวจสอบก่อนส่งรูปสลิป"
        try:
            result = execute_tool({"function": {"name": "verify_slip", "arguments": {"expected_amount": expected}}}, user_id)
            reset_session(user_id)
            delete_convo(user_id)
            print(f"[SIM] SLIP_TEST verified, amount={expected}")
            return result
        except Exception as e:
            return f"ตรวจสอบสลิปไม่สำเร็จ: {e}"

    if sess.stage == Stage.AWAIT_PAYMENT:
        expected = sess.quoted_prices.get(sess.selected_courier, 0)
        if expected <= 0:
            return "ไม่พบราคาสินค้า กรุณาเริ่มรายการใหม่"
        try:
            result = handle_slip_verification_direct(img_b64, expected, user_id, sess)
            if "สร้างออเดอร์สำเร็จ" in result:
                reset_session(user_id)
                delete_convo(user_id)
            print(f"[SIM] direct verify for user={user_id} amount={expected}")
            return result
        except Exception as e:
            return f"ตรวจสอบสลิปไม่สำเร็จ: {e}"

    msgs = get_convo(user_id)
    baseline = sess.slip_baseline_msg_count
    if baseline > 0 and len(msgs) > baseline:
        msgs = msgs[:baseline]
    msgs.append({"role": "user", "content": "ผู้ใช้ส่งสลิปการโอนเงินมาให้ตรวจสอบ"})

    try:
        print(f"[SIM] running tool loop for slip...")
        msgs = run_tool_loop(msgs, user_id, get_session(user_id))
        print(f"[SIM] tool loop completed")
    except Exception as e:
        print(f"[SIM] tool loop failed: {e}")
        import traceback; traceback.print_exc()
        return "เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลังค่ะ"

    save_convo(user_id, msgs)
    last = msgs[-1]
    return last.get("content", "")


def handle_text(user_id, text):
    """
    Mirrors handle_text() from S36_bot/line_bot.py lines 128-274.
    Same: reset, bulk, courier detect, parse info, force QR, run_tool_loop,
    advance_if_prices, QR extraction, reply.
    """
    sess = get_session(user_id)

    # ── Reset ──
    if is_reset_command(text):
        reset_session(user_id)
        delete_convo(user_id)
        print(f"[SIM] session reset")
        return "เริ่มรายการใหม่แล้วค่ะ ต้องการสอบถามอะไรคะ?"

    # ── Bulk ──
    if is_bulk_command(text):
        items = parse_multi_items(text)
        if items:
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
            return '\n'.join(lines) + '\nเลือกขนส่งทีละรายการโดยพิมพ์ชื่อจังหวัดและน้ำหนักนะคะ'
        else:
            return ("ระบบยังไม่รองรับการคิดค่าส่งหลายชิ้นพร้อมกันนะคะ\n"
                    "ลองพิมพ์แบบนี้:\n"
                    "ชิ้น1: เชียงใหม่ 2kg 20x30x10\n"
                    "ชิ้น2: กรุงเทพ 5kg 30x40x20")

    # ── Slip test mode ──
    if is_slip_test_command(text):
        sess.stage = Stage.SLIP_TEST
        amt = extract_amount(text)
        if amt:
            sess.qr_amount = amt
            save_session(user_id, sess)
            print(f"[SIM] entered SLIP_TEST mode, amount={amt}")
            return f"โหมดตรวจสอบสลิป\nกรุณาส่งรูปสลิปเพื่อตรวจสอบยอด {amt:.0f} บาท\nพิม 'ออก' เพื่อออกจากโหมดนี้"
        else:
            save_session(user_id, sess)
            print(f"[SIM] entered SLIP_TEST mode, no amount")
            return "โหมดตรวจสอบสลิป\nกรุณาส่งรูปสลิปพร้อมแจ้งจำนวนเงิน\nพิม 'ออก' เพื่อออกจากโหมดนี้"

    if sess.stage == Stage.SLIP_TEST:
        if is_reset_command(text) or text.strip().lower() in ('ออก', 'exit', 'quit', 'done', 'เสร็จ', 'พอ'):
            reset_session(user_id)
            delete_convo(user_id)
            print(f"[SIM] exited SLIP_TEST")
            return "ออกจากโหมดตรวจสอบสลิปแล้ว ต้องการสอบถามอะไรคะ?"
        amt = extract_amount(text)
        if amt:
            sess.qr_amount = amt
            save_session(user_id, sess)
            return f"รับยอด {amt:.0f} บาทแล้ว กรุณาส่งรูปสลิปเพื่อตรวจสอบ"
        else:
            return "กรุณาส่งรูปสลิปพร้อมแจ้งจำนวนเงิน หรือพิม 'ออก' เพื่อออกจากโหมดนี้"

    # ── Courier detection ──
    picked = detect_courier(text)
    if picked:
        if sess.stage == Stage.AWAIT_PICK:
            sess.selected_courier = picked
            sess.stage = Stage.COLLECT_INFO
            save_session(user_id, sess)
            print(f"[SIM] picked courier={picked}, advanced to COLLECT_INFO")
        elif sess.stage == Stage.COLLECT_INFO and picked != sess.selected_courier:
            sess.selected_courier = picked
            save_session(user_id, sess)
            print(f"[SIM] re-picked courier to {picked}")

    # Auto-reset stale session: text in AWAIT_PAYMENT means new intent
    if sess.stage == Stage.AWAIT_PAYMENT:
        reset_session(user_id)
        delete_convo(user_id)
        sess = get_session(user_id)
        print(f"[SIM] auto-reset from AWAIT_PAYMENT (text received)")

    msgs = get_convo(user_id)
    msg_count_before = len(msgs)
    msgs.append({"role": "user", "content": text})

    try:
        # ── Force QR generation when all info collected (8B compliance gap) ──
        parse_info_fields(text, sess)
        if needs_qr(sess):
            price = sess.quoted_prices[sess.selected_courier]
            result = execute_tool({"function": {"name": "generate_promptpay_qr", "arguments": {"amount": price}}})
            if "QR_CODE:" in result:
                sess.stage = Stage.AWAIT_PAYMENT
                print(f"[SIM] Python-forced QR generated, advanced to AWAIT_PAYMENT")
                msgs.append({"role": "assistant", "content": "", "tool_calls": [
                    {"index": 0, "function": {"name": "generate_promptpay_qr", "arguments": json.dumps({"amount": price})}}
                ]})
                msgs.append({"role": "tool", "content": result})
                save_convo(user_id, msgs)
                sess.slip_baseline_msg_count = len(msgs)
                save_session(user_id, sess)
                qr_b64 = get_cached_qr(price)
                if qr_b64:
                    print(f"[SIM] QR base64 ({len(qr_b64)} chars)")
                    return (f"สแกนเพื่อชำระเงิน {price:.0f} บาท\n"
                            "[QR image — ใน Line จะแสดงเป็นรูป พร้อมเพย์]")
                return f"สร้าง QR สำหรับ {price:.0f} บาทแล้ว"

        # Bypass model in AWAIT_PICK when user provides contact info — 8B unreliable
        if sess.stage == Stage.AWAIT_PICK and (
            _re.search(r'(ผู้ส่ง|ผู้รับ|ที่อยู่)', text) or
            _re.search(r'0[689]\d{8,9}', text)
        ):
            save_convo(user_id, msgs)
            save_session(user_id, sess)
            print(f"[SIM] AWAIT_PICK bypass (model skipped)")
            return "เลือกขนส่งเจ้าไหนคะ?"

        print(f"[SIM] stage={sess.stage.name} courier={sess.selected_courier} prices={list(sess.quoted_prices.keys())} "
              f"sender={sess.sender} receiver={sess.receiver}")


        msgs = run_tool_loop(msgs, user_id, sess)
        print(f"[SIM] run_tool_loop done, {len(msgs)} messages")
    except Exception as e:
        print(f"[SIM] run_tool_loop failed: {e}")
        import traceback; traceback.print_exc()
        return "เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลังค่ะ"

    # ── Advance stage based on tool results ──
    advance_if_prices(sess, msgs)

    # ── Detect QR generated by model (scan new messages only) ──
    for m in msgs[msg_count_before:]:
        if m.get("role") == "system":
            continue
        content = m.get("content", "")
        if "QR_CODE:" in content:
            sess.stage = Stage.AWAIT_PAYMENT
            print(f"[SIM] QR_CODE detected in model output, advanced to AWAIT_PAYMENT")
            break

    save_convo(user_id, msgs)
    save_session(user_id, sess)

    # ── Extract QR data (scan new messages only) ──
    last = msgs[-1]
    reply_text = last.get("content", "")
    qr_data = None
    qr_amt_match = _re.search(r'AMOUNT:([\d.]+)', reply_text)
    if qr_amt_match:
        qr_data = get_cached_qr(float(qr_amt_match.group(1)))
    print(f"[SIM] reply_text ({len(reply_text)} chars): {reply_text[:120]}")

    if not reply_text and not qr_data:
        print(f"[SIM] empty reply - returning nothing")
        return ""

    if qr_data:
        clean_text = _re.sub(r'QR_CODE:\[image_data\]\|AMOUNT:[\d.]+', '', reply_text).strip()
        return (clean_text or "สแกนเพื่อชำระเงิน") + "\n[QR image — ใน Line จะแสดงเป็นรูป พร้อมเพย์]"

    return reply_text


def show_state():
    sess = get_session(USER_ID)
    print(f"  Stage:        {sess.stage.name}")
    print(f"  Courier:      {sess.selected_courier}")
    print(f"  Prices:       {sess.quoted_prices}")
    print(f"  Sender:       {sess.sender}")
    print(f"  Sender Phone: {sess.sender_phone}")
    print(f"  Sender Addr:  {sess.sender_addr}")
    print(f"  Receiver:     {sess.receiver}")
    print(f"  Recv Phone:   {sess.receiver_phone}")
    print(f"  Recv Addr:    {sess.receiver_addr}")


def main():
    print("=" * 60)
    print("S36 Line Bot Simulator")
    print("Mirrors handle_text() from line_bot.py exactly.")
    print("=" * 60)
    print(f"Model:      {MODEL}")
    print(f"Ollama:     {os.getenv('OLLAMA_HOST', 'http://localhost:11434')}")
    print(f"PromptPay:  {PROMPTPAY_PHONE or '(not set)'}")
    print(f"Test Mode:  {TEST_MODE}")
    print()
    print("Commands:")
    print("  @image <path>  — simulate slip upload")
    print("  /reset         — reset session + conversation")
    print("  /state         — show session state")
    print("  /quit          — exit")
    print("=" * 60)
    print()

    while True:
        try:
            user_input = input("You> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not user_input:
            continue

        if user_input == '/quit':
            break

        if user_input == '/reset':
            reset_session(USER_ID)
            delete_convo(USER_ID)
            print("[SIM] session reset complete")
            continue

        if user_input == '/state':
            show_state()
            continue

        if user_input.startswith('@image '):
            filepath = user_input[7:].strip().strip('"')
            if not os.path.isfile(filepath):
                print(f"[SIM] file not found: {filepath}")
                continue
            reply = handle_image(USER_ID, filepath)
        else:
            reply = handle_text(USER_ID, user_input)

        print(f"Bot> {reply}")
        print()


if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    main()
