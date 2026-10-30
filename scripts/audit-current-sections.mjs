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
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  const results = {};

  for (const vp of VIEWPORTS) {
    results[vp.label] = {};
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });

    for (const sec of SECTIONS) {
      await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector(`#active-section-${sec}`, { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 200));

      const data = await page.evaluate((secId) => {
        const container = document.querySelector(`#active-section-${secId}`);
        const panel = container.querySelector('[role="region"]') || container.firstElementChild;
        
        // Find all scrollable elements inside container
        const scrollables = [];
        const all = [container, ...container.querySelectorAll('*')];
        all.forEach((el) => {
          const style = getComputedStyle(el);
          const hasScroll = el.scrollHeight > el.clientHeight + 1;
          const isScrollable = style.overflowY === 'auto' || style.overflowY === 'scroll';
          if (hasScroll && isScrollable) {
            scrollables.push({
              id: el.id || '',
              tag: el.tagName,
              className: el.className.slice(0, 60),
              clientHeight: el.clientHeight,
              scrollHeight: el.scrollHeight,
              diff: el.scrollHeight - el.clientHeight,
            });
          }
        });

        // Detail elements inside section
        const children = Array.from(panel?.children || []).map((c) => ({
          tag: c.tagName,
          className: c.className.slice(0, 50),
          offsetHeight: c.offsetHeight,
        }));

        return {
          containerClientH: container.clientHeight,
          containerScrollH: container.scrollHeight,
          containerHasScroll: container.scrollHeight > container.clientHeight + 1,
          scrollables,
          children,
        };
      }, sec);

      results[vp.label][sec] = data;
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
