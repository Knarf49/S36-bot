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
  { th: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110' },
  { th: 'เชียงใหม่',      sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' },
];

// Weights not covered by existing scrape (1/5/10kg) or validation (0.5/2.5/3/7/15)
const WEIGHTS = [
  { label: '0.5kg_tiny',   gram: 500,   weightKg: 0.5,  dim: { w: 15, l: 20, h: 8 } },
  { label: '2kg_std',      gram: 2000,  weightKg: 2,    dim: { w: 20, l: 30, h: 10 } },
  { label: '3kg_std',      gram: 3000,  weightKg: 3,    dim: { w: 20, l: 30, h: 10 } },
  { label: '7kg_std',      gram: 7000,  weightKg: 7,    dim: { w: 30, l: 40, h: 20 } },
  { label: '15kg_std',     gram: 15000, weightKg: 15,   dim: { w: 40, l: 50, h: 30 } },
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
    console.log('SESSION EXPIRED — update cookies in scrape_all_provinces.js');
    await browser.close();
    process.exit(1);
  }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);
  console.log('CSRF ok');

  const results = [];
  const total = PROVINCES.length * WEIGHTS.length;
  let n = 0;

  for (const prov of PROVINCES) {
    for (const tc of WEIGHTS) {
      n++;
      process.stdout.write(`[${n}/${total}] ${prov.th} ${tc.label}... `);

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
          results.push({
            label: tc.label,
            destination: prov.th,
            weight_gram: tc.gram, weight_kg: tc.weightKg,
            dim_w: tc.dim.w, dim_l: tc.dim.l, dim_h: tc.dim.h,
            dim_sum: tc.dim.w + tc.dim.l + tc.dim.h,
            courier_code: cd.courier_code,
            shipping_type: cd.shipping_type,
            cost: cd.cost, price: cd.price, profit: cd.profit,
            final_weight: cd.all_weight?.final_weight,
            weight_weight: cd.weight_weight,
            weight_dimension: cd.weight_dimension,
            weight_side: cd.weight_side,
            gas_fee: cd.gas_fee,
            cost_policies: cd.cost_policies,
            price_policies: cd.price_policies,
            actual_price: cd.actual_price,
            shop_price: cd.price_dimension || cd.price,
            sum_cost: cd.sum_cost,
          });
        }
        process.stdout.write(`${result.data.length} couriers\n`);
      } else {
        process.stdout.write(`FAIL: ${result.error || 'empty'}\n`);
      }
      await page.waitForTimeout(300);
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'scrape_extra_weights.json'), JSON.stringify(results, null, 2));
  console.log(`\n${results.length} records saved -> scrape_extra_weights.json`);
})();
