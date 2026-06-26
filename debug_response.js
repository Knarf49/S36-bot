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

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Set form data
  await page.selectOption('#courier_code', 'DPFLASHA');
  await page.waitForTimeout(500);
  await page.selectOption('#category_id', '2');
  await page.selectOption('#box_id', '1');

  // Fill all required fields
  await page.evaluate(() => {
    document.querySelector('#dst_name').value = 'ทดสอบรับ';
    document.querySelector('#dst_phone').value = '0812345678';
    document.querySelector('#dst_address').value = '123/4';
    document.querySelector('#dst_sub_district').value = 'คลองหลวง';
    document.querySelector('#dst_district').value = 'คลองหลวง';
    document.querySelector('#dst_province').value = 'ปทุมธานี';
    document.querySelector('#dst_zipcode').value = '12120';

    document.querySelector('#kg_weight').value = 1;
    document.querySelector('#weight').value = 1000;
    document.querySelector('#width').value = 30;
    document.querySelector('#length').value = 40;
    document.querySelector('#height').value = 20;
  });
  await page.waitForTimeout(300);

  // Now click the actual "เปรียบเทียบราคา" button on the page to see what triggers
  // First check what button calls comparePrice
  const btnInfo = await page.evaluate(() => {
    // Find buttons that trigger comparePrice
    const btns = [];
    document.querySelectorAll('button, a, input[type=button]').forEach(el => {
      const onclick = el.getAttribute('onclick') || '';
      const outer = el.outerHTML.substring(0, 200);
      if (onclick.includes('comparePrice') || outer.includes('comparePrice') || 
          outer.includes('เปรียบเทียบ')) {
        btns.push({ text: el.textContent.trim(), onclick, id: el.id, class: el.className });
      }
    });
    return btns;
  });
  console.log('Buttons triggering comparePrice:', JSON.stringify(btnInfo, null, 2));

  // Manually call comparePrice and get response
  const csrf = await page.evaluate(() => document.querySelector('input[name="_token"]').value);

  // Use jQuery AJAX directly in page context
  const response = await page.evaluate((cs) => {
    return new Promise((resolve) => {
      const arr = $('#createOrderForm').serializeArray();
      arr.push({ name: '_token', value: cs });
      const fd = $.param(arr);
      $.get('/order/compare-price', fd)
        .done(html => resolve({ type: 'done', data: html.substring(0, 5000) }))
        .fail((jqxhr, status, err) => resolve({ type: 'fail', status, err, responseText: jqxhr.responseText?.substring(0, 1000) }));
    });
  }, csrf);

  console.log('\n\n=== RAW AJAX RESPONSE ===');
  console.log(response.type);
  if (response.data) {
    console.log(response.data);
    fs.writeFileSync('compare_response.html', response.data);
    console.log('\n...Full response saved to compare_response.html');
  } else {
    console.log(JSON.stringify(response, null, 2));
  }

  await browser.close();
})();
