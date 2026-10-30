import puppeteer from 'puppeteer-core';

async function setPhase(page, targetName) {
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) =>
        b.textContent.includes('▼') ||
        (b.getAttribute('aria-label') &&
          b.getAttribute('aria-label').includes('waktu'))
    );
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 200));

  await page.evaluate((name) => {
    const opts = Array.from(
      document.querySelectorAll('button, [role="menuitem"]')
    );
    const target = opts.find((o) =>
      o.textContent.toLowerCase().includes(name.toLowerCase())
    );
    if (target) target.click();
  }, targetName);
  await new Promise((r) => setTimeout(r, 400));
}

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));

  // Set Day
  await setPhase(page, 'siang');
  await page.screenshot({ path: 'docs/master/proto-shift/1920x1080-approach-a-day.png' });
  console.log('Saved 1920x1080-approach-a-day.png');

  // Set Night
  await setPhase(page, 'malam');
  await page.screenshot({ path: 'docs/master/proto-shift/1920x1080-approach-a-night.png' });
  console.log('Saved 1920x1080-approach-a-night.png');

  await browser.close();
}

run().catch(console.error);
