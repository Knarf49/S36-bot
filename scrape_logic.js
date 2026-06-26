const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const xsrf = process.env.TWENTYEXPRESS_XSRF;
  const session = process.env.TWENTYEXPRESS_SESSION;
  if (!xsrf || !session) { console.error('Missing TWENTYEXPRESS_XSRF or TWENTYEXPRESS_SESSION env vars'); process.exit(1); }
  const cookies = [
    { name: 'XSRF-TOKEN', value: xsrf, domain: 'app.twentyexpress.com', path: '/', httpOnly: false, secure: false, sameSite: 'Lax' },
    { name: 'twentyexpress_session', value: session, domain: 'app.twentyexpress.com', path: '/', httpOnly: true, secure: false, sameSite: 'Lax' }
  ];

  await context.addCookies(cookies);
  const page = await context.newPage();

  // Intercept JS files
  const jsFiles = new Map();
  page.on('response', async (response) => {
    const url = response.url();
    if (url.endsWith('.js') && response.status() === 200) {
      try {
        const text = await response.text();
        jsFiles.set(url, text);
      } catch (e) {}
    }
  });

  console.log('Loading page...');
  await page.goto('https://app.twentyexpress.com/order/create-order', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log(`Captured ${jsFiles.size} JS files\n`);

  // Find JS files related to pricing/calculation
  const keywords = ['price', 'cost', 'weight', 'dimension', 'calculate', 'computed', 'fee', 'cod', 'insurance', 'insure',
    'dropoff', 'remote', 'bulky', 'total', 'vat', 'sum', 'profit', 'margin', 'shipping', 'courier', 'box'];

  const fs = require('fs');
  let allRelevant = [];

  for (const [url, content] of jsFiles) {
    const lower = content.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      const regex = new RegExp(kw, 'gi');
      const matches = lower.match(regex);
      if (matches) score += matches.length;
    }

    if (score > 5) {
      const filename = url.split('/').pop().split('?')[0];
      console.log(`\n=== ${filename} (score: ${score}, size: ${content.length}) ===`);
      console.log(`URL: ${url}`);
      fs.writeFileSync(`js_${filename}`, content);
      console.log(`Saved: js_${filename}`);

      // Extract relevant code blocks
      const lines = content.split('\n');
      const relevantLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineLower = line.toLowerCase();
        for (const kw of ['cost', 'price', 'fee', 'weight', 'dimension', 'total', 'calculate', 'profit']) {
          if (lineLower.includes(kw)) {
            relevantLines.push({ line: i + 1, code: line.substring(0, 300) });
            break;
          }
        }
      }
      if (relevantLines.length > 0) {
        console.log(`\n--- Relevant lines ---`);
        for (const rl of relevantLines.slice(0, 50)) {
          console.log(`  L${rl.line}: ${rl.code}`);
        }
      }
    }
  }

  // Also extract inline event handlers and data attributes from form
  console.log('\n\n=== INLINE EVENT HANDLERS ON FORM ELEMENTS ===');
  const handlers = await page.evaluate(() => {
    const results = [];
    const priceInputs = document.querySelectorAll([
      '#weight', '#kg_weight', '#gram_weight', '#width', '#length', '#height',
      '#courier_code', '#box_id', '#category_id',
      '#cod_amount', '#product_value', '#insurance_x', '#is_urgentx', '#is_box_shieldx',
      '#total', '#vat_1', '#vat_3', '#total_amount',
      '#dropoff_cost_price', '#gas_fee', '#actual_price', '#total_price',
      '#remote_price', '#price_box_shield_fee', '#dropoff_insurance_fee_price',
      '#dropoff_cost_remote_price', '#dropoff_cost_dimension_price', '#dropoff_cost_cod_fee',
      '#weight_weight', '#weight_dimension', '#weight_side',
      '#actual_price_bulky', '#dropoff_shop_price', '#dropoff_shop_policies',
      '#dropoff_price_cod_fee', '#dropoff_customer_price',
      '#dropoff_cost_remote_percent', '#dropoff_cost_dimension_percent',
      '#dropoff_on_time_price', '#dropoff_cost_policies'
    ].join(','));

    priceInputs.forEach(el => {
      const onEvents = [];
      for (const attr of el.attributes) {
        if (attr.name.startsWith('on')) onEvents.push(`${attr.name}="${attr.value}"`);
      }
      if (onEvents.length > 0 || el.id) {
        results.push({
          id: el.id,
          tag: el.tagName,
          type: el.type,
          name: el.name,
          class: el.className,
          events: onEvents,
          dataAttrs: Array.from(el.attributes).filter(a => a.name.startsWith('data-')).map(a => `${a.name}="${a.value}"`)
        });
      }
    });
    return results;
  });

  for (const h of handlers) {
    console.log(`  #${h.id} [${h.tag}]${h.type ? ' type=' + h.type : ''} ${h.events.length ? ' events: ' + h.events.join(' ') : ''}`);
  }

  // Look at all data attributes and onclick on parent form elements
  console.log('\n\n=== ATTRIBUTES ON KEY FORM DIVS ===');
  const formAttrs = await page.evaluate(() => {
    const ids = ['sender_form', 'receiver_form', 'parcel_form', 'price_section', 'summary_section',
      'btn-save-order', 'calculate_price', 'add-product'];
    const results = [];
    for (const id of ids) {
      const el = document.getElementById(id) || document.querySelector(`[data-${id}]`);
      if (el) {
        results.push({
          id: el.id,
          outer: el.outerHTML.substring(0, 1000)
        });
      }
    }
    // Find forms
    document.querySelectorAll('form').forEach((form, i) => {
      results.push({
        id: form.id || `form_${i}`,
        action: form.action,
        method: form.method,
        outer: form.outerHTML.substring(0, 2000)
      });
    });
    return results;
  });
  for (const fa of formAttrs) {
    console.log(`--- #${fa.id} ---`);
    console.log(fa.outer);
    console.log();
  }

  // Find vue/react component data on window
  console.log('=== WINDOW GLOBALS ===');
  const globals = await page.evaluate(() => {
    const keys = Object.keys(window).filter(k =>
      k.includes('price') || k.includes('cost') || k.includes('calc') ||
      k.includes('order') || k.includes('shipping') || k.includes('parcel') ||
      k.startsWith('$') || k.startsWith('__')
    );
    return keys;
  });
  console.log('Price/order-related globals:', globals.join(', '));

  await browser.close();
  console.log('\n\nDone.');
})();
