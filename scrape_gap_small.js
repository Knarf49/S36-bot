'use strict';
const { chromium } = require('playwright');
const fs = require('fs');

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

// Small dims: dimSum < 80 → no courier triggers dimension pricing
const WEIGHTS = [
  { label: '4kg',  gram: 4000,  weightKg: 4,  dim: { w: 15, l: 20, h: 10 } },  // dimSum=45
  { label: '6kg',  gram: 6000,  weightKg: 6,  dim: { w: 18, l: 25, h: 12 } },  // dimSum=55
  { label: '8kg',  gram: 8000,  weightKg: 8,  dim: { w: 20, l: 30, h: 15 } },  // dimSum=65
  { label: '9kg',  gram: 9000,  weightKg: 9,  dim: { w: 22, l: 32, h: 16 } },  // dimSum=70
  { label: '12kg', gram: 12000, weightKg: 12, dim: { w: 25, l: 35, h: 18 } },  // dimSum=78
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  if (page.url().includes('/login')) { console.log('SESSION EXPIRED'); await browser.close(); process.exit(1); }
  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);
  console.log('CSRF ok\n');

  const results = [];
  for (const prov of PROVINCES) {
    for (const tc of WEIGHTS) {
      process.stdout.write(`${prov.th.padEnd(14)} ${tc.label} dimSum=${tc.dim.w+tc.dim.l+tc.dim.h}... `);

      await page.evaluate(({ prov, tc }) => {
        document.querySelector('#dst_name').value = 'Test';
        document.querySelector('#dst_phone').value = '0812345678';
        document.querySelector('#dst_address').value = '1';
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

      await page.waitForTimeout(300);
      const r = await page.evaluate((cs) => {
        return new Promise((resolve) => {
          const arr = $('#createOrderForm').serializeArray();
          arr.push({ name: '_token', value: cs });
          $.getJSON('/order/compare-price', $.param(arr))
            .done(data => resolve(data))
            .fail(() => resolve(null));
        });
      }, csrf);

      if (r) {
        console.log(`${r.length} ok`);
        for (const cd of r) {
          results.push({
            label: tc.label, destination: prov.th, zone: prov.zone,
            weight_kg: tc.weightKg, dim_w: tc.dim.w, dim_l: tc.dim.l, dim_h: tc.dim.h,
            courier_code: cd.courier_code, cost: cd.cost, price: cd.price,
            cost_policies: cd.cost_policies, final_weight: cd.all_weight?.final_weight,
          });
        }
      } else { console.log('FAIL'); }
      await page.waitForTimeout(200);
    }
  }
  await browser.close();

  // Print weight-based entries
  console.log('\n=== Weight-based rate entries (dimSum < 80) ===\n');
  const couriers = [...new Set(results.map(r => r.courier_code))].sort();
  for (const c of couriers) {
    for (const zone of ['BKK_BKK', 'BKK_OTHER']) {
      const zr = results.filter(r => r.courier_code === c && r.zone === zone);
      if (!zr.length) continue;
      const entries = zr.map(r => ({ kg: r.weight_kg, cost: Number(r.cost), price: Number(r.price) }));
      entries.sort((a,b) => a.kg - b.kg);
      console.log(`// ${c} ${zone} (weight-based, small dims)`);
      for (const e of entries) console.log(`//   { kg: ${e.kg}, cost: ${e.cost}, price: ${e.price} },`);
      console.log();
    }
  }
  fs.writeFileSync('scrape_gap_small.json', JSON.stringify(results, null, 2));
})();
