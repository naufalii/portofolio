import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 625, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const items = await page.evaluate(() => {
    const row1 = document.querySelector('header').children[0];
    return Array.from(row1.querySelectorAll('*')).map(el => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        cls: el.className ? el.className.toString().slice(0, 40) : '',
        h: r.height,
        w: r.width
      };
    }).filter(i => i.h > 35);
  });

  console.log('Row 1 elements with height > 35px:', items);
  await browser.close();
}

run().catch(console.error);
