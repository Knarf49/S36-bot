"""
tools_agent.py — AI tools bound to gemma4:e4b via Ollama
3 tools: shipping_fee_calculator, check_schedule, get_shipping_status
Pattern: raw Ollama /v1/chat/completions tool-call loop (no browser-use)
"""

import json
import math
import os
import re
import sys
import base64
import io
import urllib.request
from datetime import datetime, timezone

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_URL = f"{OLLAMA_HOST}/v1/chat/completions"
OLLAMA_NATIVE_URL = f"{OLLAMA_HOST}/api/chat"
DASHBOARD_URL = os.getenv("ORDER_API_URL", "http://localhost:8000")
PROMPTPAY_PHONE = os.getenv("PROMPTPAY_PHONE", "")
RECIPIENT_NAME = os.getenv("RECIPIENT_NAME", "")
MODEL = "gemma4:e4b"
NUM_CTX = 32000
TEST_MODE = os.getenv("TEST_MODE", "").lower() in ("1", "true", "yes")

_pending_slip_base64 = None  # global default (backward compat, gemma_gradio.py)
_qr_generated_at = None
_user_slips = {}  # { user_id: base64 }
_user_qr_times = {}  # { user_id: datetime }


def set_pending_slip(b64, user_id=None):
    global _pending_slip_base64
    if user_id is not None:
        _user_slips[user_id] = b64
    else:
        _pending_slip_base64 = b64


def get_pending_slip(user_id=None):
    global _pending_slip_base64
    if user_id is not None:
        return _user_slips.pop(user_id, None)
    v = _pending_slip_base64
    _pending_slip_base64 = None
    return v


def peek_pending_slip(user_id=None):
    if user_id is not None:
        return _user_slips.get(user_id)
    return _pending_slip_base64


def set_qr_generated_at(dt, user_id=None):
    global _qr_generated_at
    if user_id is not None:
        _user_qr_times[user_id] = dt
    else:
        _qr_generated_at = dt


def get_qr_generated_at(user_id=None):
    if user_id is not None:
        return _user_qr_times.get(user_id)
    return _qr_generated_at

# ═══════════════════════════════════════════════════════════════════
# 1. Rate tables (ported from rate_calculator.cjs)
# ═══════════════════════════════════════════════════════════════════

BKK_PROVINCES = {'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ'}

ALL_PROVINCES = {
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
    'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย',
    'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
    'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
    'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี',
    'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
    'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา',
    'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
    'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
    'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี',
    'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อุดรธานี',
    'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี', 'อำนาจเจริญ',
}

PROVINCE_SYNONYMS = {
    'กทม': 'กรุงเทพมหานคร', 'กรุงเทพ': 'กรุงเทพมหานคร',
    'โคราช': 'นครราชสีมา', 'ปากน้ำ': 'สมุทรปราการ',
    'หัวหิน': 'ประจวบคีรีขันธ์', 'นครศรี': 'นครศรีธรรมราช',
    'สุราษฎร์': 'สุราษฎร์ธานี', 'อุบล': 'อุบลราชธานี',
    'อุดร': 'อุดรธานี', 'หาดใหญ่': 'สงขลา', 'พัทยา': 'ชลบุรี',
}

VOL_DIVISOR = {
    'DPKERRY': float('inf'), 'DPTHAIPOST': 1, 'DPFLASHA': 6000,
    'DPSHOPEE': 5000, 'DPDHL': 5000, 'DPFLASHLIVEBULKY': float('inf'),
}

COURIER_NAMES = {
    'DPKERRY': 'Kerry', 'DPTHAIPOST': 'ไปรษณีย์ไทย', 'DPFLASHA': 'Flash',
    'DPSHOPEE': 'Shopee', 'DPDHL': 'DHL', 'DPFLASHLIVEBULKY': 'Flash Bulky',
}

