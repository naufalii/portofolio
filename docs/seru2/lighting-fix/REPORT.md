# Laporan Verifikasi Pencahayaan Malam (Seru #2 Susulan)

## Ringkasan Perbaikan
Sesuai arahan, telah dilakukan penyempurnaan pencahayaan malam prosedural pada landmark bangunan dan pembersihan selector waktu:

1. **Jendela Quest Log (Rumah) di Malam Hari**:
   - Dinding kabin Quest Log pada fase malam dibuat dengan warna kayu gelap (`#3A2012`), memberikan kontras tinggi terhadap jendela yang menyala di latar gelap.
   - Jendela berukuran $10 \times 7\text{ px}$ diisi kaca amber hangat (`#E8B03A`), inti cahaya lilin krem terang (`#FFFDF8` / `#F6EBD3` dengan flicker bertahap), bingkai kusen kayu gelap (`#24160B`), serta tumpahan cahaya lembut di sekitarnya dan pantulan halus di tanah.
   - Lentera tiang di sebelah kiri Quest Log dilengkapi dengan *radial gradient glow* dan titik api hangat.

2. **Lentera Desa Awal (Hero Village)**:
   - Lentera tiang kayu dilengkapi gradasi radial lembut (*soft ambient glow*, radius 8px) dari inti terang (`rgba(255, 253, 248, 0.75)`) menuju amber lembut (`rgba(232, 176, 58, 0.45)`) hingga transparan.
   - Menghasilkan efek *cahaya lembut di sekitarnya* dan pantulan cahaya halus di permukaan tanah tanpa keluar dari bounding box landmark.
   - Jendela rumah Desa Awal menyala hangat dengan aksen kusen malam.

3. **Kotak Pos (Contact Post)**:
   - Lentera tiang pagar dilengkapi *soft ambient glow* radial.
   - Kotak pos diberi titik lampu kecil hangat (*warm indicator light*) di bagian atas dan cahaya hangat pada celah surat masuk.

4. **Guild Hall & Papan Pesan**:
   - Dua bay window Guild Hall menyala amber/krem hangat dengan kusen kayu malam.
   - Papan pesan dilengkapi lentera baca malam.
   - Skill tree memancarkan partikel starlight lembut di malam hari.

5. **Pembersihan Selector Waktu di Header**:
   - Label teks dan badge "SIMULASI" telah dihapus dari tombol header dan menu dropdown.
   - Dimensi tombol dan tap target tetap identik (min. 44×44 px), sejajar rapi dengan tombol Mode CV.

---

## Verifikasi Posisi & Selisih Piksel (0px Drift Guarantee)

Berdasarkan pengukuran otomatis melalui Puppeteer pada build produksi:

### Desktop (1280×720 & 1024×768)

| Viewport | Fase | Dialog Top | CTA Top | Landmark Ground Y | Drift Dialog | Drift CTA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1280×720** | Siang | 376.59 px | 532.59 px | 342.00 px | **0.00 px** | **0.00 px** |
| **1280×720** | Malam | 376.59 px | 532.59 px | 342.00 px | **0.00 px** | **0.00 px** |
| **1280×720** | Senja | 376.59 px | 532.59 px | 342.00 px | **0.00 px** | **0.00 px** |
| **1024×768** | Siang | 376.59 px | 532.59 px | 365.00 px | **0.00 px** | **0.00 px** |
| **1024×768** | Malam | 376.59 px | 532.59 px | 365.00 px | **0.00 px** | **0.00 px** |
| **1024×768** | Senja | 376.59 px | 532.59 px | 365.00 px | **0.00 px** | **0.00 px** |

Seluruh landmark berdiri tegak tepat di garis tanah (`bottom: 342px` di 1280×720, `bottom: 365px` di 1024×768) dengan selisih posisi vertikal **0.00 px** dari baseline.

---

## Dampak pada Mobile

- **Perubahan Canvas Shared**: Canvas latar dipakai bersama antara desktop dan mobile. Perubahan pencahayaan (warna jendela dan glow lentera) otomatis tampil di mobile tanpa mengubah ukuran atau tata letak elemen mobile apa pun.
- **Ukuran Tap Target**: Tombol pemilih waktu di header mobile berukuran $45.97 \times 44\text{ px}$ (memenuhi standar aksesibilitas minimum $44 \times 44\text{ px}$) dan sejajar dengan tombol CV ($44 \times 44\text{ px}$).
- **Layout Shift**: **0 px**.

---

## File Screenshot Terkait

- Desktop 1280×720 Malam: `docs/seru2/lighting-fix/desktop-1280x720-night.png`
- Desktop 1280×720 Siang: `docs/seru2/lighting-fix/desktop-1280x720-day.png`
- Desktop 1280×720 Senja: `docs/seru2/lighting-fix/desktop-1280x720-dusk.png`
- Desktop 1024×768 Malam: `docs/seru2/lighting-fix/desktop-1024x768-night.png`
- Mobile 390×844 Malam: `docs/seru2/lighting-fix/mobile-390x844-night.png`
- Data Pengukuran Mentah: `docs/seru2/lighting-fix/lighting-fix-report.json`
