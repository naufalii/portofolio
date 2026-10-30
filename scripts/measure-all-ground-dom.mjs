import puppeteer from 'puppeteer-core';

const DESKTOP_VIEWPORTS = [
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1024x600', width: 1024, height: 600 },
  { name: '1152x864', width: 1152, height: 864 },
  { name: '1280x600', width: 1280, height: 600 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1280x1024', width: 1280, height: 1024 },
  { name: '1366x625', width: 1366, height: 625 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1536x730', width: 1536, height: 730 },
  { name: '1536x864', width: 1536, height: 864 },
  { name: '1600x900', width: 1600, height: 900 },
  { name: '1680x1050', width: 1680, height: 1050 },
  { name: '1920x947', width: 1920, height: 947 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1920x1200', width: 1920, height: 1200 },
  { name: '2560x1080', width: 2560, height: 1080 },
  { name: '2560x1440', width: 2560, height: 1440 },
  { name: '3440x1440', width: 3440, height: 1440 },
  { name: '1024x1366', width: 1024, height: 1366 },
  { name: '1080x1920', width: 1080, height: 1920 },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const results = [];

  for (const vp of DESKTOP_VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 200));

    const data = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const header = document.querySelector('header')?.getBoundingClientRect();
      const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
      const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
      const firstBtn = document.querySelector('[data-landmark-btn="hero"]')?.getBoundingClientRect();

      // Button bottom is pos.screenY + 4, so groundScreenY is button.bottom - 4
      const btnBottom = firstBtn ? round(firstBtn.bottom) : null;
      const groundScreenY = btnBottom !== null ? round(btnBottom - 4) : null;
      const dialogTop = dialog ? round(dialog.top) : null;

      return {
        headerBottom: header ? round(header.bottom) : null,
        stageBottom: stage ? round(stage.bottom) : null,
        groundScreenY,
        btnBottom,
        dialogTop,
        penetration: (groundScreenY !== null && dialogTop !== null) ? round(groundScreenY - dialogTop) : null,
      };
    });

    results.push({
      name: vp.name,
      width: vp.width,
      height: vp.height,
      ...data,
    });
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
