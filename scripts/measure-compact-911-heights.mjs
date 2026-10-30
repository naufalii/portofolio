import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { computeWorldLayout, BASELINE_HEIGHT } from '../src/lib/worldLayout.js';

// Landmark canvas specs from landmarks.js
// ground is at 94 px canvas (0.47 * 200).
// Heights of landmarks on canvas:
const LANDMARK_SPECS = [
  { id: 'hero', name: 'Desa Awal', canvasH: 28 },
  { id: 'quests', name: 'Quest Log', canvasH: 30 },
  { id: 'skills', name: 'Skill Tree (P1)', canvasH: 35 },
  { id: 'guild', name: 'Guild Hall', canvasH: 32 },
  { id: 'contact', name: 'Kotak Pos', canvasH: 22 },
  { id: 'guestbook', name: 'Papan Pesan', canvasH: 24 },
];

const HEIGHTS = [400, 430, 450, 480];
const W = 911;

async function run() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // First measure actual DOM compact header height at W = 911
  // We can measure this by setting viewport 1024x500 (compact desktop) and checking header height
  await page.setViewport({ width: 1024, height: 500, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const compactHeaderInfo = await page.evaluate(() => {
    const h = document.querySelector('header');
    const badge = document.querySelector('[data-outdoor-badge]');
    return {
      headerHeight: h ? Math.round(h.getBoundingClientRect().height * 100) / 100 : 94,
      headerBottom: h ? Math.round(h.getBoundingClientRect().bottom * 100) / 100 : 94,
      badgeHeight: badge ? Math.round(badge.getBoundingClientRect().height * 100) / 100 : 24,
    };
  });

  console.log('Measured Compact Header Info:', compactHeaderInfo);
  const headerBottom = compactHeaderInfo.headerBottom; // ~94px

  const results = [];

  for (const H of HEIGHTS) {
    const S = H / 200;
    const groundY = Math.round(0.47 * H * 100) / 100;
    const clearance = Math.round((groundY - headerBottom) * 100) / 100;

    // Current standard mascot formula: 2.2 * (S / 3.6)
    const mascotScale = Math.round(2.2 * (S / 3.6) * 100) / 100;
    const mascotH = Math.round(48 * mascotScale * 100) / 100;
    const badgeH = 24; // badge height in DOM
    const badgeMargin = 4; // mb-1
    const totalMascotStack = Math.round((mascotH + badgeH + badgeMargin) * 100) / 100;

    const mascotTop = Math.round((groundY - mascotH) * 100) / 100;
    const badgeTop = Math.round((groundY - totalMascotStack) * 100) / 100;

    const mascotCollision = mascotTop < headerBottom;
    const badgeCollision = badgeTop < headerBottom;
    const badgeGapToHeader = Math.round((badgeTop - headerBottom) * 100) / 100;

    // Calculate highest landmark:
    // Landmark ground is at groundY.
    // For each landmark, top = groundY - (canvasH * S)
    const landmarkResults = LANDMARK_SPECS.map((lm) => {
      const renderH = Math.round(lm.canvasH * S * 100) / 100;
      const top = Math.round((groundY - renderH) * 100) / 100;
      const gapToHeader = Math.round((top - headerBottom) * 100) / 100;
      return {
        id: lm.id,
        name: lm.name,
        canvasH: lm.canvasH,
        renderH,
        top,
        gapToHeader,
        collides: top < headerBottom,
      };
    });

    // Tallest landmark has min top
    const highestLandmark = [...landmarkResults].sort((a, b) => a.top - b.top)[0];

    // Check if safe scale is needed:
    // If badgeTop - headerBottom < 10px (or collision < 0), what safe scale gives at least 10px buffer?
    // safeBadgeTop = headerBottom + buffer (10px)
    // groundY - (48 * safeScale + 28) = headerBottom + 10
    // 48 * safeScale = groundY - headerBottom - 38
    // safeScale = (clearance - 38) / 48
    let safeMascotScale = mascotScale;
    let safeMascotH = mascotH;
    let safeBadgeGap = badgeGapToHeader;

    if (badgeGapToHeader < 10) {
      const targetBuffer = 10;
      const maxAllowedStack = clearance - targetBuffer;
      const maxAllowedMascotH = maxAllowedStack - 28;
      safeMascotScale = Math.max(0.8, Math.round((maxAllowedMascotH / 48) * 100) / 100);
      safeMascotH = Math.round(48 * safeMascotScale * 100) / 100;
      safeBadgeGap = Math.round((clearance - (safeMascotH + 28)) * 100) / 100;
    }

    results.push({
      H,
      W,
      S,
      headerBottom,
      groundY,
      stageClearance: clearance,
      mascot: {
        scale: mascotScale,
        height: mascotH,
        top: mascotTop,
        collides: mascotCollision,
      },
      badge: {
        height: badgeH,
        top: badgeTop,
        collides: badgeCollision,
        gapToHeader: badgeGapToHeader,
      },
      highestLandmark: {
        name: highestLandmark.name,
        renderH: highestLandmark.renderH,
        top: highestLandmark.top,
        gapToHeader: highestLandmark.gapToHeader,
        collides: highestLandmark.collides,
      },
      allLandmarks: landmarkResults,
      safeMascotScale: {
        recommendedScale: safeMascotScale,
        recommendedMascotH: safeMascotH,
        resultingBadgeGap: safeBadgeGap,
        needsReduction: badgeGapToHeader < 10,
      },
    });
  }

  await browser.close();

  fs.writeFileSync('scripts/compact_heights_measurement.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
