require('dotenv').config();
const { chromium } = require('playwright');

const tests = [
  { label: 'เชียงใหม่ 5kg', prov: { th: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' }, gram: 5000, dim: { w: 30, l: 40, h: 20 } },
  { label: 'กรุงเทพมหานคร 5kg', prov: { th: 'กรุงเทพมหานคร', sub: 'คลองตัน', dist: 'คลองเตย', zip: '10110' }, gram: 5000, dim: { w: 30, l: 40, h: 20 } },
  { label: 'เชียงใหม่ 1kg', prov: { th: 'เชียงใหม่', sub: 'ช้างเผือก', dist: 'เมืองเชียงใหม่', zip: '50300' }, gram: 1000, dim: { w: 20, l: 30, h: 10 } },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const xsrf = process.env.TWENTYEXPRESS_XSRF;
  const session = process.env.TWENTYEXPRESS_SESSION;
  if (!xsrf || !session) {
    console.error('Missing TWENTYEXPRESS_XSRF or TWENTYEXPRESS_SESSION env vars');
    process.exit(1);
  }
  const cookies = [
    { name: 'XSRF-TOKEN', value: xsrf, domain: 'app.twentyexpress.com', path: '/' },
    { name: 'twentyexpress_session', value: session, domain: 'app.twentyexpress.com', path: '/', httpOnly: true }
  ];
  await context.addCookies(cookies);
  const page = await context.newPage();

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  if (page.url().includes('/login')) {
    console.log('SESSION EXPIRED! Redirected to login. Get fresh cookies from DevTools.');
    await browser.close();
    process.exit(1);
  }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);
  console.log('CSRF token OK, page loaded.\n');

  for (const t of tests) {
    console.log(`--- ${t.label} ---`);

    await page.evaluate(({ prov, gram, dim }) => {
      document.querySelector('#dst_name').value = 'Test';
      document.querySelector('#dst_phone').value = '0812345678';
      document.querySelector('#dst_address').value = '123/4';
      document.querySelector('#dst_sub_district').value = prov.sub;
      document.querySelector('#dst_district').value = prov.dist;
      document.querySelector('#dst_province').value = prov.th;
      document.querySelector('#dst_zipcode').value = prov.zip;
      document.querySelector('#gram_weight').value = gram;
      document.querySelector('#weight').value = gram;
      document.querySelector('#width').value = dim.w;
      document.querySelector('#length').value = dim.l;
      document.querySelector('#height').value = dim.h;
    }, { prov: t.prov, gram: t.gram, dim: t.dim });

    await page.waitForTimeout(150);

    const result = await page.evaluate((cs) => {
      return new Promise((resolve) => {
        const arr = $('#createOrderForm').serializeArray();
        arr.push({ name: '_token', value: cs });
        $.getJSON('/order/compare-price', $.param(arr))
          .done(data => resolve({ ok: true, data }))
          .fail((j, s, e) => resolve({ ok: false, error: s, status: j.status }));
      });
    }, csrf);

    if (!result.ok) {
      console.log(`  ERROR: ${result.error} (status ${result.status})`);
      continue;
    }

    const flash = result.data.find(d => d.courier_code === 'DPFLASHA');
    if (flash) {
      console.log(`  FLASH: cost=${flash.cost}  price=${flash.price}  profit=${flash.profit}  zone=${flash.shipping_type}  final_weight=${flash.all_weight?.final_weight}`);
    } else {
      console.log(`  FLASH: NOT FOUND in response`);
    }

    console.log('  All couriers:');
    const sorted = [...result.data].sort((a, b) => a.price - b.price);
    for (const cd of sorted) {
      const mark = cd.courier_code === 'DPFLASHA' ? ' <==' : '';
      console.log(`    ${cd.courier_code.padEnd(20)} cost=${String(cd.cost).padStart(5)}  price=${String(cd.price).padStart(5)}  zone=${cd.shipping_type}${mark}`);
    }
    console.log('');
  }

  await browser.close();
  console.log('Done.');
})();
