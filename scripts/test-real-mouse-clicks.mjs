import puppeteer from 'puppeteer-core';
import fs from 'fs';

const VIEWPORTS = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '2560x1080', width: 2560, height: 1080 },
  { name: '3440x1440', width: 3440, height: 1440 },
];

const LANDMARKS = [
  { id: 'quests', name: 'Quest Log' },
  { id: 'skills', name: 'Skill Tree' },
  { id: 'guild', name: 'Guild Hall' },
  { id: 'contact', name: 'Kotak Pos' },
  { id: 'guestbook', name: 'Papan Pesan' },
  { id: 'hero', name: 'Desa Awal' },
];

async function runRealMouseClicks() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const allResults = {};

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Testing Viewport: ${vp.name} ===`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const vpResults = [];

    for (const target of LANDMARKS) {
      // 1. Get exact bounding box of the landmark button
      const btnInfo = await page.evaluate((id) => {
        const btn = document.querySelector(`[data-landmark-btn="${id}"]`);
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return {
          id,
          left: Math.round(r.left * 100) / 100,
          top: Math.round(r.top * 100) / 100,
          width: Math.round(r.width * 100) / 100,
          height: Math.round(r.height * 100) / 100,
          cx: Math.round(r.left + r.width / 2),
          cy: Math.round(r.top + r.height / 2),
        };
      }, target.id);

      if (!btnInfo) {
        vpResults.push({ id: target.id, error: 'Button not found' });
        continue;
      }

      // 2. Perform REAL mouse click with page.mouse.click(cx, cy)
      await page.mouse.click(btnInfo.cx, btnInfo.cy);

      // Check transition immediately (100ms)
      await new Promise((r) => setTimeout(r, 100));
      const midTransit = await page.evaluate(() => {
        const badge = document.querySelector('[data-outdoor-badge="true"]');
        return badge ? badge.textContent.trim() : null;
      });

      // Wait for travel animation to complete (max duration ~1200ms)
      await new Promise((r) => setTimeout(r, 1100));

      // Check final state
      const postArrival = await page.evaluate((expectedId) => {
        const badge = document.querySelector('[data-outdoor-badge="true"]');
        const activeSection = document.querySelector(`#active-section-${expectedId}`);
        const activeHeader = activeSection ? activeSection.querySelector('h1, h2, h3')?.textContent.trim() : null;
        const urlHash = window.location.hash;

        return {
          badgeText: badge ? badge.textContent.trim() : null,
          activeSectionFound: !!activeSection,
          activeHeader,
          urlHash,
        };
      }, target.id);

      const result = {
        targetId: target.id,
        targetName: target.name,
        clickCoords: { cx: btnInfo.cx, cy: btnInfo.cy },
        btnRect: { left: btnInfo.left, top: btnInfo.top, width: btnInfo.width, height: btnInfo.height },
        midTransitBadge: midTransit,
        postArrivalBadge: postArrival.badgeText,
        activeSectionFound: postArrival.activeSectionFound,
        activeHeader: postArrival.activeHeader,
        urlHash: postArrival.urlHash,
        success: postArrival.activeSectionFound && postArrival.urlHash === `#${target.id}`,
      };

      console.log(`Click -> ${target.id} at (${btnInfo.cx}, ${btnInfo.cy}): Success=${result.success}, Section=${postArrival.activeHeader}`);
      vpResults.push(result);
    }

    allResults[vp.name] = vpResults;
    await page.close();
  }

  await browser.close();

  fs.writeFileSync('scripts/real_mouse_click_results.json', JSON.stringify(allResults, null, 2));
  return allResults;
}

runRealMouseClicks().then(() => console.log('\nFinished all real mouse clicks test.')).catch(console.error);
