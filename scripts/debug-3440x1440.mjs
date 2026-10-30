import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 3440, height: 1440, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const debug = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-landmark-btn]')).map(b => {
      const r = b.getBoundingClientRect();
      const cx = Math.round(r.left + r.width / 2);
      const cy = Math.round(r.top + r.height / 2);
      const topEl = document.elementsFromPoint(cx, cy)[0];
      return {
        id: b.getAttribute('data-landmark-btn'),
        left: r.left,
        right: r.right,
        width: r.width,
        cx,
        cy,
        isMatch: topEl === b,
        topElId: topEl ? topEl.getAttribute('data-landmark-btn') : null
      };
    });
  });

  console.log('3440x1440 Landmark Hitboxes:', debug);
  await browser.close();
}

run().catch(console.error);
