import React from 'react';
import { Link } from 'react-router-dom';
import { PixelButton } from '../components/ui/PixelButton';
import { Panel } from '../components/ui/Panel';
import { profile } from '../content/profile';

/**
 * CVPage - Mode CV Linear (Section 5)
 * Halaman linear bersih tanpa canvas berat untuk recruiter (dibaca dalam <=10 detik).
 * Menggunakan palet, font, dan data profile.js yang sama.
 */
export function CVPage() {
  const visibleQuests = profile.quests.filter((q) => !q.needsOwnerConfirm);

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)] p-4 sm:p-8 font-body selection:bg-[var(--sunset)] selection:text-[var(--cloud)]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Action Bar */}
        <nav
          aria-label="Navigasi CV"
          className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--ink)]/20 pb-4"
        >
          <Link to="/">
            <PixelButton variant="neutral" size="sm">
              &larr; KEMBALI KE OVERWORLD - PETA DUNIA
            </PixelButton>
          </Link>

          <a href={profile.cv_pdf} download="CV_Naufal_Ali_Hilmi.pdf">
            <PixelButton variant="secondary" size="md">
              UNDUH CV <span className="font-body font-normal">(PDF)</span> &darr;
            </PixelButton>
          </a>
        </nav>

        {/* 1. Profile Header */}
        <Panel variant="parchment" className="space-y-4">
          <div className="border-b-2 border-[var(--ink)]/20 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="font-pixel text-2xl sm:text-4xl font-bold tracking-wide text-[var(--ink)]">
                  {profile.nama}
                </h1>
                <p className="font-pixel text-base sm:text-lg text-[var(--sunset)] mt-1 font-bold">
                  {profile.tagline}
                </p>
                <p className="text-sm sm:text-base text-[var(--ink)]/80 mt-0.5">
                  {profile.lokasi} &bull; {profile.kampus}
                </p>
              </div>

              <div className="font-alt-pixel text-xs px-3 py-1 bg-[var(--moss)] text-[var(--cloud)] border-2 border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
                TERVERIFIKASI &bull; MODE CV
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap gap-4 pt-1 text-sm">
            <a
              href={profile.sosial.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-xs sm:text-sm text-[var(--moss-dark)] hover:underline flex items-center gap-1.5"
            >
              <span className="w-2 h-2 bg-[var(--moss-dark)] inline-block" />
              GitHub: {profile.sosial.github}
            </a>
            <a
              href={profile.sosial.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-xs sm:text-sm text-[var(--moss-dark)] hover:underline flex items-center gap-1.5"
            >
              <span className="w-2 h-2 bg-[var(--sunset)] inline-block" />
              LinkedIn: {profile.sosial.linkedin}
            </a>
            <a
              href={profile.sosial.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-xs sm:text-sm text-[var(--moss-dark)] hover:underline flex items-center gap-1.5"
            >
              <span className="w-2 h-2 bg-[var(--moss)] inline-block" />
              Portofolio Live: {profile.sosial.website}
            </a>
          </div>
        </Panel>

        {/* 2. Professional Summary [SM] */}
        <Panel title="RINGKASAN & PROFIL PROFESIONAL" variant="default">
          <p className="text-sm sm:text-base leading-relaxed text-[var(--ink)]">
            {profile.summary}
          </p>
        </Panel>

        {/* 3. Pendidikan [ED1] */}
        <Panel title="PENDIDIKAN" variant="default">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ink)]/15 pb-2">
              <h3 className="font-pixel text-base font-bold text-[var(--ink)]">
                {profile.pendidikan.institusi}
              </h3>
              <span className="font-pixel text-xs text-[var(--sunset)] font-bold">
                {profile.pendidikan.periode}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
              <p className="font-medium text-[var(--ink)]/90">
                {profile.pendidikan.jurusan}
              </p>
              <span className="font-pixel text-xs font-bold text-[var(--moss-dark)] bg-[var(--cloud)] px-2 py-0.5 border border-[var(--ink)]/30">
                IPK: {profile.pendidikan.ipk}
              </span>
            </div>
          </div>
        </Panel>

        {/* 4. Technical Skills (Tanpa persentase karangan, berbasis label bukti) */}
        <Panel title="KOMPETENSI KEAHLIAN (SKILLS)" variant="default">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Branch */}
            <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3.5 shadow-[2px_2px_0_var(--ink)]">
              <h3 className="font-pixel text-xs font-bold text-[var(--sunset)] border-b-2 border-[var(--ink)] pb-1 mb-2.5">
                DATABASE & ORACLE DBA
              </h3>
              <div className="space-y-2">
                {profile.skillTree.database.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center justify-between font-pixel gap-1">
                      <span className="font-bold truncate">{s.name}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {s.level ? (
                          <span className="text-[10px] text-[var(--moss-dark)] font-bold">{s.level}</span>
                        ) : null}
                        <span className="text-[10px] text-[var(--moss-dark)] bg-[var(--cream)] px-1.5 py-0.5 border border-[var(--ink)]/30 whitespace-nowrap">
                          {s.proof}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--ink)]/70 mt-0.5 line-clamp-1">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Linux SysAdmin Branch */}
            <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3.5 shadow-[2px_2px_0_var(--ink)]">
              <h3 className="font-pixel text-xs font-bold text-[var(--moss-dark)] border-b-2 border-[var(--ink)] pb-1 mb-2.5">
                LINUX & SYSADMIN
              </h3>
              <div className="space-y-2">
                {profile.skillTree.sysAdmin.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center justify-between font-pixel gap-1">
                      <span className="font-bold truncate">{s.name}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {s.level ? (
                          <span className="text-[10px] text-[var(--moss-dark)] font-bold">{s.level}</span>
                        ) : null}
                        <span className="text-[10px] text-[var(--moss-dark)] bg-[var(--cream)] px-1.5 py-0.5 border border-[var(--ink)]/30 whitespace-nowrap">
                          {s.proof}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--ink)]/70 mt-0.5 line-clamp-1">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Web Dev Branch */}
            <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3.5 shadow-[2px_2px_0_var(--ink)]">
              <h3 className="font-pixel text-xs font-bold text-[var(--ink)] border-b-2 border-[var(--ink)] pb-1 mb-2.5">
                WEB DEVELOPMENT & CMS
              </h3>
              <div className="space-y-2">
                {profile.skillTree.webDev.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center justify-between font-pixel gap-1">
                      <span className="font-bold truncate">{s.name}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {s.level ? (
                          <span className="text-[10px] text-[var(--moss-dark)] font-bold">{s.level}</span>
                        ) : null}
                        <span className="text-[10px] text-[var(--moss-dark)] bg-[var(--cream)] px-1.5 py-0.5 border border-[var(--ink)]/30 whitespace-nowrap">
                          {s.proof}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--ink)]/70 mt-0.5 line-clamp-1">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Skills & Tools Branch */}
            <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3.5 shadow-[2px_2px_0_var(--ink)]">
              <h3 className="font-pixel text-xs font-bold text-[#E8793A] border-b-2 border-[var(--ink)] pb-1 mb-2.5">
                SOFT SKILLS & ALAT KERJA
              </h3>
              <div className="space-y-2">
                {profile.skillTree.softSkills.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center justify-between font-pixel gap-1">
                      <span className="font-bold truncate">{s.name}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {s.level ? (
                          <span className="text-[10px] text-[var(--moss-dark)] font-bold">{s.level}</span>
                        ) : null}
                        <span className="text-[10px] text-[var(--moss-dark)] bg-[var(--cream)] px-1.5 py-0.5 border border-[var(--ink)]/30 whitespace-nowrap">
                          {s.proof}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--ink)]/70 mt-0.5 line-clamp-1">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        {/* 5. Projects & Quests [PR1], [PR2] */}
        <Panel title="PENGALAMAN PROYEK & LAB" variant="default">
          <div className="space-y-5">
            {visibleQuests.map((quest) => (
              <div
                key={quest.id}
                className="border-b-2 border-[var(--ink)]/15 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-pixel text-base sm:text-lg font-bold text-[var(--ink)]">
                    {quest.judul}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-pixel px-2 py-0.5 bg-[var(--cream)] text-[var(--ink)] border border-[var(--ink)]">
                      {quest.periode}
                    </span>
                    <span className="text-[10px] font-pixel px-2 py-0.5 bg-[var(--moss)] text-[var(--cloud)] border border-[var(--ink)]">
                      {quest.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--ink)] leading-relaxed mb-2">
                  {quest.ringkasan}
                </p>

                {quest.detail && quest.detail.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-xs text-[var(--ink)]/90 mb-2">
                    {quest.detail.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="font-pixel text-[11px] text-[var(--ink)]/70 mr-1">Stack:</span>
                  {quest.stack.map((stk, i) => (
                    <span
                      key={i}
                      className="font-pixel text-[10px] px-2 py-0.5 bg-[var(--cloud)] border border-[var(--ink)]/30"
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
                    className="inline-block font-pixel text-xs text-[var(--sunset)] hover:underline mr-4"
                  >
                    Tautan Repositori GitHub &rarr;
                  </a>
                )}

                {quest.demo && (
                  <a
                    href={quest.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-pixel text-xs text-[var(--moss-dark)] hover:underline"
                  >
                    Tautan Demo Live &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* 6. Organizations [EX1]-[EX3] */}
        <Panel title="PENGALAMAN ORGANISASI" variant="default">
          <div className="space-y-4">
            {profile.organisasi.map((org) => (
              <div
                key={org.id}
                className="border-b border-[var(--ink)]/15 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h3 className="font-pixel text-base font-bold text-[var(--ink)]">
                    {org.guild}
                  </h3>
                  <span className="font-pixel text-xs text-[var(--sunset)] font-bold">
                    {org.periode}
                  </span>
                </div>
                <p className="font-pixel text-xs text-[var(--moss-dark)] font-bold mb-1">
                  Peran: {org.peran}
                </p>
                <p className="text-xs sm:text-sm text-[var(--ink)]/90 leading-relaxed mb-1.5">
                  {org.deskripsi}
                </p>
                {org.poin && org.poin.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-xs text-[var(--ink)]/80">
                    {org.poin.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* 7. Piagam & Sertifikat [CE1]-[CE5] */}
        <Panel title="PIAGAM & SERTIFIKASI" variant="default">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.sertifikat.map((cert) => (
              <div
                key={cert.id}
                className="border border-[var(--ink)]/30 bg-[var(--cloud)] p-3 shadow-[1px_1px_0_var(--ink)] flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-pixel text-xs font-bold text-[var(--ink)] mb-1">
                    {cert.judul}
                  </h4>
                  <p className="text-xs font-body text-[#3B5E34]">
                    {cert.penerbit}
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-[var(--ink)]/10 text-right">
                  <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-[var(--cream)] border border-[var(--ink)]/30">
                    Tahun {cert.tahun}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* 8. Kemampuan Bahasa [LG] */}
        <Panel title="KEMAMPUAN BAHASA" variant="default">
          <div className="flex flex-wrap gap-4 text-xs font-pixel">
            {profile.bahasa.map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-[var(--cloud)] border border-[var(--ink)]/30 px-3 py-1.5 shadow-[1px_1px_0_var(--ink)]"
              >
                <span className="font-bold text-[var(--ink)]">{b.nama}:</span>
                <span className="text-[var(--sunset)] font-bold">{b.level}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Footer info */}
        <div className="text-center text-xs font-alt-pixel text-[var(--ink)]/60 pt-4">
          Dokumen Curriculum Vitae Naufal Ali Hilmi &bull; Mode CV Linear &bull; Universitas Gunadarma
        </div>
      </div>
    </div>
  );
}

export default CVPage;
