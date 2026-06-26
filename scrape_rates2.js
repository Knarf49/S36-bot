const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const xsrf = process.env.TWENTYEXPRESS_XSRF;
  const session = process.env.TWENTYEXPRESS_SESSION;
  if (!xsrf || !session) { console.error('Missing TWENTYEXPRESS_XSRF or TWENTYEXPRESS_SESSION env vars'); process.exit(1); }
  const cookies = [
    { name: 'XSRF-TOKEN', value: xsrf, domain: 'app.twentyexpress.com', path: '/' },
    { name: 'twentyexpress_session', value: session, domain: 'app.twentyexpress.com', path: '/', httpOnly: true }
  ];
  await context.addCookies(cookies);
  const page = await context.newPage();

  // Intercept responses
  const responses = [];
  page.on('response', async (resp) => {
    if (resp.url().includes('/order/compare-price') && resp.status() === 200) {
      try { responses.push(await resp.json()); }
      catch(e) { try { responses.push(await resp.text()); } catch(e2) {} }
    }
  });

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) { console.log('Session expired!'); await browser.close(); process.exit(1); }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);

  // Test scenarios
  const testWeights = [500, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000];
  const testDestinations = [
    { name: 'BKK', sub: 'คลองหลวง', dist: 'คลองหลวง', prov: 'ปทุมธานี', zip: '12120' },
    { name: 'CNX', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', prov: 'เชียงใหม่', zip: '50300' },
    { name: 'HKT', sub: 'ป่าตอง', dist: 'กะทู้', prov: 'ภูเก็ต', zip: '83150' },
    { name: 'KKN', sub: 'ในเมือง', dist: 'เมืองขอนแก่น', prov: 'ขอนแก่น', zip: '40000' },
  ];

  const allResults = [];

  for (const dest of testDestinations) {
    console.log(`\n========== Destination: ${dest.name} (${dest.sub}, ${dest.dist}, ${dest.prov}) ==========`);

    for (const w of testWeights) {
      const kg = w / 1000;
      const dim = kg <= 1 ? { w: 20, l: 30, h: 10 } :
                  kg <= 3 ? { w: 30, l: 40, h: 20 } :
                            { w: 40, l: 50, h: 30 };

      // Fill form
      await page.evaluate(({ dest, w, dim }) => {
        document.querySelector('#dst_name').value = 'Test Recv';
        document.querySelector('#dst_phone').value = '0812345678';
        document.querySelector('#dst_address').value = '123/4 Test Rd';
        document.querySelector('#dst_sub_district').value = dest.sub;
        document.querySelector('#dst_district').value = dest.dist;
        document.querySelector('#dst_province').value = dest.prov;
        document.querySelector('#dst_zipcode').value = dest.zip;
        document.querySelector('#kg_weight').value = w / 1000;
        document.querySelector('#gram_weight').value = w;
        document.querySelector('#weight').value = w;
        document.querySelector('#width').value = dim.w;
        document.querySelector('#length').value = dim.l;
        document.querySelector('#height').value = dim.h;
      }, { dest, w, dim });

      await page.waitForTimeout(200);

      // Call compare-price via jQuery AJAX (in-page)
      const result = await page.evaluate((cs) => {
        return new Promise((resolve) => {
          const arr = $('#createOrderForm').serializeArray();
          arr.push({ name: '_token', value: cs });
          $.getJSON('/order/compare-price', $.param(arr))
            .done(data => resolve({ ok: true, data }))
            .fail((j, s, e) => resolve({ ok: false, error: s }));
        });
      }, csrf);

      if (result.ok && Array.isArray(result.data)) {
        for (const courierData of result.data) {
          allResults.push({
            destination: dest.name,
            dst_sub: dest.sub,
            dst_dist: dest.dist,
            dst_prov: dest.prov,
            dst_zip: dest.zip,
            weight_gram: w,
            weight_kg: kg,
            dim_w: dim.w, dim_l: dim.l, dim_h: dim.h,
            dim_sum: dim.w + dim.l + dim.h,

            courier_code: courierData.courier_code,
            shipping_type: courierData.shipping_type,
            pickup_area_type: courierData.pickup_area_type_check,

            cost: courierData.cost,
            price: courierData.price,
            shop_price: courierData.price_dimension || courierData.price,
            actual_price: courierData.actual_price,
            actual_price_bulky: courierData.actual_price_bulky,
            profit: courierData.profit,
            sum_cost: courierData.sum_cost,
            sum_price: courierData.sum_price,

            final_weight: courierData.all_weight?.final_weight,
            weight_weight: courierData.weight_weight,
            weight_dimension: courierData.weight_dimension,
            weight_side: courierData.weight_side,

            gas_fee: courierData.gas_fee,
            remote_area: courierData.getRemote?.remote_area || courierData.remote,
            remote_area_price: courierData.getRemote?.remote_area_price || 0,
            remote_area_shop: courierData.getRemote?.remote_area_shop || 0,
            remote_percent: courierData.remote_percent || 0,
            dimension_percent: courierData.dimension_percent || 0,

            cost_cod_fee: courierData.cost_cod_fee,
            price_cod_fee: courierData.price_cod_fee,
            cost_cod_fee_rate: courierData.cost_cod_fee_rate,

            cost_insurance_fee: courierData.cost_insurance_fee,
            price_insurance_fee: courierData.price_insurance_fee,
            insurance_status: courierData.insurance_status,
            insurance_message: courierData.insurance_message,

            price_box_shield_fee: courierData.price_box_shield_fee,
            on_time_price: courierData.on_time_price,
            discount_price: courierData.discount_price,
            cost_policies: courierData.cost_policies,
            price_policies: courierData.price_policies,
            dimension: courierData.dimension,
          });
        }

        console.log(`  ${kg}kg ${dim.w}x${dim.l}x${dim.h} -> ${result.data.length} couriers`);
        for (const c of result.data) {
          console.log(`    ${c.courier_code} | cost:${c.cost} sell:${c.price} profit:${c.profit} gas:${c.gas_fee} remote:${c.getRemote?.remote_area||c.remote||0} weight:${c.all_weight?.final_weight} type:${c.shipping_type}`);
        }
      } else {
        console.log(`  ${kg}kg ${dim.w}x${dim.l}x${dim.h} -> ERROR: ${JSON.stringify(result.error || 'unknown')}`);
      }

      await page.waitForTimeout(500);
    }
  }

  // Save raw JSON
  fs.writeFileSync('rates_all.json', JSON.stringify(allResults, null, 2));
  console.log(`\n\nTotal results: ${allResults.length}`);

  // ======== CSV 1: FULL RATE TABLE ========
  const fullHeaders = [
    'destination', 'dst_prov', 'dst_zip',
    'courier_code', 'shipping_type', 'pickup_area_type',
    'weight_kg', 'weight_gram',
    'dim_w', 'dim_l', 'dim_h', 'dim_sum',
    'final_weight', 'weight_weight', 'weight_dimension', 'weight_side',
    'cost', 'price', 'shop_price', 'actual_price', 'actual_price_bulky',
    'profit', 'sum_cost', 'sum_price',
    'gas_fee', 'remote_area', 'remote_area_price', 'remote_area_shop',
    'remote_percent', 'dimension_percent',
    'cost_cod_fee', 'price_cod_fee', 'cost_cod_fee_rate',
    'cost_insurance_fee', 'price_insurance_fee', 'insurance_status',
    'price_box_shield_fee', 'on_time_price', 'discount_price',
    'cost_policies', 'price_policies', 'dimension'
  ];

  let fullCSV = fullHeaders.join(',') + '\n';
  for (const r of allResults) {
    fullCSV += fullHeaders.map(h => {
      const v = r[h] !== undefined && r[h] !== null ? String(r[h]) : '';
      return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g,'""')}"` : v;
    }).join(',') + '\n';
  }
  fs.writeFileSync('rates_full.csv', '\uFEFF' + fullCSV);
  console.log('Full CSV: rates_full.csv');

  // ======== CSV 2: SUMMARY (pivot: courier x weight per destination) ========
  let summaryCSV = 'destination,courier_code,weight_kg,dim_sum,final_weight,shipping_type,cost,price,shop_price,profit,gas_fee,remote_area,remote_area_price\n';
  for (const r of allResults) {
    summaryCSV += [
      r.destination, r.courier_code, r.weight_kg, r.dim_sum,
      r.final_weight, r.shipping_type, r.cost, r.price,
      r.shop_price, r.profit, r.gas_fee,
      r.remote_area, r.remote_area_price
    ].join(',') + '\n';
  }
  fs.writeFileSync('rates_summary.csv', '\uFEFF' + summaryCSV);
  console.log('Summary CSV: rates_summary.csv');

  // ======== CSV 3: PIVOT TABLE (courier x weight for BKK) ========
  const bkkData = allResults.filter(r => r.destination === 'BKK');
  const couriers = [...new Set(bkkData.map(r => r.courier_code))];
  const weights = [...new Set(bkkData.map(r => r.weight_kg))].sort((a,b) => a-b);

  let pivotCSV = 'weight_kg';
  for (const c of couriers) pivotCSV += `,${c}_cost,${c}_sell,${c}_profit,${c}_gas`;
  pivotCSV += '\n';

  for (const w of weights) {
    pivotCSV += w;
    for (const c of couriers) {
      const row = bkkData.find(r => r.courier_code === c && r.weight_kg === w);
      if (row) pivotCSV += `,${row.cost},${row.price},${row.profit},${row.gas_fee}`;
      else pivotCSV += ',,,,';
    }
    pivotCSV += '\n';
  }
  fs.writeFileSync('rates_pivot_bkk.csv', '\uFEFF' + pivotCSV);
  console.log('Pivot BKK: rates_pivot_bkk.csv');

  await browser.close();
  console.log('\nDone.');
})();
