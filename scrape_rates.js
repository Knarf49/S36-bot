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

  // Capture AJAX responses from compare-price
  const priceResults = [];
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/order/compare-price') && resp.status() === 200) {
      try {
        const text = await resp.text();
        priceResults.push({ url, html: text, time: Date.now() });
      } catch(e) {}
    }
  });

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const pageUrl = page.url();
  if (pageUrl.includes('/login')) {
    console.log('Session expired!');
    await browser.close();
    process.exit(1);
  }

  // Get available couriers, boxes, categories from select options
  const couriers = await page.evaluate(() => {
    const sel = document.querySelector('#courier_code');
    if (!sel) return [];
    return Array.from(sel.options).map(o => ({ value: o.value, text: o.textContent.trim() }));
  });
  console.log(`\nCouriers (${couriers.length}):`);
  couriers.forEach(c => console.log(`  ${c.value} - ${c.text}`));

  const boxes = await page.evaluate(() => {
    const sel = document.querySelector('#box_id');
    if (!sel) return [];
    return Array.from(sel.options).map(o => ({ value: o.value, text: o.textContent.trim() }));
  });
  console.log(`\nBoxes (${boxes.length}):`);
  boxes.forEach(b => console.log(`  ${b.value} - ${b.text}`));

  const categories = await page.evaluate(() => {
    const sel = document.querySelector('#category_id');
    if (!sel) return [];
    return Array.from(sel.options).map(o => ({ value: o.value, text: o.textContent.trim() }));
  });
  console.log(`\nCategories (${categories.length}):`);
  categories.forEach(c => console.log(`  ${c.value} - ${c.text}`));

  // Default test parameters
  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);

  // Store all results here
  const allResults = [];

  // Test weights: 0.5, 1, 2, 3, 5, 7, 10, 15, 20 kg (in grams)
  const testWeights = [500, 1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000];
  const testDimensions = [
    { w: 20, l: 30, h: 10 },
    { w: 30, l: 40, h: 20 },
    { w: 40, l: 50, h: 30 },
    { w: 50, l: 60, h: 40 },
  ];

  // Filter to actual couriers
  const activeCouriers = couriers.filter(c => c.value);
  const defaultBox = boxes.find(b => b.value) || { value: '' };
  const defaultCat = categories.find(c => c.value) || { value: '' };

  console.log(`\n\n=== Testing ${activeCouriers.length} couriers x ${testWeights.length} weights ===\n`);

  for (const courier of activeCouriers) {
    console.log(`\n--- ${courier.text} (${courier.value}) ---`);

    // First set the courier to trigger checkPacel/checkCourierOpt
    await page.selectOption('#courier_code', courier.value);
    await page.waitForTimeout(500);

    // Wait for any AJAX from checkCourierOpt
    await page.waitForTimeout(500);

    for (let wi = 0; wi < testWeights.length; wi++) {
      const weightGram = testWeights[wi];
      const dim = testDimensions[Math.min(wi, testDimensions.length - 1)];

      // Fill form
      await page.evaluate(({ w, d, csrf: cs }) => {
        // Receiver data
        document.querySelector('#dst_name').value = 'ทดสอบรับ';
        document.querySelector('#dst_phone').value = '0812345678';
        document.querySelector('#dst_address').value = '123/4 ถนนทดสอบ';
        document.querySelector('#dst_sub_district').value = 'คลองหลวง';
        document.querySelector('#dst_district').value = 'คลองหลวง';
        document.querySelector('#dst_province').value = 'ปทุมธานี';
        document.querySelector('#dst_zipcode').value = '12120';

        // Parcel data
        document.querySelector('#kg_weight').value = w / 1000;
        document.querySelector('#gram_weight').value = w;
        document.querySelector('#weight').value = w;
        document.querySelector('#width').value = d.w;
        document.querySelector('#length').value = d.l;
        document.querySelector('#height').value = d.h;
      }, { w: weightGram, d: dim, csrf: csrf });

      // Call comparePrice via AJAX
      try {
        const ajaxResult = await page.evaluate((cs) => {
          return new Promise((resolve, reject) => {
            const arr = $('#createOrderForm').serializeArray();
            arr.push({ name: '_token', value: cs });
            const fd = $.param(arr);
            $.get('/order/compare-price', fd)
              .done(html => resolve({ success: true, html }))
              .fail(err => resolve({ success: false, error: err.statusText }));
          });
        }, csrf);

        if (ajaxResult.success) {
          // Parse HTML response to extract price fields
          // Set the HTML into a temp div for parsing
          const priceData = await page.evaluate((html) => {
            const div = document.createElement('div');
            div.innerHTML = html;

            const getVal = (sel) => {
              const el = div.querySelector(sel);
              return el ? el.value || el.textContent?.trim() || '' : '';
            };

            return {
              dropoff_cost_price: getVal('#dropoff_cost_price'),
              actual_price: getVal('#actual_price'),
              total_price: getVal('#total_price'),
              dropoff_shop_price: getVal('#dropoff_shop_price'),
              remote_price: getVal('#remote_price'),
              gas_fee: getVal('#gas_fee'),
              weight_weight: getVal('#weight_weight'),
              weight_dimension: getVal('#weight_dimension'),
              weight_side: getVal('#weight_side'),
              actual_price_bulky: getVal('#actual_price_bulky'),
              dropoff_cost_remote_price: getVal('#dropoff_cost_remote_price'),
              dropoff_cost_dimension_price: getVal('#dropoff_cost_dimension_price'),
              dropoff_cost_cod_fee: getVal('#dropoff_cost_cod_fee'),
              dropoff_insurance_fee_price: getVal('#dropoff_insurance_fee_price'),
              price_box_shield_fee: getVal('#price_box_shield_fee'),
              dropoff_on_time_price: getVal('#dropoff_on_time_price'),
              dropoff_cost_policies: getVal('#dropoff_cost_policies'),
              dropoff_shop_policies: getVal('#dropoff_shop_policies'),
              dropoff_customer_price: getVal('#dropoff_customer_price'),
              dropoff_price_cod_fee: getVal('#dropoff_price_cod_fee'),
              dropoff_cost_remote_percent: getVal('#dropoff_cost_remote_percent'),
              dropoff_cost_dimension_percent: getVal('#dropoff_cost_dimension_percent'),
            };
          }, ajaxResult.html);

          priceData.courier = courier.value;
          priceData.courier_name = courier.text;
          priceData.weight_gram = weightGram;
          priceData.weight_kg = weightGram / 1000;
          priceData.width = dim.w;
          priceData.length = dim.l;
          priceData.height = dim.h;
          priceData.dim_sum = dim.w + dim.l + dim.h;

          allResults.push(priceData);

          const profit = (parseFloat(priceData.actual_price) - parseFloat(priceData.dropoff_cost_price)).toFixed(2) || '-';
          console.log(`  ${weightGram/1000}kg ${dim.w}x${dim.l}x${dim.h} | cost:${priceData.dropoff_cost_price} sell:${priceData.actual_price} total:${priceData.total_price} profit:${profit} remote:${priceData.remote_price}`);
        } else {
          console.log(`  ${weightGram/1000}kg ${dim.w}x${dim.l}x${dim.h} | ERROR: ${ajaxResult.error}`);
        }
      } catch(e) {
        console.log(`  ${weightGram/1000}kg ${dim.w}x${dim.l}x${dim.h} | EXCEPTION: ${e.message}`);
      }

      // Delay between requests
      await page.waitForTimeout(300);
    }
  }

  // Save raw results
  fs.writeFileSync('rate_results.json', JSON.stringify(allResults, null, 2));
  console.log(`\n\nSaved ${allResults.length} results to rate_results.json`);

  // Generate CSV
  const headers = [
    'courier', 'courier_name', 'weight_kg', 'weight_gram',
    'width', 'length', 'height', 'dim_sum',
    'dropoff_cost_price', 'actual_price', 'total_price',
    'dropoff_shop_price', 'remote_price', 'gas_fee',
    'weight_weight', 'weight_dimension', 'weight_side',
    'actual_price_bulky', 'dropoff_cost_remote_price',
    'dropoff_cost_dimension_price', 'dropoff_cost_cod_fee',
    'dropoff_insurance_fee_price', 'price_box_shield_fee',
    'dropoff_on_time_price', 'dropoff_cost_policies',
    'dropoff_shop_policies', 'dropoff_customer_price',
    'dropoff_price_cod_fee', 'dropoff_cost_remote_percent',
    'dropoff_cost_dimension_percent'
  ];

  let csv = headers.join(',') + '\n';
  for (const row of allResults) {
    const vals = headers.map(h => {
      const v = row[h] !== undefined ? String(row[h]) : '';
      return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
    });
    csv += vals.join(',') + '\n';
  }

  fs.writeFileSync('rate_table.csv', '\uFEFF' + csv); // BOM for Thai Excel
  console.log(`CSV saved to rate_table.csv`);

  // Pivot: courier x weight summary
  console.log('\n\n=== PRICE SUMMARY BY COURIER x WEIGHT ===');
  const courierGroups = {};
  for (const r of allResults) {
    const key = r.courier_name;
    if (!courierGroups[key]) courierGroups[key] = [];
    courierGroups[key].push(r);
  }

  // Simple summary CSV
  let summaryCSV = 'Courier,Weight(kg),Cost,Sell,Profit,GasFee,RemoteArea,WeightUsed,DimensionWeight,SideWeight\n';
  for (const [cName, rows] of Object.entries(courierGroups)) {
    for (const r of rows) {
      const wkg = (r.weight_gram / 1000).toFixed(1);
      const profit = (parseFloat(r.actual_price || 0) - parseFloat(r.dropoff_cost_price || 0)).toFixed(2);
      summaryCSV += `${cName},${wkg},${r.dropoff_cost_price},${r.actual_price},${profit},${r.gas_fee},${r.remote_price},${r.weight_weight},${r.weight_dimension},${r.weight_side}\n`;
    }
  }
  fs.writeFileSync('rate_summary.csv', '\uFEFF' + summaryCSV);
  console.log(`Summary CSV saved to rate_summary.csv`);

  await browser.close();
  console.log('\nDone.');
})();
