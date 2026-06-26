import re
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from datetime import datetime
from .rate_calculator import compare_all_couriers
from .order_client import (
    COURIER_ALIASES, COURIER_NAMES, STATUS_EMOJI,
    extract_courier, extract_phones,
    create_order as api_create_order,
    lookup_order_by_id, lookup_orders_by_phone,
)

ALL_PROVINCES = {
    'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
    'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร',
    'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม',
    'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
    'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี',
    'ปัตตานี', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี',
    'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
    'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี',
    'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล',
    'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
    'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู',
    'อ่างทอง', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี', 'อำนาจเจริญ',
}

PROVINCE_ALIASES = {
    'กทม': 'กรุงเทพมหานคร', 'กรุงเทพ': 'กรุงเทพมหานคร',
    'โคราช': 'นครราชสีมา', 'ปากน้ำ': 'สมุทรปราการ',
    'หัวหิน': 'ประจวบคีรีขันธ์', 'นครศรี': 'นครศรีธรรมราช',
    'สุราษฎร์': 'สุราษฎร์ธานี', 'อุบล': 'อุบลราชธานี',
    'อุดร': 'อุดรธานี', 'หาดใหญ่': 'สงขลา', 'พัทยา': 'ชลบุรี',
}

SCHEDULE = {
    'M': {'open': 9, 'close': 18},
    'W': {'open': 9, 'close': 17},
}
DAY_NAMES = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']

def norm_province(raw):
    if not raw:
        return None
    inp = raw.strip()
    if inp in ALL_PROVINCES:
        return inp
    if inp in PROVINCE_ALIASES:
        return PROVINCE_ALIASES[inp]
    lower = inp.lower()
    for p in ALL_PROVINCES:
        if p.lower() == lower:
            return p
    for alias, full in PROVINCE_ALIASES.items():
        if alias.lower() == lower:
            return full
    for p in ALL_PROVINCES:
        if inp in p or p in inp:
            return p
    return None

def def_dim(weight_kg):
    g = weight_kg * 1000
    if g <= 500:
        return {'w': 15, 'l': 20, 'h': 10}
    if g <= 1000:
        return {'w': 20, 'l': 30, 'h': 10}
    if g <= 5000:
        return {'w': 30, 'l': 40, 'h': 20}
    return {'w': 40, 'l': 50, 'h': 30}

def is_open():
    now = datetime.now()
    d = now.weekday()
    h = now.hour
    m = now.minute
    t = h + m / 60
    is_weekday = 0 <= d <= 4
    day_idx = (d + 1) % 7
    rule = SCHEDULE['M'] if is_weekday else SCHEDULE['W']
    open_now = rule['open'] <= t < rule['close']
    day_name = DAY_NAMES[day_idx]
    ts = f'{h:02d}:{m:02d}'
    return {'open': open_now, 'day_name': day_name, 'time': ts, 'rule': rule}

class ActionCalculateShipping(Action):
    def name(self) -> Text:
        return "action_calculate_shipping"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        province_raw = tracker.get_slot('province')
        weight_raw = tracker.get_slot('weight')

        if not province_raw:
            dispatcher.utter_message(text='กรุณาระบุปลายทางจังหวัดครับ')
            return []
        if not weight_raw:
            dispatcher.utter_message(text='กรุณาระบุน้ำหนักกี่กิโลกรัมครับ')
            return []

        prov = norm_province(str(province_raw))
        if not prov:
            dispatcher.utter_message(text=f'ไม่พบจังหวัด "{province_raw}" ครับ')
            return []

        try:
            w = float(weight_raw)
        except (ValueError, TypeError):
            dispatcher.utter_message(text='น้ำหนักไม่ถูกต้องครับ')
            return []

        dim = def_dim(w)
        results = compare_all_couriers(prov, w, dim['w'], dim['l'], dim['h'])

        lines = []
        for r in results:
            name = COURIER_NAMES.get(r['courier'], r['courier'])
            if r['rejected']:
                lines.append(f"- {name}: ❌ {r['reason']}")
            else:
                lines.append(f"- {name}: {r['price']} บาท")

        dsp = f'{prov} ({province_raw})' if prov != str(province_raw) else prov
        text = f'ค่าส่งไป{dsp} {w} kg\n' + '\n'.join(lines)
        text += '\n\nอยากได้ขนส่งไหนครับ?'

        dispatcher.utter_message(text=text)
        return [SlotSet('order_stage', 'awaiting_courier')]

class ActionCheckOpen(Action):
    def name(self) -> Text:
        return "action_check_open"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        o = is_open()
        cs = f'{o["rule"]["close"]:02d}:00'
        if o['open']:
            text = f'ขณะนี้ ({o["day_name"]} {o["time"]} น.) ร้านเปิดอยู่ค่ะ ปิด {cs} น.'
        else:
            next_day = 'วันจันทร์' if o['day_name'] in ('เสาร์', 'อาทิตย์') else 'พรุ่งนี้'
            text = f'ขณะนี้ ({o["day_name"]} {o["time"]} น.) ร้านปิดแล้วค่ะ เปิดอีกที{next_day} 09:00 น.'
        dispatcher.utter_message(text=text)
        return []

