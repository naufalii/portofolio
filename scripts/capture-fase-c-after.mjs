import puppeteer from 'puppeteer-core';
import fs from 'fs';

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
  if (!fs.existsSync('docs/master/after/core')) {
    fs.mkdirSync('docs/master/after/core', { recursive: true });
  }

  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });

  const viewports = [
    { w: 1280, h: 720, label: '1280x720' },
    { w: 1920, h: 1080, label: '1920x1080' },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    // Siang
    await setPhase(page, 'siang');
    await page.screenshot({ path: `docs/master/after/core/${vp.label}-day.png` });
    console.log(`Saved docs/master/after/core/${vp.label}-day.png`);

    // Malam
    await setPhase(page, 'malam');
    await page.screenshot({ path: `docs/master/after/core/${vp.label}-night.png` });
    console.log(`Saved docs/master/after/core/${vp.label}-night.png`);

    await page.close();
  }

  await browser.close();
}

run().catch(console.error);
