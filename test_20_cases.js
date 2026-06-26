'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Read cookies from main scraper
const src = fs.readFileSync(path.join(__dirname, 'scrape_all_provinces.js'), 'utf8');
const m = src.match(/const cookies = (\[[\s\S]*?\]);/);
if (!m) { console.error('Cannot find cookies array'); process.exit(1); }
const cookies = eval(m[1]);

// 20 diverse test cases
const TEST_CASES = [
  { id: 1,  province: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110', weightKg: 1.0,  gram: 1000,  dim: { w: 20, l: 30, h: 10 } },
  { id: 2,  province: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110', weightKg: 3.0,  gram: 3000,  dim: { w: 25, l: 35, h: 15 } },
  { id: 3,  province: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110', weightKg: 7.0,  gram: 7000,  dim: { w: 35, l: 45, h: 25 } },
  { id: 4,  province: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110', weightKg: 2.0,  gram: 2000,  dim: { w: 55, l: 45, h: 35 } },
  { id: 5,  province: 'นนทบุรี',           sub: 'บางกระสอ', dist: 'เมืองนนทบุรี', zip: '11000', weightKg: 5.0,  gram: 5000,  dim: { w: 30, l: 40, h: 20 } },
  { id: 6,  province: 'เชียงใหม่',         sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300', weightKg: 1.0,  gram: 1000,  dim: { w: 20, l: 30, h: 10 } },
  { id: 7,  province: 'เชียงใหม่',         sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300', weightKg: 0.5,  gram: 500,   dim: { w: 15, l: 20, h: 8 } },
  { id: 8,  province: 'เชียงใหม่',         sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300', weightKg: 2.5,  gram: 2500,  dim: { w: 25, l: 35, h: 15 } },
  { id: 9,  province: 'เชียงใหม่',         sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300', weightKg: 3.7,  gram: 3700,  dim: { w: 30, l: 40, h: 20 } },
  { id: 10, province: 'เชียงใหม่',         sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300', weightKg: 8.0,  gram: 8000,  dim: { w: 40, l: 50, h: 30 } },
  { id: 11, province: 'ภูเก็ต',            sub: 'ป่าตอง', dist: 'กะทู้',       zip: '83150', weightKg: 4.0,  gram: 4000,  dim: { w: 28, l: 38, h: 18 } },
  { id: 12, province: 'ภูเก็ต',            sub: 'ป่าตอง', dist: 'กะทู้',       zip: '83150', weightKg: 12.0, gram: 12000, dim: { w: 35, l: 55, h: 35 } },
  { id: 13, province: 'ขอนแก่น',          sub: 'ในเมือง', dist: 'เมืองขอนแก่น', zip: '40000', weightKg: 6.0,  gram: 6000,  dim: { w: 32, l: 42, h: 22 } },
  { id: 14, province: 'ชลบุรี',            sub: 'บางปลาสร้อย', dist: 'เมืองชลบุรี', zip: '20000', weightKg: 1.5,  gram: 1500,  dim: { w: 22, l: 32, h: 12 } },
  { id: 15, province: 'ชลบุรี',            sub: 'บางปลาสร้อย', dist: 'เมืองชลบุรี', zip: '20000', weightKg: 9.0,  gram: 9000,  dim: { w: 38, l: 48, h: 28 } },
  { id: 16, province: 'สงขลา',            sub: 'หาดใหญ่', dist: 'หาดใหญ่',     zip: '90110', weightKg: 2.0,  gram: 2000,  dim: { w: 20, l: 30, h: 10 } },
  { id: 17, province: 'สงขลา',            sub: 'หาดใหญ่', dist: 'หาดใหญ่',     zip: '90110', weightKg: 15.0, gram: 15000, dim: { w: 45, l: 55, h: 35 } },
  { id: 18, province: 'อุดรธานี',         sub: 'หมากแข้ง', dist: 'เมืองอุดรธานี', zip: '41000', weightKg: 0.8,  gram: 800,   dim: { w: 18, l: 28, h: 10 } },
  { id: 19, province: 'ปทุมธานี',         sub: 'คลองหลวง', dist: 'คลองหลวง',   zip: '12120', weightKg: 10.0, gram: 10000, dim: { w: 40, l: 50, h: 30 } },
  { id: 20, province: 'สมุทรปราการ',      sub: 'ปากน้ำ', dist: 'เมืองสมุทรปราการ', zip: '10270', weightKg: 4.5,  gram: 4500,  dim: { w: 35, l: 35, h: 25 } },
];

const { calculatePrice } = require('./rate_calculator.cjs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) {
    console.log('SESSION EXPIRED! Get fresh cookies from Edge DevTools.');
    console.log('  1. Open Edge → app.twentyexpress.com → login');
    console.log('  2. F12 → Application → Cookies');
    console.log('  3. Copy XSRF-TOKEN (unencoded) and twentyexpress_session');
    console.log('  4. Paste into scrape_all_provinces.js lines ~143-146');
    await browser.close();
    process.exit(1);
  }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);
  console.log('CSRF ok\n');

  const scraped = [];
  const total = TEST_CASES.length;
  let count = 0;

  for (const tc of TEST_CASES) {
    count++;
    process.stdout.write(`[${String(count).padStart(2)}/${total}] ${tc.province.padEnd(14)} ${tc.weightKg}kg ${tc.dim.w}x${tc.dim.l}x${tc.dim.h}... `);

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
          test_id: tc.id,
          province: tc.province,
          weight_kg: tc.weightKg,
          dim_w: tc.dim.w, dim_l: tc.dim.l, dim_h: tc.dim.h,
          courier_code: cd.courier_code,
          shipping_type: cd.shipping_type,
          cost: cd.cost,
          price: cd.price,
          profit: cd.profit,
          final_weight: cd.all_weight?.final_weight,
          cost_policies: cd.cost_policies,
          weight_weight: cd.weight_weight,
          weight_dimension: cd.weight_dimension,
          weight_side: cd.weight_side,
          gas_fee: cd.gas_fee,
          actual_price: cd.actual_price,
          shop_price: cd.price_dimension || cd.price,
        });
      }
    } else {
      console.log(`FAIL: ${result.error || 'no data'} (status: ${result.status})`);
    }

    await page.waitForTimeout(300);
  }

  await browser.close();

  // Save raw scraped
  fs.writeFileSync('test_20_scraped.json', JSON.stringify(scraped, null, 2));
  console.log(`\nScraped ${scraped.length} records → test_20_scraped.json\n`);

  // ============================================================
  // COMPARISON TABLE
  // ============================================================
  const COURIER_NAMES = {
    DPKERRY: 'Kerry',
    DPTHAIPOST: 'ไปรษณีย์',
    DPFLASHA: 'Flash',
    DPSHOPEE: 'Shopee',
    DPDHL: 'DHL',
    DPFLASHLIVEBULKY: 'FlashBulky',
  };

  console.log('='.repeat(110));
  console.log('COMPARISON: calculator prediction vs actual scraped (20 cases × 6 couriers)');
  console.log('='.repeat(110));

  const rows = [];

  for (const tc of TEST_CASES) {
    for (const s of scraped.filter(r => r.test_id === tc.id)) {
      const calc = calculatePrice({
        courier: s.courier_code,
        province: tc.province,
        weightKg: tc.weightKg,
        widthCm: tc.dim.w,
        lengthCm: tc.dim.l,
        heightCm: tc.dim.h,
        extraProfit: 0,
      });

      const ap = Number(s.price);
      const ac = Number(s.cost);
      const priceDiff = calc.price - ap;
      const costDiff = calc._internal.cost - ac;
      const close = Math.abs(priceDiff) < 2;

      rows.push({
        id: tc.id,
        province: tc.province,
        courier: s.courier_code,
        weight: tc.weightKg,
        dim: `${tc.dim.w}x${tc.dim.l}x${tc.dim.h}`,
        zone: s.shipping_type || '?',
        actual_price: ap,
        calc_price: calc.price,
        diff_price: +(priceDiff.toFixed(2)),
        actual_cost: ac,
        calc_cost: calc._internal.cost,
        diff_cost: +(costDiff.toFixed(2)),
        actual_fw: s.final_weight || '-',
        calc_cw: calc._internal.chargeable_weight_kg,
        policy_actual: s.cost_policies || '?',
        policy_pred: calc._internal.cost_policies_predicted,
        interpolated: calc._internal.interpolated,
        close,
      });
    }
  }

  // Header
  const hdr = [
    '#'.padStart(3),
    'Province'.padEnd(14),
    'Courier'.padEnd(12),
    'kg'.padStart(4),
    'Dim'.padEnd(12),
    'Zone'.padEnd(10),
    'Scrape'.padStart(8),
    'Calc'.padStart(8),
    'Diff'.padStart(7),
    'ΔCost'.padStart(7),
    'FW'.padStart(7),
    'cFW'.padStart(7),
    'PolAct'.padStart(6),
    'PolPrd'.padStart(6),
    'Interp'.padStart(6),
    'OK'.padStart(4),
  ];
  console.log(hdr.join(' '));
  console.log('-'.repeat(hdr.join(' ').length + 3));

  for (const r of rows) {
    const sign = r.diff_price >= 0 ? '+' : '';
    const cSign = r.diff_cost >= 0 ? '+' : '';
    const ok = r.close ? '✓' : '✗';
    const intp = r.interpolated ? 'I' : '';

    console.log([
      String(r.id).padStart(3),
      r.province.padEnd(14),
      (COURIER_NAMES[r.courier] || r.courier).padEnd(12),
      String(r.weight).padStart(4),
      r.dim.padEnd(12),
      r.zone.padEnd(10),
      String(r.actual_price.toFixed(0)).padStart(8),
      String(r.calc_price.toFixed(0)).padStart(8),
      (sign + r.diff_price.toFixed(1)).padStart(7),
      (cSign + r.diff_cost.toFixed(1)).padStart(7),
      String(r.actual_fw).padStart(7),
      String(r.calc_cw.toFixed(2)).padStart(7),
      r.policy_actual.padStart(6),
      r.policy_pred.padStart(6),
      intp.padStart(6),
      ok.padStart(4),
    ].join(' '));
  }

  // Summary
  const okCount = rows.filter(r => r.close).length;
  const totalRows = rows.length;
  const diffs = rows.map(r => Math.abs(r.diff_price));
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / totalRows;
  const maxDiff = Math.max(...diffs);
  const exactHits = rows.filter(r => !r.interpolated);
  const exactClose = exactHits.filter(r => r.close).length;
  const interpHits = rows.filter(r => r.interpolated);
  const interpClose = interpHits.filter(r => r.close).length;

  console.log('\n' + '─'.repeat(80));
  console.log('SUMMARY');
  console.log('─'.repeat(80));
  console.log(`Total rows:              ${totalRows}`);
  console.log(`Within ฿2:               ${okCount}/${totalRows}  (${(okCount/totalRows*100).toFixed(1)}%)`);
  console.log(`Avg |price diff|:        ฿${avgDiff.toFixed(2)}`);
  console.log(`Max |price diff|:        ฿${maxDiff.toFixed(2)}`);
  console.log(`Exact match rows:        ${exactHits.length}  (close: ${exactClose}, ${(exactClose/exactHits.length*100).toFixed(0)}%)`);
  console.log(`Interpolated rows:       ${interpHits.length}  (close: ${interpClose}, ${(interpClose/interpHits.length*100).toFixed(0)}%)`);

  // By courier
  console.log('\nBy courier:');
  for (const c of Object.keys(COURIER_NAMES)) {
    const cr = rows.filter(r => r.courier === c);
    if (cr.length === 0) continue;
    const crOk = cr.filter(r => r.close).length;
    const crAvg = cr.reduce((s, r) => s + Math.abs(r.diff_price), 0) / cr.length;
    console.log(`  ${COURIER_NAMES[c].padEnd(12)} ${crOk}/${cr.length} ok  avg|diff|: ฿${crAvg.toFixed(2)}`);
  }

  // Save comparison
  fs.writeFileSync('test_20_comparison.json', JSON.stringify({ rows, summary: { okCount, totalRows, avgDiff: +avgDiff.toFixed(2), maxDiff } }, null, 2));
  console.log('\nSaved: test_20_comparison.json');
})();
