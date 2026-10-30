import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });

  const captures = [
    { name: '1920x1080-no-justify-center.png', width: 1920, height: 1080 },
    { name: '1366x625-compact-real.png', width: 1366, height: 625 },
    { name: '1280x720-skills-p1-real.png', width: 1280, height: 720 },
  ];

  for (const c of captures) {
    const page = await browser.newPage();
    await page.setViewport({ width: c.width, height: c.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    await page.screenshot({ path: `docs/master/proto-shift/${c.name}` });
    console.log(`Saved screenshot: docs/master/proto-shift/${c.name}`);
    await page.close();
  }

  await browser.close();
}

run().catch(console.error);
