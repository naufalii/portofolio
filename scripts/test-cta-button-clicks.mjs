import puppeteer from 'puppeteer-core';

async function testCtaClick() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = {};

  for (const h of [400, 450]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: h, deviceScaleFactor: 1 });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // Test 1: Check CTA button click on Mulai Jelajah
    const clickResult = await page.evaluate(async () => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent.includes('Mulai Jelajah')
      );
      if (!btn) return { found: false };

      const rBefore = btn.getBoundingClientRect();
      // Scroll into view if needed
      btn.scrollIntoView({ block: 'nearest' });
      const rAfterScroll = btn.getBoundingClientRect();

      // Trigger click
      btn.click();
      return {
        found: true,
        rectBefore: { top: rBefore.top, bottom: rBefore.bottom },
        rectAfterScroll: { top: rAfterScroll.top, bottom: rAfterScroll.bottom },
      };
    });

    // Wait for transition (Mulai Jelajah triggers goTo('quests', 'cta'))
    await new Promise((r) => setTimeout(r, 1200));

    const finalState = await page.evaluate(() => {
      const activeSection = document.querySelector('#active-section-quests');
      const hash = window.location.hash;
      const badge = document.querySelector('[data-outdoor-badge="true"]')?.textContent;
      return {
        activeSectionFound: !!activeSection,
        hash,
        badge,
      };
    });

    results[`H=${h}`] = {
      clickResult,
      finalState,
      success: finalState.activeSectionFound && finalState.hash === '#quests',
    };

    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

testCtaClick().catch(console.error);
