import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const MATRIX_STANDARD = [
  { name: '1024x768', w: 1024, h: 768, tier: 'standard' },
  { name: '1280x720', w: 1280, h: 720, tier: 'standard' },
  { name: '1366x768', w: 1366, h: 768, tier: 'standard' },
  { name: '1536x864', w: 1536, h: 864, tier: 'standard' },
  { name: '1600x900', w: 1600, h: 900, tier: 'standard' },
  { name: '1920x947', w: 1920, h: 947, tier: 'standard' },
  { name: '1920x1080', w: 1920, h: 1080, tier: 'standard' },
  { name: '2560x1080', w: 2560, h: 1080, tier: 'standard' },
  { name: '3440x1440', w: 3440, h: 1440, tier: 'standard' },
  { name: '1909x991', w: 1909, h: 991, tier: 'standard' },
];

const MATRIX_COMPACT = [
  { name: '1024x500', w: 1024, h: 500, tier: 'compact' },
  { name: '1024x600', w: 1024, h: 600, tier: 'compact' },
  { name: '1093x500', w: 1093, h: 500, tier: 'compact' },
  { name: '1093x520', w: 1093, h: 520, tier: 'compact' },
  { name: '1280x590', w: 1280, h: 590, tier: 'compact' },
  { name: '1280x600', w: 1280, h: 600, tier: 'compact' },
  { name: '1366x625', w: 1366, h: 625, tier: 'compact' },
  { name: '1536x720', w: 1536, h: 720, tier: 'standard' },
  { name: '1536x680', w: 1536, h: 680, tier: 'compact' },
];

const MATRIX_BOUNDARIES = [
  { name: '1023x800', w: 1023, h: 800, tier: 'unsupported' },
  { name: '1024x480', w: 1024, h: 480, tier: 'compact' },
  { name: '1024x479', w: 1024, h: 479, tier: 'unsupported' },
  { name: '1280x699', w: 1280, h: 699, tier: 'compact' },
  { name: '1280x700', w: 1280, h: 700, tier: 'standard' },
];

