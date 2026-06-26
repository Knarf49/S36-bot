'use strict';
const express = require('express');
const app = express();
app.use(express.json());

const HOURS = {
  mon_fri: { open: 9, close: 18 },
  sat_sun: { open: 9, close: 17 },
};

function isOpen() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const hour = now.getHours();
  const min = now.getMinutes();
  const time = hour + min / 60;

  const isWeekday = day >= 1 && day <= 5; // Mon-Fri
  const range = isWeekday ? HOURS.mon_fri : HOURS.sat_sun;

  const open = time >= range.open && time < range.close;
  const dayName = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'][day];
  const timeStr = String(hour).padStart(2,'0') + ':' + String(min).padStart(2,'0');

  return { open, dayName, timeStr, range };
}

app.post('/webhook', (req, res) => {
  const intent = req.body.queryResult?.intent?.displayName;
  console.log('Intent:', intent, '| body keys:', Object.keys(req.body));

  if (intent === 'เช็คเวลาเปิด' || intent === 'Default Welcome Intent' || !intent) {
    const { open, dayName, timeStr, range } = isOpen();
    const closeStr = String(range.close).padStart(2, '0') + ':00';
    const text = open
      ? `ขณะนี้ (${dayName} ${timeStr} น.) ร้านเปิดอยู่ค่ะ ปิด ${closeStr} น.`
      : `ขณะนี้ (${dayName} ${timeStr} น.) ร้านปิดแล้วค่ะ เปิดอีกที ${dayName === 'เสาร์' ? '09:00' : '09:00'} น.`;

    console.log('→', text);
    return res.json({ fulfillmentText: text, fulfillmentMessages: [{ text: { text: [text] } }] });
  }

  res.json({ fulfillmentText: '' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fulfillment server on port ${PORT}`));