class ActionTellSchedule(Action):
    def name(self) -> Text:
        return "action_tell_schedule"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        text = 'ร้านเปิด จันทร์-ศุกร์ 09:00-18:00 น.\nเสาร์-อาทิตย์ 09:00-17:00 น.'
        dispatcher.utter_message(text=text)
        return []


def parse_sender_from_text(text, courier_code=None):
    text = text.strip()

    if courier_code:
        for alias, code in COURIER_ALIASES.items():
            if text.lower().startswith(alias):
                text = text[len(alias):].strip()
                break

    phones = extract_phones(text)
    if not phones:
        return {'name': text, 'phone': '', 'address': ''}

    first_phone = phones[0]
    idx = text.index(first_phone)

    name = text[:idx].strip()
    address = text[idx + len(first_phone):].strip()

    return {'name': name, 'phone': first_phone, 'address': address}


class ActionOrderFollowup(Action):
    def name(self) -> Text:
        return "action_order_followup"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        stage = tracker.get_slot('order_stage') or ''
        msg = tracker.latest_message.get('text', '').strip()
        events = []

        courier_ent = tracker.get_slot('courier')
        sender_phone_ent = tracker.get_slot('sender_phone')
        sender_name_ent = tracker.get_slot('sender_name')
        sender_address_ent = tracker.get_slot('sender_address')
        receiver_name_ent = tracker.get_slot('receiver_name')
        receiver_phone_ent = tracker.get_slot('receiver_phone')

        courier_code = extract_courier(courier_ent or msg)
        parsed = parse_sender_from_text(msg, courier_code)

        province = tracker.get_slot('province')
        weight = tracker.get_slot('weight')

        if stage == '':
            if not province or not weight:
                dispatcher.utter_message(response='utter_send_status_shipping')
                return []
            stage = 'awaiting_courier'

        if stage == 'awaiting_courier':
            if not courier_code:
                dispatcher.utter_message(response='utter_ask_courier')
                return [SlotSet('order_stage', 'awaiting_courier')]

            w = float(weight or 0)
            if courier_code == 'DPFLASHLIVEBULKY' and w < 6:
                dispatcher.utter_message(text='Flash Bulky ใช้กับของหนักตั้งแต่ 6 kg ขึ้นไปครับ รบกวนเลือกขนส่งอื่นครับ')
                return [SlotSet('order_stage', 'awaiting_courier')]

            cname = COURIER_NAMES.get(courier_code, courier_code)
            events.append(SlotSet('last_courier', courier_code))

            prov = norm_province(str(province or ''))
            dim = def_dim(w)
            results = compare_all_couriers(prov, w, dim['w'], dim['l'], dim['h'])
            price = 0
            for r in results:
                if r['courier'] == courier_code and not r.get('rejected'):
                    price = r['price']
                    break
            events.append(SlotSet('last_price', str(price)))

            has_phone_in_msg = parsed.get('phone') or sender_phone_ent
            new_sname = parsed.get('name') or sender_name_ent or ''
            new_sphone = parsed.get('phone') or sender_phone_ent or ''
            new_saddr = parsed.get('address') or sender_address_ent or ''
            events.append(SlotSet('sender_name', new_sname))
            events.append(SlotSet('sender_phone', new_sphone))
            events.append(SlotSet('sender_address', new_saddr))
            if has_phone_in_msg:
                dispatcher.utter_message(
                    text=f'เลือก {cname} ครับ\nรบกวนแจ้งชื่อ-เบอร์โทรผู้รับครับ\nตัวอย่าง: มานี 0891234567'
                )
                events.append(SlotSet('order_stage', 'awaiting_receiver'))
                return events

            dispatcher.utter_message(
                text=f'เลือก {cname} ครับ\nรบกวนแจ้งข้อมูลผู้ส่ง: ชื่อ-เบอร์โทร-ที่อยู่รับของครับ\nตัวอย่าง: สมชาย 0812345678 123/4 บางกะปิ กรุงเทพ'
            )
            events.append(SlotSet('order_stage', 'awaiting_sender'))
            return events

        if stage == 'awaiting_sender':
            prev_name = sender_name_ent or ''
            prev_phone = sender_phone_ent or ''
            prev_address = sender_address_ent or ''

            has_phone = parsed.get('phone')

            if has_phone:
                new_name = parsed.get('name') or prev_name
                new_phone = parsed.get('phone') or prev_phone
                new_address = parsed.get('address') or prev_address
            elif prev_name and prev_phone:
                new_name = prev_name
                new_phone = prev_phone
                new_address = parsed.get('name') or prev_address
            else:
                new_name = parsed.get('name') or prev_name
                new_phone = parsed.get('phone') or prev_phone
                new_address = parsed.get('address') or prev_address

            events.append(SlotSet('sender_name', new_name))
            events.append(SlotSet('sender_phone', new_phone))
            events.append(SlotSet('sender_address', new_address))

            missing = []
            if not new_name:
                missing.append('ชื่อ')
            if not new_phone:
                missing.append('เบอร์โทร')
            if not new_address:
                missing.append('ที่อยู่')

            if not missing:
                dispatcher.utter_message(text='รับทราบครับ รบกวนแจ้งชื่อ-เบอร์โทรผู้รับครับ\nตัวอย่าง: มานี 0891234567')
                events.append(SlotSet('order_stage', 'awaiting_receiver'))
            else:
                joined = ', '.join(missing)
                dispatcher.utter_message(
                    text=f'ยังขาด {joined} ครับ รบกวนระบุเพิ่ม\nตัวอย่าง: {"สมชาย 0812345678 123/4 บางกะปิ กรุงเทพ"}'
                )
            return events

        if stage == 'awaiting_receiver':
            prev_rname = receiver_name_ent or ''
            prev_rphone = receiver_phone_ent or ''

            new_rname = parsed.get('name') or prev_rname
            new_rphone = parsed.get('phone') or prev_rphone

            events.append(SlotSet('receiver_name', new_rname))
            events.append(SlotSet('receiver_phone', new_rphone))

            if not new_rphone:
                dispatcher.utter_message(text='ยังไม่พบเบอร์โทรผู้รับครับ รบกวนระบุอีกครั้ง')
                return events

            courier_code = tracker.get_slot('last_courier')
            if not courier_code:
                courier_code = extract_courier(msg)
                if courier_code:
                    events.append(SlotSet('last_courier', courier_code))

            if not courier_code:
                dispatcher.utter_message(text='ไม่พบข้อมูลขนส่งครับ กรุณาลองใหม่อีกครั้ง')
                return [SlotSet('order_stage', 'awaiting_courier')]

            order_data = {
                'customer_name': tracker.get_slot('sender_name') or '',
                'customer_phone': tracker.get_slot('sender_phone') or '',
                'pickup_address': tracker.get_slot('sender_address') or '',
                'delivery_province': norm_province(str(province or '')) or str(province or ''),
                'receiver_name': new_rname,
                'receiver_phone': new_rphone,
                'weight_kg': float(weight) if weight else 0,
                'courier_code': courier_code,
                'courier_name': COURIER_NAMES.get(courier_code, courier_code),
                'price': float(tracker.get_slot('last_price') or 0),
            }

            result = api_create_order(order_data)
            if not result:
                dispatcher.utter_message(text='ขออภัยครับ สร้างออเดอร์ไม่สำเร็จ กรุณาลองใหม่')
                return [SlotSet('order_stage', '')]

            order_id = result.get('id', '')
            cname = result.get('courier_name', '')
            price = result.get('price', 0)
            prov_name = order_data['delivery_province']

            text = (
                f'✅ สร้างออเดอร์ #{order_id}\n'
                f'📦 ส่งไป: {prov_name} | {cname} | {price} บาท\n'
                f'🔍 เช็คสถานะ: "เช็ค {order_id}" หรือถาม "ของถึงยัง" ได้ครับ'
            )
            dispatcher.utter_message(text=text)
            events.append(SlotSet('order_id', order_id))
            events.append(SlotSet('order_stage', ''))
            return events

        return []


