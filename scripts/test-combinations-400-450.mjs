import puppeteer from 'puppeteer-core';
import fs from 'fs';

const WIDTHS = [1280, 1366, 1920];
const HEIGHTS = [400, 450];

// Landmark canvas specs:
// canvas ground is at 94px.
// Height on canvas:
// hero_village: 28px
// quests_house: 30px
// skills_tree (P1): 35px
// guild_hall: 32px
// contact_post: 22px
// guestbook_board: 24px

const LANDMARKS = [
  { id: 'skills', name: 'Skill Tree (P1, Tertinggi)', canvasH: 35 },
  { id: 'guild', name: 'Guild Hall', canvasH: 32 },
  { id: 'quests', name: 'Quest Log', canvasH: 30 },
  { id: 'hero', name: 'Desa Awal', canvasH: 28 },
  { id: 'guestbook', name: 'Papan Pesan', canvasH: 24 },
  { id: 'contact', name: 'Kotak Pos', canvasH: 22 },
];

async function testCombinations() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const results = [];

  for (const W of WIDTHS) {
    for (const H of HEIGHTS) {
      // Set viewport
      await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
      // In current code, W>=1024 and H<480 enters mobile vertical because DESKTOP_MIN_H=480.
      // But we can measure the exact compact header height by evaluating the DOM styling
      // or evaluating what headerBottom would be if compact header renders:
      // In compact desktop mode (tested at 1280x590 and 1366x625):
      // Row 1 is ~36px, Row 2 is ~38px, pt/pb/gap is 12px -> total header is 86px to 94px.

      const S = H / 200;
      const groundY = Math.round(0.47 * H * 100) / 100;

      // Let's measure the actual compact header DOM by testing a compact height (e.g. 500px) at this width:
      await page.setViewport({ width: W, height: 500, deviceScaleFactor: 1 });
      await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 400));

      const measuredHeader = await page.evaluate(() => {
        const h = document.querySelector('header');
        return h ? Math.round(h.getBoundingClientRect().height * 100) / 100 : 94;
      });

      const headerBottom = measuredHeader; // in compact desktop, header starts at top 0, so bottom == height
      const stageClearance = Math.round((groundY - headerBottom) * 100) / 100;

      // 1. Standard Mascot Scale (2.2 * (H / 720))
      const standardScale = Math.round(2.2 * (H / 720) * 100) / 100;
      const standardMascotH = Math.round(48 * standardScale * 100) / 100;
      const badgeH = 24;
      const badgeMargin = 4;
      const standardStack = standardMascotH + badgeH + badgeMargin;
      const standardBadgeTop = Math.round((groundY - standardStack) * 100) / 100;
      const standardBadgeGap = Math.round((standardBadgeTop - headerBottom) * 100) / 100;
      const standardCollides = standardBadgeTop < headerBottom;

      // 2. Reduced Mascot Scale for H < 480:
      // At H = 400: standard scale is 1.22 (mascotH 58.56, gap 7.44px if header 94, or 15.44px if header 86).
      // If we enforce a minimum clearance of 10px from headerBottom:
      // maxStack = clearance - 10
      // maxMascotH = maxStack - 28
      // safeScale = Math.min(standardScale, Math.floor((maxMascotH / 48) * 100) / 100)
      const targetGap = 10;
      const maxAllowedMascotH = stageClearance - targetGap - 28;
      const reducedScale = Math.min(standardScale, Math.max(0.8, Math.round((maxAllowedMascotH / 48) * 100) / 100));
      const reducedMascotH = Math.round(48 * reducedScale * 100) / 100;
      const reducedStack = reducedMascotH + badgeH + badgeMargin;
      const reducedBadgeTop = Math.round((groundY - reducedStack) * 100) / 100;
      const reducedBadgeGap = Math.round((reducedBadgeTop - headerBottom) * 100) / 100;
      const reducedCollides = reducedBadgeTop < headerBottom;

      // 3. Landmark Heights & Clearance:
      const treeCanvasH = 35;
      const treeRenderH = Math.round(treeCanvasH * S * 100) / 100;
      const treeTop = Math.round((groundY - treeRenderH) * 100) / 100;
      const treeGap = Math.round((treeTop - headerBottom) * 100) / 100;
      const treeCollides = treeTop < headerBottom;

      results.push({
        width: W,
        height: H,
        S,
        groundY,
        headerBottom,
        stageClearance,
        landmarkSkillTree: {
          renderHeight: treeRenderH,
          top: treeTop,
          gapToHeader: treeGap,
          collides: treeCollides,
        },
        standardMascot: {
          scale: standardScale,
          mascotHeight: standardMascotH,
          badgeTop: standardBadgeTop,
          gapToHeader: standardBadgeGap,
          collides: standardCollides,
        },
        reducedMascot: {
          scale: reducedScale,
          mascotHeight: reducedMascotH,
          badgeTop: reducedBadgeTop,
          gapToHeader: reducedBadgeGap,
          collides: reducedCollides,
          reductionApplied: reducedScale < standardScale,
        },
      });
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  fs.writeFileSync('scripts/combinations_400_450_results.json', JSON.stringify(results, null, 2));
}

testCombinations().catch(console.error);
