import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('docs/seru2/contrast-fix');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Function to calculate relative luminance according to WCAG 2.1
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

async function verify() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
  });

  const report = {
    mobile: {},
    desktopBaseline: {},
    contrastAudit: {},
  };

  // 1. MOBILE TESTS (390x844) across Day, Dusk, Night
  const phases = ['night', 'day', 'dusk'];
  const mobileVp = { width: 390, height: 844, isMobile: true, hasTouch: true };

  const mobilePage = await browser.newPage();
  await mobilePage.setViewport(mobileVp);

  for (const phase of phases) {
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
        dusk: 'Senja',
      };
      const targetLabel = phaseLabels[targetPhase];
      const buttons = Array.from(document.querySelectorAll('#day-night-portal-menu button'));
      const match = buttons.find((b) => b.textContent?.includes(targetLabel));
      if (match) match.click();
    }, phase);

    await new Promise((r) => setTimeout(r, 600));

    // Screenshot top hero fold
    const shotPath = path.join(OUT_DIR, `mobile-390x844-${phase}.png`);
    await mobilePage.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);

    // Scroll to see Quest Log section label and capture
    await mobilePage.evaluate(() => {
      const section = document.querySelector('#section-quests');
      if (section) section.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    const questsShotPath = path.join(OUT_DIR, `mobile-390x844-quests-${phase}.png`);
    await mobilePage.screenshot({ path: questsShotPath });
    console.log(`Saved screenshot: ${questsShotPath}`);

    // Return to top
    await mobilePage.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 300));

    // Extract color and styles
    const styles = await mobilePage.evaluate(() => {
      const taglineEl = document.querySelector('[data-outdoor-tagline]');
      const labelEl = document.querySelector('[data-outdoor-label]');
      const dialogBox = document.querySelector('[role="region"][aria-label*="Dialog"]');
      const ctaBtn = document.querySelector('button[aria-label*="Mulai jelajahi"]');

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
        themeAttribute: document.documentElement.getAttribute('data-theme'),
        tagline: {
          color: taglineEl ? window.getComputedStyle(taglineEl).color : null,
          fontSize: taglineEl ? window.getComputedStyle(taglineEl).fontSize : null,
          box: getBox(taglineEl),
        },
        sectionLabel: {
          color: labelEl ? window.getComputedStyle(labelEl).color : null,
          fontSize: labelEl ? window.getComputedStyle(labelEl).fontSize : null,
          box: getBox(labelEl),
        },
        dialogBox: getBox(dialogBox),
        ctaButton: getBox(ctaBtn),
      };
    });

    report.mobile[phase] = styles;
  }
  await mobilePage.close();

  // 2. DESKTOP BASELINE CHECK (1280x720) - ensure 0px drift on Dialog and CTA
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1280, height: 720 });
  await desktopPage.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const desktopMetrics = await desktopPage.evaluate(() => {
    const dialogBox = document.querySelector('[role="region"][aria-label*="Dialog"]');
    const ctaBtn = document.querySelector('button[aria-label*="Mulai jelajahi"]');
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
      dialog: getBox(dialogBox),
      cta: getBox(ctaBtn),
    };
  });
  report.desktopBaseline = desktopMetrics;
  await desktopPage.close();

  // 3. WCAG CONTRAST RATIO AUDIT
  const skyNightRgb = parseRgb('rgb(31, 42, 68)'); // #1F2A44
  const canvasNightTopRgb = parseRgb('rgb(8, 14, 30)'); // #080E1E
  const canvasNightBottomRgb = parseRgb('rgb(24, 36, 60)'); // #18243C

  const nightTaglineColor = report.mobile.night?.tagline?.color;
  const nightLabelColor = report.mobile.night?.sectionLabel?.color;

  const taglineRgb = nightTaglineColor ? parseRgb(nightTaglineColor) : [246, 235, 211];
  const labelRgb = nightLabelColor ? parseRgb(nightLabelColor) : [246, 235, 211];

  const ratioSkyNight = getContrastRatio(taglineRgb, skyNightRgb);
  const ratioCanvasTop = getContrastRatio(taglineRgb, canvasNightTopRgb);
  const ratioCanvasBottom = getContrastRatio(taglineRgb, canvasNightBottomRgb);

  report.contrastAudit = {
    skyNightHex: '#1F2A44',
    taglineComputedColor: nightTaglineColor,
    sectionLabelComputedColor: nightLabelColor,
    contrastAgainstSkyNight: Math.round(ratioSkyNight * 100) / 100,
    contrastAgainstCanvasTop: Math.round(ratioCanvasTop * 100) / 100,
    contrastAgainstCanvasBottom: Math.round(ratioCanvasBottom * 100) / 100,
    wcagAARequirement: '>= 4.5:1',
    wcagAAARequirement: '>= 7.0:1',
    isPassingAA: ratioSkyNight >= 4.5,
    isPassingAAA: ratioSkyNight >= 7.0,
  };

  const reportPath = path.join(OUT_DIR, 'contrast-fix-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Saved report: ${reportPath}`);

  await browser.close();
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
