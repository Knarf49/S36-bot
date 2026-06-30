import sys, io
sys.path.insert(0, 'C:\\20scrape')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from session_state import Session, parse_info_fields, needs_qr, build_state_block, Stage

print('=== Receiver Address Test 1: Full parse from text ===')
s = Session()
s.stage = Stage.COLLECT_INFO
s.selected_courier = 'DPKERRY'
s.quoted_prices = {'DPKERRY': 85}

text = 'somchai 0811111111 123/4 bkk somying 0822222222 456/7 cm'
parse_info_fields(text, s)
print('After parse:')
print('  sender=' + str(s.sender))
print('  sender_phone=' + str(s.sender_phone))
print('  sender_addr=' + str(s.sender_addr))
print('  receiver=' + str(s.receiver))
print('  receiver_phone=' + str(s.receiver_phone))
print('  receiver_addr=' + str(s.receiver_addr))
print('  needs_qr=' + str(needs_qr(s)))

print()
print('=== Test 2: Direct field set, verify needs_qr ===')
s2 = Session()
s2.stage = Stage.COLLECT_INFO
s2.selected_courier = 'DPKERRY'
s2.quoted_prices = {'DPKERRY': 85}
s2.sender = 'somchai'
s2.receiver = 'somying'
s2.sender_addr = '123/4 bkk'

print('With sender+receiver+sender_addr only: needs_qr=' + str(needs_qr(s2)) + ' (False - missing receiver_addr)')

s2.receiver_addr = '456/7 cm'
print('With receiver_addr added: needs_qr=' + str(needs_qr(s2)) + ' (True)')

print()
print('=== Test 3: State block includes receiver_addr ===')
print(build_state_block(s2))