# Rate tables: each courier x zone has weight[] and optionally dim[]
# Entry: {k: kg, c: cost, p: price}
RATE_TABLE = {
    'DPKERRY': {
        'BKK_BKK': {
            'weight': [
                {'k': 0.5, 'c': 33, 'p': 45}, {'k': 1, 'c': 36, 'p': 45},
                {'k': 2, 'c': 40, 'p': 50}, {'k': 3, 'c': 45, 'p': 60},
                {'k': 4, 'c': 58, 'p': 70}, {'k': 5, 'c': 76, 'p': 85},
                {'k': 6, 'c': 83, 'p': 95}, {'k': 7, 'c': 88, 'p': 105},
                {'k': 8, 'c': 99, 'p': 120}, {'k': 9, 'c': 111, 'p': 125},
                {'k': 10, 'c': 122, 'p': 135}, {'k': 12, 'c': 146, 'p': 155},
                {'k': 15, 'c': 184, 'p': 195},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'k': 0.5, 'c': 33, 'p': 45}, {'k': 1, 'c': 36, 'p': 45},
                {'k': 2, 'c': 47, 'p': 60}, {'k': 3, 'c': 52, 'p': 70},
                {'k': 4, 'c': 63, 'p': 85}, {'k': 5, 'c': 81, 'p': 95},
                {'k': 6, 'c': 88, 'p': 105}, {'k': 7, 'c': 98, 'p': 120},
                {'k': 8, 'c': 108, 'p': 135}, {'k': 9, 'c': 118, 'p': 145},
                {'k': 10, 'c': 131, 'p': 155}, {'k': 12, 'c': 154, 'p': 175},
                {'k': 15, 'c': 193, 'p': 210},
            ],
        },
    },
    'DPTHAIPOST': {
        'BKK_BKK': {
            'weight': [
                {'k': 0.5, 'c': 30, 'p': 40}, {'k': 1, 'c': 36, 'p': 45},
                {'k': 2, 'c': 44, 'p': 57}, {'k': 3, 'c': 57, 'p': 75},
                {'k': 4, 'c': 66, 'p': 89}, {'k': 5, 'c': 79, 'p': 97},
                {'k': 6, 'c': 96, 'p': 135}, {'k': 7, 'c': 108, 'p': 145},
                {'k': 8, 'c': 120, 'p': 155}, {'k': 9, 'c': 132, 'p': 165},
                {'k': 10, 'c': 147, 'p': 175}, {'k': 12, 'c': 180, 'p': 235},
                {'k': 15, 'c': 220, 'p': 265},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'k': 0.5, 'c': 30, 'p': 40}, {'k': 1, 'c': 36, 'p': 45},
                {'k': 2, 'c': 44, 'p': 57}, {'k': 3, 'c': 57, 'p': 75},
                {'k': 4, 'c': 66, 'p': 89}, {'k': 5, 'c': 79, 'p': 97},
                {'k': 6, 'c': 96, 'p': 135}, {'k': 7, 'c': 108, 'p': 145},
                {'k': 8, 'c': 120, 'p': 155}, {'k': 9, 'c': 132, 'p': 165},
                {'k': 10, 'c': 147, 'p': 175}, {'k': 12, 'c': 180, 'p': 235},
                {'k': 15, 'c': 220, 'p': 265},
            ],
        },
    },
    'DPFLASHA': {
        'BKK_BKK': {
            'weight': [
                {'k': 0.5, 'c': 28, 'p': 35}, {'k': 1, 'c': 31, 'p': 35},
                {'k': 2, 'c': 35, 'p': 40}, {'k': 3, 'c': 41, 'p': 46},
                {'k': 4, 'c': 57, 'p': 63}, {'k': 5, 'c': 92, 'p': 99},
                {'k': 6, 'c': 80, 'p': 89}, {'k': 7, 'c': 89, 'p': 99},
                {'k': 8, 'c': 103, 'p': 120}, {'k': 9, 'c': 113, 'p': 131},
                {'k': 12, 'c': 160, 'p': 183}, {'k': 15, 'c': 190, 'p': 216},
            ],
            'dim': [
                {'k': 6, 'c': 80, 'p': 89}, {'k': 7, 'c': 89, 'p': 99},
                {'k': 8, 'c': 103, 'p': 120}, {'k': 9, 'c': 113, 'p': 131},
                {'k': 10, 'c': 130, 'p': 150}, {'k': 11, 'c': 150, 'p': 172},
                {'k': 12, 'c': 160, 'p': 183}, {'k': 13, 'c': 170, 'p': 194},
                {'k': 14, 'c': 180, 'p': 205}, {'k': 15, 'c': 190, 'p': 216},
                {'k': 16, 'c': 205, 'p': 233}, {'k': 17, 'c': 215, 'p': 244},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'k': 0.5, 'c': 28, 'p': 35}, {'k': 1, 'c': 31, 'p': 35},
                {'k': 2, 'c': 35, 'p': 40}, {'k': 3, 'c': 41, 'p': 46},
                {'k': 4, 'c': 61, 'p': 66}, {'k': 5, 'c': 92, 'p': 99},
                {'k': 6, 'c': 80, 'p': 89}, {'k': 7, 'c': 89, 'p': 99},
                {'k': 8, 'c': 103, 'p': 120}, {'k': 9, 'c': 113, 'p': 131},
                {'k': 12, 'c': 160, 'p': 183}, {'k': 15, 'c': 190, 'p': 216},
            ],
            'dim': [
                {'k': 6, 'c': 80, 'p': 89}, {'k': 7, 'c': 89, 'p': 99},
                {'k': 8, 'c': 103, 'p': 120}, {'k': 9, 'c': 113, 'p': 131},
                {'k': 10, 'c': 130, 'p': 150}, {'k': 11, 'c': 150, 'p': 172},
                {'k': 12, 'c': 160, 'p': 183}, {'k': 13, 'c': 170, 'p': 194},
                {'k': 14, 'c': 180, 'p': 205}, {'k': 15, 'c': 190, 'p': 216},
                {'k': 16, 'c': 205, 'p': 233}, {'k': 17, 'c': 215, 'p': 244},
            ],
        },
    },
    'DPSHOPEE': {
        'BKK_BKK': {
            'weight': [
                {'k': 0.5, 'c': 24, 'p': 30}, {'k': 1, 'c': 27, 'p': 30},
                {'k': 2, 'c': 30, 'p': 38}, {'k': 3, 'c': 34, 'p': 43},
                {'k': 4, 'c': 46, 'p': 58}, {'k': 5, 'c': 55, 'p': 65},
                {'k': 6, 'c': 58, 'p': 73}, {'k': 7, 'c': 66, 'p': 83},
                {'k': 8, 'c': 84, 'p': 102}, {'k': 9, 'c': 90, 'p': 110},
                {'k': 10, 'c': 101, 'p': 120}, {'k': 12, 'c': 115, 'p': 137},
                {'k': 15, 'c': 154, 'p': 168},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'k': 0.5, 'c': 35, 'p': 40}, {'k': 1, 'c': 38, 'p': 40},
                {'k': 2, 'c': 39, 'p': 45}, {'k': 3, 'c': 41, 'p': 47},
                {'k': 4, 'c': 46, 'p': 58}, {'k': 5, 'c': 55, 'p': 65},
                {'k': 6, 'c': 58, 'p': 73}, {'k': 7, 'c': 66, 'p': 83},
                {'k': 8, 'c': 81, 'p': 102}, {'k': 9, 'c': 88, 'p': 110},
                {'k': 10, 'c': 99, 'p': 120}, {'k': 12, 'c': 117, 'p': 137},
                {'k': 15, 'c': 143, 'p': 163},
            ],
        },
    },
    'DPDHL': {
        'BKK_BKK': {
            'weight': [
                {'k': 0.5, 'c': 30, 'p': 35}, {'k': 1, 'c': 33, 'p': 35},
                {'k': 2, 'c': 36, 'p': 41}, {'k': 3, 'c': 41, 'p': 48},
                {'k': 4, 'c': 45, 'p': 58}, {'k': 5, 'c': 51, 'p': 60},
                {'k': 6, 'c': 71, 'p': 76}, {'k': 7, 'c': 76, 'p': 85},
                {'k': 8, 'c': 81, 'p': 92}, {'k': 9, 'c': 88, 'p': 99},
                {'k': 12, 'c': 104, 'p': 119}, {'k': 15, 'c': 119, 'p': 135},
            ],
            'dim': [
                {'k': 5, 'c': 46, 'p': 57}, {'k': 7, 'c': 76, 'p': 85},
                {'k': 9, 'c': 88, 'p': 99}, {'k': 12, 'c': 104, 'p': 119},
                {'k': 14, 'c': 114, 'p': 129}, {'k': 15, 'c': 119, 'p': 135},
                {'k': 16, 'c': 135, 'p': 145}, {'k': 17, 'c': 150, 'p': 162},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'k': 0.5, 'c': 30, 'p': 35}, {'k': 1, 'c': 33, 'p': 35},
                {'k': 2, 'c': 44, 'p': 49}, {'k': 3, 'c': 48, 'p': 56},
                {'k': 4, 'c': 52, 'p': 61}, {'k': 5, 'c': 58, 'p': 67},
                {'k': 6, 'c': 88, 'p': 95}, {'k': 7, 'c': 92, 'p': 99},
                {'k': 8, 'c': 97, 'p': 105}, {'k': 9, 'c': 105, 'p': 110},
                {'k': 12, 'c': 129, 'p': 137}, {'k': 15, 'c': 150, 'p': 159},
            ],
            'dim': [
                {'k': 5, 'c': 55, 'p': 67}, {'k': 7, 'c': 92, 'p': 99},
                {'k': 9, 'c': 105, 'p': 110}, {'k': 12, 'c': 129, 'p': 137},
                {'k': 14, 'c': 143, 'p': 152}, {'k': 15, 'c': 150, 'p': 159},
                {'k': 16, 'c': 171, 'p': 182}, {'k': 17, 'c': 176, 'p': 187},
            ],
        },
    },
    'DPFLASHLIVEBULKY': {
        'BKK_BKK': {
            'weight': [
                {'k': 6, 'c': 60, 'p': 60}, {'k': 7, 'c': 62, 'p': 70},
                {'k': 8, 'c': 72, 'p': 80}, {'k': 9, 'c': 82, 'p': 90},
                {'k': 10, 'c': 95, 'p': 100}, {'k': 12, 'c': 112, 'p': 120},
                {'k': 15, 'c': 142, 'p': 150},
            ],
            'dim': [
                {'k': 10, 'c': 92, 'p': 100}, {'k': 12, 'c': 112, 'p': 120},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'k': 6, 'c': 60, 'p': 60}, {'k': 7, 'c': 62, 'p': 70},
                {'k': 8, 'c': 72, 'p': 80}, {'k': 9, 'c': 82, 'p': 90},
                {'k': 10, 'c': 95, 'p': 100}, {'k': 12, 'c': 112, 'p': 120},
                {'k': 15, 'c': 142, 'p': 150},
            ],
            'dim': [
                {'k': 10, 'c': 92, 'p': 100}, {'k': 12, 'c': 112, 'p': 120},
            ],
        },
    },
}

