'use strict';
const express = require('express');
const line = require('@line/bot-sdk');
const df = require('@google-cloud/dialogflow');
const { compareAllCouriers } = require('./rate_calculator.cjs');

const PROJECT_ID = process.env.PROJECT_ID;
if (!PROJECT_ID) { console.error('Missing PROJECT_ID env var'); process.exit(1); }

const LINE_CONFIG = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const sessionsClient = new df.SessionsClient();
const lineClient = new line.Client(LINE_CONFIG);
const app = express();

// ── Opening hours ──────────────────────────────────────────────
const HOURS = {
  mon_fri: { open: 9, close: 18 },
  sat_sun: { open: 9, close: 17 },
};

function isOpen() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const hour = now.getHours();
  const min = now.getMinutes();
  const t = hour + min / 60;

  const isWeekday = day >= 1 && day <= 5;
  const range = isWeekday ? HOURS.mon_fri : HOURS.sat_sun;
  const open = t >= range.open && t < range.close;
  const dayName = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][day];
  const ts = String(hour).padStart(2,'0') + ':' + String(min).padStart(2,'0');

  return { open, dayName, timeStr: ts, range };
}

// ── Dialogflow ──────────────────────────────────────────────────
async function detectIntent(sessionId, text) {
  const sessionPath = sessionsClient.projectAgentSessionPath(PROJECT_ID, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: { text, languageCode: 'th' },
    },
  };
  const [response] = await sessionsClient.detectIntent(request);
  return response.queryResult;
}

// ── Province name normalization ─────────────────────────────────
// All 76 provinces from scrape_all_provinces.js PROVINCES array
const ALL_PROVINCES = new Set([
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา',
  'ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด',
  'ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี',
  'นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี',
  'พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่',
  'ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง',
  'ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร',
  'สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี',
  'สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง',
  'อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี','อำนาจเจริญ'
]);

const PROVINCE_SYNONYMS = {
  'กทม': 'กรุงเทพมหานคร',
  'กรุงเทพ': 'กรุงเทพมหานคร',
  'โคราช': 'นครราชสีมา',
  'ปากน้ำ': 'สมุทรปราการ',
  'หัวหิน': 'ประจวบคีรีขันธ์',
  'นครศรี': 'นครศรีธรรมราช',
  'สุราษฎร์': 'สุราษฎร์ธานี',
  'อุบล': 'อุบลราชธานี',
  'อุดร': 'อุดรธานี',
  'หาดใหญ่': 'สงขลา',
  'พัทยา': 'ชลบุรี',
};

function normalizeProvince(raw) {
  if (!raw) return null;
  const input = raw.trim();
  // Direct match
  if (ALL_PROVINCES.has(input)) return input;
  // Synonym match
  if (PROVINCE_SYNONYMS[input]) return PROVINCE_SYNONYMS[input];
  // Case-insensitive / partial match
  const lower = input.toLowerCase();
  for (const p of ALL_PROVINCES) {
    if (p.toLowerCase() === lower) return p;
  }
  for (const [syn, canonical] of Object.entries(PROVINCE_SYNONYMS)) {
    if (syn.toLowerCase() === lower) return canonical;
  }
  // Fuzzy: starts with or contains
  for (const p of ALL_PROVINCES) {
    if (p.includes(input) || input.includes(p)) return p;
  }
  return null;
}
const COURIER_NAMES = {
  DPKERRY: 'Kerry',
  DPTHAIPOST: 'ไปรษณีย์ไทย',
  DPFLASHA: 'Flash',
  DPSHOPEE: 'Shopee',
  DPDHL: 'DHL',
  DPFLASHLIVEBULKY: 'Flash Bulky',
};

// ── Default dims per weight (from scrape_all_provinces.js testWeights) ──
const DEFAULT_DIMS = [
  { gram: 500, dim: { w: 15, l: 20, h: 10 } },
  { gram: 1000, dim: { w: 20, l: 30, h: 10 } },
  { gram: 5000, dim: { w: 30, l: 40, h: 20 } },
  { gram: 10000, dim: { w: 40, l: 50, h: 30 } },
];

