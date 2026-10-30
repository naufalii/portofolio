import puppeteer from 'puppeteer-core';

const TEST_CASES = [
  // Short laptops (must be horizontal desktop compact)
  { name: '1366x625', w: 1366, h: 625, expectMode: 'compact' },
  { name: '1280x590', w: 1280, h: 590, expectMode: 'compact' },
  { name: '1093x500', w: 1093, h: 500, expectMode: 'compact' },
  { name: '1024x500', w: 1024, h: 500, expectMode: 'compact' },
  { name: '1024x480 (Batas Desktop Bawah)', w: 1024, h: 480, expectMode: 'compact' },
  // Boundaries (must be vertical)
  { name: '1024x479 (Batas Vertikal Bawah)', w: 1024, h: 479, expectMode: 'vertical' },
  { name: '1023x800 (Batas Lebar Vertikal)', w: 1023, h: 800, expectMode: 'vertical' },
  // Boundary 699 vs 700
  { name: '1280x699 (Batas Atas Compact)', w: 1280, h: 699, expectMode: 'compact' },
  { name: '1280x700 (Batas Bawah Standar)', w: 1280, h: 700, expectMode: 'standard' },
  // Standard desktop baseline
  { name: '1280x720 (Patokan)', w: 1280, h: 720, expectMode: 'standard' },
  { name: '1920x1080', w: 1920, h: 1080, expectMode: 'standard' },
  { name: '2560x1080', w: 2560, h: 1080, expectMode: 'standard' },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  console.log('--- VERIFYING FIX C (M1) ---');

  for (const tc of TEST_CASES) {
    await page.setViewport({ width: tc.w, height: tc.h, isMobile: tc.w < 1024 });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    const data = await page.evaluate(() => {
      const header = document.querySelector('header');
      const hr = header ? header.getBoundingClientRect() : null;
      const bottomDock = document.querySelector('nav.fixed.bottom-0, nav[class*="bottom-0"]');
      const dialog = document.querySelector('[role="region"]');
      const dr = dialog ? dialog.getBoundingClientRect() : null;
      const ctaBtn = document.querySelector('[role="region"] button');
      const ctaRect = ctaBtn ? ctaBtn.getBoundingClientRect() : null;
      const stage = document.querySelector('[data-landmark-stage]');
      const stageRect = stage ? stage.getBoundingClientRect() : null;

      // Tree landmark
      const treeBtn = document.querySelector('[data-landmark-btn="skills"]');
      const treeRect = treeBtn ? treeBtn.getBoundingClientRect() : null;

      // Mascot feet
      const mascotSprite = document.querySelector('[data-landmark-stage] svg');
      const mascotRect = mascotSprite ? mascotSprite.getBoundingClientRect() : null;

      const H = window.innerHeight;
      const groundY = Math.round(0.47 * H * 100) / 100;

      return {
        headerHeight: hr ? Math.round(hr.height * 100) / 100 : 0,
        headerBottom: hr ? Math.round(hr.bottom * 100) / 100 : 0,
        hasBottomDock: !!bottomDock,
        dialogTop: dr ? Math.round(dr.top * 100) / 100 : null,
        dialogBottom: dr ? Math.round(dr.bottom * 100) / 100 : null,
        ctaBottom: ctaRect ? Math.round(ctaRect.bottom * 100) / 100 : null,
        ctaVisibleInViewport: ctaRect ? ctaRect.bottom <= H : null,
        stageBottom: stageRect ? Math.round(stageRect.bottom * 100) / 100 : null,
        mascotBottom: mascotRect ? Math.round(mascotRect.bottom * 100) / 100 : null,
        mascotDiffGround: mascotRect ? Math.round(Math.abs(mascotRect.bottom - groundY) * 100) / 100 : null,
        treeTop: treeRect ? Math.round(treeRect.top * 100) / 100 : null,
        treeClearanceVsHeader: (treeRect && hr) ? Math.round((treeRect.top - hr.bottom) * 100) / 100 : null,
        groundY,
      };
    });

    const isHorizontal = !data.hasBottomDock && data.headerHeight !== 60;
    const actualMode = !isHorizontal ? 'vertical' : (data.headerHeight <= 96 ? 'compact' : 'standard');
    const modePass = actualMode === tc.expectMode;

    console.log(`[${tc.name}] Expect: ${tc.expectMode} | Actual: ${actualMode} (${modePass ? 'PASS' : 'FAIL'})`);
    console.log(`  HeaderH: ${data.headerHeight}px (HeaderBottom: ${data.headerBottom}px)`);
    if (isHorizontal) {
      console.log(`  groundY: ${data.groundY}px | mascotBottom: ${data.mascotBottom}px (diff: ${data.mascotDiffGround}px)`);
      console.log(`  dialogTop: ${data.dialogTop}px | ctaBottom: ${data.ctaBottom}px (visible without scroll: ${data.ctaVisibleInViewport})`);
      console.log(`  treeTop: ${data.treeTop}px | tree clearance vs header: ${data.treeClearanceVsHeader}px`);
    }

    // Save screenshot
    const ssName = `docs/fixlaptop/after/m1_${tc.w}x${tc.h}_${actualMode}.png`;
    await page.screenshot({ path: ssName });
  }

  await browser.close();
}

run().catch(console.error);
