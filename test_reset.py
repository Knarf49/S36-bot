from session_state import is_reset_command, is_bulk_command, reset_session, get_session

print('=== Reset patterns ===')
tests = [
    'ทำรายการใหม่', 'ขอรายการใหม่', 'สั่งใหม่', 'เริ่มใหม่', 'เริ่มใหม่ค่ะ', 'เริ่มใหม่ครับ',
    'ยกเลิก', 'ล้าง', 'ลบ', 'เคลียร์', 'รีเซ็ต',
    'ทำใหม่อีกที', 'ขอใหม่อีกทีครับ', 'เอาใหม่', 'ใหม่อีกที',
    'cancel', 'reset', 'clear', 'restart', 'new order', 'new',
    'cancel order please', 'reset session', 'clear chat',
    'want to start a new order', 'need new', 'start fresh',
    'ขอทำรายการใหม่', 'ขอสั่งใหม่', 'ขอเริ่มใหม่',
    'เริ่มต้นใหม่', 'เริ่มต้นใหม่จ้า', 'ขอรายการใหม่',
    'ลืมหมดแล้ว', 'ลืมแล้ว',
    'ใหม่นะ', 'ใหม่เลย', 'ใหม่ครับ',
    # NOT reset
    'ส่งของ', 'เชียงใหม่ 2kg', 'Shopee', 'ผู้ส่ง: test',
]
for t in tests:
    ok = is_reset_command(t)
    if ok:
        print('  [RESET]', t)

print()
print('=== Bulk patterns ===')
bulk_tests = [
    'ส่งของทีเดียวหลายชิ้น', 'ส่งหลายชิ้นทีเดียว', 'หลายกล่องส่งทีเดียว',
    'สั่งของหลายอัน', 'ส่งทีเดียวหลายรายการ', 'ส่งของทีเดียว',
    'ship multiple packages', 'bulk order', 'multi shipment',
    'ค่าส่งหลายชิ้น', 'เหมาส่งของ', 'ยกมาหลายกล่องส่งทีเดียว',
    'ส่งของหลายชิ้นพร้อมกัน',
    # NOT bulk
    'ส่งของ', 'เชียงใหม่ 2kg', 'Shopee', 'ยกเลิก',
]
for t in bulk_tests:
    ok = is_bulk_command(t)
    if ok:
        print('  [BULK]', t)

print()
print('=== Session reset test ===')
s = get_session('test2')
s.stage = __import__('session_state').Stage.AWAIT_PAYMENT
s.selected_courier = 'DPKERRY'
s.sender = 'test'
print('before:', s.stage.name, s.selected_courier)
s2 = reset_session('test2')
print('after:', s2.stage.name, s2.selected_courier)
