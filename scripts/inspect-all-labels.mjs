import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });

  // Test with /
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  const labelsSlash = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('[data-outdoor-label="true"]'));
    return all.map((el, idx) => ({
      idx,
      text: el.textContent.trim(),
      parentSectionId: el.closest('section')?.id,
      top: Math.round(el.getBoundingClientRect().top * 100) / 100,
      bottom: Math.round(el.getBoundingClientRect().bottom * 100) / 100,
    }));
  });
  console.log('With http://localhost:4173/ (no hash):');
  console.log(JSON.stringify(labelsSlash, null, 2));

  // Test with /#hero
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  const labelsHash = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('[data-outdoor-label="true"]'));
    return all.map((el, idx) => ({
      idx,
      text: el.textContent.trim(),
      parentSectionId: el.closest('section')?.id,
      top: Math.round(el.getBoundingClientRect().top * 100) / 100,
      bottom: Math.round(el.getBoundingClientRect().bottom * 100) / 100,
    }));
  });
  console.log('With http://localhost:4173/#hero:');
  console.log(JSON.stringify(labelsHash, null, 2));

  await browser.close();
}

test().catch(console.error);