const MATRIX_MOBILE = [
  { name: '360x800', w: 360, h: 800, tier: 'unsupported' },
  { name: '390x844', w: 390, h: 844, tier: 'unsupported' },
  { name: '412x915', w: 412, h: 915, tier: 'unsupported' },
  { name: '667x375', w: 667, h: 375, tier: 'unsupported' },
  { name: '844x390', w: 844, h: 390, tier: 'unsupported' },
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

  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const matrixResults = [];

  const ALL_VIEWPORTS = [
    ...MATRIX_STANDARD,
    ...MATRIX_COMPACT,
    ...MATRIX_BOUNDARIES,
    ...MATRIX_MOBILE,
  ];

  console.log(`Starting matrix verification on ${ALL_VIEWPORTS.length} viewports...`);

  for (const vp of ALL_VIEWPORTS) {
    const isMobileVp = vp.w < 1024 || vp.h < 480;
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: isMobileVp });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    const ssPath = `docs/fixlaptop/after/screen_${vp.name}.png`;
    await page.screenshot({ path: ssPath });

    const metrics = await page.evaluate(() => {
      const H = window.innerHeight;
      const W = window.innerWidth;
      const round = n => n !== null && n !== undefined ? Math.round(n * 100) / 100 : null;

      const header = document.querySelector('header');
      const hr = header ? header.getBoundingClientRect() : null;
      const bottomDock = document.querySelector('nav.fixed.bottom-0, nav[class*="bottom-0"]');

      const isMobileLayout = !!bottomDock;
      const isDesktopLayout = !isMobileLayout;

      const dialog = document.querySelector('[role="region"]');
      const dr = dialog ? dialog.getBoundingClientRect() : null;

      const ctaBtn = document.querySelector('[role="region"] button');
      const ctaRect = ctaBtn ? ctaBtn.getBoundingClientRect() : null;

      const stage = document.querySelector('[data-landmark-stage]');
      const stageRect = stage ? stage.getBoundingClientRect() : null;

      const mascotSprite = document.querySelector('[data-landmark-stage] svg');
      const mascotRect = mascotSprite ? mascotSprite.getBoundingClientRect() : null;

      const expectedGroundY = round(0.47 * H);

      // Check all 6 landmarks
      const landmarkBtns = Array.from(document.querySelectorAll('[data-landmark-btn]'));
      const landmarkChecks = landmarkBtns.map(btn => {
        const id = btn.getAttribute('data-landmark-btn');
        const rect = btn.getBoundingClientRect();
        const cx = Math.round(rect.left + rect.width / 2);
        const cy = Math.round(rect.top + rect.height / 2);
        const topEl = document.elementsFromPoint(cx, cy)[0];
        const tabEl = document.querySelector(`[data-location-id="${id}"]`);
        const tr = tabEl ? tabEl.getBoundingClientRect() : null;
        const tabCenterX = tr ? round(tr.left + tr.width / 2) : null;
        const landmarkCenterX = round(rect.left + rect.width / 2);
        const alignmentDiff = tabCenterX !== null ? round(Math.abs(landmarkCenterX - tabCenterX)) : null;

        return {
          id,
          isMatch: topEl === btn,
          topElTag: topEl ? topEl.tagName.toLowerCase() : null,
          rect: { top: round(rect.top), bottom: round(rect.bottom), width: round(rect.width), height: round(rect.height) },
          alignmentDiff,
        };
      });

      // Tree clearance vs header
      const treeBtn = document.querySelector('[data-landmark-btn="skills"]');
      const treeRect = treeBtn ? treeBtn.getBoundingClientRect() : null;
      const treeClearance = (treeRect && hr) ? round(treeRect.top - hr.bottom) : null;

      // Has horizontal scroll
      const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;

      return {
        W,
        H,
        isDesktopLayout,
        headerH: hr ? round(hr.height) : 0,
        headerBottom: hr ? round(hr.bottom) : 0,
        hasBottomDock: !!bottomDock,
        expectedGroundY,
        stageBottom: stageRect ? round(stageRect.bottom) : null,
        mascotBottom: mascotRect ? round(mascotRect.bottom) : null,
        mascotDiffGround: mascotRect ? round(Math.abs(mascotRect.bottom - expectedGroundY)) : null,
        dialogTop: dr ? round(dr.top) : null,
        ctaBottom: ctaRect ? round(ctaRect.bottom) : null,
        ctaTop: ctaRect ? round(ctaRect.top) : null,
        treeTop: treeRect ? round(treeRect.top) : null,
        treeClearance,
        landmarkChecks,
        hasHorizontalScroll,
      };
    });

    const isHorizontal = metrics.isDesktopLayout;
    let actualTier = 'unsupported';
    if (isHorizontal) {
      actualTier = metrics.headerH <= 96 ? 'compact' : 'standard';
    }

    const tierPass = actualTier === vp.tier;
    const allLandmarksClickable = !isHorizontal || metrics.landmarkChecks.every(l => l.isMatch);
    const mascotOnGround = !isHorizontal || metrics.mascotDiffGround <= 2;
    const treeNoOverlap = !isHorizontal || metrics.treeClearance >= 0;
    const noHScroll = !metrics.hasHorizontalScroll;
    const ctaVisibleIfH520 = !isHorizontal || (vp.h < 520 || metrics.ctaBottom <= vp.h);

    const passedAll = tierPass && allLandmarksClickable && mascotOnGround && noHScroll && ctaVisibleIfH520;

    matrixResults.push({
      viewport: vp.name,
      width: vp.w,
      height: vp.h,
      expectedTier: vp.tier,
      actualTier,
      headerH: metrics.headerH,
      groundY: metrics.expectedGroundY,
      mascotBottom: metrics.mascotBottom,
      mascotDiffGround: metrics.mascotDiffGround,
      dialogTop: metrics.dialogTop,
      ctaTop: metrics.ctaTop,
      ctaBottom: metrics.ctaBottom,
      treeTop: metrics.treeTop,
      treeClearance: metrics.treeClearance,
      allLandmarksClickable,
      noHScroll,
      passedAll,
      screenshot: ssPath,
    });

    console.log(`[${vp.name}] Tier: ${actualTier} (expect: ${vp.tier}) | HeaderH: ${metrics.headerH}px | GroundDiff: ${metrics.mascotDiffGround}px | AllClickable: ${allLandmarksClickable} | Pass: ${passedAll}`);
  }

  // Check 3 phases on core sizes
  console.log('\n--- CHECKING CONTRAST RATIOS ON CORE VIEWPORTS ACROSS PHASES ---');
  const coreViewports = [
    { name: '1280x720', w: 1280, h: 720 },
    { name: '1366x625', w: 1366, h: 625 },
    { name: '1093x500', w: 1093, h: 500 },
    { name: '1920x1080', w: 1920, h: 1080 },
    { name: '390x844', w: 390, h: 844 },
  ];

  const phaseResults = [];

  for (const vp of coreViewports) {
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: vp.w < 1024 });

    for (const phase of ['day', 'dusk', 'night']) {
      await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 200));

      await page.evaluate((p) => {
        document.documentElement.setAttribute('data-theme', p);
      }, phase);
      await new Promise(r => setTimeout(r, 200));

      const ssPath = `docs/fixlaptop/after/core_${vp.name}_${phase}.png`;
      await page.screenshot({ path: ssPath });

      const crData = await page.evaluate(() => {
        const getStyle = el => {
          if (!el) return null;
          const cs = window.getComputedStyle(el);
          return { text: el.innerText.trim().slice(0, 30), color: cs.color, bg: cs.backgroundColor };
        };
        return {
          tagline: getStyle(document.querySelector('[data-outdoor-tagline]')),
          label: getStyle(document.querySelector('[data-outdoor-label]')),
          badge: getStyle(document.querySelector('[data-outdoor-badge]')),
        };
      });

      const res = { viewport: vp.name, phase, screenshot: ssPath, checks: {} };
      for (const [k, v] of Object.entries(crData)) {
        if (!v) continue;
        const fg = parseRgb(v.color);
        const bg = parseRgb(v.bg);
        const cr = Math.round(getContrast(fg, bg) * 100) / 100;
        res.checks[k] = { color: v.color, bg: v.bg, contrast: cr, pass: cr >= 14 };
      }
      phaseResults.push(res);
      console.log(`[${vp.name} - ${phase}] Checked: ${Object.keys(res.checks).map(k => `${k}=${res.checks[k].contrast}:1`).join(', ')}`);
    }
  }

  // Check 9: Resize without reload
  console.log('\n--- CHECKING RESIZE WITHOUT RELOAD ---');
  const resizeSequence = [
    { w: 1920, h: 1080 },
    { w: 1366, h: 625 },
    { w: 1093, h: 500 },
    { w: 1023, h: 800 },
    { w: 1280, h: 720 },
    { w: 2560, h: 1080 }
  ];

  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const resizeResults = [];
  for (const step of resizeSequence) {
    await page.setViewport({ width: step.w, height: step.h, isMobile: step.w < 1024 });
    await new Promise(r => setTimeout(r, 400));

    const check = await page.evaluate(() => {
      const isMob = !!document.querySelector('nav.fixed.bottom-0');
      const hr = document.querySelector('header')?.getBoundingClientRect();
      return {
        isMob,
        headerH: hr ? Math.round(hr.height) : 0,
        dialogTop: document.querySelector('[role="region"]')?.getBoundingClientRect()?.top || null
      };
    });

    const isDeskExpected = step.w >= 1024 && step.h >= 480;
    const match = isDeskExpected ? !check.isMob : check.isMob;
    resizeResults.push({ step: `${step.w}x${step.h}`, match, ...check });
    console.log(`Resize to ${step.w}x${step.h}: match=${match}, headerH=${check.headerH}px, isMob=${check.isMob}`);
  }

  // Check 10: Browser Zoom simulation
  console.log('\n--- CHECKING BROWSER ZOOM SIMULATION ---');
  const zoomCases = [
    { base: '1920x1080', baseW: 1920, baseH: 1080, zooms: [67, 80, 90, 110, 125, 150] },
    { base: '1366x768', baseW: 1366, baseH: 768, zooms: [67, 80, 90, 110, 125, 150] }
  ];

  const zoomResults = [];
  for (const zc of zoomCases) {
    for (const z of zc.zooms) {
      const cssW = Math.round(zc.baseW / (z / 100));
      const cssH = Math.round(zc.baseH / (z / 100));
      await page.setViewport({ width: cssW, height: cssH, isMobile: cssW < 1024 });
      await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 300));

      const zData = await page.evaluate(() => {
        const isMob = !!document.querySelector('nav.fixed.bottom-0');
        const hr = document.querySelector('header')?.getBoundingClientRect();
        return {
          isMob,
          headerH: hr ? Math.round(hr.height) : 0,
        };
      });

      const expectDesk = cssW >= 1024 && cssH >= 480;
      const actualDesk = !zData.isMob;
      const pass = expectDesk === actualDesk;
      zoomResults.push({
        base: zc.base,
        zoom: `${z}%`,
        cssViewport: `${cssW}x${cssH}`,
        expectDesk,
        actualDesk,
        headerH: zData.headerH,
        pass,
      });
      console.log(`Zoom ${zc.base} @ ${z}% -> CSS ${cssW}x${cssH}: desk=${actualDesk} (expect=${expectDesk}) -> ${pass ? 'PASS' : 'FAIL'}`);
    }
  }

  // Save complete test summary
  const summary = {
    matrixResults,
    phaseResults,
    resizeResults,
    zoomResults,
    consoleErrors,
  };

  fs.writeFileSync('docs/fixlaptop/after/verification_summary.json', JSON.stringify(summary, null, 2));
  console.log('\nVerification summary saved to docs/fixlaptop/after/verification_summary.json');

  await browser.close();
}

run().catch(console.error);
