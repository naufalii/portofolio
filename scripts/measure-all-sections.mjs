import puppeteer from 'puppeteer-core';

async function testAll() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  const sections = ['quests', 'skills', 'guild', 'guestbook', 'contact'];
  const viewports = [
    { w: 1255, h: 589 },
    { w: 1366, h: 768 },
    { w: 1280, h: 720 },
    { w: 1024, h: 480 },
    { w: 1920, h: 1080 },
  ];

  for (const vp of viewports) {
    console.log(`\n=== Viewport ${vp.w}x${vp.h} ===`);
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: false });

    for (const sec of sections) {
      await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'domcontentloaded' });
      await new Promise((r) => setTimeout(r, 200));

      const secInfo = await page.evaluate((secId) => {
        const panel = document.getElementById(`active-section-${secId}`);
        if (!panel) return { error: 'No panel' };
        const rect = panel.getBoundingClientRect();
        const overflow = Math.round(rect.bottom - window.innerHeight);
        const nav = document.querySelector('nav[aria-label="Paginasi Halaman Section"]');
        return {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
          overflowBelowWindow: overflow,
          navText: nav ? nav.textContent.trim().replace(/\s+/g, ' ') : 'No pagination',
        };
      }, sec);

      console.log(`  ${sec.padEnd(10)}: H=${secInfo.height}px, Top=${secInfo.top}px, Overflow=${secInfo.overflowBelowWindow}px [${secInfo.navText}]`);
    }
  }

  await browser.close();
}

testAll().catch(console.error);
