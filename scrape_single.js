const { chromium } = require('playwright');

const XSRF = process.env.TWENTYEXPRESS_XSRF;
const SESSION = process.env.TWENTYEXPRESS_SESSION;
if (!XSRF || !SESSION) {
  console.error('Missing TWENTYEXPRESS_XSRF or TWENTYEXPRESS_SESSION env vars');
  process.exit(1);
}
const COOKIES = [
  { name: 'XSRF-TOKEN', value: XSRF, domain: 'app.twentyexpress.com', path: '/' },
  { name: 'twentyexpress_session', value: SESSION, domain: 'app.twentyexpress.com', path: '/', httpOnly: true }
];

// ═══ TEST CONFIG ═══
const TEST = {
  province: 'ตรัง',
  sub: 'ทับเที่ยง',
  dist: 'เมืองตรัง',
  zip: '92000',
  weightGram: 2000,
  weightKg: 2,
  dim: { w: 17, l: 25, h: 9 },  // width, length, height in cm
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addCookies(COOKIES);
  const page = await context.newPage();

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log('❌ Session expired! Get fresh cookies.');
    await browser.close();
    process.exit(1);
  }

  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);
  console.log(`✅ Logged in. CSRF: ${csrf.slice(0,20)}...`);

  // Fill form
  await page.evaluate(({ t, dim }) => {
    document.querySelector('#dst_name').value = 'Test';
    document.querySelector('#dst_phone').value = '0812345678';
    document.querySelector('#dst_address').value = '123/4';
    document.querySelector('#dst_sub_district').value = t.sub;
    document.querySelector('#dst_district').value = t.dist;
    document.querySelector('#dst_province').value = t.province;
    document.querySelector('#dst_zipcode').value = t.zip;
    document.querySelector('#kg_weight').value = t.weightKg;
    document.querySelector('#gram_weight').value = t.weightGram;
    document.querySelector('#weight').value = t.weightGram;
    document.querySelector('#width').value = dim.w;
    document.querySelector('#length').value = dim.l;
    document.querySelector('#height').value = dim.h;
  }, { t: TEST, dim: TEST.dim });

  await page.waitForTimeout(300);

  // Call compare-price
  const result = await page.evaluate((cs) => {
    return new Promise((resolve) => {
      const arr = $('#createOrderForm').serializeArray();
      arr.push({ name: '_token', value: cs });
      $.getJSON('/order/compare-price', $.param(arr))
        .done(data => resolve({ ok: true, data }))
        .fail((j, s, e) => resolve({ ok: false, error: s, status: j?.status }));
    });
  }, csrf);

  if (!result.ok) {
    console.log(`❌ API error: ${result.error} (status ${result.status})`);
    await browser.close();
    return;
  }

  const data = result.data;
  console.log(`\n📦 ${TEST.province} | ${TEST.weightKg}kg | ${TEST.dim.w}×${TEST.dim.l}×${TEST.dim.h} cm`);
  console.log(`   ${data.length} couriers found:\n`);

  data.sort((a, b) => a.price - b.price);

  for (const cd of data) {
    const fw = cd.all_weight?.final_weight ?? '-';
    const fwUnit = cd.courier_code === 'DPTHAIPOST' ? 'g' : 'kg';
    const fwDisplay = cd.courier_code === 'DPTHAIPOST' ? fw : (fw !== '-' ? (fw / 1000).toFixed(2) : '-');
    const remote = cd.getRemote?.remote_area || cd.remote || false;

    console.log(`${cd.courier_code.padEnd(18)} ${String(cd.price).padStart(5)} บาท | cost=${cd.cost} | FW=${fwDisplay} ${fwUnit} | zone=${cd.shipping_type} | remote=${remote} | gas=${cd.gas_fee}`);
  }

  await browser.close();
  console.log('\n✅ Done');
})();
