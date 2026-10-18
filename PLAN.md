# PLAN.md — Portfolio "Overworld" (Ghibli × Pixel Game)

> Dokumen ini adalah **spesifikasi final** untuk dieksekusi oleh AI agent (Antigravity).
> Semua keputusan di sini sudah dikunci. Jika ada yang ambigu, **berhenti dan tanya pemilik**, jangan berasumsi.

---

## 0. Aturan Kerja untuk Agent

1. Kerjakan **berurutan per fase** (Bagian 12). Jangan lompat fase.
2. Di akhir tiap fase: jalankan build, jalankan checklist *Acceptance Criteria* fase tsb, lalu **berhenti dan laporkan** sebelum lanjut.
3. **Dilarang** menambah dependency di luar daftar Bagian 3 tanpa izin pemilik.
4. Semua versi paket **dipin persis** (tanpa `^` / `~`). Cek versi stabil terbaru saat install, lalu pin.
5. Jangan menyalin aset atau karakter berhak cipta (Studio Ghibli, Nintendo, dll.). Tema Ghibli = *mood* dan palet saja.
6. Commit kecil dan sering. Pesan commit format: `feat|fix|style|chore: deskripsi singkat`.
7. Deploy preview ke Vercel **sejak fase 1** dan jaga agar selalu hijau.
8. Setiap perubahan visual wajib dibuat khusus per breakpoint dan diverifikasi dengan screenshot di **mobile dan desktop** sebelum selesai. Perubahan yang mengubah breakpoint lain dianggap bug.

## 1. Tujuan

Website portofolio personal interaktif untuk **Naufal Ali Hilmi** (mahasiswa Sistem Informasi, Universitas Gunadarma) yang menarget internship **System Administrator / DBA (Oracle)**.

Dua audiens:
- **Recruiter**: harus paham siapa pemiliknya dalam ≤10 detik → disediakan **Mode CV** (Bagian 5).
- **Pengunjung umum**: pengalaman eksploratif ala peta dunia game dengan suasana Ghibli.

Bahasa konten: **Indonesia** utama, istilah teknis tetap Inggris. Toggle bahasa **tidak** dibuat (di luar scope).

## 2. Hard Rules: "No AI Slop"

- DILARANG: gradient ungu-biru, glassmorphism, kartu rounded generik berulang, emoji sebagai dekorasi, font Inter/Poppins/Press Start 2P, teks template ("passionate developer", "welcome to my portfolio").
- Setiap section punya **ilustrasi + interaksi khas sendiri**, bukan grid kartu yang sama diulang.
- Animasi harus punya alasan (transisi lokasi, feedback tombol, atmosfer). Tidak ada animasi dekoratif tanpa fungsi.
- Semua klaim di konten harus bisa diverifikasi lewat link repo/sertifikat. Tidak ada angka karangan.
- Copywriting memakai file konten yang diisi pemilik (Bagian 14). **Agent tidak boleh mengarang bio, pengalaman, atau statistik.** Gunakan placeholder `TODO_OWNER` yang terlihat jelas.

## 3. Tech Stack (LOCKED)

| Layer | Pilihan | Catatan |
|---|---|---|
| Bahasa | JavaScript (JSX) | Tanpa TypeScript. JSDoc opsional |
| Build | Vite | |
| UI | React 18.3.x + React Router | 18.3 dipilih agar kompatibel dengan semua lib UI pilihan |
| Styling | Tailwind CSS v4 | v4 wajib untuk Pixelact UI |
| UI kit pixel | `@pxlkit/ui-kit` (utama) | Reskin via variabel `--retro-*` |
| UI kit cadangan | `pixelact-ui`, `pixel-retroui` | Hanya jika Pxlkit tidak punya komponen yang dibutuhkan |
| Ikon | `pixicons` (16×16) + ikon custom | |
| Animasi UI | `motion` (import dari `motion/react`) | MIT, v12 |
| Animasi scroll | `gsap` + `@gsap/react` (ScrollTrigger) | **Hanya dipasang jika** butuh scroll timeline yang di-scrub (Fase 3) |
| Background | Canvas 2D native | Tanpa PixiJS, kecuali profiling menunjukkan perlu |
| Audio | Web Audio / `<audio>` native | Default **mati** |
| Backend | Python 3.12 + FastAPI | Folder `/api` |
| Database | Postgres (Neon via Vercel Marketplace) | Driver: `psycopg[binary]` |
| Hosting | Vercel | Satu repo: frontend + API |