# ═══════════════════════════════════════════════════════════════════
# 2. Calculation functions (ported from rate_calculator.cjs)
# ═══════════════════════════════════════════════════════════════════

def get_zone(province):
    return 'BKK_BKK' if province in BKK_PROVINCES else 'BKK_OTHER'

def normalize_dim(cm):
    return math.ceil(cm * 2) / 2

def interpolate(rows, target_kg):
    if not rows:
        return None
    s = sorted(rows, key=lambda r: r['k'])
    if target_kg == s[0]['k']:
        return {'c': s[0]['c'], 'p': s[0]['p'], 'e': True}
    if target_kg == s[-1]['k']:
        return {'c': s[-1]['c'], 'p': s[-1]['p'], 'e': True}
    if target_kg < s[0]['k']:
        if len(s) == 1:
            return {'c': s[0]['c'], 'p': s[0]['p'], 'e': False}
        r = (s[1]['c'] - s[0]['c']) / (s[1]['k'] - s[0]['k'])
        pr = (s[1]['p'] - s[0]['p']) / (s[1]['k'] - s[0]['k'])
        return {'c': round(max(0, s[0]['c'] - r * (s[0]['k'] - target_kg)) * 100) / 100,
                'p': round(max(0, s[0]['p'] - pr * (s[0]['k'] - target_kg)) * 100) / 100,
                'e': False}
    if target_kg > s[-1]['k']:
        if len(s) == 1:
            return {'c': s[0]['c'], 'p': s[0]['p'], 'e': False}
        a, b = s[-2], s[-1]
        r = (b['c'] - a['c']) / (b['k'] - a['k'])
        pr = (b['p'] - a['p']) / (b['k'] - a['k'])
        return {'c': round((b['c'] + r * (target_kg - b['k'])) * 100) / 100,
                'p': round((b['p'] + pr * (target_kg - b['k'])) * 100) / 100,
                'e': False}
    for i in range(len(s) - 1):
        a, b = s[i], s[i + 1]
        if target_kg == a['k']:
            return {'c': a['c'], 'p': a['p'], 'e': True}
        if target_kg == b['k']:
            return {'c': b['c'], 'p': b['p'], 'e': True}
        if a['k'] < target_kg < b['k']:
            f = (target_kg - a['k']) / (b['k'] - a['k'])
            return {'c': round((a['c'] + (b['c'] - a['c']) * f) * 100) / 100,
                    'p': round((a['p'] + (b['p'] - a['p']) * f) * 100) / 100,
                    'e': False}
    return None

def volumetric_weight(courier, vol_cm3):
    div = VOL_DIVISOR[courier]
    if not math.isfinite(div):
        return 1
    if courier == 'DPTHAIPOST':
        return vol_cm3
    return math.ceil(vol_cm3 / div)

def side_weight(courier, dim_sum):
    if courier == 'DPFLASHA':
        if dim_sum >= 135.5: return 17
        if dim_sum >= 131.5: return 16
        if dim_sum >= 125.5: return 15
        if dim_sum >= 121.5: return 14
        if dim_sum >= 115.5: return 13
        if dim_sum >= 112: return 12
        if dim_sum >= 105.5: return 11
        if dim_sum >= 100.5: return 10
        if dim_sum >= 95.5: return 9
        if dim_sum >= 90.5: return 8
        if dim_sum >= 85.5: return 7
        if dim_sum >= 81.5: return 6
        return 1
    if courier == 'DPDHL':
        if dim_sum >= 135.5: return 17
        if dim_sum >= 131.5: return 16
        if dim_sum >= 125.5: return 15
        if dim_sum >= 121.5: return 14
        if dim_sum >= 111.5: return 12
        if dim_sum >= 100.5: return 9
        if dim_sum >= 90.5: return 7
        if dim_sum >= 81.5: return 5
        return 1
    if courier == 'DPFLASHLIVEBULKY':
        if dim_sum >= 120:
            return max(10, side_weight('DPFLASHA', dim_sum) - 3)
        return 0
    return 1

def chargeable_weight(courier, weight_kg, w, l, h):
    vol = w * l * h
    if courier == 'DPTHAIPOST':
        return max(math.ceil(weight_kg * 1000), vol)
    actual_ceil = math.ceil(weight_kg)
    dim_wt = volumetric_weight(courier, vol)
    return max(actual_ceil, dim_wt)

def chargeable_with_side(courier, weight_kg, w, l, h):
    vol = w * l * h
    if courier == 'DPTHAIPOST':
        return max(math.ceil(weight_kg * 1000), vol) / 1000
    actual_ceil = math.ceil(weight_kg)
    dim_wt = volumetric_weight(courier, vol)
    dim_sum = w + l + h
    sw = side_weight(courier, dim_sum)
    if courier == 'DPDHL':
        return max(actual_ceil, sw)
    if courier == 'DPFLASHLIVEBULKY':
        return max(actual_ceil, sw)
    return max(actual_ceil, dim_wt, sw)

def predict_policy(courier, weight_kg, w, l, h):
    if courier in ('DPKERRY', 'DPTHAIPOST', 'DPSHOPEE'):
        return 'weight'
    vol = w * l * h
    dim_sum = w + l + h
    actual_ceil = math.ceil(weight_kg)
    if courier == 'DPFLASHLIVEBULKY':
        sw = side_weight(courier, dim_sum)
        est_fw = max(actual_ceil, sw)
        return 'dimension' if est_fw > actual_ceil else 'weight'
    if courier == 'DPFLASHA':
        dim_wt = math.ceil(vol / 6000)
        sw = side_weight(courier, dim_sum)
        est_fw = max(actual_ceil, dim_wt, sw)
    else:  # DPDHL
        sw = side_weight(courier, dim_sum)
        est_fw = max(actual_ceil, sw)
        return 'dimension' if est_fw > actual_ceil else 'weight'
    return 'dimension' if est_fw > actual_ceil else 'weight'

