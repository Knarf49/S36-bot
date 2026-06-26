import math

BKK_BKK_PROVINCES = {
    'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ',
}

VOL_DIVISOR = {
    'DPKERRY': float('inf'),
    'DPTHAIPOST': 1,
    'DPFLASHA': 6000,
    'DPSHOPEE': 5000,
    'DPDHL': 5000,
    'DPFLASHLIVEBULKY': float('inf'),
}

RATE_TABLE = {
    'DPKERRY': {
        'BKK_BKK': {
            'weight': [
                {'kg': 0.5, 'cost': 33, 'price': 45},
                {'kg': 1, 'cost': 36, 'price': 45},
                {'kg': 2, 'cost': 40, 'price': 50},
                {'kg': 3, 'cost': 45, 'price': 60},
                {'kg': 4, 'cost': 58, 'price': 70},
                {'kg': 5, 'cost': 76, 'price': 85},
                {'kg': 6, 'cost': 83, 'price': 95},
                {'kg': 7, 'cost': 88, 'price': 105},
                {'kg': 8, 'cost': 99, 'price': 120},
                {'kg': 9, 'cost': 111, 'price': 125},
                {'kg': 10, 'cost': 122, 'price': 135},
                {'kg': 12, 'cost': 146, 'price': 155},
                {'kg': 15, 'cost': 184, 'price': 195},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'kg': 0.5, 'cost': 33, 'price': 45},
                {'kg': 1, 'cost': 36, 'price': 45},
                {'kg': 2, 'cost': 47, 'price': 60},
                {'kg': 3, 'cost': 52, 'price': 70},
                {'kg': 4, 'cost': 63, 'price': 85},
                {'kg': 5, 'cost': 81, 'price': 95},
                {'kg': 6, 'cost': 88, 'price': 105},
                {'kg': 7, 'cost': 98, 'price': 120},
                {'kg': 8, 'cost': 108, 'price': 135},
                {'kg': 9, 'cost': 118, 'price': 145},
                {'kg': 10, 'cost': 131, 'price': 155},
                {'kg': 12, 'cost': 154, 'price': 175},
                {'kg': 15, 'cost': 193, 'price': 210},
            ],
        },
    },
    'DPTHAIPOST': {
        'BKK_BKK': {
            'weight': [
                {'kg': 0.5, 'cost': 30, 'price': 40},
                {'kg': 1, 'cost': 36, 'price': 45},
                {'kg': 2, 'cost': 44, 'price': 57},
                {'kg': 3, 'cost': 57, 'price': 75},
                {'kg': 4, 'cost': 66, 'price': 89},
                {'kg': 5, 'cost': 79, 'price': 97},
                {'kg': 6, 'cost': 96, 'price': 135},
                {'kg': 7, 'cost': 108, 'price': 145},
                {'kg': 8, 'cost': 120, 'price': 155},
                {'kg': 9, 'cost': 132, 'price': 165},
                {'kg': 10, 'cost': 147, 'price': 175},
                {'kg': 12, 'cost': 180, 'price': 235},
                {'kg': 15, 'cost': 220, 'price': 265},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'kg': 0.5, 'cost': 30, 'price': 40},
                {'kg': 1, 'cost': 36, 'price': 45},
                {'kg': 2, 'cost': 44, 'price': 57},
                {'kg': 3, 'cost': 57, 'price': 75},
                {'kg': 4, 'cost': 66, 'price': 89},
                {'kg': 5, 'cost': 79, 'price': 97},
                {'kg': 6, 'cost': 96, 'price': 135},
                {'kg': 7, 'cost': 108, 'price': 145},
                {'kg': 8, 'cost': 120, 'price': 155},
                {'kg': 9, 'cost': 132, 'price': 165},
                {'kg': 10, 'cost': 147, 'price': 175},
                {'kg': 12, 'cost': 180, 'price': 235},
                {'kg': 15, 'cost': 220, 'price': 265},
            ],
        },
    },
    'DPFLASHA': {
        'BKK_BKK': {
            'weight': [
                {'kg': 0.5, 'cost': 28, 'price': 35},
                {'kg': 1, 'cost': 31, 'price': 35},
                {'kg': 2, 'cost': 35, 'price': 40},
                {'kg': 3, 'cost': 41, 'price': 46},
                {'kg': 4, 'cost': 57, 'price': 63},
                {'kg': 5, 'cost': 92, 'price': 99},
                {'kg': 6, 'cost': 80, 'price': 89},
                {'kg': 7, 'cost': 89, 'price': 99},
                {'kg': 8, 'cost': 103, 'price': 120},
                {'kg': 9, 'cost': 113, 'price': 131},
                {'kg': 12, 'cost': 160, 'price': 183},
                {'kg': 15, 'cost': 190, 'price': 216},
            ],
            'dim': [
                {'kg': 6, 'cost': 80, 'price': 89},
                {'kg': 7, 'cost': 89, 'price': 99},
                {'kg': 8, 'cost': 103, 'price': 120},
                {'kg': 9, 'cost': 113, 'price': 131},
                {'kg': 10, 'cost': 130, 'price': 150},
                {'kg': 11, 'cost': 150, 'price': 172},
                {'kg': 12, 'cost': 160, 'price': 183},
                {'kg': 13, 'cost': 170, 'price': 194},
                {'kg': 14, 'cost': 180, 'price': 205},
                {'kg': 15, 'cost': 190, 'price': 216},
                {'kg': 16, 'cost': 205, 'price': 233},
                {'kg': 17, 'cost': 215, 'price': 244},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'kg': 0.5, 'cost': 28, 'price': 35},
                {'kg': 1, 'cost': 31, 'price': 35},
                {'kg': 2, 'cost': 35, 'price': 40},
                {'kg': 3, 'cost': 41, 'price': 46},
                {'kg': 4, 'cost': 61, 'price': 66},
                {'kg': 5, 'cost': 92, 'price': 99},
                {'kg': 6, 'cost': 80, 'price': 89},
                {'kg': 7, 'cost': 89, 'price': 99},
                {'kg': 8, 'cost': 103, 'price': 120},
                {'kg': 9, 'cost': 113, 'price': 131},
                {'kg': 12, 'cost': 160, 'price': 183},
                {'kg': 15, 'cost': 190, 'price': 216},
            ],
            'dim': [
                {'kg': 6, 'cost': 80, 'price': 89},
                {'kg': 7, 'cost': 89, 'price': 99},
                {'kg': 8, 'cost': 103, 'price': 120},
                {'kg': 9, 'cost': 113, 'price': 131},
                {'kg': 10, 'cost': 130, 'price': 150},
                {'kg': 11, 'cost': 150, 'price': 172},
                {'kg': 12, 'cost': 160, 'price': 183},
                {'kg': 13, 'cost': 170, 'price': 194},
                {'kg': 14, 'cost': 180, 'price': 205},
                {'kg': 15, 'cost': 190, 'price': 216},
                {'kg': 16, 'cost': 205, 'price': 233},
                {'kg': 17, 'cost': 215, 'price': 244},
            ],
        },
    },
    'DPSHOPEE': {
        'BKK_BKK': {
            'weight': [
                {'kg': 0.5, 'cost': 24, 'price': 30},
                {'kg': 1, 'cost': 27, 'price': 30},
                {'kg': 2, 'cost': 30, 'price': 38},
                {'kg': 3, 'cost': 34, 'price': 43},
                {'kg': 4, 'cost': 46, 'price': 58},
                {'kg': 5, 'cost': 55, 'price': 65},
                {'kg': 6, 'cost': 58, 'price': 73},
                {'kg': 7, 'cost': 66, 'price': 83},
                {'kg': 8, 'cost': 84, 'price': 102},
                {'kg': 9, 'cost': 90, 'price': 110},
                {'kg': 10, 'cost': 101, 'price': 120},
                {'kg': 12, 'cost': 115, 'price': 137},
                {'kg': 15, 'cost': 154, 'price': 168},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'kg': 0.5, 'cost': 35, 'price': 40},
                {'kg': 1, 'cost': 38, 'price': 40},
                {'kg': 2, 'cost': 39, 'price': 45},
                {'kg': 3, 'cost': 41, 'price': 47},
                {'kg': 4, 'cost': 46, 'price': 58},
                {'kg': 5, 'cost': 55, 'price': 65},
                {'kg': 6, 'cost': 58, 'price': 73},
                {'kg': 7, 'cost': 66, 'price': 83},
                {'kg': 8, 'cost': 81, 'price': 102},
                {'kg': 9, 'cost': 88, 'price': 110},
                {'kg': 10, 'cost': 99, 'price': 120},
                {'kg': 12, 'cost': 117, 'price': 137},
                {'kg': 15, 'cost': 143, 'price': 163},
            ],
        },
    },
    'DPDHL': {
        'BKK_BKK': {
            'weight': [
                {'kg': 0.5, 'cost': 30, 'price': 35},
                {'kg': 1, 'cost': 33, 'price': 35},
                {'kg': 2, 'cost': 36, 'price': 41},
                {'kg': 3, 'cost': 41, 'price': 48},
                {'kg': 4, 'cost': 45, 'price': 58},
                {'kg': 5, 'cost': 51, 'price': 60},
                {'kg': 6, 'cost': 71, 'price': 76},
                {'kg': 7, 'cost': 76, 'price': 85},
                {'kg': 8, 'cost': 81, 'price': 92},
                {'kg': 9, 'cost': 88, 'price': 99},
                {'kg': 12, 'cost': 104, 'price': 119},
                {'kg': 15, 'cost': 119, 'price': 135},
            ],
            'dim': [
                {'kg': 5, 'cost': 46, 'price': 57},
                {'kg': 7, 'cost': 76, 'price': 85},
                {'kg': 9, 'cost': 88, 'price': 99},
                {'kg': 12, 'cost': 104, 'price': 119},
                {'kg': 14, 'cost': 114, 'price': 129},
                {'kg': 15, 'cost': 119, 'price': 135},
                {'kg': 16, 'cost': 135, 'price': 145},
                {'kg': 17, 'cost': 150, 'price': 162},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'kg': 0.5, 'cost': 30, 'price': 35},
                {'kg': 1, 'cost': 33, 'price': 35},
                {'kg': 2, 'cost': 44, 'price': 49},
                {'kg': 3, 'cost': 48, 'price': 56},
                {'kg': 4, 'cost': 52, 'price': 61},
                {'kg': 5, 'cost': 58, 'price': 67},
                {'kg': 6, 'cost': 88, 'price': 95},
                {'kg': 7, 'cost': 92, 'price': 99},
                {'kg': 8, 'cost': 97, 'price': 105},
                {'kg': 9, 'cost': 105, 'price': 110},
                {'kg': 12, 'cost': 129, 'price': 137},
                {'kg': 15, 'cost': 150, 'price': 159},
            ],
            'dim': [
                {'kg': 5, 'cost': 55, 'price': 67},
                {'kg': 7, 'cost': 92, 'price': 99},
                {'kg': 9, 'cost': 105, 'price': 110},
                {'kg': 12, 'cost': 129, 'price': 137},
                {'kg': 14, 'cost': 143, 'price': 152},
                {'kg': 15, 'cost': 150, 'price': 159},
                {'kg': 16, 'cost': 171, 'price': 182},
                {'kg': 17, 'cost': 176, 'price': 187},
            ],
        },
    },
    'DPFLASHLIVEBULKY': {
        'BKK_BKK': {
            'weight': [
                {'kg': 6, 'cost': 60, 'price': 60},
                {'kg': 7, 'cost': 62, 'price': 70},
                {'kg': 8, 'cost': 72, 'price': 80},
                {'kg': 9, 'cost': 82, 'price': 90},
                {'kg': 10, 'cost': 95, 'price': 100},
                {'kg': 12, 'cost': 112, 'price': 120},
                {'kg': 15, 'cost': 142, 'price': 150},
            ],
            'dim': [
                {'kg': 10, 'cost': 92, 'price': 100},
                {'kg': 12, 'cost': 112, 'price': 120},
            ],
        },
        'BKK_OTHER': {
            'weight': [
                {'kg': 6, 'cost': 60, 'price': 60},
                {'kg': 7, 'cost': 62, 'price': 70},
                {'kg': 8, 'cost': 72, 'price': 80},
                {'kg': 9, 'cost': 82, 'price': 90},
                {'kg': 10, 'cost': 95, 'price': 100},
                {'kg': 12, 'cost': 112, 'price': 120},
                {'kg': 15, 'cost': 142, 'price': 150},
            ],
            'dim': [
                {'kg': 10, 'cost': 92, 'price': 100},
                {'kg': 12, 'cost': 112, 'price': 120},
            ],
        },
    },
}

