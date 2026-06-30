require('dotenv').config();
const { chromium } = require('playwright');
const { calculatePrice } = require('./rate_calculator.cjs');

const TEST_CASES = [
  // weight_kg, w, l, h, province (th), sub, dist, zip
  { name: '1kg std dims → เชียงใหม่', kg: 1, w: 20, l: 30, h: 10, prov: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' },
  { name: '5kg std dims → เชียงใหม่', kg: 5, w: 30, l: 40, h: 20, prov: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' },
  { name: '10kg std dims → เชียงใหม่', kg: 10, w: 40, l: 50, h: 30, prov: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' },
  { name: '2.5kg small dims → กรุงเทพ', kg: 2.5, w: 15, l: 20, h: 10, prov: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110' },
  { name: '5kg big dims → กรุงเทพ', kg: 5, w: 50, l: 60, h: 40, prov: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110' },
  { name: '3kg std dims → ภูเก็ต', kg: 3, w: 25, l: 35, h: 15, prov: 'ภูเก็ต', sub: 'ป่าตอง', dist: 'กะทู้', zip: '83150' },
  { name: '7kg std dims → ภูเก็ต', kg: 7, w: 30, l: 40, h: 20, prov: 'ภูเก็ต', sub: 'ป่าตอง', dist: 'กะทู้', zip: '83150' },
  { name: '15kg heavy → ขอนแก่น', kg: 15, w: 40, l: 50, h: 30, prov: 'ขอนแก่น', sub: 'ในเมือง', dist: 'เมืองขอนแก่น', zip: '40000' },
  { name: '0.5kg tiny → นนทบุรี', kg: 0.5, w: 10, l: 15, h: 5, prov: 'นนทบุรี', sub: 'บางกระสอ', dist: 'เมืองนนทบุรี', zip: '11000' },
  { name: '4kg big dims → ขอนแก่น', kg: 4, w: 45, l: 55, h: 35, prov: 'ขอนแก่น', sub: 'ในเมือง', dist: 'เมืองขอนแก่น', zip: '40000' },
];

(async () => {
  const xsrf = process.env.TWENTYEXPRESS_XSRF;
  const session = process.env.TWENTYEXPRESS_SESSION;
  if (!xsrf || !session) process.exit(1);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies([
    { name: 'XSRF-TOKEN', value: xsrf, domain: 'app.twentyexpress.com', path: '/' },
    { name: 'twentyexpress_session', value: session, domain: 'app.twentyexpress.com', path: '/', httpOnly: true }
  ]);
  const page = await context.newPage();

  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  if (page.url().includes('/login')) { console.log('Session expired'); await browser.close(); process.exit(1); }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);

  console.log('=== 10 Flash Test Cases ===\n');
  console.log('Case|Province|Weight|Dims(cm)|Calc Price|Scrape Cost|Scrape Price|Match|FW|Zone');
  console.log('-'.repeat(120));

  for (const tc of TEST_CASES) {
    const calc = calculatePrice({ courier: 'DPFLASHA', province: tc.prov, weightKg: tc.kg, widthCm: tc.w, lengthCm: tc.l, heightCm: tc.h, extraProfit: 0 });
    const calcPrice = calc.price;

    await page.evaluate(({ tc }) => {
      document.querySelector('#dst_name').value = 'Test';
      document.querySelector('#dst_phone').value = '0812345678';
      document.querySelector('#dst_address').value = '123/4';
      document.querySelector('#dst_sub_district').value = tc.sub;
      document.querySelector('#dst_district').value = tc.dist;
      document.querySelector('#dst_province').value = tc.prov;
      document.querySelector('#dst_zipcode').value = tc.zip;
      document.querySelector('#kg_weight').value = tc.kg;
      document.querySelector('#gram_weight').value = Math.round(tc.kg * 1000);
      document.querySelector('#weight').value = Math.round(tc.kg * 1000);
      document.querySelector('#width').value = tc.w;
      document.querySelector('#length').value = tc.l;
      document.querySelector('#height').value = tc.h;
    }, { tc });

    await page.waitForTimeout(300);

    const result = await page.evaluate((cs) => {
      return new Promise((resolve) => {
        const arr = $('#createOrderForm').serializeArray();
        arr.push({ name: '_token', value: cs });
        $.getJSON('/order/compare-price', $.param(arr))
          .done(data => resolve({ ok: true, data }))
          .fail((j, s, e) => resolve({ ok: false, error: s }));
      });
    }, csrf);

    if (result.ok && Array.isArray(result.data)) {
      const flash = result.data.find(c => c.courier_code === 'DPFLASHA');
      if (flash) {
        const scrapedCost = parseFloat(flash.cost) || 0;
        const scrapedPrice = parseFloat(flash.price) || 0;
        const fw = flash.all_weight?.final_weight || '?';
        const zone = flash.shipping_type || '?';
        const match = scrapedPrice === calcPrice ? '✓' : `✗ diff=${scrapedPrice - calcPrice}`;
        console.log(`${tc.name}|${tc.prov}|${tc.kg}kg|${tc.w}x${tc.l}x${tc.h}|${calcPrice}|${scrapedCost}|${scrapedPrice}|${match}|${fw}|${zone}`);
      } else {
        console.log(`${tc.name}|${tc.prov}|${tc.kg}kg|-|${calcPrice}|-|NO FLASH|✗|-|-`);
      }
    } else {
      console.log(`${tc.name}|FAIL: ${result.error}`);
    }

    await page.waitForTimeout(300);
  }

  await browser.close();
  console.log('\nDone.');
})();
