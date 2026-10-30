import fs from 'fs';

let home = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// Replace main padding
home = home.replace(
  'lg:pt-6',
  'lg:pt-[20px]'
);

// Calibrate header compact padding:
// Standard: p-4 lg:p-5 (20px). Compact: p-3 (12px). Reduction = 16px.
// Standard gap: gap-3 (12px). Compact gap: gap-2 (8px). Reduction = 4px.
// Standard Panel 1: py-2.5 (10px). Compact: py-1.5 (6px). Reduction = 4px.
// Total reduction: 16 + 4 + 4 = 24px! (208 - 24 = 184px).
home = home.replace(
  '[@media(min-width:1024px)_and_(max-height:699px)]:p-2',
  '[@media(min-width:1024px)_and_(max-height:699px)]:p-3'
);
home = home.replace(
  '[@media(min-width:1024px)_and_(max-height:699px)]:gap-1.5',
  '[@media(min-width:1024px)_and_(max-height:699px)]:gap-2'
);
home = home.replace(
  '[@media(min-width:1024px)_and_(max-height:699px)]:py-1',
  '[@media(min-width:1024px)_and_(max-height:699px)]:py-1.5'
);
fs.writeFileSync('src/pages/Home.jsx', home, 'utf8');

// Reset OverworldMapNav to normal py-2.5 so nav stays 64px, perfectly maintaining the 24px total reduction
let nav = fs.readFileSync('src/components/world/OverworldMapNav.jsx', 'utf8');
nav = nav.replace('px-4 py-2.5 [@media(min-width:1024px)_and_(max-height:699px)]:py-1', 'px-4 py-2.5');
nav = nav.replace('min-h-[44px] [@media(min-width:1024px)_and_(max-height:699px)]:min-h-[36px]', 'min-h-[44px]');
fs.writeFileSync('src/components/world/OverworldMapNav.jsx', nav, 'utf8');

console.log('Calibrated compact styles successfully');
