import puppeteer from 'puppeteer-core';
import fs from 'fs';

const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '412x915', width: 412, height: 915 },
  { name: '667x375', width: 667, height: 375 },
  { name: '844x390', width: 844, height: 390 },
];

async function measureMobile(port = 4173) {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  const results = {};

  for (const vp of VIEWPORTS) {
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 1,
    });

    await page.goto(`http://localhost:${port}/#hero`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const metrics = await page.evaluate(() => {
      window.scrollTo(0, 0);
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);

      const header = document.querySelector('header');
      const hr = header ? header.getBoundingClientRect() : null;

      const tagline = document.querySelector('[data-outdoor-tagline="true"], [data-outdoor-tagline]');
      const tr = tagline ? tagline.getBoundingClientRect() : null;

      const firstLabel = document.querySelector('[data-outdoor-label="true"], [data-outdoor-label]');
      const lr = firstLabel ? firstLabel.getBoundingClientRect() : null;

      const dock = document.querySelector('nav[aria-label="Peta Navigasi Mobile"]');
      const dr = dock ? dock.getBoundingClientRect() : null;

      const badge = document.querySelector('[data-outdoor-badge="true"], [data-outdoor-badge]');
      const br = badge ? badge.getBoundingClientRect() : null;

      // Also get all labels for completeness
      const allLabels = Array.from(document.querySelectorAll('[data-outdoor-label="true"], [data-outdoor-label]')).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          text: el.textContent.trim(),
          top: round(r.top + window.scrollY),
          bottom: round(r.bottom + window.scrollY),
          height: round(r.height),
        };
      });

      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        header: hr ? { top: round(hr.top), bottom: round(hr.bottom), height: round(hr.height) } : null,
        tagline: tr ? { top: round(tr.top + window.scrollY), bottom: round(tr.bottom + window.scrollY), height: round(tr.height) } : null,
        label: lr ? { top: round(lr.top + window.scrollY), bottom: round(lr.bottom + window.scrollY), height: round(lr.height) } : null,
        dock: dr ? { top: round(dr.top), bottom: round(dr.bottom), height: round(dr.height) } : null,
        badge: br ? { top: round(br.top + window.scrollY), bottom: round(br.bottom + window.scrollY), height: round(br.height) } : null,
        allLabels,
      };
    });

    results[vp.name] = metrics;
  }

  await browser.close();
  return results;
}

measureMobile()
  .then((data) => {
    console.log(JSON.stringify(data, null, 2));
    fs.writeFileSync('scripts/measured_head_mobile.json', JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
