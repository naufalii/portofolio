import fs from 'fs';

const filePath = 'src/components/sections/QuestsSection.jsx';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Signature
content = content.replace(
  'export function QuestsSection({ isMobile: isMobileProp }) {',
  'export function QuestsSection({ isMobile: isMobileProp, isCompact = false }) {'
);

// 2. Panel
content = content.replace(
  '<Panel title="QUEST LOG (PAPAN MISI & PROYEK)" icon="📜" variant="default">',
  '<Panel title="QUEST LOG (PAPAN MISI & PROYEK)" icon="📜" variant="default" isCompact={isCompact}>'
);

// 3. Subtitle
content = content.replace(
  '<p className="text-xs lg:text-sm text-[var(--ink)]/80 mb-4 leading-relaxed">',
  '<p className={`${isCompact ? \'text-xs mb-2.5 line-clamp-1\' : \'text-xs lg:text-sm mb-4\'} text-[var(--ink)]/80 leading-relaxed`}>'
);

// 4. Two-column grid
content = content.replace(
  '<div className="grid grid-cols-12 gap-6 items-start">',
  '<div className={`grid grid-cols-12 ${isCompact ? \'gap-3.5\' : \'gap-6\'} items-start`}>'
);

// 5. Left column container
content = content.replace(
  '<div className="col-span-5 space-y-2.5">',
  '<div className={`col-span-5 ${isCompact ? \'space-y-1.5\' : \'space-y-2.5\'}`}>'
);

// 6. Left column button padding
content = content.replace(
  'className={`w-full text-left p-3.5 border-2 border-[#24160B] transition-all cursor-pointer select-none flex items-center justify-between ${',
  'className={`w-full text-left ${isCompact ? \'p-2\' : \'p-3.5\'} border-2 border-[#24160B] transition-all cursor-pointer select-none flex items-center justify-between ${'
);

// 7. Right column container
content = content.replace(
  '<div className="col-span-7 border-2 border-[#24160B] bg-[#FFFDF8] p-5 shadow-[4px_4px_0_#24160B] relative">',
  '<div className={`col-span-7 border-2 border-[#24160B] bg-[#FFFDF8] ${isCompact ? \'p-3 shadow-[3px_3px_0_#24160B]\' : \'p-5 shadow-[4px_4px_0_#24160B]\'} relative`}>'
);

// 8. Right column header
content = content.replace(
  '<div className="border-b-2 border-[#24160B]/20 pb-3 mb-4 pr-24">',
  '<div className={`border-b-2 border-[#24160B]/20 ${isCompact ? \'pb-1.5 mb-2.5 pr-20\' : \'pb-3 mb-4 pr-24\'}`}>'
);

// 9. Right column title
content = content.replace(
  '<h3 className="font-pixel text-xl font-bold text-[#24160B]">',
  '<h3 className={`font-pixel ${isCompact ? \'text-base\' : \'text-xl\'} font-bold text-[#24160B]`}>'
);

// 10. Right column body spacing
content = content.replace(
  '<div className="space-y-4 text-sm font-body leading-relaxed">',
  '<div className={`${isCompact ? \'space-y-2 text-xs\' : \'space-y-4 text-sm\'} font-body leading-relaxed`}>'
);

// 11. Right column tech bullets
content = content.replace(
  '<ul className="list-disc list-inside space-y-1 text-xs text-[#24160B]/90 font-body leading-relaxed">',
  '<ul className={`list-disc list-inside ${isCompact ? \'space-y-0.5 text-[11px]\' : \'space-y-1 text-xs\'} text-[#24160B]/90 font-body leading-relaxed`}>'
);

// 12. Repo button
content = content.replace(
  '<PixelButton variant="primary" size="md">',
  '<PixelButton variant="primary" size={isCompact ? "sm" : "md"}>'
);

// 13. GitHub ribbon margin
content = content.replace(
  '<div className="mt-5 pt-3 border-t-2 border-[#24160B]/20">',
  '<div className={`${isCompact ? \'mt-3 pt-2\' : \'mt-5 pt-3\'} border-t-2 border-[#24160B]/20`}>'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated QuestsSection.jsx');
