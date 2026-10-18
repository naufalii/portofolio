import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { PixelButton } from '../ui/PixelButton';
import { profile } from '../../content/profile';
import { useDeviceType } from '../../hooks/useMediaQuery';

/**
 * QuestsSection - Quest Log (Section 5)
 * Desktop: Quest list on the left, full quest parchment detail on the right.
 * Mobile: Interactive accordion cards.
 * Data source strictly from profile.js.
 */
export function QuestsSection() {
  const { isMobile } = useDeviceType();
  const [selectedQuestId, setSelectedQuestId] = useState(profile.quests[0]?.id || '');
  const [openAccordionId, setOpenAccordionId] = useState(profile.quests[0]?.id || '');

  const selectedQuest =
    profile.quests.find((q) => q.id === selectedQuestId) || profile.quests[0];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Panel title="QUEST LOG (PAPAN MISI & PROYEK)" variant="default">
        <p className="text-xs sm:text-sm text-[var(--ink)]/80 mb-4">
          Daftar quest teknis yang dikerjakan oleh Naufal Ali Hilmi. Pilih salah satu quest untuk melihat rincian objektif, teknologi yang digunakan, serta tautan repositori.
        </p>

        {isMobile ? (
          /* Mobile: Accordion Cards */
          <div className="space-y-3">
            {profile.quests.map((quest) => {
              const isOpen = openAccordionId === quest.id;
              return (
                <div
                  key={quest.id}
                  className="border-2 border-[var(--ink)] bg-[var(--cloud)] shadow-[2px_2px_0_var(--ink)] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenAccordionId(isOpen ? '' : quest.id)}
                    className="w-full text-left p-3 flex items-center justify-between bg-[var(--cream)] border-b border-[var(--ink)]/20 cursor-pointer min-h-[44px]"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[var(--sunset)] border border-[var(--ink)] inline-block" />
                      <span className="font-pixel text-sm font-bold text-[var(--ink)]">
                        {quest.judul}
                      </span>
                    </div>
                    <span className="text-xs font-pixel text-[var(--moss-dark)] font-bold">
                      {isOpen ? '▲ TUTUP' : '▼ DETAIL'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="p-4 space-y-3 font-body text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-pixel px-2 py-0.5 bg-[var(--moss)] text-[var(--cloud)] border border-[var(--ink)]">
                          STATUS: {quest.status}
                        </span>
                      </div>

                      <p className="leading-relaxed">{quest.ringkasan}</p>

                      <div>
                        <div className="font-pixel text-xs text-[var(--ink)]/70 mb-1">
                          STACK TEKNOLOGI:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {quest.stack.map((stk, i) => (
                            <span
                              key={i}
                              className="font-pixel text-[10px] px-2 py-0.5 bg-[var(--cream)] border border-[var(--ink)]/30"
                            >
                              {stk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {quest.repo && quest.repo !== 'TODO_OWNER' ? (
                        <div className="pt-1">
                          <a
                            href={quest.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <PixelButton variant="primary" size="sm">
                              Buka Repositori GitHub &rarr;
                            </PixelButton>
                          </a>
                        </div>
                      ) : (
                        <div className="text-[11px] font-pixel text-[var(--ink)]/60 italic">
                          Repositori: TODO_OWNER
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop: Two-Column Quest Log */
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left Column: Quest Index */}
            <div className="col-span-5 space-y-2.5">
              <div className="font-pixel text-xs font-bold text-[var(--moss-dark)] uppercase tracking-wider pb-1 border-b border-[var(--ink)]/20">
                Pilih Misi Petualangan
              </div>

              {profile.quests.map((quest) => {
                const isSelected = selectedQuestId === quest.id;
                return (
                  <button
                    key={quest.id}
                    type="button"
                    onClick={() => setSelectedQuestId(quest.id)}
                    className={`w-full text-left p-3.5 border-2 border-[var(--ink)] transition-all cursor-pointer select-none flex items-center justify-between ${
                      isSelected
                        ? 'bg-[var(--moss)] text-[var(--cloud)] shadow-[3px_3px_0_var(--ink)] -translate-y-0.5'
                        : 'bg-[var(--cloud)] text-[var(--ink)] hover:bg-[var(--cream)] shadow-[1px_1px_0_var(--ink)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-pixel text-sm font-bold flex items-center gap-2">
                        <span>{quest.judul}</span>
                      </div>
                      <div
                        className={`text-[11px] line-clamp-1 ${
                          isSelected ? 'text-[var(--cloud)]/90' : 'text-[var(--ink)]/70'
                        }`}
                      >
                        {quest.ringkasan}
                      </div>
                    </div>

                    <span
                      className={`font-pixel text-[10px] px-1.5 py-0.5 border ${
                        isSelected
                          ? 'bg-[var(--sunset)] text-[var(--cloud)] border-[var(--cloud)]'
                          : 'bg-[var(--cream)] text-[var(--ink)] border-[var(--ink)]/40'
                      }`}
                    >
                      {quest.status}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Quest Parchment Detail */}
            <div className="col-span-7 border-2 border-[var(--ink)] bg-[#FFFDF7] p-5 shadow-[4px_4px_0_var(--ink)] relative">
              {/* Corner stamps */}
              <div className="absolute top-2 right-2 font-pixel text-[10px] px-2 py-0.5 border-2 border-[var(--sunset)] text-[var(--sunset)] rotate-3 select-none">
                QUEST LOG #{selectedQuest.id.toUpperCase()}
              </div>

              <div className="border-b-2 border-[var(--ink)]/20 pb-3 mb-4 pr-24">
                <h3 className="font-pixel text-xl font-bold text-[var(--ink)]">
                  {selectedQuest.judul}
                </h3>
                <span className="inline-block mt-1 text-xs font-pixel px-2 py-0.5 bg-[var(--moss)] text-[var(--cloud)] border border-[var(--ink)]">
                  STATUS: {selectedQuest.status}
                </span>
              </div>

              <div className="space-y-4 text-sm font-body leading-relaxed">
                <div>
                  <div className="font-pixel text-xs text-[var(--moss-dark)] font-bold mb-1">
                    RINGKASAN MISI:
                  </div>
                  <p className="text-[var(--ink)]">{selectedQuest.ringkasan}</p>
                </div>

                <div>
                  <div className="font-pixel text-xs text-[var(--moss-dark)] font-bold mb-1.5">
                    STACK TEKNOLOGI:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedQuest.stack.map((item, i) => (
                      <span
                        key={i}
                        className="font-pixel text-xs px-2 py-1 bg-[var(--cream)] border-2 border-[var(--ink)] shadow-[1px_1px_0_var(--ink)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-[var(--ink)]/15 flex items-center justify-between">
                  {selectedQuest.repo && selectedQuest.repo !== 'TODO_OWNER' ? (
                    <a
                      href={selectedQuest.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PixelButton variant="primary" size="md">
                        Buka Repositori GitHub &rarr;
                      </PixelButton>
                    </a>
                  ) : (
                    <span className="font-pixel text-xs text-[var(--ink)]/60 italic">
                      Repositori: Menunggu input pemilik (TODO_OWNER)
                    </span>
                  )}

                  <span className="text-[11px] font-pixel text-[var(--ink)]/60">
                    Bisa diverifikasi &bull; No AI Slop
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

export default QuestsSection;
