import puppeteer from 'puppeteer-core';

const DESKTOP_VIEWPORTS = [
  { name: '1280x720 (Patokan)', width: 1280, height: 720 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1080', width: 2560, height: 1080 },
  { name: '1366x768', width: 1366, height: 768 },
];

const SHORT_VIEWPORTS = [
  { name: '1366x625 (Layar Pendek Opsi B)', width: 1366, height: 625 },
  { name: '1024x600 (Layar Pendek Opsi B)', width: 1024, height: 600 },
];

const MOBILE_VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '412x915', width: 412, height: 915 },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const results = {
    desktop: [],
    short: [],
    mobile: [],
  };

  // 1. Desktop verification
  for (const vp of DESKTOP_VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const H = window.innerHeight;
      const expectedGroundY = round(0.47 * H);
      const expectedDialogTop = round(expectedGroundY + 38.19);

      const header = document.querySelector('header')?.getBoundingClientRect();
      const nav = document.querySelector('nav')?.getBoundingClientRect();
      const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
      const mascot = document.querySelector('[data-landmark-stage="true"] .pointer-events-auto')?.getBoundingClientRect();
      const badge = document.querySelector('[data-landmark-stage="true"] div.font-pixel')?.getBoundingClientRect();
      const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
      const ctaBtn = document.querySelector('[role="region"] button')?.getBoundingClientRect();

      const headerBottom = header ? round(header.bottom) : null;
      const navBottom = nav ? round(nav.bottom) : null;
      const mascotFeetY = mascot ? round(mascot.bottom) : null;
      const mascotTop = mascot ? round(mascot.top) : null;
      const badgeTop = badge ? round(badge.top) : null;
      const dialogTop = dialog ? round(dialog.top) : null;
      const ctaBottom = ctaBtn ? round(ctaBtn.bottom) : null;

      const mascotDrift = (mascotFeetY !== null && expectedGroundY !== null)
        ? round(Math.abs(mascotFeetY - expectedGroundY))
        : null;

      const dialogDrift = (dialogTop !== null && expectedDialogTop !== null)
        ? round(Math.abs(dialogTop - expectedDialogTop))
        : null;

      return {
        expectedGroundY,
        expectedDialogTop,
        headerBottom,
        navBottom,
        badgeTop,
        mascotTop,
        mascotFeetY,
        mascotDrift,
        dialogTop,
        dialogDrift,
        badgeVsNav: badgeTop && navBottom ? round(badgeTop - navBottom) : null,
        mascotVsHeader: mascotTop && headerBottom ? round(mascotTop - headerBottom) : null,
        ctaBottom,
      };
    });

    results.desktop.push({
      name: vp.name,
      width: vp.width,
      height: vp.height,
      ...data,
    });
  }

  // 2. Short screen verification (Opsi B: vertical mobile layout when H < 700)
  for (const vp of SHORT_VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const header = document.querySelector('header')?.getBoundingClientRect();
      const bottomNav = document.querySelector('nav[aria-label*="Peta Navigasi Mobile"]')?.getBoundingClientRect();
      const heroSection = document.querySelector('#section-hero')?.getBoundingClientRect();
      const ctaBtn = document.querySelector('#section-hero button')?.getBoundingClientRect();
      const isMobileLayoutActive = !!document.querySelector('#section-hero');

      return {
        isMobileLayoutActive,
        headerHeight: header ? round(header.height) : null,
        bottomNavHeight: bottomNav ? round(bottomNav.height) : null,
        heroSectionTop: heroSection ? round(heroSection.top) : null,
        ctaBottom: ctaBtn ? round(ctaBtn.bottom) : null,
        scrollHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
        isScrollable: document.documentElement.scrollHeight > window.innerHeight,
      };
    });

    results.short.push({
      name: vp.name,
      width: vp.width,
      height: vp.height,
      ...data,
    });
  }

  // 3. Mobile verification (width < 1024)
  for (const vp of MOBILE_VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const header = document.querySelector('header')?.getBoundingClientRect();
      const bottomNav = document.querySelector('nav[aria-label*="Peta Navigasi Mobile"]')?.getBoundingClientRect();
      const outdoorTagline = document.querySelector('[data-outdoor-tagline="true"]')?.getBoundingClientRect();
      const questsLabel = document.querySelector('#section-quests [data-outdoor-label="true"]')?.getBoundingClientRect();
      const heroSection = document.querySelector('#section-hero')?.getBoundingClientRect();
      const ctaBtn = document.querySelector('#section-hero button')?.getBoundingClientRect();

      return {
        headerTop: header ? round(header.top) : null,
        headerHeight: header ? round(header.height) : null,
        bottomNavTop: bottomNav ? round(bottomNav.top) : null,
        bottomNavHeight: bottomNav ? round(bottomNav.height) : null,
        outdoorTaglineTop: outdoorTagline ? round(outdoorTagline.top) : null,
        questsLabelTop: questsLabel ? round(questsLabel.top) : null,
        heroSectionTop: heroSection ? round(heroSection.top) : null,
        ctaBottom: ctaBtn ? round(ctaBtn.bottom) : null,
      };
    });

    results.mobile.push({
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
