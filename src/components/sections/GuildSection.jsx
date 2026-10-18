import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { profile } from '../../content/profile';

/**
 * GuildSection - Guild Hall / Balai Organisasi
 * - Desktop: Notice board cards with wooden pin/tack accents (identik c383241)
 * - Mobile: Vertical timeline with left rail and marker milestones (identik mobile-current)
 */
export function GuildSection({ isMobile = false }) {
  const [expandedId, setExpandedId] = useState(profile.organisasi[0]?.id || '');

  return (
    <div className={`space-y-4 ${isMobile ? 'max-w-4xl' : 'max-w-5xl'} mx-auto`}>
      <Panel title="GUILD HALL (BALAI ORGANISASI & KOMUNITAS)" icon="🏛️" variant="default">
        <p className="text-xs lg:text-sm text-[#24160B]/80 mb-5 leading-relaxed">
          {isMobile
            ? 'Catatan keterlibatan dan kontribusi Naufal Ali Hilmi di lingkungan Universitas Gunadarma, disajikan dalam linimasa vertikal.'
            : 'Papan pengumuman Balai Organisasi yang mencatat keterlibatan kepengurusan, divisi, dan kontribusi Naufal Ali Hilmi di lingkungan kampus Universitas Gunadarma.'}
        </p>

        {isMobile ? (
          /* Mobile View: Vertical Timeline */
          <div className="relative pl-6 border-l-3 border-[#24160B] space-y-6 my-2">
            {profile.organisasi.map((org, index) => {
              const isExpanded = expandedId === org.id;
              return (
                <div key={org.id} className="relative group">
                  {/* Timeline Node Marker on the left rail */}
                  <div className="absolute -left-[37px] top-1.5 w-8 h-8 bg-[#E8793A] border-2 border-[#24160B] shadow-[2px_2px_0_#24160B] flex items-center justify-center text-sm select-none">
                    {index === 0 ? '🏛️' : '💼'}
                  </div>

                  {/* Timeline Card */}
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

                    {/* Expandable Description */}
                    {isExpanded && (
                      <div className="px-3.5 pb-4 pt-1 border-t border-[#24160B]/15 bg-[#F6EBD3]/30 text-xs font-body text-[#24160B] leading-relaxed space-y-2">
                        <p>
                          <strong className="font-pixel text-[11px] text-[#3B5E34] block mb-0.5">
                            DESKRIPSI & KONTRIBUSI:
                          </strong>
                          {org.deskripsi}
                        </p>
                        <div className="pt-1 text-[11px] font-pixel text-[#24160B]/60">
                          *Universitas Gunadarma &bull; FIKTI
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop View (Identik c383241): 2-Column Notice Board Cards with Wooden Pins */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {profile.organisasi.map((org, index) => (
              <div
                key={org.id}
                className="relative border-4 border-[#24160B] bg-[#FFFDF8] p-5 shadow-[4px_4px_0_#24160B] flex flex-col justify-between"
              >
                {/* Wooden Pin / Tack at the top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-none bg-[#E8793A] border-2 border-[#24160B] shadow-[1px_1px_0_#24160B] z-10" />

                <div>
                  <div className="flex items-start justify-between gap-2 border-b-2 border-[#24160B]/20 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] font-pixel px-2 py-0.5 bg-[#5E8B4A] text-white border border-[#24160B] inline-block mb-1">
                        ORGANISASI KAMPUS #{index + 1}
                      </span>
                      <h3 className="font-pixel text-base lg:text-lg font-bold text-[#24160B]">
                        {org.guild}
                      </h3>
                    </div>

                    <span className="font-pixel text-xs font-bold text-[#E8793A] bg-[#F6EBD3] px-2 py-1 border border-[#24160B]/40 whitespace-nowrap">
                      {org.periode}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs lg:text-sm font-body">
                    <p>
                      <strong className="font-pixel text-[#3B5E34]">
                        Peran & Jabatan:
                      </strong>{' '}
                      <span>{org.peran}</span>
                    </p>

                    <p className="leading-relaxed text-[#24160B]/90">
                      <strong className="font-pixel text-[#3B5E34]">
                        Deskripsi & Kontribusi:
                      </strong>{' '}
                      <span>{org.deskripsi}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#24160B]/15 flex items-center justify-between text-[11px] font-pixel text-[#24160B]/60">
                  <span>Gunadarma University FIKTI</span>
                  <span>Terverifikasi</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default GuildSection;
