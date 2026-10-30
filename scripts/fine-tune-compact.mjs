import fs from 'fs';

let home = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// For compact mode, set padding to pt-[24px]
home = home.replace(
  'lg:pt-[20px]',
  'lg:pt-[20px] [@media(min-width:1024px)_and_(max-height:699px)]:pt-[24px]'
);

fs.writeFileSync('src/pages/Home.jsx', home, 'utf8');
console.log('Fine-tuned compact mode padding');
