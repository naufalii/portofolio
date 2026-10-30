import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// 1. Replace desktop header
const oldHeader = `        /* Desktop Header: Two Panels (Panel 1: Identity & Controls, Panel 2: Peta Overworld per c383241) */
        <header className="relative z-30 w-full p-4 lg:p-5 flex flex-col gap-3">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between border-4 border-[#24160B] bg-[#F6EBD3] px-4 py-2.5 shadow-[4px_4px_0_#24160B]">
            <div className="flex items-center gap-3">
              <div>
                <span className="font-pixel text-base lg:text-lg font-bold tracking-wider block leading-tight text-[#24160B]">
                  {profile.nama}
                </span>
                <span className="font-body text-xs text-[#24160B]/80 font-bold block">
                  {profile.homeTagline}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AudioPlayer />

              <DayNightIndicator
                phase={phase}
                onSelectPhase={setManualOverride}
                isManual={isManual}
              />

              <Link to="/cv">
                <PixelButton
                  variant="secondary"
                  size="sm"
                  aria-label="Mode CV"
                  title="Lihat sebagai dokumen CV linear standar"
                >
                  MODE CV
                </PixelButton>
              </Link>
            </div>
          </div>

          {/* Overworld Map Navigation Bar (Desktop) */}
          <OverworldMapNav
            activeLocation={currentLocation}
            targetLocation={targetLocation}
            onSelectLocation={(id, src) => goTo(id, src || 'nav')}
            isMobile={false}
          />
        </header>`;

const newHeader = `        /* Desktop Header: Two Panels (Standard: 208px, Compact: <= 96px per D2) */
        <header
          className={\`relative z-30 w-full flex flex-col \${
            worldLayout.isCompact
              ? 'px-4 pt-1.5 pb-1 gap-1 max-w-5xl mx-auto'
              : 'p-4 lg:p-5 gap-3'
          }\`}
        >
          {worldLayout.isCompact ? (
            /* Row 1 for Compact Desktop: Identity + Controls (thin row <= 44px) */
            <div className="w-full flex items-center justify-between border-2 border-[#24160B] bg-[#F6EBD3] px-3 py-1 shadow-[2px_2px_0_#24160B] min-h-[36px]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 bg-[#5E8B4A] border border-[#24160B] inline-block shadow-[1px_1px_0_#24160B] flex-shrink-0" />
                <span className="font-pixel text-sm font-bold tracking-wider text-[#24160B] whitespace-nowrap">
                  {profile.nama}
                </span>
                <span className="text-[#24160B]/40 font-normal">|</span>
                <span className="font-body text-xs text-[#24160B]/80 font-bold truncate max-w-xs md:max-w-md">
                  {profile.homeTagline}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <AudioPlayer />

                <DayNightIndicator
                  phase={phase}
                  onSelectPhase={setManualOverride}
                  isManual={isManual}
                />

                <Link to="/cv">
                  <button
                    type="button"
                    className="flex items-center justify-center px-2 py-0.5 border-2 border-[#24160B] bg-[#FFFDF8] text-[#24160B] shadow-[2px_2px_0_#24160B] active:translate-y-[1px] active:shadow-none font-pixel text-xs font-bold cursor-pointer hover:bg-[#F6EBD3]"
                    title="Buka Mode CV"
                    aria-label="Mode CV"
                  >
                    MODE CV
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto flex items-center justify-between border-4 border-[#24160B] bg-[#F6EBD3] px-4 py-2.5 shadow-[4px_4px_0_#24160B]">
              <div className="flex items-center gap-3">
                <div>
                  <span className="font-pixel text-base lg:text-lg font-bold tracking-wider block leading-tight text-[#24160B]">
                    {profile.nama}
                  </span>
                  <span className="font-body text-xs text-[#24160B]/80 font-bold block">
                    {profile.homeTagline}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <AudioPlayer />

                <DayNightIndicator
                  phase={phase}
                  onSelectPhase={setManualOverride}
                  isManual={isManual}
                />

                <Link to="/cv">
                  <PixelButton
                    variant="secondary"
                    size="sm"
                    aria-label="Mode CV"
                    title="Lihat sebagai dokumen CV linear standar"
                  >
                    MODE CV
                  </PixelButton>
                </Link>
              </div>
            </div>
          )}

          {/* Overworld Map Navigation Bar (Desktop) */}
          <OverworldMapNav
            activeLocation={currentLocation}
            targetLocation={targetLocation}
            onSelectLocation={(id, src) => goTo(id, src || 'nav')}
            isMobile={false}
            isCompact={worldLayout.isCompact}
          />
        </header>`;

// Normalize CRLF to LF for matching
const norm = (s) => s.replace(/\r\n/g, '\n');

if (norm(content).includes(norm(oldHeader))) {
  // Replace matching normalized block
  const lines = content.split(/\r?\n/);
  const oldHeaderLines = oldHeader.split(/\r?\n/);
  const startIdx = lines.findIndex(l => l.includes('/* Desktop Header: Two Panels'));
  if (startIdx !== -1) {
    const endIdx = startIdx + oldHeaderLines.length;
    lines.splice(startIdx, oldHeaderLines.length, ...newHeader.split('\n'));
    content = lines.join('\r\n');
    console.log('Desktop header replaced successfully!');
  }
} else {
  console.error('Could not find oldHeader in Home.jsx');
}

// 2. Add style with max-height and overflow-y to active section container in Home.jsx
const oldSectionDiv = `                  <div
                    id={\`active-section-\${panelLocation}\`}
                    tabIndex={-1}
                    className="outline-none"
                  >`;

const newSectionDiv = `                  <div
                    id={\`active-section-\${panelLocation}\`}
                    tabIndex={-1}
                    className="outline-none"
                    style={
                      worldLayout.isCompact
                        ? {
                            maxHeight: \`calc(100dvh - \${worldLayout.dialogTop}px - 8px)\`,
                            overflowY: 'auto',
                          }
                        : undefined
                    }
                  >`;

if (norm(content).includes(norm(oldSectionDiv))) {
  const lines = content.split(/\r?\n/);
  const startIdx = lines.findIndex(l => l.includes('id={`active-section-${panelLocation}`}') && lines[l - 1]?.includes('<div'));
  if (startIdx !== -1) {
    lines.splice(startIdx - 1, 4, ...newSectionDiv.split('\n'));
    content = lines.join('\r\n');
    console.log('Section div replaced successfully!');
  }
}

fs.writeFileSync('src/pages/Home.jsx', content, 'utf8');
console.log('src/pages/Home.jsx updated.');