function getDefaultDims(weightKg) {
  const g = weightKg * 1000;
  const match = DEFAULT_DIMS.find(d => Math.abs(d.gram - g) < 1);
  if (match) return match.dim;
  // fallback: scale approximate dims
  return { w: 20, l: 30, h: 10 * Math.max(1, Math.ceil(weightKg)) };
}

// ── Intent handlers ─────────────────────────────────────────────
function handleCheckTime() {
  const { open, dayName, timeStr, range } = isOpen();
  const closeStr = String(range.close).padStart(2, '0') + ':00';
  if (open) {
    return `ขณะนี้ (${dayName} ${timeStr} น.) ร้านเปิดอยู่ค่ะ ปิด ${closeStr} น.`;
  }
  return `ขณะนี้ (${dayName} ${timeStr} น.) ร้านปิดแล้วค่ะ เปิดอีกที${dayName === 'เสาร์' || dayName === 'อาทิตย์' ? 'วันจันทร์' : 'พรุ่งนี้'} 09:00 น.`;
}

function handleTellTime() {
  return 'ร้านเปิด จันทร์-ศุกร์ 09:00-18:00 น.\nเสาร์-อาทิตย์ 09:00-17:00 น.';
}

function handleShipping(parameters) {
  const params = parameters?.fields || {};
  // @sys.address may return structValue with city/admin components, or just stringValue
  let rawProvince = params.province?.stringValue;
  if (!rawProvince && params.province?.structValue?.fields?.city) {
    rawProvince = params.province.structValue.fields.city.stringValue;
  }

  const weight = params.weight?.numberValue;
  const length = params.length?.numberValue;
  const width = params.width?.numberValue;
  const height = params.height?.numberValue;

  if (!rawProvince && !weight) {
    return 'กรุณาระบุปลายทางและน้ำหนักครับ เช่น "ส่งของไปเชียงใหม่ 5 กิโล"';
  }
  if (!rawProvince) {
    return 'กรุณาระบุปลายทางจังหวัดครับ';
  }
  if (!weight) {
    return 'กรุณาระบุน้ำหนักกี่กิโลกรัมครับ';
  }

  const province = normalizeProvince(rawProvince);
  if (!province) {
    return `ไม่พบจังหวัด "${rawProvince}" กรุณาระบุชื่อจังหวัดให้ถูกต้องครับ`;
  }

  const dims = (width && length && height)
    ? { widthCm: width, lengthCm: length, heightCm: height }
    : getDefaultDims(weight);

  const results = compareAllCouriers({
    province,
    weightKg: weight,
    ...dims,
    extraProfit: 0,
  });

  const lines = results.map(r => {
    const name = COURIER_NAMES[r.courier] || r.courier;
    if (r.rejected) return `- ${name}: ❌ ${r.reason}`;
    return `- ${name}: ${r.price} บาท`;
  });

  const provinceDisplay = province !== rawProvince ? `${province} (${rawProvince})` : province;
  return `ค่าส่งไป${provinceDisplay} ${weight} kg\n${lines.join('\n')}`;
}

// ── LINE webhook ────────────────────────────────────────────────
app.post('/line', line.middleware(LINE_CONFIG), async (req, res) => {
  // Acknowledge immediately
  res.status(200).end();

  const events = req.body.events;
  if (!events) return;

  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') continue;

    const userId = event.source.userId;
    const text = event.message.text;

    try {
      const queryResult = await detectIntent(userId, text);
      const intent = queryResult.intent?.displayName;

      let reply;

      if (intent === 'ส่งของ') {
        reply = handleShipping(queryResult.parameters);
      } else if (intent === 'เช็คเวลาเปิด') {
        reply = handleCheckTime();
      } else if (intent === 'แจ้งเวลาเปิด') {
        reply = handleTellTime();
      } else {
        reply = queryResult.fulfillmentText || 'ขอโทษค่ะ ไม่เข้าใจคำถาม กรุณาลองอีกครั้ง';
      }

      await lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: reply,
      });
    } catch (err) {
      console.error('Error processing message:', err.message);
      try {
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: 'เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลังค่ะ',
        });
      } catch (e2) {
        console.error('Reply error:', e2.message);
      }
    }
  }
});

// ── Health check ────────────────────────────────────────────────
app.get('/health', (_req, res) => res.send('OK'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('S36 bot server on port', PORT));
