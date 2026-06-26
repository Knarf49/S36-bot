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

const PROVINCES = [
  { th: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110', zone: 'BKK_BKK' },
  { th: 'เชียงใหม่',      sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300', zone: 'BKK_OTHER' },
];

// Gap weights with proportional dims
const WEIGHTS = [
  { label: '4kg',  gram: 4000,  weightKg: 4,  dim: { w: 28, l: 38, h: 20 } },
  { label: '6kg',  gram: 6000,  weightKg: 6,  dim: { w: 32, l: 42, h: 22 } },
  { label: '8kg',  gram: 8000,  weightKg: 8,  dim: { w: 35, l: 45, h: 28 } },
  { label: '9kg',  gram: 9000,  weightKg: 9,  dim: { w: 38, l: 48, h: 28 } },
  { label: '12kg', gram: 12000, weightKg: 12, dim: { w: 40, l: 55, h: 35 } },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) {
    console.log('SESSION EXPIRED! Update cookies.');
    await browser.close();
    process.exit(1);
  }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);
  console.log('CSRF ok\n');

  const results = [];
  const total = PROVINCES.length * WEIGHTS.length;
  let n = 0;

  for (const prov of PROVINCES) {
    for (const tc of WEIGHTS) {
      n++;
      process.stdout.write(`[${n}/${total}] ${prov.th.padEnd(14)} ${tc.label}... `);

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
        console.log(`${result.data.length} couriers`);
        for (const cd of result.data) {
          results.push({
            label: tc.label,
            destination: prov.th,
            zone: prov.zone,
            weight_kg: tc.weightKg,
            dim_w: tc.dim.w, dim_l: tc.dim.l, dim_h: tc.dim.h,
            courier_code: cd.courier_code,
            cost: cd.cost,
            price: cd.price,
            profit: cd.profit,
            cost_policies: cd.cost_policies,
            final_weight: cd.all_weight?.final_weight,
            shipping_type: cd.shipping_type,
          });
        }
      } else {
        console.log(`FAIL: ${result.error}`);
      }

      await page.waitForTimeout(300);
    }
  }

  await browser.close();

  console.log(`\nScraped ${results.length} records.`);

  // Print rate table entries in format ready to paste into rate_calculator.cjs
  console.log('\n=== NEW RATE TABLE ENTRIES ===\n');

  const couriers = [...new Set(results.map(r => r.courier_code))].sort();

  for (const c of couriers) {
    for (const zone of ['BKK_BKK', 'BKK_OTHER']) {
      const zoneRows = results.filter(r => r.courier_code === c && r.zone === zone);
      if (zoneRows.length === 0) continue;

      const newEntries = [...new Map(zoneRows.map(r => [r.weight_kg, { kg: r.weight_kg, cost: Number(r.cost), price: Number(r.price) }])).values()]
        .sort((a, b) => a.kg - b.kg);

      console.log(`// ${c} ${zone} — new entries from gap scrape`);
      for (const e of newEntries) {
        console.log(`//   { kg: ${e.kg}, cost: ${e.cost}, price: ${e.price} },`);
      }
      console.log();
    }
  }

  fs.writeFileSync('scrape_gap_weights.json', JSON.stringify(results, null, 2));
  console.log('Saved: scrape_gap_weights.json');
})();
