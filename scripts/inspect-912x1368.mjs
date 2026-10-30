import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function inspect912() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 912, height: 1368, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const info = await page.evaluate(() => {
    const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
    const header = document.querySelector('header')?.getBoundingClientRect();
    const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
    const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
    const canvas = document.querySelector('canvas')?.getBoundingClientRect();
    const nav = document.querySelector('nav')?.getBoundingClientRect();

    const landmarks = {};
    document.querySelectorAll('[data-landmark-btn]').forEach((btn) => {
      const id = btn.getAttribute('data-landmark-btn');
      const r = btn.getBoundingClientRect();
      landmarks[id] = {
        left: round(r.left),
        right: round(r.right),
        top: round(r.top),
        bottom: round(r.bottom),
        width: round(r.width),
        height: round(r.height),
      };
    });

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      header: header ? { height: round(header.height), bottom: round(header.bottom) } : null,
      stage: stage ? { top: round(stage.top), bottom: round(stage.bottom), height: round(stage.height) } : null,
      dialog: dialog ? { top: round(dialog.top), bottom: round(dialog.bottom), height: round(dialog.height) } : null,
      canvas: canvas ? { width: round(canvas.width), height: round(canvas.height), rectW: round(canvas.width) } : null,
      landmarks,
      isCutOffHorizontally: Object.values(landmarks).some((l) => l.left < 0 || l.right > window.innerWidth),
    };
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

inspect912().catch(console.error);
