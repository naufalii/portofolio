import fs from 'fs';

const summary = JSON.parse(fs.readFileSync('docs/fixlaptop/after/verification_summary.json', 'utf8'));

for (const vp of summary.matrixResults) {
  if (!vp.allLandmarksClickable) {
    console.log(`Failed Viewport: ${vp.viewport}`);
  }
}
