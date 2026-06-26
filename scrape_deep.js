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

  // Intercept AJAX calls
  const ajaxRequests = [];
  page.on('request', req => {
    if (req.url().includes('/order/compare-price') || req.url().includes('/order/calculate')) {
      ajaxRequests.push({ url: req.url(), method: req.method(), postData: req.postData(), time: Date.now() });
    }
  });
  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('/order/compare-price') || url.includes('/order/calculate')) {
      try { console.log(`\nAJAX RESPONSE ${url}:\n${await resp.text()}`); } catch(e) {}
    }
  });

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 1. Extract ALL inline scripts
  console.log('\n========================================');
  console.log('INLINE SCRIPTS (non-blank lines)');
  console.log('========================================');
  const inlineScripts = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script:not([src])');
    return Array.from(scripts).map(s => s.textContent);
  });

  const fs = require('fs');
  let inlineOutput = '';
  for (let i = 0; i < inlineScripts.length; i++) {
    const s = inlineScripts[i];
    if (s.trim()) {
      console.log(`\n--- Inline Script #${i} (${s.length} chars) ---`);
      const lines = s.split('\n').filter(l => l.trim()).slice(0, 200);
      console.log(lines.join('\n'));
      inlineOutput += `\n\n// === INLINE SCRIPT ${i} ===\n${s}\n`;
    }
  }
  fs.writeFileSync('inline_scripts.js', inlineOutput);

  // 2. Extract all functions from window that look like our targets
  console.log('\n\n========================================');
  console.log('WINDOW FUNCTIONS (price/calc related)');
  console.log('========================================');
  const winFns = await page.evaluate(() => {
    const fns = [];
    for (const key of Object.getOwnPropertyNames(window)) {
      if (typeof window[key] === 'function') {
        const name = key.toLowerCase();
        if (name.includes('calc') || name.includes('price') || name.includes('weight') ||
            name.includes('cost') || name.includes('courier') || name.includes('parcel') ||
            name.includes('check') || name.includes('change') || name.includes('select') ||
            name.includes('table') || name.includes('summary') || name.includes('discount')) {
          try {
            fns.push({ name: key, src: window[key].toString().substring(0, 2000) });
          } catch(e) {
            fns.push({ name: key, src: '[native code]' });
          }
        }
      }
    }
    return fns;
  });
  let fnOutput = '';
  for (const fn of winFns) {
    console.log(`\n--- ${fn.name} ---`);
    console.log(fn.src);
    fnOutput += `\n\n// === ${fn.name} ===\n${fn.src}\n`;
  }
  fs.writeFileSync('window_functions.js', fnOutput);

  // 3. Trigger comparePrice AJAX to see server response
  console.log('\n\n========================================');
  console.log('TRIGGERING comparePrice via AJAX');
  console.log('========================================');

  // Fill in form with sample data
  await page.evaluate(() => {
    // Set receiver data
    document.querySelector('#dst_name').value = 'ทดสอบ';
    document.querySelector('#dst_phone').value = '0812345678';
    document.querySelector('#dst_address').value = '123/4';
    document.querySelector('#dst_sub_district').value = 'คลองหลวง';
    document.querySelector('#dst_district').value = 'คลองหลวง';
    document.querySelector('#dst_province').value = 'ปทุมธานี';
    document.querySelector('#dst_zipcode').value = '12120';

    // Set parcel data
    document.querySelector('#weight').value = '5';
    document.querySelector('#width').value = '30';
    document.querySelector('#length').value = '40';
    document.querySelector('#height').value = '20';
  });

  // Submit comparePrice
  const csrf = await page.evaluate(() => {
    return document.querySelector('input[name="_token"]').value;
  });

  console.log('Making compare-price request...');
  const formDataArray = await page.evaluate(() => {
    return $('#createOrderForm').serializeArray();
  });
  formDataArray.push({ name: '_token', value: csrf });
  const formData = $.param(formDataArray);

  const result = await page.evaluate(async (fd) => {
    return new Promise((resolve, reject) => {
      $.get('/order/compare-price', fd)
        .done(res => resolve(res))
        .fail(err => resolve({ error: err.statusText }));
    });
  });

  console.log('\ncomparePrice RESPONSE:');
  console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
  fs.writeFileSync('compare_price_response.json', typeof result === 'string' ? result : JSON.stringify(result, null, 2));

  // 4. Get ALL data from window that might be relevant
  console.log('\n========================================');
  console.log('WINDOW DATA OBJECTS');
  console.log('========================================');
  const winData = await page.evaluate(() => {
    const data = {};
    const wanted = ['APP_NAME', 'APP_URL', 'priceData', 'courierData', 'boxData',
      'categoryData', 'weightData', 'orderData', 'addressData', 'initialData',
      'app', 'config', 'settings', 'policies', 'remoteAreas'];
    for (const key in window) {
      const lk = key.toLowerCase();
      for (const w of wanted) {
        if (lk === w.toLowerCase()) {
          try {
            data[key] = JSON.parse(JSON.stringify(window[key]));
          } catch(e) {
            data[key] = '[unserializable: ' + (typeof window[key]) + ']';
          }
        }
      }
    }
    return data;
  });
  console.log(JSON.stringify(winData, null, 2));
  fs.writeFileSync('window_data.json', JSON.stringify(winData, null, 2));

  await browser.close();
  console.log('\n\nDone. Saved: inline_scripts.js, window_functions.js, compare_price_response.json, window_data.json');
})();
