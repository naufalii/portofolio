# Portfolio Overworld (Ghibli &times; Pixel Art)

Portofolio personal interaktif untuk **Naufal Ali Hilmi** (Mahasiswa Sistem Informasi Universitas Gunadarma, spesialisasi System Administrator & Oracle DBA).

---

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 (JSX), Vite 6.1.2, Tailwind CSS v4, Motion 12.4.7, React Router 6.28.2
- **UI & Pixel Styling**: Design Tokens CSS (`tokens.css`), `@pxlkit/ui-kit`, `pixel-retroui`, `pixicons`
- **Backend API**: Python 3.12, FastAPI, Pydantic, Psycopg 3 (Postgres)
- **Deployment**: Vercel (Frontend SPA + Python Serverless API)

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Prasyarat
- Node.js >= 20.x
- Python >= 3.12

### 2. Setup Frontend
```bash
# Install dependencies (versi terpin exact)
npm install

# Jalankan development server
npm run dev
```
Buka browser di `http://localhost:5173`.

### 3. Setup Backend API
```bash
# Buat virtual environment python
python -m venv .venv

# Aktifkan virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Jalankan API server
uvicorn api.index:app --reload --port 8000
```
Cek endpoint: `http://localhost:8000/api/health`.

### 4. Build Produksi
```bash
npm run build
npm run preview
```

---

## 🔐 Environment Variables

Salin `.env.example` menjadi `.env` lalu sesuaikan isinya:
- `DATABASE_URL`: URI koneksi Neon Postgres
- `ADMIN_TOKEN`: Token rahasia otentikasi admin
- `IP_SALT`: Salt untuk hash IP pengunjung
- `ALLOWED_ORIGIN`: URL frontend untuk CORS
- `GITHUB_USERNAME`: Username GitHub (default: `naufalii`)
- `GITHUB_TOKEN`: Personal Access Token GitHub (opsional)

---

## ☁️ Deployment ke Vercel

1. Push repository ke GitHub.
2. Impor proyek di dashboard Vercel.
3. Framework Preset: **Vite**.
4. Masukkan Environment Variables di Vercel Dashboard (sesuai `.env.example`).
5. Deploy! Vercel otomatis menjalankan Vite build dan Python runtime 3.12 untuk endpoint `/api/*`.
