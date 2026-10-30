import puppeteer from 'puppeteer-core';
import fs from 'fs';

const OUT_DIR = 'docs/master/final';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SHOTS = [
  { name: '1280x720-desktop-baseline.png', w: 1280, h: 720, mobile: false },
  { name: '1920x1080-desktop-wide.png', w: 1920, h: 1080, mobile: false },
  { name: '1366x625-short-screen-opsi-b.png', w: 1366, h: 625, mobile: false },
  { name: '1024x600-short-screen-opsi-b.png', w: 1024, h: 600, mobile: false },
  { name: '390x844-mobile.png', w: 390, h: 844, mobile: true },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  for (const s of SHOTS) {
    await page.setViewport({ width: s.w, height: s.h, isMobile: s.mobile, hasTouch: s.mobile });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));
    const outPath = `${OUT_DIR}/${s.name}`;
    await page.screenshot({ path: outPath });
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
}

run().catch(console.error);
