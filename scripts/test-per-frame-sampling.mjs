import puppeteer from 'puppeteer-core';

async function runPerFrameSampling() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  // Inject per-frame rAF sampler
  await page.evaluate(() => {
    window.__frameLog = [];
    window.__samplingActive = true;
    let frameCount = 0;

    function sampleFrame(time) {
      if (!window.__samplingActive) return;

      const header = document.querySelector('header');
      const hr = header ? header.getBoundingClientRect() : null;
      const desktopNav = document.querySelector('nav[aria-label="Peta Dunia Overworld"]');
      const mobileDock = document.querySelector('nav[aria-label="Peta Navigasi Mobile"]');

      const canvas = document.querySelector('canvas');
      const hasObjectCover = canvas ? canvas.classList.contains('object-cover') : false;

      let domMode = 'unknown';
      if (mobileDock && !desktopNav) {
        domMode = 'mobile_vertical';
      } else if (desktopNav && hr && hr.height <= 96) {
        domMode = 'desktop_compact';
      } else if (desktopNav && hr && hr.height > 96) {
        domMode = 'desktop_standard';
      }

      let canvasMode = 'unknown';
      if (hasObjectCover) {
        canvasMode = 'mobile_vertical';
      } else if (!hasObjectCover && canvas && canvas.height === 200) {
        canvasMode = 'desktop';
      }

      const isSynchronized =
        (domMode === 'mobile_vertical' && canvasMode === 'mobile_vertical') ||
        (domMode.startsWith('desktop') && canvasMode === 'desktop');

      window.__frameLog.push({
        frame: frameCount++,
        time: Math.round(time * 10) / 10,
        width: window.innerWidth,
        height: window.innerHeight,
        domMode,
        canvasMode,
        headerHeight: hr ? Math.round(hr.height * 100) / 100 : null,
        canvasW: canvas ? canvas.width : null,
        hasObjectCover,
        isSynchronized,
      });

      requestAnimationFrame(sampleFrame);
    }

    requestAnimationFrame(sampleFrame);
  });

  console.log('Started per-frame sampling...');

  // Helper for smooth multi-step resize
  async function smoothResize(fromW, fromH, toW, toH, steps = 15, delayMs = 20) {
    for (let i = 1; i <= steps; i++) {
      const curW = Math.round(fromW + ((toW - fromW) * i) / steps);
      const curH = Math.round(fromH + ((toH - fromH) * i) / steps);
      await page.setViewport({ width: curW, height: curH, deviceScaleFactor: 1 });
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  // Phase 1: 1920x1080 -> 1366x625 (Standard Desktop -> Compact Desktop)
  console.log('Transition 1: 1920x1080 -> 1366x625');
  await smoothResize(1920, 1080, 1366, 625, 15, 20);
  await new Promise((r) => setTimeout(r, 100));

  // Phase 2: 1366x625 -> 911x450 (Compact Desktop -> Mobile Vertical, crossing 1024px & 480px thresholds)
  console.log('Transition 2: 1366x625 -> 911x450 (Crossing threshold)');
  await smoothResize(1366, 625, 911, 450, 20, 20);
  await new Promise((r) => setTimeout(r, 100));

  // Phase 3: 911x450 -> 1280x720 (Mobile Vertical -> Standard Desktop)
  console.log('Transition 3: 911x450 -> 1280x720');
  await smoothResize(911, 450, 1280, 720, 15, 20);
  await new Promise((r) => setTimeout(r, 100));

  // Phase 4: Instant rapid jump back and forth
  console.log('Transition 4: Rapid instant jumps (1920x1080 -> 911x450 -> 1280x720)');
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 80));
  await page.setViewport({ width: 911, height: 450, deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 80));
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 150));

  // Stop sampling and retrieve log
  const log = await page.evaluate(() => {
    window.__samplingActive = false;
    return window.__frameLog;
  });

  await browser.close();

  const totalFrames = log.length;
  const synchronizedFrames = log.filter((f) => f.isSynchronized).length;
  const desyncFrames = log.filter((f) => !f.isSynchronized);

  const durationMs = log.length > 0 ? log[log.length - 1].time - log[0].time : 0;
  const avgFps = durationMs > 0 ? Math.round((totalFrames / (durationMs / 1000)) * 10) / 10 : 0;

  // Breakdown of modes observed during sampling
  const modeCounts = log.reduce((acc, f) => {
    const key = `${f.domMode} + ${f.canvasMode}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const summary = {
    totalFrames,
    durationMs: Math.round(durationMs),
    avgFps,
    synchronizedFrames,
    desyncCount: desyncFrames.length,
    desyncFrames,
    modeDistribution: modeCounts,
  };

  console.log('\n=== Per-Frame Sampling Summary ===');
  console.log(JSON.stringify(summary, null, 2));

  // Sample check points
  console.log('\nFirst 3 frames:');
  console.log(log.slice(0, 3));
  console.log('\nMiddle 3 frames:');
  console.log(log.slice(Math.floor(totalFrames / 2) - 1, Math.floor(totalFrames / 2) + 2));
  console.log('\nLast 3 frames:');
  console.log(log.slice(-3));
}

runPerFrameSampling().catch(console.error);
