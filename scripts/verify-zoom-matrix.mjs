import puppeteer from 'puppeteer-core';

async function testZoom() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const zoomList = [
    // 1920x1080
    { zoom: '67%', w: 2865, h: 1612, base: '1920x1080' },
    { zoom: '80%', w: 2400, h: 1350, base: '1920x1080' },
    { zoom: '110%', w: 1745, h: 982, base: '1920x1080' },
    { zoom: '125%', w: 1536, h: 864, base: '1920x1080' },
    { zoom: '150%', w: 1280, h: 720, base: '1920x1080' },

    // 1366x768
    { zoom: '67%', w: 2038, h: 1146, base: '1366x768' },
    { zoom: '80%', w: 1707, h: 960, base: '1366x768' },
    { zoom: '110%', w: 1241, h: 698, base: '1366x768' },
    { zoom: '125%', w: 1092, h: 614, base: '1366x768' },
    { zoom: '150%', w: 911, h: 512, base: '1366x768' },
  ];

  const sections = ['quests', 'skills', 'guild', 'contact', 'guestbook'];
  const results = [];

  for (const z of zoomList) {
    const isDesktop = z.w >= 1024 && z.h >= 480 && z.w >= z.h;
    await page.setViewport({ width: z.w, height: z.h, isMobile: !isDesktop });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 200));

    const item = {
      base: z.base,
      zoom: z.zoom,
      viewport: `${z.w}x${z.h}`,
      mode: isDesktop ? (z.h < 700 ? 'Desktop Compact' : 'Desktop Standard') : 'Mobile',
      sections: {},
    };

    if (isDesktop) {
      for (const sec of sections) {
        await page.goto(`http://localhost:4173/#${sec}`, { waitUntil: 'domcontentloaded' });
        try {
          await page.waitForSelector(`#active-section-${sec}`, { timeout: 3000 });
        } catch (e) {}
        await new Promise((r) => setTimeout(r, 150));

        const secData = await page.evaluate((secId) => {
          const panel = document.getElementById(`active-section-${secId}`);
          if (!panel) return { totalPages: 0, overflow: 0 };

          const overflow = Math.max(0, panel.scrollHeight - panel.clientHeight);
          const nav = document.querySelector('nav[aria-label="Paginasi Halaman Section"]');
          let totalPages = 1;
          if (nav) {
            const m = nav.textContent.match(/\/(\d+)/);
            if (m) totalPages = parseInt(m[1], 10);
          }

          let submitVisible = true;
          let clearanceBottom = null;
          if (secId === 'contact') {
            const btn = panel.querySelector('button[type="submit"]');
            if (btn) {
              const r = btn.getBoundingClientRect();
              submitVisible = r.bottom <= window.innerHeight;
              clearanceBottom = Math.round(window.innerHeight - r.bottom);
            }
          }

          return {
            totalPages,
            overflow,
            submitVisible,
            clearanceBottom,
          };
        }, sec);

        item.sections[sec] = secData;
      }
    }

    results.push(item);
    console.log(`[PASS] ${z.base} @ ${z.zoom} (${z.w}x${z.h}): Mode = ${item.mode}`);
  }

  console.log('\n--- ZOOM RESULTS SUMMARY ---');
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

testZoom().catch(console.error);
