"""session_state.py — Python state machine for S36 Bot conversation flow
Stage-gates tools, tracks courier/sender/receiver, injects state into prompts.
Model fills slots only — Python owns the flow.
"""
from contextlib import closing
from dataclasses import dataclass, field
from enum import Enum
import json
import os
import pickle
import re
import sqlite3

DB_PATH = os.getenv("SESSIONS_DB", os.path.join(os.path.dirname(os.path.abspath(__file__)), "sessions.db"))


def _db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    conn.execute("CREATE TABLE IF NOT EXISTS sessions (user_id TEXT PRIMARY KEY, data BLOB)")
    conn.execute("CREATE TABLE IF NOT EXISTS conversations (user_id TEXT PRIMARY KEY, data TEXT)")
    return closing(conn)


class Stage(Enum):
    IDLE = 0
    AWAIT_PICK = 1
    COLLECT_INFO = 2
    AWAIT_PAYMENT = 3
    AWAIT_ADMIN = 4
    SLIP_TEST = 5


SLIP_TEST_PATTERNS = [
    r'^ตรวจสลิป\b',
    r'^เช็คสลิป\b',
    r'^test\s*slip\b',
    r'^verify\s*slip\b',
]


def is_slip_test_command(text):
    t = text.strip().lower()
    for pat in SLIP_TEST_PATTERNS:
        if re.search(pat, t):
            return True
    return False


def extract_amount(text):
    m = re.search(r'(\d+(?:\.\d+)?)', text)
    return float(m.group(1)) if m else None


COURIER_PATTERNS = [
    (r'\bkerry\b|\bเคอรี่\b|\bเคอรี\b', 'DPKERRY'),
    (r'\bshopee\b|\bช้อปปี้\b|\bชอปปี้\b', 'DPSHOPEE'),
    (r'\bdhl\b|\bดีเอชแอล\b', 'DPDHL'),
    (r'\bflash\s*[\.-]?\s*bulky\b|\bbulky\b|\bบัลค์\b|\bบัลกี้\b', 'DPFLASHLIVEBULKY'),
    (r'\bflash\b|\bแฟลช\b|\bแฟลต\b|\bเฟลช\b', 'DPFLASHA'),
    (r'\bไปรษณีย์\b|\bไปรษณี\b|\bไปรษณีย์ไทย\b|ไทยโพส', 'DPTHAIPOST'),
]


def detect_courier(text: str) -> str | None:
    text_lower = text.lower()
    for pattern, code in COURIER_PATTERNS:
        if re.search(pattern, text_lower):
            return code
    return None


def parse_id(text: str) -> str | None:
    m = re.search(r'\b(\d{1,2}[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d[\s-]?\d?)\b', text)
    if m:
        return m.group(1)
    m = re.search(r'(?:หนังสือเดินทาง|passport|พาสปอร์ต)\s*[:\s]*([A-Za-z0-9]{6,12})', text, re.I)
    if m:
        return m.group(1)
    return None


def parse_prices(text: str) -> dict | None:
    m = re.search(r'__PRICES:(.+?)__', text)
    if not m:
        return None
    prices = {}
    for pair in m.group(1).split(','):
        if '=' in pair:
            code, price = pair.split('=', 1)
            try:
                prices[code] = float(price)
            except ValueError:
                pass
    return prices if prices else None


def advance_if_prices(sess, messages):
    if sess.stage != Stage.IDLE:
        return
    for m in messages:
        if isinstance(m, dict):
            c = m.get('content', '')
            if '__PRICES:' in c:
                prices = parse_prices(c)
                if prices:
                    sess.quoted_prices = prices
                    sess.stage = Stage.AWAIT_PICK
                    return


@dataclass
class Session:
    stage: Stage = Stage.IDLE
    quoted_prices: dict = field(default_factory=dict)
    selected_courier: str | None = None
    last_query: dict | None = None
    sender: str | None = None
    sender_phone: str | None = None
    sender_addr: str | None = None
    receiver: str | None = None
    receiver_phone: str | None = None
    receiver_addr: str | None = None
    qr_amount: float | None = None
    slip_baseline_msg_count: int = 0
    delivery_province: str | None = None
    weight_kg: float | None = None
    id_number: str | None = None
    sender_subdistrict: str | None = None
    sender_district: str | None = None
    sender_province: str | None = None
    sender_zip: str | None = None
    receiver_subdistrict: str | None = None
    receiver_district: str | None = None
    receiver_province: str | None = None
    receiver_zip: str | None = None