**Mitigasi risiko library kecil** (Pxlkit/Pixelact/Pixicons berumur muda, unduhan rendah):
- Semua dipakai lewat **wrapper sendiri** di `src/components/ui/`. Halaman tidak boleh import langsung dari library.
- Jika sebuah komponen dipakai di ≥3 tempat, **salin kodenya ke repo** dan lepaskan dependency-nya.

## 4. Design System

### 4.1 Palet (design tokens, definisikan sebagai CSS variables di `src/styles/tokens.css`)

| Token | Hex | Pakai untuk |
|---|---|---|
| `--cream` | `#F6EBD3` | Latar panel, kertas |
| `--cloud` | `#FFFFFF` | Awan, highlight |
| `--sky-day` | `#8FC6E8` | Langit siang |
| `--sky-dusk` | `#F2A66B` | Langit senja / dawn |
| `--sky-night` | `#1F2A44` | Langit malam |
| `--moss` | `#5E8B4A` | Rumput, aksen utama |
| `--moss-dark` | `#3B5E34` | Bayangan rumput, border aktif |
| `--sunset` | `#E8793A` | CTA, aksen hangat |
| `--ink` | `#3A2A1E` | Teks utama, border pixel |

Aturan: maksimal 9 warna di atas untuk UI. Warna tambahan hanya untuk ilustrasi sprite (maks 16 warna per sprite). Kontras teks vs latar **≥ 4.5:1**.

### 4.2 Tipografi
- **Heading / label game**: `Pixelify Sans` (alternatif: `Silkscreen`). Hanya untuk heading, tombol, dan label pendek.
- **Body / teks panjang**: `Nunito` (alternatif: `Lora`). Jangan pernah pakai font pixel untuk paragraf.
- Muat via Google Fonts dengan `font-display: swap` dan fallback stack yang nyata (`system-ui, sans-serif`).
- Skala: 14 / 16 / 20 / 28 / 40 / 56 px. Body minimal 16px.

### 4.3 Bahasa visual pixel
- Unit dasar **4px**. Semua margin/padding kelipatan 4.
- Border panel 4px solid `--ink`, sudut berundak (staircase), shadow offset blok tanpa blur (`4px 4px 0 var(--ink)`).
- Semua gambar/sprite: `image-rendering: pixelated`.
- Tidak ada `border-radius` halus pada elemen game. Sudut membulat hanya lewat pola pixel.

### 4.4 Aturan motion
- Sprite & elemen game: easing `steps(n)` (bukan ease halus).
- Transisi UI (panel buka/tutup, perpindahan lokasi): Motion, durasi 200–400ms, easing `easeOut`.
- Atmosfer (awan, rumput): loop lambat, 20–60 dtk per siklus.
- Wajib menghormati `prefers-reduced-motion`: semua loop berhenti, transisi jadi instan/fade, dialog tanpa efek ketik.

## 5. Konsep & Arsitektur Halaman

**Single-page overworld**, dengan Mode CV sebagai alternatif linear.

| Section | Metafora | Konten | Interaksi khas |
|---|---|---|---|
| Hero | Desa awal | Maskot + kotak dialog RPG berisi pengenalan | Efek ketik (30ms/char), klik/tap untuk skip, tombol "Mulai Jelajah" dan "Mode CV" |
| Projects | Quest Log | Proyek sebagai "quest": judul, deskripsi, stack, status, link repo/demo | Daftar quest di kiri, detail di kanan (desktop) / accordion (mobile). Highlight repo terbaru dari GitHub |
| Skills | Skill Tree | 3 cabang: Database (Oracle dll.), SysAdmin, Web Dev | Node bisa di-hover/tap untuk detail; level bar bergaya pixel |
| Guild Hall | Balai organisasi | BEM FIKTI, UGPreneurs, dll. | Timeline horizontal bergaya papan pengumuman |
| Contact | Kotak pos | Form kontak + link sosial | Animasi surat masuk ke kotak pos saat submit sukses |
| Guestbook | Papan pesan | Pesan pengunjung yang sudah dimoderasi | Pesan tampil sebagai tempelan kertas |
| 404 | Tersesat | Halaman 404 bertema game | |

