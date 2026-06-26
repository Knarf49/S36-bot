'use strict';
const { chromium } = require('playwright');
const fs = require('fs');

const src = fs.readFileSync('scrape_all_provinces.js', 'utf8');
const cookies = eval(src.match(/const cookies = (\[[\s\S]*?\])/)[1]);

const DIMSUM_POINTS = [];
for (let ds = 80; ds <= 140; ds += 4) DIMSUM_POINTS.push(ds);
[82,86,90,92,94,96,102,106,112,116,122,126,132,136].forEach(ds => { if(!DIMSUM_POINTS.includes(ds)) DIMSUM_POINTS.push(ds); });
DIMSUM_POINTS.sort((a,b)=>a-b);

const PROV = { th: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110' };

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
  console.log('BKK calibration:', DIMSUM_POINTS.length, 'points...');

  for (const ds of DIMSUM_POINTS) {
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
      const row = { dimSum: ds, dims: w+'x'+l+'x'+h, couriers: {} };
      for (const cd of r) {
        row.couriers[cd.courier_code] = {
          fw: cd.all_weight?.final_weight,
          weight_side: cd.weight_side,
          cost_policies: cd.cost_policies,
          price: cd.price, cost: cd.cost,
        };
      }
      results.push(row);
      process.stdout.write('.');
    } else { process.stdout.write('x'); }
    await page.waitForTimeout(150);
  }
  await browser.close();

  console.log('\n\n// Flash BKK_BKK dim table');
  const fDim = {};
  results.forEach(r => {
    const f = r.couriers.DPFLASHA;
    if (f && f.cost_policies === 'dimension') {
      const fw = Number(f.fw);
      if (!fDim[fw]) fDim[fw] = { cost: Number(f.cost), price: Number(f.price) };
    }
  });
  Object.entries(fDim).sort((a,b)=>Number(a[0])-Number(b[0])).forEach(([fw, v]) => {
    console.log('  { kg: ' + fw + ', cost: ' + v.cost + ', price: ' + v.price + ' },');
  });

  console.log('\n// DHL BKK_BKK dim table');
  const dDim = {};
  results.forEach(r => {
    const d = r.couriers.DPDHL;
    if (d && d.cost_policies === 'dimension') {
      const fw = Number(d.fw);
      if (!dDim[fw]) dDim[fw] = { cost: Number(d.cost), price: Number(d.price) };
    }
  });
  Object.entries(dDim).sort((a,b)=>Number(a[0])-Number(b[0])).forEach(([fw, v]) => {
    console.log('  { kg: ' + fw + ', cost: ' + v.cost + ', price: ' + v.price + ' },');
  });

  // Side-weight verification (should match BKK_OTHER since same courier logic)
  console.log('\n// BKK Flash weight_side (verify same as BKK_OTHER)');
  results.forEach(r => {
    const f = r.couriers.DPFLASHA;
    if (f) console.log('  dimSum=' + String(r.dimSum).padStart(3) + ' sideWt=' + (f.weight_side||'-').padStart(2) + ' FW=' + (f.fw||'-'));
  });

  fs.writeFileSync('calibrate_dimsum_bkk.json', JSON.stringify(results, null, 2));
  console.log('\nSaved: calibrate_dimsum_bkk.json');
})();
