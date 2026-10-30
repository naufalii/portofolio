import puppeteer from 'puppeteer-core';

async function test(name, w, h) {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const data = await page.evaluate(() => {
    const landmarkBtns = Array.from(document.querySelectorAll('[data-landmark-btn]'));
    return landmarkBtns.map(btn => {
      const id = btn.getAttribute('data-landmark-btn');
      const rect = btn.getBoundingClientRect();
      const cx = Math.round(rect.left + rect.width / 2);
      const cy = Math.round(rect.top + rect.height / 2);
      const topEl = document.elementsFromPoint(cx, cy)[0];
      return {
        id,
        cx,
        cy,
        isMatch: topEl === btn,
        topTag: topEl ? topEl.tagName.toLowerCase() : null,
        topCls: topEl ? (topEl.className||'').toString().slice(0, 50) : null,
      };
    });
  });

  console.log(`[${name} ${w}x${h}]`);
  for (const d of data) {
    if (!d.isMatch) {
      console.log(`  FAILED: ${d.id} at (${d.cx}, ${d.cy}) -> topEl=<${d.topTag} class="${d.topCls}">`);
    }
  }

  await browser.close();
}

async function run() {
  await test('3440x1440', 3440, 1440);
  await test('1024x500', 1024, 500);
  await test('1536x680', 1536, 680);
}

run().catch(console.error);