**Navigasi**: peta dunia di atas, dengan penanda lokasi per section. Klik lokasi → kamera "bergeser" ke section tsb (desktop: translate horizontal dengan Motion; mobile: scroll vertikal biasa). Navigasi keyboard penuh (Tab, Enter, panah).

**Mode CV** (`/cv`): halaman linear bersih tanpa canvas berat, tetap memakai palet, font, dan komponen yang sama. Isi: ringkasan, proyek, skill, organisasi, kontak, dan tombol unduh CV (PDF dari `public/`, disediakan pemilik).

**Siklus waktu**: latar berubah mengikuti jam lokal pengunjung:
- 05:00–07:00 dawn · 07:00–16:00 siang · 16:00–18:00 senja · 18:00–05:00 malam.
- Transisi antar fase memakai crossfade 1,5 dtk.
- Malam: bintang kecil + kunang-kunang. Siang: awan + biji dandelion melayang.

## 6. Peta Komponen (sumber)

| Komponen | Sumber | Catatan |
|---|---|---|
| Button, Input, Textarea, Label | Pxlkit → wrapper `PixelButton` dll. | Reskin ke token |
| Panel / Dialog box | Custom (pakai gaya pixel di 4.3) | Dipakai di mana-mana |
| Progress bar skill | Pxlkit / `pixel-retroui` | |
| Modal, Toast | Pxlkit | Toast untuk status form |
| Ikon | `pixicons` + ikon custom (SVG pixel) | |
| Typewriter dialog | Custom | `aria-live="polite"`, bisa di-skip |
| Pixel cursor | Referensi komponen "Pixel Cursor" di 21st.dev, tulis ulang sendiri | **Hanya desktop** (`pointer: fine`) |
| Loader | Custom (sprite maskot berjalan) | Pengganti spinner generik |
| 404 | Custom, terinspirasi komponen "8bit 404 Page" | |
| Sprite player | Custom (`<Sprite>`: spritesheet + `steps()`) | |
| Background canvas | Custom (Bagian 7) | |

Jangan menyalin komponen 21st.dev mentah-mentah. Gunakan sebagai referensi lalu sesuaikan ke tokens dan gaya sendiri.

## 7. Spesifikasi Background & Animasi

### 7.1 Canvas pixel-perfect
- Render pada **resolusi internal rendah** (mis. 320×180), lalu di-scale ke layar dengan `image-rendering: pixelated`. Ini membuat tampilan benar-benar pixel dan sangat ringan.
- Satu `requestAnimationFrame` loop, di-pause saat tab tidak aktif (`visibilitychange`) dan saat canvas tidak terlihat (`IntersectionObserver`).
- Di perangkat lemah (deteksi: `navigator.hardwareConcurrency <= 4` atau FPS < 40 selama 2 dtk), turunkan resolusi internal dan matikan partikel.

### 7.2 Layer parallax (belakang → depan)
1. Langit (gradient CSS/canvas sesuai fase waktu)
2. Awan jauh (lambat) + bintang (malam)
3. Bukit jauh (silhouette `--moss-dark` dengan opacity)
4. Bukit tengah
5. Rumput depan (sway sederhana, 2–3 frame)
6. Partikel (dandelion siang / kunang-kunang malam), maks 30 partikel desktop, 12 mobile

Parallax mengikuti posisi kamera/scroll. Di mobile, parallax dikurangi menjadi 3 layer.

### 7.3 Sprite maskot (ORIGINAL)
- Ukuran 32×32, palet maks 16 warna.
- Animasi: `idle` 4 frame, `walk` 6 frame, `wave` 4 frame.
- Aset final dibuat/diberikan pemilik (Aseprite/LibreSprite). **Sebelum aset siap**, agent memakai placeholder kotak berwarna bertanda `PLACEHOLDER_SPRITE` dan struktur `<Sprite>` yang sudah final, jadi tinggal tukar file.

### 7.4 Audio (opsional, default mati)
- Toggle kecil di pojok. Preferensi disimpan di `localStorage` dengan try/catch.
- Efek: klik UI, ambience angin pelan (loop). Semua file < 100KB, lisensi dicatat di `ASSETS_LICENSES.md`.