def get_session(user_id: str) -> Session:
    with _db() as db:
        row = db.execute("SELECT data FROM sessions WHERE user_id=?", (user_id,)).fetchone()
        return pickle.loads(row[0]) if row else Session()


def save_session(user_id: str, sess: Session):
    with _db() as db:
        db.execute("INSERT OR REPLACE INTO sessions (user_id, data) VALUES (?, ?)",
                   (user_id, pickle.dumps(sess)))
        db.commit()


def reset_session(user_id: str) -> Session:
    with _db() as db:
        db.execute("DELETE FROM sessions WHERE user_id=?", (user_id,))
        db.commit()
    return Session()


def get_convo(user_id: str) -> list:
    with _db() as db:
        row = db.execute("SELECT data FROM conversations WHERE user_id=?", (user_id,)).fetchone()
        return json.loads(row[0]) if row else []


def save_convo(user_id: str, msgs: list):
    with _db() as db:
        db.execute("INSERT OR REPLACE INTO conversations (user_id, data) VALUES (?, ?)",
                   (user_id, json.dumps(msgs, ensure_ascii=False)))
        db.commit()


def delete_convo(user_id: str):
    with _db() as db:
        db.execute("DELETE FROM conversations WHERE user_id=?", (user_id,))
        db.commit()

RESET_PATTERNS = [
    r'^(ทำ|ขอ|สั่ง|เริ่ม)(รายการ|ออเดอร์)?(ใหม่|อีกที)\s*(ครับ|ค่ะ|จ้า|นะ|นะครับ|นะคะ|เลย)?$',
    r'^(ขอ|เอา|เอาอัน)?ใหม่\s*(ครับ|ค่ะ|จ้า|นะ|นะครับ|นะคะ|เลย)?$',
    r'^(ยกเลิก|ล้าง|ลบ|เคลียร์)\s*(ครับ|ค่ะ|จ้า|นะ|นะครับ|นะคะ)?$',
    r'^รีเซ็ต\s*(ครับ|ค่ะ|จ้า|นะ|นะครับ|นะคะ)?$',
    r'^(cancel|reset|clear|restart|new)\s*(order|session|chat)?$',
    r'^(cancel|reset|clear|restart|new)\s*(order|session|chat)?\s*(pls|please|thanks)?$',
    r'^(want|need)\s+(to\s+)?(start|begin)\s+(a\s+)?(new|fresh)\s*(order)?\s*(please|pls|thanks)?$',
    r'^(need|want)\s+(new|fresh|reset|restart)\s*(order|session)?$',
    r'^(start|begin)\s+(fresh|new|over)\s*(order|session)?$',
    r'^(ขอทำ|ขอสั่ง|ขอเริ่ม)\s*(รายการ|ออเดอร์)?\s*(ใหม่|อีก)\s*(ครับ|ค่ะ|จ้า|นะ)?$',
    r'^เริ่มต้น\s*(ใหม่)?\s*(ครับ|ค่ะ|จ้า|นะ)?$',
    r'^ขอ\s+(อัน?|รายการ)\s*ใหม่$',
    r'^ลืม.*(หมด|แล้ว).*$',
    r'^.*ใหม่อีกที\s*(ครับ|ค่ะ|จ้า|นะ)?$',
]

BULK_PATTERNS = [
    r'(ส่ง|สั่ง).*(หลาย|ทีเดียว).*(ชิ้น|กล่อง|อัน|รายการ)',
    r'(หลาย|ทีเดียว).*(ชิ้น|กล่อง|อัน).*(ส่ง|สั่ง)',
    r'(bulk|multi).*(ship|order|package)',
    r'(ship|send|order)\s+(multiple|many|bulk)',
    r'ส่งของทีเดียว',
    r'ยก.*(หลาย|ทีเดียว).*(ส่ง|ชิ้น)',
    r'ค่าส่ง.*(หลาย|ทีเดียว).*(ชิ้น|กล่อง|อัน)',
    r'เหมา.*(ส่ง|ของ)',
]

