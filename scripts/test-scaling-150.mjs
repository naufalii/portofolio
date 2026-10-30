import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { computeWorldLayout } from '../src/lib/worldLayout.js';

async function testScaling() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Test 1: Option (a) - Current system on 911x512
  await page.setViewport({ width: 911, height: 512, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const optA_512 = await page.evaluate(() => {
    const isDesk = !window.matchMedia('(max-width: 1023px), (max-height: 479px)').matches;
    const header = document.querySelector('header')?.getBoundingClientRect();
    const dock = document.querySelector('nav[aria-label="Peta Navigasi Mobile"]')?.getBoundingClientRect();
    const firstSection = document.querySelector('main section')?.getBoundingClientRect();
    return {
      isDesktop: isDesk,
      layoutMode: isDesk ? 'Desktop Overworld' : 'Mobile/Tablet Vertikal',
      header: header ? { height: header.height, bottom: header.bottom } : null,
      dock: dock ? { height: dock.height, top: dock.top } : null,
      scrollable: document.documentElement.scrollHeight > window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    };
  });

  await page.screenshot({ path: 'docs/fixlaptop/after/option_a_911x512.png', fullPage: false });

  // Test 2: Measure what happens on 911x450 (non-fullscreen with browser chrome)
  await page.setViewport({ width: 911, height: 450, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const optA_450 = await page.evaluate(() => {
    const isDesk = !window.matchMedia('(max-width: 1023px), (max-height: 479px)').matches;
    return {
      isDesktop: isDesk,
      layoutMode: isDesk ? 'Desktop Overworld' : 'Mobile/Tablet Vertikal',
      scrollable: document.documentElement.scrollHeight > window.innerHeight,
    };
  });

  await page.screenshot({ path: 'docs/fixlaptop/after/option_a_911x450.png', fullPage: false });

  // Test Option (b) Layout Mathematics:
  // If DESKTOP_MIN_W = 900:
  const optB_layout_512 = computeWorldLayout(911, 512, 86);
  // Force simulate desktop compact layout on page to see exact rendering
  await page.setViewport({ width: 911, height: 512, deviceScaleFactor: 1 });
  // We can evaluate how it looks if we temporarily test DESKTOP_MIN_W = 900
  await browser.close();

  const report = {
    optA_512,
    optA_450,
    optB_layout_512,
  };

  fs.writeFileSync('scripts/scaling_150_report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

testScaling().catch(console.error);