## 8. Responsive

| Breakpoint | Perilaku |
|---|---|
| 360–767 | Mobile: scroll vertikal, parallax 3 layer, navigasi bawah, tanpa pixel cursor, tap/swipe |
| 768–1023 | Tablet: layout 2 kolom di Projects/Skills, navigasi atas |
| 1024–1439 | Desktop: peta horizontal penuh, pixel cursor aktif |
| ≥1440 | Desktop lebar: konten dibatasi `max-width: 1280px`, canvas tetap penuh |

Aturan:
- Mobile-first. Tidak ada interaksi yang **hanya** bisa lewat hover.
- Area tap minimal 44×44px.
- Tidak ada horizontal scroll pada `body` di semua ukuran.
- `<meta name="viewport" content="width=device-width, initial-scale=1">`. Pakai `100dvh`, bukan `100vh`, untuk section penuh layar di mobile.
- Uji wajib di: Chrome Android, Safari iOS, Chrome/Firefox/Edge desktop.

## 9. Backend (FastAPI di `/api`)

### 9.1 Endpoint

| Method | Path | Fungsi |
|---|---|---|
| POST | `/api/contact` | Simpan pesan kontak |
| GET | `/api/guestbook` | Ambil pesan guestbook yang `approved = true`, terbaru dulu, maks 50 |
| POST | `/api/guestbook` | Kirim pesan (masuk `approved = false`) |
| GET | `/api/github` | Proxy daftar repo terbaru milik `GITHUB_USERNAME` |
| GET | `/api/highscore` | Top 10 skor (Fase 6, opsional) |
| POST | `/api/highscore` | Kirim skor (Fase 6, opsional) |
| GET | `/api/admin/messages` | Lihat pesan kontak & guestbook pending. Header `X-Admin-Token` |
| POST | `/api/admin/guestbook/{id}/approve` | Setujui pesan guestbook. Header `X-Admin-Token` |
| GET | `/api/health` | Cek status |

### 9.2 Validasi & keamanan
- Validasi dengan Pydantic. Batas: `name` ≤ 40, `email` valid, `message` ≤ 500 karakter. Trim dan tolak string kosong.
- **Honeypot**: field tersembunyi `website`; jika terisi → respon sukses palsu, jangan simpan.
- **Rate limit** tanpa state di memori (serverless): hitung baris per `ip_hash` dalam 1 jam di DB. Contact maks 3/jam, guestbook maks 3/jam, highscore maks 10/jam.
- `ip_hash` = SHA-256 dari (IP + `IP_SALT`). **Jangan simpan IP mentah.**
- CORS: hanya `ALLOWED_ORIGIN` (domain produksi + origin preview Vercel bila perlu). Karena frontend memanggil path relatif `/api`, sebagian besar kasus same-origin.
- Escape/sanitasi output di frontend (render sebagai teks, **bukan** `dangerouslySetInnerHTML`).
- Pesan error ke klien generik. Detail error hanya ke log.
- Endpoint admin memakai perbandingan token konstan-waktu (`hmac.compare_digest`).

### 9.3 Skema database

```sql
contact_messages(id serial pk, name text, email text, message text, ip_hash text, created_at timestamptz default now())
guestbook(id serial pk, name text, message text, approved boolean default false, ip_hash text, created_at timestamptz default now())
highscores(id serial pk, nickname text, score int, ip_hash text, created_at timestamptz default now())
```

Sediakan `api/schema.sql` dan skrip `api/migrate.py` yang idempoten (`CREATE TABLE IF NOT EXISTS`).

### 9.4 GitHub proxy
- Panggil GitHub API dari backend memakai `GITHUB_TOKEN` (opsional, untuk menaikkan rate limit).
- Kembalikan hanya: nama repo, deskripsi, bahasa, bintang, `pushed_at`, URL.
- Pasang header `Cache-Control: s-maxage=3600, stale-while-revalidate=86400` supaya CDN Vercel yang meng-cache, bukan memori fungsi.
- Jika gagal: frontend tampil dari data statis di `src/content/profile.js`. Tidak boleh ada section yang kosong atau error terlihat.

### 9.5 Environment variables (set di Vercel dashboard, jangan commit)
`DATABASE_URL`, `ADMIN_TOKEN`, `IP_SALT`, `ALLOWED_ORIGIN`, `GITHUB_USERNAME`, `GITHUB_TOKEN` (opsional). Sediakan `.env.example` tanpa nilai asli.

