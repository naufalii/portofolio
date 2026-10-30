import fs from 'fs';

const filePath = 'src/components/sections/GuestbookSection.jsx';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Signature
content = content.replace(
  'export function GuestbookSection() {',
  'export function GuestbookSection({ isCompact = false }) {'
);

// 2. Panel isCompact
content = content.replace(
  '<Panel title="PAPAN PESAN PETUALANG (GUESTBOOK)" variant="default">',
  '<Panel title="PAPAN PESAN PETUALANG (GUESTBOOK)" variant="default" isCompact={isCompact}>'
);

// 3. Subtitle
content = content.replace(
  '<p className="text-xs lg:text-sm text-[var(--ink)]/80 mb-5 leading-relaxed">',
  '<p className={`${isCompact ? \'text-xs mb-2 line-clamp-1\' : \'text-xs lg:text-sm mb-5\'} text-[var(--ink)]/80 leading-relaxed`}>'
);

// 4. Grid
content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">',
  '<div className={`grid grid-cols-1 lg:grid-cols-12 ${isCompact ? \'gap-3\' : \'gap-6\'} items-start`}>'
);

// 5. Left column container
content = content.replace(
  '<div className="lg:col-span-5 border-2 border-[var(--ink)] bg-[var(--cloud)] p-4 shadow-[3px_3px_0_var(--ink)]">',
  '<div className={`lg:col-span-5 border-2 border-[var(--ink)] bg-[var(--cloud)] ${isCompact ? \'p-2.5 shadow-[2px_2px_0_var(--ink)]\' : \'p-4 shadow-[3px_3px_0_var(--ink)]\'}`}>'
);

// 6. Left column header
content = content.replace(
  '<h3 className="font-pixel text-xs lg:text-sm font-bold text-[var(--sunset)] uppercase border-b-2 border-[var(--ink)] pb-1 mb-3">',
  '<h3 className={`font-pixel text-xs lg:text-sm font-bold text-[var(--sunset)] uppercase border-b-2 border-[var(--ink)] ${isCompact ? \'pb-0.5 mb-2\' : \'pb-1 mb-3\'}`}>'
);

// 7. Form spacing
content = content.replace(
  '<form onSubmit={handleSubmit} className="space-y-3" noValidate>',
  '<form onSubmit={handleSubmit} className={isCompact ? "space-y-2" : "space-y-3"} noValidate>'
);

// 8. Name input
content = content.replace(
  'className="w-full p-2 bg-[var(--cream)] border-2 border-[var(--ink)] font-body text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sunset)]"',
  'className={`w-full ${isCompact ? \'p-1.5 text-xs\' : \'p-2 text-xs lg:text-sm\'} bg-[var(--cream)] border-2 border-[var(--ink)] font-body focus:outline-none focus:ring-2 focus:ring-[var(--sunset)]`}'
);

// 9. Textarea
content = content.replace(
  'rows={4}\n                  maxLength={500}\n                  value={formData.message}\n                  onChange={handleChange}\n                  placeholder="Tinggalkan pesan di papan..."\n                  className="w-full p-2 bg-[var(--cream)] border-2 border-[var(--ink)] font-body text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sunset)] resize-none"',
  'rows={isCompact ? 2 : 4}\n                  maxLength={500}\n                  value={formData.message}\n                  onChange={handleChange}\n                  placeholder="Tinggalkan pesan di papan..."\n                  className={`w-full ${isCompact ? \'p-1.5 text-xs\' : \'p-2 text-xs lg:text-sm\'} bg-[var(--cream)] border-2 border-[var(--ink)] font-body focus:outline-none focus:ring-2 focus:ring-[var(--sunset)] resize-none`}'
);

// 10. Button
content = content.replace(
  'size="md"\n                  disabled={submitting}',
  'size={isCompact ? "sm" : "md"}\n                  disabled={submitting}'
);

// 11. Sticky notes grid
content = content.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">',
  '<div className={`grid grid-cols-1 sm:grid-cols-2 ${isCompact ? \'gap-2 max-h-[175px]\' : \'gap-3 max-h-[460px]\'} overflow-y-auto pixel-scrollbar pr-1`}>'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated GuestbookSection.jsx');
