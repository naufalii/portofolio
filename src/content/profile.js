/**
 * Profile Content Specification
 * Sesuai Bagian 1 & 14 PLAN.md & Catatan Revisi:
 * Target dikunci ke "System Administrator / DBA (Oracle)".
 */

export const profile = {
  nama: "Naufal Ali Hilmi",
  kampus: "Universitas Gunadarma, Sistem Informasi",
  target: "System Administrator / DBA (Oracle)",
  tagline: "Aspirant System Administrator & Oracle DBA • Mahasiswa Sistem Informasi Universitas Gunadarma",
  
  // 3-5 baris dialog untuk kotak dialog Hero RPG
  bio_dialog: [
    "Halo, pengelana! Saya Naufal Ali Hilmi.",
    "Mahasiswa Sistem Informasi di Universitas Gunadarma.",
    "Fokus utama saya adalah Database Administration (terutama Oracle 19c/21c, RMAN, SQL/PL*SQL) dan Linux System Administration.",
    "Saya siap berkontribusi dalam pengelolaan infrastruktur server dan basis data yang efisien, aman, dan handal.",
    "Jelajahi peta Overworld ini untuk melihat laporan proyek praktikum, keahlian teknis, dan riwayat organisasi saya!"
  ],

  sosial: {
    github: "https://github.com/naufalii",
    linkedin: "https://www.linkedin.com/in/naufal-ali-hilmi-89a6b4270",
  },

  // Proyek / Quest Log
  quests: [
    {
      id: "dba-labs",
      judul: "Database Administration Labs",
      ringkasan: "Laboratorium administrasi basis data mencakup konfigurasi, manajemen instance, backup & recovery Oracle Database menggunakan RMAN dan SQL*Plus.",
      stack: ["Oracle Database", "SQL*Plus", "RMAN", "Linux"],
      status: "Selesai",
      repo: "https://github.com/naufalii/Database-Administration-Labs",
      demo: null,
    },
    {
      id: "simplex-solver",
      judul: "Simplex Solver",
      ringkasan: "Aplikasi web pemecah optimasi linear programming menggunakan metode Simplex.",
      stack: ["Python", "JavaScript", "Optimization Algorithms"],
      status: "Dalam Pengembangan",
      repo: "TODO_OWNER",
      demo: null,
    },
    {
      id: "quest-tambahan",
      judul: "TODO_OWNER",
      ringkasan: "TODO_OWNER",
      stack: ["TODO_OWNER"],
      status: "TODO_OWNER",
      repo: "TODO_OWNER",
      demo: null,
    }
  ],

  // 3 Cabang Skill Tree
  skillTree: {
    database: [
      { name: "Oracle Database (19c/21c)", level: 80, detail: "Architecture, User & Privilege Management, Tablespaces" },
      { name: "SQL & PL/SQL", level: 85, detail: "Complex Queries, Triggers, Stored Procedures, Views" },
      { name: "Backup & Recovery (RMAN)", level: 75, detail: "Archivelog, Full/Incremental Backups, Restoration" },
      { name: "PostgreSQL / MySQL", level: 75, detail: "Schema Design, Indexing, Optimization" },
    ],
    sysAdmin: [
      { name: "Linux Administration", level: 80, detail: "Bash Scripting, Permissions, Systemd, Process & Storage Management" },
      { name: "Networking Fundamentals", level: 75, detail: "TCP/IP, DNS, DHCP, Subnetting, SSH Hardening" },
      { name: "Server Configuration & Security", level: 70, detail: "Firewall (UFW/iptables), Nginx Reverse Proxy, User Security" },
      { name: "Virtualization / Containers", level: 70, detail: "VirtualBox, VMware, Docker Basics" },
    ],
    webDev: [
      { name: "Fullstack Web Basics", level: 75, detail: "HTML5, CSS3/Tailwind, JavaScript (ES6+)" },
      { name: "Backend / API Development", level: 75, detail: "Python, FastAPI, RESTful API, Database Connectors" },
      { name: "Version Control", level: 85, detail: "Git, GitHub Workflows, Branching Strategy" },
    ]
  },

  // Guild Hall / Balai Organisasi
  organisasi: [
    {
      id: "bem-fikti",
      guild: "BEM FIKTI Universitas Gunadarma",
      peran: "TODO_OWNER",
      periode: "TODO_OWNER",
      deskripsi: "TODO_OWNER",
    },
    {
      id: "ugpreneurs",
      guild: "UGPreneurs",
      peran: "TODO_OWNER",
      periode: "TODO_OWNER",
      deskripsi: "TODO_OWNER",
    }
  ],

  cv_pdf: "/cv.pdf"
};
