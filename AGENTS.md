# AGENTS.md — TwentyExpress Rate Scraper

Scrapes shipping rate data from `app.twentyexpress.com/order/create-order` across all Thai provinces and couriers, outputting `rates_full.xlsx`.

## Quick Start

```powershell
# 1. Get fresh session cookies from Edge DevTools (see below)
# 2. Paste cookies into scrape_all_provinces.js lines ~195-199
# 3. Run scrape (5-10 min)
node scrape_all_provinces.js
# 4. Generate xlsx
node make_xlsx2.cjs
```

## Auth: Session Cookies Required

Site uses Laravel session + CSRF. Cookies expire fast (~30 min). Get fresh ones:

1. Open Edge → `https://app.twentyexpress.com` → log in
2. F12 → Application tab → Cookies → `app.twentyexpress.com`
3. Copy `XSRF-TOKEN` (unencoded) and `twentyexpress_session` values
4. Paste into `scrape_all_provinces.js` cookies array (lines ~195-199)

`document.cookie` can't read `twentyexpress_session` — it's HttpOnly. Must get from DevTools.

## Key Files

| File | Purpose |
|------|---------|
| `scrape_all_provinces.js` | Main scraper — hits `/order/compare-price` for 76 provinces × 3 weights |
| `make_xlsx2.cjs` | Reads `rates_all_provinces.json` → generates `rates_full.xlsx` with Thai headers |
| `calculator_logic.md` | Full pricing logic documentation — zones, FW formulas, side-weight tables, accuracy |
| `rate_calculator.cjs` | Pricing calculator — reverse-engineered from scrape data. Use for ALL rate queries |
| `rates_all_provinces.json` | Intermediate — raw scraped data (input to xlsx generator) |
| `rates_full.xlsx` | Final output — 4 sheets (Full Data, Pivot 1kg/5kg/10kg) |

Other `.js` files are debug/one-off scripts. Ignore unless debugging a specific issue.

## Architecture

- **No server** — pure Node.js scripts using Playwright (Chromium) for browser automation
- Dependencies: `playwright`, `exceljs`
- Not a package/app — just scrape scripts, no tests, no lint, no CI

## API Endpoint: `/order/compare-price`

- **Method:** GET with query string (jQuery `$.getJSON`)
- **Input:** form data from `#createOrderForm` serialized + `_token` (CSRF)
- **Output:** JSON array — one object per available courier
- **Key fields:** `courier_code`, `cost`, `price`, `profit`, `shipping_type`, `all_weight.final_weight`, `getRemote.remote_area`, `gas_fee`

## Data Gotchas

- **DPTHAIPOST (ไปรษณีย์ไทย) returns `final_weight` in grams** — all other couriers use kg. `make_xlsx2.cjs` normalizes this into `final_weight_kg` column.
- **`shipping_type`** is zone, not courier: `BKK_BKK` = ในเขต, `BKK_OTHER` = ข้ามเขต
- **Only 6 active couriers:** DPKERRY, DPTHAIPOST, DPFLASHA, DPSHOPEE, DPDHL, DPFLASHLIVEBULKY
- **Province list has 76 entries** (not 77) — some merged/renamed. Check `PROVINCES` array if province count matters.
- **Address validation** — site validates sub_district/district/province/zipcode via `/address/check-area`. Invalid addresses may return empty results.
- **COD fees and insurance** are 0 in all scraped data — `cod_amount` and insurance checkbox were not set during scrape.

## Adding/Updating Provinces

Edit `PROVINCES` array in `scrape_all_provinces.js`. Each entry needs valid Thai address data:
```js
{ th: 'ชื่อจังหวัด', sub: 'ตำบล', dist: 'อำเภอ', zip: 'รหัสไปรษณีย์' }
```

## Adding More Weight Points

Edit `testWeights` array in `scrape_all_provinces.js`:
```js
{ gram: 1000, dim: { w: 20, l: 30, h: 10 } }
```

Must include `dim` (width/length/height in cm) — site requires all dimension fields.