def calculate_price(courier, province, weight_kg, w_cm, l_cm, h_cm):
    w = normalize_dim(w_cm)
    l = normalize_dim(l_cm)
    h = normalize_dim(h_cm)
    if courier == 'DPTHAIPOST' and w * l * h > 60000:
        return {'price': None, 'rejected': True,
                'reason': 'ขนาดเกินกำหนดไปรษณีย์ไทย (ปริมาตร > 60,000 cm³)',
                'courier_code': courier}
    zone = get_zone(province)
    ct = RATE_TABLE.get(courier)
    if not ct:
        return {'price': 0, 'rejected': True, 'reason': 'ไม่พบข้อมูลขนส่ง', 'courier_code': courier}
    zt = ct.get(zone)
    if not zt:
        return {'price': 0, 'rejected': True, 'reason': 'ไม่มีข้อมูลโซนนี้', 'courier_code': courier}
    policy = predict_policy(courier, weight_kg, w, l, h)
    if policy == 'weight' or 'dim' not in zt:
        rows = zt['weight']
        lookup_key = weight_kg if weight_kg <= 0.5 else math.ceil(weight_kg)
        min_k = rows[0]['k']
        if courier == 'DPFLASHLIVEBULKY' and lookup_key < min_k:
            return {'price': None, 'rejected': True,
                    'reason': f'Flash Bulky ขั้นต่ำ {min_k} kg (น้ำหนักคำนวณ {lookup_key} kg)',
                    'courier_code': courier}
    else:
        rows = zt['dim']
        lookup_key = chargeable_with_side(courier, weight_kg, w, l, h)
    result = interpolate(rows, lookup_key)
    if not result:
        return {'price': 0, 'rejected': True, 'reason': 'ไม่พบอัตราค่าส่ง', 'courier_code': courier}
    return {'price': result['p'], 'rejected': False, 'exact': result['e'],
            'courier_code': courier}

def compare_all_couriers(province, weight_kg, w_cm=None, l_cm=None, h_cm=None):
    if w_cm is None or l_cm is None or h_cm is None:
        w_cm, l_cm, h_cm = default_dims(weight_kg)
    results = []
    for code in RATE_TABLE:
        r = calculate_price(code, province, weight_kg, w_cm, l_cm, h_cm)
        r['courier_name'] = COURIER_NAMES.get(code, code)
        results.append(r)
    results.sort(key=lambda r: (r['price'] if r['price'] is not None else float('inf')))
    return results

def default_dims(weight_kg):
    g = weight_kg * 1000
    if g <= 500:
        return 15, 20, 10
    if g <= 1000:
        return 20, 30, 10
    if g <= 5000:
        return 30, 40, 20
    return 40, 50, 30

def normalize_province(raw):
    if not raw:
        return None
    inp = raw.strip()
    if inp in ALL_PROVINCES:
        return inp
    if inp in PROVINCE_SYNONYMS:
        return PROVINCE_SYNONYMS[inp]
    lower = inp.lower()
    for p in ALL_PROVINCES:
        if p.lower() == lower:
            return p
    for syn, canonical in PROVINCE_SYNONYMS.items():
        if syn.lower() == lower:
            return canonical
    for p in ALL_PROVINCES:
        if inp in p or p in inp:
            return p
    return None


def _crc16_ccitt(data_bytes):
    crc = 0xFFFF
    for b in data_bytes:
        crc ^= b << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = (crc << 1) ^ 0x1021
            else:
                crc <<= 1
            crc &= 0xFFFF
    return crc


def _tlv(tag, value):
    return f"{int(tag):02d}{len(value):02d}{value}"


def generate_promptpay_qr_base64(phone, amount):
    phone = (phone or '').strip()
    if not phone:
        return None, "PROMPTPAY_PHONE ไม่ได้ตั้งค่า"
    phone_num = phone.replace('-', '').replace(' ', '')
    display_phone = phone_num
    if phone_num.startswith('0'):
        phone_num = f"0066{phone_num[1:]}"

    merchant_info = _tlv("00", "A000000677010111") + _tlv("01", phone_num)
    payload = (
        _tlv("00", "01")
        + _tlv("01", "12" if amount else "11")
        + _tlv("29", merchant_info)
        + _tlv("53", "764")
    )
    if amount:
        amt_str = f"{amount:.2f}"
        payload += _tlv("54", amt_str)
    payload += _tlv("58", "TH")
    payload += "6304"
    payload_bytes = payload.encode('ascii')
    crc = _crc16_ccitt(payload_bytes)
    crc_hex = f"{crc:04X}"
    payload += crc_hex

    try:
        import qrcode
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        return None, "qrcode/Pillow not installed"

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")

    W, H = (500, 760) if amount else (500, 730)
    canvas = Image.new("RGB", (W, H), "white")
    draw = ImageDraw.Draw(canvas)

    try:
        font_18 = ImageFont.truetype("Mitr-Regular.ttf", 18)
        font_24 = ImageFont.truetype("Mitr-Regular.ttf", 24)
    except Exception:
        try:
            font_18 = ImageFont.truetype("DejaVuSans.ttf", 18)
            font_24 = ImageFont.truetype("DejaVuSans-Bold.ttf", 24)
        except Exception:
            font_18 = ImageFont.load_default()
            font_24 = ImageFont.load_default()

    # Card background
    draw.rectangle([10, 10, W - 10, H - 10], outline="#E0E0E0", width=1, fill="#FFFFFF")

    # Thai QR Payment logo with full-width navy banner
    thai_qr_y = 20
    try:
        thai_qr_img = Image.open("Thai_QR_Payment_Logo.png").convert("RGBA")
        thai_qr_max_w = 250
        thai_qr_scale = min(1.0, thai_qr_max_w / thai_qr_img.width)
        thai_qr_w = int(thai_qr_img.width * thai_qr_scale)
        thai_qr_h = int(thai_qr_img.height * thai_qr_scale)
        thai_qr_x = (W - thai_qr_w) // 2
        thai_qr_img = thai_qr_img.resize((thai_qr_w, thai_qr_h), Image.LANCZOS)
    except Exception:
        thai_qr_w, thai_qr_h = 250, 99
        thai_qr_x = (W - thai_qr_w) // 2
        thai_qr_img = None

    banner_bottom = thai_qr_y + thai_qr_h + 8
    draw.rectangle([10, 10, W - 10, banner_bottom], fill="#0E3D67")

    if thai_qr_img:
        canvas.paste(thai_qr_img, (thai_qr_x, thai_qr_y), thai_qr_img)

    # PromptPay logo (12px gap from banner)
    logo_y = banner_bottom + 12
    try:
        logo_img = Image.open("promptpay_logo.jpg").convert("RGB")
        logo_max_w = 250
        logo_scale = min(1.0, logo_max_w / logo_img.width)
        logo_w = int(logo_img.width * logo_scale)
        logo_h = int(logo_img.height * logo_scale)
        logo_x = (W - logo_w) // 2
        logo_img = logo_img.resize((logo_w, logo_h), Image.LANCZOS)
        canvas.paste(logo_img, (logo_x, logo_y))
    except Exception:
        logo_h = 44

    # QR code (16px gap from logo)
    qr_size = 250
    qr_resized = qr_img.resize((qr_size, qr_size), Image.LANCZOS)
    qr_x = (W - qr_size) // 2
    qr_y = logo_y + logo_h + 16
    canvas.paste(qr_resized, (qr_x, qr_y))

    # Text labels: amount → footer → phone
    text_y = qr_y + qr_size + 32
    line_y = text_y

    if amount:
        amt_text = f"{amount:,.2f} บาท"
        tb = draw.textbbox((0, 0), amt_text, font=font_24)
        tw = tb[2] - tb[0]
        draw.text(((W - tw) // 2, line_y), amt_text, fill="#333333", font=font_24)
        line_y += 30

    footer = "S36 Post Shop"
    tb = draw.textbbox((0, 0), footer, font=font_18)
    tw = tb[2] - tb[0]
    draw.text(((W - tw) // 2, line_y), footer, fill="#0074D9", font=font_18)
    line_y += 26

    pp_id_text = display_phone
    if len(display_phone) == 10 and display_phone.startswith('0'):
        pp_id_text = f"{display_phone[:3]}-{display_phone[3:6]}-{display_phone[6:]}"
    tb = draw.textbbox((0, 0), pp_id_text, font=font_18)
    tw = tb[2] - tb[0]
    draw.text(((W - tw) // 2, line_y), pp_id_text, fill="#333333", font=font_18)

    buf = io.BytesIO()
    canvas.save(buf, format="PNG")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode(), None


def ocr_slip(image_base64):
    try:
        img_bytes = base64.b64decode(image_base64)
    except Exception as e:
        return {"amount": 0, "confidence": 0, "raw_text": "", "error": f"decode image failed: {e}"}

    try:
        from PIL import Image
        img = Image.open(io.BytesIO(img_bytes))
    except Exception:
        return {"amount": 0, "confidence": 0, "raw_text": "", "error": "cannot open image"}

    qr_result = _decode_qr(img)
    typhoon_result = _ocr_typhoon(image_base64)

    if typhoon_result and typhoon_result.get('amount', 0) > 0:
        if qr_result.get('ref'):
            typhoon_result['ref'] = qr_result['ref']
            typhoon_result['has_qr'] = True
        return typhoon_result

    if qr_result.get('ref') and typhoon_result:
        return typhoon_result

    if typhoon_result and typhoon_result.get('amount', 0) > 0:
        return typhoon_result

    return {"amount": 0, "confidence": 0, "raw_text": "", "error": "ไม่สามารถอ่านสลิปได้"}


def _decode_qr(pil_image):
    try:
        from pyzbar.pyzbar import decode as zbar_decode
    except ImportError:
        return {}

    try:
        decoded = zbar_decode(pil_image)
    except Exception:
        return {}

    for d in decoded:
        if d.type not in ('QRCODE',):
            continue
        data = d.data.decode('utf-8', errors='replace').strip()
        result = _parse_qr_data(data)
        if result.get("amount"):
            return result

    return {}


def _parse_qr_data(data):
    if data.startswith('{'):
        try:
            obj = json.loads(data)
            ref = obj.get('ref1', '') or obj.get('ref2', '') or obj.get('reference', '')
            return {"amount": 0, "ref": str(ref), "raw": data}
        except json.JSONDecodeError:
            pass
    if '|' in data:
        parts = dict(p.split('=', 1) for p in data.split('|') if '=' in p)
        ref = parts.get('ref', parts.get('ref1', ''))
        return {"amount": 0, "ref": ref, "raw": data}

    ref_match = re.search(r'[A-Za-z0-9]{15,30}', data)
    return {"amount": 0, "ref": ref_match.group(0) if ref_match else "", "raw": data}


def _ocr_typhoon(image_base64):
    api_key = os.getenv("TYPHOON_API_KEY", "").strip()
    if not api_key:
        return None

    try:
        body = json.dumps({
            "model": "typhoon-ocr-preview",
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": "Read this bank payment slip in Thai. Extract: 1) the transaction amount (จำนวนเงิน) as a number, 2) the recipient name (ชื่อผู้รับโอน/ไปยัง), 3) the transfer date and time (วันที่และเวลาโอน) in ISO 8601 format (YYYY-MM-DDTHH:MM:SS). Return only these values."},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}}
                ]
            }],
            "max_tokens": 1024,
            "temperature": 0.1,
        }).encode('utf-8')

        req = urllib.request.Request(
            "https://api.opentyphoon.ai/v1/chat/completions",
            data=body,
            method='POST',
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}',
            }
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())

        content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
        return _parse_typhoon_response(content)
    except Exception as e:
        return {"amount": 0, "confidence": 0, "raw_text": str(e), "error": f"Typhoon API error: {e}"}


