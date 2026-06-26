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

  // Intercept the compare-price response
  let compareResponseBody = null;
  let compareResponseHeaders = null;

  const page = await context.newPage();
  page.on('response', async (resp) => {
    const url = resp.url();
    if (url.includes('/order/compare-price') && resp.status() === 200) {
      try {
        compareResponseBody = await resp.text();
        compareResponseHeaders = resp.headers();
        console.log('\n!!! Captured compare-price response !!!');
        console.log('Headers:', JSON.stringify(compareResponseHeaders, null, 2));
      } catch(e) {
        console.log('Error capturing response:', e.message);
      }
    }
  });

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Set form data
  await page.selectOption('#courier_code', 'DPFLASHA');
  await page.waitForTimeout(500);
  await page.selectOption('#category_id', '2');
  await page.selectOption('#box_id', '1');

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

  // Click the compare price button
  console.log('Clicking "เปรียบเทียบราคา"...');
  
  // Add navigation listener before clicking
  await page.click('a:has-text("เปรียบเทียบราคา"), button:has-text("เปรียบเทียบราคา")');
  await page.waitForTimeout(3000);

  if (compareResponseBody) {
    console.log('\nResponse length:', compareResponseBody.length);
    console.log('\n--- RAW RESPONSE (first 3000 chars) ---');
    console.log(compareResponseBody.substring(0, 3000));
    fs.writeFileSync('compare_response.html', compareResponseBody);
    console.log('\nFull response saved to compare_response.html');

    // Parse the HTML for price data
    const prices = compareResponseBody.match(/id="(dropoff_cost_price|actual_price|total_price|dropoff_shop_price|remote_price|gas_fee|weight_weight|weight_dimension|weight_side|actual_price_bulky|dropoff_cost_remote_price|dropoff_cost_dimension_price|dropoff_cost_cod_fee|dropoff_insurance_fee_price|price_box_shield_fee|dropoff_on_time_price|dropoff_cost_policies|dropoff_shop_policies|dropoff_customer_price|dropoff_price_cod_fee|dropoff_cost_remote_percent|dropoff_cost_dimension_percent)"/g);
    if (prices) {
      console.log('\nFound price field IDs:', prices.length);
      console.log(prices.join('\n'));
    }

    // Extract values using regex
    console.log('\n--- EXTRACTED VALUES ---');
    const fields = [
      'dropoff_cost_price', 'actual_price', 'total_price', 
      'dropoff_shop_price', 'remote_price', 'gas_fee',
      'weight_weight', 'weight_dimension', 'weight_side'
    ];
    for (const f of fields) {
      const m = compareResponseBody.match(new RegExp(`id="${f}"[^>]+value="([^"]*)"`));
      if (m) console.log(`  ${f} = ${m[1]}`);
      else console.log(`  ${f} = NOT FOUND`);
    }
  } else {
    console.log('NO compare-price response captured');
    console.log('Current URL:', page.url());
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('Page body:', bodyText);
  }

  await browser.close();
})();
