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
              &larr; KEMBALI KE OVERWORLD (PETA DUNIA)
            </PixelButton>
          </Link>

          <a href={profile.cv_pdf} download="CV_Naufal_Ali_Hilmi.pdf">
            <PixelButton variant="secondary" size="md">
              UNDUH CV (PDF) &darr;
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
                  {profile.target}
                </p>
                <p className="text-sm sm:text-base text-[var(--ink)]/80 mt-0.5">
                  {profile.kampus}
                </p>
              </div>

              <div className="font-pixel text-xs px-3 py-1 bg-[var(--moss)] text-[var(--cloud)] border-2 border-[var(--ink)] shadow-[2px_2px_0_var(--ink)]">
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
          </div>
        </Panel>

        {/* 2. Professional Summary */}
        <Panel title="RINGKASAN & ASPIRASI KARIR" variant="default">
          <p className="text-sm sm:text-base leading-relaxed">
            Mahasiswa Sistem Informasi Universitas Gunadarma dengan dedikasi tinggi pada spesialisasi <strong>Database Administration (Oracle)</strong> dan <strong>Linux System Administration</strong>. Berpengalaman dalam pengelolaan instance Oracle, arsitektur basis data relasional, backup dan recovery menggunakan RMAN, administrasi server Linux, serta pengembangan aplikasi web berbasis API. Siap berkontribusi secara profesional dalam program internship System Administrator / Oracle DBA.
          </p>
        </Panel>

        {/* 3. Technical Skills (3 Branches) */}
        <Panel title="KOMPETENSI TEKNIS" variant="default">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Database Branch */}
            <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3.5 shadow-[2px_2px_0_var(--ink)]">
              <h3 className="font-pixel text-xs sm:text-sm font-bold text-[var(--sunset)] border-b-2 border-[var(--ink)] pb-1 mb-2.5">
                DATABASE & ORACLE DBA
              </h3>
              <div className="space-y-2">
                {profile.skillTree.database.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between font-pixel">
                      <span>{s.name}</span>
                      <span className="font-bold text-[var(--moss-dark)]">{s.level}%</span>
                    </div>
                    <p className="text-[11px] text-[var(--ink)]/70 mt-0.5 line-clamp-1">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Linux SysAdmin Branch */}
            <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3.5 shadow-[2px_2px_0_var(--ink)]">
              <h3 className="font-pixel text-xs sm:text-sm font-bold text-[var(--moss-dark)] border-b-2 border-[var(--ink)] pb-1 mb-2.5">
                LINUX & SYSADMIN
              </h3>
              <div className="space-y-2">
                {profile.skillTree.sysAdmin.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between font-pixel">
                      <span>{s.name}</span>
                      <span className="font-bold text-[var(--moss-dark)]">{s.level}%</span>
                    </div>
                    <p className="text-[11px] text-[var(--ink)]/70 mt-0.5 line-clamp-1">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Web Dev Branch */}
            <div className="border-2 border-[var(--ink)] bg-[var(--cloud)] p-3.5 shadow-[2px_2px_0_var(--ink)]">
              <h3 className="font-pixel text-xs sm:text-sm font-bold text-[var(--ink)] border-b-2 border-[var(--ink)] pb-1 mb-2.5">
                WEB & DEVOPS DASAR
              </h3>
              <div className="space-y-2">
                {profile.skillTree.webDev.map((s, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between font-pixel">
                      <span>{s.name}</span>
                      <span className="font-bold text-[var(--moss-dark)]">{s.level}%</span>
                    </div>
                    <p className="text-[11px] text-[var(--ink)]/70 mt-0.5 line-clamp-1">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        {/* 4. Projects & Quests */}
        <Panel title="PENGALAMAN PROYEK & PRAKTIKUM" variant="default">
          <div className="space-y-4">
            {profile.quests.map((quest) => (
              <div
                key={quest.id}
                className="border-b-2 border-[var(--ink)]/15 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <h3 className="font-pixel text-base sm:text-lg font-bold text-[var(--ink)]">
                    {quest.judul}
                  </h3>
                  <span className="text-[10px] font-pixel px-2 py-0.5 bg-[var(--moss)] text-[var(--cloud)] border border-[var(--ink)]">
                    {quest.status}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--ink)] leading-relaxed mb-2">
                  {quest.ringkasan}
                </p>

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

                {quest.repo && quest.repo !== 'TODO_OWNER' && (
                  <a
                    href={quest.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-pixel text-xs text-[var(--sunset)] hover:underline"
                  >
                    Tautan Repositori GitHub &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* 5. Organizations */}
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
                <p className="text-xs sm:text-sm text-[var(--ink)]/90 leading-relaxed">
                  {org.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Footer info */}
        <div className="text-center text-xs font-pixel text-[var(--ink)]/60 pt-4">
          Dokumen Curriculum Vitae Naufal Ali Hilmi &bull; Mode CV Linear &bull; Universitas Gunadarma
        </div>
      </div>
    </div>
  );
}

export default CVPage;
