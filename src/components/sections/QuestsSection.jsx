import React, { useState, useEffect } from 'react';
import { Panel } from '../ui/Panel';
import { PixelButton } from '../ui/PixelButton';
import { profile } from '../../content/profile';
import { useDeviceType } from '../../hooks/useMediaQuery';
import { getGitHubRepos } from '../../lib/api';

/**
 * QuestsSection - Quest Log (Section 5 & Mobile Fix Fase 5)
 * - Mobile: Streamlined accordion, closed by default, single open item at a time
 * - Full row tap target (>=44px) with chevron indicator
 * - Max 2 stack chips visible when closed
 * - GitHub live repos: max 3 items + 'Lihat semua di GitHub' button
 */
export function QuestsSection({ isMobile: isMobileProp }) {
  const { isMobile: isMobileDevice } = useDeviceType();
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileDevice;

  // Filter out any quests marked with needsOwnerConfirm (K2)
  const visibleQuests = profile.quests.filter((q) => !q.needsOwnerConfirm);
  const [selectedQuestId, setSelectedQuestId] = useState(visibleQuests[0]?.id || '');
  // Mobile: closed by default per Fase 5
  const [openAccordionId, setOpenAccordionId] = useState('');
  const [liveRepos, setLiveRepos] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getGitHubRepos().then((repos) => {
      if (isMounted && repos && repos.length > 0) {
        setLiveRepos(repos);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedQuest =
    visibleQuests.find((q) => q.id === selectedQuestId) || visibleQuests[0];

  const toggleAccordion = (id) => {
    // Only one accordion open at a time (Fase 5)
    setOpenAccordionId((prev) => (prev === id ? '' : id));
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Panel title="QUEST LOG (PAPAN MISI & PROYEK)" icon="📜" variant="default">
        <p className="text-xs lg:text-sm text-[var(--ink)]/80 mb-4 leading-relaxed">
          Daftar misi teknis yang dikerjakan oleh Naufal Ali Hilmi. Ketuk quest untuk membuka objektif dan tautan repositori.
        </p>

        {isMobile ? (
          /* Mobile: Clean Accordion (Closed by default, no nested box clutter) */
          <div className="divide-y-2 divide-[#24160B]/15 border-2 border-[#24160B] bg-[#FFFDF8]">
            {visibleQuests.map((quest) => {
              const isOpen = openAccordionId === quest.id;
              return (
                <div key={quest.id} className="transition-colors">
                  {/* Entire row is tappable, min-h 48px */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(quest.id)}
                    className="w-full text-left p-3.5 flex items-center justify-between gap-2 min-h-[48px] cursor-pointer active:bg-[#F6EBD3]/60"
                    aria-expanded={isOpen}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-[#E8793A] border border-[#24160B] inline-block flex-shrink-0" />
                        <span className="font-pixel text-sm font-bold text-[#24160B] truncate">
                          {quest.judul}
                        </span>
                      </div>

                      {/* Closed preview: max 2 stack chips & status */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-pixel text-[11px] px-1.5 py-0.5 bg-[#5E8B4A] text-white">
                          {quest.status}
                        </span>
                        {quest.stack.slice(0, 2).map((stk, i) => (
                          <span
                            key={i}
                            className="font-pixel text-[10px] px-1.5 py-0.5 bg-[#F6EBD3] text-[#24160B] border border-[#24160B]/30"
                          >
                            {stk}
                          </span>
                        ))}
                        {quest.stack.length > 2 && (
                          <span className="text-[10px] text-[#24160B]/60 font-pixel">
                            +{quest.stack.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chevron Indicator */}
                    <span className="font-pixel text-xs text-[#3B5E34] font-bold px-1.5 py-1 flex-shrink-0">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Expanded Detail */}
                  {isOpen && (
                    <div className="px-3.5 pb-4 pt-1 space-y-3 font-body text-xs sm:text-sm bg-[#F6EBD3]/30 border-t border-[#24160B]/10">
                      <p className="leading-relaxed text-[#24160B]">
                        {quest.ringkasan}
                      </p>

                      {quest.detail && quest.detail.length > 0 && (
                        <div>
                          <div className="font-pixel text-xs text-[#3B5E34] font-bold mb-1">
                            CAKUPAN TEKNIS & HASIL LAB:
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-xs text-[#24160B]/90 font-body leading-relaxed">
                            {quest.detail.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <div className="font-pixel text-xs text-[#3B5E34] font-bold mb-1">
                          STACK TEKNOLOGI LENGKAP:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {quest.stack.map((stk, i) => (
                            <span
                              key={i}
                              className="font-pixel text-[11px] px-2 py-0.5 bg-[#FFFDF8] border border-[#24160B]/40 shadow-[1px_1px_0_#24160B]"
                            >
                              {stk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {quest.repo ? (
                        <div className="pt-2">
                          <a
                            href={quest.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <button
                              type="button"
                              className="w-full flex items-center justify-center min-h-[44px] px-3 py-2 border-2 border-[#24160B] bg-[#5E8B4A] text-white font-pixel text-xs font-bold shadow-[2px_2px_0_#24160B] active:translate-y-[1px]"
                            >
                              Buka Repositori GitHub &rarr;
                            </button>
                          </a>
                        </div>
                      ) : null}
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
              <div className="font-pixel text-xs font-bold text-[#3B5E34] uppercase tracking-wider pb-1 border-b border-[#24160B]/20">
                Pilih Misi Petualangan
              </div>

              {visibleQuests.map((quest) => {
                const isSelected = selectedQuestId === quest.id;
                return (
                  <button
                    key={quest.id}
                    type="button"
                    onClick={() => setSelectedQuestId(quest.id)}
                    className={`w-full text-left p-3.5 border-2 border-[#24160B] transition-all cursor-pointer select-none flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#5E8B4A] text-white shadow-[3px_3px_0_#24160B] -translate-y-0.5'
                        : 'bg-white text-[#24160B] hover:bg-[#F6EBD3] shadow-[1px_1px_0_#24160B]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-pixel text-sm font-bold flex items-center gap-2">
                        <span>{quest.judul}</span>
                      </div>
                      <div
                        className={`text-[11px] line-clamp-1 ${
                          isSelected ? 'text-white/90' : 'text-[#24160B]/70'
                        }`}
                      >
                        {quest.ringkasan}
                      </div>
                    </div>

                    <span
                      className={`font-pixel text-[10px] px-1.5 py-0.5 border ${
                        isSelected
                          ? 'bg-[#E8793A] text-white border-white'
                          : 'bg-[#F6EBD3] text-[#24160B] border-[#24160B]/40'
                      }`}
                    >
                      {quest.status}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Quest Parchment Detail */}
            <div className="col-span-7 border-2 border-[#24160B] bg-[#FFFDF8] p-5 shadow-[4px_4px_0_#24160B] relative">
              <div className="absolute top-2 right-2 font-pixel text-[10px] px-2 py-0.5 border-2 border-[#E8793A] text-[#E8793A] rotate-3 select-none">
                QUEST LOG #{selectedQuest.id.toUpperCase()}
              </div>

              <div className="border-b-2 border-[#24160B]/20 pb-3 mb-4 pr-24">
                <h3 className="font-pixel text-xl font-bold text-[#24160B]">
                  {selectedQuest.judul}
                </h3>
                <span className="inline-block mt-1 text-xs font-pixel px-2 py-0.5 bg-[#5E8B4A] text-white border border-[#24160B]">
                  STATUS: {selectedQuest.status}
                </span>
              </div>

              <div className="space-y-4 text-sm font-body leading-relaxed">
                <div>
                  <div className="font-pixel text-xs text-[#3B5E34] font-bold mb-1">
                    RINGKASAN MISI:
                  </div>
                  <p className="text-[#24160B]">{selectedQuest.ringkasan}</p>
                </div>

                {selectedQuest.detail && selectedQuest.detail.length > 0 && (
                  <div>
                    <div className="font-pixel text-xs text-[#3B5E34] font-bold mb-1.5">
                      CAKUPAN TEKNIS & HASIL LAB:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-[#24160B]/90 font-body leading-relaxed">
                      {selectedQuest.detail.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <div className="font-pixel text-xs text-[#3B5E34] font-bold mb-1.5">
                    STACK TEKNOLOGI:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedQuest.stack.map((item, i) => (
                      <span
                        key={i}
                        className="font-pixel text-xs px-2 py-1 bg-[#F6EBD3] border-2 border-[#24160B] shadow-[1px_1px_0_#24160B]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-[#24160B]/15 flex items-center justify-between">
                  {selectedQuest.repo ? (
                    <a
                      href={selectedQuest.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <PixelButton variant="primary" size="md">
                        Buka Repositori GitHub &rarr;
                      </PixelButton>
                    </a>
                  ) : null}

                  <span className="text-[11px] font-pixel text-[#24160B]/60">
                    Bisa diverifikasi &bull; No AI Slop
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live GitHub Proxy Activity Ribbon (Max 3 items on mobile + View All button per Fase 5) */}
        {liveRepos.length > 0 && (
          <div className="mt-5 pt-3 border-t-2 border-[#24160B]/20">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-pixel text-xs font-bold text-[#3B5E34] uppercase">
                REPOSITORI GITHUB TERBARU
              </span>
              <a
                href={profile.sosial.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-pixel text-xs text-[#E8793A] hover:underline"
              >
                Lihat Semua &rarr;
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {liveRepos.slice(0, 3).map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border-2 border-[#24160B] bg-[#FFFDF8] hover:bg-[#F6EBD3] shadow-[2px_2px_0_#24160B] block transition-all"
                >
                  <div className="font-pixel text-xs lg:text-sm font-bold text-[#E8793A] truncate">
                    {r.name}
                  </div>
                  <p className="text-xs font-body text-[#24160B]/80 line-clamp-2 my-1">
                    {r.description || 'Repositori publik.'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-pixel text-[#24160B]/70 mt-1">
                    <span>{r.language || 'Code'}</span>
                    <span>★ {r.stars}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

export default QuestsSection;
