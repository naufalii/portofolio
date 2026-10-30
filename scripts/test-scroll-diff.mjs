import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 800, isMobile: true, hasTouch: true });

  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  const resHero = await page.evaluate(() => {
    const el = document.querySelector('[data-outdoor-label="true"]');
    const r = el ? el.getBoundingClientRect() : null;
    return {
      scrollY: window.scrollY,
      top: r ? r.top : null,
      bottom: r ? r.bottom : null,
    };
  });
  console.log('With #hero: scrollY =', resHero.scrollY, 'firstLabel.top =', resHero.top);

  // Scroll to 56px (height of header)
  await page.evaluate(() => window.scrollTo(0, 56));
  const resScroll56 = await page.evaluate(() => {
    const el = document.querySelector('[data-outdoor-label="true"]');
    const r = el ? el.getBoundingClientRect() : null;
    return {
      scrollY: window.scrollY,
      top: r ? r.top : null,
    };
  });
  console.log('With scrollY=56: firstLabel.top =', resScroll56.top);

  await browser.close();
}

test().catch(console.error);
