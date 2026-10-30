import puppeteer from 'puppeteer-core';
import fs from 'fs';

const OUT_DIR = 'docs/master/short-screens';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });

  // -------------------------------------------------------------
  // 1. CAPTURE OPSI (A): Compact Mode at 1366x625
  // Desktop layout maintained, but mascot & badge scaled down to fit 85px stage clearance
  // -------------------------------------------------------------
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 625, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    // Apply Opsi (a) styling: scale down mascot sprite and tighten badge so it fits without colliding
    await page.evaluate(() => {
      const stage = document.querySelector('[data-landmark-stage="true"]');
      if (stage) {
        // Find badge
        const badge = stage.querySelector('div.font-pixel');
        if (badge) {
          badge.style.fontSize = '9px';
          badge.style.padding = '1px 6px';
          badge.style.marginBottom = '2px';
        }
        // Find sprite
        const sprite = stage.querySelector('.pointer-events-auto');
        if (sprite) {
          sprite.style.transform = 'scale(0.65)';
          sprite.style.transformOrigin = 'bottom center';
        }
      }
    });

    await new Promise((r) => setTimeout(r, 200));
    const pathA = `${OUT_DIR}/1366x625-option-a-compact.png`;
    await page.screenshot({ path: pathA });
    console.log(`Saved Opsi A screenshot: ${pathA}`);

    const metricsA = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const header = document.querySelector('header')?.getBoundingClientRect();
      const nav = document.querySelector('nav')?.getBoundingClientRect();
      const stage = document.querySelector('[data-landmark-stage="true"]');
      const badge = stage?.querySelector('div.font-pixel')?.getBoundingClientRect();
      const mascot = stage?.querySelector('.pointer-events-auto')?.getBoundingClientRect();
      const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
      const cta = document.querySelector('[role="region"] button')?.getBoundingClientRect();

      return {
        groundY: round(0.47 * 625),
        headerBottom: round(header?.bottom),
        navBottom: round(nav?.bottom),
        badgeTop: round(badge?.top),
        mascotTop: round(mascot?.top),
        dialogTop: round(dialog?.top),
        dialogBottom: round(dialog?.bottom),
        ctaBottom: round(cta?.bottom),
        remainingBelowCta: round(625 - (cta?.bottom || 0)),
      };
    });
    console.log('Metrics Opsi A:', JSON.stringify(metricsA, null, 2));
    await page.close();
  }

  // -------------------------------------------------------------
  // 2. CAPTURE OPSI (B): Mobile Vertical Layout at 1366x625 (Threshold H >= 700px)
  // Because H = 625 < 700px, it switches to mobile vertical layout with 56px sticky header
  // -------------------------------------------------------------
  {
    const page = await browser.newPage();
    // Simulate H < 700 switching to vertical layout by overriding matchMedia in page
    await page.evaluateOnNewDocument(() => {
      const origMatchMedia = window.matchMedia;
      window.matchMedia = function(query) {
        if (query.includes('max-width: 1023px')) {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          };
        }
        if (query.includes('min-width: 1024px')) {
          return {
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          };
        }
        return origMatchMedia.call(window, query);
      };
    });

    await page.setViewport({ width: 1366, height: 625, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const pathB = `${OUT_DIR}/1366x625-option-b-mobile-flow.png`;
    await page.screenshot({ path: pathB });
    console.log(`Saved Opsi B screenshot: ${pathB}`);

    const metricsB = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const header = document.querySelector('header')?.getBoundingClientRect();
      const heroSection = document.querySelector('#section-hero')?.getBoundingClientRect();
      const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
      const cta = document.querySelector('[role="region"] button')?.getBoundingClientRect();

      return {
        headerHeight: round(header?.height),
        headerBottom: round(header?.bottom),
        heroSectionTop: round(heroSection?.top),
        dialogTop: round(dialog?.top),
        dialogBottom: round(dialog?.bottom),
        ctaBottom: round(cta?.bottom),
        viewportHeight: window.innerHeight,
        documentScrollHeight: document.documentElement.scrollHeight,
      };
    });
    console.log('Metrics Opsi B:', JSON.stringify(metricsB, null, 2));
    await page.close();
  }

  await browser.close();
}

run().catch(console.error);
