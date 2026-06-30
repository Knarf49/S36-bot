require('dotenv').config();
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  await ctx.addCookies([
    { name: 'XSRF-TOKEN', value: process.env.TWENTYEXPRESS_XSRF, domain: 'app.twentyexpress.com', path: '/' },
    { name: 'twentyexpress_session', value: process.env.TWENTYEXPRESS_SESSION, domain: 'app.twentyexpress.com', path: '/', httpOnly: true }
  ]);
  const page = await ctx.newPage();
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  if (page.url().includes('/login')) { console.log('Session expired'); await b.close(); process.exit(1); }
  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);

  await page.evaluate((prov) => {
    document.querySelector('#dst_name').value = 'Test';
    document.querySelector('#dst_phone').value = '0812345678';
    document.querySelector('#dst_address').value = '123/4';
    document.querySelector('#dst_sub_district').value = prov.sub;
    document.querySelector('#dst_district').value = prov.dist;
    document.querySelector('#dst_province').value = prov.th;
    document.querySelector('#dst_zipcode').value = prov.zip;
    document.querySelector('#kg_weight').value = 2;
    document.querySelector('#gram_weight').value = 2000;
    document.querySelector('#weight').value = 2000;
    document.querySelector('#width').value = 20;
    document.querySelector('#length').value = 30;
    document.querySelector('#height').value = 10;
  }, { th: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' });

  await page.waitForTimeout(500);

  const result = await page.evaluate((cs) => {
    return new Promise(resolve => {
      const arr = $('#createOrderForm').serializeArray();
      arr.push({ name: '_token', value: cs });
      $.getJSON('/order/compare-price', $.param(arr))
        .done(d => resolve({ ok: true, data: d }))
        .fail((j, s, e) => resolve({ ok: false, error: s }));
    });
  }, csrf);

  if (result.ok) {
    const f = result.data.find(c => c.courier_code === 'DPFLASHA');
    if (f) console.log('Live: Flash cost=' + f.cost + ' price=' + f.price + ' FW=' + (f.all_weight ? f.all_weight.final_weight : '?') + ' zone=' + f.shipping_type);
    console.log('\nAll couriers (เชียงใหม่ 2kg 20x30x10):');
    result.data.forEach(c => {
      console.log('  ' + c.courier_code.padEnd(20) + 'cost=' + String(c.cost).padStart(5) + '  price=' + String(c.price).padStart(5));
    });
  } else {
    console.log('FAIL:', result.error);
  }
  await b.close();
})();
