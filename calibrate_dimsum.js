'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'scrape_all_provinces.js'), 'utf8');
const m = src.match(/const cookies = (\[[\s\S]*?\]);/);
if (!m) { console.error('Cannot find cookies'); process.exit(1); }
const cookies = eval(m[1]);

// Scan dimSum 80-140 at step 2, plus boundaries
const DIMSUM_POINTS = [];
for (let ds = 80; ds <= 140; ds += 2) DIMSUM_POINTS.push(ds);
// Extra boundary points
[83, 84, 89, 90, 94, 95, 96, 99, 100, 104, 105, 109, 110, 113, 114, 119, 120, 124, 125, 129, 130, 134, 135].forEach(ds => {
  if (!DIMSUM_POINTS.includes(ds)) DIMSUM_POINTS.push(ds);
});
DIMSUM_POINTS.sort((a, b) => a - b);

const PROV = { th: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' };
const BASE_WEIGHT = 5; // kg — mid-range to trigger dim for all couriers

function dimsForDimSum(ds) {
  // Distribute: w ≈ ds*0.3, l ≈ ds*0.4, h ≈ ds*0.3
  const w = Math.round(ds * 0.3 * 10) / 10;
  const l = Math.round(ds * 0.4 * 10) / 10;
  const h = Math.round((ds - w - l) * 10) / 10;
  return { w, l, h, sum: +(w + l + h).toFixed(1) };
}

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
  console.log('CSRF ok. Scanning', DIMSUM_POINTS.length, 'dimSum points...\n');

  const results = [];
  for (let i = 0; i < DIMSUM_POINTS.length; i++) {
    const ds = DIMSUM_POINTS[i];
    const dim = dimsForDimSum(ds);
    process.stdout.write(`[${String(i+1).padStart(3)}/${DIMSUM_POINTS.length}] dimSum=${ds} (${dim.w}x${dim.l}x${dim.h})... `);

    await page.evaluate(({ prov, wkg, dim }) => {
      document.querySelector('#dst_name').value = 'Cal';
      document.querySelector('#dst_phone').value = '0812345678';
      document.querySelector('#dst_address').value = '1';
      document.querySelector('#dst_sub_district').value = prov.sub;
      document.querySelector('#dst_district').value = prov.dist;
      document.querySelector('#dst_province').value = prov.th;
      document.querySelector('#dst_zipcode').value = prov.zip;
      document.querySelector('#kg_weight').value = wkg;
      document.querySelector('#gram_weight').value = wkg * 1000;
      document.querySelector('#weight').value = wkg * 1000;
      document.querySelector('#width').value = dim.w;
      document.querySelector('#length').value = dim.l;
      document.querySelector('#height').value = dim.h;
    }, { prov: PROV, wkg: BASE_WEIGHT, dim });

    await page.waitForTimeout(300);

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
      const row = { dimSum: ds, dim_w: dim.w, dim_l: dim.l, dim_h: dim.h, couriers: {} };
      for (const cd of result.data) {
        row.couriers[cd.courier_code] = {
          fw: cd.all_weight?.final_weight,
          weight_side: cd.weight_side,
          cost_policies: cd.cost_policies,
          price: cd.price,
          cost: cd.cost,
        };
      }
      results.push(row);
      console.log(`${result.data.length} ok`);
    } else {
      console.log(`FAIL`);
    }
    await page.waitForTimeout(200);
  }
  await browser.close();

  fs.writeFileSync('calibrate_dimsum.json', JSON.stringify(results, null, 2));

  // Print side-weight tables
  const couriers = ['DPFLASHA', 'DPDHL', 'DPFLASHLIVEBULKY'];
  for (const c of couriers) {
    console.log(`\n=== ${c} side-weight from weight_side field ===`);
    console.log('dimSum  weight_side  FW  policy');
    for (const r of results) {
      const cd = r.couriers[c];
      if (!cd) continue;
      console.log(
        String(r.dimSum).padStart(6),
        String(cd.weight_side || '-').padStart(11),
        String(cd.fw || '-').padStart(4),
        String(cd.cost_policies || '-').padStart(8)
      );
    }
  }

  console.log('\nSaved: calibrate_dimsum.json');
})();
