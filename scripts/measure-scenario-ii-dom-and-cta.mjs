import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { w: 1280, h: 400 },
  { w: 1280, h: 450 },
  { w: 1366, h: 400 },
  { w: 1366, h: 450 },
  { w: 1920, h: 400 },
  { w: 1920, h: 450 },
];

const ARTIFACT_DIR = 'C:/Users/user/.gemini/antigravity/brain/46fda6f8-5305-475d-89de-6e92cd20d8f1';
const OUT_DIR = 'docs/fixlaptop/after/scenario_ii';
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function runScenarioIIMeasurement() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const allResults = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // 1. Measure all actual DOM rects before interaction
    const domMetrics = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);

      const header = document.querySelector('header');
      const hr = header ? header.getBoundingClientRect() : null;

      const stage = document.querySelector('[data-landmark-stage="true"]');
      const sr = stage ? stage.getBoundingClientRect() : null;

      const badge = document.querySelector('[data-outdoor-badge="true"], [data-outdoor-badge]');
      const br = badge ? badge.getBoundingClientRect() : null;

      const mascot = document.querySelector('[data-landmark-stage="true"] [data-sprite]');
      const mr = mascot ? mascot.getBoundingClientRect() : null;

      const skillBtn = document.querySelector('[data-landmark-btn="skills"]');
      const tr = skillBtn ? skillBtn.getBoundingClientRect() : null;

      const sectionHero = document.querySelector('#active-section-hero');
      const secR = sectionHero ? sectionHero.getBoundingClientRect() : null;
      const clientH = sectionHero ? sectionHero.clientHeight : null;
      const scrollH = sectionHero ? sectionHero.scrollHeight : null;

      // Locate Buttons
      const ctaExploreBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Mulai Jelajah')
      );
      const ctaExpR = ctaExploreBtn ? ctaExploreBtn.getBoundingClientRect() : null;

      const ctaCvBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Mode CV')
      );
      const ctaCvR = ctaCvBtn ? ctaCvBtn.getBoundingClientRect() : null;

      const lanjutBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('LANJUT')
      );
      const lanjutR = lanjutBtn ? lanjutBtn.getBoundingClientRect() : null;

      // Visibility calculation inside scroll container
      // If a button bottom > secR.bottom, it is below the fold inside scroll container
      const isExpInView = secR && ctaExpR ? ctaExpR.bottom <= secR.bottom : false;
      const isCvInView = secR && ctaCvR ? ctaCvR.bottom <= secR.bottom : false;
      const isLanjutInView = secR && lanjutR ? lanjutR.bottom <= secR.bottom : false;

      return {
        viewport: { w: window.innerWidth, h: window.innerHeight },
        header: hr ? { top: round(hr.top), bottom: round(hr.bottom), height: round(hr.height) } : null,
        stage: sr ? { top: round(sr.top), bottom: round(sr.bottom), height: round(sr.height) } : null,
        badge: br ? { top: round(br.top), bottom: round(br.bottom), height: round(br.height) } : null,
        mascot: mr ? { top: round(mr.top), bottom: round(mr.bottom), height: round(mr.height) } : null,
        skillTree: tr ? { top: round(tr.top), bottom: round(tr.bottom), height: round(tr.height) } : null,
        badgeGapToHeader: (br && hr) ? round(br.top - hr.bottom) : null,
        sectionHero: secR
          ? {
              top: round(secR.top),
              bottom: round(secR.bottom),
              height: round(secR.height),
              clientHeight: clientH,
              scrollHeight: scrollH,
              isScrollable: scrollH > clientH,
              hiddenOverflowH: Math.max(0, scrollH - clientH),
            }
          : null,
        ctaExplore: ctaExpR
          ? {
              top: round(ctaExpR.top),
              bottom: round(ctaExpR.bottom),
              height: round(ctaExpR.height),
              isInViewport: isExpInView,
              pixelsBelowFold: isExpInView ? 0 : round(ctaExpR.bottom - secR.bottom),
            }
          : null,
        ctaCv: ctaCvR
          ? {
              top: round(ctaCvR.top),
              bottom: round(ctaCvR.bottom),
              height: round(ctaCvR.height),
              isInViewport: isCvInView,
              pixelsBelowFold: isCvInView ? 0 : round(ctaCvR.bottom - secR.bottom),
            }
          : null,
        lanjutBtn: lanjutR
          ? {
              top: round(lanjutR.top),
              bottom: round(lanjutR.bottom),
              height: round(lanjutR.height),
              isInViewport: isLanjutInView,
              pixelsBelowFold: isLanjutInView ? 0 : round(lanjutR.bottom - secR.bottom),
            }
          : null,
      };
    });

    // 2. Test actual CTA clickability:
    // Test clicking LANJUT button (if visible) or Mulai Jelajah
    let clickTestResult = null;
    try {
      // Find LANJUT button
      const lanjutBtnHandle = await page.evaluateHandle(() =>
        Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('LANJUT'))
      );
      if (lanjutBtnHandle && lanjutBtnHandle.asElement()) {
        const textBefore = await page.evaluate(() => document.querySelector('[role="region"]')?.textContent);
        await lanjutBtnHandle.asElement().click();
        await new Promise((r) => setTimeout(r, 200));
        const textAfter = await page.evaluate(() => document.querySelector('[role="region"]')?.textContent);
        clickTestResult = {
          button: 'LANJUT',
          clicked: true,
          actionSucceeded: textBefore !== textAfter,
        };
      }
    } catch (e) {
      clickTestResult = { button: 'LANJUT', clicked: false, error: e.message };
    }

    // 3. Take real screenshot
    const screenshotName = `scenario_ii_${vp.w}x${vp.h}.png`;
    const screenshotPath = path.join(OUT_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // Copy to brain artifact directory for artifact embedding
    const artifactPath = path.join(ARTIFACT_DIR, screenshotName);
    fs.copyFileSync(screenshotPath, artifactPath);

    allResults.push({
      viewport: `${vp.w}x${vp.h}`,
      screenshotPath,
      artifactPath,
      domMetrics,
      clickTestResult,
    });

    await page.close();
  }

  await browser.close();

  fs.writeFileSync('scripts/scenario_ii_real_measurements.json', JSON.stringify(allResults, null, 2));
  console.log('Successfully completed Scenario (ii) DOM measurement and screenshots.');
  console.log(JSON.stringify(allResults, null, 2));
}

runScenarioIIMeasurement().catch(console.error);
