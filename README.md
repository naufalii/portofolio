# Portfolio Overworld (Ghibli &times; Pixel Art)

Portofolio personal interaktif untuk **Naufal Ali Hilmi** (Mahasiswa Sistem Informasi Universitas Gunadarma, spesialisasi System Administrator & Oracle DBA).

---

## 🛠️ Tech Stack (Locked per PLAN.md)

- **Frontend**: React 18.3.1 (JSX), Vite 6.1.2, Tailwind CSS v4, Motion 12.4.7, React Router 6.28.2
- **UI & Pixel Styling**: Design Tokens CSS (`tokens.css`), `@pxlkit/ui-kit`, `pixel-retroui`, `pixicons`
- **Backend API**: Python 3.12, FastAPI, Pydantic, Psycopg 3 (Postgres)
- **Database**: Neon Postgres (Serverless Postgres)
- **Deployment**: Vercel (Frontend SPA + Python Serverless API)

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js >= 20.x
- Python >= 3.12
- Git

### 2. Setup Frontend
```bash
# Install dependencies (versi terpin exact)
npm install

# Jalankan Vite development server
npm run dev
```
Buka browser di `http://localhost:5173`.

### 3. Setup Backend API
```bash
# Buat virtual environment python
python -m venv .venv

# Aktifkan virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate

# Install requirements terpin
pip install -r requirements.txt

# Jalankan migrasi database
python api/migrate.py

# Jalankan API server FastAPI
uvicorn api.index:app --reload --port 8000
```
Cek endpoint: `http://localhost:8000/api/health`.

### 4. Menjalankan Automated Test Suite
```bash
python test_backend.py
```
Memverifikasi:
- Health check HTTP 200
- Validasi form (menolak data tidak valid)
- Honeypot anti-spam
- Moderasi pesan guestbook
- Rate limiting database (maks 3 pengiriman/jam)

### 5. Build Produksi
```bash
npm run build
npm run preview
```

---

## 📝 Panduan Mengisi Konten Pemilik (`src/content/profile.js`)

Sesuai aturan *No AI Slop* pada `PLAN.md`, agen AI tidak mengarang bio, statistik, atau pengalaman. Pemilik dapat melengkapi field bertanda `TODO_OWNER` di file:
`src/content/profile.js`

Field yang dapat diisi:
- `tagline`: Kalimat moto/tagline pribadi.
- `bio_dialog`: Kalimat dialog RPG untuk kotak dialog Hero Desa Awal.
- `quests`: Tambahan repositori proyek atau praktikum.
- `organisasi`: Periode dan peran kepengurusan di BEM FIKTI dan UGPreneurs.
- `cv_pdf`: Letakkan file CV PDF asli di `public/cv.pdf`.

---

## 🔐 Environment Variables

Salin `.env.example` menjadi `.env` lalu sesuaikan isinya:
- `DATABASE_URL`: URI koneksi Neon Postgres (`postgresql://...`)
- `ADMIN_TOKEN`: Token rahasia otentikasi admin untuk menyetujui guestbook
- `IP_SALT`: Salt acak untuk hashing IP pengunjung
- `ALLOWED_ORIGIN`: URL frontend untuk CORS (mis. `http://localhost:5173` atau domain produksi)
- `GITHUB_USERNAME`: Username GitHub (default: `naufalii`)
- `GITHUB_TOKEN`: Personal Access Token GitHub (opsional, untuk menaikkan rate limit)

---

## ☁️ Deployment ke Vercel

1. Push repository ke GitHub.
2. Impor proyek di dashboard Vercel.
3. Framework Preset: **Vite**. Output directory: `dist`.
4. Masukkan Environment Variables di Vercel Dashboard (sesuai `.env.example`).
5. Deploy! Vercel otomatis menjalankan Vite build dan Python runtime 3.12 untuk endpoint serverless `/api/*`.
