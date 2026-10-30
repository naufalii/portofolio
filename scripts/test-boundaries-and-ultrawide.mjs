import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const FINAL_DIR = path.resolve('docs/master/final');
if (!fs.existsSync(FINAL_DIR)) fs.mkdirSync(FINAL_DIR, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });

  // 1. Capture 2560x1080 ultrawide screenshots (day & night)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 2560, height: 1080, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const shotDay = path.join(FINAL_DIR, '2560x1080-ultrawide-day.png');
    await page.screenshot({ path: shotDay });
    console.log(`Saved: ${shotDay}`);

    // Switch to night
    await page.evaluate(() => {
      const nightBtn = document.querySelector('button[title*="Malam"], button[aria-label*="Malam"]');
      if (nightBtn) nightBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const shotNight = path.join(FINAL_DIR, '2560x1080-ultrawide-night.png');
    await page.screenshot({ path: shotNight });
    console.log(`Saved: ${shotNight}`);

    await page.close();
  }

  // 2. Test boundary transitions
  const BOUNDARY_TESTS = [
    { label: 'Height Boundary H=699 (Mobile)', width: 1280, height: 699, expectedMode: 'mobile' },
    { label: 'Height Boundary H=700 (Desktop)', width: 1280, height: 700, expectedMode: 'desktop' },
    { label: 'Width Boundary W=1023 (Mobile)', width: 1023, height: 768, expectedMode: 'mobile' },
    { label: 'Width Boundary W=1024 (Desktop)', width: 1024, height: 768, expectedMode: 'desktop' },
  ];

  const boundaryResults = [];

  for (const b of BOUNDARY_TESTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: b.width, height: b.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const res = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const header = document.querySelector('header');
      const bottomDock = document.querySelector('nav[aria-label*="Peta Navigasi Mobile"]');
      const desktopNav = document.querySelector('header nav');
      const stage = document.querySelector('[data-landmark-stage="true"]');
      const heroSection = document.querySelector('#section-hero');

      const isMobileDOM = !!bottomDock && !!heroSection;
      const isDesktopDOM = !!desktopNav && !!stage;

      return {
        headerHeight: header ? round(header.getBoundingClientRect().height) : null,
        hasBottomDock: !!bottomDock,
        hasDesktopNav: !!desktopNav,
        hasStage: !!stage,
        isMobileDOM,
        isDesktopDOM,
      };
    });

    const passed = (b.expectedMode === 'mobile' && res.isMobileDOM && !res.hasDesktopNav) ||
                   (b.expectedMode === 'desktop' && res.isDesktopDOM && !res.hasBottomDock);

    boundaryResults.push({
      label: b.label,
      width: b.width,
      height: b.height,
      expected: b.expectedMode,
      actual: res.isMobileDOM ? 'mobile' : res.isDesktopDOM ? 'desktop' : 'unknown',
      headerHeight: res.headerHeight,
      hasBottomDock: res.hasBottomDock,
      hasDesktopNav: res.hasDesktopNav,
      hasStage: res.hasStage,
      passed,
    });

    await page.close();
  }

  console.log('Boundary Test Results:\n', JSON.stringify(boundaryResults, null, 2));

  await browser.close();
}

run().catch(console.error);
