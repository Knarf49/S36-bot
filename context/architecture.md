# Architecture — TwentyExpress Rate Scraper

## Payment / QR Generation

### PromptPay QR Generator (`promptpay_qr.cjs`)

Node.js image-generation utility that produces branded PromptPay QR codes as PNG buffers. Composable: logo + QR code + ID/amount labels + optional footer — returns finished image ready for LINE/TikTok chatbot delivery.

**Stack:** `promptpay-qr` (EMVCo payload), `qrcode` (QR rendering), `canvas` (image compositing).

**Entry points:**
- `generatePromptPayQrImage(opts)` → `Promise<Buffer>` (PNG buffer)
- `generatePromptPayQrBase64(opts)` → `Promise<string>` (base64)

**Options:**
```js
{ target: string, amount?: number, brandFooterText?: string }
```

**Template:** 500×650px white card with shadow, PromptPay logo (from reference repo), 250×250 QR (error correction M), ID label, amount (optional), footer (optional). Font: Mitr (Linux/Docker) / Leelawadee UI (Windows).

**Payload:** Delegated to `promptpay-qr` npm package — auto-detects phone/tax-ID/e-wallet, formats target per EMVCo spec, generates TLV + CRC16 payload. Static QR when no amount provided (customer enters amount in banking app).

**Dual QR systems exist:**
| System | File | Stack | Usage |
|--------|------|-------|-------|
| Node.js | `promptpay_qr.cjs` | node-canvas + qrcode + promptpay-qr | Standalone utility, Node.js LINE bot |
| Python | `tools_agent.py:502` | PIL + qrcode + pyzbar | Rasa LINE bot (line_bot.py) |

Python generator uses hand-rolled TLV/CRC16, error correction L, DejaVuSans fallback (no Thai glyphs). Node.js version improves: library-based payload, error correction M, Thai font support, branded template.

### Docker

**Main Dockerfile (`Dockerfile`):** Node.js LINE bot (server.js + Dialogflow). Updated with canvas system deps (cairo, pango, jpeg, giflib, librsvg) for QR generation support.

**S36_bot Dockerfile.line:** Python LINE bot — uses its own `generate_promptpay_qr_base64` from `tools_agent.py`. No canvas/Node.js dep needed.

### Assets

| File | Source | Purpose |
|------|--------|---------|
| `promptpay_logo.jpg` | `PromptPay/promptpay.github.io` repo | Logo for QR card (Node.js module + Python bot) |
| `Mitr-Regular.ttf` | Google Fonts | Thai font for QR card text (Linux/Docker). Windows falls back to Leelawadee UI |
| `S36_bot/promptpay_logo.jpg` | Same as above | Copied for Python LINE bot docker build |
