import fs from 'fs';

const summary = JSON.parse(fs.readFileSync('docs/fixlaptop/after/verification_summary.json', 'utf8'));

for (const vp of summary.matrixResults) {
  if (['1024x500', '1536x680', '3440x1440'].includes(vp.viewport)) {
    console.log(`=== ${vp.viewport} ===`);
    console.log(vp);
  }
}