class ActionCheckOrderStatus(Action):
    def name(self) -> Text:
        return "action_check_order_status"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        order_id = tracker.get_slot('order_id')
        sender_phone = tracker.get_slot('sender_phone')
        msg = tracker.latest_message.get('text', '').strip()

        if not order_id and not sender_phone:
            phones = extract_phones(msg)
            if phones:
                sender_phone = phones[0]

            last_order_id = tracker.get_slot('order_id')
            if not last_order_id and not sender_phone:
                dispatcher.utter_message(text='กรุณาระบุเลขออเดอร์หรือเบอร์โทรครับ\nตัวอย่าง: "เช็ค KERRY260625163045" หรือ "ของถึงยัง 0812345678"')
                return []

            if last_order_id:
                order_id = last_order_id

        results = None
        lookup_key = order_id or sender_phone

        if order_id:
            results = lookup_order_by_id(order_id)
        elif sender_phone:
            results = lookup_orders_by_phone(sender_phone)

        if not results:
            dispatcher.utter_message(text=f'ไม่พบออเดอร์ {lookup_key} ครับ\nอาจยังไม่ได้สร้าง หรือลองตรวจสอบเลขออเดอร์อีกครั้ง')
            return []

        if len(results) == 1:
            o = results[0]
        else:
            o = results[0]

        emoji = STATUS_EMOJI.get(o['status'], '')
        text = (
            f'#{o["id"]}\n'
            f'📦 ปลายทาง: {o["delivery_province"]} | {o["courier_name"]} | {o["price"]} บาท\n'
            f'สถานะ: {emoji} {o["status"]}'
        )
        if o.get('tracking_number'):
            text += f'\n🔍 Tracking: {o["tracking_number"]}'

        dispatcher.utter_message(text=text)
        return []
