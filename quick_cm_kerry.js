const { chromium } = require('playwright');

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

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) { console.log('Session expired!'); await browser.close(); process.exit(1); }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);

  const prov = { th: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' };
  const weightGram = 1300;
  const dim = { w: 21, l: 30, h: 21 };

  console.log(`Querying ${prov.th} ${weightGram / 1000}kg ${dim.w}x${dim.l}x${dim.h}cm...`);

  await page.evaluate(({ prov, gram, dim }) => {
    document.querySelector('#dst_name').value = 'Test';
    document.querySelector('#dst_phone').value = '0812345678';
    document.querySelector('#dst_address').value = '123/4';
    document.querySelector('#dst_sub_district').value = prov.sub;
    document.querySelector('#dst_district').value = prov.dist;
    document.querySelector('#dst_province').value = prov.th;
    document.querySelector('#dst_zipcode').value = prov.zip;
    document.querySelector('#kg_weight').value = gram / 1000;
    document.querySelector('#gram_weight').value = gram;
    document.querySelector('#weight').value = gram;
    document.querySelector('#width').value = dim.w;
    document.querySelector('#length').value = dim.l;
    document.querySelector('#height').value = dim.h;
  }, { prov, gram: weightGram, dim });

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

  console.log(`\n=== Result: ${result.ok ? result.data.length + ' couriers' : 'FAIL: ' + result.error} ===\n`);

  if (result.ok && Array.isArray(result.data)) {
    for (const cd of result.data) {
      console.log(`--- ${cd.courier_code} (${cd.shipping_type}) ---`);
      console.log(`  ต้นทุน(cost):          ${cd.cost} บาท`);
      console.log(`  ราคาขาย(price):        ${cd.price} บาท`);
      console.log(`  กำไร(profit):          ${cd.profit} บาท`);
      console.log(`  sum_cost:              ${cd.sum_cost}`);
      console.log(`  sum_price:             ${cd.sum_price}`);
      console.log(`  final_weight:          ${cd.all_weight?.final_weight} ${cd.courier_code === 'DPTHAIPOST' ? 'g' : 'kg'}`);
      console.log(`  weight_weight:         ${cd.weight_weight}`);
      console.log(`  weight_dimension:      ${cd.weight_dimension}`);
      console.log(`  weight_side:           ${cd.weight_side}`);
      console.log(`  gas_fee:               ${cd.gas_fee}`);
      console.log(`  remote_area:           ${cd.getRemote?.remote_area || cd.remote}`);
      console.log(`  remote_area_price:     ${cd.getRemote?.remote_area_price || 0}`);
      console.log(`  remote_area_shop:      ${cd.getRemote?.remote_area_shop || 0}`);
      console.log(`  actual_price:          ${cd.actual_price}`);
      console.log(`  actual_price_bulky:    ${cd.actual_price_bulky}`);
      console.log(`  price_dimension:       ${cd.price_dimension}`);
      console.log(`  dimension:             ${cd.dimension}`);
      console.log(`  cost_policies:         ${cd.cost_policies}`);
      console.log(`  price_policies:        ${cd.price_policies}`);
      console.log(`  pickup_area_type:      ${cd.pickup_area_type_check}`);
      console.log(`  on_time_price:         ${cd.on_time_price}`);
      console.log();
    }
  }

  await browser.close();
})();