def get_zone(province):
    return 'BKK_BKK' if province in BKK_BKK_PROVINCES else 'BKK_OTHER'

def _compute_volumetric_weight(courier, vol_cm3):
    div = VOL_DIVISOR[courier]
    if div == float('inf') or not math.isfinite(div):
        return 1
    if courier == 'DPTHAIPOST':
        return vol_cm3
    return math.ceil(vol_cm3 / div)

def compute_chargeable_weight(courier, weight_kg, w_cm, l_cm, h_cm):
    vol_cm3 = w_cm * l_cm * h_cm
    if courier == 'DPTHAIPOST':
        return max(math.ceil(weight_kg * 1000), vol_cm3)
    actual_ceil = math.ceil(weight_kg)
    dim_wt = _compute_volumetric_weight(courier, vol_cm3)
    return max(actual_ceil, dim_wt)

def _estimate_weight_side(courier, dim_sum):
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
            return max(10, _estimate_weight_side('DPFLASHA', dim_sum) - 3)
        return 0
    return 1

def _compute_chargeable_with_side(courier, weight_kg, w_cm, l_cm, h_cm):
    vol_cm3 = w_cm * l_cm * h_cm
    if courier == 'DPTHAIPOST':
        return max(math.ceil(weight_kg * 1000), vol_cm3) / 1000
    actual_ceil = math.ceil(weight_kg)
    dim_sum = w_cm + l_cm + h_cm
    side_wt = _estimate_weight_side(courier, dim_sum)
    if courier in ('DPDHL', 'DPFLASHLIVEBULKY'):
        return max(actual_ceil, side_wt)
    dim_wt = _compute_volumetric_weight(courier, vol_cm3)
    return max(actual_ceil, dim_wt, side_wt)

