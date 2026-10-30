import puppeteer from 'puppeteer-core';

const MOBILE_VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '412x915', width: 412, height: 915 },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const results = [];

  for (const vp of MOBILE_VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);

      const header = document.querySelector('header')?.getBoundingClientRect();
      const tagline = document.querySelector('[data-outdoor-tagline="true"]')?.getBoundingClientRect();
      const firstSectionLabel = document.querySelector('[data-outdoor-label="true"]')?.getBoundingClientRect();
      const bottomNav = document.querySelector('nav[aria-label="Peta Navigasi Mobile"]')?.getBoundingClientRect();

      return {
        header: header ? { top: round(header.top), bottom: round(header.bottom), height: round(header.height) } : null,
        tagline: tagline ? { top: round(tagline.top), bottom: round(tagline.bottom), height: round(tagline.height) } : null,
        firstSectionLabel: firstSectionLabel ? { top: round(firstSectionLabel.top), bottom: round(firstSectionLabel.bottom) } : null,
        bottomNav: bottomNav ? { top: round(bottomNav.top), bottom: round(bottomNav.bottom), height: round(bottomNav.height) } : null,
      };
    });

    results.push({
      name: vp.name,
      ...data,
    });
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
