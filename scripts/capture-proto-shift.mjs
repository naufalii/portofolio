import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  if (!fs.existsSync('docs/master/proto-shift')) {
    fs.mkdirSync('docs/master/proto-shift', { recursive: true });
  }

  const metrics = await page.evaluate(() => {
    const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
    const header = document.querySelector('header')?.getBoundingClientRect();
    const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
    const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
    const canvas = document.querySelector('canvas')?.getBoundingClientRect();
    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      headerBottom: header ? round(header.bottom) : null,
      stage: stage ? { top: round(stage.top), bottom: round(stage.bottom), height: round(stage.height) } : null,
      dialog: dialog ? { top: round(dialog.top), bottom: round(dialog.bottom), height: round(dialog.height) } : null,
      canvas: canvas ? { top: round(canvas.top), bottom: round(canvas.bottom), height: round(canvas.height) } : null,
    };
  });

  console.log('Metrics at 1920x1080:');
  console.log(JSON.stringify(metrics, null, 2));

  await page.screenshot({ path: 'docs/master/proto-shift/1920x1080-real-prototype-shift.png' });
  console.log('Real screenshot successfully saved to docs/master/proto-shift/1920x1080-real-prototype-shift.png');

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
