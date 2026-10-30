import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/user/.gemini/antigravity/brain/46fda6f8-5305-475d-89de-6e92cd20d8f1';
const VIEWPORTS = [
  { w: 1255, h: 589, label: '1255x589' },
  { w: 1366, h: 625, label: '1366x625' },
  { w: 1280, h: 590, label: '1280x590' },
];

const SECTIONS = ['quests', 'skills', 'guild', 'contact', 'guestbook'];

async function run() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  const auditResults = {};

  // Part 1: Audit each section in the 3 compact viewports
  for (const vp of VIEWPORTS) {
    auditResults[vp.label] = {};
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });

    for (const sec of SECTIONS) {
      await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector(`#active-section-${sec}`, { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 200));

      const secData = await page.evaluate((secId) => {
        const container = document.querySelector(`#active-section-${secId}`);
        const clientH = container.clientHeight;
        const scrollH = container.scrollHeight;
        const hasScroll = scrollH > clientH + 1;

        // Check if any internal element inside container has scroll
        const innerScrollables = [];
        container.querySelectorAll('*').forEach((el) => {
          const style = getComputedStyle(el);
          const elScroll = el.scrollHeight > el.clientHeight + 1;
          const isScrollable = style.overflowY === 'auto' || style.overflowY === 'scroll';
          if (elScroll && isScrollable) {
            innerScrollables.push({
              tag: el.tagName,
              className: el.className.slice(0, 50),
              clientH: el.clientHeight,
              scrollH: el.scrollHeight,
            });
          }
        });

        // Special check for Guild cards
        let guildCardInfo = null;
        if (secId === 'guild') {
          const cards = Array.from(container.querySelectorAll('.lg\\:grid-cols-3 > div'));
          guildCardInfo = cards.map((c, i) => {
            const rect = c.getBoundingClientRect();
            const btn = c.querySelector('button');
            const desc = c.querySelector('p');
            return {
              index: i + 1,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              hasAccordionBtn: !!btn,
              btnText: btn?.textContent?.trim() || null,
              descLineClamp: desc ? getComputedStyle(desc).webkitLineClamp || 'none' : null,
            };
          });
        }

        return {
          section: secId,
          clientH,
          scrollH,
          diff: scrollH - clientH,
          hasScroll,
          innerScrollables,
          guildCardInfo,
        };
      }, sec);

      auditResults[vp.label][sec] = secData;
    }
  }

  // Part 2: Test Accordion toggle in Guild Hall at 1255x589
  await page.setViewport({ width: 1255, height: 589, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#guild', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#active-section-guild', { timeout: 5000 });
  await new Promise((r) => setTimeout(r, 200));

  const guildAccordionTest = await page.evaluate(async () => {
    const container = document.querySelector('#active-section-guild');
    const firstCard = container.querySelector('.lg\\:grid-cols-3 > div');
    const toggleBtn = firstCard.querySelector('button');
    const initialHeight = firstCard.getBoundingClientRect().height;
    const initialText = toggleBtn.textContent.trim();

    // Click accordion
    toggleBtn.click();
    await new Promise((r) => setTimeout(r, 100));

    const expandedHeight = firstCard.getBoundingClientRect().height;
    const expandedText = toggleBtn.textContent.trim();
    const hasBullets = !!firstCard.querySelector('ul');

    // Click again to collapse
    toggleBtn.click();
    await new Promise((r) => setTimeout(r, 100));

    const collapsedHeight = firstCard.getBoundingClientRect().height;
    const collapsedText = toggleBtn.textContent.trim();

    return {
      initialText,
      initialHeight: Math.round(initialHeight),
      expandedText,
      expandedHeight: Math.round(expandedHeight),
      hasBullets,
      collapsedText,
      collapsedHeight: Math.round(collapsedHeight),
      toggledSuccessfully: expandedHeight > initialHeight && collapsedHeight === Math.round(initialHeight),
    };
  });

  // Part 3: Verify Baseline 1280x720 (Zero drift)
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));

  const baselineData = await page.evaluate(() => {
    const isDesktop = !window.matchMedia('(max-width: 1023px), (max-height: 479px)').matches;
    const header = document.querySelector('header')?.getBoundingClientRect();
    const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
    const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
    const groundDOM = document.querySelector('[data-ground-anchor="true"]')?.getBoundingClientRect();

    return {
      isDesktop,
      headerH: header ? Math.round(header.height) : null,
      stageH: stage ? Math.round(stage.height) : null,
      dialogTop: dialog ? Math.round(dialog.top * 100) / 100 : null,
      groundDOMTop: groundDOM ? Math.round(groundDOM.top * 100) / 100 : null,
    };
  });

  // Part 4: Header Mode CV Button Verification & Crops (1x and 2x)
  // Test at 1255x589 (compact header)
  await page.setViewport({ width: 1255, height: 589, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 300));

  const cvBtnInfoCompact = await page.evaluate(() => {
    const btn = document.querySelector('header a[href="/cv"] button');
    if (!btn) return null;
    const style = getComputedStyle(btn);
    const rect = btn.getBoundingClientRect();
    return {
      textContent: btn.textContent.trim(),
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
    };
  });

  // Crop 1x of compact header Mode CV button
  const btnEl = await page.$('header a[href="/cv"] button');
  if (btnEl) {
    await btnEl.screenshot({
      path: path.join(ARTIFACT_DIR, 'crop_header_mode_cv_1x.png'),
    });
  }

  // Crop 2x of compact header Mode CV button
  await page.setViewport({ width: 1255, height: 589, deviceScaleFactor: 2 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 300));
  const btnEl2x = await page.$('header a[href="/cv"] button');
  if (btnEl2x) {
    await btnEl2x.screenshot({
      path: path.join(ARTIFACT_DIR, 'crop_header_mode_cv_2x.png'),
    });
  }

  // Part 5: Capture Before-After / Day-Night Screenshots for all 5 sections at 1255x589
  await page.setViewport({ width: 1255, height: 589, deviceScaleFactor: 1 });

  for (const theme of ['day', 'night']) {
    for (const sec of SECTIONS) {
      await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector(`#active-section-${sec}`, { timeout: 5000 });

      // Set theme
      await page.evaluate((th) => {
        const themeBtn = document.querySelector(`[data-theme-select="${th}"]`);
        if (themeBtn) {
          themeBtn.click();
        } else {
          document.documentElement.setAttribute('data-theme', th);
        }
      }, theme);

      await new Promise((r) => setTimeout(r, 200));

      const screenshotName = `section_${sec}_1255x589_${theme}.png`;
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, screenshotName),
        fullPage: false,
      });
      console.log(`Saved screenshot: ${screenshotName}`);
    }
  }

  await browser.close();

  const finalOutput = {
    auditResults,
    guildAccordionTest,
    baselineData,
    cvBtnInfoCompact,
  };

  fs.writeFileSync('scripts/audit-output.json', JSON.stringify(finalOutput, null, 2), 'utf-8');
  console.log('Audit completed successfully. Output saved to scripts/audit-output.json');
}

run().catch(console.error);
