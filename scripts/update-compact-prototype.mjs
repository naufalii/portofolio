import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// Replace header container
content = content.replace(
  'p-4 lg:p-5 flex flex-col gap-3',
  'p-4 lg:p-5 [@media(min-width:1024px)_and_(max-height:699px)]:p-2 flex flex-col gap-3 [@media(min-width:1024px)_and_(max-height:699px)]:gap-1.5'
);

// Replace Panel 1 py-2.5
content = content.replace(
  'px-4 py-2.5 shadow-[4px_4px_0_#24160B]',
  'px-4 py-2.5 [@media(min-width:1024px)_and_(max-height:699px)]:py-1 shadow-[4px_4px_0_#24160B]'
);

// Replace main container to remove justify-center on desktop and lock to top
content = content.replace(
  'relative z-20 flex-1 w-full max-w-5xl mx-auto px-4 py-3 lg:py-5 flex flex-col justify-center overflow-visible',
  'relative z-20 flex-1 w-full max-w-5xl mx-auto px-4 py-3 lg:py-0 lg:pt-6 flex flex-col justify-center lg:justify-start overflow-visible'
);

fs.writeFileSync('src/pages/Home.jsx', content, 'utf8');

// Also update OverworldMapNav.jsx for compact mode
let navContent = fs.readFileSync('src/components/world/OverworldMapNav.jsx', 'utf8');
navContent = navContent.replace(
  'shadow-[4px_4px_0_#24160B] px-4 py-2.5',
  'shadow-[4px_4px_0_#24160B] px-4 py-2.5 [@media(min-width:1024px)_and_(max-height:699px)]:py-1'
);
navContent = navContent.replace(
  'min-h-[44px] font-pixel text-xs lg:text-sm tracking-wide transition-all cursor-pointer',
  'min-h-[44px] [@media(min-width:1024px)_and_(max-height:699px)]:min-h-[36px] font-pixel text-xs lg:text-sm tracking-wide transition-all cursor-pointer'
);
fs.writeFileSync('src/components/world/OverworldMapNav.jsx', navContent, 'utf8');

console.log('Successfully updated Home.jsx and OverworldMapNav.jsx');
