import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASELINE_IMG_PATH = path.resolve('docs/master/before/core/1280x720-day.png');
const AFTER_IMG_PATH = path.resolve('docs/master/after/core/1280x720-day-frozen.png');
const DIFF_IMG_PATH = path.resolve('docs/master/after/core/1280x720-diff.png');

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  // Emulate reduced motion to freeze all animations at frame 0
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  // Deterministic seed
  await page.evaluateOnNewDocument(() => {
    let s = 123456789;
    Math.random = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  });

  await page.setViewport({ width: 1280, height: 720, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({ path: AFTER_IMG_PATH });
  console.log(`Saved frozen screenshot to ${AFTER_IMG_PATH}`);

  // Now compare both images inside the browser using HTML5 Canvas
  const base64Before = fs.readFileSync(BASELINE_IMG_PATH).toString('base64');
  const base64After = fs.readFileSync(AFTER_IMG_PATH).toString('base64');

  const comparison = await page.evaluate(async (b64Before, b64After) => {
    function loadImage(b64) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = 'data:image/png;base64,' + b64;
      });
    }

    const imgBefore = await loadImage(b64Before);
    const imgAfter = await loadImage(b64After);

    const W = imgBefore.width;
    const H = imgBefore.height;

    const c1 = document.createElement('canvas');
    c1.width = W;
    c1.height = H;
    const ctx1 = c1.getContext('2d');
    ctx1.drawImage(imgBefore, 0, 0);
    const d1 = ctx1.getImageData(0, 0, W, H).data;

    const c2 = document.createElement('canvas');
    c2.width = W;
    c2.height = H;
    const ctx2 = c2.getContext('2d');
    ctx2.drawImage(imgAfter, 0, 0);
    const d2 = ctx2.getImageData(0, 0, W, H).data;

    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = W;
    diffCanvas.height = H;
    const diffCtx = diffCanvas.getContext('2d');
    const diffImgData = diffCtx.createImageData(W, H);
    const diffData = diffImgData.data;

    let diffPixels = 0;
    let matchingPixels = 0;

    // Track vertical bands where differences occur
    const diffBands = {
      header: 0,      // y: 0 - 208
      stageSky: 0,     // y: 208 - 338
      ground: 0,       // y: 338 - 376
      dialog: 0,       // y: 376 - 600
      belowDialog: 0,  // y: 600 - 720
    };

    for (let i = 0; i < d1.length; i += 4) {
      const r1 = d1[i], g1 = d1[i + 1], b1 = d1[i + 2], a1 = d1[i + 3];
      const r2 = d2[i], g2 = d2[i + 1], b2 = d2[i + 2], a2 = d2[i + 3];

      const rDiff = Math.abs(r1 - r2);
      const gDiff = Math.abs(g1 - g2);
      const bDiff = Math.abs(b1 - b2);
      const aDiff = Math.abs(a1 - a2);

      const isDiff = (rDiff > 3 || gDiff > 3 || bDiff > 3 || aDiff > 3);

      const pxIdx = i / 4;
      const x = pxIdx % W;
      const y = Math.floor(pxIdx / W);

      if (isDiff) {
        diffPixels++;
        // Highlight in red on diff canvas
        diffData[i] = 255;
        diffData[i + 1] = 0;
        diffData[i + 2] = 0;
        diffData[i + 3] = 255;

        if (y < 208) diffBands.header++;
        else if (y < 338) diffBands.stageSky++;
        else if (y < 376) diffBands.ground++;
        else if (y < 600) diffBands.dialog++;
        else diffBands.belowDialog++;
      } else {
        matchingPixels++;
        // Fade matching pixels
        diffData[i] = Math.floor(r1 * 0.2);
        diffData[i + 1] = Math.floor(g1 * 0.2);
        diffData[i + 2] = Math.floor(b1 * 0.2);
        diffData[i + 3] = 255;
      }
    }

    diffCtx.putImageData(diffImgData, 0, 0);

    return {
      totalPixels: W * H,
      diffPixels,
      matchingPixels,
      diffPercentage: Math.round((diffPixels / (W * H)) * 10000) / 100,
      matchPercentage: Math.round((matchingPixels / (W * H)) * 10000) / 100,
      diffBands,
      diffDataUrl: diffCanvas.toDataURL(),
    };
  }, base64Before, base64After);

  // Save diff image
  const base64Diff = comparison.diffDataUrl.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(DIFF_IMG_PATH, Buffer.from(base64Diff, 'base64'));
  console.log(`Saved diff visualization to ${DIFF_IMG_PATH}`);

  delete comparison.diffDataUrl;
  console.log('Comparison Results:', JSON.stringify(comparison, null, 2));

  await browser.close();
}

run().catch(console.error);
