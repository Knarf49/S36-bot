import sys
from session_state import Session, parse_info_fields, needs_qr, Stage

s = Session()
s.stage = Stage.COLLECT_INFO
s.selected_courier = 'DPSHOPEE'
s.quoted_prices = {'DPSHOPEE': 70}

text = "ผู้ส่ง: ปรียานุช เพชรรัตน์ | 086-123-9876\nผู้รับ: ณัฐวุฒิ มั่นคง | 099-456-7890\nที่อยู่คนส่ง: 12/34 ปทุมธานี 12130\nที่อยู่คนรับ: 45/3 เชียงใหม่ 26586"

parse_info_fields(text, s)
print('sender:', repr(s.sender))
print('receiver:', repr(s.receiver))
print('sender_addr:', repr(s.sender_addr))
print('receiver_addr:', repr(s.receiver_addr))
print('sender_phone:', repr(s.sender_phone))
print('receiver_phone:', repr(s.receiver_phone))
print('needs_qr:', needs_qr(s))
