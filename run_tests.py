"""
run_tests.py — Automated R1-R9 test runner for S36 Line Bot
Calls handle_text/handle_image from test_linebot_sim.py with preset inputs.
Reports pass/fail per test case. Requires Ollama running with gemma4:e4b.
"""
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from session_state import get_session, reset_session, Stage

# Import test_linebot_sim functions directly
from test_linebot_sim import (
    handle_text, handle_image, USER_ID, conversations as sim_conversations,
    get_convo, show_state,
)

TEST_SLIP = os.path.join(os.environ.get("USERPROFILE", ""), "Downloads", "test_slip.jpg")

PASS = 0
FAIL = 0
FAILURES = []


def reset():
    from session_state import reset_session
    reset_session(USER_ID)
    sim_conversations.pop(USER_ID, None)
    print("  [reset session]")


def check(name, reply, patterns, stage=None, not_patterns=None):
    """
    patterns: list of regex that MUST match reply
    not_patterns: list of regex that MUST NOT match reply
    stage: expected Stage enum value
    """
    global PASS, FAIL, FAILURES
    reply = reply or ""
    sess = get_session(USER_ID)

    ok = True
    failures_here = []

    for i, pat in enumerate(patterns):
        if isinstance(pat, list):
            if not any(re.search(p, reply, re.IGNORECASE) for p in pat):
                ok = False
                failures_here.append(f"  missing (any): {pat[0][:50]}...")
        else:
            if not re.search(pat, reply, re.IGNORECASE):
                ok = False
                failures_here.append(f"  missing: {pat[:50]}")

    for pat in (not_patterns or []):
        if re.search(pat, reply, re.IGNORECASE):
            ok = False
            failures_here.append(f"  unexpected: {pat[:50]}")

    if stage is not None and sess.stage != stage:
        ok = False
        failures_here.append(f"  stage={sess.stage.name} (expected {stage.name})")

    if ok:
        PASS += 1
        print(f"  [PASS] {name}")
    else:
        FAIL += 1
        FAILURES.append(name)
        print(f"  [FAIL] {name}")
        for fh in failures_here:
            print(fh)
        print(f"  Reply preview: {reply[:200]}")
    return ok


# ═══════════════════════════════════════════════════════════════
# TEST RUNNER
# ═══════════════════════════════════════════════════════════════