def is_reset_command(text: str) -> bool:
    t = text.strip().lower()
    for p in RESET_PATTERNS:
        if re.match(p, t):
            return True
    return False

def is_bulk_command(text: str) -> bool:
    t = text.strip().lower()
    for p in BULK_PATTERNS:
        if re.search(p, t):
            return True
    # Also detect 2+ item lines (e.g. "ชิ้น1: เชียงใหม่ 2kg")
    if len(_ITEM_LINE.findall(text)) >= 2:
        return True
    return False

# Multi-item parser for bulk shipping quotes
# Matches lines like: "ชิ้น1: เชียงใหม่ 2kg 20x30x10" or "ชิ้นที่ 1 เชียงใหม่ 2kg"
_ITEM_LINE = re.compile(
    r'(?:ชิ้น|รายการ|กล่อง)(?:\s*(?:ที่|#|no\.?)?\s*\d+)?\s*[:：\-]\s*'
    r'([\u0E00-\u0E7Fa-zA-Z]+)\s+'           # province
    r'(\d+(?:\.\d+)?)\s*(?:kg|กิโล|กก|kgs?)?'  # weight
    r'(?:\s+(\d+)\s*[xX\*×]\s*(\d+)\s*[xX\*×]\s*(\d+))?'  # optional dims: WxLxH
)

def parse_multi_items(text: str) -> list:
    items = []
    for m in _ITEM_LINE.finditer(text):
        prov = m.group(1).strip()
        w_kg = float(m.group(2))
        w_cm = int(m.group(3)) if m.group(3) else None
        l_cm = int(m.group(4)) if m.group(4) else None
        h_cm = int(m.group(5)) if m.group(5) else None
        items.append({'province': prov, 'weight_kg': w_kg, 'w_cm': w_cm, 'l_cm': l_cm, 'h_cm': h_cm})
    return items


STAGE_TOOLS = {
    Stage.IDLE: ["shipping_fee_calculator", "check_schedule", "get_shipping_status"],
    Stage.AWAIT_PICK: ["shipping_fee_calculator"],  # allow re-quote for route changes
    Stage.COLLECT_INFO: ["generate_promptpay_qr", "shipping_fee_calculator"],
    Stage.AWAIT_PAYMENT: ["verify_slip", "create_shipping_order"],
    Stage.AWAIT_ADMIN: [],
    Stage.SLIP_TEST: ["verify_slip"],
}

# Sentinel for "all tools" — None means unrestricted
ALL_TOOLS_SENTINEL = None


def build_state_block(sess: Session) -> str:
    lines = ["# CURRENT STATE"]
    lines.append(f"- Stage: {sess.stage.name}")
    if sess.selected_courier and sess.quoted_prices:
        price = sess.quoted_prices.get(sess.selected_courier, "?")
        lines.append(f"- User has selected courier: {sess.selected_courier}, price {price} THB")
        lines.append("- DO NOT ask the user to pick a courier again.")
    elif sess.selected_courier:
        lines.append(f"- User has selected courier: {sess.selected_courier}")
        lines.append("- DO NOT ask the user to pick a courier again.")
    if sess.sender:
        lines.append(f"- Sender: {sess.sender}")
    if sess.receiver:
        lines.append(f"- Receiver: {sess.receiver}")
    if sess.receiver_addr:
        lines.append(f"- Receiver address: {sess.receiver_addr}")
    if sess.sender_subdistrict:
        lines.append(f"- Sender district: {sess.sender_subdistrict} {sess.sender_district or ''} {sess.sender_province or ''} {sess.sender_zip or ''}")
    if sess.receiver_subdistrict:
        lines.append(f"- Receiver district: {sess.receiver_subdistrict} {sess.receiver_district or ''} {sess.receiver_province or ''} {sess.receiver_zip or ''}")
    if sess.id_number:
        id_label = "passport" if re.search(r'[A-Za-z]', sess.id_number) else "ID"
        lines.append(f"- {id_label}: {sess.id_number}")
    if sess.last_query:
        lines.append(f"- Last query: {sess.last_query}")
    if sess.stage == Stage.COLLECT_INFO:
        missing = []
        if not sess.sender: missing.append("ชื่อผู้ส่ง")
        if not sess.sender_phone: missing.append("เบอร์ผู้ส่ง")
        if not sess.id_number: missing.append("เลขบัตรประชาชน")
        if not sess.sender_addr: missing.append("ที่อยู่ผู้ส่ง")
        if not sess.receiver: missing.append("ชื่อผู้รับ")
        if not sess.receiver_phone: missing.append("เบอร์ผู้รับ")
        if not sess.receiver_addr: missing.append("ที่อยู่ผู้รับ")
        if missing:
            lines.append(f"- MISSING FIELDS: {', '.join(missing)}")
            lines.append("- DO NOT call generate_promptpay_qr until all MISSING FIELDS are filled.")
    directive = _STAGE_DIRECTIVES.get(sess.stage)
    if directive:
        price_val = sess.quoted_prices.get(sess.selected_courier) if sess.selected_courier and sess.quoted_prices else None
        lines.append(directive.format(amount=price_val if price_val else "???"))
    return "\n".join(lines)


