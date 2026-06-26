'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const xsrf = process.env.TWENTYEXPRESS_XSRF;
const session = process.env.TWENTYEXPRESS_SESSION;
if (!xsrf || !session) { console.error('Missing TWENTYEXPRESS_XSRF or TWENTYEXPRESS_SESSION env vars'); process.exit(1); }
const cookies = [
  { name: 'XSRF-TOKEN', value: xsrf, domain: 'app.twentyexpress.com', path: '/' },
  { name: 'twentyexpress_session', value: session, domain: 'app.twentyexpress.com', path: '/', httpOnly: true }
];

// 20 test cases — dims ending in .5, decimal weights
const TEST_CASES = [
  { id: 1,  province: 'กรุงเทพมหานคร',  sub: 'คลองตัน',    dist: 'คลองเตย',       zip: '10110', weightKg: 1.5,  gram: 1500,  dim: { w: 20.5, l: 30.5, h: 10.5 } },
  { id: 2,  province: 'นนทบุรี',        sub: 'บางกระสอ',  dist: 'เมืองนนทบุรี',   zip: '11000', weightKg: 2.5,  gram: 2500,  dim: { w: 25.5, l: 35.5, h: 15.5 } },
  { id: 3,  province: 'ปทุมธานี',       sub: 'คลองหลวง',   dist: 'คลองหลวง',      zip: '12120', weightKg: 5.5,  gram: 5500,  dim: { w: 30.5, l: 40.5, h: 20.5 } },
  { id: 4,  province: 'สมุทรปราการ',    sub: 'ปากน้ำ',     dist: 'เมืองสมุทรปราการ', zip: '10270', weightKg: 0.7,  gram: 700,   dim: { w: 15.5, l: 20.5, h: 8.5 } },
  { id: 5,  province: 'เชียงใหม่',       sub: 'ช้างเผือก',  dist: 'เมืองเชียงใหม่', zip: '50300', weightKg: 3.5,  gram: 3500,  dim: { w: 28.5, l: 38.5, h: 18.5 } },
  { id: 6,  province: 'เชียงใหม่',       sub: 'ช้างเผือก',  dist: 'เมืองเชียงใหม่', zip: '50300', weightKg: 7.2,  gram: 7200,  dim: { w: 35.5, l: 45.5, h: 25.5 } },
  { id: 7,  province: 'เชียงใหม่',       sub: 'ช้างเผือก',  dist: 'เมืองเชียงใหม่', zip: '50300', weightKg: 1.8,  gram: 1800,  dim: { w: 22.5, l: 32.5, h: 12.5 } },
  { id: 8,  province: 'ภูเก็ต',          sub: 'ป่าตอง',    dist: 'กะทู้',         zip: '83150', weightKg: 4.5,  gram: 4500,  dim: { w: 30.5, l: 40.5, h: 22.5 } },
  { id: 9,  province: 'ขอนแก่น',        sub: 'ในเมือง',    dist: 'เมืองขอนแก่น',   zip: '40000', weightKg: 6.5,  gram: 6500,  dim: { w: 33.5, l: 43.5, h: 23.5 } },
  { id: 10, province: 'ชลบุรี',          sub: 'บางปลาสร้อย', dist: 'เมืองชลบุรี',   zip: '20000', weightKg: 8.5,  gram: 8500,  dim: { w: 38.5, l: 48.5, h: 28.5 } },
  { id: 11, province: 'สงขลา',          sub: 'หาดใหญ่',    dist: 'หาดใหญ่',       zip: '90110', weightKg: 2.2,  gram: 2200,  dim: { w: 24.5, l: 34.5, h: 14.5 } },
  { id: 12, province: 'นครราชสีมา',     sub: 'ในเมือง',    dist: 'เมืองนครราชสีมา', zip: '30000', weightKg: 9.5,  gram: 9500,  dim: { w: 40.5, l: 50.5, h: 30.5 } },
  { id: 13, province: 'อุบลราชธานี',    sub: 'ในเมือง',    dist: 'เมืองอุบลราชธานี', zip: '34000', weightKg: 0.5,  gram: 500,   dim: { w: 14.5, l: 19.5, h: 7.5 } },
  { id: 14, province: 'สุราษฎร์ธานี',   sub: 'ตลาด',      dist: 'เมืองสุราษฎร์ธานี', zip: '84000', weightKg: 3.8,  gram: 3800,  dim: { w: 27.5, l: 37.5, h: 17.5 } },
  { id: 15, province: 'พิษณุโลก',        sub: 'ในเมือง',    dist: 'เมืองพิษณุโลก',  zip: '65000', weightKg: 10.5, gram: 10500, dim: { w: 42.5, l: 52.5, h: 32.5 } },
  { id: 16, province: 'ระยอง',          sub: 'ท่าประดู่',   dist: 'เมืองระยอง',    zip: '21000', weightKg: 1.2,  gram: 1200,  dim: { w: 18.5, l: 28.5, h: 11.5 } },
  { id: 17, province: 'เชียงราย',        sub: 'เวียง',      dist: 'เมืองเชียงราย',  zip: '57000', weightKg: 11.5, gram: 11500, dim: { w: 44.5, l: 54.5, h: 34.5 } },
  { id: 18, province: 'อุดรธานี',        sub: 'หมากแข้ง',   dist: 'เมืองอุดรธานี',  zip: '41000', weightKg: 6.8,  gram: 6800,  dim: { w: 34.5, l: 44.5, h: 24.5 } },
  { id: 19, province: 'นครสวรรค์',       sub: 'ปากน้ำโพ',   dist: 'เมืองนครสวรรค์', zip: '60000', weightKg: 12.5, gram: 12500, dim: { w: 45.5, l: 55.5, h: 35.5 } },
  { id: 20, province: 'ลำปาง',           sub: 'เวียงเหนือ',  dist: 'เมืองลำปาง',    zip: '52000', weightKg: 4.8,  gram: 4800,  dim: { w: 29.5, l: 39.5, h: 21.5 } },
];

