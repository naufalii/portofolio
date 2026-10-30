import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  const res = await page.evaluate(() => {
    const stage = document.querySelector('[data-landmark-stage="true"]');
    const badge = stage.querySelector('div.font-pixel');
    const bRect = badge.getBoundingClientRect();
    const mascot = stage.querySelector('.pointer-events-auto');
    const mRect = mascot.getBoundingClientRect();
    const nav = document.querySelector('nav');
    const navRect = nav ? nav.getBoundingClientRect() : null;
    const heroTab = document.querySelector('[data-location-id="hero"]')?.getBoundingClientRect();
    const header = document.querySelector('header')?.getBoundingClientRect();
    return {
      header: { top: header.top, bottom: header.bottom, height: header.height },
      nav: navRect ? { top: navRect.top, bottom: navRect.bottom, left: navRect.left, right: navRect.right } : null,
      heroTab: heroTab ? { top: heroTab.top, bottom: heroTab.bottom, left: heroTab.left, right: heroTab.right } : null,
      badge: { top: bRect.top, bottom: bRect.bottom, left: bRect.left, right: bRect.right },
      mascot: { top: mRect.top, bottom: mRect.bottom, left: mRect.left, right: mRect.right }
    };
  });
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

test().catch(console.error);
