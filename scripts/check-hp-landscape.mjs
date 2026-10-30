import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  for (const s of [{ w: 667, h: 375 }, { w: 844, h: 390 }, { w: 932, h: 430 }]) {
    await page.setViewport({ width: s.w, height: s.h, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4173/#contact', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 400));

    const res = await page.evaluate(() => {
      // Find mobile contact submit button
      const contactSection = document.getElementById('section-contact');
      const btn = contactSection ? contactSection.querySelector('button[type="submit"]') : null;
      if (!btn) return { error: 'No submit button in contact section' };

      btn.scrollIntoView({ block: 'center' });
      const rect = btn.getBoundingClientRect();
      const windowH = window.innerHeight;

      return {
        text: btn.innerText.trim(),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        windowH,
        visible: rect.bottom <= windowH && rect.top >= 0,
      };
    });

    // Test real click
    let clickOk = false;
    try {
      const btn = await page.$('#section-contact button[type="submit"]');
      if (btn) {
        await btn.click();
        clickOk = true;
      }
    } catch (e) {
      clickOk = false;
    }

    console.log(`${s.w}x${s.h}:`, res, 'Click success:', clickOk);
  }

  await browser.close();
}

test().catch(console.error);