_STAGE_DIRECTIVES = {
    Stage.AWAIT_PICK: (
        "- PRICES SHOWN ABOVE. Ask ONE question: 'เลือกขนส่งเจ้าไหนคะ?'\n"
        "- Do NOT offer other services. Do NOT ask 'ต้องการดำเนินการต่อไหม'."
    ),
    Stage.COLLECT_INFO: (
        "- COURIER PICKED. Do NOT ask user to pick courier again.\n"
        "- If user has NOT yet provided all 7 info fields → ask missing info in ONE message:\n"
        "  ชื่อ-นามสกุลผู้ส่ง, เบอร์โทรผู้ส่ง, เลขบัตรประชาชน/หนังสือเดินทาง, ตำบล+อำเภอ+จังหวัด+รหัสไปรษณีย์ผู้ส่ง, ชื่อผู้รับ, เบอร์โทรผู้รับ, ตำบล+อำเภอ+จังหวัด+รหัสไปรษณีย์ผู้รับ\n"
        "- Emphasize: \"ข้อมูลเลขบัตรฯ ใช้เพื่อยืนยันตัวตนเท่านั้น และจะอยู่ในคอมพิวเตอร์ของทางร้านเท่านั้น\"\n"
        "- If user HAS provided all 7 info fields → CALL generate_promptpay_qr(amount={amount}) IMMEDIATELY. Do NOT output text first.\n"
        "- Do NOT write English field names."
    ),
    Stage.AWAIT_PAYMENT: (
        "- QR SENT. Wait for payment slip upload.\n"
        "- Do NOT ask for more info. Do NOT regenerate QR."
    ),
    Stage.SLIP_TEST: (
        "- SLIP TEST MODE. User wants to verify a payment slip.\n"
        "- If user sent an image → CALL verify_slip with image_base64 and expected_amount={amount}.\n"
        "- If user sent text with an amount → store it and ask for the slip image.\n"
        "- If user sent 'ออก' or 'ยกเลิก' → tell them to type 'ออก' to exit."
    ),
}


def needs_qr(sess) -> bool:
    if sess.stage != Stage.COLLECT_INFO:
        return False
    if not sess.selected_courier or sess.selected_courier not in sess.quoted_prices:
        return False
    return bool(sess.sender and sess.sender_phone and sess.receiver and sess.receiver_phone and sess.sender_addr and sess.receiver_addr and sess.id_number)


