# Laporan Perbaikan Kontras Teks Hijau di Tema Malam (Mobile)

## 1. Analisis Masalah & Temuan Elemen

Pada tema malam (`night`), latar belakang kanvas overworld menggunakan `--sky-night` (`#1F2A44`) dan gradien langit malam (`#080E1E` hingga `#18243C`). Elemen teks yang berada langsung di luar kotak panel (*outdoor elements*) mengalami degradasi kontras parah ketika menggunakan token hijau tua (`--moss-dark`: `#3B5E34`) atau tinta gelap (`#24160B`):

1. **Tagline / Subtitle Role di Bawah Maskot (Mobile)**:
   - Komponen: `src/pages/Home.jsx`
   - Teks: `{profile.target}` (`"Junior DBA | Data Engineer | Web Developer"`)
   - Warna Semula: `#3B5E34` (`--moss-dark`)
   - Latar: `#1F2A44` (`--sky-night`)
   - Rasio Kontras Awal: **1.92:1** (Gagal standar WCAG AA $\ge 4.5:1$ & AAA $\ge 7:1$).
   - Dampak visual: Teks hampir tidak terlihat (*illegible*).

2. **Label Section Lokasi di Atas Tiap Section (Mobile)**:
   - Komponen: `src/pages/Home.jsx`
   - Teks: `"LOKASI: QUEST LOG"`, `"LOKASI: SKILL TREE"`, `"LOKASI: GUILD HALL"`, `"LOKASI: KOTAK POS"`, `"LOKASI: PAPAN PESAN"`
   - Warna Semula: `#24160B/80`
   - Latar: `#1F2A44` (`--sky-night`)
   - Rasio Kontras Awal: **1.25:1** (Gagal standar WCAG AA).
   - Dampak visual: Sangat gelap dan tenggelam di atas langit malam.

*Catatan Elemen Lain*: Seluruh teks di dalam section (`HeroSection`, `QuestsSection`, `SkillTreeSection`, `GuildSection`, `ContactSection`, `GuestbookSection`) berada di dalam kontainer `<Panel>` yang memiliki latar krem terang (`#F6EBD3` / `#FFFDF8`), sehingga warna `--moss-dark` di dalam panel tetap memiliki kontras tinggi ($\ge 7:1$) dan sengaja dipertahankan agar tidak menjadi krem di atas krem.

---

## 2. Solusi & Implementasi Teknis

1. **Sinkronisasi Atribut `:root[data-theme="..."]`**:
   - Di `src/hooks/useTimeOfDay.js`, ditambahkan efek sinkronisasi yang secara reaktif menyematkan atribut `data-theme` pada elemen `:root` (`document.documentElement`).
   - Nilai atribut secara dinamis mengikuti fase waktu (`day`, `dusk`, `night`).

2. **Token Warna Khusus Outdoor di `tokens.css`**:
   - Didefinisikan token outdoor di `:root`:
     - `--outdoor-tagline-color: var(--moss-dark);`
     - `--outdoor-label-color: #24160B;`
   - Di `:root[data-theme="night"]`, dioverride ke token terang `--cream` (`#F6EBD3`):
     - `--outdoor-tagline-color: var(--cream);`
     - `--outdoor-label-color: var(--cream);`

3. **Kelas Utilitas di `global.css`**:
   - Ditambahkan aturan override spesifik:
     ```css
     :root[data-theme="night"] .text-outdoor-tagline,
     :root[data-theme="night"] [data-outdoor-tagline] {
       color: var(--cream) !important;
     }

     :root[data-theme="night"] .text-outdoor-label,
     :root[data-theme="night"] [data-outdoor-label] {
       color: var(--cream) !important;
     }
     ```

4. **Kondisional JSX di `src/pages/Home.jsx`**:
   - Tagline mobile dan label lokasi section menggunakan kelas `.text-outdoor-tagline` dan `.text-outdoor-label`, serta evaluasi `isNight ? 'text-[var(--cream)]' : ...`.
   - **Hanya warna teks yang diubah**. Warna latar belakang, border, bayangan, tombol, dan badge tetap 100% utuh sesuai desain asli.
   - Tema siang (`day`) dan senja (`dusk`) **tidak diubah sama sekali**.

