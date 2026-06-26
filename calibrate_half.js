'use strict';
const { chromium } = require('playwright');
const fs = require('fs');

const src = fs.readFileSync('scrape_all_provinces.js', 'utf8');
const cookies = eval(src.match(/const cookies = (\[[\s\S]*?\])/)[1]);

// .5 dimSum points around current boundaries + V3 failure points
const POINTS = [];
// Boundary regions (current breaks at 82,86,92,96,102,106,112,116,122,126,132)
[81.5, 82.5, 85.5, 86.5, 90.5, 91.5, 92.5, 95.5, 96.5, 100.5, 101.5, 102.5, 105.5, 106.5, 111.5, 112.5, 115.5, 116.5, 121.5, 122.5, 125.5, 126.5, 131.5, 132.5, 135.5, 136.5,
 // DHL boundaries (breaks at 82,92,102,112,122,126,132)
 44.5, 81.5, 82.5, 91.5, 92.5, 101.5, 102.5, 111.5, 112.5
].forEach(ds => { if (!POINTS.includes(ds)) POINTS.push(ds); });
POINTS.sort((a,b)=>a-b);

console.log('Scanning', POINTS.length, 'dimSum points (BKK_OTHER)...');

const PROV = { th: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' };

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  if (page.url().includes('/login')) { console.log('SESSION EXPIRED'); await browser.close(); process.exit(1); }
  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);

  const results = [];
  for (const ds of POINTS) {
    const w = Math.round(ds * 0.3 * 10) / 10;
    const l = Math.round(ds * 0.4 * 10) / 10;
    const h = +(ds - w - l).toFixed(1);

    await page.evaluate(({ prov, w, l, h }) => {
      document.querySelector('#dst_name').value = 'Cal';
      document.querySelector('#dst_phone').value = '0812345678';
      document.querySelector('#dst_address').value = '1';
      document.querySelector('#dst_sub_district').value = prov.sub;
      document.querySelector('#dst_district').value = prov.dist;
      document.querySelector('#dst_province').value = prov.th;
      document.querySelector('#dst_zipcode').value = prov.zip;
      document.querySelector('#kg_weight').value = 5;
      document.querySelector('#gram_weight').value = 5000;
      document.querySelector('#weight').value = 5000;
      document.querySelector('#width').value = w;
      document.querySelector('#length').value = l;
      document.querySelector('#height').value = h;
    }, { prov: PROV, w, l, h });

    await page.waitForTimeout(250);
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
      const row = { dimSum: ds };
      for (const cd of r) {
        row[cd.courier_code] = {
          fw: cd.all_weight?.final_weight,
          sideWt: cd.weight_side,
          policy: cd.cost_policies,
          price: cd.price, cost: cd.cost,
        };
      }
      results.push(row);
      process.stdout.write('.');
    } else { process.stdout.write('x'); }
    await page.waitForTimeout(150);
  }
  await browser.close();

  // Print Flash sideWt at each dimSum
  console.log('\n\nFlash sideWt:');
  results.forEach(r => {
    const f = r.DPFLASHA;
    if (f) console.log('  ' + String(r.dimSum).padStart(6) + ' → sideWt=' + String(f.sideWt||'-').padStart(2) + ' FW=' + String(f.fw||'-').padStart(2) + ' policy=' + (f.policy||'-'));
  });

  console.log('\nDHL sideWt:');
  results.forEach(r => {
    const d = r.DPDHL;
    if (d) console.log('  ' + String(r.dimSum).padStart(6) + ' → sideWt=' + String(d.sideWt||'-').padStart(2) + ' FW=' + String(d.fw||'-').padStart(2) + ' policy=' + (d.policy||'-'));
  });

  fs.writeFileSync('calibrate_half.json', JSON.stringify(results, null, 2));
})();
