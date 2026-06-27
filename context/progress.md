# Progress Log

## 2026-06-27 — PromptPay QR Generator (Node.js)

### Created

- `promptpay_qr.cjs` — Branded PromptPay QR image generator. Template compositor: PromptPay logo + 250×250 QR (EC M) + ID/amount labels + footer on white card with shadow. Dual export: PNG buffer + base64.
  - Payload: `promptpay-qr` npm (EMVCo TLV + CRC16, auto-detects phone/tax-ID/e-wallet)
  - QR rendering: `qrcode` npm (error correction M, 250px)
  - Compositing: `canvas` npm v3 (rounded card, shadow, text, logo, QR overlay)
  - Font: Mitr (Google Fonts) on Linux/Docker, Leelawadee UI on Windows
  - Logo: from PromptPay/promptpay.github.io reference repo
  - Platform-aware font selection (registerFont non-functional on Windows Cairo)
- `context/architecture.md` — QR generation section in architecture doc
- `context/progress.md` — This file

### Modified

- `package.json` — Added `promptpay-qr`, `qrcode`, `canvas`
- `Dockerfile` — Added canvas system deps (cairo, pango, jpeg, giflib, librsvg) + COPY for QR module/assets
- `S36_bot/promptpay_logo.jpg` — Replaced with reference repo version

### Assets downloaded
- `promptpay_logo.jpg` (9KB) from PromptPay/promptpay.github.io
- `Mitr-Regular.ttf` (222KB) from Google Fonts (Thai subset)

### Known limitation
- Windows: `registerFont` with Cairo/GDI fails for non-system fonts. Falls back to Leelawadee UI (system Thai font). Warning suppresed via platform check.
- Linux/Docker: Mitr font works correctly via fontconfig + registerFont.
