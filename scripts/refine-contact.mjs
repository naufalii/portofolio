import fs from 'fs';

const filePath = 'src/components/sections/ContactSection.jsx';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Outer wrapper spacing
content = content.replace(
  '<div className="space-y-4 max-w-4xl mx-auto">',
  '<div className={`${isCompact ? \'space-y-2\' : \'space-y-4\'} max-w-4xl mx-auto`}>'
);

// 2. Form space-y
content = content.replace(
  'className={isCompact ? \'space-y-2\' : \'space-y-3.5\'}',
  'className={isCompact ? \'space-y-1.5\' : \'space-y-3.5\'}'
);

// 3. Inputs
content = content.replace(
  /className=\{\`w-full \$\{isCompact \? 'p-1\.5 text-xs' : 'p-2\.5 text-xs lg:text-sm'\} bg-\[#FFFDF8\]/g,
  "className={`w-full ${isCompact ? 'py-1 px-2 text-xs' : 'p-2.5 text-xs lg:text-sm'} bg-[#FFFDF8]"
);

// 4. Mailbox svg & container
content = content.replace(
  'className={`relative ${isCompact ? \'w-16 h-16 my-1\' : \'w-28 h-28 my-2\'} flex items-center justify-center`}',
  'className={`relative ${isCompact ? \'w-12 h-12 my-0.5\' : \'w-28 h-28 my-2\'} flex items-center justify-center`}'
);

content = content.replace(
  'width={isCompact ? 54 : 80}\n                  height={isCompact ? 54 : 80}',
  'width={isCompact ? 44 : 80}\n                  height={isCompact ? 44 : 80}'
);

content = content.replace(
  'className={`lg:col-span-4 border-2 border-[#24160B] bg-[#FFFDF8] ${isCompact ? \'p-2.5\' : \'p-4\'}',
  'className={`lg:col-span-4 border-2 border-[#24160B] bg-[#FFFDF8] ${isCompact ? \'p-2\' : \'p-4\'}'
);

content = content.replace(
  'className={`${isCompact ? \'mt-2 pt-2 space-y-1.5\' : \'mt-4 pt-3 space-y-2\'} border-t border-[#24160B]/20 w-full`}',
  'className={`${isCompact ? \'mt-1.5 pt-1.5 space-y-1\' : \'mt-4 pt-3 space-y-2\'} border-t border-[#24160B]/20 w-full`}'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Refined ContactSection.jsx');
