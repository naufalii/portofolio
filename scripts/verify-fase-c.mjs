import puppeteer from 'puppeteer-core';

const TEST_VIEWPORTS = [
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1080', width: 2560, height: 1080 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1366x625', width: 1366, height: 625 },
  { name: '1024x600', width: 1024, height: 600 },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const results = [];

  for (const vp of TEST_VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const H = window.innerHeight;
      const expectedGroundY = round(0.47 * H);
      const expectedDialogTop = round(expectedGroundY + 38.19);

      const header = document.querySelector('header')?.getBoundingClientRect();
      const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
      const spriteWrapper = document.querySelector('[data-landmark-stage="true"] .pointer-events-auto')?.getBoundingClientRect();
      const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
      const ctaBtn = document.querySelector('[role="region"] button[aria-label*="Mulai"], [role="region"] button')?.getBoundingClientRect();

      const headerBottom = header ? round(header.bottom) : null;
      const stageBottom = stage ? round(stage.bottom) : null;
      const mascotFeetY = spriteWrapper ? round(spriteWrapper.bottom) : null;
      const dialogTop = dialog ? round(dialog.top) : null;
      const ctaTop = ctaBtn ? round(ctaBtn.top) : null;

      const mascotDrift = (mascotFeetY !== null && expectedGroundY !== null)
        ? round(Math.abs(mascotFeetY - expectedGroundY))
        : null;

      const stageClearance = (expectedGroundY !== null && headerBottom !== null)
        ? round(expectedGroundY - headerBottom)
        : null;

      const rule140Passed = stageClearance !== null ? stageClearance >= 140 : null;

      // Check alignment of landmarks vs tabs
      const landmarkAlignments = [];
      const landmarks = ['hero', 'quests', 'skills', 'guild', 'contact', 'guestbook'];
      landmarks.forEach((id) => {
        const tab = document.querySelector(`[data-location-id="${id}"]`)?.getBoundingClientRect();
        const btn = document.querySelector(`[data-landmark-btn="${id}"]`)?.getBoundingClientRect();
        if (tab && btn) {
          const tabCenter = round(tab.left + tab.width / 2);
          const btnCenter = round(btn.left + btn.width / 2);
          landmarkAlignments.push({
            id,
            tabCenter,
            btnCenter,
            drift: round(Math.abs(tabCenter - btnCenter)),
          });
        }
      });

      return {
        viewport: { w: window.innerWidth, h: H },
        expectedGroundY,
        expectedDialogTop,
        headerBottom,
        stageClearance,
        rule140Passed,
        dialogTop,
        dialogDiff: dialogTop !== null ? round(dialogTop - expectedDialogTop) : null,
        ctaTop,
        stageBottom,
        mascotFeetY,
        mascotDrift,
        landmarkAlignments,
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
