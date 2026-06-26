"""
tools_agent.py — AI tools bound to gemma4:e4b via Ollama
3 tools: shipping_fee_calculator, check_schedule, get_shipping_status
Pattern: raw Ollama /v1/chat/completions tool-call loop (no browser-use)
"""

import json
import math
import os
import sys
import urllib.request
from datetime import datetime, timezone

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_URL = f"{OLLAMA_HOST}/v1/chat/completions"
OLLAMA_NATIVE_URL = f"{OLLAMA_HOST}/api/chat"
DASHBOARD_URL = os.getenv("ORDER_API_URL", "http://localhost:8000")
MODEL = "gemma4:e4b"
NUM_CTX = 32000

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
            "name": "create_shipping_order",
            "description": (
                "Create a shipping order in the dashboard. Call when user confirms they want to send a package, "
                "agrees to a courier/price, or says something like 'ok send it'."
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
                        "description": "Pickup address — the sender's address where courier picks up the package. Must ask user for this (ที่อยู่คนส่ง)."
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
                },
                "required": ["customer_name", "customer_phone", "pickup_address", "delivery_province", "receiver_name", "receiver_phone", "weight_kg", "courier_code", "courier_name", "price"],
            },
        },
    },
]

# ═══════════════════════════════════════════════════════════════════
# 6. Tool execution dispatch
# ═══════════════════════════════════════════════════════════════════

def execute_tool(tool_call):
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
            return (
                f"สร้างออเดอร์สำเร็จ!\n"
                f"เลขออเดอร์: {result['id']}\n"
                f"ปลายทาง: {body['delivery_province']} | {body['weight_kg']} kg\n"
                f"ขนส่ง: {body['courier_name']} | ราคา: {body['price']} บาท\n"
                f"ผู้รับ: {body['receiver_name']} | {body['receiver_phone']}\n"
                f"สถานะ: {result.get('status', 'ยังไม่ได้กรอกลงระบบ')}"
            )
        except Exception as e:
            return f"สร้างออเดอร์ไม่สำเร็จ: {e}"
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
    "4. User confirms courier choice or wants to create order → call create_shipping_order.\n"
    "   - Use delivery_province and weight_kg from previous shipping_fee_calculator call.\n"
    "   - Use courier_code, courier_name, price from user's selected courier.\n"
    "   - You MUST collect ALL of these from user before calling tool:\n"
    "     customer_name (ชื่อผู้ส่ง), customer_phone (เบอร์ผู้ส่ง),\n"
    "     pickup_address (ที่อยู่คนส่ง), receiver_name (ชื่อผู้รับ),\n"
    "     receiver_phone (เบอร์ผู้รับ).\n"
    "   - Ask for all missing fields in one message.\n"
    "5. User says hi/thanks only → respond in Thai, no tool needed.\n"
    "CRITICAL: After getting tool result, respond in Thai. Never call same tool twice."
)

def call_ollama(messages, stream=False):
    body = {
        "model": MODEL,
        "messages": messages,
        "tools": TOOLS,
        "stream": stream,
        "options": {"num_ctx": NUM_CTX},
    }
    data = json.dumps(body).encode('utf-8')
    req = urllib.request.Request(OLLAMA_URL, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    if stream:
        return urllib.request.urlopen(req, timeout=120)
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read())

def run_tool_loop(messages):
    """Run non-streaming tool-call loop. Returns updated messages."""
    for _ in range(5):
        resp = call_ollama(messages, stream=False)
        msg = resp['choices'][0]['message']
        if msg.get('tool_calls'):
            messages.append(msg)
            for tc in msg['tool_calls']:
                tool_result = execute_tool(tc)
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
