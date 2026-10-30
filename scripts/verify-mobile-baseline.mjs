import puppeteer from 'puppeteer-core';

async function testMobile() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  const mobileSizes = [
    { w: 360, h: 800, name: '360x800 (Android Standard)' },
    { w: 390, h: 844, name: '390x844 (iPhone 12/13/14)' },
    { w: 412, h: 915, name: '412x915 (Pixel 7)' },
  ];

  const results = [];

  for (const s of mobileSizes) {
    await page.setViewport({ width: s.w, height: s.h, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 400));

    const initialMetrics = await page.evaluate(() => {
      const header = document.querySelector('header');
      const dock = document.querySelector('nav[aria-label="Peta Navigasi Mobile"]');
      const badge = document.querySelector('[data-outdoor-badge]');
      const tagline = document.querySelector('[data-outdoor-tagline]');
      
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollable = scrollHeight > clientHeight;

      return {
        headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
        dockH: dock ? Math.round(dock.getBoundingClientRect().height) : null,
        groundY: 152, // Mobile 3-layer parallax fixed groundY
        badgeTop: badge ? Math.round(badge.getBoundingClientRect().top) : null,
        taglineTop: tagline ? Math.round(tagline.getBoundingClientRect().top) : null,
        scrollHeight,
        clientHeight,
        scrollable,
      };
    });

    // Now test scrolling to bottom and clicking contact submit button
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise((r) => setTimeout(r, 300));

    const scrollBottomCheck = await page.evaluate(() => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const contactSection = document.getElementById('section-contact');
      const guestbookSection = document.getElementById('section-guestbook');
      const submitBtn = document.querySelector('#section-contact button[type="submit"]') ||
                        document.querySelector('button[type="submit"]');

      return {
        currentScrollY: Math.round(currentScrollY),
        maxScroll: Math.round(maxScroll),
        reachedBottom: currentScrollY >= maxScroll - 5,
        contactPresent: !!contactSection,
        guestbookPresent: !!guestbookSection,
        submitButtonFound: !!submitBtn,
      };
    });

    // Test real button click at bottom
    let clickResult = false;
    try {
      const btn = await page.$('button[type="submit"]');
      if (btn) {
        await btn.click();
        clickResult = true;
      }
    } catch (e) {
      clickResult = false;
    }

    results.push({
      viewport: `${s.w}x${s.h}`,
      name: s.name,
      metrics: initialMetrics,
      scrollCheck: scrollBottomCheck,
      bottomClickSuccess: clickResult,
    });
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

testMobile().catch(console.error);
