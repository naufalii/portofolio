import puppeteer from 'puppeteer-core';

const COMPACT_VIEWPORTS = [
  { name: '1366x625', width: 1366, height: 625 },
  { name: '1024x600', width: 1024, height: 600 },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const results = [];

  for (const vp of COMPACT_VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);

      const header = document.querySelector('header')?.getBoundingClientRect();
      const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
      const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
      // CTA button inside dialog: "Mulai Jelajah"
      const ctaBtn = document.querySelector('[role="region"] button[aria-label*="Mulai"], [role="region"] button')?.getBoundingClientRect();
      // Actions container
      const actions = document.querySelector('[role="region"] > div:last-child')?.getBoundingClientRect();

      const vpHeight = window.innerHeight;
      const ctaBottom = ctaBtn ? round(ctaBtn.bottom) : null;
      const dialogBottom = dialog ? round(dialog.bottom) : null;

      return {
        viewportHeight: vpHeight,
        headerBottom: header ? round(header.bottom) : null,
        stageBottom: stage ? round(stage.bottom) : null,
        dialogTop: dialog ? round(dialog.top) : null,
        dialogBottom,
        ctaTop: ctaBtn ? round(ctaBtn.top) : null,
        ctaBottom,
        actionsBottom: actions ? round(actions.bottom) : null,
        ctaClearanceToBottom: ctaBottom !== null ? round(vpHeight - ctaBottom) : null,
        dialogClearanceToBottom: dialogBottom !== null ? round(vpHeight - dialogBottom) : null,
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