def _extract_datetime(text):
    if not isinstance(text, str):
        return None

    thai_months = {
        'ม\\.?ค\\.?|มกราคม': 1, 'ก\\.?พ\\.?|กุมภาพันธ์': 2, 'มี\\.?ค\\.?|มีนาคม': 3,
        'เม\\.?ย\\.?|เมษายน': 4, 'พ\\.?ค\\.?|พฤษภาคม': 5, 'มิ\\.?ย\\.?|มิถุนายน': 6,
        'ก\\.?ค\\.?|กรกฎาคม': 7, 'ส\\.?ค\\.?|สิงหาคม': 8, 'ก\\.?ย\\.?|กันยายน': 9,
        'ต\\.?ค\\.?|ตุลาคม': 10, 'พ\\.?ย\\.?|พฤศจิกายน': 11, 'ธ\\.?ค\\.?|ธันวาคม': 12,
    }
    time_pat = r'(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?'

    iso_m = re.search(r'(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?', text)
    if iso_m:
        try:
            parts = [int(g) for g in iso_m.groups() if g]
            if len(parts) == 5:
                return datetime(*parts)
            return datetime(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5])
        except (ValueError, TypeError):
            pass

    m = re.search(r'(\d{1,2})\s*/\s*(\d{1,2})\s*/\s*(\d{4})', text)
    if m:
        d, mo, y = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if y > 2500:
            y -= 543
        try:
            dt_val = datetime(y, mo, d)
            tm = re.search(time_pat, text[m.end():])
            if tm:
                h, mi, s = int(tm.group(1)), int(tm.group(2)), int(tm.group(3) or 0)
                dt_val = dt_val.replace(hour=h, minute=mi, second=s)
            return dt_val
        except (ValueError, TypeError):
            pass

    for pat, mon in thai_months.items():
        full_pat = rf'(\d{{1,2}})\s+(?:{pat})\s+(\d{{4}})'
        m = re.search(full_pat, text)
        if m:
            d, y = int(m.group(1)), int(m.group(2))
            if y > 2500:
                y -= 543
            try:
                dt_val = datetime(y, mon, d)
                tm = re.search(time_pat, text[m.end():])
                if tm:
                    h, mi, s = int(tm.group(1)), int(tm.group(2)), int(tm.group(3) or 0)
                    dt_val = dt_val.replace(hour=h, minute=mi, second=s)
                return dt_val
            except (ValueError, TypeError):
                pass

    return None


