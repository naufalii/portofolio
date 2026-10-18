import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { profile } from '../../content/profile';

/**
 * GuildSection - Guild Hall / Balai Organisasi & Piagam Sertifikasi
 * Implements Bagian 2 [EX1]-[EX3] & [CE1]-[CE5]:
 * - Desktop: Notice board cards with wooden pin/tack accents + Piagam shelf with internal scroll
 * - Mobile: Vertical timeline with left rail and marker milestones + Piagam accordion
 * - Satu section per layar di desktop (scrollable internal)
 */
export function GuildSection({ isMobile = false }) {
  const [expandedId, setExpandedId] = useState(profile.organisasi[0]?.id || '');
  const [openCertId, setOpenCertId] = useState('');

  return (
    <div className={`space-y-5 ${isMobile ? 'max-w-4xl' : 'max-w-5xl'} mx-auto`}>
      {/* 1. Balai Organisasi (Guild Hall) */}
      <Panel title="GUILD HALL (BALAI ORGANISASI & KOMUNITAS)" icon="🏛️" variant="default">
        <p className="text-xs lg:text-sm text-[#24160B]/80 mb-4 leading-relaxed">
          {isMobile
            ? 'Catatan keterlibatan kepengurusan dan kontribusi Naufal Ali Hilmi di lingkungan Universitas Gunadarma, disajikan dalam linimasa vertikal.'
            : 'Papan pengumuman Balai Organisasi yang mencatat kepengurusan, divisi, dan kontribusi Naufal Ali Hilmi di lingkungan kampus Universitas Gunadarma.'}
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
                    {index === 0 ? '🏛️' : index === 1 ? '💼' : '💡'}
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

                    {/* Expandable Description & Bullets */}
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
        ) : (
          /* Desktop View: Notice Board Cards with Wooden Pins + internal max-h scroll */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-h-[360px] overflow-y-auto pr-1">
            {profile.organisasi.map((org, index) => (
              <div
                key={org.id}
                className="relative border-3 border-[#24160B] bg-[#FFFDF8] p-4 shadow-[3px_3px_0_#24160B] flex flex-col justify-between"
              >
                {/* Wooden Pin / Tack at the top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-none bg-[#E8793A] border-2 border-[#24160B] shadow-[1px_1px_0_#24160B] z-10" />

                <div>
                  <div className="flex items-start justify-between gap-1.5 border-b-2 border-[#24160B]/20 pb-2 mb-2.5">
                    <div>
                      <span className="text-[10px] font-pixel px-1.5 py-0.5 bg-[#5E8B4A] text-white border border-[#24160B] inline-block mb-1">
                        ORGANISASI #{index + 1}
                      </span>
                      <h3 className="font-pixel text-sm font-bold text-[#24160B] line-clamp-2">
                        {org.guild}
                      </h3>
                    </div>

                    <span className="font-pixel text-[11px] font-bold text-[#E8793A] bg-[#F6EBD3] px-1.5 py-0.5 border border-[#24160B]/40 whitespace-nowrap">
                      {org.periode}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-body">
                    <p>
                      <strong className="font-pixel text-[#3B5E34]">
                        Peran:
                      </strong>{' '}
                      <span>{org.peran}</span>
                    </p>

                    <p className="leading-relaxed text-[#24160B]/90 line-clamp-4">
                      {org.deskripsi}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#24160B]/15 flex items-center justify-between text-[10px] font-pixel text-[#24160B]/60">
                  <span>Universitas Gunadarma</span>
                  <span>Terverifikasi</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* 2. Piagam & Lisensi Resmi [CE1]-[CE5] */}
      <Panel title="PIAGAM & LISENSI RESMI" icon="📜" variant="default">
        <p className="text-xs lg:text-sm text-[#24160B]/80 mb-3 leading-relaxed">
          Piagam pelatihan, bootcamp, dan sertifikat resmi yang diverifikasi oleh lembaga penyelenggara.
        </p>

        {isMobile ? (
          /* Mobile View: Clean Certificates List */
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
        ) : (
          /* Desktop View: 2-Column Certificate Shelf with internal scroll */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
            {profile.sertifikat.map((cert, idx) => (
              <div
                key={cert.id}
                className="border-2 border-[#24160B] bg-[#FFFDF8] p-3 shadow-[2px_2px_0_#24160B] flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-[#E8793A] text-white">
                      #{idx + 1}
                    </span>
                    <h4 className="font-pixel text-xs font-bold text-[#24160B] truncate">
                      {cert.judul}
                    </h4>
                  </div>
                  <p className="text-xs font-body text-[#3B5E34] font-medium truncate">
                    {cert.penerbit}
                  </p>
                </div>

                <span className="font-pixel text-xs font-bold text-[#24160B] bg-[#F6EBD3] px-2 py-1 border border-[#24160B]/30 whitespace-nowrap flex-shrink-0">
                  {cert.tahun}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

export default GuildSection;
