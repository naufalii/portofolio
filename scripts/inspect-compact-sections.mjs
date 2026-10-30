import puppeteer from 'puppeteer-core';

const VIEWPORTS = [
  { w: 1255, h: 589, label: '1255x589' },
  { w: 1366, h: 625, label: '1366x625' },
  { w: 1280, h: 590, label: '1280x590' },
];

const SECTIONS = ['quests', 'skills', 'guild', 'contact', 'guestbook'];

async function run() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Testing Viewport ${vp.label} (${vp.w}x${vp.h}) ===`);
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });

    for (const sec of SECTIONS) {
      await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 600));

      const info = await page.evaluate((secId) => {
        const container = document.querySelector(`#active-section-${secId}`);
        if (!container) return { error: `Container #active-section-${secId} not found` };

        const clientHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        const hasScroll = scrollHeight > clientHeight + 1; // 1px margin

        // Check inner scrollable elements if any
        const innerScrolls = [];
        container.querySelectorAll('*').forEach((el) => {
          if (el.scrollHeight > el.clientHeight + 1 && (getComputedStyle(el).overflowY === 'auto' || getComputedStyle(el).overflowY === 'scroll')) {
            innerScrolls.push({
              tag: el.tagName,
              className: el.className,
              scrollHeight: el.scrollHeight,
              clientHeight: el.clientHeight,
            });
          }
        });

        return {
          section: secId,
          container: {
            clientHeight,
            scrollHeight,
            overflowDiff: scrollHeight - clientHeight,
            hasScroll,
          },
          innerScrolls,
        };
      }, sec);

      console.log(`Section [${sec}]: container clientH=${info.container.clientHeight}, scrollH=${info.container.scrollHeight}, diff=${info.container.overflowDiff}px, hasScroll=${info.container.hasScroll}`);
      if (info.innerScrolls.length > 0) {
        console.log(`  Inner scrollable elements:`, info.innerScrolls);
      }
    }
  }

  await browser.close();
}

run().catch(console.error);
