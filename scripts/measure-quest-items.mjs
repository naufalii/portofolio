import puppeteer from 'puppeteer-core';

async function measureQuests() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  const testSizes = [
    { w: 1920, h: 1080, name: '1920x1080 Standard' },
    { w: 1255, h: 589, name: '1255x589 Compact' },
    { w: 1280, h: 720, name: '1280x720 Baseline' },
    { w: 1366, h: 768, name: '1366x768 Standard' },
  ];

  for (const s of testSizes) {
    await page.setViewport({ width: s.w, height: s.h, isMobile: false });
    await page.goto('http://localhost:4173/#quests', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 300));

    const data = await page.evaluate(() => {
      const panel = document.getElementById('active-section-quests');
      if (!panel) return null;
      const rect = panel.getBoundingClientRect();
      const windowH = window.innerHeight;
      const availableH = windowH - rect.top - 120; // from useSectionPagination reservedHeight

      // Let's inspect all items
      const items = Array.from(panel.querySelectorAll('[data-page-item-id]')).map((el) => ({
        id: el.getAttribute('data-page-item-id'),
        height: Math.round(el.getBoundingClientRect().height),
      }));

      // Let's get pagination info
      const nav = document.querySelector('nav[aria-label="Paginasi Halaman Section"]');
      const pageText = nav ? nav.textContent.trim().replace(/\s+/g, ' ') : '1 page';

      return {
        windowH,
        panelTop: Math.round(rect.top),
        availableH: Math.round(availableH),
        pageText,
        items,
      };
    });

    console.log(`=== ${s.name} ===`);
    console.log(JSON.stringify(data, null, 2));

    // Also let's navigate to page 2 and 3 if available to measure other items
    const navButtons = await page.evaluate(() => {
      const nextBtn = document.querySelector('button[aria-label="Halaman berikutnya"]');
      return !!nextBtn && !nextBtn.disabled;
    });

    if (navButtons) {
      await page.click('button[aria-label="Halaman berikutnya"]');
      await new Promise((r) => setTimeout(r, 200));
      const page2Items = await page.evaluate(() => {
        const panel = document.getElementById('active-section-quests');
        return Array.from(panel.querySelectorAll('[data-page-item-id]')).map((el) => ({
          id: el.getAttribute('data-page-item-id'),
          height: Math.round(el.getBoundingClientRect().height),
        }));
      });
      console.log('Page 2 items:', page2Items);

      const navButtons2 = await page.evaluate(() => {
        const nextBtn = document.querySelector('button[aria-label="Halaman berikutnya"]');
        return !!nextBtn && !nextBtn.disabled;
      });

      if (navButtons2) {
        await page.click('button[aria-label="Halaman berikutnya"]');
        await new Promise((r) => setTimeout(r, 200));
        const page3Items = await page.evaluate(() => {
          const panel = document.getElementById('active-section-quests');
          return Array.from(panel.querySelectorAll('[data-page-item-id]')).map((el) => ({
            id: el.getAttribute('data-page-item-id'),
            height: Math.round(el.getBoundingClientRect().height),
          }));
        });
        console.log('Page 3 items:', page3Items);
      }
    }
  }

  await browser.close();
}

measureQuests().catch(console.error);
