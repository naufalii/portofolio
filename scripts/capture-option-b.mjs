import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function testOptB() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. 911x512 (Fullscreen at 150% scaling)
  await page.setViewport({ width: 911, height: 512, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const data512 = await page.evaluate(() => {
    const isDesk = !window.matchMedia('(max-width: 899px), (max-height: 479px)').matches;
    const header = document.querySelector('header')?.getBoundingClientRect();
    const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
    const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
    const mascot = document.querySelector('[data-landmark-stage="true"] [data-sprite]')?.getBoundingClientRect();

    return {
      isDesktop: isDesk,
      layoutMode: isDesk ? 'Desktop Overworld Compact' : 'Mobile/Tablet Vertikal',
      header: header ? { height: header.height, bottom: header.bottom } : null,
      stage: stage ? { top: stage.top, bottom: stage.bottom, height: stage.height } : null,
      dialog: dialog ? { top: dialog.top, bottom: dialog.bottom, height: dialog.height } : null,
      mascot: mascot ? { bottom: mascot.bottom, height: mascot.height } : null,
    };
  });

  await page.screenshot({ path: 'docs/fixlaptop/after/option_b_911x512.png', fullPage: false });

  // 2. 911x450 (Windowed with browser UI at 150% scaling)
  await page.setViewport({ width: 911, height: 450, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const data450 = await page.evaluate(() => {
    const isDesk = !window.matchMedia('(max-width: 899px), (max-height: 479px)').matches;
    return {
      isDesktop: isDesk,
      layoutMode: isDesk ? 'Desktop Overworld Compact' : 'Mobile/Tablet Vertikal (H < 480 fallback)',
    };
  });

  await page.screenshot({ path: 'docs/fixlaptop/after/option_b_911x450.png', fullPage: false });

  // 3. Tablet Portrait: iPad 9.7" (768x1024)
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const data768 = await page.evaluate(() => {
    const isDesk = !window.matchMedia('(max-width: 899px), (max-height: 479px)').matches;
    return { isDesktop: isDesk, layoutMode: isDesk ? 'Desktop' : 'Mobile/Tablet Vertikal' };
  });

  // 4. Tablet Portrait: iPad Air 10.9" (820x1180) / iPad Pro 11" (834x1194)
  await page.setViewport({ width: 834, height: 1194, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const data834 = await page.evaluate(() => {
    const isDesk = !window.matchMedia('(max-width: 899px), (max-height: 479px)').matches;
    return { isDesktop: isDesk, layoutMode: isDesk ? 'Desktop' : 'Mobile/Tablet Vertikal' };
  });

  // 5. Tablet Portrait: Surface Pro 9 (912x1368)
  await page.setViewport({ width: 912, height: 1368, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const data912 = await page.evaluate(() => {
    const isDesk = !window.matchMedia('(max-width: 899px), (max-height: 479px)').matches;
    const header = document.querySelector('header')?.getBoundingClientRect();
    return {
      isDesktop: isDesk,
      layoutMode: isDesk ? 'Desktop Overworld Standard' : 'Mobile/Tablet Vertikal',
      header: header ? { height: header.height, bottom: header.bottom } : null,
    };
  });
  await page.screenshot({ path: 'docs/fixlaptop/after/option_b_tablet_912x1368.png', fullPage: false });

  await browser.close();

  const fullReport = {
    optB_512: data512,
    optB_450: data450,
    optB_768: data768,
    optB_834: data834,
    optB_912: data912,
  };

  fs.writeFileSync('scripts/option_b_full_data.json', JSON.stringify(fullReport, null, 2));
  console.log(JSON.stringify(fullReport, null, 2));
}

testOptB().catch(console.error);