def _predict_policy(courier, weight_kg, w_cm, l_cm, h_cm):
    if courier in ('DPKERRY', 'DPTHAIPOST', 'DPSHOPEE'):
        return 'weight'
    vol_cm3 = w_cm * l_cm * h_cm
    dim_sum = w_cm + l_cm + h_cm
    actual_ceil = math.ceil(weight_kg)
    if courier == 'DPFLASHLIVEBULKY':
        side_wt = _estimate_weight_side('DPFLASHLIVEBULKY', dim_sum)
        est_fw = max(actual_ceil, side_wt)
        return 'dimension' if est_fw > actual_ceil else 'weight'
    if courier == 'DPFLASHA':
        dim_wt = math.ceil(vol_cm3 / 6000)
        side_wt = _estimate_weight_side(courier, dim_sum)
        est_fw = max(actual_ceil, dim_wt, side_wt)
    else:
        side_wt = _estimate_weight_side(courier, dim_sum)
        est_fw = max(actual_ceil, side_wt)
        return 'dimension' if est_fw > actual_ceil else 'weight'
    return 'dimension' if est_fw > actual_ceil else 'weight'

def _interpolate(rows, target_kg):
    if not rows:
        return None
    sorted_rows = sorted(rows, key=lambda x: x['kg'])
    n = len(sorted_rows)
    first = sorted_rows[0]
    last = sorted_rows[n - 1]
    if target_kg == first['kg']:
        return {'cost': first['cost'], 'price': first['price'], 'exact': True}
    if target_kg == last['kg']:
        return {'cost': last['cost'], 'price': last['price'], 'exact': True}
    if target_kg < first['kg']:
        if n == 1:
            return {'cost': first['cost'], 'price': first['price'], 'exact': False}
        a, b = sorted_rows[0], sorted_rows[1]
        ratio = (b['cost'] - a['cost']) / (b['kg'] - a['kg'])
        cost = a['cost'] - ratio * (a['kg'] - target_kg)
        pratio = (b['price'] - a['price']) / (b['kg'] - a['kg'])
        price = a['price'] - pratio * (a['kg'] - target_kg)
        return {'cost': round(max(0, cost), 2), 'price': round(max(0, price), 2), 'exact': False}
    if target_kg > last['kg']:
        if n == 1:
            return {'cost': last['cost'], 'price': last['price'], 'exact': False}
        a, b = sorted_rows[n - 2], sorted_rows[n - 1]
        ratio = (b['cost'] - a['cost']) / (b['kg'] - a['kg'])
        cost = b['cost'] + ratio * (target_kg - b['kg'])
        pratio = (b['price'] - a['price']) / (b['kg'] - a['kg'])
        price = b['price'] + pratio * (target_kg - b['kg'])
        return {'cost': round(cost, 2), 'price': round(price, 2), 'exact': False}
    for i in range(n - 1):
        a, b = sorted_rows[i], sorted_rows[i + 1]
        if a['kg'] <= target_kg <= b['kg']:
            if target_kg == a['kg']:
                return {'cost': a['cost'], 'price': a['price'], 'exact': True}
            if target_kg == b['kg']:
                return {'cost': b['cost'], 'price': b['price'], 'exact': True}
            frac = (target_kg - a['kg']) / (b['kg'] - a['kg'])
            return {
                'cost': round(a['cost'] + (b['cost'] - a['cost']) * frac, 2),
                'price': round(a['price'] + (b['price'] - a['price']) * frac, 2),
                'exact': False,
            }
    return None

