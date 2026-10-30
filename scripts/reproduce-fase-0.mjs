import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const V_SIZES = [
  { name: '1366x625', width: 1366, height: 625 },
  { name: '1280x590', width: 1280, height: 590 },
  { name: '1093x500', width: 1093, height: 500 },
  { name: '1536x720', width: 1536, height: 720 },
  { name: '1909x991', width: 1909, height: 991 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1080', width: 2560, height: 1080 },
  { name: '1280x720', width: 1280, height: 720 },
];

function rgbToLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
}

function getContrast(rgb1, rgb2) {
  const l1 = rgbToLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = rgbToLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const reportM1 = [];
  const reportM2 = [];
  const reportM3 = [];
  let reportM4 = null;

  console.log('--- REPRODUCING M1 & M2 ---');
  for (const s of V_SIZES) {
    await page.setViewport({ width: s.width, height: s.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    // Capture screenshot for before evidence
    const ssPath = `docs/fixlaptop/before/m1_${s.name}.png`;
    await page.screenshot({ path: ssPath });

    const m1Data = await page.evaluate(() => {
      const header = document.querySelector('header');
      const bottomDock = document.querySelector('nav.fixed.bottom-0, nav[class*="bottom-0"]');
      const isMobileLayout = !!bottomDock;
      const headerH = header ? header.getBoundingClientRect().height : 0;
      return {
        mode: isMobileLayout ? 'VERTIKAL (Mobile)' : 'HORIZONTAL (Desktop Overworld)',
        headerH: Math.round(headerH * 100) / 100,
        hasBottomDock: isMobileLayout
      };
    });

    reportM1.push({
      viewport: s.name,
      ...m1Data,
      screenshot: ssPath
    });

    // M2: Only on desktop sizes, inspect landmarks
    if (m1Data.mode.includes('HORIZONTAL')) {
      const m2Data = await page.evaluate(() => {
        const landmarkBtns = Array.from(document.querySelectorAll('[data-landmark-btn]'));
        const results = [];
        for (const btn of landmarkBtns) {
          const id = btn.getAttribute('data-landmark-btn');
          const rect = btn.getBoundingClientRect();
          const cx = Math.round(rect.left + rect.width / 2);
          const cy = Math.round(rect.top + rect.height / 2);
          const topElement = document.elementsFromPoint(cx, cy)[0];
          results.push({
            id,
            cx,
            cy,
            btnRect: { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) },
            topTag: topElement ? topElement.tagName.toLowerCase() : 'none',
            topClass: topElement ? (topElement.className || '').toString().slice(0, 80) : '',
            topId: topElement ? topElement.id : '',
            isBlocked: topElement !== btn && !btn.contains(topElement),
            blockerDesc: topElement ? `<${topElement.tagName.toLowerCase()} class="${(topElement.className||'').toString().slice(0, 40)}">` : 'none'
          });
        }
        return results;
      });

      reportM2.push({
        viewport: s.name,
        landmarks: m2Data
      });
    }
  }

  console.log('--- REPRODUCING M3 ---');
  // M3: Check daytime, dusk, night on 1280x720 and mobile 390x844
  for (const vp of [{ name: 'desktop_1280x720', w: 1280, h: 720 }, { name: 'mobile_390x844', w: 390, h: 844 }]) {
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: vp.w < 1024 });

    for (const phase of ['day', 'dusk', 'night']) {
      await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 200));

      // Click time button if present or set document data-theme
      await page.evaluate((p) => {
        document.documentElement.setAttribute('data-theme', p);
      }, phase);
      await new Promise(r => setTimeout(r, 200));

      const ssPath = `docs/fixlaptop/before/m3_${vp.name}_${phase}.png`;
      await page.screenshot({ path: ssPath });

      const metrics = await page.evaluate(() => {
        const tagline = document.querySelector('[data-outdoor-tagline]');
        const label = document.querySelector('[data-outdoor-label]');
        const getStyleInfo = (el) => {
          if (!el) return null;
          const cs = window.getComputedStyle(el);
          return {
            text: el.innerText.trim(),
            color: cs.color,
            backgroundColor: cs.backgroundColor,
          };
        };
        return {
          tagline: getStyleInfo(tagline),
          label: getStyleInfo(label)
        };
      });

      const taglineRgb = metrics.tagline ? parseRgb(metrics.tagline.color) : null;
      const tagBgRgb = metrics.tagline ? parseRgb(metrics.tagline.backgroundColor) : null;
      const taglineContrast = (taglineRgb && tagBgRgb) ? Math.round(getContrast(taglineRgb, tagBgRgb) * 100) / 100 : null;

      const labelRgb = metrics.label ? parseRgb(metrics.label.color) : null;
      const lblBgRgb = metrics.label ? parseRgb(metrics.label.backgroundColor) : null;
      const labelContrast = (labelRgb && lblBgRgb) ? Math.round(getContrast(labelRgb, lblBgRgb) * 100) / 100 : null;

      reportM3.push({
        viewport: vp.name,
        phase,
        tagline: {
          ...metrics.tagline,
          contrast: taglineContrast
        },
        label: {
          ...metrics.label,
          contrast: labelContrast
        },
        screenshot: ssPath
      });
    }
  }

  console.log('--- REPRODUCING M4 ---');
  // M4 on 1909x991
  await page.setViewport({ width: 1909, height: 991, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const ssM4 = `docs/fixlaptop/before/m4_1909x991_active_box.png`;
  await page.screenshot({ path: ssM4 });

  reportM4 = await page.evaluate(() => {
    const activeBtn = document.querySelector('[data-landmark-btn="hero"]');
    if (!activeBtn) return { error: 'No active hero landmark btn found' };
    const box = activeBtn.querySelector('div');
    const cs = box ? window.getComputedStyle(box) : null;
    return {
      element: box ? box.tagName.toLowerCase() : null,
      className: box ? box.className : null,
      backgroundColor: cs ? cs.backgroundColor : null,
      boxShadow: cs ? cs.boxShadow : null,
      border: cs ? cs.border : null,
    };
  });

  const fullReport = {
    M1: reportM1,
    M2: reportM2,
    M3: reportM3,
    M4: reportM4
  };

  fs.writeFileSync('docs/fixlaptop/before/fase0_reproduction.json', JSON.stringify(fullReport, null, 2));
  console.log('Fase 0 Reproduction completed and saved to docs/fixlaptop/before/fase0_reproduction.json');

  await browser.close();
}

run().catch(console.error);