def _parse_typhoon_response(content):
    if isinstance(content, list):
        content = ' '.join(
            item.get('text', '') if isinstance(item, dict) else str(item)
            for item in content
        )
    elif not isinstance(content, str):
        content = str(content)

    text_to_search = content
    transfer_dt = _extract_datetime(content)
    transfer_str = transfer_dt.isoformat() if transfer_dt else None

    try:
        obj = json.loads(content)
        if isinstance(obj, dict):
            if 'natural_text' in obj:
                text_to_search = obj['natural_text']
                if not transfer_dt:
                    transfer_dt = _extract_datetime(text_to_search)
                    transfer_str = transfer_dt.isoformat() if transfer_dt else None
            elif 'amount' in obj and isinstance(obj['amount'], (int, float)):
                return {"amount": float(obj['amount']), "confidence": 0.85,
                        "raw_text": content[:500], "source": "typhoon",
                        "transfer_datetime": transfer_str}
    except (json.JSONDecodeError, ValueError, TypeError):
        pass

    patterns = [
        r'จำนวนเงิน\s*[:\-\s]*\s*([\d,]+\.?\d+)',
        r'Amount\s*[:\-\s]*\s*([\d,]+\.?\d+)',
        r'[\u0E3F฿]\s*([\d,]+\.?\d+)',
        r'([\d,]+\.?\d+)\s*บาท',
    ]
    for p in patterns:
        m = re.search(p, text_to_search, re.IGNORECASE)
        if m:
            try:
                return {"amount": float(m.group(1).replace(',', '')),
                        "confidence": 0.85, "raw_text": text_to_search[:500], "source": "typhoon",
                        "transfer_datetime": transfer_str}
            except ValueError:
                continue

    prefix = text_to_search.split('จำนวนเงิน')
    if len(prefix) > 1:
        amounts = re.findall(r'([\d,]+\.?\d{2})', prefix[-1])
        if amounts:
            try:
                return {"amount": float(amounts[0].replace(',', '')),
                        "confidence": 0.7, "raw_text": text_to_search[:500], "source": "typhoon",
                        "transfer_datetime": transfer_str}
            except ValueError:
                pass

    amounts = re.findall(r'([\d,]+\.?\d{2})', text_to_search)
    if amounts:
        try:
            return {"amount": float(amounts[0].replace(',', '')),
                    "confidence": 0.3, "raw_text": text_to_search[:500], "source": "typhoon",
                    "transfer_datetime": transfer_str}
        except ValueError:
            pass

    return {"amount": 0.0, "confidence": 0.2, "raw_text": text_to_search[:500], "source": "typhoon",
            "transfer_datetime": transfer_str}


# ═══════════════════════════════════════════════════════════════════
# 3. Schedule check (ported from fulfillment/index.js)
# ═══════════════════════════════════════════════════════════════════

HOURS = {
    'mon_fri': {'open': 9, 'close': 18},
    'sat_sun': {'open': 9, 'close': 17},
}

DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

def is_open():
    now = datetime.now()
    day = now.weekday()  # 0=Mon..6=Sun → shift to Thai convention
    day_th = (day + 1) % 7  # 0=Sun, 1=Mon..6=Sat
    hour = now.hour
    minute = now.minute
    t = hour + minute / 60
    is_weekday = 1 <= day_th <= 5
    rng = HOURS['mon_fri'] if is_weekday else HOURS['sat_sun']
    open_now = rng['open'] <= t < rng['close']
    day_name = DAY_NAMES[day_th]
    ts = f"{hour:02d}:{minute:02d}"
    return open_now, day_name, ts, rng

# ═══════════════════════════════════════════════════════════════════
# 4. Dashboard order lookup (S36 Docker dashboard port 8000)
# ═══════════════════════════════════════════════════════════════════

def lookup_order(query):
    url = f"{DASHBOARD_URL}/api/public/order-lookup?q={urllib.parse.quote(query)}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
        if not data:
            return "ไม่พบออเดอร์สำหรับคำค้นนี้"
        lines = []
        for o in data:
            status = o.get('status', 'ไม่ทราบสถานะ')
            tracking = o.get('tracking_number', '') or 'ยังไม่มี'
            lines.append(
                f"ออเดอร์ {o['id']}: {o['receiver_name']} → "
                f"{o['delivery_province']}\n"
                f"  ขนส่ง: {o['courier_name']} | ราคา: {o['price']} บาท\n"
                f"  สถานะ: {status} | Tracking: {tracking}\n"
                f"  วันที่: {o['created_at']}"
            )
        return "\n\n".join(lines)
    except urllib.error.URLError as e:
        return f"เชื่อมต่อ dashboard ไม่ได้ (localhost:8000): {e}"
    except Exception as e:
        return f"ผิดพลาด: {e}"

