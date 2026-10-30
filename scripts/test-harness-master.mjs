import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('docs/master/before');
const CORE_DIR = path.join(OUT_DIR, 'core');
const SHEETS_DIR = path.join(OUT_DIR, 'contact-sheets');

[OUT_DIR, CORE_DIR, SHEETS_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Relative luminance & contrast ratio
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
  if (!colorStr) return [0, 0, 0];
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

const DESKTOP_VIEWPORTS = [
  { width: 1024, height: 768, name: '1024x768', group: 'desktop' },
  { width: 1024, height: 600, name: '1024x600', group: 'desktop' },
  { width: 1152, height: 864, name: '1152x864', group: 'desktop' },
  { width: 1280, height: 600, name: '1280x600', group: 'desktop' },
  { width: 1280, height: 720, name: '1280x720', group: 'desktop', isCore: true },
  { width: 1280, height: 800, name: '1280x800', group: 'desktop' },
  { width: 1280, height: 1024, name: '1280x1024', group: 'desktop' },
  { width: 1366, height: 625, name: '1366x625', group: 'desktop', isCore: true },
  { width: 1366, height: 768, name: '1366x768', group: 'desktop' },
  { width: 1440, height: 900, name: '1440x900', group: 'desktop' },
  { width: 1536, height: 730, name: '1536x730', group: 'desktop' },
  { width: 1536, height: 864, name: '1536x864', group: 'desktop' },
  { width: 1600, height: 900, name: '1600x900', group: 'desktop' },
  { width: 1680, height: 1050, name: '1680x1050', group: 'desktop' },
  { width: 1920, height: 947, name: '1920x947', group: 'desktop' },
  { width: 1920, height: 1080, name: '1920x1080', group: 'desktop', isCore: true },
  { width: 1920, height: 1200, name: '1920x1200', group: 'desktop' },
  { width: 2560, height: 1080, name: '2560x1080', group: 'desktop' },
  { width: 2560, height: 1440, name: '2560x1440', group: 'desktop' },
  { width: 3440, height: 1440, name: '3440x1440', group: 'desktop' },
  { width: 1024, height: 1366, name: '1024x1366', group: 'desktop' },
  { width: 1080, height: 1920, name: '1080x1920', group: 'desktop' },
];

const ZOOM_VIEWPORTS = [
  { width: Math.round(1920 / 0.9), height: Math.round(1080 / 0.9), dpr: 0.9, name: 'zoom-1920x1080-90pct', group: 'zoom' },
  { width: 1920, height: 1080, dpr: 1.0, name: 'zoom-1920x1080-100pct', group: 'zoom' },
  { width: Math.round(1920 / 1.1), height: Math.round(1080 / 1.1), dpr: 1.1, name: 'zoom-1920x1080-110pct', group: 'zoom' },
  { width: Math.round(1920 / 1.25), height: Math.round(1080 / 1.25), dpr: 1.25, name: 'zoom-1920x1080-125pct', group: 'zoom' },
  { width: Math.round(1920 / 1.5), height: Math.round(1080 / 1.5), dpr: 1.5, name: 'zoom-1920x1080-150pct', group: 'zoom' },
  { width: Math.round(1920 / 1.75), height: Math.round(1080 / 1.75), dpr: 1.75, name: 'zoom-1920x1080-175pct', group: 'zoom' },
  { width: Math.round(1366 / 1.25), height: Math.round(768 / 1.25), dpr: 1.25, name: 'zoom-1366x768-125pct', group: 'zoom' },
  { width: Math.round(1366 / 1.5), height: Math.round(768 / 1.5), dpr: 1.5, name: 'zoom-1366x768-150pct', group: 'zoom' },
];

const MOBILE_VIEWPORTS = [
  { width: 320, height: 568, name: '320x568', group: 'mobile' },
  { width: 360, height: 640, name: '360x640', group: 'mobile' },
  { width: 360, height: 800, name: '360x800', group: 'mobile' },
  { width: 375, height: 667, name: '375x667', group: 'mobile' },
  { width: 390, height: 844, name: '390x844', group: 'mobile', isCore: true },
  { width: 412, height: 915, name: '412x915', group: 'mobile' },
  { width: 430, height: 932, name: '430x932', group: 'mobile' },
  { width: 667, height: 375, name: '667x375-landscape', group: 'mobile' },
  { width: 844, height: 390, name: '844x390-landscape', group: 'mobile' },
  { width: 932, height: 430, name: '932x430-landscape', group: 'mobile' },
  { width: 768, height: 1024, name: '768x1024', group: 'mobile' },
  { width: 820, height: 1180, name: '820x1180', group: 'mobile' },
  { width: 834, height: 1194, name: '834x1194', group: 'mobile' },
  { width: 1180, height: 820, name: '1180x820', group: 'mobile' },
  { width: 1000, height: 700, name: '1000x700-mobile-boundary', group: 'mobile' },
];

const BOUNDARY_VIEWPORTS = [
  { width: 1023, height: 800, name: '1023x800-mobile-bound', group: 'boundary' },
  { width: 1024, height: 800, name: '1024x800-desktop-bound', group: 'boundary' },
  { width: 1024, height: 599, name: '1024x599-mobile-bound', group: 'boundary' },
  { width: 1024, height: 600, name: '1024x600-desktop-bound', group: 'boundary' },
];

const ALL_VIEWPORTS = [
  ...DESKTOP_VIEWPORTS,
  ...ZOOM_VIEWPORTS,
  ...MOBILE_VIEWPORTS,
  ...BOUNDARY_VIEWPORTS,
];

async function runHarness() {
  console.log(`Starting Baseline Harness across ${ALL_VIEWPORTS.length} viewports...`);
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });

  const results = [];
  const coreScreenshots = [];

  for (const vp of ALL_VIEWPORTS) {
    const page = await browser.newPage();
    const isMobileMode = vp.group === 'mobile' || vp.width < 1024;
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dpr || 1,
      isMobile: isMobileMode,
      hasTouch: isMobileMode,
    });

    const consoleLogs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleLogs.push({ type: msg.type(), text: msg.text() });
      }
    });

    const phasesToTest = vp.isCore ? ['day', 'dusk', 'night'] : ['day', 'night'];

    for (const phase of phasesToTest) {
      await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 400));

      // Set phase
      if (phase !== 'day') {
        await page.evaluate(() => {
          const btn = document.querySelector('header button[aria-label*="Ubah siklus waktu"]');
          if (btn) btn.click();
        });
        await new Promise((r) => setTimeout(r, 200));

        await page.evaluate((targetPhase) => {
          const phaseLabels = { day: 'Siang', night: 'Malam', dusk: 'Senja' };
          const label = phaseLabels[targetPhase];
          const buttons = Array.from(document.querySelectorAll('#day-night-portal-menu button'));
          const match = buttons.find((b) => b.textContent?.includes(label));
          if (match) match.click();
        }, phase);
        await new Promise((r) => setTimeout(r, 400));
      }

      // Evaluate metrics
      const metrics = await page.evaluate((vpName, isMob) => {
        const round = (n) => Math.round(n * 100) / 100;
        const getBox = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            left: round(r.left),
            top: round(r.top),
            bottom: round(r.bottom),
            right: round(r.right),
            width: round(r.width),
            height: round(r.height),
          };
        };

        const canvasEl = document.querySelector('canvas');
        const cr = canvasEl ? canvasEl.getBoundingClientRect() : null;

        // Ground baseline in screen coords using object-cover formula
        let groundScreenY = null;
        let scale = 1;
        if (cr) {
          const aspect = cr.width / cr.height;
          if (aspect > 1.8) {
            scale = cr.width / 360;
            const offsetY = (cr.height - 200 * scale) / 2;
            groundScreenY = round(cr.top + offsetY + 94 * scale);
          } else {
            scale = cr.height / 200;
            const offsetX = (cr.width - 360 * scale) / 2;
            groundScreenY = round(cr.top + 94 * scale);
          }
        }

        // Mascot foot Y
        const stageEl = document.querySelector('[data-landmark-stage="true"]');
        const mascotSprite = stageEl ? stageEl.querySelector('svg') : null;
        let footY = null;
        if (mascotSprite) {
          const sr = mascotSprite.getBoundingClientRect();
          footY = round(sr.top + (45 / 48) * sr.height);
        }

        // Mascot X vs Tab center
        const heroTab = document.querySelector('[data-location-id="hero"]');
        let tabCenterX = null;
        let mascotCenterX = null;
        if (heroTab) {
          const tr = heroTab.getBoundingClientRect();
          tabCenterX = round(tr.left + tr.width / 2);
        }
        if (mascotSprite) {
          const sr = mascotSprite.getBoundingClientRect();
          mascotCenterX = round(sr.left + sr.width / 2);
        }

        // Dialog and CTA
        const dialogBox = document.querySelector('[role="region"][aria-label*="Dialog"]');
        const ctaBtn = document.querySelector('button[aria-label*="Mulai jelajahi"]');

        // Horizontal overflow check
        const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;

        // CTA visible in viewport without scrolling
        const ctaBox = getBox(ctaBtn);
        const isCtaVisibleWithoutScroll = ctaBox ? ctaBox.bottom <= window.innerHeight : true;

        // Outdoor text colors
        const taglineEl = document.querySelector('[data-outdoor-tagline]');
        const labelEl = document.querySelector('[data-outdoor-label]');
        const taglineColor = taglineEl ? window.getComputedStyle(taglineEl).color : null;
        const labelColor = labelEl ? window.getComputedStyle(labelEl).color : null;

        // Overlap checks (e.g. stage overlapping dialog)
        const dialogRect = getBox(dialogBox);
        const stageRect = getBox(stageEl);
        let hasMascotDialogOverlap = false;
        if (stageRect && dialogRect && !isMob) {
          hasMascotDialogOverlap = stageRect.bottom > dialogRect.top;
        }

        // Landmarks
        const landmarks = {};
        document.querySelectorAll('[data-landmark-btn]').forEach((btn) => {
          const id = btn.getAttribute('data-landmark-btn');
          landmarks[id] = getBox(btn);
        });

        return {
          cr,
          groundScreenY,
          footY,
          deltaGroundFoot: footY !== null && groundScreenY !== null ? round(footY - groundScreenY) : null,
          tabCenterX,
          mascotCenterX,
          deltaTabMascotX: tabCenterX !== null && mascotCenterX !== null ? round(mascotCenterX - tabCenterX) : null,
          dialog: dialogRect,
          cta: ctaBox,
          hasHorizontalScroll,
          isCtaVisibleWithoutScroll,
          taglineColor,
          labelColor,
          hasMascotDialogOverlap,
          landmarks,
        };
      }, vp.name, isMobileMode);

      // Contrast assessment
      const nightSkyRgb = parseRgb('rgb(31, 42, 68)');
      const duskSkyRgb = parseRgb('rgb(90, 61, 102)'); // dusk background
      const textRgb = parseRgb(metrics.taglineColor);
      let contrastRatio = 1;
      if (phase === 'night') {
        contrastRatio = getContrastRatio(textRgb, nightSkyRgb);
      } else if (phase === 'dusk') {
        contrastRatio = getContrastRatio(textRgb, duskSkyRgb);
      }

      // Check failures
      const failures = [];
      if (!isMobileMode && metrics.deltaGroundFoot !== null && Math.abs(metrics.deltaGroundFoot) > 2) {
        failures.push(`Mascot footY deviates from groundY by ${metrics.deltaGroundFoot}px (|delta| > 2px)`);
      }
      if (!isMobileMode && metrics.deltaTabMascotX !== null && Math.abs(metrics.deltaTabMascotX) > 1.5) {
        failures.push(`Mascot X deviates from tab center by ${metrics.deltaTabMascotX}px (|delta| > 1px)`);
      }
      if (metrics.hasHorizontalScroll) {
        failures.push(`Horizontal scroll detected (scrollWidth > innerWidth)`);
      }
      if (!isMobileMode && vp.height >= 600 && !metrics.isCtaVisibleWithoutScroll) {
        failures.push(`Hero CTA button cut off below viewport (height: ${vp.height}px)`);
      }
      if (metrics.hasMascotDialogOverlap) {
        failures.push(`Mascot stage overlaps Hero dialog box`);
      }
      if (phase === 'dusk' && contrastRatio < 4.5 && metrics.taglineColor) {
        failures.push(`Dusk text contrast too low (${round(contrastRatio, 2)}:1 < 4.5:1)`);
      }

      const itemResult = {
        viewport: vp,
        phase,
        metrics,
        contrastRatio: round(contrastRatio, 2),
        consoleLogs,
        failures,
        isPass: failures.length === 0,
      };
      results.push(itemResult);

      // Save screenshot for core sizes or failures
      if (vp.isCore || failures.length > 0) {
        const shotName = `${vp.name}-${phase}.png`;
        const shotPath = vp.isCore ? path.join(CORE_DIR, shotName) : path.join(OUT_DIR, `fail-${shotName}`);
        await page.screenshot({ path: shotPath });
        if (vp.isCore) coreScreenshots.push({ vp: vp.name, phase, path: shotPath });
      }
    }
    await page.close();
  }

  await browser.close();

  // Save JSON report
  const reportPath = path.join(OUT_DIR, 'baseline-matrix-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Saved baseline report: ${reportPath}`);

  // Generate Contact Sheet HTML
  const contactSheetHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Master Baseline Contact Sheet</title>
  <style>
    body { font-family: sans-serif; background: #1a1a1a; color: #eee; padding: 20px; }
    h1, h2 { color: #F6EBD3; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 30px; }
    .card { background: #2a2a2a; border: 2px solid #444; border-radius: 4px; overflow: hidden; padding: 8px; }
    .card.fail { border-color: #E8793A; }
    .card img { width: 100%; height: auto; display: block; border: 1px solid #333; }
    .title { font-weight: bold; font-size: 13px; margin-bottom: 4px; color: #E8B03A; }
    .meta { font-size: 11px; color: #aaa; }
    .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; }
    .badge.pass { background: #5E8B4A; color: #fff; }
    .badge.fail { background: #E8793A; color: #fff; }
  </style>
</head>
<body>
  <h1>Master Baseline Contact Sheet (Fase 0 - Kondisi Sekarang)</h1>
  <p>Pengujian otomatis menyeluruh pada ${ALL_VIEWPORTS.length} ukuran viewport.</p>
  
  <h2>Core Viewports (1280x720, 1366x625, 1920x1080, 390x844)</h2>
  <div class="grid">
    ${coreScreenshots.map(s => `
      <div class="card">
        <div class="title">${s.vp} (${s.phase})</div>
        <img src="../core/${path.basename(s.path)}" loading="lazy">
      </div>
    `).join('')}
  </div>

  <h2>Tabel Ringkasan Hasil Uji Baseline</h2>
  <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:12px;">
    <tr style="background:#333;">
      <th>Viewport</th><th>Group</th><th>Fase</th><th>Status</th><th>footY - groundY</th><th>CTA Visible</th><th>Kontras</th><th>Detail Kegagalan</th>
    </tr>
    ${results.map(r => `
      <tr style="background:${r.isPass ? '#223322' : '#332222'}">
        <td>${r.viewport.name}</td>
        <td>${r.viewport.group}</td>
        <td>${r.phase}</td>
        <td><span class="badge ${r.isPass ? 'pass' : 'fail'}">${r.isPass ? 'PASS' : 'FAIL'}</span></td>
        <td>${r.metrics.deltaGroundFoot !== null ? r.metrics.deltaGroundFoot + ' px' : 'N/A'}</td>
        <td>${r.metrics.isCtaVisibleWithoutScroll ? 'Ya' : 'Terpotong'}</td>
        <td>${r.contrastRatio}:1</td>
        <td>${r.failures.join('<br>') || '-'}</td>
      </tr>
    `).join('')}
  </table>
</body>
</html>
  `;
  const sheetHtmlPath = path.join(SHEETS_DIR, 'contact-sheet.html');
  fs.writeFileSync(sheetHtmlPath, contactSheetHtml);
  console.log(`Saved contact sheet HTML: ${sheetHtmlPath}`);
}

function round(n, dec = 2) {
  if (n === null || n === undefined) return null;
  const f = Math.pow(10, dec);
  return Math.round(n * f) / f;
}

runHarness().catch((err) => {
  console.error(err);
  process.exit(1);
});