---

## 3. Hasil Pengukuran Rasio Kontras WCAG 2.1

Perhitungan luminansi relatif ($L$) dan rasio kontras ($(L_1 + 0.05) / (L_2 + 0.05)$):

| Elemen Teks | Warna Teks | Latar Belakang | Luminansi Teks ($L_1$) | Luminansi Latar ($L_2$) | Rasio Kontras | Status WCAG |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Tagline (*Sebelum*) | `#3B5E34` | `#1F2A44` (Sky Night) | 0.0917 | 0.0237 | **1.92:1** | ❌ Gagal |
| Label Section (*Sebelum*) | `#24160B` | `#1F2A44` (Sky Night) | 0.0088 | 0.0237 | **1.25:1** | ❌ Gagal |
| **Tagline (*Sesudah*)** | **`#F6EBD3` (--cream)** | **`#1F2A44` (Sky Night)** | **0.8372** | **0.0237** | **12.05:1** | **✅ Lolos AAA** |
| **Label Section (*Sesudah*)** | **`#F6EBD3` (--cream)** | **`#1F2A44` (Sky Night)** | **0.8372** | **0.0237** | **12.05:1** | **✅ Lolos AAA** |
| Tagline (*Sesudah*) | `#F6EBD3` (--cream) | `#18243C` (Canvas Btm) | 0.8372 | 0.0175 | **13.08:1** | **✅ Lolos AAA** |
| Tagline (*Sesudah*) | `#F6EBD3` (--cream) | `#080E1E` (Canvas Top) | 0.8372 | 0.0046 | **16.25:1** | **✅ Lolos AAA** |

> **Kesimpulan Kontras**: Rasio kontras melonjak dari **1.92:1** menjadi **12.05:1**, melampaui batas minimum WCAG AA ($\ge 4.5:1$) dan bahkan melampaui batas ketat WCAG AAA ($\ge 7.0:1$).

---

## 4. Verifikasi Baseline Layout (0px Drift Guarantee)

Pengukuran bounding box pada build produksi (`dist/`) menggunakan Puppeteer membuktikan ukuran font dan layout tidak berubah sama sekali:

| Viewport | Parameter | Siang (Day) | Senja (Dusk) | Malam (Night) | Selisih (Drift) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile 390×844** | Tagline Font Size | 12.00 px | 12.00 px | 12.00 px | **0.00 px** |
| **Mobile 390×844** | Tagline Box Top | 216.19 px | 216.19 px | 216.19 px | **0.00 px** |
| **Mobile 390×844** | Tagline Box Height | 16.00 px | 16.00 px | 16.00 px | **0.00 px** |
| **Mobile 390×844** | Section Label Top | 1013.19 px | 1013.19 px | 1013.19 px | **0.00 px** |
| **Mobile 390×844** | Dialog Box Top | 248.19 px | 248.19 px | 248.19 px | **0.00 px** |
| **Desktop 1280×720** | Dialog Box Top | 376.59 px | 376.59 px | 376.59 px | **0.00 px** |
| **Desktop 1280×720** | CTA Button Top | 532.59 px | 532.59 px | 532.59 px | **0.00 px** |

---

## 5. File Verifikasi & Screenshot

- **Mobile Malam (Sebelum)**: `docs/seru2/contrast-fix/mobile-390x844-night-before.png`
- **Mobile Malam (Sesudah - Hero & Tagline)**: `docs/seru2/contrast-fix/mobile-390x844-night.png`
- **Mobile Malam (Sesudah - Quest Log & Skill Tree)**: `docs/seru2/contrast-fix/mobile-390x844-quests-night.png`
- **Mobile Siang (Tetap Hijau Tua)**: `docs/seru2/contrast-fix/mobile-390x844-day.png`
- **Mobile Senja (Tetap Hijau Tua)**: `docs/seru2/contrast-fix/mobile-390x844-dusk.png`
- **Data Metrik Lengkap JSON**: `docs/seru2/contrast-fix/contrast-fix-report.json`
