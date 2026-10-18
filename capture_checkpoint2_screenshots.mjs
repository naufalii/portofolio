import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const outDir = path.resolve('docs/nyaman/after-checkpoint2');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const measurements = {};

  // 1. Desktop full-page screenshots
  const desktopVps = [
    { name: 'desktop-1024x768', width: 1024, height: 768 },
    { name: 'desktop-1280x720', width: 1280, height: 720 },
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'desktop-1920x1080', width: 1920, height: 1080 }
  ];

  for (const vp of desktopVps) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    if (vp.name === 'desktop-1280x720') {
      const ctaPos = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mode CV ->') || b.textContent.includes('Mode CV →'));
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height
        };
      });
      measurements[vp.name] = { ctaPosition: ctaPos };
    }

    await page.screenshot({ path: path.join(outDir, `${vp.name}.png`), fullPage: false });
    console.log(`Saved: ${vp.name}.png`);
    await page.close();
  }

  // 2. Mobile screenshots
  const mobileVps = [
    { name: 'mobile-360x800', width: 360, height: 800 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'mobile-412x915', width: 412, height: 915 }
  ];

  for (const vp of mobileVps) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    if (vp.name === 'mobile-390x844') {
      const ctaPos = await page.evaluate(() => {
        const heroBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tampilan halaman biasa'));
        if (!heroBtn) return null;
        const rect = heroBtn.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height
        };
      });
      measurements[vp.name] = { ctaPosition: ctaPos };
    }

    await page.screenshot({ path: path.join(outDir, `${vp.name}.png`), fullPage: false });
    console.log(`Saved: ${vp.name}.png`);
    await page.close();
  }

  // 3. Hero Day and Night (1280x720 & 390x844)
  for (const phase of ['day', 'night']) {
    // Desktop 1280x720
    const dPage = await browser.newPage();
    await dPage.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await dPage.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    if (phase === 'night') {
      await dPage.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MALAM') || b.textContent.includes('🌙') || b.textContent.includes('Fase'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
    }
    await dPage.screenshot({ path: path.join(outDir, `hero-${phase}-1280x720.png`), fullPage: false });
    console.log(`Saved: hero-${phase}-1280x720.png`);
    await dPage.close();

    // Mobile 390x844
    const mPage = await browser.newPage();
    await mPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await mPage.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));

    if (phase === 'night') {
      await mPage.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('MALAM') || b.textContent.includes('🌙') || b.textContent.includes('Fase'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
    }
    await mPage.screenshot({ path: path.join(outDir, `hero-${phase}-390x844.png`), fullPage: false });
    console.log(`Saved: hero-${phase}-390x844.png`);
    await mPage.close();
  }

  // 4. Crop Mode CV buttons at 1x and 2x
  for (const dpr of [1, 2]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: dpr });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Desktop Hero Mode CV button
    const heroBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mode CV ->') || b.textContent.includes('Mode CV →'));
    });
    if (heroBtn.asElement()) {
      await heroBtn.asElement().screenshot({ path: path.join(outDir, `crop-hero-mode-cv-${dpr}x.png`) });
      console.log(`Saved: crop-hero-mode-cv-${dpr}x.png`);
    }

    // Header Nav Mode CV button
    const navBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'MODE CV');
    });
    if (navBtn.asElement()) {
      await navBtn.asElement().screenshot({ path: path.join(outDir, `crop-nav-mode-cv-${dpr}x.png`) });
      console.log(`Saved: crop-nav-mode-cv-${dpr}x.png`);
    }

    await page.close();
  }

  // Save measurements
  fs.writeFileSync(path.join(outDir, 'after-measurements.json'), JSON.stringify(measurements, null, 2), 'utf8');

  await browser.close();
  console.log('Checkpoint 2 capture completed successfully!');
}

main().catch(console.error);
