import sys
sys.path.insert(0, 'C:\\20scrape')
from tools_agent import calculate_price, get_extra_profit

print('=== tools_agent.py Profit Tier Verification ===')
for g, name in [(50, '<100g'), (200, '101-500g'), (700, '501-900g'), (1500, '1-2kg'), (2500, '2.01-3kg'), (3500, '3.01-4kg'), (5000, '>4.1kg')]:
    ep = get_extra_profit(g)
    r = calculate_price('DPKERRY', 'เชียงใหม่', g/1000, 20, 30, 10)
    print(f'{name:14s} weight:{g:5d}g  extra_profit:{ep:3d}  price:{r.get("price",0):.0f}')

print()
print('=== Flash 5kg (with extra profit auto) ===')
r = calculate_price('DPFLASHA', 'เชียงใหม่', 5, 30, 40, 20)
print('Flash 5kg -> Chiang Mai: price=' + str(r.get('price')) + ' extra_profit=' + str(r.get('extra_profit')))

print()
print('=== Kerry 1kg (default auto) ===')
r = calculate_price('DPKERRY', 'เชียงใหม่', 1, 20, 30, 10)
print('Kerry 1kg -> Chiang Mai: price=' + str(r.get('price')) + ' extra=' + str(r.get('extra_profit', 0)))
