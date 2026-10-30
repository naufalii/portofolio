import puppeteer from 'puppeteer-core';

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

  console.log('--- VERIFYING FIX A (M3) ---');
  const viewports = [
    { name: 'desktop_1280x720', w: 1280, h: 720 },
    { name: 'mobile_390x844', w: 390, h: 844 },
    { name: 'desktop_1366x625', w: 1366, h: 625 },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: vp.w < 1024 });

    for (const phase of ['day', 'dusk', 'night']) {
      await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 200));

      await page.evaluate((p) => {
        document.documentElement.setAttribute('data-theme', p);
      }, phase);
      await new Promise(r => setTimeout(r, 200));

      const ssPath = `docs/fixlaptop/after/m3_${vp.name}_${phase}.png`;
      await page.screenshot({ path: ssPath });

      const metrics = await page.evaluate(() => {
        const tagline = document.querySelector('[data-outdoor-tagline]');
        const label = document.querySelector('[data-outdoor-label]');
        const badge = document.querySelector('[data-outdoor-badge]');
        const getStyleInfo = (el) => {
          if (!el) return null;
          const cs = window.getComputedStyle(el);
          return {
            text: el.innerText.trim().slice(0, 30),
            color: cs.color,
            backgroundColor: cs.backgroundColor,
          };
        };
        return {
          tagline: getStyleInfo(tagline),
          label: getStyleInfo(label),
          badge: getStyleInfo(badge),
        };
      });

      console.log(`[${vp.name} - ${phase}]`);
      for (const [key, val] of Object.entries(metrics)) {
        if (!val) continue;
        const fg = parseRgb(val.color);
        const bg = parseRgb(val.backgroundColor);
        const cr = Math.round(getContrast(fg, bg) * 100) / 100;
        console.log(`  ${key}: fg=${val.color}, bg=${val.backgroundColor}, contrast=${cr}:1 (${cr >= 14 ? 'PASS >= 14:1' : 'FAIL'})`);
      }
    }
  }

  await browser.close();
}

run().catch(console.error);
