import fs from 'fs';

const filePath = 'src/components/sections/SkillTreeSection.jsx';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Signature
content = content.replace(
  'export function SkillTreeSection({ isMobile = false }) {',
  'export function SkillTreeSection({ isMobile = false, isCompact = false }) {'
);

// 2. Panel
content = content.replace(
  '<Panel title="SKILL TREE (AKADEMI KEAHLIAN TEKNIS)" icon="⚡" variant="default">',
  '<Panel title="SKILL TREE (AKADEMI KEAHLIAN TEKNIS)" icon="⚡" variant="default" isCompact={isCompact}>'
);

// 3. Branch tabs
content = content.replace(
  '<div className="flex flex-wrap gap-2 border-b-2 border-[#24160B]/20 pb-3 mb-4 select-none">',
  '<div className={`flex flex-wrap ${isCompact ? \'gap-1.5 pb-2 mb-2.5\' : \'gap-2 border-b-2 border-[#24160B]/20 pb-3 mb-4\'} select-none`}>'
);

// 4. Branch buttons
content = content.replace(
  'className={`flex items-center gap-2 px-3 py-2 font-pixel text-xs lg:text-sm border-2 border-[#24160B] transition-all cursor-pointer select-none min-h-[44px] ${',
  'className={`flex items-center gap-1.5 ${isCompact ? \'px-2 py-1 min-h-[32px] text-xs\' : \'px-3 py-2 min-h-[44px] text-xs lg:text-sm\'} border-2 border-[#24160B] transition-all cursor-pointer select-none ${'
);

// 5. Grid
content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">',
  '<div className={`grid grid-cols-1 lg:grid-cols-12 ${isCompact ? \'gap-3.5\' : \'gap-6\'} items-start`}>'
);

// 6. Left column container
content = content.replace(
  '<div className="lg:col-span-7 space-y-3">',
  '<div className={`lg:col-span-7 ${isCompact ? \'space-y-1.5\' : \'space-y-3\'}`}>'
);

// 7. Skills list container
content = content.replace(
  '<div className="space-y-2.5">\n                  {currentBranchData.skills.map((skill, index) => {',
  '<div className={`${isCompact ? \'space-y-1.5 max-h-[175px] overflow-y-auto pixel-scrollbar pr-1\' : \'space-y-2.5\'}`}>\n                  {currentBranchData.skills.map((skill, index) => {'
);

// 8. Skill button padding
content = content.replace(
  'className={`w-full text-left p-3 border-2 border-[#24160B] transition-all cursor-pointer flex flex-col justify-between ${',
  'className={`w-full text-left ${isCompact ? \'p-2\' : \'p-3\'} border-2 border-[#24160B] transition-all cursor-pointer flex flex-col justify-between ${'
);

// 9. Right column container
content = content.replace(
  '<div className="lg:col-span-5 border-2 border-[#24160B] bg-[#FFFDF8] p-5 shadow-[4px_4px_0_#24160B]">',
  '<div className={`lg:col-span-5 border-2 border-[#24160B] bg-[#FFFDF8] ${isCompact ? \'p-3 shadow-[3px_3px_0_#24160B]\' : \'p-5 shadow-[4px_4px_0_#24160B]\'}`}>'
);

// 10. Right column title
content = content.replace(
  '<h4 className="font-pixel text-lg font-bold text-[#24160B]">',
  '<h4 className={`font-pixel ${isCompact ? \'text-sm\' : \'text-lg\'} font-bold text-[#24160B]`}>'
);

// 11. Right column note
content = content.replace(
  '<div className="bg-[#F6EBD3] p-2.5 border border-[#24160B]/30 text-[11px] font-pixel text-[#24160B]/80 mt-4">',
  '<div className={`bg-[#F6EBD3] ${isCompact ? \'p-1.5 text-[10px] mt-2\' : \'p-2.5 text-[11px] mt-4\'} border border-[#24160B]/30 font-pixel text-[#24160B]/80`}>'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated SkillTreeSection.jsx');
