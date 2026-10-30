import puppeteer from 'puppeteer-core';

const VIEWPORTS = [
  { name: '1280x720 (Standard Baseline)', width: 1280, height: 720 },
  { name: '1366x625 (Compact Mode)', width: 1366, height: 625 },
  { name: '1024x600 (Compact Mode)', width: 1024, height: 600 },
  { name: '1920x1080 (Full HD)', width: 1920, height: 1080 },
  { name: '2560x1080 (Ultra-Wide)', width: 2560, height: 1080 },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const results = [];

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const header = document.querySelector('header')?.getBoundingClientRect();
      const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
      const spriteWrapper = document.querySelector('[data-landmark-stage="true"] .pointer-events-auto')?.getBoundingClientRect();
      const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
      const skillsBtn = document.querySelector('[data-landmark-btn="skills"]')?.getBoundingClientRect();

      const headerBottom = header ? round(header.bottom) : null;
      const stageBottom = stage ? round(stage.bottom) : null;
      const spriteBottom = spriteWrapper ? round(spriteWrapper.bottom) : null;
      const dialogTop = dialog ? round(dialog.top) : null;
      const dialogBottom = dialog ? round(dialog.bottom) : null;
      const skillsTop = skillsBtn ? round(skillsBtn.top) : null;
      const skillsBottom = skillsBtn ? round(skillsBtn.bottom) : null;

      const skillsOverlapHeader = (headerBottom !== null && skillsTop !== null)
        ? round(headerBottom - skillsTop)
        : null;

      return {
        headerBottom,
        stageBottom,
        spriteBottom,
        dialogTop,
        dialogBottom,
        dialogHeight: dialog ? round(dialog.height) : null,
        skillsTop,
        skillsBottom,
        skillsOverlapHeader, // > 0 means inside header
      };
    });

    results.push({
      name: vp.name,
      ...data,
    });
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
