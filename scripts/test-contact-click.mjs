import puppeteer from 'puppeteer-core';

async function testClicks() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  const testSizes = [
    { w: 1024, h: 480 },
    { w: 1255, h: 589 },
    { w: 1366, h: 768 },
    { w: 1920, h: 1080 },
  ];

  for (const s of testSizes) {
    await page.setViewport({ width: s.w, height: s.h, isMobile: false });
    await page.goto('http://localhost:4173/#contact', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 250));

    // Try clicking submit button without scrolling
    const res = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (!btn) return { ok: false, error: 'no submit button' };
      const rect = btn.getBoundingClientRect();
      // Click via mouse event dispatch
      btn.click();
      return {
        ok: true,
        text: btn.innerText.trim(),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
        windowH: window.innerHeight,
        insideViewport: rect.bottom <= window.innerHeight && rect.top >= 0,
      };
    });

    // Check if toast appears
    await new Promise((r) => setTimeout(r, 200));
    const toast = await page.evaluate(() => {
      const t = document.querySelector('[role="status"], [role="alert"], .bg-\\[\\#24160B\\], .fixed');
      return t ? t.textContent : null;
    });

    console.log(`${s.w}x${s.h}: Click success = ${res.ok}, Inside viewport = ${res.insideViewport}, Button text = "${res.text}", Toast = "${toast?.slice(0, 40)}"`);
  }

  await browser.close();
}

testClicks().catch(console.error);
