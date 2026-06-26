'use strict';

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================================
// Calculator Validation — scrape non-standard weights/dims
// then compare against rate_calculator.cjs predictions
// ============================================================

const xsrf = process.env.TWENTYEXPRESS_XSRF;
const session = process.env.TWENTYEXPRESS_SESSION;
if (!xsrf || !session) { console.error('Missing TWENTYEXPRESS_XSRF or TWENTYEXPRESS_SESSION env vars'); process.exit(1); }
const cookies = [
  { name: 'XSRF-TOKEN', value: xsrf, domain: 'app.twentyexpress.com', path: '/' },
  { name: 'twentyexpress_session', value: session, domain: 'app.twentyexpress.com', path: '/', httpOnly: true }
];

// Test cases — non-standard weights/dims, none match existing 1/5/10kg scrape points
const TEST_CASES = [
  { label: '2.5kg mid-range',   weightKg: 2.5,  gram: 2500,  dim: { w: 25, l: 35, h: 15 } },
  { label: '7kg mid-range',     weightKg: 7,    gram: 7000,  dim: { w: 35, l: 45, h: 25 } },
  { label: '0.5kg below min',   weightKg: 0.5,  gram: 500,   dim: { w: 15, l: 20, h: 8 } },
  { label: '15kg above max',    weightKg: 15,   gram: 15000, dim: { w: 45, l: 55, h: 35 } },
  { label: '3kg big dim',       weightKg: 3,    gram: 3000,  dim: { w: 50, l: 40, h: 30 } },
];