def parse_info_fields(text: str, sess) -> bool:
    t = text.replace("\n", " ")
    idx_sender = t.find('ผู้ส่ง')
    idx_receiver = t.find('ผู้รับ', idx_sender + 1) if idx_sender >= 0 else -1
    m = re.search(r'ผู้ส่ง[:\s]+(.+?)(?=\s*(?:ที่อยู่(?!ผู้รับ)|ผู้รับ|เบอร์|โทร|ตำบล|อำเภอ|จังหวัด|รหัสไปรษณีย์|เลขบัตร)|\s*$)', t)
    if m:
        sess.sender = m.group(1).strip()
    m = re.search(r'ผู้รับ[:\s]+(.+?)(?=\s*(?:ที่อยู่(?:ผู้รับ|คนรับ)|เบอร์|โทร|ตำบล|อำเภอ|จังหวัด|รหัสไปรษณีย์|เลขบัตร)|\s*$)', t)
    if m:
        sess.receiver = m.group(1).strip()
    m = re.search(r'ที่อยู่(?!ผู้รับ|คนรับ)[^\n:]*[:\s]+(.+?)(?=\s+(?:ที่อยู่|ผู้รับ|เบอร์|โทร|ตำบล|อำเภอ|จังหวัด|รหัสไปรษณีย์|เลขบัตร)|\s*$)', t)
    if m:
        val = m.group(1).strip()
        if not sess.sender_addr or 'ผู้ส่ง' in t:
            sess.sender_addr = val
        elif not sess.receiver_addr:
            sess.receiver_addr = val
    m = re.search(r'ที่อยู่(?:ผู้รับ|คนรับ)[^\n:]*[:\s]+(.+?)$', t)
    if m:
        sess.receiver_addr = m.group(1).strip()
    phones = re.findall(r'0[689]\d{1,3}[\s-]*\d{3,4}[\s-]*\d{3,4}', t)
    if phones:
        if idx_receiver > idx_sender:
            for phone in phones:
                pos = t.find(phone)
                target = 'receiver' if pos >= idx_receiver else 'sender'
                if target == 'sender' and not sess.sender_phone:
                    sess.sender_phone = phone
                elif target == 'receiver' and not sess.receiver_phone:
                    sess.receiver_phone = phone
        else:
            for phone in phones:
                if not sess.sender_phone:
                    sess.sender_phone = phone
                elif not sess.receiver_phone:
                    sess.receiver_phone = phone
    id_parsed = parse_id(text)
    if id_parsed:
        sess.id_number = id_parsed
    # Structured address: position-based — sender fields before receiver name, receiver fields after
    def _parse_addr_fields(seg: str):
        result = {}
        m = re.search(r'(?:ตำบล|แขวง|ต\.)\s*[:\s]*([\u0E00-\u0E7Fa-zA-Z]+)', seg)
        if m: result['subdistrict'] = m.group(1).strip()
        m = re.search(r'(?:อำเภอ|เขต|อ\.)\s*[:\s]*([\u0E00-\u0E7Fa-zA-Z]+)', seg)
        if m: result['district'] = m.group(1).strip()
        m = re.search(r'(?:จังหวัด|จ\.)\s*[:\s]*([\u0E00-\u0E7Fa-zA-Z]+)', seg)
        if m: result['province'] = m.group(1).strip()
        m = re.search(r'(?:รหัสไปรษณีย์|รหัส|zip|ไปรษณีย์)\s*[:\s]*(\d{5})', seg)
        if m: result['zip'] = m.group(1).strip()
        return result
    if idx_receiver > idx_sender:
        sender_seg = t[idx_sender:idx_receiver]
        receiver_seg = t[idx_receiver:]
        s_addr = _parse_addr_fields(sender_seg)
        r_addr = _parse_addr_fields(receiver_seg)
        if s_addr.get('subdistrict'): sess.sender_subdistrict = s_addr['subdistrict']
        if s_addr.get('district'): sess.sender_district = s_addr['district']
        if s_addr.get('province'): sess.sender_province = s_addr['province']
        if s_addr.get('zip'): sess.sender_zip = s_addr['zip']
        if r_addr.get('subdistrict') and not sess.receiver_subdistrict: sess.receiver_subdistrict = r_addr['subdistrict']
        if r_addr.get('district') and not sess.receiver_district: sess.receiver_district = r_addr['district']
        if r_addr.get('province') and not sess.receiver_province: sess.receiver_province = r_addr['province']
        if r_addr.get('zip') and not sess.receiver_zip: sess.receiver_zip = r_addr['zip']
    if not sess.sender_addr and sess.sender_subdistrict:
        sess.sender_addr = f"{sess.sender_subdistrict} {sess.sender_district or ''} {sess.sender_province or ''} {sess.sender_zip or ''}".strip()
    if not sess.receiver_addr and sess.receiver_subdistrict:
        sess.receiver_addr = f"{sess.receiver_subdistrict} {sess.receiver_district or ''} {sess.receiver_province or ''} {sess.receiver_zip or ''}".strip()
    return bool(sess.sender and sess.sender_phone and sess.receiver and sess.receiver_phone and sess.sender_addr and sess.id_number)


# ── Address validation (imports validator.py from same dir) ──

