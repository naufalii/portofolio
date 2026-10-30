import puppeteer from 'puppeteer-core';

async function testOrientation() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Test 1: 912x1368 (Surface Pro Portrait)
  await page.setViewport({ width: 912, height: 1368, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const t1 = await page.evaluate(() => {
    const isMobileNav = !!document.querySelector('nav[aria-label="Peta Navigasi Mobile"]');
    const isDesktopNav = !!document.querySelector('nav[aria-label="Peta Dunia Overworld"]');
    return {
      viewport: '912x1368 (Portrait)',
      isMobileNav,
      isDesktopNav,
      mode: isMobileNav ? 'Mobile/Tablet Vertikal' : 'Desktop Overworld',
    };
  });

  await page.screenshot({ path: 'docs/fixlaptop/after/tablet_912x1368_with_landscape_rule.png', fullPage: false });

  // Test 2: 1368x912 (Surface Pro Landscape)
  await page.setViewport({ width: 1368, height: 912, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const t2 = await page.evaluate(() => {
    const isMobileNav = !!document.querySelector('nav[aria-label="Peta Navigasi Mobile"]');
    const isDesktopNav = !!document.querySelector('nav[aria-label="Peta Dunia Overworld"]');
    return {
      viewport: '1368x912 (Landscape)',
      isMobileNav,
      isDesktopNav,
      mode: isMobileNav ? 'Mobile/Tablet Vertikal' : 'Desktop Overworld',
    };
  });

  // Test 3: 1280x720 (Desktop Standard Baseline)
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const t3 = await page.evaluate(() => {
    const isMobileNav = !!document.querySelector('nav[aria-label="Peta Navigasi Mobile"]');
    const isDesktopNav = !!document.querySelector('nav[aria-label="Peta Dunia Overworld"]');
    return {
      viewport: '1280x720 (Desktop Baseline)',
      isMobileNav,
      isDesktopNav,
      mode: isMobileNav ? 'Mobile/Tablet Vertikal' : 'Desktop Overworld',
    };
  });

  console.log(JSON.stringify({ t1, t2, t3 }, null, 2));
  await browser.close();
}

testOrientation().catch(console.error);
