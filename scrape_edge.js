const { chromium } = require('playwright');

(async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\User Data';
  const profileDir = 'Default';

  console.log('Launching Edge with your profile...');
  console.log(`User data: ${userDataDir}`);
  console.log(`Profile: ${profileDir}`);

  const browser = await chromium.launchPersistentContext(
    userDataDir + '\\' + profileDir,
    {
      headless: false,
      channel: 'msedge',
      executablePath: edgePath,
      args: [`--profile-directory=${profileDir}`],
      viewport: { width: 1280, height: 720 }
    }
  );

  const pages = browser.pages();
  const page = pages[0] || await browser.newPage();

  const targetUrl = 'https://app.twentyexpress.com/order/create-order';
  console.log(`\nNavigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const pageUrl = page.url();
  console.log(`\nFinal URL: ${pageUrl}\n`);

  if (pageUrl.includes('/login')) {
    console.log('Still on login page — Edge session might be expired or profile not loaded.');
    console.log('Try logging in manually in the opened browser, then press Enter here...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
  }

  // Extract all elements
  const elements = await page.evaluate(() => {
    const results = [];
    function walk(node, depth = 0) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        const attrs = {};
        for (const attr of node.attributes) {
          attrs[attr.name] = attr.value;
        }
        const directText = [];
        for (const child of node.childNodes) {
          if (child.nodeType === Node.TEXT_NODE) {
            const t = child.textContent.trim();
            if (t) directText.push(t);
          }
        }
        const style = window.getComputedStyle(node);
        const visible = style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;
        const rect = node.getBoundingClientRect();
        results.push({
          depth, tag,
          id: node.id || null,
          classes: node.className && typeof node.className === 'string' ? node.className.split(/\s+/).filter(Boolean) : [],
          text_direct: directText.join(' ').substring(0, 500) || null,
          text_full: (node.textContent || '').trim().substring(0, 1000) || null,
          visible, display: style.display,
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
          attributes: attrs,
          child_count: node.children.length,
          role: node.getAttribute('role'),
          aria_label: node.getAttribute('aria-label'),
          placeholder: node.getAttribute('placeholder'),
          name: node.getAttribute('name'),
          type: node.getAttribute('type'),
          value: node.getAttribute('value'),
          href: node.getAttribute('href'),
          src: node.getAttribute('src'),
          checked: node.checked !== undefined ? node.checked : null,
          disabled: node.disabled !== undefined ? node.disabled : null,
        });
      }
      if (node.childNodes) {
        for (const child of node.childNodes) {
          walk(child, depth + 1);
        }
      }
    }
    walk(document.documentElement);
    return results;
  });

  console.log(`Total elements: ${elements.length}`);

  // Tag summary
  const tagCounts = {};
  for (const el of elements) tagCounts[el.tag] = (tagCounts[el.tag] || 0) + 1;
  console.log('\n=== ELEMENTS BY TAG ===');
  for (const [tag, count] of Object.entries(tagCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${tag}: ${count}`);
  }

  // Interactive elements
  console.log('\n=== INTERACTIVE ELEMENTS ===');
  const interactive = elements.filter(el =>
    ['button', 'input', 'select', 'textarea', 'a'].includes(el.tag)
  );
  for (const el of interactive) {
    const label = el.text_direct || el.placeholder || el.aria_label || el.value || el.href || el.tag;
    console.log(`  <${el.tag}> ${label} ${el.id ? '#' + el.id : ''} ${el.name ? '[name=' + el.name + ']' : ''} ${el.type ? '[type=' + el.type + ']' : ''}`);
  }

  // Visible text
  const pageText = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT,
      { acceptNode: node => node.parentElement && node.parentElement.offsetParent !== null ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT },
      false);
    const texts = [];
    let node;
    while (node = walker.nextNode()) { const t = node.textContent.trim(); if (t) texts.push(t); }
    return texts;
  });
  console.log('\n=== VISIBLE TEXT ===');
  console.log(pageText.join('\n'));

  // Save
  const fs = require('fs');
  fs.writeFileSync('scraped_elements.json', JSON.stringify(elements, null, 2));
  await page.screenshot({ path: 'page_screenshot.png', fullPage: true });
  console.log('\nSaved: scraped_elements.json, page_screenshot.png');

  await browser.close();
  console.log('Done.');
})();
