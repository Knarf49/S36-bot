"""session_state.py — Python state machine for S36 Bot conversation flow
Stage-gates tools, tracks courier/sender/receiver, injects state into prompts.
Model fills slots only — Python owns the flow.
"""
from dataclasses import dataclass, field
from enum import Enum
import re


class Stage(Enum):
    IDLE = 0
    AWAIT_PICK = 1
    COLLECT_INFO = 2
    AWAIT_PAYMENT = 3
    AWAIT_ADMIN = 4


COURIER_PATTERNS = [
    (r'\bkerry\b|\bเคอรี่\b|\bเคอรี\b', 'DPKERRY'),
    (r'\bshopee\b|\bช้อปปี้\b|\bชอปปี้\b', 'DPSHOPEE'),
    (r'\bflash\b|\bแฟลช\b|\bแฟลต\b|\bเฟลช\b', 'DPFLASHA'),
    (r'\bไปรษณีย์\b|\bไปรษณี\b|\bไปรษณีย์ไทย\b|ไทยโพส', 'DPTHAIPOST'),
    (r'\bdhl\b|\bดีเอชแอล\b', 'DPDHL'),
    (r'\bflash\s*[\.-]?\s*bulky\b|\bbulky\b|\bบัลค์\b|\bบัลกี้\b', 'DPFLASHLIVEBULKY'),
]


def detect_courier(text: str) -> str | None:
    text_lower = text.lower()
    for pattern, code in COURIER_PATTERNS:
        if re.search(pattern, text_lower):
            return code
    return None


@dataclass
class Session:
    stage: Stage = Stage.IDLE
    quoted_prices: dict = field(default_factory=dict)
    selected_courier: str | None = None
    last_query: dict | None = None
    sender: dict = field(default_factory=dict)
    receiver: dict = field(default_factory=dict)
    qr_amount: float | None = None


_sessions: dict[str, Session] = {}


def get_session(user_id: str) -> Session:
    if user_id not in _sessions:
        _sessions[user_id] = Session()
    return _sessions[user_id]


STAGE_TOOLS = {
    Stage.IDLE: ["shipping_fee_calculator", "check_schedule", "get_shipping_status"],
    Stage.AWAIT_PICK: [],
    Stage.COLLECT_INFO: ["generate_promptpay_qr"],
    Stage.AWAIT_PAYMENT: ["verify_slip", "create_shipping_order"],
    Stage.AWAIT_ADMIN: [],
}


def build_state_block(sess: Session) -> str:
    lines = ["# สถานะปัจจุบัน"]
    lines.append(f"- ขั้นตอน: {sess.stage.name}")
    if sess.selected_courier and sess.quoted_prices:
        price = sess.quoted_prices.get(sess.selected_courier, "?")
        lines.append(f"- ผู้ใช้เลือกขนส่ง: {sess.selected_courier} ราคา {price} บาท")
    elif sess.selected_courier:
        lines.append(f"- ผู้ใช้เลือกขนส่ง: {sess.selected_courier}")
    if sess.sender:
        lines.append(f"- ผู้ส่ง: {sess.sender}")
    if sess.receiver:
        lines.append(f"- ผู้รับ: {sess.receiver}")
    if sess.last_query:
        lines.append(f"- รายการล่าสุด: {sess.last_query}")
    return "\n".join(lines)
