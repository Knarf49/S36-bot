# Multi-turn State Tracking Fix — Advisor Recommendation

**Date:** 2026-06-27  
**Issue:** Gemma4:e4b (8B Q4_K_M) loses courier selection context in multi-turn conversations

---

## Root Cause

Architecture fault — model is asked to do 3 cognitive jobs simultaneously:
1. Track 6 conversation fields (province, weight, courier, sender, receiver, address)
2. Decide which flow step is next (show rates → ask courier → ask info → generate QR)
3. Call the correct tool at each step

An 8B model at Q4_K_M quantization cannot reliably do this. Context size (`NUM_CTX`), prompt wording, and tool definitions are NOT the issue.

---

## ⭐ Top Recommendation: Approach A — Python State Machine

**Reliability:** ~95% (deterministic for courier tracking)  
**Effort:** ~2-3 hours

### Architecture

Model becomes a **slot-filler**, not a **flow-controller**. Python owns conversation state and decides what tools to expose per stage.

### New File: `S36_bot/session_state.py`

```python
from dataclasses import dataclass, field
from enum import Enum

class Stage(Enum):
    IDLE = 0            # greeting / schedule / status checks
    AWAIT_PICK = 1      # just showed prices, waiting for courier choice
    COLLECT_INFO = 2    # courier picked, collecting sender + receiver + address
    AWAIT_PAYMENT = 3   # QR sent, waiting for payment slip
    AWAIT_ADMIN = 4     # verification failed, waiting for admin review

@dataclass
class Session:
    stage: Stage = Stage.IDLE
    quoted_prices: dict = field(default_factory=dict)   # {"Kerry": 45, "Flash": 35, ...}
    selected_courier: str | None = None
    last_query: dict | None = None                      # {province, weight_kg, dim}
    sender: dict = field(default_factory=dict)           # {name, phone, address}
    receiver: dict = field(default_factory=dict)         # {name, phone}
    qr_amount: float | None = None

_sessions: dict[str, Session] = {}

def get_session(user_id: str) -> Session:
    return _sessions.setdefault(user_id, Session())
```

### Stage-Gated Tools

| Stage | Tools exposed | Why |
|-------|--------------|-----|
| IDLE | `shipping_fee_calculator`, `check_schedule`, `get_shipping_status` | General queries |
| AWAIT_PICK | None | No tools — model just acknowledges courier choice. Python advances stage. |
| COLLECT_INFO | `generate_promptpay_qr` | QR generation only |
| AWAIT_PAYMENT | `verify_slip`, `create_shipping_order` | Slip processing |

### Courier Pick Detection (Python, not model)

```python
# In line_bot.py or run_tool_loop, after user sends message:
import re

COURIER_PATTERNS = [
    (r'\bkerry\b|\bเคอรี่\b|\bเคอรี่\b', 'DPKERRY'),
    (r'\bshopee\b|\bช้อปปี้\b|\bshopee\b', 'DPSHOPEE'),
    (r'\bflash\b|\bแฟลช\b|\bแฟลช\b', 'DPFLASHA'),
    (r'\bไปรษณีย์\b|\bไปรษณี\b|\bthai.?post\b|\bไทยโพส\b', 'DPTHAIPOST'),
    (r'\bdhl\b', 'DPDHL'),
]

def detect_courier(text: str) -> str | None:
    text_lower = text.lower()
    for pattern, code in COURIER_PATTERNS:
        if re.search(pattern, text_lower):
            return code
    return None
```

### State Injection Per Turn

```python
def build_state_block(sess: Session) -> str:
    lines = ["## สถานะปัจจุบัน"]
    lines.append(f"- ขั้นตอน: {sess.stage.name}")
    if sess.selected_courier:
        price = sess.quoted_prices.get(sess.selected_courier, "?")
        lines.append(f"- ขนส่งที่ผู้ใช้เลือก: {sess.selected_courier} ราคา {price} บาท")
    if sess.sender:
        lines.append(f"- ผู้ส่ง: {sess.sender}")
    if sess.receiver:
        lines.append(f"- ผู้รับ: {sess.receiver}")
    return "\n".join(lines)
```

### Changes Needed

**`line_bot.py`:**
- Line 28: Add `from session_state import get_session, Stage`
- Line 65: `sess = get_session(user_id)` before run_tool_loop
- Line 70: Pass `sess` into run_tool_loop
- After run_tool_loop: Detect courier choice, advance stage

**`tools_agent.py`:**
- `run_tool_loop()`: Accept `sess` parameter
- `call_ollama()`: Accept `allowed_tools` parameter (subset based on stage)
- Rebuild `messages[0]` each turn with live state block

---

## 🔧 Quick Patch: Approach B — State Injection Only

**Reliability:** ~70%  
**Effort:** ~30 minutes

### What it does

Minimal change — inject explicit state into system prompt each turn. Model still owns flow decisions but gets a constant reminder.

### Changes Needed

**`line_bot.py` only:**
```python
# Line 28: add per-user state dict
session_state = {}  # { user_id: { "courier": None, "prices": {} } }

# Line 65: set/get state
state = session_state.setdefault(user_id, {"courier": None})

# Courier detection (same regex as Approach A)
picked = detect_courier(text)
if picked:
    state["courier"] = picked

# Inject state into system prompt before run_tool_loop
state_block = f"ปัจจุบันผู้ใช้เลือกขนส่ง: {state['courier'] or 'ยังไม่เลือก'}"
msgs[0] = {"role": "system", "content": SYSTEM_PROMPT + "\n" + state_block}
```

### Why less reliable

Model still decides flow. With ~8B params, it reads state block correctly ~70% of the time but can still "hallucinate the flow" and ask for courier again.

---

## ❌ Do NOT pursue

| Approach | Reason |
|----------|--------|
| Prompt engineering (few-shot, more explicit rules) | Root cause is model capacity, not instructions. Won't fix. |
| Switch to stronger model (qwen3.5:9b, etc.) | Violates "use gemma4" constraint. Hides the architecture bug. Costs ongoing VRAM. |
| Conversation summary injection | Same flaw as Approach B but burns more tokens. |
| "Never call same tool twice" prompt rule | Already in prompt. Model ignores it when confused. |

---

## Decision

**Implement Approach A** for production LINE bot. It's the only architecture that survives small-model context loss by removing state tracking from the model entirely.

**Approach B** is a 30-minute bridge patch if A cannot be implemented immediately.