// Provinces: one BKK_BKK, one BKK_OTHER
const PROVINCES = [
  { th: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110', zone: 'BKK_BKK' },
  { th: 'เชียงใหม่',      sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300', zone: 'BKK_OTHER' },
];

(async () => {
  console.log('Using cookies from env vars');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies(cookies);
  const page = await context.newPage();

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) { console.log('Session expired! Get fresh cookies.'); await browser.close(); process.exit(1); }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);
  console.log('CSRF ok\n');

  const scraped = [];
  const total = PROVINCES.length * TEST_CASES.length;
  let count = 0;

  for (const prov of PROVINCES) {
    for (const tc of TEST_CASES) {
      count++;
      console.log(`[${count}/${total}] ${prov.th} | ${tc.label} (${tc.weightKg}kg ${tc.dim.w}x${tc.dim.l}x${tc.dim.h})`);

      await page.evaluate(({ prov, tc }) => {
        document.querySelector('#dst_name').value = 'Test';
        document.querySelector('#dst_phone').value = '0812345678';
        document.querySelector('#dst_address').value = '123/4';
        document.querySelector('#dst_sub_district').value = prov.sub;
        document.querySelector('#dst_district').value = prov.dist;
        document.querySelector('#dst_province').value = prov.th;
        document.querySelector('#dst_zipcode').value = prov.zip;
        document.querySelector('#kg_weight').value = tc.weightKg;
        document.querySelector('#gram_weight').value = tc.gram;
        document.querySelector('#weight').value = tc.gram;
        document.querySelector('#width').value = tc.dim.w;
        document.querySelector('#length').value = tc.dim.l;
        document.querySelector('#height').value = tc.dim.h;
      }, { prov, tc });

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
        for (const cd of result.data) {
          scraped.push({
            test_label: tc.label,
            destination: prov.th,
            zone: prov.zone,
            weight_gram: tc.gram,
            weight_kg: tc.weightKg,
            dim_w: tc.dim.w, dim_l: tc.dim.l, dim_h: tc.dim.h,
            courier_code: cd.courier_code,
            shipping_type: cd.shipping_type,
            cost: cd.cost,
            price: cd.price,
            profit: cd.profit,
            final_weight: cd.all_weight?.final_weight,
            weight_weight: cd.weight_weight,
            weight_dimension: cd.weight_dimension,
            weight_side: cd.weight_side,
            gas_fee: cd.gas_fee,
            cost_policies: cd.cost_policies,
            actual_price: cd.actual_price,
            shop_price: cd.price_dimension || cd.price,
          });
        }
        console.log(`  -> ${result.data.length} couriers`);
      } else {
        console.log(`  -> FAIL: ${result.error || 'no data'}`);
      }

      await page.waitForTimeout(300);
    }
  }

  await browser.close();

  // Save scraped data
  fs.writeFileSync('validate_scraped.json', JSON.stringify(scraped, null, 2));
  console.log(`\nScraped ${scraped.length} records -> validate_scraped.json`);

  // ============================================================
  // Compare: calculator vs scraped
  // ============================================================
  console.log('\n' + '='.repeat(90));
  console.log('COMPARISON: Calculator predictions vs actual scraped data');
  console.log('='.repeat(90));

  const { calculatePrice } = require('./rate_calculator.cjs');

  const mismatches = [];

  for (const tc of TEST_CASES) {
    for (const prov of PROVINCES) {
      const scrapedRows = scraped.filter(r =>
        r.test_label === tc.label &&
        r.destination === prov.th
      );

      for (const s of scrapedRows) {
        const calc = calculatePrice({
          courier: s.courier_code,
          province: prov.th,
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
        const isClose = Math.abs(priceDiff) < 2.0; // Within 2 baht = acceptable

        mismatches.push({
          test: tc.label,
          province: prov.th,
          courier: s.courier_code,
          zone: s.shipping_type,
          actual_price: ap,
          calc_price: calc.price,
          diff: +(priceDiff.toFixed(2)),
          actual_cost: ac,
          calc_cost: calc._internal.cost,
          diff_cost: +(costDiff.toFixed(2)),
          actual_fw: s.final_weight,
          calc_cw: calc._internal.chargeable_weight_kg,
          policies: s.cost_policies,
          interpolated: calc._internal.interpolated,
          close: isClose,
        });
      }
    }
  }

  // Print table
  console.log(
    'test'.padEnd(22),
    'prov'.padEnd(12),
    'courier'.padEnd(18),
    'zone'.padEnd(10),
    'act.price'.padStart(8),
    'calc.price'.padStart(8),
    'diff'.padStart(7),
    'act.cost'.padStart(8),
    'calc.cost'.padStart(8),
    'ok?'.padStart(5),
    'act.fw'.padStart(7),
    'calc.cw'.padStart(7),
    'interp'.padStart(7)
  );
  console.log('-'.repeat(150));

  for (const m of mismatches) {
    const ok = m.close ? 'OK' : 'X';
    console.log(
      m.test.padEnd(22).substring(0, 22),
      m.province.padEnd(12),
      m.courier.padEnd(18),
      m.zone.padEnd(10),
      String(m.actual_price.toFixed(2)).padStart(8),
      String(m.calc_price.toFixed(2)).padStart(8),
      String((m.diff >= 0 ? '+' : '') + m.diff).padStart(7),
      String(m.actual_cost.toFixed(2)).padStart(8),
      String(m.calc_cost.toFixed(2)).padStart(8),
      ok.padStart(5),
      String(m.actual_fw).padStart(7),
      String(m.calc_cw).padStart(7),
      String(m.interpolated).padStart(7)
    );
  }

  const okCount = mismatches.filter(m => m.close).length;
  const totalRows = mismatches.length;
  const avgDiff = mismatches.reduce((sum, m) => sum + Math.abs(m.diff), 0) / totalRows;

  console.log('\n── Summary ──');
  console.log('Within 2 baht:', okCount + '/' + totalRows, '(' + (okCount/totalRows*100).toFixed(1) + '%)');
  console.log('Avg |diff|:', avgDiff.toFixed(2), 'baht');

  // Save comparison to JSON
  fs.writeFileSync('validate_comparison.json', JSON.stringify({ mismatches, okCount, totalRows, avgDiff: +avgDiff.toFixed(2) }, null, 2));
  console.log('\nComparison saved -> validate_comparison.json');
})();
