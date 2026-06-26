const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const targetUrl = 'https://app.twentyexpress.com/order/create-order';

  try {
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(3000);

    const pageTitle = await page.title();
    console.log(`\n=== PAGE TITLE ===\n${pageTitle}\n`);

    const pageUrl = page.url();
    console.log(`=== CURRENT URL ===\n${pageUrl}\n`);

    // Extract ALL elements with full details
    const elements = await page.evaluate(() => {
      const results = [];

      function walk(node, depth = 0) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName.toLowerCase();
          const attrs = {};
          for (const attr of node.attributes) {
            attrs[attr.name] = attr.value;
          }

          // Get text content (trimmed, max 500 chars)
          const directText = [];
          for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              const t = child.textContent.trim();
              if (t) directText.push(t);
            }
          }
          const text = directText.join(' ').substring(0, 500);
          const fullText = (node.textContent || '').trim().substring(0, 1000);

          // Get computed styles
          const style = window.getComputedStyle(node);
          const visible = style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;

          // Get bounding rect
          const rect = node.getBoundingClientRect();

          results.push({
            depth,
            tag,
            id: node.id || null,
            classes: node.className && typeof node.className === 'string' ? node.className.split(/\s+/).filter(Boolean) : [],
            text_direct: text || null,
            text_full: fullText || null,
            visible,
            display: style.display,
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              w: Math.round(rect.width),
              h: Math.round(rect.height)
            },
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

    console.log(`Total elements found: ${elements.length}`);

    // Summary by tag
    const tagCounts = {};
    for (const el of elements) {
      tagCounts[el.tag] = (tagCounts[el.tag] || 0) + 1;
    }
    console.log('\n=== ELEMENTS BY TAG ===');
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    for (const [tag, count] of sortedTags) {
      console.log(`  ${tag}: ${count}`);
    }

    // Interactive elements (buttons, inputs, links, selects, textareas)
    console.log('\n=== INTERACTIVE ELEMENTS ===');
    const interactive = elements.filter(el =>
      ['button', 'input', 'select', 'textarea', 'a'].includes(el.tag)
    );
    for (const el of interactive) {
      const label = el.text_direct || el.placeholder || el.aria_label || el.value || el.href || el.tag;
      console.log(`  <${el.tag}> ${label} ${el.id ? '(#' + el.id + ')' : ''} ${el.name ? '[name=' + el.name + ']' : ''} ${el.type ? '[type=' + el.type + ']' : ''}`);
    }

    // Save full result to JSON
    const fs = require('fs');
    const outputPath = 'scraped_elements.json';
    fs.writeFileSync(outputPath, JSON.stringify(elements, null, 2));
    console.log(`\nFull results saved to ${outputPath}`);

    // Also get page text content for quick scan
    const pageText = await page.evaluate(() => {
      // Only visible text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        { acceptNode: node => node.parentElement && node.parentElement.offsetParent !== null ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT },
        false
      );
      const texts = [];
      let node;
      while (node = walker.nextNode()) {
        const t = node.textContent.trim();
        if (t) texts.push(t);
      }
      return texts;
    });

    console.log('\n=== VISIBLE TEXT ON PAGE ===');
    console.log(pageText.join('\n'));

    // Screenshot
    await page.screenshot({ path: 'page_screenshot.png', fullPage: true });
    console.log('\nScreenshot saved to page_screenshot.png');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
    console.log('\nDone.');
  }
})();
