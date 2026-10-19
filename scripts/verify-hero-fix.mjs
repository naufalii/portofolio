import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('docs/seru2/hero-fix');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function verify() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
  });

  const report = {};

  const viewports = [
    { w: 1280, h: 720, name: '1280x720' },
    { w: 1024, h: 768, name: '1024x768' },
  ];

  const phases = ['day', 'night'];

  for (const vp of viewports) {
    report[vp.name] = {};
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h });

    for (const phase of phases) {
      await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 600));

      // Switch time phase
      await page.evaluate((targetPhase) => {
        const buttons = Array.from(document.querySelectorAll('header button, [aria-label*="Waktu"], [title*="Waktu"]'));
        const phaseIndicator = buttons.find((b) =>
          b.textContent?.toLowerCase().includes('siang') ||
          b.textContent?.toLowerCase().includes('malam') ||
          b.textContent?.toLowerCase().includes('senja') ||
          b.textContent?.toLowerCase().includes('fajar')
        );
        if (phaseIndicator) {
          phaseIndicator.click();
        }
      }, phase);

      await new Promise((r) => setTimeout(r, 300));

      // Select target phase inside dropdown if open
      await page.evaluate((targetPhase) => {
        const phaseButtons = Array.from(document.querySelectorAll('button'));
        const match = phaseButtons.find((b) =>
          targetPhase === 'day'
            ? b.textContent?.includes('Siang')
            : b.textContent?.includes('Malam')
        );
        if (match) match.click();
      }, phase);

      await new Promise((r) => setTimeout(r, 600));

      // Capture overview screenshot
      const shotPath = path.join(OUT_DIR, `hero-${vp.name}-${phase}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);

      // Measure positions
      const measurements = await page.evaluate(() => {
        const dialogBox = document.querySelector('[role="region"][aria-label*="Dialog"]');
        const ctaBtn = document.querySelector('button[aria-label*="Mulai jelajahi"]');
        const stage = document.querySelector('[data-landmark-stage]');
        const mascot = stage ? stage.querySelector('.will-change-transform') : null;
        const mascotBadge = stage ? stage.querySelector('.font-pixel') : null;
        const mascotSprite = stage ? stage.querySelector('svg') : null;

        const getBox = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            left: Math.round(r.left * 100) / 100,
            top: Math.round(r.top * 100) / 100,
            bottom: Math.round(r.bottom * 100) / 100,
            width: Math.round(r.width * 100) / 100,
            height: Math.round(r.height * 100) / 100,
          };
        };

        const landmarks = {};
        document.querySelectorAll('[data-landmark-btn]').forEach((btn) => {
          const id = btn.getAttribute('data-landmark-btn');
          landmarks[id] = getBox(btn);
        });

        return {
          dialog: getBox(dialogBox),
          cta: getBox(ctaBtn),
          stage: getBox(stage),
          mascot: getBox(mascot),
          mascotBadge: {
            ...getBox(mascotBadge),
            text: mascotBadge ? mascotBadge.textContent?.trim() : null,
          },
          mascotSprite: getBox(mascotSprite),
          landmarks,
        };
      });

      report[vp.name][phase] = measurements;
    }

    await page.close();
  }

  const reportPath = path.join(OUT_DIR, 'hero-fix-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Saved report: ${reportPath}`);

  await browser.close();
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
