# TwentyExpress Rate Calculator — Pricing Logic

Reverse-engineered via dimSum calibration + 60 test cases across 3 suites.

## Overview

All actual pricing is server-side PHP. Calculator replicates the logic client-side.

## 1. Dim Normalization

All input dims are ceil-rounded to .5 cm before calculation (conservative — never underquotes):

```js
function normalizeDim(cm) {
  return Math.ceil(cm * 2) / 2;
}
```

Side-weight tables calibrated at .5 boundaries — normalization ensures dims hit known calibration points.

## 2. Zones

| Zone | Provinces |
|------|-----------|
| `BKK_BKK` | กรุงเทพมหานคร, นนทบุรี, ปทุมธานี, สมุทรปราการ |
| `BKK_OTHER` | All other 72 provinces |

## 3. Rate Lookup

### Weight-based couriers (DPKERRY, DPTHAIPOST, DPSHOPEE)

```
lookup_key = weightKg <= 0.5 ? weightKg : ceil(weightKg)
```

Site uses bracket pricing: round up to next integer kg (preserve 0.5kg entry).

### Dim-based couriers (DPFLASHA, DPDHL, DPFLASHLIVEBULKY)

Two rate tables per courier × zone: `weight[]` (small dims) and `dim[]` (large dims).

Policy selection: `weight` when `FW == ceil(actual_weight)`, `dimension` when `FW > ceil(actual_weight)`.

Lookup key for weight-based: `ceil(weightKg)`. For dim-based: estimated `FW`.

## 4. Chargeable Weight (FW)

### Kerry (DPKERRY)
```
FW = ceil(actual_weight)       // ignores dimensions
```

### Thai Post (DPTHAIPOST)
```
FW = max(ceil(weightKg * 1000), vol_cm3)   // in grams
```
Volumetric divisor = 1 (cm³ as grams). Cost indexed by actual_weight, FW is display-only.

**Rejection:** Package rejected when `vol_cm3 > 60,000 cm³` (size exceeds courier limit). Returns `{ price: null, rejected: true }`.

### Shopee (DPSHOPEE)
```
FW = max(ceil(actual_weight), ceil(vol_cm3 / 5000))
```
Always weight-based pricing regardless of FW.

### Flash (DPFLASHA)
```
dimWt = ceil(vol_cm3 / 6000)
sideWt = flashSideWeight(dimSum)
FW = max(ceil(actual_weight), dimWt, sideWt)
```
Cost policy = dimension when FW > ceil(actual_weight).

### DHL (DPDHL)
```
sideWt = dhlSideWeight(dimSum)
FW = max(ceil(actual_weight), sideWt)    // no volumetric component
```
Cost policy = dimension when FW > ceil(actual_weight).

### Flash Bulky (DPFLASHLIVEBULKY)
```
sideWt = flashBulkySideWeight(dimSum)
  = dimSum >= 120 ? max(10, flashSideWeight(dimSum) - 3) : 0
FW = max(ceil(actual_weight), sideWt)
```
Cost policy = dimension when FW > ceil(actual_weight).
Min weight ~7kg. Uses Flash side-weight shifted down by 3 above dimSum 120, floored at 10.

## 5. Side-Weight Tables

Calibrated from direct `weight_side` field at .5 dimSum intervals.

### Flash side-weight (DPFLASHA)
| dimSum ≥ | sideWt |
|----------|--------|
| 135.5 | 17 |
| 131.5 | 16 |
| 125.5 | 15 |
| 121.5 | 14 |
| 115.5 | 13 |
| 112 | 12 |
| 105.5 | 11 |
| 100.5 | 10 |
| 95.5 | 9 |
| 90.5 | 8 |
| 85.5 | 7 |
| 81.5 | 6 |
| < 81.5 | 1 |

### DHL side-weight (DPDHL)
| dimSum ≥ | sideWt |
|----------|--------|
| 135.5 | 17 |
| 131.5 | 16 |
| 125.5 | 15 |
| 121.5 | 14 |
| 111.5 | 12 |
| 100.5 | 9 |
| 90.5 | 7 |
| 81.5 | 5 |
| < 81.5 | 1 |

### Flash Bulky side-weight (DPFLASHLIVEBULKY)
| dimSum ≥ | sideWt |
|----------|--------|
| 120 | max(10, Flash-3) |
| < 120 | 0 |

## 6. Interpolation

Linear interpolation between nearest rate table entries. Extrapolation below minimum and above maximum.

Exact match when `lookup_key` equals a table entry's `kg` value.

## 7. Gas Fee

Flat ฿3 for all couriers.

## 8. Markup Formula

```
profit = (price - cost) + gas_fee
```

## 9. Matching Accuracy (within ฿2)

3 test suites — 20 cases each, different dim styles:

| Suite | Dim style | Example | Accuracy |
|-------|-----------|---------|----------|
| V1 | Integer (clean) | 20×30×10, 35×45×25 | **97.2%** |
| V3 | .5 endings | 20.5×30.5×10.5, 35.5×45.5×25.5 | **93.6%** |
| V2 | Random decimals + normalize | 21.5×31.2×11.8, 33.8×43.5×23.7 | **90.1%** |

| Courier | V1 | V3 | V2 |
|---------|-----|-----|-----|
| Kerry | 20/20 | 20/20 | 19/20 |
| DHL | 20/20 | 20/20 | 20/20 |
| Shopee | 20/20 | 20/20 | 19/20 |
| Flash | 20/20 | 20/20 | 19/20 |
| Thai Post | 17/20† | 16/20† | 15/20† |
| FlashBulky | 7/7 | 6/9 | 8/11 |

† Remaining misses are rejected packages (vol > 60,000 cm³) — correctly detected by fallback.

## 10. API

```js
const { calculatePrice, compareAllCouriers, normalizeDim } = require('./rate_calculator.cjs');
```

### `normalizeDim(cm)`
Round up cm to nearest 0.5. Use before passing dims to calculator, or calculator auto-applies.

### `calculatePrice(opts)`
```js
{
  courier,      // 'DPKERRY' | 'DPTHAIPOST' | 'DPFLASHA' | 'DPSHOPEE' | 'DPDHL' | 'DPFLASHLIVEBULKY'
  province,     // Thai name e.g. 'เชียงใหม่'
  weightKg,     // actual weight in kg
  widthCm,      // box width in cm (auto-normalized to .5)
  lengthCm,     // box length in cm (auto-normalized to .5)
  heightCm,     // box height in cm (auto-normalized to .5)
  extraProfit,  // optional, default 0
}
```
Returns `{ price, _internal: {...} }` or `{ price: null, rejected: true, reason: '...' }` for Thai Post oversized.

### `compareAllCouriers(opts)`
Same opts, returns array sorted cheapest first. Skips rejected couriers.

## 11. Limitations

- Rate tables built from scrape data at 0.5,1,2,3,4,5,6,7,8,9,10,12,15 kg. Non-scraped weights use interpolation — approximate.
- Dim normalization (ceil to .5) is conservative — may overestimate ฿10-11 at side-weight boundaries (~1 case per 20).
- FlashBulky dim table sparse (FW=10,12 only). Non-standard dimSum ranges may have errors.
- Calculator does not account for COD fees, insurance, or remote area surcharges (all 0 in scrape data).
