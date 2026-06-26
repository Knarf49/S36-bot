'use strict';
const df = require('@google-cloud/dialogflow');
const { compareAllCouriers } = require('./rate_calculator.cjs');
const sessionsClient = new df.SessionsClient();
const PROJECT_ID = process.env.PROJECT_ID || 'project-not-set';

async function detectIntent(sessionId, text) {
  const [response] = await sessionsClient.detectIntent({
    session: sessionsClient.projectAgentSessionPath(PROJECT_ID, sessionId),
    queryInput: { text: { text, languageCode: 'th' } },
  });
  return response.queryResult;
}

async function main() {
  const tests = [
    'เช็คเวลาเปิด',
    'แจ้งเวลาเปิด',
    'ส่งของไปเชียงใหม่ 5 กิโล',
    'กทม 3 โล',
    'ส่งของ',
  ];

  for (let i = 0; i < tests.length; i++) {
    const msg = tests[i];
    const qr = await detectIntent('test-user-' + i, msg);
    const intent = qr.intent?.displayName || '(none)';
    const params = qr.parameters?.fields || {};
    const province = params.province?.stringValue || '-';
    const weight = params.weight?.numberValue || '-';
    console.log('---');
    console.log('Input:', msg);
    console.log('Intent:', intent, '| conf:', qr.intentDetectionConfidence?.toFixed(2));
    console.log('Province:', province, '| Weight:', weight);
    if (intent === 'ส่งของ' && province !== '-' && weight !== '-') {
      const results = compareAllCouriers({ province, weightKg: weight, widthCm: 20, lengthCm: 30, heightCm: 10 });
      const cheapest = results[0];
      console.log('Cheapest:', cheapest.courier, cheapest.price, 'บาท');
    }
  }
  console.log('Done');
}
main().catch(e => console.error(e));
