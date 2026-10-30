import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  console.log('--- VERIFYING FIX D (M4) ---');

  for (const vp of [{ name: '1909x991', w: 1909, h: 991 }, { name: '1280x720', w: 1280, h: 720 }]) {
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: false });

    for (const phase of ['day', 'night']) {
      await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 200));

      await page.evaluate((p) => {
        document.documentElement.setAttribute('data-theme', p);
      }, phase);
      await new Promise(r => setTimeout(r, 200));

      const ssPath = `docs/fixlaptop/after/m4_${vp.name}_${phase}.png`;
      await page.screenshot({ path: ssPath });

      const boxStyles = await page.evaluate(() => {
        const activeBtn = document.querySelector('[data-landmark-btn="hero"]');
        const box = activeBtn ? activeBtn.querySelector('div') : null;
        if (!box) return null;
        const cs = window.getComputedStyle(box);
        return {
          backgroundColor: cs.backgroundColor,
          border: cs.border,
          boxShadow: cs.boxShadow,
        };
      });

      console.log(`[${vp.name} - ${phase}]`);
      console.log(`  backgroundColor: "${boxStyles.backgroundColor}" (${boxStyles.backgroundColor === 'rgba(0, 0, 0, 0)' || boxStyles.backgroundColor === 'transparent' ? 'PASS (Transparent, NO fill)' : 'FAIL'})`);
      console.log(`  border: "${boxStyles.border}"`);
      console.log(`  boxShadow: "${boxStyles.boxShadow}"`);
      console.log(`  screenshot: ${ssPath}`);
    }
  }

  await browser.close();
}

run().catch(console.error);
