import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { PaginationControls } from '../ui/PaginationControls';
import { profile } from '../../content/profile';
import { useDeviceType } from '../../hooks/useMediaQuery';
import { useSectionPagination } from '../../hooks/useSectionPagination';

/**
 * GuildSection - Guild Hall / Balai Organisasi & Piagam Sertifikasi
 * Follows Bagian 1, 2, 3 of Desktop Pagination Specification:
 * - Desktop: Notice board cards with wooden pin/tack accents + Piagam shelf
 * - In compact mode (H < 700): Paginated into pages so standard content fits with 0px overflow
 * - Eliminates previous 310px dialog overflow completely!
 * - Mobile: Unaltered vertical timeline with left rail and milestone markers + Piagam accordion
 */
export function GuildSection({ isMobile: isMobileProp, isDesktop: isDesktopProp, isCompact = false }) {
  const { isMobile: isMobileDevice } = useDeviceType();
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileDevice;
  const isDesktop = isDesktopProp !== undefined ? isDesktopProp : !isMobile;

  // Mobile timeline accordion
  const [expandedId, setExpandedId] = useState(profile.organisasi[0]?.id || '');
  const [openCertId, setOpenCertId] = useState('');

  // Desktop notice board card accordion
  const [expandedOrgId, setExpandedOrgId] = useState(null);

  const toggleDesktopOrg = (id) => {
    setExpandedOrgId((prev) => (prev === id ? null : id));
  };

  // Desktop items for pagination: Balai Organisasi (block of 3 org cards) and Piagam Shelf
  const desktopItems = [
    {
      id: 'balai-organisasi',
      type: 'orgs',
      estimatedHeight: isCompact ? 170 : 210,
    },
    {
      id: 'piagam-shelf',
      type: 'piagam',
      estimatedHeight: isCompact ? 160 : 200,
    },
  ];

  const pagination = useSectionPagination(desktopItems, isDesktop, {
    sectionKey: 'guild',
    reservedHeight: isCompact ? 100 : 120,
    minItemHeight: 150,
  });

  return (
    <div className="space-y-2 max-w-5xl mx-auto" ref={pagination.containerRef}>
      {isMobile ? (
        /* Mobile View: Vertical Timeline + Piagam Accordion */
        <div className="space-y-5 max-w-4xl mx-auto">
          {/* 1. Balai Organisasi (Guild Hall) */}
          <Panel
            title="GUILD HALL (BALAI ORGANISASI & KOMUNITAS)"
            icon="🏛️"
            variant="default"
            isCompact={false}
          >
            <p className="text-xs lg:text-sm mb-4 text-[#24160B]/80 leading-relaxed">
              Catatan keterlibatan kepengurusan dan kontribusi Naufal Ali Hilmi di lingkungan Universitas Gunadarma, disajikan dalam linimasa vertikal.
            </p>

            <div className="relative pl-6 border-l-3 border-[#24160B] space-y-6 my-2">
              {profile.organisasi.map((org, index) => {
                const isExpanded = expandedId === org.id;
                return (
                  <div key={org.id} className="relative group">
                    <div className="absolute -left-[37px] top-1.5 w-8 h-8 bg-[#E8793A] border-2 border-[#24160B] shadow-[2px_2px_0_#24160B] flex items-center justify-center text-sm select-none">
                      {index === 0 ? '🏛️' : index === 1 ? '💼' : '💡'}
                    </div>

                    <div className="border-2 border-[#24160B] bg-[#FFFDF8] shadow-[2px_2px_0_#24160B] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? '' : org.id)}
                        className="w-full text-left p-3.5 flex items-center justify-between gap-2 min-h-[52px] cursor-pointer active:bg-[#F6EBD3]/60"
                        aria-expanded={isExpanded}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="font-pixel text-xs font-bold text-[#24160B] truncate">
                              {org.guild}
                            </span>
                            <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-[#5E8B4A] text-white">
                              {org.periode}
                            </span>
                          </div>
                          <div className="font-pixel text-xs text-[#3B5E34] font-bold">
                            Peran: {org.peran}
                          </div>
                        </div>

                        <span className="font-pixel text-xs text-[#E8793A] font-bold px-1.5 py-1 flex-shrink-0">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-3.5 pb-4 pt-1 border-t border-[#24160B]/15 bg-[#F6EBD3]/30 text-xs font-body text-[#24160B] leading-relaxed space-y-2">
                          <p>
                            <strong className="font-pixel text-[11px] text-[#3B5E34] block mb-0.5">
                              RINGKASAN KONTRIBUSI:
                            </strong>
                            {org.deskripsi}
                          </p>
                          {org.poin && org.poin.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 text-xs text-[#24160B]/90 pt-1">
                              {org.poin.map((p, idx) => (
                                <li key={idx}>{p}</li>
                              ))}
                            </ul>
                          )}
                          <div className="pt-1 text-[11px] font-pixel text-[#24160B]/60">
                            *Terverifikasi &bull; Universitas Gunadarma
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* 2. Piagam & Lisensi Resmi (Mobile) */}
          <Panel
            title="PIAGAM & LISENSI RESMI"
            icon="📜"
            variant="default"
            isCompact={false}
          >
            <p className="text-xs mb-3 text-[#24160B]/80 leading-relaxed">
              Piagam pelatihan, bootcamp, dan sertifikat resmi yang diverifikasi oleh lembaga penyelenggara.
            </p>

            <div className="divide-y-2 divide-[#24160B]/15 border-2 border-[#24160B] bg-[#FFFDF8]">
              {profile.sertifikat.map((cert) => {
                const isOpen = openCertId === cert.id;
                return (
                  <div key={cert.id}>
                    <button
                      type="button"
                      onClick={() => setOpenCertId(isOpen ? '' : cert.id)}
                      className="w-full text-left p-3 flex items-center justify-between gap-2 min-h-[44px] cursor-pointer active:bg-[#F6EBD3]/60"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-pixel text-xs font-bold text-[#24160B] truncate">
                          {cert.judul}
                        </div>
                        <div className="text-[11px] font-body text-[#3B5E34]">
                          {cert.penerbit} &bull; {cert.tahun}
                        </div>
                      </div>
                      <span className="font-pixel text-xs text-[#E8793A] font-bold">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-3 pb-3 pt-1 bg-[#F6EBD3]/40 border-t border-[#24160B]/10 text-xs font-body text-[#24160B]">
                        <p><strong>Judul Lengkap:</strong> {cert.judul}</p>
                        <p><strong>Penyelenggara:</strong> {cert.penerbit}</p>
                        <p><strong>Tahun Terbit:</strong> {cert.tahun}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      ) : (
        /* Desktop View: Paginated Balai Organisasi & Piagam Shelf */
        <div className="space-y-3">
          {pagination.currentItems.some((it) => it.type === 'orgs') && (
            <Panel
              title="GUILD HALL (BALAI ORGANISASI & KOMUNITAS)"
              icon="🏛️"
              variant="default"
              isCompact={isCompact}
            >
              <p className={`${isCompact ? 'text-xs mb-2' : 'text-xs lg:text-sm mb-3.5'} text-[#24160B]/80 leading-relaxed`}>
                Papan pengumuman Balai Organisasi yang mencatat kepengurusan, divisi, dan kontribusi Naufal Ali Hilmi di lingkungan kampus Universitas Gunadarma.
              </p>

              <div
                data-page-item-id="balai-organisasi"
                className={`grid grid-cols-1 lg:grid-cols-3 ${isCompact ? 'gap-2.5' : 'gap-4'} items-stretch`}
              >
                {profile.organisasi.map((org, index) => {
                  const isExpanded = expandedOrgId === org.id;

                  return (
                    <div
                      key={org.id}
                      data-page-item-id={org.id}
                      className={`relative border-2 lg:border-3 border-[#24160B] bg-[#FFFDF8] ${
                        isCompact ? 'p-2.5' : 'p-3.5'
                      } shadow-[2px_2px_0_#24160B] lg:shadow-[3px_3px_0_#24160B] flex flex-col justify-between`}
                    >
                      {/* Wooden Pin / Tack at the top */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#E8793A] border-2 border-[#24160B] shadow-[1px_1px_0_#24160B] z-10" />

                      <div>
                        {/* Top row: badge & periode */}
                        <div className="flex items-start justify-between gap-1.5 border-b border-[#24160B]/20 pb-1.5 mb-1.5">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-pixel px-1.5 py-0.5 bg-[#5E8B4A] text-white border border-[#24160B] inline-block mb-0.5">
                              ORGANISASI #{index + 1}
                            </span>
                            <h3
                              className="font-pixel text-xs lg:text-sm font-bold text-[#24160B] line-clamp-2 leading-snug"
                              title={org.guild}
                            >
                              {org.guild}
                            </h3>
                          </div>

                          <span className="font-pixel text-[10px] lg:text-[11px] font-bold text-[#E8793A] bg-[#F6EBD3] px-1.5 py-0.5 border border-[#24160B]/40 whitespace-nowrap flex-shrink-0">
                            {org.periode}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs font-body">
                          <div>
                            <strong className="font-pixel text-[#3B5E34]">
                              Peran:
                            </strong>{' '}
                            <span className="text-[#24160B] font-medium">{org.peran}</span>
                          </div>

                          {!isExpanded ? (
                            <p className="leading-relaxed text-[#24160B]/90 line-clamp-2">
                              {org.deskripsi}
                            </p>
                          ) : (
                            <div className="space-y-1.5 pt-1 border-t border-[#24160B]/10">
                              <p className="leading-relaxed text-[#24160B]">
                                {org.deskripsi}
                              </p>
                              {org.poin && org.poin.length > 0 && (
                                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#24160B]/90">
                                  {org.poin.map((p, idx) => (
                                    <li key={idx}>{p}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              toggleDesktopOrg(org.id);
                              pagination.recomputePages();
                            }}
                            className="mt-0.5 text-left text-[10px] font-alt-pixel font-bold text-[#E8793A] hover:text-[#3B5E34] hover:underline flex items-center gap-1 cursor-pointer focus-visible:outline-none"
                            aria-expanded={isExpanded}
                          >
                            <span>{isExpanded ? 'Tutup ringkasan ▲' : 'Lihat selengkapnya ▼'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 pt-1 border-t border-[#24160B]/15 flex items-center justify-between text-[10px] font-pixel text-[#24160B]/60">
                        <span>Universitas Gunadarma</span>
                        <span>Terverifikasi</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          {pagination.currentItems.some((it) => it.type === 'piagam') && (
            <Panel
              title="PIAGAM & LISENSI RESMI"
              icon="📜"
              variant="default"
              isCompact={isCompact}
            >
              <p className={`${isCompact ? 'text-xs mb-1.5' : 'text-xs lg:text-sm mb-3'} text-[#24160B]/80 leading-relaxed`}>
                Piagam pelatihan, bootcamp, dan sertifikat resmi yang diverifikasi oleh lembaga penyelenggara.
              </p>

              <div
                data-page-item-id="piagam-shelf"
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isCompact ? 'gap-2' : 'gap-3'}`}
              >
                {profile.sertifikat.map((cert, idx) => (
                  <div
                    key={cert.id}
                    data-page-item-id={cert.id}
                    className="border-2 border-[#24160B] bg-[#FFFDF8] p-2 lg:p-2.5 shadow-[2px_2px_0_#24160B] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-pixel text-[10px] px-1 py-0.2 bg-[#E8793A] text-white">
                          #{idx + 1}
                        </span>
                        <h4 className="font-pixel text-xs font-bold text-[#24160B] truncate">
                          {cert.judul}
                        </h4>
                      </div>
                      <p className="text-[11px] font-body text-[#3B5E34] font-medium truncate">
                        {cert.penerbit}
                      </p>
                    </div>

                    <span className="font-pixel text-[11px] font-bold text-[#24160B] bg-[#F6EBD3] px-1.5 py-0.5 border border-[#24160B]/30 whitespace-nowrap flex-shrink-0">
                      {cert.tahun}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}

      {/* Pagination Controls toolbar (Desktop only, totalPages > 1) */}
      {isDesktop && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPrev={pagination.prevPage}
          onNext={pagination.nextPage}
          sectionTitle="Guild Hall"
        />
      )}
    </div>
  );
}

export default GuildSection;
