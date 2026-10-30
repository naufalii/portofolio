import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs/paginasi');
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

const DESKTOP_MATRIX = [
  { w: 1255, h: 589, name: '1255x589 (Laptop Compact Primary)' },
  { w: 1280, h: 590, name: '1280x590 (Laptop Compact)' },
  { w: 1366, h: 625, name: '1366x625 (HD Laptop Windowed)' },
  { w: 1024, h: 480, name: '1024x480 (Desktop Threshold Min)' },
  { w: 1366, h: 768, name: '1366x768 (Standard HD Laptop)' },
  { w: 1280, h: 720, name: '1280x720 (Standard HD Baseline)' },
  { w: 1920, h: 1080, name: '1920x1080 (FHD Desktop Standard)' },
  { w: 2560, h: 1080, name: '2560x1080 (Ultrawide Standard)' },
  { w: 1536, h: 730, name: '1536x730 (Laptop Windowed/Surface)' },
  { w: 1680, h: 1050, name: '1680x1050 (WSXGA+ Standard)' },
  { w: 2560, h: 1440, name: '2560x1440 (QHD Standard)' },
];

const ADDITIONAL_MATRIX = [
  // Boundaries (Mode & Height Boundaries)
  { w: 1023, h: 800, name: '1023x800 (Mode Boundary: W < 1024 -> Mobile)' },
  { w: 1024, h: 479, name: '1024x479 (Mode Boundary: H < 480 -> Mobile)' },
  { w: 1280, h: 699, name: '1280x699 (Height Boundary: H < 700 -> Compact Desktop)' },
  { w: 1280, h: 700, name: '1280x700 (Height Boundary: H >= 700 -> Standard Desktop)' },

  // Zoom Simulations for 1920x1080 (CSS Viewport = Physical / Zoom)
  { w: 2865, h: 1612, name: '1920x1080 @ 67% Zoom (CSS 2865x1612)' },
  { w: 2400, h: 1350, name: '1920x1080 @ 80% Zoom (CSS 2400x1350)' },
  { w: 1745, h: 982, name: '1920x1080 @ 110% Zoom (CSS 1745x982)' },
  { w: 1536, h: 864, name: '1920x1080 @ 125% Zoom (CSS 1536x864)' },
  { w: 1280, h: 720, name: '1920x1080 @ 150% Zoom (CSS 1280x720)' },

  // Zoom Simulations for 1366x768 (CSS Viewport = Physical / Zoom)
  { w: 2038, h: 1146, name: '1366x768 @ 67% Zoom (CSS 2038x1146)' },
  { w: 1707, h: 960, name: '1366x768 @ 80% Zoom (CSS 1707x960)' },
  { w: 1241, h: 698, name: '1366x768 @ 110% Zoom (CSS 1241x698 Compact)' },
  { w: 1092, h: 614, name: '1366x768 @ 125% Zoom (CSS 1092x614 Compact)' },
  { w: 911, h: 512, name: '1366x768 @ 150% Zoom (CSS 911x512 -> Mobile)' },

  // Additional Desktop & Ultrawide
  { w: 1024, h: 768, name: '1024x768 (XGA 4:3)' },
  { w: 1024, h: 600, name: '1024x600 (Netbook/WSVGA)' },
  { w: 1152, h: 864, name: '1152x864 (XGA+)' },
  { w: 1280, h: 800, name: '1280x800 (WXGA 16:10)' },
  { w: 1440, h: 900, name: '1440x900 (WXGA+)' },
  { w: 1600, h: 900, name: '1600x900 (HD+)' },
  { w: 1920, h: 947, name: '1920x947 (FHD Browser Windowed)' },
  { w: 1920, h: 1200, name: '1920x1200 (WUXGA 16:10)' },
  { w: 3440, h: 1440, name: '3440x1440 (UWQHD Ultrawide)' },
  { w: 1024, h: 1366, name: '1024x1366 (iPad Pro Portrait -> Mobile)' },
  { w: 1080, h: 1920, name: '1080x1920 (FHD Portrait -> Mobile)' },

  // Tablets
  { w: 768, h: 1024, name: '768x1024 (iPad Portrait -> Mobile)' },
  { w: 820, h: 1180, name: '820x1180 (iPad Air Portrait -> Mobile)' },
  { w: 834, h: 1194, name: '834x1194 (iPad Pro 11 Portrait -> Mobile)' },
  { w: 1180, h: 820, name: '1180x820 (iPad Air Landscape -> Desktop)' },

  // Mobile / HP Landscape (H < 480 -> Mobile)
  { w: 667, h: 375, name: '667x375 (iPhone SE Landscape)' },
  { w: 844, h: 390, name: '844x390 (iPhone 12/13/14 Landscape)' },
  { w: 932, h: 430, name: '932x430 (iPhone 14 Pro Max Landscape)' },

  // Windows 150% Scale (physical 1366x768 -> CSS 911x...)
  { w: 911, h: 430, name: '911x430 (Windows 150% Windowed)' },
  { w: 911, h: 450, name: '911x450 (Windows 150% Normal)' },

  // Mobile Standard
  { w: 390, h: 844, name: '390x844 (iPhone 12/13/14 Portrait)' },
  { w: 360, h: 800, name: '360x800 (Android Standard)' },
  { w: 412, h: 915, name: '412x915 (Pixel 7 Portrait)' },
];

