'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'scrape_all_provinces.js'), 'utf8');
const m = src.match(/const cookies = (\[[\s\S]*?\]);/);
if (!m) { console.error('Cannot find cookies'); process.exit(1); }
const cookies = eval(m[1]);

// 20 new cases — decimal dims + decimal weights, none overlap with v1
const TEST_CASES = [
  { id: 1,  province: 'กรุงเทพมหานคร',  sub: 'คลองตัน',    dist: 'คลองเตย',       zip: '10110', weightKg: 1.7,  gram: 1700,  dim: { w: 21.5, l: 31.2, h: 11.8 } },
  { id: 2,  province: 'นนทบุรี',        sub: 'บางกระสอ',  dist: 'เมืองนนทบุรี',   zip: '11000', weightKg: 6.3,  gram: 6300,  dim: { w: 33.8, l: 43.5, h: 23.7 } },
  { id: 3,  province: 'ปทุมธานี',       sub: 'คลองหลวง',   dist: 'คลองหลวง',      zip: '12120', weightKg: 9.7,  gram: 9700,  dim: { w: 41.2, l: 51.5, h: 31.3 } },
  { id: 4,  province: 'สมุทรปราการ',    sub: 'ปากน้ำ',     dist: 'เมืองสมุทรปราการ', zip: '10270', weightKg: 3.2,  gram: 3200,  dim: { w: 26.7, l: 36.3, h: 16.9 } },
  { id: 5,  province: 'ระยอง',          sub: 'ท่าประดู่',   dist: 'เมืองระยอง',    zip: '21000', weightKg: 1.3,  gram: 1300,  dim: { w: 22.8, l: 32.1, h: 12.5 } },
  { id: 6,  province: 'นครราชสีมา',     sub: 'ในเมือง',    dist: 'เมืองนครราชสีมา', zip: '30000', weightKg: 2.7,  gram: 2700,  dim: { w: 27.3, l: 37.8, h: 17.2 } },
  { id: 7,  province: 'สุราษฎร์ธานี',   sub: 'ตลาด',      dist: 'เมืองสุราษฎร์ธานี', zip: '84000', weightKg: 4.2,  gram: 4200,  dim: { w: 29.5, l: 39.6, h: 19.8 } },
  { id: 8,  province: 'อุบลราชธานี',    sub: 'ในเมือง',    dist: 'เมืองอุบลราชธานี', zip: '34000', weightKg: 5.7,  gram: 5700,  dim: { w: 31.4, l: 41.7, h: 21.6 } },
  { id: 9,  province: 'นครสวรรค์',      sub: 'ปากน้ำโพ',   dist: 'เมืองนครสวรรค์', zip: '60000', weightKg: 7.3,  gram: 7300,  dim: { w: 36.2, l: 46.8, h: 26.4 } },
  { id: 10, province: 'กาญจนบุรี',      sub: 'บ้านเหนือ',   dist: 'เมืองกาญจนบุรี', zip: '71000', weightKg: 8.7,  gram: 8700,  dim: { w: 39.5, l: 49.3, h: 29.1 } },
  { id: 11, province: 'เชียงราย',        sub: 'เวียง',      dist: 'เมืองเชียงราย',  zip: '57000', weightKg: 10.3, gram: 10300, dim: { w: 42.1, l: 52.7, h: 31.6 } },
  { id: 12, province: 'กระบี่',          sub: 'ปากน้ำ',     dist: 'เมืองกระบี่',    zip: '81000', weightKg: 13.2, gram: 13200, dim: { w: 44.8, l: 54.2, h: 34.5 } },
  { id: 13, province: 'พิษณุโลก',        sub: 'ในเมือง',    dist: 'เมืองพิษณุโลก',  zip: '65000', weightKg: 0.7,  gram: 700,   dim: { w: 16.5, l: 22.3, h: 9.7 } },
  { id: 14, province: 'นครศรีธรรมราช',   sub: 'ในเมือง',    dist: 'เมืองนครศรีธรรมราช', zip: '80000', weightKg: 3.5,  gram: 3500,  dim: { w: 28.2, l: 38.6, h: 30.8 } },
  { id: 15, province: 'อุดรธานี',        sub: 'หมากแข้ง',   dist: 'เมืองอุดรธานี',  zip: '41000', weightKg: 5.2,  gram: 5200,  dim: { w: 30.8, l: 40.5, h: 20.3 } },
  { id: 16, province: 'สระบุรี',         sub: 'ปากเพรียว',  dist: 'เมืองสระบุรี',   zip: '18000', weightKg: 11.5, gram: 11500, dim: { w: 43.6, l: 53.1, h: 33.2 } },
  { id: 17, province: 'ลำปาง',           sub: 'เวียงเหนือ',  dist: 'เมืองลำปาง',    zip: '52000', weightKg: 6.8,  gram: 6800,  dim: { w: 34.5, l: 44.2, h: 24.7 } },
  { id: 18, province: 'ตรัง',            sub: 'ทับเที่ยง',   dist: 'เมืองตรัง',     zip: '92000', weightKg: 2.2,  gram: 2200,  dim: { w: 24.3, l: 34.7, h: 14.5 } },
  { id: 19, province: 'แพร่',            sub: 'ในเวียง',    dist: 'เมืองแพร่',     zip: '54000', weightKg: 9.3,  gram: 9300,  dim: { w: 40.7, l: 50.3, h: 29.8 } },
  { id: 20, province: 'มหาสารคาม',       sub: 'ตลาด',      dist: 'เมืองมหาสารคาม', zip: '44000', weightKg: 1.8,  gram: 1800,  dim: { w: 23.1, l: 33.5, h: 13.2 } },
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

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) {
    console.log('SESSION EXPIRED!');
    await browser.close();
    process.exit(1);
  }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);
  console.log('CSRF ok\n');

  const scraped = [];
  let n = 0;
  for (const tc of TEST_CASES) {
    n++;
    process.stdout.write(`[${String(n).padStart(2)}/${TEST_CASES.length}] ${tc.province.padEnd(14)} ${tc.weightKg}kg ${tc.dim.w}x${tc.dim.l}x${tc.dim.h}... `);

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

    const result = await page.evaluate((cs) => {
      return new Promise((resolve) => {
        const arr = $('#createOrderForm').serializeArray();
        arr.push({ name: '_token', value: cs });
        $.getJSON('/order/compare-price', $.param(arr))
          .done(data => resolve({ ok: true, data }))
          .fail((j, s, e) => resolve({ ok: false, error: s, status: j.status }));
      });
    }, csrf);

    if (result.ok && Array.isArray(result.data)) {
      console.log(`${result.data.length} couriers`);
      for (const cd of result.data) {
        scraped.push({
          test_id: tc.id, province: tc.province, weight_kg: tc.weightKg,
          dim_w: tc.dim.w, dim_l: tc.dim.l, dim_h: tc.dim.h,
          courier_code: cd.courier_code, shipping_type: cd.shipping_type,
          cost: cd.cost, price: cd.price, profit: cd.profit,
          final_weight: cd.all_weight?.final_weight,
          cost_policies: cd.cost_policies,
          weight_weight: cd.weight_weight,
          weight_dimension: cd.weight_dimension,
          weight_side: cd.weight_side,
          gas_fee: cd.gas_fee, actual_price: cd.actual_price,
          shop_price: cd.price_dimension || cd.price,
        });
      }
    } else {
      console.log(`FAIL: ${result.error || 'no data'}`);
    }
    await page.waitForTimeout(300);
  }
  await browser.close();

  fs.writeFileSync('test_20_scraped_v2.json', JSON.stringify(scraped, null, 2));
  console.log(`\nScraped ${scraped.length} records\n`);

  // Compare
  console.log('='.repeat(110));
  console.log('V2 COMPARISON: decimal dims + decimal weights (20 new cases)');
  console.log('='.repeat(110));

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
      const diff = calc.rejected ? null : (isNaN(ap) ? null : calc.price - ap);
      const close = calc.rejected || isNaN(ap) ? false : (Math.abs(diff) < 2);
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

  const hdr = ['#'.padStart(3), 'Province'.padEnd(14), 'Courier'.padEnd(12), 'kg'.padStart(5),
    'Dim'.padEnd(14), 'Zone'.padEnd(10), 'Scrape'.padStart(8), 'Calc'.padStart(8),
    'Diff'.padStart(7), 'FW'.padStart(7), 'cFW'.padStart(7), 'Pol'.padStart(6), 'Prd'.padStart(6),
    'I'.padStart(2), 'OK'.padStart(3)];
  console.log(hdr.join(' '));
  console.log('-'.repeat(hdr.join(' ').length + 3));

  for (const r of rows) {
    if (r.rejected) {
      console.log(String(r.id).padStart(3), r.province.padEnd(14), (COURIER_NAMES[r.courier]||r.courier).padEnd(12),
        String(r.weight).padStart(5), r.dim.padEnd(14), 'ปฏิเสธ'.padStart(10),
        'ปฏิเสธ'.padStart(8), '   ✓'.padStart(7), String(r.aFW).padStart(7), '-'.padStart(7),
        ''.padStart(6), 'rej'.padStart(6), ''.padStart(2), ' ✓'.padStart(3));
    } else if (r.actual === null) {
      console.log(String(r.id).padStart(3), r.province.padEnd(14), (COURIER_NAMES[r.courier]||r.courier).padEnd(12),
        String(r.weight).padStart(5), r.dim.padEnd(14), 'ไม่มี'.padStart(10),
        '   NaN'.padStart(8), '   NaN'.padStart(7), String(r.aFW).padStart(7), String(r.cFW.toFixed(2)).padStart(7),
        ''.padStart(6), ''.padStart(6), ''.padStart(2), ' ✗'.padStart(3));
    } else {
      const sign = r.diff >= 0 ? '+' : '';
      console.log(String(r.id).padStart(3), r.province.padEnd(14), (COURIER_NAMES[r.courier]||r.courier).padEnd(12),
        String(r.weight).padStart(5), r.dim.padEnd(14), (r.zone||'?').padEnd(10),
        String(r.actual.toFixed(0)).padStart(8), String(r.calc.toFixed(0)).padStart(8),
        (sign+r.diff.toFixed(1)).padStart(7),
        String(r.aFW).padStart(7), String(r.cFW.toFixed(2)).padStart(7),
        r.pAct.padStart(6), r.pPrd.padStart(6),
        (r.interp?'I':'').padStart(2), (r.close?'✓':'✗').padStart(3));
    }
  }

  const okCount = rows.filter(r => r.close).length;
  const rejCount = rows.filter(r => r.rejected).length;
  const validRows = rows.filter(r => !r.rejected && r.actual !== null);
  const diffs = validRows.map(r => Math.abs(r.diff));
  const avgDiff = diffs.length ? diffs.reduce((a,b)=>a+b,0)/diffs.length : 0;
  const exactHits = rows.filter(r => !r.interp && !r.rejected);
  const interpHits = rows.filter(r => r.interp && !r.rejected);

  console.log(`\nWithin ฿2: ${okCount}/${rows.length} (${(okCount/rows.length*100).toFixed(1)}%)  Rejected: ${rejCount}  Avg|diff|: ฿${avgDiff.toFixed(2)}`);
  console.log(`Exact: ${exactHits.length} (ok: ${exactHits.filter(r=>r.close).length})  Interp: ${interpHits.length} (ok: ${interpHits.filter(r=>r.close).length})`);

  console.log('\nBy courier:');
  for (const c of Object.keys(COURIER_NAMES)) {
    const cr = rows.filter(r => r.courier === c);
    if (cr.length === 0) continue;
    const crOk = cr.filter(r => r.close).length;
    const crDiffs = cr.filter(r => !isNaN(r.diff)).map(r => Math.abs(r.diff));
    const crAvg = crDiffs.reduce((s, r) => s + r, 0) / crDiffs.length;
    console.log(`  ${COURIER_NAMES[c].padEnd(12)} ${crOk}/${cr.length} ok  avg|diff|: ฿${crAvg.toFixed(2)}`);
  }

  fs.writeFileSync('test_20_comparison_v2.json', JSON.stringify({ rows, okCount, totalRows, avgDiff: +avgDiff.toFixed(2) }, null, 2));
  console.log('\nSaved: test_20_comparison_v2.json');
})();
