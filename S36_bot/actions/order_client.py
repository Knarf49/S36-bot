import os
import re
import urllib.request
import json

ORDER_API_URL = os.environ.get('ORDER_API_URL', 'http://localhost:8000')

PATTERN_PHONE = re.compile(r'0\d{8,9}')

COURIER_ALIASES = {
    'kerry': 'DPKERRY', 'เคอรี่': 'DPKERRY', 'เคร์รี่': 'DPKERRY', 'เคอรี่': 'DPKERRY',
    'flash': 'DPFLASHA', 'แฟลช': 'DPFLASHA',
    'ไปรษณีย์': 'DPTHAIPOST', 'ไปรษณีย์ไทย': 'DPTHAIPOST', 'ปณ': 'DPTHAIPOST', 'post': 'DPTHAIPOST',
    'shopee': 'DPSHOPEE', 'ช้อปปี้': 'DPSHOPEE', 'ชอปปี้': 'DPSHOPEE',
    'dhl': 'DPDHL',
    'bulky': 'DPFLASHLIVEBULKY', 'บัลกี้': 'DPFLASHLIVEBULKY', 'flash bulky': 'DPFLASHLIVEBULKY',
}

COURIER_NAMES = {
    'DPKERRY': 'Kerry', 'DPTHAIPOST': 'ไปรษณีย์ไทย',
    'DPFLASHA': 'Flash', 'DPSHOPEE': 'Shopee',
    'DPDHL': 'DHL', 'DPFLASHLIVEBULKY': 'Flash Bulky',
}

STATUS_EMOJI = {
    'ยังไม่ได้กรอกลงระบบ': '📝',
    'ยังไม่ส่ง': '📦',
    'กำลังจัดส่ง': '🚚',
    'ส่งถึงแล้ว': '✅',
}


def extract_courier(text):
    t = text.lower().strip()
    if t in COURIER_ALIASES:
        return COURIER_ALIASES[t]
    for alias, code in COURIER_ALIASES.items():
        if alias in t:
            return code
    return None


def extract_phones(text):
    return PATTERN_PHONE.findall(text)


def create_order(data):
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(
        f'{ORDER_API_URL}/api/orders',
        data=body,
        headers={'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return None


def lookup_orders(q):
    url = f'{ORDER_API_URL}/api/public/order-lookup?q={urllib.parse.quote(q)}'
    try:
        with urllib.request.urlopen(url, timeout=5) as resp:
            return json.loads(resp.read())
    except Exception as e:
        return []


def lookup_order_by_id(order_id):
    return lookup_orders(order_id)


def lookup_orders_by_phone(phone):
    return lookup_orders(phone)
