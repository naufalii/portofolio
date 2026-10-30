import React, { useState, useEffect } from 'react';
import { Panel } from '../ui/Panel';
import { PixelButton } from '../ui/PixelButton';
import { profile } from '../../content/profile';
import { useDeviceType } from '../../hooks/useMediaQuery';
import { useSectionPagination } from '../../hooks/useSectionPagination';
import { getGitHubRepos } from '../../lib/api';

/**
 * QuestsSection - Quest Log (Papan Misi & Proyek)
 * Follows Bagian 1, 2, 3 of Desktop Pagination Specification:
 * - Desktop: Paginated per item (Quest parchment cards and GitHub activity ribbon)
 * - Greedy DOM-driven height packing ensures no cut cards and zero internal scroll
 * - Mobile: Unchanged vertical accordion (closed by default per Fase 5)
 */
export function QuestsSection({ isMobile: isMobileProp, isDesktop: isDesktopProp, isCompact = false }) {
  const { isMobile: isMobileDevice } = useDeviceType();
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileDevice;
  const isDesktop = isDesktopProp !== undefined ? isDesktopProp : !isMobile;

  // Filter out any quests marked with needsOwnerConfirm
  const visibleQuests = profile.quests.filter((q) => !q.needsOwnerConfirm);
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

  // Items for desktop pagination: each quest is an item + github activity ribbon is an item
  const desktopItems = [
    ...visibleQuests.map((q) => ({ ...q, type: 'quest', estimatedHeight: isCompact ? 160 : 200 })),
    { id: 'github-activity', type: 'github', estimatedHeight: isCompact ? 130 : 160 },
  ];

  const pagination = useSectionPagination(desktopItems, isDesktop, {
    sectionKey: 'quests',
    reservedHeight: isCompact ? 100 : 120,
    minItemHeight: 120,
  });

  const toggleAccordion = (id) => {
    setOpenAccordionId((prev) => (prev === id ? '' : id));
  };

  return (
    <div className="space-y-2 max-w-5xl mx-auto" ref={pagination.containerRef}>
      <Panel
        title="QUEST LOG (PAPAN MISI & PROYEK)"
        icon="📜"
        variant="default"
        isCompact={isCompact}
      >
        <p className={`${isCompact ? 'text-xs mb-2 line-clamp-1' : 'text-xs lg:text-sm mb-4'} text-[var(--ink)]/80 leading-relaxed`}>
          Daftar misi teknis yang dikerjakan oleh Naufal Ali Hilmi. Ketuk quest untuk membuka objektif dan tautan repositori.
        </p>

        {isMobile ? (
          /* Mobile: Clean Accordion (Closed by default, no nested box clutter) */
          <>
            <div className="divide-y-2 divide-[#24160B]/15 border-2 border-[#24160B] bg-[#FFFDF8]">
              {visibleQuests.map((quest) => {
                const isOpen = openAccordionId === quest.id;
                return (
                  <div key={quest.id} className="transition-colors">
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

                      <span className="font-pixel text-xs text-[#3B5E34] font-bold px-1.5 py-1 flex-shrink-0">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="p-3.5 bg-[#F6EBD3]/30 border-t border-[#24160B]/15 space-y-3 font-body text-xs text-[#24160B] leading-relaxed">
                        <div>
                          <div className="font-pixel text-[11px] text-[#3B5E34] font-bold mb-0.5">
                            RINGKASAN MISI:
                          </div>
                          <p>{quest.ringkasan}</p>
                        </div>

                        {quest.detail && quest.detail.length > 0 && (
                          <div>
                            <div className="font-pixel text-[11px] text-[#3B5E34] font-bold mb-0.5">
                              CAKUPAN TEKNIS:
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-xs text-[#24160B]/90">
                              {quest.detail.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <div className="font-pixel text-[11px] text-[#3B5E34] font-bold mb-0.5">
                            STACK TEKNOLOGI LENGKAP:
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {quest.stack.map((item, i) => (
                              <span
                                key={i}
                                className="font-pixel text-[10px] px-1.5 py-0.5 bg-[#F6EBD3] border border-[#24160B]/40"
                              >
                                {item}
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
                              className="inline-block"
                            >
                              <button
                                type="button"
                                className="px-3 py-1.5 border-2 border-[#24160B] bg-[#E8793A] text-white font-pixel text-xs font-bold shadow-[2px_2px_0_#24160B] active:translate-y-[1px] active:shadow-none cursor-pointer"
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

            {/* Live GitHub Proxy Activity Ribbon (Mobile) */}
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
          </>
        ) : (
          /* Desktop View: Paginated Items (Quest Parchments & GitHub Activity) */
          <div className="space-y-3">
            {pagination.currentItems.map((item) => {
              if (item.type === 'github') {
                return (
                  <div
                    key="github-activity"
                    data-page-item-id="github-activity"
                    className={`border-2 border-[#24160B] bg-[#FFFDF8] ${
                      isCompact ? 'p-2.5' : 'p-3.5'
                    } shadow-[3px_3px_0_#24160B]`}
                  >
                    <div className="flex items-center justify-between mb-2">
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {(liveRepos.length > 0
                        ? liveRepos.slice(0, 3)
                        : [
                            {
                              name: 'oracle-dataguard-automation',
                              description: 'Automated scripts for Oracle 19c Data Guard setup and failover monitoring.',
                              language: 'Shell / SQL',
                              stars: 1,
                              url: profile.sosial.github,
                            },
                            {
                              name: 'overworld-portfolio',
                              description: 'Retro 8-bit interactive developer portfolio built with React & Canvas.',
                              language: 'JavaScript',
                              stars: 2,
                              url: profile.sosial.github,
                            },
                            {
                              name: 'linux-system-benchmarks',
                              description: 'Performance benchmarking and system tuning scripts for enterprise Linux.',
                              language: 'Python',
                              stars: 1,
                              url: profile.sosial.github,
                            },
                          ]
                      ).map((r, i) => (
                        <a
                          key={i}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 border-2 border-[#24160B] bg-[#FFFDF8] hover:bg-[#F6EBD3] shadow-[2px_2px_0_#24160B] block transition-all"
                        >
                          <div className="font-pixel text-xs font-bold text-[#E8793A] truncate">
                            {r.name}
                          </div>
                          <p className="text-[11px] font-body text-[#24160B]/80 line-clamp-2 my-1">
                            {r.description}
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-pixel text-[#24160B]/70 mt-1">
                            <span>{r.language || 'Code'}</span>
                            <span>★ {r.stars}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }

              // Quest Parchment Card
              const quest = item;
              return (
                <div
                  key={quest.id}
                  data-page-item-id={quest.id}
                  className={`border-2 border-[#24160B] bg-[#FFFDF8] ${
                    isCompact ? 'p-3 shadow-[3px_3px_0_#24160B]' : 'p-5 shadow-[4px_4px_0_#24160B]'
                  } relative`}
                >
                  <div className="absolute top-2 right-2 font-pixel text-[10px] px-2 py-0.5 border-2 border-[#E8793A] text-[#E8793A] rotate-2 select-none">
                    QUEST #{quest.id.toUpperCase()}
                  </div>

                  <div className={`border-b-2 border-[#24160B]/20 ${isCompact ? 'pb-1.5 mb-2 pr-20' : 'pb-2 mb-3 pr-24'}`}>
                    <h3 className={`font-pixel ${isCompact ? 'text-sm' : 'text-lg'} font-bold text-[#24160B]`}>
                      {quest.judul}
                    </h3>
                    <span className="inline-block mt-1 text-[11px] font-pixel px-2 py-0.5 bg-[#5E8B4A] text-white border border-[#24160B]">
                      STATUS: {quest.status}
                    </span>
                  </div>

                  <div className={`${isCompact ? 'space-y-2 text-xs' : 'space-y-3 text-sm'} font-body leading-relaxed`}>
                    <div>
                      <div className="font-pixel text-xs text-[#3B5E34] font-bold mb-0.5">
                        RINGKASAN MISI:
                      </div>
                      <p className="text-[#24160B] line-clamp-2">{quest.ringkasan}</p>
                    </div>

                    {quest.detail && quest.detail.length > 0 && (
                      <div>
                        <div className="font-pixel text-xs text-[#3B5E34] font-bold mb-1">
                          CAKUPAN TEKNIS & HASIL LAB:
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-xs text-[#24160B]/90 font-body leading-relaxed">
                          {quest.detail.slice(0, isCompact ? 2 : 4).map((dItem, idx) => (
                            <li key={idx} className="line-clamp-1">{dItem}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#24160B]/15">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="font-pixel text-[11px] text-[#3B5E34] font-bold mr-1">
                          STACK:
                        </span>
                        {quest.stack.slice(0, 4).map((stk, i) => (
                          <span
                            key={i}
                            className="font-pixel text-[11px] px-1.5 py-0.5 bg-[#F6EBD3] border border-[#24160B] shadow-[1px_1px_0_#24160B]"
                          >
                            {stk}
                          </span>
                        ))}
                      </div>

                      {quest.repo && (
                        <a
                          href={quest.repo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <PixelButton variant="primary" size={isCompact ? "sm" : "md"}>
                            Buka Repositori GitHub &rarr;
                          </PixelButton>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default QuestsSection;
