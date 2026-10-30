import puppeteer from 'puppeteer-core';

const TEST_VIEWPORTS = [
  { name: '1280x720 (Patokan)', width: 1280, height: 720 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1080', width: 2560, height: 1080 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1366x625 (Layar Pendek)', width: 1366, height: 625 },
  { name: '1024x600 (Layar Pendek)', width: 1024, height: 600 },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const results = [];

  for (const vp of TEST_VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const metrics = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);

      const header = document.querySelector('header');
      const headerRect = header ? header.getBoundingClientRect() : null;
      const headerBottom = headerRect ? round(headerRect.bottom) : null;

      const nav = document.querySelector('nav');
      const navRect = nav ? nav.getBoundingClientRect() : null;
      const navBottom = navRect ? round(navRect.bottom) : null;

      const stage = document.querySelector('[data-landmark-stage="true"]');
      const badge = stage ? stage.querySelector('div.font-pixel') : null;
      const badgeRect = badge ? badge.getBoundingClientRect() : null;
      const badgeTop = badgeRect ? round(badgeRect.top) : null;
      const badgeBottom = badgeRect ? round(badgeRect.bottom) : null;
      const badgeHeight = badgeRect ? round(badgeRect.height) : null;

      const mascotWrapper = stage ? stage.querySelector('.pointer-events-auto') : null;
      const mascotRect = mascotWrapper ? mascotWrapper.getBoundingClientRect() : null;
      const mascotTop = mascotRect ? round(mascotRect.top) : null;
      const mascotBottom = mascotRect ? round(mascotRect.bottom) : null;
      const mascotHeight = mascotRect ? round(mascotRect.height) : null;

      const H = window.innerHeight;
      const groundY = round(0.47 * H);

      const dialog = document.querySelector('[role="region"]');
      const dialogRect = dialog ? dialog.getBoundingClientRect() : null;
      const dialogTop = dialogRect ? round(dialogRect.top) : null;

      // Clearance against header container (208 px)
      const badgeVsHeader = (badgeTop !== null && headerBottom !== null) ? round(badgeTop - headerBottom) : null;
      const mascotVsHeader = (mascotTop !== null && headerBottom !== null) ? round(mascotTop - headerBottom) : null;

      // Clearance against visible nav bar (188 px)
      const badgeVsNav = (badgeTop !== null && navBottom !== null) ? round(badgeTop - navBottom) : null;
      const mascotVsNav = (mascotTop !== null && navBottom !== null) ? round(mascotTop - navBottom) : null;

      return {
        viewportH: H,
        groundY,
        headerBottom,
        navBottom,
        badgeTop,
        badgeBottom,
        badgeHeight,
        mascotTop,
        mascotBottom,
        mascotHeight,
        dialogTop,
        badgeVsHeader,
        mascotVsHeader,
        badgeVsNav,
        mascotVsNav,
        statusHeader: (badgeVsHeader >= 0 && mascotVsHeader >= 0) ? 'AMAN' : 'TABRAKAN',
        statusNav: (badgeVsNav >= 0 && mascotVsNav >= 0) ? 'AMAN' : 'TABRAKAN',
      };
    });

    results.push({
      name: vp.name,
      width: vp.width,
      height: vp.height,
      ...metrics,
    });
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