# ═══════════════════════════════════════════════════════════════════
# 5. Tool definitions (Ollama function schemas)
# ═══════════════════════════════════════════════════════════════════

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "shipping_fee_calculator",
            "description": (
                "Compare shipping fees across all couriers (Kerry, Thai Post, Flash, Shopee, DHL, Flash Bulky) "
                "for sending a package to a Thai province. Extract province and weight_kg from user message. "
                "Call this tool immediately when user provides both. "
                "Only ask the user for province or weight if they are missing from the message."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "province": {
                        "type": "string",
                        "description": "Thai province name for delivery destination (e.g. เชียงใหม่, กรุงเทพมหานคร, ภูเก็ต)"
                    },
                    "weight_kg": {
                        "type": "number",
                        "description": "Package weight in kilograms (e.g. 1, 3.5, 10)"
                    },
                    "width_cm": {
                        "type": "number",
                        "description": "Box width in centimeters (optional, estimated from weight if not provided)"
                    },
                    "length_cm": {
                        "type": "number",
                        "description": "Box length in centimeters (optional)"
                    },
                    "height_cm": {
                        "type": "number",
                        "description": "Box height in centimeters (optional)"
                    },
                },
                "required": ["province", "weight_kg"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_schedule",
            "description": (
                "Check if the shop is currently open, what the opening hours are today, "
                "and when it closes. Use this when user asks about opening hours, "
                "if the shop is open now, or shop schedule."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_shipping_status",
            "description": (
                "Look up a customer's shipping/order status from the dashboard. "
                "Search by phone number or order ID. Returns order status, tracking number, "
                "courier, destination, and price. Use this when user asks about their order, "
                "delivery status, tracking, or 'where is my package'."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Phone number or order ID to look up (e.g. '0812345678' or 'KERRY260625120000')"
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_promptpay_qr",
            "description": (
                "Generate a PromptPay QR code for the customer to scan and pay. "
                "Call this AFTER user has agreed to a courier and price, and provided all required info (name, phone, pickup_address, receiver info). "
                "Shows the QR code and payment amount in chat. Then wait for user to upload a payment slip."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {
                        "type": "number",
                        "description": "The shipping price in baht from the previous shipping_fee_calculator result"
                    },
                },
                "required": ["amount"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "verify_slip",
            "description": (
                "OCR a payment slip image uploaded by user to verify payment amount. "
                "Compares extracted amount with expected shipping fee. "
                "If verified, create the order using create_shipping_order with slip data attached."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "image_base64": {
                        "type": "string",
                        "description": "Base64 encoded payment slip image uploaded by the user"
                    },
                    "expected_amount": {
                        "type": "number",
                        "description": "The shipping price in baht expected to be paid"
                    },
                },
                "required": ["image_base64", "expected_amount"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_shipping_order",
            "description": (
                "Create a shipping order in the dashboard. Call AFTER verify_slip succeeded. "
                "Pass slip data (image_base64, ocr_amount, ocr_confidence, ocr_raw) from verify_slip result."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {
                        "type": "string",
                        "description": "Sender/customer name. Must ask user."
                    },
                    "customer_phone": {
                        "type": "string",
                        "description": "Sender phone number. Must ask user."
                    },
                    "pickup_address": {
                        "type": "string",
                        "description": "Pickup address (ที่อยู่คนส่ง). Must ask user."
                    },
                    "delivery_province": {
                        "type": "string",
                        "description": "Delivery destination province (from previous shipping_fee_calculator call)."
                    },
                    "receiver_name": {
                        "type": "string",
                        "description": "Receiver name. Ask user if not provided."
                    },
                    "receiver_phone": {
                        "type": "string",
                        "description": "Receiver phone number. Ask user if not provided."
                    },
                    "weight_kg": {
                        "type": "number",
                        "description": "Package weight in kg (from previous conversation)."
                    },
                    "courier_code": {
                        "type": "string",
                        "description": "Courier code selected by user (DPKERRY, DPFLASHA, DPSHOPEE, DPTHAIPOST, DPDHL, DPFLASHLIVEBULKY)."
                    },
                    "courier_name": {
                        "type": "string",
                        "description": "Courier display name in Thai (Kerry, Flash, Shopee, ไปรษณีย์ไทย, DHL, Flash Bulky)."
                    },
                    "price": {
                        "type": "number",
                        "description": "Shipping price in baht (from previous shipping_fee_calculator result)."
                    },
                    "slip_image_base64": {
                        "type": "string",
                        "description": "Base64 encoded slip image from user upload. Pass from verify_slip result."
                    },
                    "slip_ocr_amount": {
                        "type": "number",
                        "description": "OCR extracted amount from verify_slip result (SLIP_OCR_AMOUNT)."
                    },
                    "slip_ocr_confidence": {
                        "type": "number",
                        "description": "OCR confidence from verify_slip result (SLIP_OCR_CONFIDENCE)."
                    },
                    "slip_ocr_raw": {
                        "type": "string",
                        "description": "OCR raw text from verify_slip result (SLIP_OCR_RAW)."
                    },
                },
                "required": ["customer_name", "customer_phone", "pickup_address", "delivery_province", "receiver_name", "receiver_phone", "weight_kg", "courier_code", "courier_name", "price"],
            },
        },
    },
]

# ═══════════════════════════════════════════════════════════════════
# 6. Tool execution dispatch
# ═══════════════════════════════════════════════════════════════════

def execute_tool(tool_call, user_id=None):
    name = tool_call['function']['name']
    raw_args = tool_call['function']['arguments']
    if isinstance(raw_args, dict):
        args = raw_args
    elif isinstance(raw_args, str):
        try:
            args = json.loads(raw_args or '{}')
        except (json.JSONDecodeError, TypeError):
            args = {}
    else:
        args = {}
    if name == 'shipping_fee_calculator':
        province = normalize_province(args.get('province', ''))
        if not province:
            return f"ไม่พบจังหวัด '{args.get('province', '')}' กรุณาระบุชื่อจังหวัดภาษาไทยให้ถูกต้อง"
        weight_kg = float(args.get('weight_kg', 0))
        if weight_kg <= 0:
            return "กรุณาระบุน้ำหนักมากกว่า 0 kg"
        w = float(args.get('width_cm', 0)) or None
        l = float(args.get('length_cm', 0)) or None
        h = float(args.get('height_cm', 0)) or None
        dims_provided = w and l and h
        results = compare_all_couriers(province, weight_kg,
                                       w if dims_provided else None,
                                       l if dims_provided else None,
                                       h if dims_provided else None)
        lines = [f"ค่าส่งไป{province} {weight_kg} kg:"]
        for r in results:
            if r['rejected']:
                lines.append(f"  - {r['courier_name']}: ❌ {r['reason']}")
            else:
                mark = '' if r.get('exact') else ' (ประมาณ)'
                lines.append(f"  - {r['courier_name']}: {r['price']} บาท{mark}")
        return '\n'.join(lines)
    elif name == 'check_schedule':
        open_now, day_name, ts, rng = is_open()
        close_str = f"{rng['close']:02d}:00"
        if open_now:
            return f"ขณะนี้ ({day_name} {ts} น.) ร้านเปิดอยู่ ปิด {close_str} น."
        if day_name in ('เสาร์', 'อาทิตย์'):
            return f"ขณะนี้ ({day_name} {ts} น.) ร้านปิดแล้ว เปิดอีกทีวันจันทร์ 09:00 น."
        return f"ขณะนี้ ({day_name} {ts} น.) ร้านปิดแล้ว เปิดอีกทีพรุ่งนี้ 09:00 น."
    elif name == 'get_shipping_status':
        query = args.get('query', '').strip()
        if not query:
            return "กรุณาระบุเบอร์โทรหรือเลขออเดอร์ที่ต้องการค้นหา"
        return lookup_order(query)
    elif name == 'create_shipping_order':
        body = {
            "customer_name": args.get("customer_name", ""),
            "customer_phone": args.get("customer_phone", ""),
            "pickup_address": args.get("pickup_address", ""),
            "delivery_province": args.get("delivery_province", ""),
            "receiver_name": args.get("receiver_name", ""),
            "receiver_phone": args.get("receiver_phone", ""),
            "weight_kg": float(args.get("weight_kg", 0)),
            "courier_code": args.get("courier_code", ""),
            "courier_name": args.get("courier_name", ""),
            "price": float(args.get("price", 0)),
            "slip_image_base64": get_pending_slip(user_id) or args.get("slip_image_base64", ""),
            "slip_ocr_amount": float(args.get("slip_ocr_amount", 0)),
            "slip_ocr_confidence": float(args.get("slip_ocr_confidence", 0)),
            "slip_ocr_raw": args.get("slip_ocr_raw", ""),
            "slip_transfer_datetime": args.get("slip_transfer_datetime", ""),
        }
        missing = []
        if not body["customer_name"]: missing.append("ชื่อผู้ส่ง")
        if not body["customer_phone"]: missing.append("เบอร์ผู้ส่ง")
        if not body["pickup_address"]: missing.append("ที่อยู่คนส่ง")
        if not body["delivery_province"]: missing.append("จังหวัดปลายทาง")
        if not body["receiver_name"]: missing.append("ชื่อผู้รับ")
        if not body["receiver_phone"]: missing.append("เบอร์ผู้รับ")
        if body["weight_kg"] <= 0: missing.append("น้ำหนัก")
        if not body["courier_code"]: missing.append("ขนส่ง")
        if missing:
            return f"ข้อมูลไม่ครบ กรุณาระบุ: {', '.join(missing)}"
        try:
            data = json.dumps(body).encode('utf-8')
            req = urllib.request.Request(
                f'{DASHBOARD_URL}/api/orders',
                data=data,
                headers={'Content-Type': 'application/json'},
                method='POST',
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read())
            status_msg = result.get('status', 'ยังไม่ได้กรอกลงระบบ')
            slip_info = ""
            if result.get('slip_image_path'):
                slip_info = f"\nสลิป: แนบแล้ว (สถานะ: {status_msg})"
            return (
                f"สร้างออเดอร์สำเร็จ!\n"
                f"เลขออเดอร์: {result['id']}\n"
                f"ปลายทาง: {body['delivery_province']} | {body['weight_kg']} kg\n"
                f"ขนส่ง: {body['courier_name']} | ราคา: {body['price']} บาท\n"
                f"ผู้รับ: {body['receiver_name']} | {body['receiver_phone']}{slip_info}\n"
                f"สถานะ: {status_msg}"
            )
        except Exception as e:
            return f"สร้างออเดอร์ไม่สำเร็จ: {e}"
    elif name == 'generate_promptpay_qr':
        amount = float(args.get('amount', 0))
        if amount <= 0:
            return "กรุณาระบุยอดเงินที่ถูกต้อง"
        qr_base64, error = generate_promptpay_qr_base64(PROMPTPAY_PHONE, amount)
        if error:
            return f"สร้าง QR ไม่สำเร็จ: {error}"
        set_qr_generated_at(datetime.now(), user_id)
        return f"QR_CODE:{qr_base64}|AMOUNT:{amount}"
    elif name == 'verify_slip':
        image_b64 = args.get('image_base64', '')
        if not image_b64 or len(image_b64) < 100 or image_b64.startswith('['):
            image_b64 = peek_pending_slip(user_id)
        expected = float(args.get('expected_amount', 0))
        if not image_b64:
            return "ไม่พบรูปสลิปที่ส่งมา"
        if expected <= 0:
            return "ไม่พบยอดเงินที่คาดหวัง"

        if TEST_MODE:
            return (
                f"VERIFIED_OK\n"
                f"ยอดที่ตรวจพบ: {expected:.2f} บาท (คาดหวัง {expected:.2f} บาท) [TEST MODE]\n"
                f"SLIP_OCR_AMOUNT:{expected}|SLIP_OCR_CONFIDENCE:1.0|SLIP_OCR_RAW:test_mode|SLIP_TRANSFER_DATETIME:"
            )

        result = ocr_slip(image_b64)
        if result.get('error'):
            return f"OCR_FAILED:{result['error']}"

        ocr_amt = result['amount']
        conf = result['confidence']
        raw = result['raw_text']
        transfer_str = result.get('transfer_datetime', '')

        tolerance = max(expected * 0.1, 5)
        amount_ok = abs(ocr_amt - expected) <= tolerance and conf >= 0.3

        recipient_ok = True
        if RECIPIENT_NAME:
            name_keywords = RECIPIENT_NAME.split()
            recipient_ok = any(kw in raw for kw in name_keywords if len(kw) >= 3)

        time_ok = True
        time_reason = ""
        if transfer_str:
            try:
                transfer_dt = datetime.fromisoformat(transfer_str)
                qr_dt = get_qr_generated_at(user_id)
                if qr_dt and transfer_dt < qr_dt:
                    time_ok = False
                    time_reason = (
                        f"เวลาบนสลิป ({transfer_dt.strftime('%d/%m/%Y %H:%M')}) "
                        f"เกิดก่อนเวลาที่ระบบสร้าง QR ({qr_dt.strftime('%d/%m/%Y %H:%M')})"
                    )
            except (ValueError, TypeError):
                pass

        transfer_token = f"SLIP_TRANSFER_DATETIME:{transfer_str}" if transfer_str else "SLIP_TRANSFER_DATETIME:"

        if amount_ok and recipient_ok and time_ok:
            return (
                f"VERIFIED_OK\n"
                f"ยอดที่ตรวจพบ: {ocr_amt:.2f} บาท (คาดหวัง {expected:.2f} บาท)\n"
                f"ความมั่นใจ OCR: {conf:.0%}\n"
                f"SLIP_OCR_AMOUNT:{ocr_amt}|SLIP_OCR_CONFIDENCE:{conf}|SLIP_OCR_RAW:{raw[:500]}|{transfer_token}"
            )
        else:
            reasons = []
            if not amount_ok:
                reasons.append(f"ยอดเงินไม่ตรง ({ocr_amt:.2f} vs {expected:.2f})")
            if not recipient_ok:
                reasons.append("ไม่พบบัญชีปลายทางที่ถูกต้อง")
            if not time_ok:
                reasons.append(time_reason)
            return (
                f"VERIFIED_PENDING\n"
                f"⚠️ {', '.join(reasons)}\n"
                f"ยอดที่ตรวจพบ: {ocr_amt:.2f} บาท\n"
                f"ความมั่นใจ OCR: {conf:.0%}\n"
                f"ระบบจะส่งให้ admin ตรวจสอบอีกครั้ง\n"
                f"SLIP_OCR_AMOUNT:{ocr_amt}|SLIP_OCR_CONFIDENCE:{conf}|SLIP_OCR_RAW:{raw[:500]}|{transfer_token}"
            )
    else:
        return f"Unknown tool: {name}"

# ═══════════════════════════════════════════════════════════════════
# 7. Ollama API + tool loop (importable)
# ═══════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = (
    "You are a shipping assistant bot for shop S36. Follow these rules STRICTLY:\n"
    "1. User asks about shop hours/open/close → MUST call check_schedule. Then answer in Thai.\n"
    "2. User asks about shipping costs/send package → MUST call shipping_fee_calculator.\n"
    "   - If user gave province+weight → call immediately, then summarize results in Thai.\n"
    "   - If info missing → ask short question in Thai for missing piece only.\n"
    "3. User asks about order status/tracking → MUST call get_shipping_status. Then answer in Thai.\n"
    "4. User confirms courier choice or wants to create order → First collect ALL needed info:\n"
    "     customer_name (ชื่อ-นามสกุล ผู้ส่ง), customer_phone (เบอร์โทรศัพท์ผู้ส่ง),\n"
    "     pickup_address (ที่อยู่คนส่ง), receiver_name (ชื่อผู้รับ),\n"
    "     receiver_phone (เบอร์โทรศัพท์ผู้รับ).\n"
    "   - Ask for all missing fields in one message using EXACTLY these labels.\n"
    "   - When ALL info is collected → call generate_promptpay_qr with the price.\n"
    "5. After generate_promptpay_qr tool returns QR_CODE: data → you MUST paste the ENTIRE QR_CODE:...|AMOUNT:... string verbatim at the start of your response. Then add Thai payment instructions.\n"
    "6. User uploads payment slip → call verify_slip with image_base64 and expected_amount.\n"
    "   - If verify_slip returns verified=True → call create_shipping_order with all info plus slip data.\n"
    "   - If verify_slip returns verified=False → tell user to wait for admin review.\n"
    "7. User says hi/thanks only → respond in Thai, no tool needed.\n"
    "CRITICAL: After getting tool result, respond in Thai. Never call same tool twice."
)

