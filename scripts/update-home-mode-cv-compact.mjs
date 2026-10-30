import fs from 'fs';

const filePath = 'src/pages/Home.jsx';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Compact header button font & label
const oldCompactBtn = `<Link to="/cv">
                  <button
                    type="button"
                    className="flex items-center justify-center px-2 py-0.5 border-2 border-[#24160B] bg-[#FFFDF8] text-[#24160B] shadow-[2px_2px_0_#24160B] active:translate-y-[1px] active:shadow-none font-pixel text-xs font-bold cursor-pointer hover:bg-[#F6EBD3]"
                    title="Buka Mode CV"
                    aria-label="Mode CV"
                  >
                    MODE CV
                  </button>
                </Link>`;

const newCompactBtn = `<Link to="/cv">
                  <button
                    type="button"
                    className="flex items-center justify-center px-2 py-0.5 border-2 border-[#24160B] bg-[#FFFDF8] text-[#24160B] shadow-[2px_2px_0_#24160B] active:translate-y-[1px] active:shadow-none font-alt-pixel text-xs font-bold cursor-pointer hover:bg-[#F6EBD3]"
                    title="Buka Mode CV"
                    aria-label="Mode CV"
                  >
                    Mode CV
                  </button>
                </Link>`;

content = content.replace(oldCompactBtn, newCompactBtn);

// 2. Standard header button text
const oldStandardBtn = `<Link to="/cv">
                  <PixelButton
                    variant="secondary"
                    size="sm"
                    aria-label="Mode CV"
                    title="Lihat sebagai dokumen CV linear standar"
                  >
                    MODE CV
                  </PixelButton>
                </Link>`;

const newStandardBtn = `<Link to="/cv">
                  <PixelButton
                    variant="secondary"
                    size="sm"
                    aria-label="Mode CV"
                    title="Lihat sebagai dokumen CV linear standar"
                  >
                    Mode CV
                  </PixelButton>
                </Link>`;

content = content.replace(oldStandardBtn, newStandardBtn);

// 3. Update active section container & pass isCompact
const oldActiveSec = `<div
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
                  >
                    <LocationSectionContent
                      locId={panelLocation}
                      onStartExplore={() => goTo('quests', 'cta')}
                      isMobile={false}
                    />
                  </div>`;

const newActiveSec = `<div
                    id={\`active-section-\${panelLocation}\`}
                    tabIndex={0}
                    className="outline-none pixel-scrollbar"
                    style={
                      worldLayout.isCompact
                        ? {
                            maxHeight: \`calc(100dvh - \${worldLayout.dialogTop}px - 8px)\`,
                            overflowY: 'auto',
                          }
                        : undefined
                    }
                  >
                    <LocationSectionContent
                      locId={panelLocation}
                      onStartExplore={() => goTo('quests', 'cta')}
                      isMobile={false}
                      isCompact={worldLayout.isCompact}
                    />
                  </div>`;

content = content.replace(oldActiveSec, newActiveSec);

// 4. Update LocationSectionContent signature & mapping
const oldLocContent = `function LocationSectionContent({ locId, onStartExplore, isMobile }) {
  switch (locId) {
    case 'hero':
      return <HeroSection onStartExplore={onStartExplore} isMobile={isMobile} />;

    case 'quests':
      return <QuestsSection isMobile={isMobile} />;

    case 'skills':
      return <SkillTreeSection isMobile={isMobile} />;

    case 'guild':
      return <GuildSection isMobile={isMobile} />;

    case 'contact':
      return isMobile ? <ContactSection defaultTab="contact" isMobile={true} /> : <ContactSection isMobile={false} />;

    case 'guestbook':
      return isMobile ? <ContactSection defaultTab="guestbook" isMobile={true} /> : <GuestbookSection />;

    default:
      return null;
  }
}`;

const newLocContent = `function LocationSectionContent({ locId, onStartExplore, isMobile, isCompact = false }) {
  switch (locId) {
    case 'hero':
      return <HeroSection onStartExplore={onStartExplore} isMobile={isMobile} isCompact={isCompact} />;

    case 'quests':
      return <QuestsSection isMobile={isMobile} isCompact={isCompact} />;

    case 'skills':
      return <SkillTreeSection isMobile={isMobile} isCompact={isCompact} />;

    case 'guild':
      return <GuildSection isMobile={isMobile} isCompact={isCompact} />;

    case 'contact':
      return isMobile ? <ContactSection defaultTab="contact" isMobile={true} /> : <ContactSection isMobile={false} isCompact={isCompact} />;

    case 'guestbook':
      return isMobile ? <ContactSection defaultTab="guestbook" isMobile={true} /> : <GuestbookSection isCompact={isCompact} />;

    default:
      return null;
  }
}`;

content = content.replace(oldLocContent, newLocContent);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated Home.jsx');
