import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { computeWorldLayout } from '../src/lib/worldLayout.js';

async function measureScenarios() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // -------------------------------------------------------------
  // SKENARIO (i): DESKTOP_MIN_H = 480 (Currently active)
  // -------------------------------------------------------------
  const scen1Results = {};

  for (const H of [400, 450]) {
    await page.setViewport({ width: 911, height: H, deviceScaleFactor: 1 });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const data = await page.evaluate(() => {
      const isMobileNav = !!document.querySelector('nav[aria-label="Peta Navigasi Mobile"]');
      const header = document.querySelector('header')?.getBoundingClientRect();
      const dock = document.querySelector('nav[aria-label="Peta Navigasi Mobile"]')?.getBoundingClientRect();
      const badge = document.querySelector('[data-outdoor-badge]')?.getBoundingClientRect();
      const tagline = document.querySelector('[data-outdoor-tagline]')?.getBoundingClientRect();

      return {
        mode: isMobileNav ? 'Mobile/Tablet Vertikal' : 'Desktop Overworld',
        isMobileNav,
        header: header ? { height: header.height, bottom: header.bottom } : null,
        dock: dock ? { height: dock.height, top: dock.top } : null,
        badge: badge ? { top: badge.top + window.scrollY, height: badge.height } : null,
        tagline: tagline ? { top: tagline.top + window.scrollY, height: tagline.height } : null,
        scrollHeight: document.documentElement.scrollHeight,
      };
    });

    scen1Results[`911x${H}`] = data;
  }

  // -------------------------------------------------------------
  // SKENARIO (ii): DESKTOP_MIN_H = 400 (Compact Desktop mode)
  // -------------------------------------------------------------
  // We can calculate mathematical & visual parameters:
  const scen2Results = {};

  const headerBottom = 94.00; // terukur riil compact header

  for (const H of [400, 450]) {
    const S = H / 200;
    const groundY = Math.round(0.47 * H * 100) / 100;
    const stageClearance = Math.round((groundY - headerBottom) * 100) / 100;

    // Standard proportional mascot scale
    const standardScale = Math.round(2.2 * (H / 720) * 100) / 100;
    const standardMascotH = Math.round(48 * standardScale * 100) / 100;
    const badgeH = 24;
    const badgeMargin = 4;
    const totalStackStandard = standardMascotH + badgeH + badgeMargin;
    const badgeTopStandard = Math.round((groundY - totalStackStandard) * 100) / 100;
    const badgeGapStandard = Math.round((badgeTopStandard - headerBottom) * 100) / 100;

    // Reduced mascot scale (safe scale) for H=400:
    // If we want ~10px gap:
    const reducedScale = H === 400 ? 1.17 : standardScale;
    const reducedMascotH = Math.round(48 * reducedScale * 100) / 100;
    const totalStackReduced = reducedMascotH + badgeH + badgeMargin;
    const badgeTopReduced = Math.round((groundY - totalStackReduced) * 100) / 100;
    const badgeGapReduced = Math.round((badgeTopReduced - headerBottom) * 100) / 100;

    // Highest landmark: Skill Tree P1 (35px canvas)
    const treeCanvasH = 35;
    const treeRenderH = Math.round(treeCanvasH * S * 100) / 100;
    const treeTop = Math.round((groundY - treeRenderH) * 100) / 100;
    const treeGap = Math.round((treeTop - headerBottom) * 100) / 100;

    // Internal scroll panel max-height
    const gap = Math.max(12, Math.round(38.19 * (H / 720) * 100) / 100);
    const dialogTop = Math.round((groundY + gap) * 100) / 100;
    const internalScrollMaxH = Math.round((H - dialogTop - 8) * 100) / 100;

    scen2Results[`911x${H}`] = {
      mode: 'Desktop Padat (Tier 2 Compact)',
      S,
      headerBottom,
      groundY,
      stageClearance,
      highestLandmark: {
        name: 'Skill Tree (P1)',
        canvasH: treeCanvasH,
        renderH: treeRenderH,
        top: treeTop,
        clearanceToHeader: treeGap,
        collides: treeTop < headerBottom,
      },
      standardMascot: {
        scale: standardScale,
        mascotH: standardMascotH,
        badgeTop: badgeTopStandard,
        badgeGapToHeader: badgeGapStandard,
        collides: badgeTopStandard < headerBottom,
      },
      reducedMascot: {
        scale: reducedScale,
        mascotH: reducedMascotH,
        badgeTop: badgeTopReduced,
        badgeGapToHeader: badgeGapReduced,
        collides: badgeTopReduced < headerBottom,
      },
      internalScrollPanel: {
        dialogTop,
        maxHeight: internalScrollMaxH,
      },
    };
  }

  await browser.close();

  const finalOutput = {
    scen1_minH_480: scen1Results,
    scen2_minH_400: scen2Results,
  };

  console.log(JSON.stringify(finalOutput, null, 2));
}

measureScenarios().catch(console.error);
