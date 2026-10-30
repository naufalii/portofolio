import fs from 'fs';

let code = fs.readFileSync('src/pages/Home.jsx', 'utf8');
const target = '<footer className="relative z-20 w-full max-w-5xl mx-auto px-4 py-3 text-center text-xs font-pixel text-[#24160B]/80 hidden lg:block">';
const replacement = `{!isMobile && (
        <footer className="relative z-20 w-full max-w-5xl mx-auto px-4 py-3 text-center text-xs font-pixel text-[#24160B]/80">`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  code = code.replace('</footer>\n    </div>', '</footer>\n      )}\n    </div>');
  code = code.replace('</footer>\r\n    </div>', '</footer>\r\n      )}\r\n    </div>');
  fs.writeFileSync('src/pages/Home.jsx', code);
  console.log('Successfully updated footer in Home.jsx');
} else {
  console.log('Target footer not found');
}
