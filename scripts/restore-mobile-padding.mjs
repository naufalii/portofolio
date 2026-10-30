import fs from 'fs';

let code = fs.readFileSync('src/pages/Home.jsx', 'utf8');
const target = 'className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-4 overflow-visible flex flex-col justify-start"';
const replacement = 'className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-4 py-3 lg:py-0 overflow-visible flex flex-col justify-start"';

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/Home.jsx', code);
  console.log('Successfully restored py-3 lg:py-0 in Home.jsx');
} else {
  console.log('Target not found');
}