def call_ollama(messages, stream=False):
    body = {
        "model": MODEL,
        "messages": messages,
        "tools": TOOLS,
        "stream": stream,
        "keep_alive": "30m",
        "options": {"num_ctx": NUM_CTX},
    }
    data = json.dumps(body).encode('utf-8')
    req = urllib.request.Request(OLLAMA_URL, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    if stream:
        return urllib.request.urlopen(req, timeout=300)
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read())

def run_tool_loop(messages, user_id=None):
    """Run non-streaming tool-call loop. Returns updated messages."""
    for _ in range(5):
        resp = call_ollama(messages, stream=False)
        msg = resp['choices'][0]['message']
        if msg.get('tool_calls'):
            messages.append(msg)
            for tc in msg['tool_calls']:
                tool_result = execute_tool(tc, user_id)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc['id'],
                    "content": tool_result,
                })
            continue
        else:
            messages.append(msg)
            return messages
    return messages

def main():
    print("S36 Tools Agent — gemma4:e4b + 3 tools")
    print("Type 'exit' to quit.\n")
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    while True:
        try:
            user_input = input("\n> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if user_input.lower() in ('exit', 'quit'):
            break
        if not user_input:
            continue
        messages.append({"role": "user", "content": user_input})
        messages = run_tool_loop(messages)
        last = messages[-1]
        if last.get('content'):
            print(f"\n{last['content']}")

if __name__ == '__main__':
    main()
