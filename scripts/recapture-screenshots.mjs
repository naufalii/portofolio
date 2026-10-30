import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/user/.gemini/antigravity/brain/46fda6f8-5305-475d-89de-6e92cd20d8f1';
const SECTIONS = ['quests', 'skills', 'guild', 'contact', 'guestbook'];

async function capture() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 1255, height: 589, deviceScaleFactor: 1 });

  for (const theme of ['day', 'night']) {
    for (const sec of SECTIONS) {
      await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector(`#active-section-${sec}`, { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 200));

      // Open DayNightIndicator and select phase
      await page.evaluate((th) => {
        // Find DayNight button
        const btn = document.querySelector('header button[aria-label^="Ubah siklus waktu"]');
        if (btn) btn.click();
      }, theme);

      await new Promise((r) => setTimeout(r, 100));

      await page.evaluate((th) => {
        const portal = document.querySelector('#day-night-portal-menu');
        if (portal) {
          const buttons = Array.from(portal.querySelectorAll('button'));
          const target = buttons.find((b) => b.textContent.toLowerCase().includes(th === 'night' ? 'malam' : 'siang'));
          if (target) target.click();
        }
      }, theme);

      await new Promise((r) => setTimeout(r, 300));

      const screenshotName = `section_${sec}_1255x589_${theme}.png`;
      const screenshotPath = path.join(ARTIFACT_DIR, screenshotName);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot: ${screenshotName}`);
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

capture().catch(console.error);
