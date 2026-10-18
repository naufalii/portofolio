import React from 'react';
import { Panel } from '../ui/Panel';
import { profile } from '../../content/profile';

/**
 * GuildSection - Guild Hall / Balai Organisasi (Section 5)
 * Metaphor: Bulletin notice board with pinned organization records.
 * Data source strictly from profile.organisasi with TODO_OWNER placeholders.
 */
export function GuildSection() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Panel title="GUILD HALL (BALAI ORGANISASI & KOMUNITAS)" variant="default">
        <p className="text-xs sm:text-sm text-[var(--ink)]/80 mb-5">
          Papan pengumuman Balai Organisasi yang mencatat keterlibatan kepengurusan, divisi, dan kontribusi Naufal Ali Hilmi di lingkungan kampus Universitas Gunadarma.
        </p>

        {/* Notice Board Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profile.organisasi.map((org, index) => (
            <div
              key={org.id}
              className="relative border-4 border-[var(--ink)] bg-[#FFFDF7] p-5 shadow-[4px_4px_0_var(--ink)] flex flex-col justify-between"
            >
              {/* Wooden Pin / Tack at the top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-none bg-[var(--sunset)] border-2 border-[var(--ink)] shadow-[1px_1px_0_var(--ink)] z-10" />

              <div>
                <div className="flex items-start justify-between gap-2 border-b-2 border-[var(--ink)]/20 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-pixel px-2 py-0.5 bg-[var(--moss)] text-[var(--cloud)] border border-[var(--ink)] inline-block mb-1">
                      ORGANISASI KAMPUS #{index + 1}
                    </span>
                    <h3 className="font-pixel text-base sm:text-lg font-bold text-[var(--ink)]">
                      {org.guild}
                    </h3>
                  </div>

                  <span className="font-pixel text-xs font-bold text-[var(--sunset)] bg-[var(--cream)] px-2 py-1 border border-[var(--ink)]/40 whitespace-nowrap">
                    {org.periode}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm font-body">
                  <p>
                    <strong className="font-pixel text-[var(--moss-dark)]">
                      Peran & Jabatan:
                    </strong>{' '}
                    <span>{org.peran}</span>
                  </p>

                  <p className="leading-relaxed text-[var(--ink)]/90">
                    <strong className="font-pixel text-[var(--moss-dark)]">
                      Deskripsi & Kontribusi:
                    </strong>{' '}
                    <span>{org.deskripsi}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--ink)]/15 flex items-center justify-between text-[11px] font-pixel text-[var(--ink)]/60">
                <span>Gunadarma University FIKTI</span>
                <span>Terverifikasi</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export default GuildSection;