const { calculatePrice } = require('./rate_calculator.cjs');
const COURIER_NAMES = {
  DPKERRY: 'Kerry', DPTHAIPOST: 'ไปรษณีย์', DPFLASHA: 'Flash',
  DPSHOPEE: 'Shopee', DPDHL: 'DHL', DPFLASHLIVEBULKY: 'FlashBulky',
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Loading...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  if (page.url().includes('/login')) { console.log('SESSION EXPIRED'); await browser.close(); process.exit(1); }
  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);
  console.log('CSRF ok\n');

  const scraped = [];
  for (const tc of TEST_CASES) {
    process.stdout.write(`[${String(tc.id).padStart(2)}/20] ${tc.province.padEnd(14)} ${tc.weightKg}kg ${tc.dim.w}x${tc.dim.l}x${tc.dim.h}... `);

    await page.evaluate((tc) => {
      document.querySelector('#dst_name').value = 'Test';
      document.querySelector('#dst_phone').value = '0812345678';
      document.querySelector('#dst_address').value = '123/4';
      document.querySelector('#dst_sub_district').value = tc.sub;
      document.querySelector('#dst_district').value = tc.dist;
      document.querySelector('#dst_province').value = tc.province;
      document.querySelector('#dst_zipcode').value = tc.zip;
      document.querySelector('#kg_weight').value = tc.weightKg;
      document.querySelector('#gram_weight').value = tc.gram;
      document.querySelector('#weight').value = tc.gram;
      document.querySelector('#width').value = tc.dim.w;
      document.querySelector('#length').value = tc.dim.l;
      document.querySelector('#height').value = tc.dim.h;
    }, tc);

    await page.waitForTimeout(400);
    const r = await page.evaluate((cs) => {
      return new Promise((resolve) => {
        const arr = $('#createOrderForm').serializeArray();
        arr.push({ name: '_token', value: cs });
        $.getJSON('/order/compare-price', $.param(arr))
          .done(data => resolve({ ok: true, data }))
          .fail((j, s, e) => resolve({ ok: false, error: s }));
      });
    }, csrf);

    if (r.ok && Array.isArray(r.data)) {
      console.log(`${r.data.length} ok`);
      for (const cd of r.data) {
        scraped.push({
          test_id: tc.id, province: tc.province, weight_kg: tc.weightKg,
          dim_w: tc.dim.w, dim_l: tc.dim.l, dim_h: tc.dim.h,
          courier_code: cd.courier_code, shipping_type: cd.shipping_type,
          cost: cd.cost, price: cd.price,
          final_weight: cd.all_weight?.final_weight,
          cost_policies: cd.cost_policies,
        });
      }
    } else { console.log(`FAIL`); }
    await page.waitForTimeout(300);
  }
  await browser.close();

  console.log(`\nScraped ${scraped.length} records\n`);

  const rows = [];
  for (const tc of TEST_CASES) {
    for (const s of scraped.filter(r => r.test_id === tc.id)) {
      const calc = calculatePrice({
        courier: s.courier_code, province: tc.province,
        weightKg: tc.weightKg, widthCm: tc.dim.w,
        lengthCm: tc.dim.l, heightCm: tc.dim.h, extraProfit: 0,
      });
      const ap = Number(s.price);
      const calcPrice = calc.rejected ? null : calc.price;
      const diff = calc.rejected ? null : calc.price - ap;
      const close = calc.rejected ? false : (Math.abs(diff) < 2);
      rows.push({
        id: tc.id, province: tc.province, courier: s.courier_code,
        weight: tc.weightKg, dim: `${tc.dim.w}x${tc.dim.l}x${tc.dim.h}`,
        actual: isNaN(ap) ? null : ap, calc: calcPrice, diff: diff,
        aFW: s.final_weight || '-', cFW: calc.rejected ? '-' : calc._internal.chargeable_weight_kg,
        pAct: s.cost_policies || '?', pPrd: calc.rejected ? 'rej' : calc._internal.cost_policies_predicted,
        interp: calc.rejected ? false : calc._internal.interpolated,
        rejected: calc.rejected,
        close,
      });
    }
  }

  const okCount = rows.filter(r => r.close).length;
  const rejCount = rows.filter(r => r.rejected).length;
  const totalRows = rows.length;
  const validRows = rows.filter(r => !r.rejected && !isNaN(r.actual));
  const diffs = validRows.map(r => Math.abs(r.diff));
  const avgDiff = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
  const exactHits = rows.filter(r => !r.interp && !r.rejected);
  const interpHits = rows.filter(r => r.interp && !r.rejected);

  console.log(`\nWithin ฿2: ${okCount}/${totalRows} (${(okCount/totalRows*100).toFixed(1)}%)  Rejected: ${rejCount}  Avg|diff|: ฿${avgDiff.toFixed(2)}`);
  console.log(`Exact: ${exactHits.length} (ok: ${exactHits.filter(r=>r.close).length})  Interp: ${interpHits.length} (ok: ${interpHits.filter(r=>r.close).length})`);

  for (const c of Object.keys(COURIER_NAMES)) {
    const cr = rows.filter(r => r.courier === c);
    if (!cr.length) continue;
    const ok = cr.filter(r => r.close).length;
    const ad = cr.filter(r => !isNaN(r.diff)).map(r => Math.abs(r.diff));
    console.log(`  ${COURIER_NAMES[c].padEnd(12)} ${ok}/${cr.length}  avg|diff|: ฿${(ad.reduce((a,b)=>a+b,0)/ad.length).toFixed(2)}`);
  }
})();