const SECTIONS = ['quests', 'skills', 'guild', 'contact', 'guestbook'];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  const results = [];

  console.log('--- 1. Testing Desktop Matrix & Additional Matrix ---');
  const allViewports = [...DESKTOP_MATRIX, ...ADDITIONAL_MATRIX];

  for (const vp of allViewports) {
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: vp.w < 1024 || vp.w < vp.h });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForSelector('#active-section-hero', { timeout: 3000 });
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));

    const pageState = await page.evaluate((vpW, vpH) => {
      const isDesktopMode = vpW >= 1024 && vpH >= 480 && vpW >= vpH;
      const headerEl = document.querySelector('header');
      const hRect = headerEl ? headerEl.getBoundingClientRect() : null;
      const dockEl = document.querySelector('nav[aria-label="Navigasi Peta Overworld"]');
      const dRect = dockEl ? dockEl.getBoundingClientRect() : null;
      const dialogHero = document.getElementById('active-section-hero');
      const dhRect = dialogHero ? dialogHero.getBoundingClientRect() : null;
      const ctaBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Mulai Jelajah')
      );
      const ctaRect = ctaBtn ? ctaBtn.getBoundingClientRect() : null;

      return {
        isDesktopMode,
        headerH: hRect ? hRect.height : 0,
        dockH: dRect ? dRect.height : 0,
        dialogTop: dhRect ? dhRect.top : 0,
        ctaTop: ctaRect ? ctaRect.top : 0,
      };
    }, vp.w, vp.h);

    const vpResult = {
      viewport: `${vp.w}x${vp.h}`,
      name: vp.name,
      mode: pageState.isDesktopMode ? 'Desktop' : 'Mobile',
      sections: {},
      keyPositions: {
        headerH: Number(pageState.headerH.toFixed(1)),
        dockH: Number(pageState.dockH.toFixed(1)),
        dialogTop: Number(pageState.dialogTop.toFixed(2)),
        ctaTop: Number(pageState.ctaTop.toFixed(2)),
      },
    };

    if (pageState.isDesktopMode) {
      for (const sec of SECTIONS) {
        await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'domcontentloaded' });
        try {
          await page.waitForSelector(`#active-section-${sec}`, { timeout: 3000 });
        } catch (e) {}
        await new Promise((r) => setTimeout(r, 150));

        const secData = await page.evaluate((secId) => {
          const panel = document.getElementById(`active-section-${secId}`);
          if (!panel) return { totalPages: 0, overflow: 0, itemsCount: 0, uniqueIds: [] };

          const overflow = Math.max(0, panel.scrollHeight - panel.clientHeight);
          const itemEls = Array.from(panel.querySelectorAll('[data-page-item-id]'));
          const uniqueIds = Array.from(new Set(itemEls.map((el) => el.getAttribute('data-page-item-id'))));

          // Look for pagination indicator
          const nav = document.querySelector('nav[aria-label="Paginasi Halaman Section"]');
          let totalPages = 1;
          if (nav) {
            const indText = nav.textContent || '';
            const match = indText.match(/\/(\d+)/);
            if (match) totalPages = parseInt(match[1], 10);
          }

          let submitVisible = true;
          let clearanceBottom = 0;
          if (secId === 'contact') {
            const submitBtn = panel.querySelector('button[type="submit"]');
            if (submitBtn) {
              const sr = submitBtn.getBoundingClientRect();
              submitVisible = sr.bottom <= window.innerHeight;
              clearanceBottom = Math.round(window.innerHeight - sr.bottom);
            }
          }

          return {
            totalPages,
            overflow,
            itemsCount: itemEls.length,
            uniqueIds,
            submitVisible,
            clearanceBottom,
            panelHeight: Math.round(panel.offsetHeight),
          };
        }, sec);

        vpResult.sections[sec] = secData;
      }
    }

    results.push(vpResult);
    console.log(`[PASS] ${vp.name}: Mode = ${vpResult.mode}`);
  }

  console.log('\n--- 2. Keyboard & Button Navigation Test ---');
  await page.setViewport({ width: 1255, height: 589, isMobile: false });
  await page.goto('http://localhost:4173/#quests', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 500));

  const navTest = await page.evaluate(async () => {
    const nextBtn = document.querySelector('button[aria-label="Halaman berikutnya"]');
    const prevBtn = document.querySelector('button[aria-label="Halaman sebelumnya"]');
    const indicator = document.querySelector('div[aria-current="page"]');

    const initialText = indicator ? indicator.textContent : '';
    let clickedNext = false;
    let clickedPrev = false;

    if (nextBtn && !nextBtn.disabled) {
      nextBtn.click();
      await new Promise((r) => setTimeout(r, 200));
      clickedNext = true;
    }
    const page2Text = indicator ? indicator.textContent : '';

    if (prevBtn && !prevBtn.disabled) {
      prevBtn.click();
      await new Promise((r) => setTimeout(r, 200));
      clickedPrev = true;
    }
    const backText = indicator ? indicator.textContent : '';

    return {
      initialText,
      page2Text,
      backText,
      clickedNext,
      clickedPrev,
    };
  });
  console.log('Navigation test result:', navTest);

  console.log('\n--- 3. Tablet Rotation Test (1180x820 <-> 820x1180) ---');
  await page.setViewport({ width: 1180, height: 820, isMobile: false });
  await page.goto('http://localhost:4173/#quests', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 400));
  const landscapeMode = await page.evaluate(() => {
    const isDesk = window.innerWidth >= 1024 && window.innerHeight >= 480 && window.innerWidth >= window.innerHeight;
    return isDesk ? 'Desktop' : 'Mobile';
  });

  await page.setViewport({ width: 820, height: 1180, isMobile: true });
  await new Promise((r) => setTimeout(r, 400));
  const portraitMode = await page.evaluate(() => {
    const isDesk = window.innerWidth >= 1024 && window.innerHeight >= 480 && window.innerWidth >= window.innerHeight;
    return isDesk ? 'Desktop' : 'Mobile';
  });

  await page.setViewport({ width: 1180, height: 820, isMobile: false });
  await new Promise((r) => setTimeout(r, 400));
  const backLandscapeMode = await page.evaluate(() => {
    const isDesk = window.innerWidth >= 1024 && window.innerHeight >= 480 && window.innerWidth >= window.innerHeight;
    return isDesk ? 'Desktop' : 'Mobile';
  });
  console.log(`Rotation test: 1180x820 (${landscapeMode}) -> 820x1180 (${portraitMode}) -> 1180x820 (${backLandscapeMode})`);

  console.log('\n--- 4. Capturing Day & Night Screenshots (1255x589 and 1920x1080) ---');
  const captureTargets = [
    { w: 1255, h: 589 },
    { w: 1920, h: 1080 },
  ];
  const allSections = ['hero', 'quests', 'skills', 'guild', 'contact', 'guestbook'];

  for (const ct of captureTargets) {
    for (const sec of allSections) {
      // Day
      await page.setViewport({ width: ct.w, height: ct.h, isMobile: false });
      await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'domcontentloaded' });
      try {
        await page.waitForSelector(`#active-section-${sec}`, { timeout: 3000 });
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 200));
      const dayPath = path.join(DOCS_DIR, `${sec}_${ct.w}x${ct.h}_day.png`);
      await page.screenshot({ path: dayPath });

      // Night override via DayNightIndicator dropdown portal
      await page.evaluate(() => {
        const toggleBtn = document.querySelector('button[title="Ubah Siklus Waktu"]');
        if (toggleBtn) toggleBtn.click();
      });
      await new Promise((r) => setTimeout(r, 200));

      await page.evaluate(() => {
        const portal = document.getElementById('day-night-portal-menu');
        if (portal) {
          const nightBtn = Array.from(portal.querySelectorAll('button')).find(
            (b) => b.textContent.toLowerCase().includes('malam') || b.textContent.includes('🌙')
          );
          if (nightBtn) nightBtn.click();
        }
      });
      await new Promise((r) => setTimeout(r, 300));
      const nightPath = path.join(DOCS_DIR, `${sec}_${ct.w}x${ct.h}_night.png`);
      await page.screenshot({ path: nightPath });
      console.log(`Captured: ${sec} (${ct.w}x${ct.h}) [Day & Night]`);
    }
  }

  fs.writeFileSync(
    path.join(DOCS_DIR, 'verification-results.json'),
    JSON.stringify({ results, navTest, rotation: { landscapeMode, portraitMode, backLandscapeMode } }, null, 2)
  );
  console.log('\nVerification suite completed. Output written to docs/paginasi/verification-results.json');

  await browser.close();
}

run().catch(console.error);