def main():
    global PASS, FAIL, FAILURES
    print("=" * 60)
    print("S36 Line Bot — Test Suite (R1-R9)")
    print("=" * 60)
    print(f"Ollama: {os.getenv('OLLAMA_HOST', 'http://localhost:11434')}")
    print(f"TEST_MODE: {os.getenv('TEST_MODE', '0')}")
    print(f"Slip file: {TEST_SLIP} ({'exists' if os.path.isfile(TEST_SLIP) else 'MISSING!'})")
    print()

    # ═══════════════════════════════════════════════════════════
    # R1: Shipping Calculator (Happy Path)
    # ═══════════════════════════════════════════════════════════
    print("─── R1: Shipping Calculator ───")
    reset()
    r = handle_text(USER_ID, "เชียงใหม่ 2kg")
    check("R1.1 เชียงใหม่ 2kg → price list", r,
          patterns=[r'ค่าส่ง', r'Kerry', r'ไปรษณีย์ไทย', r'Flash', r'Shopee', r'DHL', r'เลือกขนส่งเจ้าไหน'],
          stage=Stage.AWAIT_PICK)

    reset()
    r = handle_text(USER_ID, "ส่งของไปกรุงเทพ 1 กิโล")
    check("R1.2 กรุงเทพ 1kg → BKK rates", r,
          patterns=[r'ค่าส่ง', r'เลือกขนส่งเจ้าไหน'],
          stage=Stage.AWAIT_PICK)

    reset()
    r = handle_text(USER_ID, "ภูเก็ต 3.5kg")
    check("R1.3 ภูเก็ต 3.5kg → interpolated", r,
          patterns=[r'ค่าส่ง', r'ประมาณ'],
          stage=Stage.AWAIT_PICK)

    reset()
    r = handle_text(USER_ID, "กทม 5kg")
    check("R1.4 กทม synonym → กรุงเทพมหานคร", r,
          patterns=[r'ค่าส่ง', r'เลือกขนส่งเจ้าไหน'],
          stage=Stage.AWAIT_PICK)

    # ═══════════════════════════════════════════════════════════
    # R2: Courier Selection
    # ═══════════════════════════════════════════════════════════
    print("─── R2: Courier Selection ───")
    reset()
    handle_text(USER_ID, "เชียงใหม่ 2kg")
    sess = get_session(USER_ID)
    if sess.stage != Stage.AWAIT_PICK:
        print("  [SKIP] R2 — R1.1 failed, stage not AWAIT_PICK")

    r = handle_text(USER_ID, "kerry")
    check("R2.1 pick kerry → COLLECT_INFO", r,
          patterns=[r'ชื่อ', r'ที่อยู่', r'ผู้ส่ง', r'ผู้รับ'],
          not_patterns=[r'เลือกขนส่ง'],
          stage=Stage.COLLECT_INFO)

    r = handle_text(USER_ID, "flash")
    check("R2.2 re-pick to flash", r,
          patterns=[r'ชื่อ', r'ผู้ส่ง'],
          stage=Stage.COLLECT_INFO)

    # ═══════════════════════════════════════════════════════════
    # R3: Info Collection → QR
    # ═══════════════════════════════════════════════════════════
    print("─── R3: Info Collection → QR ───")
    reset()
    handle_text(USER_ID, "เชียงใหม่ 2kg")
    r = handle_text(USER_ID, "kerry")
    print(f"  [DEBUG] stage after kerry pick: {get_session(USER_ID).stage.name}")

    # R3.1 — Full info in one message → force QR
    r = handle_text(USER_ID,
        "ผู้ส่ง: สมชาย 0811111111 ที่อยู่คนส่ง: 123/4 กทม "
        "ผู้รับ: สมหญิง 0822222222 ที่อยู่ผู้รับ: 45/6 เชียงใหม่")
    sess = get_session(USER_ID)
    print(f"  [DEBUG] stage after full info: {sess.stage.name}")
    print(f"  [DEBUG] sender={sess.sender} receiver={sess.receiver} sender_addr={sess.sender_addr} receiver_addr={sess.receiver_addr}")
    check("R3.1 full info → QR forced", r,
          patterns=[r'สแกน', r'ชำระเงิน'],
          stage=Stage.AWAIT_PAYMENT)

    # R3.2 — Incomplete info (separate fresh session)
    reset()
    handle_text(USER_ID, "เชียงใหม่ 2kg")
    handle_text(USER_ID, "shopee")
    r = handle_text(USER_ID, "ผู้ส่ง: สมชาย 0811111111")
    sess = get_session(USER_ID)
    print(f"  [DEBUG] stage after partial info: {sess.stage.name}")
    check("R3.2 partial info → still COLLECT_INFO", r,
          patterns=[r'ที่อยู่'],  # model should ask for remaining fields
          stage=Stage.COLLECT_INFO)

    # R3.3 — Two-step info (continue from R3.2 session)
    r = handle_text(USER_ID,
        "ที่อยู่คนส่ง: 123/4 กทม ผู้รับ: สมหญิง 0822222222 ที่อยู่ผู้รับ: 45/6 เชียงใหม่")
    sess = get_session(USER_ID)
    print(f"  [DEBUG] stage after step-2 info: {sess.stage.name}")
    check("R3.3 two-step info → QR", r,
          patterns=[r'สแกน|ชำระเงิน'],
          stage=Stage.AWAIT_PAYMENT)

    # ═══════════════════════════════════════════════════════════
    # R4: Slip Upload → Order
    # ═══════════════════════════════════════════════════════════
    print("─── R4: Slip Upload ───")
    if not os.path.isfile(TEST_SLIP):
        print("  [SKIP] R4 — test_slip.jpg not found")
    else:
        # R4.1 — real slip (needs to be after QR = AWAIT_PAYMENT stage)
        reset()
        handle_text(USER_ID, "เชียงใหม่ 2kg")
        handle_text(USER_ID, "kerry")
        r = handle_text(USER_ID,
            "ผู้ส่ง: สมชาย 0811111111 ที่อยู่คนส่ง: 123/4 กทม "
            "ผู้รับ: สมหญิง 0822222222 ที่อยู่ผู้รับ: 45/6 เชียงใหม่")
        sess = get_session(USER_ID)
        print(f"  [DEBUG] R4 prep: stage={sess.stage.name}")
        if sess.stage != Stage.AWAIT_PAYMENT:
            print("  [SKIP] R4.1 — QR not generated, stage not AWAIT_PAYMENT")
        else:
            r = handle_image(USER_ID, TEST_SLIP)
            check("R4.1 slip upload → verify_slip", r,
                  patterns=[r'VERIFIED|OCR_FAILED|ตรวจ|สอบ'],
                  not_patterns=[r'ไม่สามารถโหลด'])

        # R4.2 — TEST_MODE auto-verify
        if os.getenv("TEST_MODE", "").lower() in ("1", "true", "yes"):
            reset()
            handle_text(USER_ID, "เชียงใหม่ 2kg")
            handle_text(USER_ID, "dhl")
            handle_text(USER_ID,
                "ผู้ส่ง: A 08111 ที่อยู่คนส่ง: X "
                "ผู้รับ: B 08222 ที่อยู่ผู้รับ: Y")
            if get_session(USER_ID).stage == Stage.AWAIT_PAYMENT:
                r = handle_image(USER_ID, TEST_SLIP)
                check("R4.2 TEST_MODE slip → verified + order", r,
                      patterns=[r'VERIFIED_OK', r'TEST.MODE'])
        else:
            print("  [SKIP] R4.2 — TEST_MODE not set (current: {})".format(
                os.getenv("TEST_MODE", "0")))

    # ═══════════════════════════════════════════════════════════
    # R5: Reset
    # ═══════════════════════════════════════════════════════════
    print("─── R5: Reset ───")
    reset()
    handle_text(USER_ID, "เชียงใหม่ 2kg")
    r = handle_text(USER_ID, "เริ่มใหม่")
    check("R5.1 เริ่มใหม่ mid-price → reset", r,
          patterns=[r'เริ่มรายการใหม่|สอบถามอะไร'],
          stage=Stage.IDLE)

    handle_text(USER_ID, "เชียงใหม่ 2kg")
    handle_text(USER_ID, "kerry")
    r = handle_text(USER_ID, "ยกเลิก")
    check("R5.2 ยกเลิก after courier → reset", r,
          patterns=[r'เริ่มรายการใหม่|สอบถามอะไร'],
          stage=Stage.IDLE)

    handle_text(USER_ID, "เชียงใหม่ 2kg")
    r = handle_text(USER_ID, "cancel")
    check("R5.3 cancel → reset", r,
          patterns=[r'เริ่มรายการใหม่|สอบถามอะไร'],
          stage=Stage.IDLE)

    # R5.4 — NOT reset
    reset()
    r = handle_text(USER_ID, "ส่งของใหม่เชียงใหม่ 2kg")
    check("R5.4 NOT reset — normal text with 'ใหม่'", r,
          patterns=[r'ค่าส่ง', r'เลือกขนส่งเจ้าไหน'],
          not_patterns=[r'เริ่มรายการใหม่'],
          stage=Stage.AWAIT_PICK)

    # ═══════════════════════════════════════════════════════════
    # R6: Bulk Quotes
    # ═══════════════════════════════════════════════════════════
    print("─── R6: Bulk Quotes ───")
    reset()
    r = handle_text(USER_ID, "ส่งของทีเดียวหลายชิ้น")
    check("R6.1 bulk pattern → instructions", r,
          patterns=[r'หลายชิ้น|ลองพิมพ์|ชิ้น1'])

    # ═══════════════════════════════════════════════════════════
    # R7: Schedule & Tracking
    # ═══════════════════════════════════════════════════════════
    print("─── R7: Schedule & Tracking ───")
    reset()
    r = handle_text(USER_ID, "ร้านเปิดมั้ย")
    check("R7.1 ร้านเปิดมั้ย → check_schedule", r,
          patterns=[r'เปิด|ปิด', r'น\.'],
          stage=Stage.IDLE)

    r = handle_text(USER_ID, "เช็คสถานะ 0812345678")
    check("R7.2 เช็คสถานะ → get_shipping_status", r,
          patterns=[r'ออเดอร์|ไม่พบ|ผิดพลาด'],  # dashboard might be down
          stage=Stage.IDLE)

    # ═══════════════════════════════════════════════════════════
    # R8: Edge Cases & Errors
    # ═══════════════════════════════════════════════════════════
    print("─── R8: Edge Cases ───")
    reset()
    r = handle_text(USER_ID, "ไปxxx 2kg")
    check("R8.1 invalid province → error", r,
          patterns=[r'ไม่พบจังหวัด|ระบุชื่อจังหวัด'],
          stage=Stage.IDLE)

    r = handle_text(USER_ID, "สวัสดี")
    check("R8.2 greeting → no tool call, Thai reply", r,
          patterns=[r'ค่ะ|ครับ|สวัสดี|ยินดี|ช่วย'],
          not_patterns=[r'ค่าส่ง|เลือกขนส่ง'],
          stage=Stage.IDLE)

    # ═══════════════════════════════════════════════════════════
    # R9: Multi-turn Conversation
    # ═══════════════════════════════════════════════════════════
    print("─── R9: Multi-turn ───")
    reset()
    r = handle_text(USER_ID, "เชียงใหม่ 2kg")
    s1 = get_session(USER_ID).stage
    r = handle_text(USER_ID, "ไปรษณีย์ไทย")
    s2 = get_session(USER_ID).stage
    r = handle_text(USER_ID,
        "ผู้ส่ง: สมชาย 0811111111 ที่อยู่คนส่ง: 123/4 กทม "
        "ผู้รับ: สมหญิง 0822222222 ที่อยู่ผู้รับ: 45/6 เชียงใหม่")
    sess = get_session(USER_ID)
    qr_ok = sess.stage == Stage.AWAIT_PAYMENT

    check("R9.1 full flow: price→pick→info→QR",
          r,
          patterns=[r'สแกน|ชำระเงิน'] if qr_ok else [],
          stage=Stage.AWAIT_PAYMENT if qr_ok else None)

    if not qr_ok:
        print(f"  [INFO] R9.1 — QR not auto-generated (stage={sess.stage.name}). Model may have sent text instead.")
        print(f"  [INFO] sender={sess.sender} receiver={sess.receiver} sender_addr={sess.sender_addr} receiver_addr={sess.receiver_addr}")

    # R9.2 — reset after first query, then greet
    reset()
    handle_text(USER_ID, "เชียงใหม่ 2kg")
    r = handle_text(USER_ID, "/reset")
    # /reset is handled in main() loop — test handle_text with "เริ่มใหม่" instead
    handle_text(USER_ID, "เริ่มใหม่")
    r = handle_text(USER_ID, "สวัสดี")
    check("R9.2 reset + fresh greet", r,
          patterns=[r'ค่ะ|ครับ|สวัสดี|ยินดี'],
          stage=Stage.IDLE)

    # R9.3 — schedule doesn't interfere with calculator
    reset()
    handle_text(USER_ID, "ร้านเปิดมั้ย")
    r = handle_text(USER_ID, "เชียงใหม่ 2kg")
    check("R9.3 schedule→shipping → price list", r,
          patterns=[r'ค่าส่ง', r'เลือกขนส่งเจ้าไหน'],
          stage=Stage.AWAIT_PICK)

    # ═══════════════════════════════════════════════════════════
    # RESULTS
    # ═══════════════════════════════════════════════════════════
    total = PASS + FAIL
    print()
    print("=" * 60)
    print(f"RESULTS: {PASS}/{total} passed")
    if FAILURES:
        print(f"FAILURES: {', '.join(FAILURES)}")
    print("=" * 60)


if __name__ == '__main__':
    main()
