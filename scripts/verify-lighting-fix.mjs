import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('docs/seru2/lighting-fix');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function verify() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
  });

  const report = {
    desktop: {},
    mobile: {},
  };

  // 1. DESKTOP VIEWPORTS (1280x720 and 1024x768)
  const desktopVps = [
    { w: 1280, h: 720, name: '1280x720' },
    { w: 1024, h: 768, name: '1024x768' },
  ];

  const phases = ['day', 'night', 'dusk'];

  for (const vp of desktopVps) {
    report.desktop[vp.name] = {};
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h });

    for (const phase of phases) {
      await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 600));

      // Click time dropdown
      await page.evaluate(() => {
        const btn = document.querySelector('header button[aria-label*="Ubah siklus waktu"]');
        if (btn) btn.click();
      });
      await new Promise((r) => setTimeout(r, 200));

      // Select target phase
      await page.evaluate((targetPhase) => {
        const phaseLabels = {
          day: 'Siang',
          night: 'Malam',
          dusk: 'Senja',
        };
        const targetLabel = phaseLabels[targetPhase];
        const buttons = Array.from(document.querySelectorAll('#day-night-portal-menu button'));
        const match = buttons.find((b) => b.textContent?.includes(targetLabel));
        if (match) match.click();
      }, phase);

      await new Promise((r) => setTimeout(r, 600));

      // Capture desktop screenshot
      const shotPath = path.join(OUT_DIR, `desktop-${vp.name}-${phase}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);

      // Measurements
      const measurements = await page.evaluate(() => {
        const dialogBox = document.querySelector('[role="region"][aria-label*="Dialog"]');
        const ctaBtn = document.querySelector('button[aria-label*="Mulai jelajahi"]');
        const timeBtn = document.querySelector('header button[aria-label*="Ubah siklus waktu"]');
        const cvBtn = document.querySelector('header a[href="/cv"]');

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
          timeSelector: {
            ...getBox(timeBtn),
            text: timeBtn ? timeBtn.textContent?.trim().replace(/\s+/g, ' ') : null,
          },
          modeCvButton: getBox(cvBtn),
          landmarks,
        };
      });

      report.desktop[vp.name][phase] = measurements;
    }

    await page.close();
  }

  // 2. MOBILE VIEWPORTS (390x844)
  const mobileVp = { w: 390, h: 844, name: '390x844' };
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: mobileVp.w, height: mobileVp.h, isMobile: true, hasTouch: true });

  for (const phase of ['day', 'night']) {
    await mobilePage.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // Open dropdown on mobile
    await mobilePage.evaluate(() => {
      const btn = document.querySelector('header button[aria-label*="Ubah siklus waktu"]');
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 200));

    // Select target phase
    await mobilePage.evaluate((targetPhase) => {
      const phaseLabels = {
        day: 'Siang',
        night: 'Malam',
      };
      const targetLabel = phaseLabels[targetPhase];
      const buttons = Array.from(document.querySelectorAll('#day-night-portal-menu button'));
      const match = buttons.find((b) => b.textContent?.includes(targetLabel));
      if (match) match.click();
    }, phase);

    await new Promise((r) => setTimeout(r, 600));

    // Capture mobile full screen
    const mobileShotPath = path.join(OUT_DIR, `mobile-${mobileVp.name}-${phase}.png`);
    await mobilePage.screenshot({ path: mobileShotPath });
    console.log(`Saved screenshot: ${mobileShotPath}`);

    // Measure mobile
    const mData = await mobilePage.evaluate(() => {
      const timeBtn = document.querySelector('header button[aria-label*="Ubah siklus waktu"]');
      const cvBtn = document.querySelector('header a[href="/cv"]');
      const getBox = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left: Math.round(r.left * 100) / 100,
          top: Math.round(r.top * 100) / 100,
          width: Math.round(r.width * 100) / 100,
          height: Math.round(r.height * 100) / 100,
        };
      };
      return {
        timeSelector: getBox(timeBtn),
        cvButton: getBox(cvBtn),
      };
    });

    report.mobile[phase] = mData;
  }

  await mobilePage.close();

  const reportPath = path.join(OUT_DIR, 'lighting-fix-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Saved report: ${reportPath}`);

  await browser.close();
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
