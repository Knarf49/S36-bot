const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const QRCode = require('qrcode');
const promptpay = require('promptpay-qr');
const opentype = require('opentype.js');

const LOGO_PATH = path.join(__dirname, 'promptpay_logo.jpg');
const THAI_QR_LOGO_PATH = path.join(__dirname, 'Thai_QR_Payment_Logo.png');
const FONT_PATH = path.join(__dirname, 'Mitr-Regular.ttf');

let _font = null;
function getFont() {
  if (!_font) {
    _font = opentype.parse(fs.readFileSync(FONT_PATH));
  }
  return _font;
}

function drawText(ctx, text, x, y, size, opts) {
  const font = getFont();
  const p = font.getPath(text, x, y, size);
  p.fill = opts.fill || '#333333';
  p.draw(ctx);
}

function measureText(text, size) {
  const font = getFont();
  return font.getPath(text, 0, 0, size).getBoundingBox();
}

function sanitizeTarget(target) {
  return target.replace(/[^0-9]/g, '');
}

function formatPhoneDisplay(raw) {
  const s = sanitizeTarget(raw);
  if (s.length === 10 && s.startsWith('0')) {
    return s.slice(0, 3) + '-' + s.slice(3, 6) + '-' + s.slice(6);
  }
  return s;
}

function formatAmountDisplay(amount) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' บาท';
}

async function renderQR(payload) {
  const size = 250;
  const canvas = createCanvas(size, size);
  await QRCode.toCanvas(canvas, payload, {
    errorCorrectionLevel: 'M',
    width: size,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
  return canvas;
}

async function composeCard(qrCanvas, thaiQrLogoImg, logoImg, opts) {
  const W = 500;
  const H = opts.amount ? 760 : 730;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Card background with shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(12, 12, W - 24, H - 24);
  ctx.shadowColor = 'transparent';

  // Card border
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  // Thai QR Payment logo (top center) with full-width navy banner
  const thaiQrMaxW = 250;
  const thaiQrScale = Math.min(1, thaiQrMaxW / thaiQrLogoImg.width);
  const thaiQrW = thaiQrLogoImg.width * thaiQrScale;
  const thaiQrH = thaiQrLogoImg.height * thaiQrScale;
  const thaiQrX = Math.round((W - thaiQrW) / 2);
  const thaiQrY = 20;
  const bannerTop = 12;
  const bannerBottom = thaiQrY + thaiQrH + 8;

  ctx.fillStyle = '#0E3D67';
  ctx.fillRect(12, bannerTop, W - 24, bannerBottom - bannerTop);

  ctx.drawImage(thaiQrLogoImg, thaiQrX, thaiQrY, thaiQrW, thaiQrH);

  // PromptPay logo (below Thai QR logo)
  const logoMaxW = 250;
  const logoScale = Math.min(1, logoMaxW / logoImg.width);
  const logoW = logoImg.width * logoScale;
  const logoH = logoImg.height * logoScale;
  const logoX = Math.round((W - logoW) / 2);
  const logoY = bannerBottom + 12;
  ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

  // QR code (center, below logos)
  const qrSize = 250;
  const qrX = Math.round((W - qrSize) / 2);
  const qrY = logoY + logoH + 16;
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // Text labels (footer above phone)
  const textY = qrY + qrSize + 32;
  let lineY = textY;

  if (opts.amount) {
    const amtText = formatAmountDisplay(opts.amount);
    const amtBB = measureText(amtText, 24);
    drawText(ctx, amtText, Math.round((W - amtBB.x2 + amtBB.x1) / 2), lineY, 24, { fill: '#333333' });
    lineY += 30;
  }

  if (opts.brandFooterText) {
    const ftBB = measureText(opts.brandFooterText, 18);
    drawText(ctx, opts.brandFooterText, Math.round((W - ftBB.x2 + ftBB.x1) / 2), lineY, 18, { fill: '#0074D9' });
    lineY += 26;
  }

  const displayId = formatPhoneDisplay(opts.target);
  const idBB = measureText(displayId, 18);
  drawText(ctx, displayId, Math.round((W - idBB.x2 + idBB.x1) / 2), lineY, 18, { fill: '#333333' });

  return canvas;
}


async function generatePromptPayQrImage({ target, amount, brandFooterText }) {
  const clean = sanitizeTarget(target);
  if (!clean) {
    throw new Error('Invalid PromptPay target');
  }

  const payload = promptpay(clean, { amount });

  const [qrCanvas, thaiQrLogoImg, logoImg] = await Promise.all([
    renderQR(payload),
    loadImage(THAI_QR_LOGO_PATH),
    loadImage(LOGO_PATH),
  ]);

  const canvas = await composeCard(qrCanvas, thaiQrLogoImg, logoImg, {
    target: clean,
    amount: amount || null,
    brandFooterText: brandFooterText || 'S36 Post Shop',
  });

  return canvas.toBuffer('image/png');
}

async function generatePromptPayQrBase64({ target, amount, brandFooterText }) {
  const buf = await generatePromptPayQrImage({ target, amount, brandFooterText });
  return buf.toString('base64');
}

module.exports = {
  generatePromptPayQrImage,
  generatePromptPayQrBase64,
};
