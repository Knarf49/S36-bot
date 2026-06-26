'use strict';
const df = require('@google-cloud/dialogflow');
const { compareAllCouriers } = require('./rate_calculator.cjs');

const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';
const sessionsClient = new df.SessionsClient();

// ── Opening hours ──────────────────────────────────────────────
const HOURS = { mon_fri: { open: 9, close: 18 }, sat_sun: { open: 9, close: 17 } };

function isOpen() {
  const now = new Date();
  const day = now.getDay();
  const h = now.getHours(), m = now.getMinutes(), t = h + m / 60;
  const wk = day >= 1 && day <= 5;
  const range = wk ? HOURS.mon_fri : HOURS.sat_sun;
  const open = t >= range.open && t < range.close;
  const dn = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][day];
  const ts = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
  return { open, dayName: dn, timeStr: ts, range };
}

// ── Province normalization ─────────────────────────────────────
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
  'กทม':'กรุงเทพมหานคร','กรุงเทพ':'กรุงเทพมหานคร','โคราช':'นครราชสีมา',
  'ปากน้ำ':'สมุทรปราการ','หัวหิน':'ประจวบคีรีขันธ์','นครศรี':'นครศรีธรรมราช',
  'สุราษฎร์':'สุราษฎร์ธานี','อุบล':'อุบลราชธานี','อุดร':'อุดรธานี',
  'หาดใหญ่':'สงขลา','พัทยา':'ชลบุรี',
};

const COURIER_NAMES = { DPKERRY:'Kerry', DPTHAIPOST:'ไปรษณีย์ไทย', DPFLASHA:'Flash', DPSHOPEE:'Shopee', DPDHL:'DHL', DPFLASHLIVEBULKY:'Flash Bulky' };

function normalizeProvince(raw) {
  if (!raw) return null;
  const input = raw.trim();
  if (ALL_PROVINCES.has(input)) return input;
  if (PROVINCE_SYNONYMS[input]) return PROVINCE_SYNONYMS[input];
  for (const p of ALL_PROVINCES) { if (p.toLowerCase() === input.toLowerCase()) return p; }
  for (const [s, c] of Object.entries(PROVINCE_SYNONYMS)) { if (s.toLowerCase() === input.toLowerCase()) return c; }
  for (const p of ALL_PROVINCES) { if (p.includes(input) || input.includes(p)) return p; }
  return null;
}

// ── Test runners ────────────────────────────────────────────────
async function detectIntent(sid, text) {
  const [r] = await sessionsClient.detectIntent({
    session: sessionsClient.projectAgentSessionPath(PROJECT_ID, sid),
    queryInput: { text: { text, languageCode: 'th' } },
  });
  return r.queryResult;
}

async function test(msg) {
  const qr = await detectIntent('test-' + Date.now(), msg);
  const intent = qr.intent?.displayName;
  const params = qr.parameters?.fields || {};
  let reply;

  if (intent === 'ส่งของ') {
    const raw = params.province?.stringValue;
    const w = params.weight?.numberValue;
    if (!raw && !w) reply = 'กรุณาระบุปลายทางและน้ำหนักครับ';
    else if (!raw) reply = 'กรุณาระบุปลายทางจังหวัดครับ';
    else if (!w) reply = 'กรุณาระบุน้ำหนักกี่กิโลกรัมครับ';
    else {
      const prov = normalizeProvince(raw);
      if (!prov) reply = `ไม่พบจังหวัด "${raw}"`;
      else {
        const results = compareAllCouriers({ province: prov, weightKg: w, widthCm: 20, lengthCm: 30, heightCm: 10 });
        reply = results.map(r => `${COURIER_NAMES[r.courier]}: ${r.price} บาท`).join(', ');
      }
    }
  } else if (intent === 'เช็คเวลาเปิด') {
    const { open, dayName, timeStr, range } = isOpen();
    reply = open ? `เปิดอยู่ ปิด ${range.close}:00` : 'ปิดแล้ว';
  } else if (intent === 'แจ้งเวลาเปิด') {
    reply = 'จ-ศ 09:00-18:00, ส-อา 09:00-17:00';
  } else {
    reply = qr.fulfillmentText || '(fallback)';
  }

  console.log(`[${msg}] → ${intent}: ${reply}`);
}

async function main() {
  console.log('=== Full flow tests ===\n');
  await test('ส่งของไปเชียงใหม่ 5 กิโล');
  await test('กทม 3 โล');
  await test('หาดใหญ่ 2 kg');
  await test('โคราช 10 กิโล');
  await test('เช็คเวลาเปิด');
  await test('แจ้งเวลาเปิด');
  await test('ตอนนี้เปิดไหม');
  await test('ส่งของ');
  console.log('\nDone');
}
main().catch(e => console.error(e.message.slice(0, 300)));