def _levenshtein(a: str, b: str) -> int:
    if len(a) < len(b):
        return _levenshtein(b, a)
    if len(b) == 0:
        return len(a)
    prev = range(len(b) + 1)
    for i, ca in enumerate(a):
        curr = [i + 1]
        for j, cb in enumerate(b):
            curr.append(min(prev[j + 1] + 1, curr[j] + 1, prev[j] + (ca != cb)))
        prev = curr
    return prev[-1]


def _fuzzy_correct(field_val: str, candidates: list[str], max_dist: int = 2) -> str | None:
    best, best_dist = None, max_dist + 1
    for c in candidates:
        d = _levenshtein(field_val, c)
        if d < best_dist:
            best, best_dist = c, d
    return best if best_dist <= max_dist else None


def validate_address_fields(sess) -> tuple[bool, str | None]:
    try:
        from S36_bot.validator import validate_thai_address, get_db
    except ImportError:
        try:
            from validator import validate_thai_address, get_db
        except ImportError:
            return True, None

    corrections = []
    errors = []

    def _validate_one(prefix: str, sub: str | None, dist: str | None,
                      prov: str | None, zip_code: str | None):
        nonlocal corrections, errors
        if not any([sub, dist, prov, zip_code]):
            return
        result = validate_thai_address(subdistrict=sub, district=dist,
                                        province=prov, postal_code=zip_code)
        if result['valid'] and result['matched']:
            return result['matched']

        corrected = dict(subdistrict=sub, district=dist, province=prov, postal_code=zip_code)
        field_errors = result.get('field_errors', {})
        db = get_db()

        for field, is_wrong in field_errors.items():
            if not is_wrong:
                continue
            val = corrected.get(field)
            if not val:
                continue
            candidates = []
            if field == 'subdistrict':
                candidates = list({r['subdistrictNameTh'] for r in db.records})
            elif field == 'district':
                candidates = list({r['districtNameTh'] for r in db.records})
            elif field == 'province':
                candidates = list({r['provinceNameTh'] for r in db.records})
            elif field == 'postal_code':
                continue
            norm_val = val.strip().lower()
            norm_candidates = {c: c.lower() for c in candidates}
            match = _fuzzy_correct(norm_val, list(norm_candidates.values()))
            if match:
                original = {v: k for k, v in norm_candidates.items()}[match]
                label_map = {'subdistrict': 'ตำบล', 'district': 'อำเภอ',
                             'province': 'จังหวัด'}
                corrections.append(f"{prefix}{label_map[field]}: {val} → {original}")
                corrected[field] = original
            else:
                label_map = {'subdistrict': 'ตำบล', 'district': 'อำเภอ',
                             'province': 'จังหวัด', 'postal_code': 'รหัสไปรษณีย์'}
                errors.append(f"{prefix}{label_map[field]}: \"{val}\" ไม่พบในระบบ")

        if errors:
            return None
        retry = validate_thai_address(
            subdistrict=corrected.get('subdistrict'),
            district=corrected.get('district'),
            province=corrected.get('province'),
            postal_code=corrected.get('postal_code'),
        )
        if retry['valid'] and retry['matched']:
            return retry['matched']
        errors.append(f"{prefix}ที่อยู่ไม่สอดคล้องกัน กรุณาตรวจสอบใหม่")
        return None

    s_match = _validate_one('ผู้ส่ง ', sess.sender_subdistrict, sess.sender_district,
                            sess.sender_province, sess.sender_zip)
    if s_match:
        sess.sender_subdistrict = s_match['subdistrict_th']
        sess.sender_district = s_match['district_th']
        sess.sender_province = s_match['province_th']
        sess.sender_zip = s_match['postal_code']

    r_match = _validate_one('ผู้รับ ', sess.receiver_subdistrict, sess.receiver_district,
                            sess.receiver_province, sess.receiver_zip)
    if r_match:
        sess.receiver_subdistrict = r_match['subdistrict_th']
        sess.receiver_district = r_match['district_th']
        sess.receiver_province = r_match['province_th']
        sess.receiver_zip = r_match['postal_code']

    if errors:
        return False, '\n'.join(errors)
    if corrections:
        return True, 'แก้ไขอัตโนมัติ:\n' + '\n'.join(corrections)
    return True, None
