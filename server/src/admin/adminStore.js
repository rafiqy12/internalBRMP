// State / Store khusus untuk fitur administrasi & tata usaha balai

export let instansiSettings = {
  namaBalai: "Balai Besar Penerapan Modernisasi Pertanian Daerah Istimewa Yogyakarta",
  alamat: "Jl. LPMP No. 1, Kalasan, Sleman, D.I. Yogyakarta",
  telepon: "(0274) 496666",
  email: "brmp.diy@pertanian.go.id",
  website: "https://brmp-diy.pertanian.go.id",
  kepalaBalaiNama: "Dr. Ir. Bambang Sumantri, M.Si",
  kepalaBalaiNip: "196805121994031002",
  kobagTuNama: "Agung Ariyanto, SEI., M.Ec., Dev.",
  kobagTuNip: "198101312009121004",
  lokasiKantor: "Kotagede & Kalasan",
  radiusGps: 200,
  latitude: -7.7694,
  longitude: 110.4678,
  jamMasuk: "07:30:00",
  jamPulang: "16:00:00"
};

export const updateInstansiSettings = (newSettings) => {
  instansiSettings = { ...instansiSettings, ...newSettings };
  return instansiSettings;
};

export let disposisiList = [
  { id: "DSP-001", noSurat: "042/KP.010/H.11/06/2025", perihal: "Penugasan Pendampingan Sertifikasi Benih Padi di Sleman", asalSurat: "Direktorat Perbenihan Kementan", tanggal: "2025-06-10", sifat: "Penting / Segera", instruksi: "Tindak lanjuti dengan pembuatan SPT 3 Personil teknis", status: "Diproses", penerima: "Ketua Tim Kerja SDM" },
  { id: "DSP-002", noSurat: "108/HM.120/H.14/06/2025", perihal: "Undangan Rapat Koordinasi Penerapan Standar Pascapanen", asalSurat: "Dinas Pertanian DIY", tanggal: "2025-06-11", sifat: "Biasa", instruksi: "Hadir mewakili Kepala Balai dan buat laporan notulensi", status: "Selesai", penerima: "Ketua Tim Kerja Program & Evaluasi" },
  { id: "DSP-003", noSurat: "019/KU.020/H.1/06/2025", perihal: "Rekonsiliasi Laporan BMN Semester I TA 2025", asalSurat: "Biro Keuangan dan BMN Kementan RI", tanggal: "2025-06-12", sifat: "Sangat Rahasia & Penting", instruksi: "Siapkan data dukung aset percontohan KP Banyakan & UPBS", status: "Menunggu", penerima: "Ketua Tim Kerja Keuangan & BMN" }
];

export let agendaList = [
  { id: "AGD-001", judul: "Rapat Koordinasi Evaluasi Kegiatan Triwulan II", tanggal: "2025-06-15", waktu: "09:00 - 12:00 WIB", lokasi: "Ruang Rapat Utama Sasana Widya BRMP DIY", pimpinan: "Kepala Balai" },
  { id: "AGD-002", judul: "Bimbingan Teknis Standarisasi Alat Mesin Pertanian (Alsintan)", tanggal: "2025-06-17", waktu: "08:30 - 15:30 WIB", lokasi: "Aula Laboratorium Terpadu Kalasan", pimpinan: "Ketua Tim Kerja SDM" },
  { id: "AGD-003", judul: "Kunjungan Lapangan Tim Evaluasi Pengujian Spesifik Lokasi", tanggal: "2025-06-19", waktu: "07:30 - Selesai", lokasi: "Kebun Percobaan Banyakan & Kulon Progo", pimpinan: "Kobag TU" }
];

export let adminPaniteraList = [
  { id: 'PEG-004', nip: '198906012015032004', nama: 'Devi Eka Nuvitasari, S.H.', jabatan: 'Analis SDM Aparatur', role: 'Panitera SPT', assignedBy: 'Administrator Sistem', assignedAt: '2026-01-10' },
  { id: 'PEG-017', nip: '199111042023212041', nama: 'Siti Rahmawati, S.P.', jabatan: 'Penyuluh Pertanian Pertama', role: 'Panitera SPT', assignedBy: 'Administrator Sistem', assignedAt: '2026-02-15' }
];

export let adminSptList = [
  {
    id: 'SPT-2026-001',
    nomorSpt: 'B-101/KP.320/H.14.7/10/2026',
    kegiatan: 'Koordinasi Lapangan Standardisasi Instrumen Pertanian Modern di Kab. Sleman',
    tujuan: 'Dinas Pertanian Kab. Sleman & BPP Minggir',
    tglMulai: '2026-10-28',
    tglSelesai: '2026-10-29',
    durasi: '2 Hari',
    status: 'published',
    pemohon: 'Devi Eka Nuvitasari, S.H.',
    peserta: ['Dr. Soeharsono, S.Pt, M.Si', 'Devi Eka Nuvitasari, S.H.', 'Romy Husodo'],
    disetujuiOleh: 'Agung Ariyanto, SEI., M.Ec., Dev. (Kobag TU)',
    diterbitkanAt: '2026-10-27 14:20 WIB',
    hasQr: true
  },
  {
    id: 'SPT-2026-002',
    nomorSpt: 'B-102/KP.320/H.14.7/10/2026',
    kegiatan: 'Monitoring Penerapan SOP Varietas Padi Unggul Ramah Lingkungan',
    tujuan: 'Kelompok Tani Makmur Mandiri, Kab. Kulon Progo',
    tglMulai: '2026-10-30',
    tglSelesai: '2026-10-31',
    durasi: '2 Hari',
    status: 'published',
    pemohon: 'Siti Rahmawati, S.P.',
    peserta: ['Siti Rahmawati, S.P.', 'Triyana Handayani, A.Md'],
    disetujuiOleh: 'Agung Ariyanto, SEI., M.Ec., Dev. (Kobag TU)',
    diterbitkanAt: '2026-10-29 09:15 WIB',
    hasQr: true
  },
  {
    id: 'SPT-2026-003',
    nomorSpt: '',
    kegiatan: 'Supervisi Akreditasi Laboratorium Pengujian Benih Pertanian Terstandar',
    tujuan: 'Balai Standardisasi Pengujian Benih, Surakarta',
    tglMulai: '2026-11-03',
    tglSelesai: '2026-11-05',
    durasi: '3 Hari',
    status: 'ready_to_issue',
    pemohon: 'Devi Eka Nuvitasari, S.H.',
    peserta: ['Dr. Soeharsono, S.Pt, M.Si', 'Dwi Dinia Rahayu, S.Kom, M.T.I'],
    disetujuiOleh: 'Agung Ariyanto, SEI., M.Ec., Dev. (Kobag TU)',
    diterbitkanAt: '-',
    hasQr: false
  }
];

export let adminMenimbangList = [
  'Bahwa dalam rangka optimalisasi koordinasi standardisasi instrumen pertanian terpadu di Provinsi Daerah Istimewa Yogyakarta, dipandang perlu menugaskan pegawai yang tercantum dalam surat perintah ini.',
  'Bahwa pegawai yang namanya tercantum dalam keputusan ini dipandang cakap dan memenuhi syarat untuk melaksanakan tugas kedinasan dimaksud.'
];

export let adminDasarList = [
  'Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara.',
  'Peraturan Menteri Pertanian Republik Indonesia Nomor 19 Tahun 2023 tentang Organisasi dan Tata Kerja Balai Besar Penerapan Standar Instrumen Pertanian.',
  'Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Besar Penerapan Modernisasi Pertanian DIY Tahun Anggaran 2026.'
];
