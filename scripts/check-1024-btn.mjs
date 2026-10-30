import puppeteer from 'puppeteer-core';

async function check() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 480, isMobile: false });
  await page.goto('http://localhost:4173/#contact', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 400));
  
  const r = await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    const panel = document.getElementById('active-section-contact');
    const b = btn ? btn.getBoundingClientRect() : null;
    const p = panel ? panel.getBoundingClientRect() : null;
    return {
      windowH: window.innerHeight,
      btnRect: b ? { top: b.top, bottom: b.bottom, height: b.height } : null,
      panelRect: p ? { top: p.top, bottom: p.bottom, height: p.height } : null,
    };
  });
  console.log(JSON.stringify(r, null, 2));
  await browser.close();
}

check().catch(console.error);
