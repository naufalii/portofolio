import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  const header = await page.evaluate(() => {
    const h = document.querySelector('header');
    return h ? { tag: h.tagName, class: h.className, rect: h.getBoundingClientRect() } : null;
  });
  console.log('Header result:', header);
  await browser.close();
}

test().catch(console.error);
