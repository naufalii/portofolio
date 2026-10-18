import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { profile } from '../../content/profile';

/**
 * GuildSection - Guild Hall / Balai Organisasi (Section 5 & Mobile Fix Fase 7)
 * - Vertical timeline with clean left rail and marker milestones
 * - Compact organization item with role & period
 * - Expandable description on mobile (no huge identical duplicated cards)
 */
export function GuildSection() {
  const [expandedId, setExpandedId] = useState(profile.organisasi[0]?.id || '');

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Panel title="GUILD HALL (BALAI ORGANISASI & KOMUNITAS)" icon="🏛️" variant="default">
        <p className="text-xs sm:text-sm text-[var(--ink)]/80 mb-5 leading-relaxed">
          Catatan keterlibatan dan kontribusi Naufal Ali Hilmi di lingkungan Universitas Gunadarma, disajikan dalam linimasa vertikal.
        </p>

        {/* Vertical Timeline Container (Fase 7) */}
        <div className="relative pl-6 sm:pl-8 border-l-3 sm:border-l-4 border-[#24160B] space-y-6 my-2">
          {profile.organisasi.map((org, index) => {
            const isExpanded = expandedId === org.id;
            return (
              <div key={org.id} className="relative group">
                {/* Timeline Node Marker on the left rail (max 36px) */}
                <div className="absolute -left-[37px] sm:-left-[46px] top-1.5 w-8 h-8 sm:w-9 sm:h-9 bg-[#E8793A] border-2 border-[#24160B] shadow-[2px_2px_0_#24160B] flex items-center justify-center text-sm sm:text-base select-none">
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
                        <span className="font-pixel text-xs sm:text-sm font-bold text-[#24160B] truncate">
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
                    <div className="px-3.5 pb-4 pt-1 border-t border-[#24160B]/15 bg-[#F6EBD3]/30 text-xs sm:text-sm font-body text-[#24160B] leading-relaxed space-y-2">
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
      </Panel>
    </div>
  );
}

export default GuildSection;
