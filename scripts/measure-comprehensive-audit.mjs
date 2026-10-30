import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function runAudit() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  // 1. ALL DESKTOP SIZES FOR OVERFLOW PER SECTION
  const desktopViewports = [
    { name: '1255x589 (Laptop Compact Primary)', w: 1255, h: 589 },
    { name: '1280x590 (Laptop Compact)', w: 1280, h: 590 },
    { name: '1366x625 (HD Laptop Windowed)', w: 1366, h: 625 },
    { name: '1024x480 (Desktop Min Threshold)', w: 1024, h: 480 },
    { name: '1280x699 (Compact Boundary)', w: 1280, h: 699 },
    { name: '1280x700 (Standard Boundary)', w: 1280, h: 700 },
    { name: '1280x720 (Standard HD Baseline)', w: 1280, h: 720 },
    { name: '1366x768 (Standard HD Laptop)', w: 1366, h: 768 },
    { name: '1536x730 (Laptop Windowed/Surface)', w: 1536, h: 730 },
    { name: '1680x1050 (WSXGA+ Standard)', w: 1680, h: 1050 },
    { name: '1920x1080 (FHD Desktop Standard)', w: 1920, h: 1080 },
    { name: '2560x1080 (Ultrawide Standard)', w: 2560, h: 1080 },
    { name: '2560x1440 (QHD Standard)', w: 2560, h: 1440 },
    { name: '3440x1440 (UWQHD Ultrawide)', w: 3440, h: 1440 },
    { name: '1024x600 (Netbook WSVGA)', w: 1024, h: 600 },
    { name: '1024x768 (XGA 4:3)', w: 1024, h: 768 },
    { name: '1152x864 (XGA+)', w: 1152, h: 864 },
    { name: '1280x800 (WXGA 16:10)', w: 1280, h: 800 },
    { name: '1440x900 (WXGA+)', w: 1440, h: 900 },
    { name: '1600x900 (HD+)', w: 1600, h: 900 },
    { name: '1920x947 (FHD Windowed)', w: 1920, h: 947 },
    { name: '1920x1200 (WUXGA 16:10)', w: 1920, h: 1200 },
    { name: '1180x820 (iPad Air Landscape)', w: 1180, h: 820 },
    // Zoom on 1920x1080
    { name: '1920x1080 @ 67% (CSS 2865x1612)', w: 2865, h: 1612 },
    { name: '1920x1080 @ 80% (CSS 2400x1350)', w: 2400, h: 1350 },
    { name: '1920x1080 @ 110% (CSS 1745x982)', w: 1745, h: 982 },
    { name: '1920x1080 @ 125% (CSS 1536x864)', w: 1536, h: 864 },
    { name: '1920x1080 @ 150% (CSS 1280x720)', w: 1280, h: 720 },
    // Zoom on 1366x768
    { name: '1366x768 @ 67% (CSS 2038x1146)', w: 2038, h: 1146 },
    { name: '1366x768 @ 80% (CSS 1707x960)', w: 1707, h: 960 },
    { name: '1366x768 @ 110% (CSS 1241x698)', w: 1241, h: 698 },
    { name: '1366x768 @ 125% (CSS 1092x614)', w: 1092, h: 614 },
  ];

  const sections = ['quests', 'skills', 'guild', 'contact', 'guestbook'];
  const desktopResults = [];

  console.log('--- 1. Measuring Overflow Per Section for All Desktop Sizes ---');
  for (const vp of desktopViewports) {
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: false });
    const row = {
      name: vp.name,
      viewport: `${vp.w}x${vp.h}`,
      mode: vp.h < 700 ? 'Desktop Padat' : 'Desktop Standar',
      sections: {},
    };

    for (const sec of sections) {
      await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'domcontentloaded' });
      try {
        await page.waitForSelector(`#active-section-${sec}`, { timeout: 3000 });
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 200));

      const secData = await page.evaluate((secId) => {
        const panel = document.getElementById(`active-section-${secId}`);
        if (!panel) return { pages: 0, overflow: 0 };

        const overflow = Math.max(0, panel.scrollHeight - panel.clientHeight);
        const nav = document.querySelector('nav[aria-label="Paginasi Halaman Section"]');
        let pages = 1;
        if (nav) {
          const m = nav.textContent.match(/\/(\d+)/);
          if (m) pages = parseInt(m[1], 10);
        }

        let submitVisible = true;
        let clearanceBottom = null;
        if (secId === 'contact') {
          const btn = panel.querySelector('button[type="submit"]');
          if (btn) {
            const r = btn.getBoundingClientRect();
            submitVisible = r.bottom <= window.innerHeight;
            clearanceBottom = Math.round(window.innerHeight - r.bottom);
          }
        }

        return {
          pages,
          overflow,
          submitVisible,
          clearanceBottom,
          scrollHeight: Math.round(panel.scrollHeight),
          clientHeight: Math.round(panel.clientHeight),
        };
      }, sec);

      row.sections[sec] = secData;
    }

    desktopResults.push(row);
    console.log(`Measured: ${vp.name}`);
  }

  // 2. DETAILED COMPARISON: Quest Log 1920x1080 (100%) vs 1920x1080 @ 67% (2865x1612)
  console.log('\n--- 2. Detailed Quest Log Comparison (100% vs 67% Zoom) ---');
  const questComparison = {};

  const zoomCompareTargets = [
    { name: '1920x1080 (100% Zoom)', w: 1920, h: 1080 },
    { name: '1920x1080 @ 67% Zoom (CSS 2865x1612)', w: 2865, h: 1612 },
  ];

  for (const target of zoomCompareTargets) {
    await page.setViewport({ width: target.w, height: target.h, isMobile: false });
    await page.goto('http://localhost:4173/#quests', { waitUntil: 'domcontentloaded' });
    try {
      await page.waitForSelector('#active-section-quests', { timeout: 3000 });
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 400));

    // Page 1 data
    const page1Data = await page.evaluate(() => {
      const panel = document.getElementById('active-section-quests');
      const rect = panel.getBoundingClientRect();
      const nav = document.querySelector('nav[aria-label="Paginasi Halaman Section"]');
      const groundY = Math.round(0.47 * window.innerHeight * 100) / 100;
      const dialogTop = Math.round((groundY + 38.19) * 100) / 100;
      const reservedHeight = 120;
      const windowRemainingH = window.innerHeight - rect.top;
      const availableH = Math.max(100, Math.round(windowRemainingH - reservedHeight));

      const items = Array.from(panel.querySelectorAll('[data-page-item-id]')).map((el) => ({
        id: el.getAttribute('data-page-item-id'),
        height: Math.round(el.getBoundingClientRect().height),
      }));

      let totalPages = 1;
      if (nav) {
        const m = nav.textContent.match(/\/(\d+)/);
        if (m) totalPages = parseInt(m[1], 10);
      }

      return {
        windowW: window.innerWidth,
        windowH: window.innerHeight,
        groundY,
        dialogTop,
        panelTop: Math.round(rect.top),
        reservedHeight,
        availableH,
        totalPages,
        page1Items: items,
      };
    });

    // Go to Page 2
    let page2Items = [];
    const hasNext = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Halaman berikutnya"]');
      return btn && !btn.disabled;
    });

    if (hasNext) {
      await page.click('button[aria-label="Halaman berikutnya"]');
      await new Promise((r) => setTimeout(r, 300));
      page2Items = await page.evaluate(() => {
        const panel = document.getElementById('active-section-quests');
        return Array.from(panel.querySelectorAll('[data-page-item-id]')).map((el) => ({
          id: el.getAttribute('data-page-item-id'),
          height: Math.round(el.getBoundingClientRect().height),
        }));
      });
    }

    // Go to Page 3 if exists
    let page3Items = [];
    const hasNext2 = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Halaman berikutnya"]');
      return btn && !btn.disabled;
    });

    if (hasNext2) {
      await page.click('button[aria-label="Halaman berikutnya"]');
      await new Promise((r) => setTimeout(r, 300));
      page3Items = await page.evaluate(() => {
        const panel = document.getElementById('active-section-quests');
        return Array.from(panel.querySelectorAll('[data-page-item-id]')).map((el) => ({
          id: el.getAttribute('data-page-item-id'),
          height: Math.round(el.getBoundingClientRect().height),
        }));
      });
    }

    questComparison[target.name] = {
      ...page1Data,
      page2Items,
      page3Items,
    };
  }

  // 3. ADDITIONAL MOBILE & TABLETS (768x1024, 820x1180, 834x1194, 667x375, 844x390, 932x430)
  console.log('\n--- 3. Measuring Additional Mobile & Tablet Viewports ---');
  const additionalMobileViewports = [
    // Tablets Portrait
    { name: '768x1024 (iPad Portrait)', w: 768, h: 1024, type: 'Tablet Portrait' },
    { name: '820x1180 (iPad Air Portrait)', w: 820, h: 1180, type: 'Tablet Portrait' },
    { name: '834x1194 (iPad Pro 11 Portrait)', w: 834, h: 1194, type: 'Tablet Portrait' },
    // HP Landscape
    { name: '667x375 (iPhone SE Landscape)', w: 667, h: 375, type: 'HP Landscape' },
    { name: '844x390 (iPhone 12/13/14 Landscape)', w: 844, h: 390, type: 'HP Landscape' },
    { name: '932x430 (iPhone 14 Pro Max Landscape)', w: 932, h: 430, type: 'HP Landscape' },
    // Windows 150% Scale in regular window
    { name: '911x512 (Windows 150% Fullscreen)', w: 911, h: 512, type: 'Windows 150%' },
  ];

  const mobileResults = [];

  for (const m of additionalMobileViewports) {
    await page.setViewport({ width: m.w, height: m.h, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 400));

    const topMetrics = await page.evaluate(() => {
      const header = document.querySelector('header');
      const dock = document.querySelector('nav[aria-label="Peta Navigasi Mobile"]');
      const tagline = document.querySelector('[data-outdoor-tagline]');
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = window.innerHeight;

      return {
        headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
        dockH: dock ? Math.round(dock.getBoundingClientRect().height) : null,
        taglineTop: tagline ? Math.round(tagline.getBoundingClientRect().top) : null,
        scrollHeight,
        clientHeight,
        scrollable: scrollHeight > clientHeight,
      };
    });

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 300));

    const bottomMetrics = await page.evaluate(() => {
      const currentScrollY = Math.round(window.scrollY);
      const maxScroll = Math.round(document.documentElement.scrollHeight - window.innerHeight);
      const submitBtn = document.querySelector('#section-contact button[type="submit"]') ||
                        document.querySelector('button[type="submit"]');
      const btnRect = submitBtn ? submitBtn.getBoundingClientRect() : null;

      return {
        currentScrollY,
        maxScroll,
        reachedBottom: currentScrollY >= maxScroll - 5,
        btnFound: !!submitBtn,
        btnTop: btnRect ? Math.round(btnRect.top) : null,
        btnBottom: btnRect ? Math.round(btnRect.bottom) : null,
        windowH: window.innerHeight,
        insideViewport: btnRect ? btnRect.bottom <= window.innerHeight && btnRect.top >= 0 : false,
      };
    });

    // Real mouse click test
    let clickSuccess = false;
    try {
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        clickSuccess = true;
      }
    } catch (e) {
      clickSuccess = false;
    }

    mobileResults.push({
      ...m,
      topMetrics,
      bottomMetrics,
      clickSuccess,
    });
    console.log(`Measured: ${m.name} -> Scrollable: ${topMetrics.scrollable}, ReachedBottom: ${bottomMetrics.reachedBottom}, Click: ${clickSuccess}`);
  }

  await browser.close();

  // Save audit data to docs/paginasi/comprehensive-audit-results.json
  const auditOutput = {
    desktopResults,
    questComparison,
    mobileResults,
  };

  fs.writeFileSync('docs/paginasi/comprehensive-audit-results.json', JSON.stringify(auditOutput, null, 2));
  console.log('\nAudit complete! Output saved to docs/paginasi/comprehensive-audit-results.json');
}

runAudit().catch(console.error);