## Querying Rates

Always use `rate_calculator.cjs` — NOT raw `rates_all_provinces.json` lookup.

### Single courier

```powershell
node -e "const {calculatePrice}=require('./rate_calculator.cjs'); const r=calculatePrice({courier:'DPKERRY',province:'เชียงใหม่',weightKg:1.3,widthCm:21,lengthCm:30,heightCm:21,extraProfit:0}); console.log('price:',r.price,'บาท'); console.log(JSON.stringify(r._internal,null,2))"
```

### Compare all couriers (cheapest first)

```powershell
node -e "const {compareAllCouriers}=require('./rate_calculator.cjs'); compareAllCouriers({province:'เชียงใหม่',weightKg:1.3,widthCm:21,lengthCm:30,heightCm:21}).forEach(r=>console.log(r.courier,'\t',r.price,'บาท'))"
```

### Calculator API

```js
const { calculatePrice, compareAllCouriers } = require('./rate_calculator.cjs');
```

**`calculatePrice(opts)`** — single courier:
- `courier` — courier code (see below)
- `province` — Thai province name (determines BKK_BKK vs BKK_OTHER zone)
- `weightKg` — actual weight in kg
- `widthCm, lengthCm, heightCm` — box dimensions in cm
- `extraProfit` — hidden additional profit (default 0)

Returns `{ price }` for customer, `{ _internal: { cost, chargeable_weight_kg, platform_markup, extra_profit, ... } }` for internal use. `_internal.interpolated` true when rate estimated between known data points.

**`compareAllCouriers(opts)`** — all couriers, sorted cheapest first.

### Courier codes

| Code | ชื่อ |
|------|------|
| DPKERRY | Kerry |
| DPTHAIPOST | ไปรษณีย์ไทย |
| DPFLASHA | Flash |
| DPSHOPEE | Shopee |
| DPDHL | DHL |
| DPFLASHLIVEBULKY | Flash Bulky |

### Pricing algorithm (reverse-engineered)

- **Zone-based, not province-based.** Cost = f(courier, zone, chargeable_weight). All provinces in same zone pay same rate.
- **BKK_BKK zones:** กรุงเทพมหานคร, นนทบุรี, ปทุมธานี, สมุทรปราการ. All others = BKK_OTHER.
- **Chargeable weight** = max(actual_ceil, volumetric). Volumetric divisor varies per courier:
  - Kerry, Flash Bulky: ignores dims
  - Thai Post: vol_cm³ as grams (divisor=1)
  - Flash: vol/6000
  - Shopee, DHL: vol/5000
- **Gas fee:** 3 baht flat, all couriers.
- **Markup formula:** `profit = (price - cost) + gas_fee`
- Rate tables have 3 exact weight points (1kg/5kg/10kg). Between points = linear interpolation. Outside range = linear extrapolation. Interpolated results less accurate.

### Scrape raw data (only when rate_calculator can't answer)

```powershell
node -e "const d=require('./rates_all_provinces.json'); const r=d.filter(x=>x.destination==='<ชื่อจังหวัด>' && x.courier_code==='<CODE>'); console.log(JSON.stringify(r,null,2))"
```

### Limitation

Calculator rate tables built from 76 provinces × 3 weights (1kg/5kg/10kg) with fixed box dims per weight. Interpolation covers gaps but is approximate. For exact rates at non-standard weights/dims, scrape fresh.

## Gemma Gradio UI

- `gemma_gradio.py` — Gradio chat UI with streaming (Docker container, port 7860)
- `tools_agent.py` — shared tool definitions + OpenAI-format `call_ollama` (non-streaming). Uses `/v1/chat/completions`. Also exports `OLLAMA_NATIVE_URL` for streaming.
- `Dockerfile.gemma` — builds gemma-ui Docker image
- `OLLAMA_HOST` env var controls Ollama URL (default `http://localhost:11434`, set to `http://host.docker.internal:11434` inside Docker)
- **Do NOT auto-start/stop the server.** Tell user to start/stop it via `docker compose up/down`.