def _normalize_dim(cm):
    return math.ceil(cm * 2) / 2

def calculate_price(courier, province, weight_kg, width_cm, length_cm, height_cm, extra_profit=0):
    w = _normalize_dim(width_cm)
    l = _normalize_dim(length_cm)
    h = _normalize_dim(height_cm)

    if courier == 'DPTHAIPOST':
        vol_cm3 = w * l * h
        if vol_cm3 > 60000:
            return {
                'price': None,
                'rejected': True,
                'reason': 'ขนาดเกินกำหนดไปรษณีย์ไทย (ปริมาตร > 60,000 cm³)',
                '_internal': {
                    'courier': courier, 'province': province,
                    'vol_cm3': vol_cm3,
                    'dim_raw': {'w': width_cm, 'l': length_cm, 'h': height_cm},
                    'dim_norm': {'w': w, 'l': l, 'h': h},
                },
            }

    zone = get_zone(province)
    ct = RATE_TABLE.get(courier)
    if not ct:
        raise ValueError('Unknown courier: ' + courier)
    zone_table = ct.get(zone)
    if not zone_table:
        raise ValueError('No rate data for ' + courier + ' in zone ' + zone)

    chargeable_weight = compute_chargeable_weight(courier, weight_kg, w, l, h)
    chargeable_weight_kg = chargeable_weight / 1000 if courier == 'DPTHAIPOST' else chargeable_weight

    policy = _predict_policy(courier, weight_kg, w, l, h)

    if policy == 'weight' or 'dim' not in zone_table:
        rate_rows = zone_table['weight']
        lookup_key = weight_kg if weight_kg <= 0.5 else math.ceil(weight_kg)
    else:
        rate_rows = zone_table['dim']
        est_fw = _compute_chargeable_with_side(courier, weight_kg, w, l, h)
        lookup_key = est_fw

    if not rate_rows:
        raise ValueError('No rate table for policy=' + policy)

    lookup = _interpolate(rate_rows, lookup_key)
    if not lookup:
        raise ValueError('Could not determine rate')

    gas_fee = 3
    base_price = lookup['price']
    final_price = base_price + extra_profit

    return {
        'price': final_price,
        'rejected': False,
        '_internal': {
            'courier': courier, 'province': province, 'zone': zone,
            'weight_kg_actual': weight_kg,
            'dim_raw': {'w': width_cm, 'l': length_cm, 'h': height_cm},
            'dim_norm': {'w': w, 'l': l, 'h': h},
            'vol_cm3': w * l * h,
            'chargeable_weight_kg': chargeable_weight_kg,
            'chargeable_weight_raw': chargeable_weight,
            'cost_policies_predicted': policy,
            'lookup_key': lookup_key,
            'cost': lookup['cost'],
            'gas_fee': gas_fee,
            'platform_markup': base_price - lookup['cost'],
            'extra_profit': extra_profit,
            'base_price': base_price,
            'final_price': final_price,
            'interpolated': not lookup['exact'],
        },
    }

def compare_all_couriers(province, weight_kg, width_cm, length_cm, height_cm, extra_profit=0):
    results = []
    for courier in RATE_TABLE:
        if courier == 'DPFLASHLIVEBULKY' and weight_kg < 6:
            continue
        r = calculate_price(courier, province, weight_kg, width_cm, length_cm, height_cm, extra_profit)
        r['courier'] = courier
        results.append(r)
    results.sort(key=lambda x: x.get('price') or 0)
    return results