## 10. Struktur Repo

```
/
├─ api/
│  ├─ index.py            # FastAPI instance bernama `app`
│  ├─ routes/             # contact.py, guestbook.py, github.py, highscore.py, admin.py
│  ├─ db.py               # koneksi + helper
│  ├─ security.py         # hash IP, rate limit, token admin
│  ├─ schema.sql
│  └─ migrate.py
├─ public/
│  ├─ sprites/            # spritesheet .png
│  ├─ audio/
│  ├─ fonts/              # opsional self-host
│  └─ cv.pdf              # disediakan pemilik
├─ src/
│  ├─ components/
│  │  ├─ ui/              # wrapper PixelButton, Panel, DialogBox, dll.
│  │  ├─ world/           # WorldCanvas, Sprite, DayNight, Cursor
│  │  └─ sections/        # Hero, Quests, SkillTree, Guild, Contact, Guestbook
│  ├─ content/profile.js  # SEMUA teks & data konten (Bagian 14)
│  ├─ hooks/              # useTimeOfDay, useReducedMotion, useMediaQuery
│  ├─ lib/                # api.js (fetch wrapper), storage.js (try/catch)
│  ├─ pages/              # Home, CV, NotFound
│  ├─ styles/             # tokens.css, global.css
│  └─ main.jsx
├─ requirements.txt       # fastapi, psycopg[binary], pydantic[email], httpx (pin versi)
├─ vercel.json
├─ .env.example
├─ ASSETS_LICENSES.md
├─ PLAN.md
└─ package.json
```

## 11. Konfigurasi Vercel

- Framework preset: **Vite**. Output: `dist`.
- Python runtime: 3.12 (tulis di `.python-version`).
- `vercel.json` (verifikasi terhadap dokumentasi Vercel terbaru saat setup, sesuaikan jika entrypoint berubah):

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

