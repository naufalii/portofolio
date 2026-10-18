/**
 * Profile Content Specification — Naufal Ali Hilmi
 * Sumber Kebenaran: Data CV & Keputusan Pemilik (Checkpoint A)
 * 
 * Aturan Keras:
 * - Dilarang menambah klaim atau angka karangan (persentase level ditiadakan).
 * - Seluruh skill memiliki label bukti (proof label).
 * - Konten tanpa konfirmasi pemilik ditandai `needsOwnerConfirm: true` dan disembunyikan dari render.
 */

export const profile = {
  // [ID] Identitas
  nama: "Naufal Ali Hilmi",
  tagline: "Junior DBA | System Administrator | Web Developer",
  target: "Junior DBA | System Administrator | Web Developer",
  lokasi: "Depok, Indonesia",
  kampus: "Universitas Gunadarma, Sistem Informasi",

  // [ED1] Pendidikan
  pendidikan: {
    institusi: "Universitas Gunadarma",
    jurusan: "Sistem Informasi (S1) / Information Systems",
    periode: "Sept 2024 – sekarang",
    ipk: "3.90 / 4.00",
  },

  // [SM] Ringkasan Profil
  summary:
    "Mahasiswa S1 Sistem Informasi di Universitas Gunadarma dengan minat dan keahlian di Database Administration (Oracle), System Administration (Linux), dan Frontend Web Development. Menjembatani pembuatan solusi digital yang intuitif dengan pengelolaan infrastruktur backend yang andal. Berpengalaman dalam instalasi server, manajemen database, otomasi sistem (shell scripting), dan implementasi High Availability. Mudah beradaptasi dengan teknologi baru dan terbiasa menangani troubleshooting teknis yang kompleks.",

  // [LN] Tautan Terpusat (Bebas parameter pelacak)
  sosial: {
    github: "https://github.com/naufalii",
    linkedin: "https://www.linkedin.com/in/naufal-ali-hilmi-89a6b4270/",
    website: "https://portofolio-naufalalihilmi.vercel.app/",
    source_code: "https://github.com/naufalii/portofolio",
  },

  cv_pdf: "/cv.pdf",

  // Dialog Hero RPG (<=100 karakter per baris dialog)
  bio_dialog: [
    "Halo, pengelana! Saya Naufal Ali Hilmi.",
    "Mahasiswa Sistem Informasi di Universitas Gunadarma sejak 2024, IPK 3,90.",
    "Saya lagi mendalami Oracle Database dan administrasi sistem Linux, plus bikin web yang nyaman dipakai.",
    "Proyek utama saya sekarang: lab Oracle 19c dengan Data Guard, failover, dan backup otomatis RMAN.",
    "Di kampus saya terlibat di BEM FIKTI, UGPreneurs, dan GDGoC, dari jadi MC sampai urus logistik acara.",
    "Silakan jelajahi desa ini, atau buka Mode CV kalau butuh versi ringkasnya."
  ],

  // Proyek / Quest Log [PR1], [PR2]
  quests: [
    {
      id: "dba-labs",
      judul: "Oracle Database 19c Administration & High Availability Labs",
      status: "Berjalan",
      periode: "Mar 2026 – sekarang",
      tipe: "Independent Project",
      ringkasan: "Lab Oracle 19c Enterprise dari nol di Linux: instalasi, Data Guard (switchover, switchback, failover), dan backup otomatis dengan RMAN + shell script.",
      stack: ["Oracle Database 19c EE", "Linux", "Oracle Data Guard", "RMAN", "Shell Scripting"],
      detail: [
        "Merancang dan mendokumentasikan lingkungan lab praktik menyeluruh untuk Oracle Database 19c Enterprise Edition, dipublikasikan sebagai repositori open-source di GitHub.",
        "Instalasi dan konfigurasi lingkungan Oracle 19c di Linux dari nol, termasuk troubleshooting arsitektur jaringan dan masalah permission.",
        "Implementasi arsitektur Disaster Recovery (DR) dan High Availability (HA) dengan Oracle Data Guard.",
        "Konfigurasi dan eksekusi role transition: Switchover, Switchback, dan simulasi Failover antara Primary dan Standby Database untuk menjaga kontinuitas sistem tanpa kehilangan data.",
        "Shell scripting untuk otomasi proses backup, pemeliharaan sistem, dan recovery dengan RMAN (Recovery Manager)."
      ],
      repo: "https://github.com/naufalii/Database-Administration-Labs",
      demo: null,
      needsOwnerConfirm: false,
    },
    {
      id: "portfolio-overworld",
      judul: "Portfolio Overworld (Website Portofolio Ini)",
      status: "Live",
      periode: "2026",
      tipe: "Personal Project",
      ringkasan: "Website portofolio interaktif bertema Ghibli × pixel game dengan frontend React dan backend Python di Vercel.",
      stack: ["React 18", "Tailwind CSS v4", "Vite", "Motion", "Python 3.12", "FastAPI", "PostgreSQL (Neon)"],
      detail: [
        "Website portofolio personal interaktif bergaya game overworld 2D retro dengan canvas parallax bertema Ghibli.",
        "Dual interface: Mode Overworld eksploratif dan Mode CV linear dokumen kilat untuk recruiter.",
        "Frontend dibangun dengan React 18, Tailwind CSS v4, dan animasi Motion.",
        "Backend serverless Python 3.12 + FastAPI terintegrasi di folder /api dengan database PostgreSQL Neon dan hosting Vercel.",
        "Fitur interaktif: siklus waktu dinamis (Siang/Sore/Malam), Web Audio ambient synthesizer, form kontak berproteksi honeypot, dan buku tamu dengan moderasi."
      ],
      repo: "https://github.com/naufalii/portofolio",
      demo: "https://portofolio-naufalalihilmi.vercel.app/",
      needsOwnerConfirm: false,
    },
    {
      id: "simplex-solver",
      judul: "Simplex Solver",
      status: "Dalam Pengembangan",
      periode: "2025",
      tipe: "Academic Project",
      ringkasan: "Aplikasi web pemecah optimasi linear programming menggunakan metode Simplex.",
      stack: ["Python", "JavaScript", "Optimization Algorithms"],
      detail: [
        "Aplikasi web pemecah model matematika pemrograman linear berbasis algoritma Simplex."
      ],
      repo: null,
      demo: null,
      // K2: Belum diputuskan pemilik; disembunyikan dari render publik
      needsOwnerConfirm: true,
    }
  ],

  // 3 Cabang Skill Tree (Tanpa angka persentase karangan, dilengkapi label bukti Bagian 5)
  skillTree: {
    database: [
      {
        name: "Oracle 19c",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Instalasi, konfigurasi lab mandiri di Linux, arsitektur CDB/PDB, dan troubleshooting permission."
      },
      {
        name: "Oracle SQL Developer",
        proof: "Tercantum di CV",
        source: "CV",
        detail: "Query editor, pengelolaan objek basis data, navigasi skema, dan pengujian query."
      },
      {
        name: "Linux",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Administrasi Linux server, file permissions, arsitektur direktori Oracle, tuning kernel params."
      },
      {
        name: "Data Guard (HA/DR)",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Implementasi arsitektur High Availability & Disaster Recovery pada primary dan standby database."
      },
      {
        name: "Switchover/Failover",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Eksekusi role transition: Switchover terencana, Switchback, dan simulasi Failover darurat."
      },
      {
        name: "Automasi Data Broker & Failover",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Konfigurasi Data Guard Broker (DGMGRL) dan otomasi failover untuk ketahanan sistem."
      },
      {
        name: "RMAN Backup",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Strategi backup full & incremental, pemeliharaan archive log, dan prosedur restorasi bencana."
      },
      {
        name: "Shell Scripting",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Otomasi rutin pemeliharaan server, penjadwalan script backup RMAN, dan monitoring log."
      },
      {
        name: "SQL Queries",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Perancangan query relasional terstruktur, DDL, DML, indexing, dan manipulasi data."
      }
    ],
    sysAdmin: [
      {
        name: "Linux",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Administrasi sistem operasi Linux, manajemen user/grup, permission POSIX, dan systemd."
      },
      {
        name: "Shell Scripting",
        proof: "Dipraktikkan di proyek",
        source: "[PR1]",
        detail: "Pembuatan skrip bash otomasi backup sistem, sanitasi log, dan verifikasi status layanan."
      },
      {
        name: "Troubleshooting",
        proof: "Pengalaman",
        source: "[EX1], [EX2], [PR1]",
        detail: "Investigasi dan pemecahan kendala teknis jaringan lab, peralatan on-site, serta error sistem."
      },
      {
        name: "Problem Solving",
        proof: "Pengalaman",
        source: "[EX2], [EX3]",
        detail: "Pendekatan metodis dalam menyelesaikan masalah teknis operasional dan alur sistem."
      },
      {
        name: "Time Management",
        proof: "Tercantum di CV",
        source: "CV",
        detail: "Manajemen alokasi waktu yang disiplin antara kegiatan akademik, riset lab, dan kepanitiaan."
      },
      {
        name: "Adaptasi",
        proof: "Tercantum di CV",
        source: "CV",
        detail: "Cepat mempelajari teknologi baru, konfigurasi arsitektur baru, dan dinamika tim kerja."
      }
    ],
    webDev: [
      {
        name: "JavaScript",
        proof: "Dipraktikkan di proyek",
        source: "[PR2]",
        detail: "Pengembangan logika interaktif modern berbasis ES6+, asynchronous API handling, dan DOM."
      },
      {
        name: "React JS",
        proof: "Dipraktikkan di proyek",
        source: "[PR2]",
        detail: "Pembuatan antarmuka web reaktif berbasis komponen modular, custom hooks, dan state management."
      },
      {
        name: "Tailwind CSS",
        proof: "Dipraktikkan di proyek",
        source: "[PR2]",
        detail: "Perancangan antarmuka responsif utilitas tinggi, adaptasi tema desain retro, dan CSS variables."
      },
      {
        name: "HTML/CSS",
        proof: "Dipraktikkan di proyek",
        source: "[PR2]",
        detail: "Struktur markup semantik standar, styling pixelated retro, dan rendering lintas peramban."
      },
      {
        name: "WordPress",
        proof: "Sertifikat",
        source: "[CE1]",
        detail: "Pembuatan dan penataan situs web fungsional menggunakan platform CMS WordPress."
      },
      {
        name: "Content Management Systems (CMS)",
        proof: "Sertifikat",
        source: "[CE1]",
        detail: "Pengelolaan struktur konten digital, tata kelola media, dan konfigurasi tema/plugin CMS."
      }
    ],
    softSkills: [
      {
        name: "Public Speaking",
        proof: "Pengalaman",
        source: "[EX1], [CE4]",
        detail: "Pengalaman sebagai MC TechnoFair 12.0 memandu acara teknologi skala besar dan interaksi audiens."
      },
      {
        name: "Microsoft Excel",
        proof: "Sertifikat",
        source: "[CE5]",
        detail: "Pengolahan lembar kerja, formula kalkulasi data, dan analisis tabular bersertifikat."
      },
      {
        name: "Microsoft Office",
        proof: "Tercantum di CV",
        source: "CV",
        detail: "Penyusunan dokumen formal, pengolahan laporan kegiatan, dan pembuatan materi presentasi."
      },
      {
        name: "Team Coordination",
        proof: "Pengalaman",
        source: "[EX2], [EX3]",
        detail: "Koordinasi operasional logistik perlengkapan dan kolaborasi tim perancangan produk."
      },
      {
        name: "Kerja Tim",
        proof: "Pengalaman",
        source: "[EX2], [EX3]",
        detail: "Kolaborasi aktif lintas divisi organisasi kampus demi kelancaran eksekusi acara."
      }
    ]
  },

  // Guild Hall / Balai Organisasi [EX1], [EX2], [EX3] (Butir tumpang tindih telah digabung)
  organisasi: [
    {
      id: "bem-fikti",
      guild: "BEM FIKTI Universitas Gunadarma — TechnoFair 12.0",
      peran: "Event Division & Master of Ceremonies",
      periode: "Mar 2025 – Jul 2025",
      deskripsi: "Menjadi pembawa acara (full event host) acara teknologi skala besar TechnoFair 12.0: memandu jalannya acara dari awal hingga akhir, menjaga energi audiens, dan mengatur alur transisi antar sesi. Mendampingi pembicara serta menangani kendala teknis on-site agar seluruh sesi materi berlangsung lancar.",
      poin: [
        "Menjadi pembawa acara (full event host) TechnoFair 12.0: memandu jalannya acara dari awal hingga akhir, menjaga energi dan antusiasme audiens, serta mengatur alur transisi antar sesi.",
        "Mendampingi pembicara selama sesi materi, memastikan peserta mengikuti tanpa kendala, dan menangani pemecahan masalah teknis di tempat (on-site troubleshooting) agar acara tetap berjalan sesuai jadwal."
      ]
    },
    {
      id: "ugpreneurs",
      guild: "UGPreneurs — Logistic and Tools Division",
      peran: "Divisi Logistik & Perlengkapan",
      periode: "Agu 2025 – Nov 2025",
      deskripsi: "Menangani seluruh kebutuhan logistik Workshop P2MW Series 2 dan Series 3: koordinasi peralatan teknis, verifikasi kesiapan ruangan, pemantauan kelancaran acara pada platform hybrid (Zoom & offline), serta menjadi PIC utama penyelesaian kendala teknis on-site.",
      poin: [
        "Menangani seluruh kebutuhan logistik Workshop P2MW Series 2 dan Series 3: koordinasi peralatan teknis, verifikasi kesiapan ruangan, dan memastikan seluruh sarana siap sebelum acara.",
        "Memantau kelancaran jalannya acara pada platform hybrid (Zoom meeting dan layar proyektor untuk peserta offline) agar pengalaman peserta di kedua sisi tetap optimal.",
        "Bertindak sebagai narahubung utama penyelesaian kendala di tempat (peralatan rusak, error teknis) sehingga gangguan terminimalisasi dan sesi tetap berjalan lancar."
      ]
    },
    {
      id: "gdoc",
      guild: "Google Developer Groups on Campus (GDGoC)",
      peran: "Hustler",
      periode: "2025",
      deskripsi: "Merancang konsep ide platform pendidikan digital adaptif dan mempresentasikannya (pitching) kepada juri/investor. Berkolaborasi dengan tim pengembang teknis memetakan alur arsitektur sistem serta merumuskan mitigasi saat menghadapi kendala sistem.",
      poin: [
        "Merancang konsep ide platform pendidikan digital adaptif dan mempresentasikannya (pitching) di hadapan juri dan calon investor.",
        "Berkolaborasi intensif dengan tim pengembang teknis dalam memetakan alur arsitektur sistem serta merumuskan solusi alternatif saat menghadapi kendala teknis."
      ]
    }
  ],

  // Piagam & Sertifikasi Resmi [CE1]–[CE5]
  sertifikat: [
    {
      id: "ce-1",
      judul: "Build a Free Website with WordPress",
      penerbit: "Coursera",
      tahun: "2025"
    },
    {
      id: "ce-2",
      judul: "The AI Ignition Training: From Basics to Breakthroughs in AI",
      penerbit: "KUMPUL",
      tahun: "2025"
    },
    {
      id: "ce-3",
      judul: "FIKTI Learning 2025 Bootcamp \"Exploring the Data Universe: Hands-On Learning for Beginners\"",
      penerbit: "BEM FIKTI Universitas Gunadarma",
      tahun: "2025"
    },
    {
      id: "ce-4",
      judul: "Master of Ceremony in Workshop TechnoFair 12.0",
      penerbit: "BEM FIKTI Universitas Gunadarma",
      tahun: "2025"
    },
    {
      id: "ce-5",
      judul: "Bootcamp Excel",
      penerbit: "Zennit.id",
      tahun: "2024"
    }
  ],

  // [LG] Kemampuan Bahasa
  bahasa: [
    { nama: "Indonesia", level: "Native" },
    { nama: "English", level: "Professional" }
  ]
};

export default profile;