- Fungsi serverless bersifat **stateless**: jangan menulis file lokal, jangan menyimpan state di memori, semua state di Postgres.
- Hubungkan repo GitHub: push ke `main` = production, branch lain = preview.
- Header keamanan dasar via `vercel.json` (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`).
- Domain custom: opsional, ditambahkan di Fase 5.

## 12. Fase, Task & Acceptance Criteria

### Fase 1 — Fondasi (Minggu 1)
- [ ] Init repo Vite + React + Tailwind v4; pasang font; buat `tokens.css` sesuai Bagian 4.1
- [ ] Setup `api/index.py` dengan `/api/health`; `vercel.json`; `requirements.txt`
- [ ] Wrapper UI dasar: `PixelButton`, `Panel`, `DialogBox`
- [ ] Halaman placeholder + deploy preview Vercel
- **Acceptance:** URL preview terbuka; `/api/health` mengembalikan 200; refresh di route SPA (mis. `/cv`) tidak 404; token warna terpakai (tidak ada hex hardcode di komponen).

### Fase 2 — Dunia (Minggu 2)
- [ ] `WorldCanvas` low-res + 6 layer parallax + siklus waktu (Bagian 7)
- [ ] `useTimeOfDay`, `useReducedMotion`, pause saat tab tidak aktif
- [ ] `<Sprite>` + placeholder maskot (idle/walk)
- [ ] Navigasi peta antar section (desktop) + scroll vertikal (mobile)
- **Acceptance:** ≥55 FPS di laptop menengah, ≥30 FPS di HP menengah; reduced-motion menghentikan semua loop; tampilan tajam (tidak blur) di layar HiDPI.

### Fase 3 — Konten (Minggu 3)
- [ ] Hero + dialog typewriter
- [ ] Quest Log (data dari `profile.js`; GitHub proxy menyusul di Fase 4)
- [ ] Skill Tree, Guild Hall
- [ ] Mode CV (`/cv`) + tombol unduh
- [ ] (Hanya bila perlu) pasang GSAP ScrollTrigger untuk transisi scroll
- **Acceptance:** semua teks berasal dari `profile.js`; tidak ada teks karangan agent (hanya `TODO_OWNER`); Mode CV terbaca penuh tanpa canvas; navigasi keyboard berfungsi di semua section.

### Fase 4 — Backend & polish (Minggu 4)
- [ ] Neon Postgres terhubung; `migrate.py` dijalankan
- [ ] `/api/contact`, `/api/guestbook`, `/api/github`, endpoint admin
- [ ] Form Contact + animasi kotak pos; Guestbook; Toast status
- [ ] 404 page, loader sprite, pixel cursor (desktop), audio toggle
- **Acceptance:** form menolak input tidak valid dan honeypot; rate limit bekerja (percobaan ke-4 dalam 1 jam ditolak); pesan guestbook baru **tidak tampil** sebelum di-approve; GitHub proxy fallback ke data statis saat gagal; tidak ada secret di repo atau bundle frontend.

### Fase 5 — QA & rilis (Minggu 5)
- [ ] Uji di HP asli (Android & iOS) dan 3 browser desktop
- [ ] Lighthouse mobile & desktop; perbaiki sampai target tercapai
- [ ] Audit aksesibilitas (keyboard, kontras, alt text, `aria-live`)
- [ ] Meta tag, OG image, favicon pixel, `robots.txt`, `sitemap.xml`
- [ ] Isi `ASSETS_LICENSES.md`; domain custom (opsional)
- **Acceptance:** semua target di Bagian 13 tercapai; checklist Definition of Done (Bagian 15) lengkap.

### Fase 6 — Stretch (opsional, hanya jika diminta pemilik)
- [ ] Mini-game "Tangkap biji dandelion" 30 detik + highscore (`/api/highscore`)

## 13. Target Performa, Aksesibilitas & Kualitas

- Lighthouse **mobile**: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- LCP < 2,5 dtk · CLS < 0,1 · INP < 200 ms (jaringan 4G terbatas).
- JS bundle awal (gzip) < 200 KB; code-split route `/cv` dan modul game/audio dengan `React.lazy`.
- Aset: spritesheet digabung, PNG dioptimasi, font di-subset bila memungkinkan, gambar non-kritis `loading="lazy"`.
- Aksesibilitas: urutan fokus logis, indikator fokus terlihat, `alt` untuk elemen informatif dan `aria-hidden` untuk dekoratif, canvas bukan satu-satunya sumber informasi.
- Tidak ada error/warning di console pada build produksi.

## 14. Konten yang Diisi Pemilik (`src/content/profile.js`)

Agent membuat struktur file dan field-nya. **Pemilik yang mengisi teksnya.** Nilai kosong ditulis `TODO_OWNER`.

```
nama:        Naufal Ali Hilmi
kampus:      Universitas Gunadarma, Sistem Informasi
target:      Internship System Administrator / DBA (Oracle)
tagline:     TODO_OWNER
bio_dialog:  TODO_OWNER   (3–5 baris untuk kotak dialog Hero)
sosial:
  github:    https://github.com/naufalii
  linkedin:  https://linkedin.com/in/naufalalihilmi
proyek (quest) — tiap item: judul, ringkasan, stack[], status, repo, demo?
  - Database Administration Labs  → https://github.com/naufalii/Database-Administration-Labs
  - Simplex Solver (linear programming web app) → repo: TODO_OWNER
  - tambahan: TODO_OWNER
skill (3 cabang): Database / SysAdmin / Web  → daftar + level jujur, TODO_OWNER
organisasi (guild): BEM FIKTI, UGPreneurs → peran & periode: TODO_OWNER
cv_pdf:      /cv.pdf
```

Alamat email **tidak** ditulis di frontend (anti-scraping). Pesan masuk lewat form kontak.

## 15. Definition of Done

- [ ] Semua fase 1–5 lulus Acceptance Criteria
- [ ] Production di Vercel dengan HTTPS, preview per branch aktif
- [ ] Responsive teruji di Android, iOS, dan desktop
- [ ] Target Lighthouse & performa (Bagian 13) tercapai
- [ ] Reduced-motion dan navigasi keyboard berfungsi
- [ ] Tidak ada secret di repo; `.env.example` lengkap
- [ ] Tidak ada teks `TODO_OWNER` yang tersisa di production
- [ ] `ASSETS_LICENSES.md` lengkap, tidak ada aset berhak cipta pihak lain
- [ ] README berisi cara jalan lokal, cara set env, dan cara deploy
