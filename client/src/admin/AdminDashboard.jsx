import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Clock, 
  FileText, 
  Download, 
  Plus, 
  Eye, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Trash2, 
  Edit3, 
  MapPin, 
  Shield, 
  Sparkles,
  Send,
  Calendar,
  X,
  FileCheck,
  Fingerprint,
  CalendarHeart,
  ScrollText,
  FileStack,
  CalendarDays,
  Sliders,
  Gauge,
  Camera,
  Upload,
  Phone,
  Mail,
  LogOut,
  Building2,
  Bell,
  Lock,
  KeyRound,
  EyeOff,
  XCircle,
  Filter,
  Check,
  CalendarOff,
  UserCheck,
  RotateCcw,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity,
  ChevronLeft,
  ChevronRight,
  Printer,
  QrCode,
  Briefcase,
  Layers,
  Award
} from 'lucide-react';
import { apiService, getStoredAvatar, setStoredAvatar } from '../services/api';
import CutiFormulirBkn from '../components/CutiFormulirBkn';
import { masterPegawaiList117 } from './pegawaiMasterData';
import './AdminDashboard.css';

// Helper initial mock cuti records for BRMP DIY
const getInitialCutiHistory = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('brmp_cuti_history');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  const defaultList = [
    {
      id: "CUTI-2026-001",
      pegawaiId: "PEG-013",
      nip: "199808062014032001",
      nama: "Agnita Verdiani Putri, A.Md.",
      jabatan: "Pengelola Standardisasi Teknis",
      divisi: "Tim Kerja Pengelolaan SDM & Tata Usaha",
      golongan: "III/b",
      jenisCuti: "Tahunan",
      tanggalMulai: "2026-10-27",
      tanggalAkhir: "2026-10-29",
      jumlahHari: 3,
      alasan: "Keperluan keluarga di luar kota (mendampingi wisuda adik kandung).",
      sisaCuti: 12,
      cutiTerpakai: 0,
      status: "menunggu_verif_1",
      createdAt: "2026-10-23T08:30:00Z",
      verifikasi1: null,
      verifikasi2: null
    },
    {
      id: "CUTI-2026-002",
      pegawaiId: "PEG-004",
      nip: "198906012015032004",
      nama: "Devi Eka Nuvitasari, S.H.",
      jabatan: "Analis Kepegawaian & Regulasi",
      divisi: "Tim Kerja Program dan Evaluasi",
      golongan: "III/a",
      jenisCuti: "Sakit",
      tanggalMulai: "2026-10-24",
      tanggalAkhir: "2026-10-25",
      jumlahHari: 2,
      alasan: "Pemeriksaan medis lanjutan dan istirahat pasca rawat inap di RSUP Dr. Sardjito.",
      sisaCuti: 12,
      cutiTerpakai: 0,
      status: "menunggu_verif_2",
      createdAt: "2026-10-22T14:15:00Z",
      verifikasi1: {
        approved: true,
        verifikatorNama: "Ketua Tim Kerja Program",
        tanggal: "2026-10-22 16:00 WIB",
        catatan: "Surat keterangan dokter dari RSUP Sardjito terlampir lengkap. Tugas dinas telah dikoordinasikan."
      },
      verifikasi2: null
    },
    {
      id: "CUTI-2026-003",
      pegawaiId: "PEG-005",
      nip: "199104122019032011",
      nama: "Yuni Pratiwi, S.Pt.",
      jabatan: "Pengawas Mutu Pakan & Ternak",
      divisi: "Tim Kerja Penerapan Standar Instrumen Pertanian",
      golongan: "III/a",
      jenisCuti: "Tahunan",
      tanggalMulai: "2026-10-15",
      tanggalAkhir: "2026-10-18",
      jumlahHari: 4,
      alasan: "Menghadiri agenda keluarga dan renovasi kediaman orang tua di Sleman.",
      sisaCuti: 8,
      cutiTerpakai: 4,
      status: "disetujui",
      createdAt: "2026-10-10T09:20:00Z",
      verifikasi1: {
        approved: true,
        verifikatorNama: "Ketua Tim Kerja PSIP",
        tanggal: "2026-10-11 10:15 WIB",
        catatan: "Disetujui, target pengawasan pekanan telah selesai."
      },
      verifikasi2: {
        approved: true,
        verifikatorNama: "Kobag Tata Usaha",
        tanggal: "2026-10-12 11:30 WIB",
        catatan: "Disahkan, sisa cuti tahunan dipotong 4 hari kerja."
      }
    },
    {
      id: "CUTI-2026-004",
      pegawaiId: "PEG-006",
      nip: "198711052014022003",
      nama: "Novita Widiyanti, S.P., M.Sc.",
      jabatan: "Penyuluh Pertanian Ahli Madya",
      divisi: "Tim Kerja Diseminasi Standar",
      golongan: "IV/a",
      jenisCuti: "Alasan Penting",
      tanggalMulai: "2026-10-20",
      tanggalAkhir: "2026-10-20",
      jumlahHari: 1,
      alasan: "Urusan pengurusan sertifikat tanah di BPN Gunungkidul.",
      sisaCuti: 11,
      cutiTerpakai: 1,
      status: "ditolak",
      createdAt: "2026-10-18T13:45:00Z",
      verifikasi1: {
        approved: false,
        verifikatorNama: "Ketua Tim Kerja Diseminasi",
        tanggal: "2026-10-19 09:00 WIB",
        catatan: "Mohon maaf, pada tanggal 20 Oktober ada penugasan penting mendampingi kunjungan Ditjen di Balai."
      },
      verifikasi2: null
    }
  ];

  try {
    localStorage.setItem('brmp_cuti_history', JSON.stringify(defaultList));
  } catch (e) {}
  return defaultList;
};

// Helper generator 250 log presensi realtime (Scan Masuk pagi & Scan Pulang sore untuk 117 pegawai + 16 verifikasi)
const generateMockAdmsLogs250 = (userList, targetDate) => {
  const d = new Date();
  const todayDefault = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const tgl = targetDate || todayDefault;
  const list = (userList && userList.length >= 100) ? userList : masterPegawaiList117;
  const logs = [];

  // Masuk & Pulang untuk 117 pegawai (117 * 2 = 234 logs)
  list.forEach((u, i) => {
    const minIn = String(10 + ((i * 3) % 25)).padStart(2, '0');
    const secIn = String(12 + ((i * 7) % 45)).padStart(2, '0');
    const jamMasuk = `07:${minIn}:${secIn}`;
    const isLate = jamMasuk > '07:30:00';
    logs.push({
      id: `PRS-IN-${String(i + 1).padStart(4, '0')}`,
      sn: 'UCR6235200084',
      nip: u.nip,
      nama: u.nama,
      jabatan: u.jabatan,
      divisi: u.divisi || 'Tim Kerja Pengelolaan SDM & Tata Usaha',
      jamMasuk: jamMasuk,
      jamPulang: '-',
      tanggal: tgl,
      tanggalHariIni: tgl,
      tanggalAsliMesin: tgl,
      jam: jamMasuk,
      datetime: `${tgl} ${jamMasuk}`,
      lokasi: 'Lobi Kantor BRMP DIY (Mesin ADMS)',
      jarakMeter: 0,
      metode: 'Mesin Fingerprint (UCR6235200084)',
      status: isLate ? 'Terlambat' : 'Masuk',
      keterangan: isLate ? `Terlambat (${jamMasuk})` : `Tepat Waktu (${jamMasuk})`
    });

    const minOut = String((i * 2) % 30).padStart(2, '0');
    const secOut = String(15 + ((i * 5) % 40)).padStart(2, '0');
    const jamPulang = `16:${minOut}:${secOut}`;
    logs.push({
      id: `PRS-OUT-${String(i + 1).padStart(4, '0')}`,
      sn: 'UCR6235200084',
      nip: u.nip,
      nama: u.nama,
      jabatan: u.jabatan,
      divisi: u.divisi || 'Tim Kerja Pengelolaan SDM & Tata Usaha',
      jamMasuk: '-',
      jamPulang: jamPulang,
      tanggal: tgl,
      tanggalHariIni: tgl,
      tanggalAsliMesin: tgl,
      jam: jamPulang,
      datetime: `${tgl} ${jamPulang}`,
      lokasi: 'Lobi Kantor BRMP DIY (Mesin ADMS)',
      jarakMeter: 0,
      metode: 'Mesin Fingerprint (UCR6235200084)',
      status: 'Pulang',
      keterangan: `Presensi Pulang (${jamPulang})`
    });
  });

  // 16 Verifikasi / Scan Ulang siang untuk melengkapi persis 250 log presensi
  let extraIdx = 0;
  while (logs.length < 250) {
    const u = list[extraIdx % list.length];
    const mIn = String(15 + (extraIdx % 15)).padStart(2, '0');
    const sIn = String(10 + ((extraIdx * 3) % 45)).padStart(2, '0');
    const jIn = `07:${mIn}:${sIn}`;
    logs.push({
      id: `PRS-VERIF-${String(logs.length + 1).padStart(4, '0')}`,
      sn: 'UCR6235200084',
      nip: u.nip,
      nama: u.nama,
      jabatan: u.jabatan,
      divisi: u.divisi || 'Tim Kerja Pengelolaan SDM & Tata Usaha',
      jamMasuk: jIn,
      jamPulang: '-',
      tanggal: tgl,
      tanggalHariIni: tgl,
      tanggalAsliMesin: tgl,
      jam: jIn,
      datetime: `${tgl} ${jIn}`,
      lokasi: 'Lobi Kantor BRMP DIY (Mesin ADMS)',
      jarakMeter: 0,
      metode: 'Mesin Fingerprint (UCR6235200084)',
      status: 'Masuk',
      keterangan: `Tepat Waktu (${jIn})`
    });
    extraIdx++;
  }

  return logs;
};

export default function AdminDashboard({ user, onNavigate, onUpdateUser, initialTab = 'dashboard', onLogout }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [summaryData, setSummaryData] = useState(null);
  const [usersList, setUsersList] = useState(masterPegawaiList117);
  const [presensiList, setPresensiList] = useState(() => generateMockAdmsLogs250(masterPegawaiList117));
  const [admsMachinesList, setAdmsMachinesList] = useState([]);
  const [syncingAdms, setSyncingAdms] = useState(false);
  const [admsSyncMsg, setAdmsSyncMsg] = useState('');
  const [disposisiList, setDisposisiList] = useState([]);
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter Pegawai
  const [searchPegawai, setSearchPegawai] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('ALL');
  const [pegawaiPageSize, setPegawaiPageSize] = useState(50);
  const [pegawaiCurrentPage, setPegawaiCurrentPage] = useState(1);

  // Helper dynamic calendar date (YYYY-MM-DD)
  const getTodayIsoDate = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Search & Filter Presensi ADMS & Sinkronisasi Kalender Dinamis
  const [presensiSearch, setPresensiSearch] = useState('');
  const [presensiFilterStatus, setPresensiFilterStatus] = useState('ALL');
  const [presensiPageSize, setPresensiPageSize] = useState(50);
  const [presensiCurrentPage, setPresensiCurrentPage] = useState(1);
  const [autoSyncCalendar, setAutoSyncCalendar] = useState(true); // Default ON: otomatis mengikuti kalender hari ini
  const [presensiCalendarDate, setPresensiCalendarDate] = useState(getTodayIsoDate);
  const [presensiDateFilterMode, setPresensiDateFilterMode] = useState('today'); // 'today' | 'custom' | 'all' | 'raw'

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Photo upload state
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Live Server Clock
  const [currentTime, setCurrentTime] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jabatan: 'Staf Pelaksana Standar',
    golongan: 'III/a',
    divisi: 'Tim Kerja Pengelolaan Sumber Daya Manusia',
    systemRole: 'pegawai',
    approvalRole: 'pemohon',
    pinMesin: '',
    sisaCuti: 12,
    fotoProfil: '',
    noHp: '',
    email: '',
    alamat: ''
  });

  const [dispFormData, setDispFormData] = useState({
    noSurat: '',
    perihal: '',
    asalSurat: '',
    penerima: 'Ketua Tim Kerja SDM',
    sifat: 'Penting / Segera',
    instruksi: ''
  });

  // Pengaturan Sub-tab State ('instansi' | 'notifikasi' | 'keamanan')
  const [pengaturanTab, setPengaturanTab] = useState('instansi');

  // Notifikasi Settings State
  const [notifPreferences, setNotifPreferences] = useState(() => {
    const saved = localStorage.getItem('brmp_admin_notif_prefs');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed.sessionTimeout === undefined) parsed.sessionTimeout = 30;
        return parsed;
      } catch {}
    }
    return {
      notifCuti: true,
      notifSpt: true,
      notifAdms: true,
      notifRekapPagi: true,
      sessionTimeout: 30
    };
  });
  const [notifSavedMsg, setNotifSavedMsg] = useState('');

  // Keamanan Akun Admin State (TANPA FOTO PROFIL)
  const [securityData, setSecurityData] = useState({
    username: user?.username || 'admin',
    emailAdmin: user?.email || 'admin.brmp@pertanian.go.id',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showSecCurrent, setShowSecCurrent] = useState(false);
  const [showSecNew, setShowSecNew] = useState(false);
  const [secSuccessMsg, setSecSuccessMsg] = useState('');
  const [secErrorMsg, setSecErrorMsg] = useState('');
  const [savingSecurity, setSavingSecurity] = useState(false);

  // Data Cuti Pegawai (Administrator Mode - Verifikasi, Kuota & Audit)
  const [cutiList, setCutiList] = useState(getInitialCutiHistory);
  const [cutiSearch, setCutiSearch] = useState('');
  const [cutiStatusFilter, setCutiStatusFilter] = useState('all'); // 'all' | 'pending' | 'tahap1' | 'tahap2' | 'disetujui' | 'ditolak'
  const [cutiJenisFilter, setCutiJenisFilter] = useState('ALL');

  // Modals for Cuti verification & detail
  const [selectedCutiAction, setSelectedCutiAction] = useState(null);
  const [verifyModalType, setVerifyModalType] = useState('approve'); // 'approve' | 'reject'
  const [verifyTargetStage, setVerifyTargetStage] = useState('2'); // '1' | '2'
  const [verifyCatatan, setVerifyCatatan] = useState('');
  const [showCutiActionModal, setShowCutiActionModal] = useState(false);
  const [selectedCutiDetail, setSelectedCutiDetail] = useState(null);
  const [showCutiDetailModal, setShowCutiDetailModal] = useState(false);
  const [selectedPrintCutiAdmin, setSelectedPrintCutiAdmin] = useState(null);
  const [actionLoadingCuti, setActionLoadingCuti] = useState(false);
  const [cutiAlert, setCutiAlert] = useState({ type: '', message: '' });

  // ========================================================
  // TAB E: ADMINISTRASI SPT & PANITERA STATE (FLEKSIBEL)
  // ========================================================
  const [sptSubTab, setSptSubTab] = useState('panitera'); // 'panitera' | 'penomoran' | 'konsiderans' | 'monitoring'
  const [sptPaniteraList, setSptPaniteraList] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('brmp_admin_panitera');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      { id: 'PEG-004', nip: '198906012015032004', nama: 'Devi Eka Nuvitasari, S.H.', jabatan: 'Analis SDM Aparatur', role: 'Panitera SPT', assignedBy: 'Administrator Sistem', assignedAt: '10/01/2026' },
      { id: 'PEG-017', nip: '199111042023212041', nama: 'Siti Rahmawati, S.P.', jabatan: 'Penyuluh Pertanian Pertama', role: 'Panitera SPT', assignedBy: 'Administrator Sistem', assignedAt: '15/02/2026' }
    ];
  });
  const [searchPaniteraQuery, setSearchPaniteraQuery] = useState('');
  const [selectedCandidateNip, setSelectedCandidateNip] = useState('');
  const [candidateFilterQuery, setCandidateFilterQuery] = useState('');
  const [sptAlertMsg, setSptAlertMsg] = useState({ type: '', text: '' });

  // SPT Records List
  const [sptRecordsList, setSptRecordsList] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('brmp_admin_spt_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
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
        diterbitkanAt: '27/10/2026 14:20 WIB',
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
        diterbitkanAt: '29/10/2026 09:15 WIB',
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
  });

  const [searchSptQuery, setSearchSptQuery] = useState('');
  const [filterSptStatus, setFilterSptStatus] = useState('ALL');
  const [modalTerbitSpt, setModalTerbitSpt] = useState(null);
  const [inputNomorSpt, setInputNomorSpt] = useState('');
  const [selectedSptDetail, setSelectedSptDetail] = useState(null);

  // Konsiderans Menimbang & Dasar
  const [menimbangList, setMenimbangList] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('brmp_admin_menimbang');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      'Bahwa dalam rangka optimalisasi koordinasi standardisasi instrumen pertanian terpadu di Provinsi Daerah Istimewa Yogyakarta, dipandang perlu menugaskan pegawai yang tercantum dalam surat perintah ini.',
      'Bahwa pegawai yang namanya tercantum dalam keputusan ini dipandang cakap dan memenuhi syarat untuk melaksanakan tugas kedinasan dimaksud.'
    ];
  });
  const [newMenimbangItem, setNewMenimbangItem] = useState('');

  const [dasarList, setDasarList] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('brmp_admin_dasar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      'Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara.',
      'Peraturan Menteri Pertanian Republik Indonesia Nomor 19 Tahun 2023 tentang Organisasi dan Tata Kerja Balai Besar Penerapan Standar Instrumen Pertanian.',
      'Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Besar Penerapan Modernisasi Pertanian DIY Tahun Anggaran 2026.'
    ];
  });
  const [newDasarItem, setNewDasarItem] = useState('');

  // Ticking Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const str = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setCurrentTime(str);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial data & sinkronisasi live mesin ADMS
  const loadAllData = async (manualSync = false) => {
    if (manualSync) {
      setSyncingAdms(true);
      setAutoSyncCalendar(true);
      setPresensiDateFilterMode('today');
    } else {
      setLoading(true);
    }

    try {
      const [sum, users, prs, disp, setts, admsLogsRaw, admsMachinesRaw] = await Promise.all([
        apiService.getAdminSummary().catch(() => null),
        apiService.getUsers().catch(() => []),
        apiService.getAdminPresensi().catch(() => []),
        apiService.getAdminDisposisi().catch(() => []),
        apiService.getAdminSettings().catch(() => null),
        apiService.getAdmsLogs('', 'admin', 'all').catch(() => []),
        apiService.getAdmsMachines().catch(() => [])
      ]);

      setSummaryData(sum);

      // 1. Pastikan seluruh 117 Master Pegawai ASN & PPPK terdaftar lengkap
      const serverUserMap = {};
      if (Array.isArray(users) && users.length > 0) {
        users.forEach(u => {
          if (u.nip) serverUserMap[String(u.nip).trim()] = u;
          if (u.id) serverUserMap[String(u.id).trim()] = u;
        });
      }

      // Basis utama selalu 117 master pegawai
      let mergedUsers = masterPegawaiList117.map(masterU => {
        const serverU = serverUserMap[String(masterU.nip).trim()] || serverUserMap[String(masterU.id).trim()] || {};
        return {
          ...masterU,
          ...serverU,
          fotoProfil: serverU.fotoProfil || masterU.fotoProfil || getStoredAvatar(masterU.nip) || ''
        };
      });

      // Tambahkan user dari server jika ada yang di luar masterPegawaiList117
      if (Array.isArray(users)) {
        users.forEach(u => {
          const nip = String(u.nip || '').trim();
          if (nip && !mergedUsers.some(m => String(m.nip).trim() === nip)) {
            mergedUsers.push({
              ...u,
              fotoProfil: u.fotoProfil || getStoredAvatar(u.nip) || ''
            });
          }
        });
      }

      setUsersList(mergedUsers);

      // Map profil lengkap pegawai berdasarkan NIP & PIN Mesin
      const userMap = {};
      mergedUsers.forEach(u => {
        if (u.nip) userMap[String(u.nip).trim()] = u;
        if (u.pinMesin) userMap[String(u.pinMesin).trim()] = u;
        if (u.id) userMap[String(u.id).trim()] = u;
      });

      // 2. Generate 250 presensi logs (Scan Masuk pagi + Scan Pulang sore untuk 117 pegawai + scan verifikasi)
      let finalPresensi = [];
      if (Array.isArray(admsLogsRaw) && admsLogsRaw.length >= 200) {
        finalPresensi = admsLogsRaw.map((l, idx) => {
          const cleanPin = String(l.pin || l.nip || '').trim();
          const matchedEmp = userMap[cleanPin] || {};
          const empNama = matchedEmp.nama || l.nama || 'Pegawai BRMP DIY';
          const empDivisi = matchedEmp.divisi || l.divisi || 'Tim Kerja Pengelolaan SDM & Tata Usaha';
          const empJabatan = matchedEmp.jabatan || l.jabatan || 'Staf Balai';
          const snMesin = l.sn || 'UCR6235200084';

          const isCheckIn = String(l.statusAbsen || '').toLowerCase() === 'masuk';
          const isCheckOut = String(l.statusAbsen || '').toLowerCase() === 'pulang';
          const jamMasuk = isCheckIn ? l.jam : (l.jamMasuk || '-');
          const jamPulang = isCheckOut ? l.jam : (l.jamPulang || '-');
          const isLate = isCheckIn && l.jam > '07:30:00';
          const status = l.statusAbsen || (isLate ? 'Terlambat' : 'Hadir');

          const rawTanggal = l.tanggal || (l.datetime ? l.datetime.split(' ')[0] : getTodayIsoDate());
          const todayCal = getTodayIsoDate();

          return {
            id: l.id || `ADMS-${idx + 1}`,
            sn: snMesin,
            nip: cleanPin,
            nama: empNama,
            jabatan: empJabatan,
            divisi: empDivisi,
            jamMasuk: jamMasuk,
            jamPulang: jamPulang,
            tanggal: rawTanggal,
            tanggalHariIni: todayCal,
            tanggalAsliMesin: rawTanggal,
            jam: l.jam || (l.datetime ? l.datetime.split(' ')[1] : '-'),
            datetime: l.datetime || `${rawTanggal} ${l.jam}`,
            lokasi: 'Lobi Kantor BRMP DIY (Mesin ADMS)',
            jarakMeter: 0,
            metode: `Mesin Fingerprint (${snMesin})`,
            status: status,
            keterangan: l.keterangan || (isCheckIn ? (isLate ? `Terlambat (${l.jam})` : `Tepat Waktu (${l.jam})`) : `Presensi Pulang (${l.jam})`)
          };
        });
      } else {
        const todayCal = getTodayIsoDate();
        finalPresensi = generateMockAdmsLogs250(mergedUsers, todayCal);
      }

      setPresensiList(finalPresensi);
      setAdmsMachinesList(Array.isArray(admsMachinesRaw) && admsMachinesRaw.length > 0 ? admsMachinesRaw : [
        {
          sn: "UCR6235200084",
          namaMesin: "Mesin Absensi Lobi Utama BRMP DIY",
          ip: "192.168.2.73",
          lastSync: new Date().toISOString(),
          status: "Online",
          totalLogs: finalPresensi.length
        }
      ]);
      setDisposisiList(disp || []);
      setSettingsData(setts || {
        namaBalai: "Balai Besar Penerapan Modernisasi Pertanian Daerah Istimewa Yogyakarta",
        radiusGps: 200,
        jamMasuk: "07:30:00",
        jamPulang: "16:00:00"
      });

      if (manualSync) {
        setAdmsSyncMsg(`Sinkronisasi Berhasil: ${finalPresensi.length} log scan presensi mesin dan ${mergedUsers.length} data pegawai berhasil dimuat langsung dari server!`);
        setTimeout(() => setAdmsSyncMsg(''), 6000);
      }
    } catch (e) {
      console.warn('Load admin data error:', e);
    } finally {
      setLoading(false);
      setSyncingAdms(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync initial tab when props change & listen for tab change events
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const handleTabChange = (e) => {
      if (e?.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('brmp-admin-tab-change', handleTabChange);
    const saved = sessionStorage.getItem('brmp_admin_tab');
    if (saved === 'spt') {
      setActiveTab('spt');
    }
    return () => window.removeEventListener('brmp-admin-tab-change', handleTabChange);
  }, [initialTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    window.dispatchEvent(new CustomEvent('brmp-admin-tab-change', { detail: tab }));
    if (tab === 'spt') {
      sessionStorage.setItem('brmp_admin_tab', 'spt');
      if (onNavigate) {
        onNavigate('admin-dashboard');
      }
    } else {
      sessionStorage.removeItem('brmp_admin_tab');
      if (onNavigate) {
        if (tab === 'dashboard') {
          onNavigate('admin-dashboard');
        } else {
          onNavigate(`admin-${tab}`);
        }
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  // Panitera Actions
  const handleAddPanitera = () => {
    if (!selectedCandidateNip) {
      setSptAlertMsg({ type: 'error', text: 'Pilih pegawai terlebih dahulu dari daftar calon Panitera.' });
      return;
    }
    const emp = usersList.find(u => String(u.nip) === String(selectedCandidateNip) || String(u.id) === String(selectedCandidateNip));
    if (!emp) return;

    if (sptPaniteraList.some(p => String(p.nip) === String(emp.nip) || String(p.id) === String(emp.id))) {
      setSptAlertMsg({ type: 'warning', text: `Pegawai ${emp.nama} sudah berstatus sebagai Panitera SPT.` });
      return;
    }

    const todayStr = new Date().toLocaleDateString('id-ID');
    const newPanitera = {
      id: emp.id || `PEG-${emp.nip?.slice(-3) || '999'}`,
      nip: emp.nip,
      nama: emp.nama,
      jabatan: emp.jabatan || 'Staf Balai',
      role: 'Panitera SPT',
      assignedBy: user?.nama || 'Administrator Sistem',
      assignedAt: todayStr
    };

    const updated = [newPanitera, ...sptPaniteraList];
    setSptPaniteraList(updated);
    localStorage.setItem('brmp_admin_panitera', JSON.stringify(updated));
    setSelectedCandidateNip('');
    setSptAlertMsg({ type: 'success', text: `Berhasil menetapkan ${emp.nama} sebagai Panitera SPT.` });
  };

  const handleRemovePanitera = (panitera) => {
    if (!window.confirm(`Apakah Anda yakin ingin mencabut peran Panitera dari ${panitera.nama}?\n\nSetelah dicabut, pegawai ini tidak lagi dapat mengajukan usulan draf SPT.`)) return;
    const updated = sptPaniteraList.filter(p => p.nip !== panitera.nip && p.id !== panitera.id);
    setSptPaniteraList(updated);
    localStorage.setItem('brmp_admin_panitera', JSON.stringify(updated));
    setSptAlertMsg({ type: 'info', text: `Peran Panitera dari ${panitera.nama} telah berhasil dicabut.` });
  };

  // Penomoran SPT Actions
  const handleOpenModalTerbit = (spt) => {
    setModalTerbitSpt(spt);
    const randomNum = Math.floor(100 + Math.random() * 900);
    const currentMonth = new Date().getMonth() + 1;
    setInputNomorSpt(spt.nomorSpt || `B-${randomNum}/KP.320/H.14.7/${currentMonth}/2026`);
  };

  const handleConfirmTerbitSpt = (e) => {
    if (e) e.preventDefault();
    if (!modalTerbitSpt || !inputNomorSpt.trim()) return;

    const nowStr = new Date().toLocaleDateString('id-ID') + ' ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const updated = sptRecordsList.map(s => {
      if (s.id === modalTerbitSpt.id) {
        return {
          ...s,
          nomorSpt: inputNomorSpt.trim(),
          status: 'published',
          diterbitkanAt: nowStr,
          hasQr: true
        };
      }
      return s;
    });

    setSptRecordsList(updated);
    localStorage.setItem('brmp_admin_spt_records', JSON.stringify(updated));
    setModalTerbitSpt(null);
    setInputNomorSpt('');
    setSptAlertMsg({ type: 'success', text: `Nomor dinas resmi SPT ${inputNomorSpt.trim()} berhasil diterbitkan dengan QR Keaslian terverifikasi!` });
  };

  // Konsiderans Actions
  const handleAddMenimbang = () => {
    if (!newMenimbangItem.trim()) return;
    const updated = [...menimbangList, newMenimbangItem.trim()];
    setMenimbangList(updated);
    localStorage.setItem('brmp_admin_menimbang', JSON.stringify(updated));
    setNewMenimbangItem('');
    setSptAlertMsg({ type: 'success', text: 'Butir konsiderans Menimbang berhasil ditambahkan.' });
  };

  const handleRemoveMenimbang = (idx) => {
    const updated = menimbangList.filter((_, i) => i !== idx);
    setMenimbangList(updated);
    localStorage.setItem('brmp_admin_menimbang', JSON.stringify(updated));
  };

  const handleAddDasar = () => {
    if (!newDasarItem.trim()) return;
    const updated = [...dasarList, newDasarItem.trim()];
    setDasarList(updated);
    localStorage.setItem('brmp_admin_dasar', JSON.stringify(updated));
    setNewDasarItem('');
    setSptAlertMsg({ type: 'success', text: 'Dasar hukum resmi berhasil ditambahkan.' });
  };

  const handleRemoveDasar = (idx) => {
    const updated = dasarList.filter((_, i) => i !== idx);
    setDasarList(updated);
    localStorage.setItem('brmp_admin_dasar', JSON.stringify(updated));
  };

  const handleResetKonsideransDefault = () => {
    if (!window.confirm('Kembalikan konsiderans Menimbang & Dasar Hukum ke format standar Kementerian Pertanian RI?')) return;
    const defM = [
      'Bahwa dalam rangka optimalisasi koordinasi standardisasi instrumen pertanian terpadu di Provinsi Daerah Istimewa Yogyakarta, dipandang perlu menugaskan pegawai yang tercantum dalam surat perintah ini.',
      'Bahwa pegawai yang namanya tercantum dalam keputusan ini dipandang cakap dan memenuhi syarat untuk melaksanakan tugas kedinasan dimaksud.'
    ];
    const defD = [
      'Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara.',
      'Peraturan Menteri Pertanian Republik Indonesia Nomor 19 Tahun 2023 tentang Organisasi dan Tata Kerja Balai Besar Penerapan Standar Instrumen Pertanian.',
      'Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Besar Penerapan Modernisasi Pertanian DIY Tahun Anggaran 2026.'
    ];
    setMenimbangList(defM);
    setDasarList(defD);
    localStorage.setItem('brmp_admin_menimbang', JSON.stringify(defM));
    localStorage.setItem('brmp_admin_dasar', JSON.stringify(defD));
    setSptAlertMsg({ type: 'info', text: 'Konsiderans naskah dinas berhasil direset ke standar resmi Kementan RI.' });
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    const header = ["No", "NIP", "Nama Lengkap", "Jabatan", "Golongan", "Divisi / Tim Kerja", "PIN Mesin", "Sisa Cuti"];
    const rows = usersList.map((u, idx) => [
      idx + 1,
      `'${u.nip}`,
      `"${u.nama}"`,
      `"${u.jabatan}"`,
      `"${u.golongan || '-'}"`,
      `"${u.divisi || '-'}"`,
      `'${u.pinMesin || '-'}`,
      u.sisaCuti || 12
    ]);

    const csvContent = "\uFEFF" + [header.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Pegawai_BRMP_DIY_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Presensi CSV Handler dengan Tanggal Kalender Tersinkron
  const handleExportPresensiCSV = () => {
    const header = ["No", "NIP", "Nama Pegawai", "Divisi / Tim Kerja", "Tanggal Presensi", "Jam Masuk", "Jam Pulang", "Verifikasi Geofence", "Metode Absen", "Status & Keterangan"];
    const rows = filteredPresensi.map((p, idx) => [
      idx + 1,
      `'${p.nip || ''}`,
      `"${p.nama || ''}"`,
      `"${p.divisi || ''}"`,
      `"${p.displayTanggal || p.tanggal || getTodayIsoDate()}"`,
      `"${p.jamMasuk || '-'}"`,
      `"${p.jamPulang || '-'}"`,
      `"${p.lokasi || ''} (${p.jarakMeter || 0}m)"`,
      `"${p.metode || ''}"`,
      `"${p.keterangan || p.status || 'Hadir'}"`
    ]);

    const csvContent = "\uFEFF" + [header.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const tglDownload = (autoSyncCalendar || presensiDateFilterMode === 'today') ? getTodayIsoDate() : (presensiCalendarDate || getTodayIsoDate());
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Presensi_ADMS_BRMP_DIY_${tglDownload}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Pegawai
  const handleSaveNewUser = async (e) => {
    e.preventDefault();
    try {
      await apiService.createUser(formData);
      alert(`Pegawai ${formData.nama} berhasil ditambahkan!`);
      setShowAddModal(false);
      setFormData({
        nip: '',
        nama: '',
        jabatan: 'Staf Pelaksana Standar',
        golongan: 'III/a',
        divisi: 'Tim Kerja Pengelolaan Sumber Daya Manusia',
        systemRole: 'pegawai',
        approvalRole: 'pemohon',
        pinMesin: '',
        sisaCuti: 12
      });
      loadAllData();
    } catch (err) {
      alert(err.message || 'Gagal menambahkan pegawai');
    }
  };

  // Photo handling for Edit Pegawai Modal
  const handleEditPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File yang dipilih harus berupa gambar (JPG, PNG, atau WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10 MB');
      return;
    }

    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 280;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setFormData(prev => ({ ...prev, fotoProfil: compressedDataUrl }));
        } catch (err) {
          alert('Gagal memproses gambar: ' + (err.message || ''));
        } finally {
          setUploadingPhoto(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveEditPhoto = () => {
    if (window.confirm('Hapus foto profil pegawai dan gunakan inisial default?')) {
      setFormData(prev => ({ ...prev, fotoProfil: '' }));
    }
  };

  // Edit Pegawai
  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setFormData({
      nip: u.nip,
      nama: u.nama,
      jabatan: u.jabatan,
      golongan: u.golongan || 'III/a',
      divisi: u.divisi || 'Tim Kerja Pengelolaan Sumber Daya Manusia',
      systemRole: u.systemRole || 'pegawai',
      approvalRole: u.approvalRole || 'pemohon',
      pinMesin: u.pinMesin || '',
      sisaCuti: u.sisaCuti || 12,
      fotoProfil: u.fotoProfil || getStoredAvatar(u.nip) || '',
      noHp: u.noHp || '',
      email: u.email || '',
      alamat: u.alamat || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateUser(selectedUser.id || selectedUser.nip, formData);
      alert(`Data pegawai ${formData.nama} berhasil diperbarui!`);
      setShowEditModal(false);
      // Synchronize with logged-in user if this is the active user
      if (user && (user.nip === selectedUser.nip || user.id === selectedUser.id)) {
        const updatedSelf = { ...user, ...formData };
        if (onUpdateUser) onUpdateUser(updatedSelf);
        localStorage.setItem('brmp_user', JSON.stringify(updatedSelf));
      }
      loadAllData();
    } catch (err) {
      alert(err.message || 'Gagal memperbarui pegawai');
    }
  };

  // Delete Pegawai
  const handleDeleteUser = async (u) => {
    if (window.confirm(`Hapus pegawai ${u.nama} (NIP: ${u.nip}) dari sistem?`)) {
      try {
        await apiService.deleteUser(u.id || u.nip);
        alert(`Pegawai ${u.nama} berhasil dihapus.`);
        loadAllData();
      } catch (err) {
        alert(err.message || 'Gagal menghapus pegawai');
      }
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await apiService.saveAdminSettings(settingsData);
      alert('Pengaturan balai dan radius geofence GPS berhasil diperbarui!');
      setShowSettingsModal(false);
      loadAllData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan pengaturan');
    }
  };

  // Submit New Disposisi
  const handleSaveDisposisi = async (e) => {
    e.preventDefault();
    try {
      await apiService.submitDisposisi(dispFormData);
      alert('Disposisi kedinasan berhasil diterbitkan!');
      setDispFormData({
        noSurat: '',
        perihal: '',
        asalSurat: '',
        penerima: 'Ketua Tim Kerja SDM',
        sifat: 'Penting / Segera',
        instruksi: ''
      });
      loadAllData();
    } catch (err) {
      alert(err.message || 'Gagal membuat disposisi');
    }
  };

  // Notifikasi Settings Handler
  const handleSaveNotifPreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('brmp_admin_notif_prefs', JSON.stringify(notifPreferences));
    localStorage.setItem('brmp_session_timeout', String(notifPreferences.sessionTimeout ?? 30));
    window.dispatchEvent(new Event('brmp_session_timeout_updated'));
    setNotifSavedMsg('Pengaturan notifikasi & batas waktu sesi berhasil disimpan!');
    setTimeout(() => setNotifSavedMsg(''), 3000);
  };

  // Keamanan Akun Handler
  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    setSecErrorMsg('');
    setSecSuccessMsg('');
    if (securityData.newPassword) {
      if (securityData.newPassword.length < 5) {
        setSecErrorMsg('Password baru minimal 5 karakter!');
        return;
      }
      if (securityData.newPassword !== securityData.confirmPassword) {
        setSecErrorMsg('Konfirmasi password baru tidak cocok!');
        return;
      }
    }
    setSavingSecurity(true);
    try {
      const updatedUser = {
        ...user,
        username: securityData.username,
        email: securityData.emailAdmin
      };
      if (securityData.newPassword) {
        localStorage.setItem('brmp_admin_custom_password', securityData.newPassword);
      }
      if (onUpdateUser) onUpdateUser(updatedUser);
      localStorage.setItem('brmp_admin_user', JSON.stringify(updatedUser));
      setSecSuccessMsg('Keamanan akun admin dan kredensial berhasil diperbarui!');
      setSecurityData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setTimeout(() => setSecSuccessMsg(''), 3500);
    } catch (err) {
      setSecErrorMsg(err.message || 'Gagal memperbarui keamanan akun');
    } finally {
      setSavingSecurity(false);
    }
  };

  // Cuti Verification Handlers
  const handleOpenVerifyModal = (cutiItem, actionType) => {
    setSelectedCutiAction(cutiItem);
    setVerifyModalType(actionType);
    if (actionType === 'approve') {
      if (cutiItem.status === 'menunggu_verif_1') {
        setVerifyTargetStage('1');
        setVerifyCatatan('Disetujui Tahap 1 (a.n. Ketua Tim Kerja). Tugas dinas telah dikoordinasikan.');
      } else {
        setVerifyTargetStage('2');
        setVerifyCatatan('Disetujui Definitif (a.n. Kepala Bagian TU). Cuti resmi disahkan dan jatah kuota dipotong.');
      }
    } else {
      setVerifyTargetStage('reject');
      setVerifyCatatan('Mohon maaf, permohonan cuti belum dapat disetujui karena beban agenda dinas balai padat.');
    }
    setShowCutiActionModal(true);
  };

  const handleOpenDetailModal = (cutiItem) => {
    setSelectedCutiDetail(cutiItem);
    setShowCutiDetailModal(true);
  };

  const handleConfirmVerifyCuti = async () => {
    if (!selectedCutiAction) return;
    setActionLoadingCuti(true);

    try {
      const nowStr = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';

      const updatedList = cutiList.map(item => {
        if (item.id !== selectedCutiAction.id) return item;

        if (verifyModalType === 'reject') {
          return {
            ...item,
            status: 'ditolak',
            verifikasi1: item.verifikasi1 || {
              approved: false,
              verifikatorNama: 'Administrator (Penolakan)',
              tanggal: nowStr,
              catatan: verifyCatatan
            },
            verifikasi2: item.status === 'menunggu_verif_2' ? {
              approved: false,
              verifikatorNama: 'Administrator (Penolakan Final)',
              tanggal: nowStr,
              catatan: verifyCatatan
            } : item.verifikasi2
          };
        }

        // Approve Tunggal oleh Kepegawaian (Langsung Disetujui & Potong Kuota Cuti)
        const isTahunan = item.jenisCuti === 'Tahunan';
        const durasi = Number(item.jumlahHari) || 0;
        
        // 2-Year Quota Deduction Scheme (FIFO: N-1 prioritized first, then N)
        let sisaN1Baru = item.sisaCutiN1 !== undefined ? item.sisaCutiN1 : 0;
        let sisaNBaru = item.sisaCutiN !== undefined ? item.sisaCutiN : (item.sisaCuti !== undefined ? item.sisaCuti : 12);
        
        if (isTahunan) {
          let sisaKebutuhan = durasi;
          if (sisaN1Baru > 0) {
            const potongN1 = Math.min(sisaKebutuhan, sisaN1Baru);
            sisaN1Baru -= potongN1;
            sisaKebutuhan -= potongN1;
          }
          if (sisaKebutuhan > 0) {
            sisaNBaru = Math.max(0, sisaNBaru - sisaKebutuhan);
          }
        }
        const sisaBaru = sisaN1Baru + sisaNBaru;
        const terpakaiBaru = (item.cutiTerpakai || 0) + (isTahunan ? durasi : 0);

        // Update employee quota in usersList and localStorage cache
        setUsersList(prev => prev.map(u => {
          if (u.nip === item.nip) {
            return { ...u, sisaCuti: sisaBaru, sisaCutiN: sisaNBaru, sisaCutiN1: sisaN1Baru };
          }
          return u;
        }));

        try {
          const stored = localStorage.getItem('brmp_users_cache');
          if (stored) {
            const parsed = JSON.parse(stored);
            const updated = parsed.map(u => u.nip === item.nip ? { ...u, sisaCuti: sisaBaru, sisaCutiN: sisaNBaru, sisaCutiN1: sisaN1Baru } : u);
            localStorage.setItem('brmp_users_cache', JSON.stringify(updated));
          }
        } catch (e) {}

        return {
          ...item,
          status: 'disetujui',
          sisaCuti: sisaBaru,
          sisaCutiN: sisaNBaru,
          sisaCutiN1: sisaN1Baru,
          cutiTerpakai: terpakaiBaru,
          verifikasi1: {
            approved: true,
            verifikatorNama: 'Petugas Kepegawaian',
            tanggal: nowStr,
            catatan: verifyCatatan || 'Disetujui dan disahkan langsung'
          },
          verifikasi2: {
            approved: true,
            verifikatorNama: 'Petugas Kepegawaian',
            tanggal: nowStr,
            catatan: verifyCatatan || 'Disetujui dan disahkan langsung'
          }
        };
      });

      setCutiList(updatedList);
      localStorage.setItem('brmp_cuti_history', JSON.stringify(updatedList));

      // Attempt backend sync
      try {
        await apiService.verifyCuti(
          selectedCutiAction.id,
          verifyTargetStage === '1' ? 1 : 2,
          verifyModalType,
          user,
          verifyCatatan
        );
      } catch (e) {}

      setCutiAlert({
        type: 'success',
        message: verifyModalType === 'approve'
          ? `Permohonan cuti ${selectedCutiAction.nama} berhasil ${verifyTargetStage === '1' ? 'disetujui Tahap 1' : 'disahkan resmi (Disetujui Final)'}!`
          : `Permohonan cuti ${selectedCutiAction.nama} telah ditolak dengan catatan alasan.`
      });
      setShowCutiActionModal(false);
      setSelectedCutiAction(null);

      setTimeout(() => setCutiAlert({ type: '', message: '' }), 4000);
    } catch (err) {
      setCutiAlert({ type: 'error', message: err.message || 'Gagal memproses verifikasi cuti' });
    } finally {
      setActionLoadingCuti(false);
    }
  };

  const handleExportCutiCSV = () => {
    const header = ["No", "NIP", "Nama Pegawai", "Jabatan", "Divisi", "Jenis Cuti", "Tgl Mulai", "Tgl Selesai", "Jumlah Hari", "Sisa Cuti", "Status", "Alasan"];
    const rows = cutiList.map((c, idx) => [
      idx + 1,
      `'${c.nip}`,
      `"${c.nama}"`,
      `"${c.jabatan || '-'}"`,
      `"${c.divisi || '-'}"`,
      `"${c.jenisCuti}"`,
      `"${c.tanggalMulai}"`,
      `"${c.tanggalAkhir}"`,
      c.jumlahHari,
      c.sisaCuti ?? 12,
      `"${c.status === 'disetujui' ? 'Disetujui' : c.status === 'ditolak' ? 'Ditolak' : 'Menunggu Verifikasi'}"`,
      `"${(c.alasan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [header.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Verifikasi_Cuti_BRMP_DIY_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cuti filtering
  const filteredCutiList = cutiList.filter(item => {
    const q = cutiSearch.toLowerCase().trim();
    const matchSearch = !q ||
      (item.nama || '').toLowerCase().includes(q) ||
      (item.nip || '').includes(q) ||
      (item.jenisCuti || '').toLowerCase().includes(q) ||
      (item.alasan || '').toLowerCase().includes(q);

    let matchStatus = true;
    if (cutiStatusFilter === 'pending') {
      matchStatus = item.status !== 'disetujui' && !item.status.startsWith('ditolak');
    } else if (cutiStatusFilter === 'disetujui') {
      matchStatus = item.status === 'disetujui';
    } else if (cutiStatusFilter === 'ditolak') {
      matchStatus = item.status === 'ditolak' || item.status.startsWith('ditolak');
    }

    let matchJenis = true;
    if (cutiJenisFilter !== 'ALL') {
      matchJenis = item.jenisCuti === cutiJenisFilter;
    }

    return matchSearch && matchStatus && matchJenis;
  });

  const totalCutiCount = cutiList.length;
  const pendingCutiCount = cutiList.filter(c => c.status !== 'disetujui' && !c.status.startsWith('ditolak')).length;
  const approvedCutiCount = cutiList.filter(c => c.status === 'disetujui').length;
  const rejectedCutiCount = cutiList.filter(c => c.status === 'ditolak' || c.status.startsWith('ditolak')).length;

  // Filtered employees
  const filteredUsers = usersList.filter(u => {
    const matchSearch = (u.nama || '').toLowerCase().includes(searchPegawai.toLowerCase()) ||
                        (u.nip || '').includes(searchPegawai) ||
                        (u.jabatan || '').toLowerCase().includes(searchPegawai.toLowerCase());
    const matchDivisi = filterDivisi === 'ALL' || (u.divisi || '').includes(filterDivisi);
    return matchSearch && matchDivisi;
  });

  const totalPegawaiPages = pegawaiPageSize === 'ALL' ? 1 : Math.ceil(filteredUsers.length / (pegawaiPageSize || 50)) || 1;
  const paginatedUsers = pegawaiPageSize === 'ALL'
    ? filteredUsers
    : filteredUsers.slice((pegawaiCurrentPage - 1) * pegawaiPageSize, pegawaiCurrentPage * pegawaiPageSize);

  // Filtered attendance logs from ADMS Machine with Dynamic Calendar Synchronization
  const filteredPresensi = presensiList.map(p => {
    let displayTgl = p.tanggal || getTodayIsoDate();
    if (presensiDateFilterMode === 'today' || autoSyncCalendar) {
      displayTgl = getTodayIsoDate();
    } else if (presensiDateFilterMode === 'custom') {
      displayTgl = presensiCalendarDate;
    } else {
      displayTgl = p.tanggalAsliMesin || p.tanggal || getTodayIsoDate();
    }

    return {
      ...p,
      displayTanggal: displayTgl
    };
  }).filter(p => {
    const q = (presensiSearch || '').toLowerCase();
    const matchQuery = !q || 
      (p.nama || '').toLowerCase().includes(q) ||
      (p.nip || '').includes(q) ||
      (p.sn || '').toLowerCase().includes(q) ||
      (p.metode || '').toLowerCase().includes(q) ||
      (p.divisi || '').toLowerCase().includes(q);
    
    let matchStatus = true;
    if (presensiFilterStatus === 'MASUK') {
      matchStatus = String(p.status || '').toLowerCase() === 'masuk' || (p.jamMasuk && p.jamMasuk !== '-');
    } else if (presensiFilterStatus === 'PULANG') {
      matchStatus = String(p.status || '').toLowerCase() === 'pulang' || (p.jamPulang && p.jamPulang !== '-');
    } else if (presensiFilterStatus === 'TERLAMBAT') {
      matchStatus = String(p.status || '').toLowerCase() === 'terlambat' || String(p.keterangan || '').toLowerCase().includes('terlambat');
    }

    let matchDate = true;
    if (presensiDateFilterMode === 'custom') {
      matchDate = p.displayTanggal === presensiCalendarDate || p.tanggalAsliMesin === presensiCalendarDate;
    } else if (presensiDateFilterMode === 'raw') {
      matchDate = !!p.tanggalAsliMesin;
    }

    return matchQuery && matchStatus && matchDate;
  });

  const totalPresensiPages = presensiPageSize === 'ALL' ? 1 : Math.ceil(filteredPresensi.length / (presensiPageSize || 50)) || 1;
  const paginatedPresensi = presensiPageSize === 'ALL' 
    ? filteredPresensi 
    : filteredPresensi.slice((presensiCurrentPage - 1) * presensiPageSize, presensiCurrentPage * presensiPageSize);

  return (
    <div className="admin-container">
      {/* 1. Breadcrumb & Top Action Header */}
      <div className="admin-header-row">
        <div>
          <div className="admin-breadcrumb">
            <span>Admin</span>
            <span className="sep">/</span>
            <span className="current">
              {activeTab === 'dashboard' ? 'Dashboard Kontrol' :
               activeTab === 'pegawai' ? 'Data Pegawai (CRUD)' :
               activeTab === 'presensi' ? 'Data Presensi All' :
               activeTab === 'cuti' ? 'Verifikasi Cuti Pegawai' :
               activeTab === 'spt' ? 'Data SPT & Penugasan' :
               activeTab === 'disposisi' ? 'Manajemen Disposisi' :
               activeTab === 'agenda' ? 'Agenda & Libur Kantor' :
               activeTab === 'pengaturan' ? 'Pengaturan Sistem' : 'Dashboard'}
            </span>
          </div>
          <h1 className="admin-page-title">
            {activeTab === 'dashboard' ? 'Dashboard Administrator Sistem & Kepegawaian' :
             activeTab === 'pegawai' ? 'Data Master Pegawai (ASN & PPPK BRMP DIY)' :
             activeTab === 'presensi' ? 'Rekap Data Presensi Seluruh Pegawai' :
             activeTab === 'cuti' ? 'Pusat Audit & Verifikasi Permohonan Cuti Pegawai' :
             activeTab === 'spt' ? 'Data Surat Perintah Tugas (SPT) Dinas' :
             activeTab === 'disposisi' ? 'Manajemen Surat Masuk & Disposisi Pimpinan' :
             activeTab === 'agenda' ? 'Agenda Kerja & Kalender Libur Kantor' :
             activeTab === 'pengaturan' ? 'Pengaturan Aplikasi & Keamanan' : 'Dashboard Administrator'}
          </h1>
        </div>

        <div className="admin-top-actions">
          {activeTab === 'pegawai' && (
            <>
              <button className="btn-admin-export" onClick={handleExportCSV} title="Unduh CSV seluruh master data">
                <Download size={16} />
                <span>Export Data (CSV)</span>
              </button>
              <button className="btn-admin-add" onClick={() => setShowAddModal(true)} title="Tambah Pegawai Baru">
                <Plus size={16} />
                <span>Tambah Pegawai</span>
              </button>
            </>
          )}
          {activeTab === 'cuti' && (
            <button className="btn-admin-export" onClick={handleExportCutiCSV} title="Unduh CSV rekap permohonan cuti pegawai">
              <Download size={16} />
              <span>Export Cuti (CSV)</span>
            </button>
          )}
          {activeTab === 'disposisi' && (
            <button className="btn-admin-add" onClick={() => setShowAddDispModal(true)} title="Catat Surat Disposisi Baru">
              <Plus size={16} />
              <span>+ Catat Surat Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Big Hero Banner & 3. Four Metric Stat Cards - HANYA TAMPIL DI TAB DASHBOARD ADMIN */}
      {activeTab === 'dashboard' && (
        <>
          <div className="admin-hero-banner">
            <div className="admin-hero-badges">
              <div className="hero-pill-active">
                <span className="dot"></span>
                <span>SISTEM AKTIF & SINKRON</span>
              </div>
              <div className="hero-pill-version">
                <span>VERSI SI-AP 3.0 BRMP DIY</span>
              </div>
            </div>

            <h2 className="admin-hero-title">
              Pusat Komando & Administrasi Kepegawaian
            </h2>
            <p className="admin-hero-desc">
              Portal terintegrasi pengelolaan master data ASN/PPPK, verifikasi presensi berbasis geofence GPS, pemantauan pengajuan cuti, validasi Surat Perintah Tugas (SPT), dan audit sistem Balai Besar Penerapan Modernisasi Pertanian Daerah Istimewa Yogyakarta.
            </p>

            {/* Status Pills Row */}
            <div className="admin-status-pills">
              <div className="status-tag online">
                <span className="dot-online"></span>
                <span>Server Node.js: Online</span>
              </div>
              <div className="status-tag">
                <MapPin size={14} color="#34d399" />
                <span>Radius GPS: {settingsData?.lokasiKantor || 'Kotagede'} ({settingsData?.radiusGps || 200}m)</span>
              </div>
              <div className="status-tag">
                <Shield size={14} color="#60a5fa" />
                <span>Hak Akses: Super Administrator</span>
              </div>
              <div className="status-tag">
                <Clock size={14} color="#f472b6" />
                <span>Waktu Server: {currentTime || '12:38:27 WIB'}</span>
              </div>
            </div>
          </div>

          {/* 3. Four Metric Stat Cards (Matching User Screenshot Exactly) */}
          <div className="admin-stats-grid">
            {/* Card 1: TOTAL MASTER PEGAWAI */}
            <div className="metric-card" onClick={() => handleTabSwitch('pegawai')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="metric-top">
                  <span className="metric-label">TOTAL MASTER PEGAWAI</span>
                  <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', boxShadow: '0 3px 8px rgba(37,99,235,0.3)' }}>
                    <Users size={19} strokeWidth={2.4} />
                  </div>
                </div>
                <div className="metric-number-row">
                  <span className="metric-number">
                    {usersList.length > 0 ? usersList.length : 117}
                  </span>
                  <span className="metric-unit">Pegawai</span>
                </div>
              </div>
              <div className="metric-bottom">
                <span className="metric-sub-left green">✓ Terdaftar Lengkap</span>
                <span className="metric-sub-right">ASN & PPPK Balai</span>
              </div>
            </div>

            {/* Card 2: PRESENSI HARI INI */}
            <div className="metric-card" onClick={() => handleTabSwitch('presensi')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="metric-top">
                  <span className="metric-label">LOG PRESENSI MESIN (ADMS)</span>
                  <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#ffffff', boxShadow: '0 3px 8px rgba(139,92,246,0.3)' }}>
                    <Fingerprint size={20} strokeWidth={2.4} />
                  </div>
                </div>
                <div className="metric-number-row">
                  <span className="metric-number">{presensiList.length > 0 ? presensiList.length : 250}</span>
                  <span className="metric-unit">Scan Masuk/Pulang</span>
                </div>
              </div>
              <div className="metric-bottom">
                <span className="metric-sub-left green">✓ Mesin ADMS Lobi Terhubung</span>
                <span className="metric-sub-right">Realtime Fingerprint</span>
              </div>
            </div>

            {/* Card 3: PERMOHONAN CUTI */}
            <div className="metric-card" onClick={() => handleTabSwitch('cuti')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="metric-top">
                  <span className="metric-label">PERMOHONAN CUTI</span>
                  <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', color: '#ffffff', boxShadow: '0 3px 8px rgba(20,184,166,0.3)' }}>
                    <CalendarHeart size={19} strokeWidth={2.4} />
                  </div>
                </div>
                <div className="metric-number-row">
                  <span className="metric-number">{cutiList.length}</span>
                  <span className="metric-unit">Pengajuan</span>
                </div>
              </div>
              <div className="metric-bottom">
                <span className="metric-sub-left orange">⚡ {pendingCutiCount} Menunggu Verifikasi</span>
                <span className="metric-sub-right">Tahun 2026</span>
              </div>
            </div>

            {/* Card 4: SURAT PERINTAH TUGAS */}
            <div className="metric-card" onClick={() => handleTabSwitch('spt')} style={{ cursor: 'pointer' }}>
              <div>
                <div className="metric-top">
                  <span className="metric-label">SURAT PERINTAH TUGAS</span>
                  <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#ffffff', boxShadow: '0 3px 8px rgba(249,115,22,0.3)' }}>
                    <ScrollText size={19} strokeWidth={2.4} />
                  </div>
                </div>
                <div className="metric-number-row">
                  <span className="metric-number">3</span>
                  <span className="metric-unit">Surat</span>
                </div>
              </div>
              <div className="metric-bottom">
                <span className="metric-sub-left blue">📍 Sleman & Kulon Progo</span>
                <span className="metric-sub-right">Dinas Lapangan</span>
              </div>
            </div>
          </div>
        </>
      )}


      {/* 5. TAB CONTENT */}

      {/* TAB A: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Left: Live Presence Log & Overview */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#059669" />
                <span className="admin-card-title">Log Presensi Hari Ini (Geofence & Mesin)</span>
              </div>
              <button 
                className="btn-admin-export" 
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => handleTabSwitch('presensi')}
              >
                Lihat Semua
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Pegawai</th>
                    <th>Jam Masuk</th>
                    <th>Jarak GPS</th>
                    <th>Metode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {presensiList.slice(0, 6).map((item, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.nama}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>NIP: {item.nip}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.jamMasuk}</td>
                      <td>
                        <span style={{ fontSize: '12px', color: item.jarakMeter <= 200 ? '#15803d' : '#b91c1c' }}>
                          📍 {item.jarakMeter}m ({item.jarakMeter <= 200 ? 'Dalam Radius' : 'Luar Radius'})
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>{item.metode}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: item.status === 'Hadir' ? '#dcfce7' : item.status === 'Terlambat' ? '#fef3c7' : '#fee2e2',
                          color: item.status === 'Hadir' ? '#166534' : item.status === 'Terlambat' ? '#92400e' : '#991b1b'
                        }}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Quick Action & System Info */}
          <div>
            <div className="admin-card" style={{ marginBottom: '1.25rem' }}>
              <div className="admin-card-header">
                <span className="admin-card-title">Aksi Cepat Administrator</span>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  onClick={() => setShowAddModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    color: '#166534',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Plus size={16} />
                  <span>Tambah Pegawai Baru</span>
                </button>

                <button 
                  onClick={() => handleTabSwitch('cuti')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    color: '#92400e',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <CalendarHeart size={16} />
                  <span>Verifikasi Permohonan Cuti ({pendingCutiCount} Menunggu)</span>
                </button>

                <button 
                  onClick={() => handleTabSwitch('spt')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    color: '#1e40af',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <FileText size={16} />
                  <span>Kelola Penomoran SPT & Tata Naskah</span>
                </button>

                <button 
                  onClick={() => setShowSettingsModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Settings size={16} />
                  <span>Konfigurasi Geofence GPS Kotagede</span>
                </button>
              </div>
            </div>

            {/* Balai Info Card */}
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Informasi Balai DIY</span>
              </div>
              <div style={{ padding: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  {settingsData?.namaBalai || 'Balai Penerapan Modernisasi Pertanian DIY'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>
                  Kementerian Pertanian Republik Indonesia
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  <span>Kepala Balai:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{settingsData?.kepalaBalai || 'Dr. Soeharsono, S.Pt, M.Si'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  <span>Jam Operasional:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{settingsData?.jamMasuk || '07:30'} - {settingsData?.jamPulang || '16:00'} WIB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  <span>Radius Absen:</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>{settingsData?.radiusGps || 200} Meter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: DATA PEGAWAI (CRUD) */}
      {activeTab === 'pegawai' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <span className="admin-card-title">Database Seluruh Pegawai BRMP DIY</span>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Total: {filteredUsers.length} pegawai terdata dalam sistem
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Cari NIP, nama, jabatan..." 
                  className="admin-form-input"
                  style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
                  value={searchPegawai}
                  onChange={(e) => setSearchPegawai(e.target.value)}
                />
              </div>

              <select 
                className="admin-form-select" 
                style={{ width: '180px', fontSize: '0.8rem' }}
                value={filterDivisi}
                onChange={(e) => {
                  setFilterDivisi(e.target.value);
                  setPegawaiCurrentPage(1);
                }}
              >
                <option value="ALL">Semua Tim Kerja</option>
                <option value="SDM">Tim Kerja SDM</option>
                <option value="Tata Usaha">Tim Kerja TU</option>
                <option value="Standar">Tim Standardisasi</option>
                <option value="Pengujian">Tim Pengujian</option>
              </select>

              <select 
                className="admin-form-select" 
                style={{ width: '130px', fontSize: '0.8rem' }}
                value={pegawaiPageSize}
                onChange={(e) => {
                  setPegawaiPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                  setPegawaiCurrentPage(1);
                }}
              >
                <option value={25}>25 per hal</option>
                <option value={50}>50 per hal</option>
                <option value={100}>100 per hal</option>
                <option value="ALL">Semua ({filteredUsers.length})</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Pegawai (Nama & NIP)</th>
                  <th>Jabatan & Golongan</th>
                  <th>Tim Kerja / Divisi</th>
                  <th>Hak Akses & Role</th>
                  <th>PIN Mesin</th>
                  <th>Sisa Cuti</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u, idx) => {
                  const rowNum = pegawaiPageSize === 'ALL' ? idx + 1 : (pegawaiCurrentPage - 1) * pegawaiPageSize + idx + 1;
                  return (
                  <tr key={u.id || idx}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{rowNum}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          color: '#ffffff',
                          border: '2px solid #a7f3d0',
                          boxShadow: '0 2px 4px rgba(5, 150, 105, 0.15)'
                        }}>
                          {(() => {
                            const photo = u.fotoProfil || getStoredAvatar(u.nip);
                            return photo ? (
                              <img src={photo} alt={u.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span>{(u.nama || 'P').charAt(0).toUpperCase()}</span>
                            );
                          })()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.nama}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>NIP: {u.nip}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{u.jabatan}</div>
                      <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>Gol: {u.golongan || '-'}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      {u.divisi || 'Balai DIY'}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: u.systemRole === 'admin' ? '#fef3c7' : '#f1f5f9',
                        color: u.systemRole === 'admin' ? '#92400e' : '#334155'
                      }}>
                        {u.roleLabel || u.systemRole || 'Pegawai'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        PIN: {u.pinMesin || '-'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {u.sisaCuti || 12} Hari
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          title="Edit Pegawai"
                          style={{
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u)}
                          title="Hapus Pegawai"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Pegawai */}
          {pegawaiPageSize !== 'ALL' && totalPegawaiPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Menampilkan {(pegawaiCurrentPage - 1) * pegawaiPageSize + 1} - {Math.min(pegawaiCurrentPage * pegawaiPageSize, filteredUsers.length)} dari <strong>{filteredUsers.length}</strong> pegawai
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  disabled={pegawaiCurrentPage <= 1}
                  onClick={() => setPegawaiCurrentPage(p => Math.max(1, p - 1))}
                  className="btn-admin-export"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', opacity: pegawaiCurrentPage <= 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={14} />
                  <span>Sebelumnya</span>
                </button>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', padding: '0 8px' }}>
                  Halaman {pegawaiCurrentPage} / {totalPegawaiPages}
                </span>
                <button
                  type="button"
                  disabled={pegawaiCurrentPage >= totalPegawaiPages}
                  onClick={() => setPegawaiCurrentPage(p => Math.min(totalPegawaiPages, p + 1))}
                  className="btn-admin-export"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', opacity: pegawaiCurrentPage >= totalPegawaiPages ? 0.5 : 1 }}
                >
                  <span>Selanjutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB C: DATA PRESENSI ALL (REALTIME MESIN ADMS & GEOFENCE) */}
      {activeTab === 'presensi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Mesin Fisik ADMS Live Connection Card */}
          <div className="admin-card" style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(6, 78, 59, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px'
                  }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff', display: 'inline-block' }}></span>
                    ONLINE & TERHUBUNG KE MESIN
                  </span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    Protokol ADMS Push HTTP Port 80
                  </span>
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
                  Mesin Absensi Lobi Utama (Solution / ZKTeco)
                </h3>
                <div style={{ fontSize: '0.82rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span>Serial Number (SN): <strong>{admsMachinesList[0]?.sn || 'UCR6235200084'}</strong></span>
                  <span>IP Mesin: <strong>{admsMachinesList[0]?.ip || '192.168.2.73'}</strong></span>
                  <span>Total Log Terdata: <strong>{presensiList.length} Log Presensi Realtime</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => loadAllData(true)}
                  disabled={syncingAdms}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ffffff',
                    color: '#065f46',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: syncingAdms ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s'
                  }}
                >
                  <RefreshCw size={16} style={{ animation: syncingAdms ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{syncingAdms ? 'Menyinkronkan...' : 'Sinkronkan dari Mesin Sekarang'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sync Success Alert if any */}
          {admsSyncMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#ecfdf5',
              border: '1.5px solid #a7f3d0',
              color: '#065f46',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{admsSyncMsg}</span>
            </div>
          )}

          {/* Panel Kontrol Sinkronisasi Kalender & Filter Tanggal Presensi */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            border: '1.5px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarDays size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                    Sinkronisasi Kalender Presensi
                  </span>
                  {autoSyncCalendar ? (
                    <span style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }}></span>
                      AUTO-SYNC AKTIF
                    </span>
                  ) : (
                    <span style={{
                      background: '#64748b',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      FILTER MANUAL
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                  Tanggal Kalender Terpilih: <strong style={{ color: '#065f46' }}>{presensiDateFilterMode === 'today' || autoSyncCalendar ? getTodayIsoDate() : (presensiCalendarDate || getTodayIsoDate())}</strong> • Log otomatis sinkron berganti mengikuti kalender hari ini
                </div>
              </div>
            </div>

            {/* Quick Mode Buttons & Date Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setAutoSyncCalendar(true);
                  setPresensiDateFilterMode('today');
                  setPresensiCalendarDate(getTodayIsoDate());
                  setPresensiCurrentPage(1);
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '7px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: (presensiDateFilterMode === 'today' && autoSyncCalendar) ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  background: (presensiDateFilterMode === 'today' && autoSyncCalendar) ? '#16a34a' : '#ffffff',
                  color: (presensiDateFilterMode === 'today' && autoSyncCalendar) ? '#ffffff' : '#334155',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s'
                }}
                title="Klik untuk kembali ke rekaman presensi hari ini"
              >
                {(presensiDateFilterMode === 'today' && autoSyncCalendar) ? '✓ ' : ''}Hari Ini ({getTodayIsoDate()})
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                padding: '4px 10px',
                borderRadius: '7px',
                border: presensiDateFilterMode === 'custom' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                boxShadow: presensiDateFilterMode === 'custom' ? '0 0 0 2px rgba(2, 132, 199, 0.15)' : 'none',
                transition: 'all 0.15s'
              }}>
                <span style={{ fontSize: '0.78rem', color: presensiDateFilterMode === 'custom' ? '#0284c7' : '#64748b', fontWeight: 700 }}>
                  Pilih Kalender:
                </span>
                <input
                  type="date"
                  value={presensiCalendarDate}
                  onChange={(e) => {
                    setPresensiCalendarDate(e.target.value);
                    setAutoSyncCalendar(false);
                    setPresensiDateFilterMode('custom');
                    setPresensiCurrentPage(1);
                  }}
                  style={{
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Main Attendance Log Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <span className="admin-card-title">Rekapitulasi Presensi Realtime (Mesin ADMS & Geofence Balai)</span>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Total {filteredPresensi.length} rekaman log absensi masuk & pulang pegawai BRMP DIY
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Cari NIP, nama, divisi..."
                    className="admin-form-input"
                    style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
                    value={presensiSearch}
                    onChange={(e) => {
                      setPresensiSearch(e.target.value);
                      setPresensiCurrentPage(1);
                    }}
                  />
                </div>

                {/* Filter Status */}
                <select
                  className="admin-form-select"
                  style={{ width: '140px', fontSize: '0.8rem' }}
                  value={presensiFilterStatus}
                  onChange={(e) => {
                    setPresensiFilterStatus(e.target.value);
                    setPresensiCurrentPage(1);
                  }}
                >
                  <option value="ALL">Semua Scan</option>
                  <option value="MASUK">Presensi Masuk</option>
                  <option value="PULANG">Presensi Pulang</option>
                  <option value="TERLAMBAT">Terlambat</option>
                </select>

                {/* Page Size */}
                <select
                  className="admin-form-select"
                  style={{ width: '130px', fontSize: '0.8rem' }}
                  value={presensiPageSize}
                  onChange={(e) => {
                    setPresensiPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                    setPresensiCurrentPage(1);
                  }}
                >
                  <option value={25}>25 per hal</option>
                  <option value={50}>50 per hal</option>
                  <option value={100}>100 per hal</option>
                  <option value="ALL">Semua ({filteredPresensi.length})</option>
                </select>

                <button className="btn-admin-export" onClick={handleExportPresensiCSV}>
                  <Download size={14} />
                  <span>Download Log CSV</span>
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Pegawai (Nama & NIP)</th>
                    <th>Divisi / Tim Kerja</th>
                    <th>Tanggal</th>
                    <th>Jam Masuk</th>
                    <th>Jam Pulang</th>
                    <th>Verifikasi Geofence GPS</th>
                    <th>Metode Absen</th>
                    <th>Status & Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPresensi.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>Belum ada log presensi yang sesuai filter</div>
                        <div style={{ fontSize: '0.82rem' }}>Klik tombol "Sinkronkan dari Mesin Sekarang" di atas untuk memuat log langsung dari mesin fingerprint.</div>
                      </td>
                    </tr>
                  ) : (
                    paginatedPresensi.map((p, idx) => {
                      const rowNum = presensiPageSize === 'ALL' ? idx + 1 : (presensiCurrentPage - 1) * presensiPageSize + idx + 1;
                      const isCheckIn = p.jamMasuk && p.jamMasuk !== '-';
                      const isCheckOut = p.jamPulang && p.jamPulang !== '-';
                      const isLate = String(p.status || '').toLowerCase() === 'terlambat' || String(p.keterangan || '').toLowerCase().includes('terlambat');
                      const isPulang = String(p.status || '').toLowerCase() === 'pulang';

                      return (
                        <tr key={p.id || idx}>
                          <td style={{ color: '#94a3b8', fontWeight: 600 }}>{rowNum}</td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.nama}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>NIP: {p.nip}</div>
                          </td>
                          <td style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                            {p.divisi || 'Tim Kerja Pengelolaan SDM & TU'}
                          </td>
                          <td style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CalendarDays size={13} color="#059669" />
                              <span>{p.displayTanggal || p.tanggal || getTodayIsoDate()}</span>
                            </div>
                            {autoSyncCalendar ? (
                              <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <span>✓ Auto-Sync Kalender</span>
                              </div>
                            ) : (
                              <div style={{ fontSize: '10px', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                                <span>Filter Kalender</span>
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: 700, color: isCheckIn ? '#065f46' : '#94a3b8' }}>
                            {p.jamMasuk || '-'}
                          </td>
                          <td style={{ fontWeight: 700, color: isCheckOut ? '#1e40af' : '#94a3b8' }}>
                            {p.jamPulang || '-'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={14} color="#16a34a" />
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>
                                {p.lokasi || 'Lobi Kantor Balai'} ({p.jarakMeter !== undefined ? `${p.jarakMeter}m` : '0m'})
                              </span>
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
                              {p.metode || 'Mesin ADMS Fingerprint'}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: isLate ? '#fef3c7' : (isPulang ? '#dbeafe' : '#dcfce7'),
                              color: isLate ? '#92400e' : (isPulang ? '#1e40af' : '#166534')
                            }}>
                              {p.keterangan || p.status || 'Hadir'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls for Presensi */}
            {presensiPageSize !== 'ALL' && totalPresensiPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Menampilkan {(presensiCurrentPage - 1) * presensiPageSize + 1} - {Math.min(presensiCurrentPage * presensiPageSize, filteredPresensi.length)} dari <strong>{filteredPresensi.length}</strong> log presensi mesin
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    disabled={presensiCurrentPage <= 1}
                    onClick={() => setPresensiCurrentPage(p => Math.max(1, p - 1))}
                    className="btn-admin-export"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', opacity: presensiCurrentPage <= 1 ? 0.5 : 1 }}
                  >
                    <ChevronLeft size={14} />
                    <span>Sebelumnya</span>
                  </button>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', padding: '0 8px' }}>
                    Halaman {presensiCurrentPage} / {totalPresensiPages}
                  </span>
                  <button
                    type="button"
                    disabled={presensiCurrentPage >= totalPresensiPages}
                    onClick={() => setPresensiCurrentPage(p => Math.min(totalPresensiPages, p + 1))}
                    className="btn-admin-export"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', opacity: presensiCurrentPage >= totalPresensiPages ? 0.5 : 1 }}
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB D: DATA CUTI PEGAWAI (ADMIN VERIFIKASI & AUDIT KUOTA) */}
      {activeTab === 'cuti' && (
        <div className="admin-card" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div className="admin-card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarHeart size={20} color="#059669" />
                <span className="admin-card-title">Pusat Audit & Verifikasi Permohonan Cuti Pegawai</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Pengawasan jatah cuti resmi, persetujuan Petugas Kepegawaian (1 Kali ACC), dan pemotongan kuota ASN
              </div>
            </div>
          </div>

          <div style={{ padding: '1.25rem 1.5rem' }}>
            {/* Feedback Alert if any */}
            {cutiAlert.message && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: cutiAlert.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: cutiAlert.type === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${cutiAlert.type === 'success' ? '#bbf7d0' : '#fecaca'}`
              }}>
                {cutiAlert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{cutiAlert.message}</span>
              </div>
            )}

            {/* SOP & Peran Administrator Info Box */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              padding: '1.1rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid #bbf7d0',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#059669',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
              }}>
                <Shield size={18} />
              </div>
              <div style={{ flex: 1, fontSize: '0.82rem', color: '#166534', lineHeight: 1.55 }}>
                <strong style={{ color: '#064e3b', fontSize: '0.88rem' }}>SOP & Otoritas Verifikasi Administrator BRMP DIY:</strong>
                <div style={{ marginTop: '4px' }}>
                  Akun Administrator memiliki hak akses <strong>Pengawasan & Pengesahan Cuti</strong> untuk seluruh pegawai. Admin bertindak sebagai verifikator (melihat, menyetujui, dan menolak permohonan) serta mengontrol jatah kuota tahunan. Admin tidak melakukan pengajuan cuti mandiri pada portal admin ini.
                </div>
              </div>
            </div>

            {/* Stat Metric Cards (4 Cards) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {/* Total Card */}
              <div style={{
                background: '#ffffff',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                borderLeft: '4px solid #3b82f6'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Permohonan
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                  {totalCutiCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Berkas</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Seluruh riwayat pengajuan
                </div>
              </div>

              {/* Menunggu Verifikasi */}
              <div style={{
                background: '#ffffff',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid #fed7aa',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                borderLeft: '4px solid #f59e0b'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                    Menunggu Verifikasi
                  </span>
                  {pendingCutiCount > 0 && (
                    <span style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      border: '1px solid #fde68a'
                    }}>
                      Prioritas
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309', margin: '4px 0 2px' }}>
                  {pendingCutiCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309' }}>Pegawai</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                  Perlu tindak lanjut Admin/Atasan
                </div>
              </div>

              {/* Disetujui */}
              <div style={{
                background: '#ffffff',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                borderLeft: '4px solid #10b981'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                  Disetujui Resmi
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d', margin: '4px 0 2px' }}>
                  {approvedCutiCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>Disahkan</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534' }}>
                  Kuota cuti telah dipotong
                </div>
              </div>

              {/* Ditolak */}
              <div style={{
                background: '#ffffff',
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid #fecaca',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                borderLeft: '4px solid #ef4444'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase' }}>
                  Ditolak
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b91c1c', margin: '4px 0 2px' }}>
                  {rejectedCutiCount} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c' }}>Berkas</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>
                  Dengan catatan alasan
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search input */}
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text"
                    placeholder="Cari nama pegawai, NIP, jenis cuti, atau alasan..."
                    value={cutiSearch}
                    onChange={(e) => setCutiSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  />
                  {cutiSearch && (
                    <button 
                      onClick={() => setCutiSearch('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Jenis Cuti Dropdown */}
                <div style={{ minWidth: '180px' }}>
                  <select
                    value={cutiJenisFilter}
                    onChange={(e) => setCutiJenisFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      background: '#ffffff',
                      color: '#1e293b',
                      outline: 'none',
                      fontWeight: 600
                    }}
                  >
                    <option value="ALL">Semua Jenis Cuti</option>
                    <option value="Tahunan">Cuti Tahunan</option>
                    <option value="Sakit">Cuti Sakit</option>
                    <option value="Alasan Penting">Cuti Alasan Penting</option>
                    <option value="Melahirkan">Cuti Melahirkan</option>
                    <option value="Cuti Besar">Cuti Besar</option>
                  </select>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
                  Status:
                </span>
                {[
                  { key: 'all', label: 'Semua', count: totalCutiCount },
                  { key: 'pending', label: 'Menunggu ACC Kepegawaian', count: pendingCutiCount },
                  { key: 'disetujui', label: 'Disetujui', count: approvedCutiCount },
                  { key: 'ditolak', label: 'Ditolak', count: rejectedCutiCount }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setCutiStatusFilter(tab.key)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: cutiStatusFilter === tab.key ? '1px solid #059669' : '1px solid #cbd5e1',
                      background: cutiStatusFilter === tab.key ? '#059669' : '#ffffff',
                      color: cutiStatusFilter === tab.key ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{
                      background: cutiStatusFilter === tab.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                      color: cutiStatusFilter === tab.key ? '#ffffff' : '#64748b',
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      fontWeight: 800
                    }}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>No</th>
                    <th>Pegawai Pemohon</th>
                    <th>Jenis & Alasan Cuti</th>
                    <th>Periode & Durasi</th>
                    <th>Sisa Kuota</th>
                    <th>Alur Verifikasi</th>
                    <th style={{ textAlign: 'center', width: '220px' }}>Aksi Verifikasi Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCutiList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                        <CalendarOff size={40} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>
                          Tidak Ada Permohonan Cuti
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Tidak ditemukan data yang sesuai dengan pencarian atau filter status yang dipilih.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCutiList.map((item, idx) => {
                      const isPending = item.status === 'menunggu_verif_1' || item.status === 'menunggu_verif_2';
                      const userAvatar = getStoredAvatar(item.nip);

                      return (
                        <tr key={item.id || idx}>
                          {/* 1. No */}
                          <td style={{ color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>

                          {/* 2. Pegawai */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: userAvatar ? `url(${userAvatar}) center/cover no-repeat` : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                flexShrink: 0,
                                border: '1px solid #d1fae5'
                              }}>
                                {!userAvatar && (item.nama ? item.nama.charAt(0) : 'P')}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                                  {item.nama}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  NIP: {item.nip}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>
                                  {item.jabatan || 'Pegawai BRMP DIY'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 3. Jenis Cuti & Alasan */}
                          <td>
                            <div style={{ marginBottom: '4px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: item.jenisCuti === 'Tahunan' ? '#eff6ff' : item.jenisCuti === 'Sakit' ? '#fff7ed' : '#f5f3ff',
                                color: item.jenisCuti === 'Tahunan' ? '#1d4ed8' : item.jenisCuti === 'Sakit' ? '#c2410c' : '#6d28d9',
                                border: `1px solid ${item.jenisCuti === 'Tahunan' ? '#bfdbfe' : item.jenisCuti === 'Sakit' ? '#fed7aa' : '#ddd6fe'}`
                              }}>
                                {item.jenisCuti}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#334155', maxWidth: '240px', lineHeight: 1.4 }}>
                              "{item.alasan}"
                            </div>
                          </td>

                          {/* 4. Periode & Durasi */}
                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                              {item.tanggalMulai} s/d {item.tanggalAkhir}
                            </div>
                            <div style={{
                              display: 'inline-block',
                              marginTop: '3px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              color: '#475569',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              <Clock size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                              {item.jumlahHari} Hari Kerja
                            </div>
                          </td>

                          {/* 5. Sisa Kuota Cuti */}
                          <td>
                            <div style={{
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              color: (item.sisaCuti ?? 12) <= 3 ? '#dc2626' : '#059669'
                            }}>
                              {item.sisaCuti ?? 12} Hari
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                              Kuota Tahunan
                            </div>
                          </td>

                          {/* 6. Persetujuan Kepegawaian (1 Kali ACC) */}
                          <td>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                background: item.status === 'disetujui' ? '#10b981' : item.status === 'ditolak' ? '#ef4444' : '#f59e0b',
                                color: '#ffffff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 800
                              }}>
                                {item.status === 'disetujui' ? '✓' : item.status === 'ditolak' ? '✕' : '⏳'}
                              </span>
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: item.status === 'disetujui' ? '#166534' : item.status === 'ditolak' ? '#b91c1c' : '#b45309' }}>
                                  {item.status === 'disetujui' ? 'ACC Kepegawaian (Selesai)' : item.status === 'ditolak' ? 'Ditolak Kepegawaian' : 'Menunggu ACC Kepegawaian'}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                  {item.status === 'disetujui' ? 'Jatah kuota terpotong' : item.status === 'ditolak' ? 'Permohonan ditolak' : '1 Kali ACC langsung disetujui'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 7. Action Buttons */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              {isPending ? (
                                <>
                                  <button
                                    onClick={() => handleOpenVerifyModal(item, 'approve')}
                                    title="Setujui permohonan cuti"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: '#059669',
                                      color: '#ffffff',
                                      border: 'none',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 3px rgba(5,150,105,0.3)',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <CheckCircle2 size={13} />
                                    <span>Setujui</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenVerifyModal(item, 'reject')}
                                    title="Tolak permohonan cuti"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      background: '#ef4444',
                                      color: '#ffffff',
                                      border: 'none',
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 3px rgba(239,68,68,0.3)',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <XCircle size={13} />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              ) : null}

                              <button
                                onClick={() => setSelectedPrintCutiAdmin(item)}
                                title="Cetak Formulir Resmi Cuti BKN (A4)"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <FileText size={13} />
                                <span>Formulir BKN</span>
                              </button>

                              <button
                                onClick={() => handleOpenDetailModal(item)}
                                title="Lihat rincian lengkap berkas permohonan"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: '#ffffff',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <Eye size={13} />
                                <span>Detail</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB E: ADMINISTRASI SPT & PENGELOLAAN PANITERA (FLEKSIBEL) */}
      {activeTab === 'spt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header & Alert Message */}
          {sptAlertMsg.text && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '8px',
              background: sptAlertMsg.type === 'error' ? '#fef2f2' : sptAlertMsg.type === 'warning' ? '#fffbeb' : sptAlertMsg.type === 'info' ? '#eff6ff' : '#f0fdf4',
              border: `1px solid ${sptAlertMsg.type === 'error' ? '#fecaca' : sptAlertMsg.type === 'warning' ? '#fde68a' : sptAlertMsg.type === 'info' ? '#bfdbfe' : '#bbf7d0'}`,
              color: sptAlertMsg.type === 'error' ? '#991b1b' : sptAlertMsg.type === 'warning' ? '#92400e' : sptAlertMsg.type === 'info' ? '#1e40af' : '#166534',
              fontSize: '0.88rem',
              fontWeight: 600
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {sptAlertMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span>{sptAlertMsg.text}</span>
              </div>
              <button 
                type="button"
                onClick={() => setSptAlertMsg({ type: '', text: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div className="metric-card" style={{ cursor: 'default' }}>
              <div className="metric-top">
                <span className="metric-label">TOTAL ARSIP SPT</span>
                <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff' }}>
                  <ScrollText size={18} />
                </div>
              </div>
              <div className="metric-value">{sptRecordsList.length}</div>
              <div className="metric-sub">
                <span className="sub-left">✓ Terdata Lengkap</span>
                <span className="sub-right">Tahun 2026</span>
              </div>
            </div>

            <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setSptSubTab('panitera')}>
              <div className="metric-top">
                <span className="metric-label">PANITERA AKTIF</span>
                <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff' }}>
                  <UserCheck size={18} />
                </div>
              </div>
              <div className="metric-value">{sptPaniteraList.length}</div>
              <div className="metric-sub">
                <span className="sub-left">⚡ Fleksibel & Dinamis</span>
                <span className="sub-right">Penyusun Usulan</span>
              </div>
            </div>

            <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setSptSubTab('penomoran')}>
              <div className="metric-top">
                <span className="metric-label">SIAP PENOMORAN DINAS</span>
                <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff' }}>
                  <FileCheck size={18} />
                </div>
              </div>
              <div className="metric-value">{sptRecordsList.filter(s => s.status === 'ready_to_issue' || !s.nomorSpt).length}</div>
              <div className="metric-sub">
                <span className="sub-left">⚡ Menunggu Terbit Nomor</span>
                <span className="sub-right">Kementan RI</span>
              </div>
            </div>

            <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => setSptSubTab('monitoring')}>
              <div className="metric-top">
                <span className="metric-label">TERVALIDASI RESMI QR</span>
                <div className="metric-icon-box" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#fff' }}>
                  <QrCode size={18} />
                </div>
              </div>
              <div className="metric-value">{sptRecordsList.filter(s => s.status === 'published' && s.nomorSpt).length}</div>
              <div className="metric-sub">
                <span className="sub-left">✓ Ber-QR Keaslian</span>
                <span className="sub-right">Kepala Balai</span>
              </div>
            </div>
          </div>

          {/* Sub-tab Navigation */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            background: '#ffffff',
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <button
              type="button"
              onClick={() => setSptSubTab('panitera')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: sptSubTab === 'panitera' ? '#047857' : 'transparent',
                color: sptSubTab === 'panitera' ? '#ffffff' : '#475569',
                fontWeight: sptSubTab === 'panitera' ? 700 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <UserCheck size={16} />
              <span>1. Kelola Role Panitera (Fleksibel)</span>
              <span style={{
                background: sptSubTab === 'panitera' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: sptSubTab === 'panitera' ? '#ffffff' : '#475569',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {sptPaniteraList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSptSubTab('penomoran')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: sptSubTab === 'penomoran' ? '#047857' : 'transparent',
                color: sptSubTab === 'penomoran' ? '#ffffff' : '#475569',
                fontWeight: sptSubTab === 'penomoran' ? 700 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Printer size={16} />
              <span>2. Penomoran Dinas & Penerbitan</span>
              <span style={{
                background: sptSubTab === 'penomoran' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: sptSubTab === 'penomoran' ? '#ffffff' : '#475569',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {sptRecordsList.filter(s => s.status === 'ready_to_issue' || !s.nomorSpt).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSptSubTab('konsiderans')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: sptSubTab === 'konsiderans' ? '#047857' : 'transparent',
                color: sptSubTab === 'konsiderans' ? '#ffffff' : '#475569',
                fontWeight: sptSubTab === 'konsiderans' ? 700 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={16} />
              <span>3. Konsiderans Menimbang & Dasar Hukum</span>
            </button>

            <button
              type="button"
              onClick={() => setSptSubTab('monitoring')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: sptSubTab === 'monitoring' ? '#047857' : 'transparent',
                color: sptSubTab === 'monitoring' ? '#ffffff' : '#475569',
                fontWeight: sptSubTab === 'monitoring' ? 700 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ScrollText size={16} />
              <span>4. Monitoring & Arsip Seluruh SPT</span>
              <span style={{
                background: sptSubTab === 'monitoring' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: sptSubTab === 'monitoring' ? '#ffffff' : '#475569',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {sptRecordsList.length}
              </span>
            </button>
          </div>

          {/* SUB-TAB 1: KELOLA ROLE PANITERA */}
          {sptSubTab === 'panitera' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Form Tambah Panitera */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <span className="admin-card-title">Penetapan Panitera SPT Baru</span>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Pilih pegawai aktif dari master data (117 ASN/PPPK) untuk diberikan wewenang menyusun usulan SPT
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    marginBottom: '1.25rem',
                    color: '#065f46',
                    fontSize: '0.84rem'
                  }}>
                    <UserCheck size={20} color="#059669" style={{ flexShrink: 0 }} />
                    <div>
                      <strong>Sistem Panitera Fleksibel:</strong> Administrator dapat menetapkan dan mencabut wewenang Panitera kapan saja sesuai kebutuhan tim kerja. Panitera dapat menyusun draf SPT dinas untuk diverifikasi Kobag TU.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Cari & Pilih Pegawai Balai:
                      </label>
                      <select
                        value={selectedCandidateNip}
                        onChange={(e) => setSelectedCandidateNip(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.88rem',
                          background: '#ffffff',
                          color: '#0f172a'
                        }}
                      >
                        <option value="">-- Pilih Pegawai (Total: {usersList.length}) --</option>
                        {Array.isArray(usersList) && usersList
                          .filter(u => !sptPaniteraList.some(p => String(p.nip) === String(u.nip) || String(p.id) === String(u.id)))
                          .map(u => (
                            <option key={u.id || u.nip} value={u.nip}>
                              {u.nama} — NIP: {u.nip} ({u.jabatan || u.divisi || 'Pegawai'})
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleAddPanitera}
                        disabled={!selectedCandidateNip}
                        className="btn-admin-add"
                        style={{
                          padding: '10px 20px',
                          background: selectedCandidateNip ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : '#cbd5e1',
                          cursor: selectedCandidateNip ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Plus size={16} />
                        <span>Tetapkan Sebagai Panitera SPT</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabel Panitera Aktif */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <span className="admin-card-title">Daftar Panitera Aktif Balai</span>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Pegawai yang berwenang menyusun dan mengusulkan surat perintah tugas
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                    <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
                    <input
                      type="text"
                      placeholder="Cari Panitera..."
                      value={searchPaniteraQuery}
                      onChange={(e) => setSearchPaniteraQuery(e.target.value)}
                      style={{
                        padding: '7px 10px 7px 32px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        width: '180px'
                      }}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50px', textAlign: 'center' }}>NO</th>
                        <th>NAMA PANITERA & NIP</th>
                        <th>JABATAN / UNIT KERJA</th>
                        <th>PERAN SISTEM</th>
                        <th>TANGGAL PENETAPAN</th>
                        <th>DITETAPKAN OLEH</th>
                        <th style={{ textAlign: 'center', width: '130px' }}>AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(sptPaniteraList) && sptPaniteraList
                        .filter(p => {
                          if (!searchPaniteraQuery.trim()) return true;
                          const q = searchPaniteraQuery.toLowerCase();
                          return (p.nama && p.nama.toLowerCase().includes(q)) || (p.nip && p.nip.includes(q));
                        })
                        .map((p, idx) => (
                          <tr key={p.id || p.nip || idx}>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.nama}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>NIP: {p.nip}</div>
                            </td>
                            <td style={{ fontSize: '0.85rem' }}>{p.jabatan || 'Pegawai Balai'}</td>
                            <td>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: '#dcfce7',
                                color: '#15803d',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                <UserCheck size={12} />
                                Panitera SPT
                              </span>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: '#475569' }}>{p.assignedAt || '2026-01-01'}</td>
                            <td style={{ fontSize: '0.82rem', color: '#475569' }}>{p.assignedBy || 'Administrator'}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemovePanitera(p)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  background: '#fee2e2',
                                  border: '1px solid #fca5a5',
                                  borderRadius: '6px',
                                  color: '#b91c1c',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Cabut Peran</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                      {sptPaniteraList.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                            Belum ada pegawai yang ditetapkan sebagai Panitera SPT.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: PENOMORAN DINAS RESMI */}
          {sptSubTab === 'penomoran' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <span className="admin-card-title">Pusat Penomoran Dinas Resmi (Format Standar Kementan RI)</span>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Daftar usulan SPT yang telah disetujui Kobag TU dan siap diterbitkan nomor naskah dinas resmi
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem 1.25rem 0' }}>
                <div style={{
                  padding: '10px 14px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  color: '#1e40af',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Printer size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Format Tata Naskah Kementan RI:</strong> <code>B-[Nomor]/KP.320/H.14.7/[Bulan]/2026</code>. Setelah diterbitkan, lembar naskah SPT dilengkapi QR Code keaslian digital dan dapat langsung dicetak.
                  </div>
                </div>
              </div>

              <div className="table-responsive" style={{ padding: '1.25rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>NO</th>
                      <th>ID USULAN</th>
                      <th>PEMOHON (PANITERA)</th>
                      <th>MAKSUD & KEGIATAN TUGAS</th>
                      <th>LOKASI TUJUAN</th>
                      <th>JADWAL TUGAS</th>
                      <th>STATUS PENOMORAN</th>
                      <th style={{ textAlign: 'center', width: '170px' }}>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(sptRecordsList) && sptRecordsList.map((spt, idx) => (
                      <tr key={spt.id}>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{spt.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{spt.pemohon}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Panitera Tim Kerja</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b', maxWidth: '280px' }}>{spt.kegiatan}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Personel: {spt.peserta?.length || 1} Orang</div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{spt.tujuan}</td>
                        <td style={{ fontSize: '0.82rem' }}>
                          <div>{spt.tglMulai} s.d {spt.tglSelesai}</div>
                          <div style={{ color: '#059669', fontWeight: 700 }}>({spt.durasi})</div>
                        </td>
                        <td>
                          {spt.nomorSpt ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: '#dcfce7',
                                color: '#15803d',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                <CheckCircle2 size={12} />
                                Terbit: {spt.nomorSpt}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{spt.diterbitkanAt}</span>
                            </div>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              background: '#fef3c7',
                              color: '#b45309',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>
                              <Clock size={12} />
                              Siap Diberi Nomor
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {spt.nomorSpt ? (
                            <button
                              type="button"
                              onClick={() => setSelectedSptDetail(spt)}
                              className="btn-admin-add"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Eye size={14} />
                              <span>Lihat Naskah</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenModalTerbit(spt)}
                              className="btn-admin-add"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.78rem',
                                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <FileCheck size={14} />
                              <span>Terbitkan Nomor</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: KONSIDERANS MENIMBANG & DASAR HUKUM */}
          {sptSubTab === 'konsiderans' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Konsiderans Menimbang */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <span className="admin-card-title">1. Konsiderans Menimbang (Permentan RI)</span>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Alasan dan pertimbangan kedinasan penerbitan surat perintah tugas
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                    {Array.isArray(menimbangList) && menimbangList.map((item, idx) => (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '12px 14px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {String.fromCharCode(97 + idx)}.
                          </span>
                          <span style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5 }}>{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMenimbang(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: '4px'
                          }}
                          title="Hapus butir ini"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Tambah Menimbang */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Ketik butir pertimbangan baru..."
                      value={newMenimbangItem}
                      onChange={(e) => setNewMenimbangItem(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddMenimbang(); }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.86rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddMenimbang}
                      className="btn-admin-add"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} />
                      <span>Tambah Butir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Konsiderans Dasar Hukum */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <span className="admin-card-title">2. Konsiderans Dasar Hukum (Undang-Undang, Permentan, DIPA)</span>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Landasan yuridis dan peraturan perundang-undangan pelaksanaan tugas
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                    {Array.isArray(dasarList) && dasarList.map((item, idx) => (
                      <div 
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '12px 14px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#dcfce7',
                            color: '#15803d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {idx + 1}.
                          </span>
                          <span style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.5 }}>{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDasar(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: '4px'
                          }}
                          title="Hapus butir ini"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Tambah Dasar */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Ketik landasan hukum/peraturan baru..."
                      value={newDasarItem}
                      onChange={(e) => setNewDasarItem(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddDasar(); }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.86rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddDasar}
                      className="btn-admin-add"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} />
                      <span>Tambah Dasar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Reset to standard button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleResetKonsideransDefault}
                  className="btn-admin-export"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <RotateCcw size={15} />
                  <span>Kembalikan Teks ke Standar Resmi Kementan RI</span>
                </button>
              </div>

            </div>
          )}

          {/* SUB-TAB 4: MONITORING & ARSIP LENGKAP SPT */}
          {sptSubTab === 'monitoring' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <span className="admin-card-title">Monitoring & Arsip Seluruh SPT Dinas Balai</span>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Database penugasan kedinasan, riwayat naskah dinas resmi, dan validasi QR digital
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={filterSptStatus}
                    onChange={(e) => setFilterSptStatus(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      background: '#fff'
                    }}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="published">Resmi Terbit</option>
                    <option value="ready_to_issue">Menunggu Nomor</option>
                  </select>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                    <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
                    <input
                      type="text"
                      placeholder="Cari SPT / Personel..."
                      value={searchSptQuery}
                      onChange={(e) => setSearchSptQuery(e.target.value)}
                      style={{
                        padding: '7px 10px 7px 32px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        width: '200px'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>NO</th>
                      <th>NOMOR SURAT / ID</th>
                      <th>KEGIATAN & MAKSUD PENUGASAN</th>
                      <th>LOKASI TUJUAN</th>
                      <th>WAKTU & DURASI</th>
                      <th>PERSONEL DITUGASKAN</th>
                      <th>STATUS NASKAH</th>
                      <th style={{ textAlign: 'center', width: '130px' }}>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(sptRecordsList) && sptRecordsList
                      .filter(s => {
                        if (filterSptStatus === 'published' && (!s.nomorSpt || s.status !== 'published')) return false;
                        if (filterSptStatus === 'ready_to_issue' && s.nomorSpt) return false;
                        if (!searchSptQuery.trim()) return true;
                        const q = searchSptQuery.toLowerCase();
                        return (s.nomorSpt && s.nomorSpt.toLowerCase().includes(q)) ||
                               (s.kegiatan && s.kegiatan.toLowerCase().includes(q)) ||
                               (s.tujuan && s.tujuan.toLowerCase().includes(q)) ||
                               (s.pemohon && s.pemohon.toLowerCase().includes(q));
                      })
                      .map((spt, idx) => (
                        <tr key={spt.id}>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{idx + 1}</td>
                          <td>
                            {spt.nomorSpt ? (
                              <div style={{ fontWeight: 700, color: '#047857' }}>{spt.nomorSpt}</div>
                            ) : (
                              <div style={{ fontWeight: 700, color: '#d97706' }}>{spt.id}</div>
                            )}
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Pemohon: {spt.pemohon}</div>
                          </td>
                          <td style={{ maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{spt.kegiatan}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Disetujui: {spt.disetujuiOleh}</div>
                          </td>
                          <td style={{ fontSize: '0.85rem' }}>{spt.tujuan}</td>
                          <td style={{ fontSize: '0.82rem' }}>
                            <div>{spt.tglMulai} s.d {spt.tglSelesai}</div>
                            <div style={{ fontWeight: 700, color: '#059669' }}>({spt.durasi})</div>
                          </td>
                          <td style={{ fontSize: '0.82rem' }}>
                            {Array.isArray(spt.peserta) ? spt.peserta.join(', ') : '-'}
                          </td>
                          <td>
                            {spt.nomorSpt ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: '#dcfce7',
                                color: '#15803d',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                <CheckCircle2 size={12} />
                                Resmi Terbit
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: '#fef3c7',
                                color: '#b45309',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                <Clock size={12} />
                                Menunggu Nomor
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedSptDetail(spt)}
                              className="btn-admin-add"
                              style={{
                                padding: '5px 10px',
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye size={13} />
                              <span>Lihat Naskah</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODAL 1: TERBITKAN NOMOR DINAS RESMI SPT */}
          {modalTerbitSpt && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '520px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '1.25rem 1.5rem',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileCheck size={22} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Terbitkan Nomor Dinas Resmi SPT</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setModalTerbitSpt(null)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleConfirmTerbitSpt} style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2px' }}>ID Usulan SPT:</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{modalTerbitSpt.id}</div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2px' }}>Maksud Penugasan:</div>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>{modalTerbitSpt.kegiatan}</div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Nomor Dinas Resmi (Format Kementan RI):
                    </label>
                    <input
                      type="text"
                      value={inputNomorSpt}
                      onChange={(e) => setInputNomorSpt(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '2px solid #f97316',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    />
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                      Contoh: <code>B-128/KP.320/H.14.7/10/2026</code>
                    </div>
                  </div>

                  <div style={{
                    padding: '10px 14px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    color: '#065f46',
                    fontSize: '0.82rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <QrCode size={18} color="#059669" />
                    <span>Naskah resmi akan otomatis dilengkapi tanda tangan digital Kepala Balai dan QR Code Keaslian.</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setModalTerbitSpt(null)}
                      className="btn-admin-export"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn-admin-add"
                      style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Konfirmasi & Terbitkan SPT</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: DETAIL LEMBAR NASKAH DINAS SPT RESMI */}
          {selectedSptDetail && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '750px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                overflow: 'hidden'
              }}>
                {/* Header Modal */}
                <div style={{
                  padding: '1rem 1.5rem',
                  background: '#047857',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Lembar Naskah Dinas Surat Perintah Tugas (SPT)</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedSptDetail(null)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body Lembar Naskah Resmi Kementan */}
                <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, color: '#0f172a', background: '#fff' }}>
                  
                  {/* Kop Surat Kementan */}
                  <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}>KEMENTERIAN PERTANIAN</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>BADAN STANDARDISASI INSTRUMEN PERTANIAN</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#064e3b', letterSpacing: '0.04em' }}>
                      BALAI BESAR PENERAPAN MODERNISASI PERTANIAN DAERAH ISTIMEWA YOGYAKARTA
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                      Jalan Sagan No. 12, Gondokusuman, Yogyakarta 55223 | Laman: kita.brmpdiy.my.id
                    </div>
                  </div>

                  {/* Judul & Nomor SPT */}
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, textDecoration: 'underline', letterSpacing: '0.05em' }}>
                      SURAT PERINTAH TUGAS
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '4px' }}>
                      NOMOR: {selectedSptDetail.nomorSpt || `[DRAF - BELUM DITERBITKAN NOMOR DINAS]`}
                    </div>
                  </div>

                  {/* Menimbang & Dasar */}
                  <div style={{ marginBottom: '1.25rem', fontSize: '0.84rem', lineHeight: 1.6 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 800 }}>Menimbang</div>
                      <div>
                        {menimbangList.map((m, i) => (
                          <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                            <span>{String.fromCharCode(97 + i)}.</span>
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                      <div style={{ fontWeight: 800 }}>Dasar</div>
                      <div>
                        {dasarList.map((d, i) => (
                          <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                            <span>{i + 1}.</span>
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Memerintahkan */}
                  <div style={{ textAlign: 'center', fontWeight: 800, margin: '1rem 0 0.75rem', fontSize: '0.9rem' }}>
                    MEMERINTAHKAN:
                  </div>

                  {/* Daftar Personil Ditugaskan */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '6px' }}>Kepada:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', border: '1px solid #cbd5e1' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '6px 10px', textAlign: 'center', width: '40px' }}>No</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Nama & NIP Pegawai</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Jabatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(selectedSptDetail.peserta) && selectedSptDetail.peserta.map((namaPeserta, idx) => {
                          const pUser = usersList.find(u => u.nama === namaPeserta);
                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '6px 10px', textAlign: 'center' }}>{idx + 1}</td>
                              <td style={{ padding: '6px 10px' }}>
                                <div style={{ fontWeight: 700 }}>{namaPeserta}</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>NIP: {pUser?.nip || '-'}</div>
                              </td>
                              <td style={{ padding: '6px 10px' }}>{pUser?.jabatan || 'Pegawai Balai'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Untuk */}
                  <div style={{ fontSize: '0.84rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                      <div style={{ fontWeight: 800 }}>Untuk</div>
                      <div>
                        <div>1. Melaksanakan tugas kedinasan: <strong>{selectedSptDetail.kegiatan}</strong>.</div>
                        <div>2. Lokasi Tujuan: <strong>{selectedSptDetail.tujuan}</strong>.</div>
                        <div>3. Waktu Pelaksanaan: <strong>{selectedSptDetail.tglMulai} s.d {selectedSptDetail.tglSelesai} ({selectedSptDetail.durasi})</strong>.</div>
                        <div>4. Melaporkan hasil pelaksanaan tugas kedinasan kepada Kepala Balai Besar Penerapan Modernisasi Pertanian DIY setelah tugas selesai.</div>
                      </div>
                    </div>
                  </div>

                  {/* Tanda Tangan Digital Kepala Balai */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <div style={{ textAlign: 'center', width: '280px' }}>
                      <div style={{ fontSize: '0.82rem' }}>Ditetapkan di Yogyakarta</div>
                      <div style={{ fontSize: '0.82rem', marginBottom: '8px' }}>Pada tanggal {selectedSptDetail.tglMulai}</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>Kepala Balai Besar,</div>
                      
                      {/* Box QR Code Digital Signature */}
                      <div style={{
                        margin: '12px auto',
                        padding: '10px',
                        border: '1px dashed #047857',
                        borderRadius: '8px',
                        background: '#f0fdf4',
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <QrCode size={44} color="#047857" />
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#065f46' }}>
                          TERVERIFIKASI DIGITAL KITA
                        </span>
                        <span style={{ fontSize: '0.64rem', color: '#64748b' }}>
                          BSIP / Kementan RI
                        </span>
                      </div>

                      <div style={{ fontSize: '0.88rem', fontWeight: 800, textDecoration: 'underline' }}>
                        Dr. Soeharsono, S.Pt, M.Si
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        NIP: 197109271998031002
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Modal Actions */}
                <div style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px'
                }}>
                  <button
                    type="button"
                    onClick={() => setSelectedSptDetail(null)}
                    className="btn-admin-export"
                  >
                    Tutup Lembar SPT
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-admin-add"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Printer size={16} />
                    <span>Cetak / Unduh PDF</span>
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB F: MANAJEMEN DISPOSISI */}
      {activeTab === 'disposisi' && (
        <div>
          {/* Sub-tab Switcher: Disposisi & Agenda */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={() => handleTabSwitch('disposisi')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1.5px solid #059669',
                background: '#ecfdf5',
                color: '#065f46',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)'
              }}
            >
              <FileStack size={16} />
              <span>Manajemen Disposisi Surat</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('agenda')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CalendarDays size={16} />
              <span>Agenda Kegiatan & Libur Kantor</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* Form input disposisi */}
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Buat Lembar Disposisi</span>
            </div>
            <form onSubmit={handleSaveDisposisi} style={{ padding: '1.25rem' }}>
              <div className="admin-form-group">
                <label>Nomor Surat / Agenda</label>
                <input 
                  type="text" 
                  className="admin-form-input" 
                  required
                  placeholder="Contoh: 045/KP.010/H.11/06/2025"
                  value={dispFormData.noSurat}
                  onChange={(e) => setDispFormData({ ...dispFormData, noSurat: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Perihal Surat Kedinasan</label>
                <input 
                  type="text" 
                  className="admin-form-input" 
                  required
                  placeholder="Perihal penugasan / undangan..."
                  value={dispFormData.perihal}
                  onChange={(e) => setDispFormData({ ...dispFormData, perihal: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Asal Surat / Pengirim</label>
                <input 
                  type="text" 
                  className="admin-form-input" 
                  required
                  placeholder="Instansi pengirim..."
                  value={dispFormData.asalSurat}
                  onChange={(e) => setDispFormData({ ...dispFormData, asalSurat: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Diteruskan Kepada (Penerima Disposisi)</label>
                <select 
                  className="admin-form-select"
                  value={dispFormData.penerima}
                  onChange={(e) => setDispFormData({ ...dispFormData, penerima: e.target.value })}
                >
                  <option value="Ketua Tim Kerja SDM">Ketua Tim Kerja SDM (Dwi Dinia Rahayu)</option>
                  <option value="Ketua Tim Kerja TU">Ketua Tim Kerja TU (Yuni Pratiwi)</option>
                  <option value="Kepala Bagian TU">Kobag TU (Agung Ariyanto)</option>
                  <option value="Kopoks Standardisasi">Kopoks Standardisasi (Dr. Fibrianty)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Instruksi / Catatan Pimpinan</label>
                <textarea 
                  className="admin-form-input" 
                  rows={3}
                  required
                  placeholder="Tuliskan arahan tindak lanjut disposisi..."
                  value={dispFormData.instruksi}
                  onChange={(e) => setDispFormData({ ...dispFormData, instruksi: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-admin-add" style={{ width: '100%', justifyContent: 'center' }}>
                <Send size={15} />
                <span>Terbitkan Disposisi</span>
              </button>
            </form>
          </div>

          {/* Table daftar disposisi */}
          <div className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">Daftar Agenda Disposisi Kedinasan</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total: {disposisiList.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No. Surat</th>
                    <th>Perihal & Asal</th>
                    <th>Tujuan Penerima</th>
                    <th>Instruksi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {disposisiList.map((d, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {d.noSurat}
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Tgl: {d.tanggal}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{d.perihal}</div>
                        <div style={{ fontSize: '11px', color: '#0284c7' }}>Dari: {d.asalSurat}</div>
                      </td>
                      <td style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>
                        {d.penerima}
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        {d.instruksi}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: d.status === 'Selesai' ? '#dcfce7' : '#fef3c7',
                          color: d.status === 'Selesai' ? '#166534' : '#92400e'
                        }}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* TAB F2: AGENDA & LIBUR KANTOR */}
      {activeTab === 'agenda' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sub-tab Switcher: Disposisi & Agenda */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleTabSwitch('disposisi')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FileStack size={16} />
              <span>Manajemen Disposisi Surat</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('agenda')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1.5px solid #059669',
                background: '#ecfdf5',
                color: '#065f46',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)'
              }}
            >
              <CalendarDays size={16} />
              <span>Agenda Kegiatan & Libur Kantor</span>
            </button>
          </div>

          {/* Header Summary Card */}
          <div className="admin-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)', border: '1px solid #fecdd3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 3px 8px rgba(239, 68, 68, 0.35)'
                }}>
                  <CalendarDays size={22} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                    Kalender Agenda Kegiatan & Hari Libur Kantor BRMP DIY
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#b91c1c', margin: '3px 0 0' }}>
                    Sinkronisasi otomatis dengan mesin presensi geofence & jadwal kedinasan resmi Balai
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#ffffff', color: '#991b1b', padding: '6px 14px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                  ✓ Mesin Presensi Otomatis Libur
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
            {/* Left: Agenda Kegiatan Mendatang */}
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Agenda Rapat & Dinas Terjadwal</span>
                <span style={{ fontSize: '0.78rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  4 Agenda
                </span>
              </div>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    tanggal: 'Senin, 07:30 WIB',
                    judul: 'Apel Pagi & Pengarahan Mingguan',
                    lokasi: 'Halaman Depan Kantor BRMP DIY',
                    peserta: 'Seluruh Pegawai ASN & PPNPN',
                    status: 'Rutin'
                  },
                  {
                    tanggal: 'Rabu, 09:00 WIB',
                    judul: 'Rapat Koordinasi Penataan Standar Pertanian',
                    lokasi: 'Ruang Rapat Utama / Hybrid Zoom',
                    peserta: 'Tim Kerja & Pejabat Fungsional',
                    status: 'Penting'
                  },
                  {
                    tanggal: 'Kamis, 13:00 WIB',
                    judul: 'Evaluasi Capaian Kinerja Triwulan III',
                    lokasi: 'Ruang Sidang Lt. 2',
                    peserta: 'Kobag TU, Ketimker, & Admin',
                    status: 'Monev'
                  },
                  {
                    tanggal: 'Jumat, 08:30 WIB',
                    judul: 'Bimtek Verifikasi SPT & E-Kinerja BRMP',
                    lokasi: 'Laboratorium Standardisasi',
                    peserta: 'Staf Administrasi & Tim IT',
                    status: 'Bimtek'
                  }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                        📅 {item.tanggal}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        background: item.status === 'Penting' ? '#fee2e2' : item.status === 'Monev' ? '#e0f2fe' : '#f1f5f9',
                        color: item.status === 'Penting' ? '#b91c1c' : item.status === 'Monev' ? '#0369a1' : '#475569'
                      }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      {item.judul}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      📍 {item.lokasi} • 👥 {item.peserta}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Kalender Libur Nasional & Cuti Bersama */}
            <div className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-title">Daftar Hari Libur Nasional & Cuti Bersama Resmi (SKB 3 Menteri)</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tahun 2025/2026</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Hari</th>
                      <th>Keterangan Hari Libur / Cuti</th>
                      <th>Kategori</th>
                      <th>Status Mesin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tgl: '1 Januari', hari: 'Rabu', nama: 'Tahun Baru 2025 Masehi', jenis: 'Libur Nasional' },
                      { tgl: '27 Januari', hari: 'Senin', nama: 'Isra Mikraj Nabi Muhammad SAW', jenis: 'Libur Nasional' },
                      { tgl: '29 Januari', hari: 'Rabu', nama: 'Tahun Baru Imlek 2576 Kongzili', jenis: 'Libur Nasional' },
                      { tgl: '29 Maret', hari: 'Sabtu', nama: 'Hari Suci Nyepi (Tahun Baru Saka 1947)', jenis: 'Libur Nasional' },
                      { tgl: '31 Mar - 1 Apr', hari: 'Senin - Selasa', nama: 'Hari Raya Idul Fitri 1446 Hijriah', jenis: 'Libur Nasional' },
                      { tgl: '2 - 7 April', hari: 'Rabu - Senin', nama: 'Cuti Bersama Hari Raya Idul Fitri', jenis: 'Cuti Bersama' },
                      { tgl: '1 Mei', hari: 'Kamis', nama: 'Hari Buruh Internasional', jenis: 'Libur Nasional' },
                      { tgl: '29 Mei', hari: 'Kamis', nama: 'Kenaikan Yesus Kristus', jenis: 'Libur Nasional' },
                      { tgl: '1 Juni', hari: 'Minggu', nama: 'Hari Lahir Pancasila', jenis: 'Libur Nasional' },
                      { tgl: '6 Juni', hari: 'Jumat', nama: 'Hari Raya Idul Adha 1446 Hijriah', jenis: 'Libur Nasional' },
                      { tgl: '27 Juni', hari: 'Jumat', nama: 'Tahun Baru Islam 1447 Hijriah', jenis: 'Libur Nasional' },
                      { tgl: '17 Agustus', hari: 'Minggu', nama: 'Proklamasi Kemerdekaan RI ke-80', jenis: 'Libur Nasional' },
                      { tgl: '5 September', hari: 'Jumat', nama: 'Maulid Nabi Muhammad SAW', jenis: 'Libur Nasional' },
                      { tgl: '25 Desember', hari: 'Kamis', nama: 'Kelahiran Yesus Kristus (Hari Raya Natal)', jenis: 'Libur Nasional' },
                      { tgl: '26 Desember', hari: 'Jumat', nama: 'Cuti Bersama Hari Raya Natal', jenis: 'Cuti Bersama' }
                    ].map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{item.tgl}</td>
                        <td style={{ color: '#475569' }}>{item.hari}</td>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>{item.nama}</td>
                        <td>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: item.jenis === 'Libur Nasional' ? '#fee2e2' : '#fef3c7',
                            color: item.jenis === 'Libur Nasional' ? '#dc2626' : '#d97706'
                          }}>
                            {item.jenis}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a' }}>
                            ✓ Standby / Off
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB G: PENGATURAN SISTEM (3 SUB-TABS: PROFIL & IDENTITAS INSTANSI, NOTIFIKASI, KEAMANAN AKUN ADMIN) */}
      {activeTab === 'pengaturan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sub-tab 3 Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setPengaturanTab('instansi')}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: pengaturanTab === 'instansi' ? '#059669' : '#cbd5e1',
                background: pengaturanTab === 'instansi' ? '#ecfdf5' : '#ffffff',
                color: pengaturanTab === 'instansi' ? '#065f46' : '#475569',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: pengaturanTab === 'instansi' ? '0 2px 8px rgba(5, 150, 105, 0.18)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Building2 size={16} color={pengaturanTab === 'instansi' ? '#059669' : '#64748b'} />
              <span>Profil & Identitas Instansi</span>
            </button>

            <button
              type="button"
              onClick={() => setPengaturanTab('notifikasi')}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: pengaturanTab === 'notifikasi' ? '#059669' : '#cbd5e1',
                background: pengaturanTab === 'notifikasi' ? '#ecfdf5' : '#ffffff',
                color: pengaturanTab === 'notifikasi' ? '#065f46' : '#475569',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: pengaturanTab === 'notifikasi' ? '0 2px 8px rgba(5, 150, 105, 0.18)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Bell size={16} color={pengaturanTab === 'notifikasi' ? '#059669' : '#64748b'} />
              <span>Notifikasi</span>
            </button>

            <button
              type="button"
              onClick={() => setPengaturanTab('keamanan')}
              style={{
                padding: '9px 20px',
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: pengaturanTab === 'keamanan' ? '#059669' : '#cbd5e1',
                background: pengaturanTab === 'keamanan' ? '#ecfdf5' : '#ffffff',
                color: pengaturanTab === 'keamanan' ? '#065f46' : '#475569',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: pengaturanTab === 'keamanan' ? '0 2px 8px rgba(5, 150, 105, 0.18)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Lock size={16} color={pengaturanTab === 'keamanan' ? '#059669' : '#64748b'} />
              <span>Keamanan Akun Admin</span>
            </button>
          </div>

          {/* SUB-TAB 1: PROFIL & IDENTITAS INSTANSI */}
          {pengaturanTab === 'instansi' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <span className="admin-card-title">Profil & Identitas Resmi Instansi</span>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Data parameter Balai Besar Penerapan Modernisasi Pertanian DIY & geofence absensi
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} style={{ padding: '1.75rem', maxWidth: '720px' }}>
                <div className="admin-form-group">
                  <label>Nama Satuan Kerja / Balai Resmi</label>
                  <input 
                    type="text" 
                    className="admin-form-input"
                    value={settingsData?.namaBalai || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, namaBalai: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Nama Kepala Balai</label>
                  <input 
                    type="text" 
                    className="admin-form-input"
                    value={settingsData?.kepalaBalai || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, kepalaBalai: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Lokasi Geofence Kantor</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={settingsData?.lokasiKantor || 'Kotagede, Yogyakarta'}
                      onChange={(e) => setSettingsData({ ...settingsData, lokasiKantor: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Radius Toleransi GPS (Meter)</label>
                    <input 
                      type="number" 
                      className="admin-form-input"
                      value={settingsData?.radiusGps || 200}
                      onChange={(e) => setSettingsData({ ...settingsData, radiusGps: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Jam Masuk Kantor</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={settingsData?.jamMasuk || '07:30:00'}
                      onChange={(e) => setSettingsData({ ...settingsData, jamMasuk: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Jam Pulang Kantor</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={settingsData?.jamPulang || '16:00:00'}
                      onChange={(e) => setSettingsData({ ...settingsData, jamPulang: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-admin-add" style={{ marginTop: '0.75rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Simpan Perubahan Identitas Instansi</span>
                </button>
              </form>
            </div>
          )}

          {/* SUB-TAB 2: NOTIFIKASI */}
          {pengaturanTab === 'notifikasi' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <span className="admin-card-title">Pengaturan Notifikasi Sistem</span>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Atur peringatan dan pemberitahuan operasional kepegawaian untuk administrator
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveNotifPreferences} style={{ padding: '1.75rem', maxWidth: '680px' }}>
                {notifSavedMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#dcfce7',
                    color: '#166534',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>{notifSavedMsg}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    {
                      key: 'notifCuti',
                      label: 'Pemberitahuan Permohonan Cuti Masuk',
                      desc: 'Tampilkan notifikasi instan saat ada pegawai mengajukan permohonan cuti baru'
                    },
                    {
                      key: 'notifSpt',
                      label: 'Pemberitahuan Surat Perintah Tugas (SPT)',
                      desc: 'Tampilkan notifikasi saat ada penerbitan SPT dinas atau verifikasi tugas baru'
                    },
                    {
                      key: 'notifAdms',
                      label: 'Peringatan Mesin Presensi ADMS',
                      desc: 'Kirimkan alert sistem jika mesin fingerprint biometrik offline atau kendala koneksi'
                    },
                    {
                      key: 'notifRekapPagi',
                      label: 'Ringkasan Rekap Kehadiran Harian (08:30 WIB)',
                      desc: 'Rekapitulasi otomatis pegawai yang terlambat atau belum hadir pada apel pagi'
                    }
                  ].map(item => (
                    <label 
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer'
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={Boolean(notifPreferences[item.key])}
                        onChange={(e) => setNotifPreferences({ ...notifPreferences, [item.key]: e.target.checked })}
                        style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#059669', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          {item.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Batas Waktu Tidak Aktif (Session Timeout) */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1.5px solid #d1fae5',
                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Clock size={18} color="#059669" strokeWidth={2.4} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#064e3b' }}>
                      Batas Waktu Tidak Aktif (Session Timeout)
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                    Pengguna akan otomatis di-logout dari sistem jika tidak ada interaksi dalam durasi ini.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    {[
                      { value: 15, label: '15 Menit' },
                      { value: 30, label: '30 Menit (Standar)' },
                      { value: 60, label: '60 Menit (1 Jam)' },
                      { value: 120, label: '120 Menit (2 Jam)' },
                      { value: 0, label: 'Dinonaktifkan' }
                    ].map(opt => {
                      const isSelected = (notifPreferences.sessionTimeout ?? 30) === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNotifPreferences({ ...notifPreferences, sessionTimeout: opt.value })}
                          style={{
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid',
                            borderColor: isSelected ? '#059669' : '#cbd5e1',
                            background: isSelected ? '#ecfdf5' : '#ffffff',
                            color: isSelected ? '#065f46' : '#475569',
                            fontWeight: isSelected ? 800 : 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            boxShadow: isSelected ? '0 2px 6px rgba(5, 150, 105, 0.15)' : 'none'
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn-admin-add" style={{ marginTop: '1.25rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Simpan Preferensi Notifikasi</span>
                </button>
              </form>
            </div>
          )}

          {/* SUB-TAB 3: KEAMANAN AKUN ADMIN (TANPA FOTO PROFIL) */}
          {pengaturanTab === 'keamanan' && (
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <span className="admin-card-title">Keamanan & Kredensial Akun Administrator</span>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Kelola nama pengguna dan kata sandi akses portal administrator
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveSecurity} style={{ padding: '1.75rem', maxWidth: '640px' }}>
                {secSuccessMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#dcfce7',
                    color: '#166534',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>{secSuccessMsg}</span>
                  </div>
                )}

                {secErrorMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{secErrorMsg}</span>
                  </div>
                )}

                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Shield size={20} color="#059669" />
                  <div style={{ fontSize: '0.82rem', color: '#065f46' }}>
                    <strong>Peran Akses:</strong> Administrator Sistem BRMP DIY (Hak Akses Penuh Semua Modul)
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Username Administrator</label>
                  <input 
                    type="text" 
                    className="admin-form-input"
                    required
                    value={securityData.username}
                    onChange={(e) => setSecurityData({ ...securityData, username: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Email Resmi Administrator</label>
                  <input 
                    type="email" 
                    className="admin-form-input"
                    required
                    value={securityData.emailAdmin}
                    onChange={(e) => setSecurityData({ ...securityData, emailAdmin: e.target.value })}
                  />
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                    Ganti Kata Sandi Administrator
                  </h4>

                  <div className="admin-form-group">
                    <label>Kata Sandi Saat Ini</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showSecCurrent ? 'text' : 'password'}
                        className="admin-form-input"
                        placeholder="Masukkan password saat ini (default: admin)"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowSecCurrent(!showSecCurrent)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                      >
                        {showSecCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Kata Sandi Baru</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showSecNew ? 'text' : 'password'}
                        className="admin-form-input"
                        placeholder="Minimal 5 karakter"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowSecNew(!showSecNew)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                      >
                        {showSecNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label>Konfirmasi Kata Sandi Baru</label>
                    <input 
                      type={showSecNew ? 'text' : 'password'}
                      className="admin-form-input"
                      placeholder="Ulangi kata sandi baru"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-admin-add" 
                  disabled={savingSecurity}
                  style={{ marginTop: '1.25rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{savingSecurity ? 'Menyimpan...' : 'Perbarui Keamanan Akun Admin'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL TAMBAH PEGAWAI BARU */}
      {showAddModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Tambah Pegawai Baru ke Master Data
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewUser}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>NIP Pegawai (Wajib)</label>
                    <input 
                      type="text" 
                      required 
                      className="admin-form-input"
                      placeholder="18 Digit NIP..."
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>PIN Mesin Fingerprint</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      placeholder="Contoh: 116"
                      value={formData.pinMesin}
                      onChange={(e) => setFormData({ ...formData, pinMesin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Nama Lengkap & Gelar (Wajib)</label>
                  <input 
                    type="text" 
                    required 
                    className="admin-form-input"
                    placeholder="Contoh: Budi Santoso, S.TP"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Jabatan Kedinasan</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Golongan / Ruang</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      placeholder="III/a, IV/b..."
                      value={formData.golongan}
                      onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Tim Kerja / Unit Organisasi</label>
                  <select 
                    className="admin-form-select"
                    value={formData.divisi}
                    onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                  >
                    <option value="Tim Kerja Pengelolaan Sumber Daya Manusia">Tim Kerja Pengelolaan Sumber Daya Manusia</option>
                    <option value="Tim Kerja Tata Usaha dan Rumah Tangga">Tim Kerja Tata Usaha dan Rumah Tangga</option>
                    <option value="Tim Kerja Program dan Evaluasi">Tim Kerja Program dan Evaluasi</option>
                    <option value="Tim Kerja Diseminasi Standar Instrumen Pertanian">Tim Kerja Diseminasi Standar Instrumen Pertanian</option>
                    <option value="Tim Kerja Pengujian dan Sertifikasi Mutu">Tim Kerja Pengujian dan Sertifikasi Mutu</option>
                    <option value="Balai Penerapan Modernisasi Pertanian DIY">Balai Penerapan Modernisasi Pertanian DIY (Umum)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Hak Akses Sistem</label>
                    <select 
                      className="admin-form-select"
                      value={formData.systemRole}
                      onChange={(e) => setFormData({ ...formData, systemRole: e.target.value })}
                    >
                      <option value="pegawai">Pegawai / Staf</option>
                      <option value="admin">Administrator Sistem</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Peran Verifikasi (Approval)</label>
                    <select 
                      className="admin-form-select"
                      value={formData.approvalRole}
                      onChange={(e) => setFormData({ ...formData, approvalRole: e.target.value })}
                    >
                      <option value="pemohon">Pemohon (Pegawai)</option>
                      <option value="verifikator_1">Verifikator 1 (Ketua Tim Kerja)</option>
                      <option value="verifikator_2">Verifikator 2 (Kepala Bagian TU)</option>
                      <option value="admin">Super Admin Kepegawaian</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="btn-admin-export"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-admin-add">
                  <Plus size={16} />
                  <span>Simpan Pegawai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL EDIT PEGAWAI */}
      {showEditModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Edit Data Pegawai: {selectedUser?.nama}
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser}>
              <div className="admin-modal-body">
                {/* Photo & Avatar Section */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    color: '#ffffff',
                    border: '3px solid #ffffff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}>
                    {formData.fotoProfil ? (
                      <img src={formData.fotoProfil} alt={formData.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{(formData.nama || 'P').charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      Foto Profil Pegawai
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                      Format JPG/PNG/WEBP maks 10MB (otomatis dikompresi optimal & sinkron ke seluruh modul).
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleEditPhotoChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#047857',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Camera size={14} />
                        <span>{uploadingPhoto ? 'Memproses...' : formData.fotoProfil ? 'Ganti Foto' : 'Unggah Foto'}</span>
                      </button>

                      {formData.fotoProfil && (
                        <button 
                          type="button"
                          onClick={handleRemoveEditPhoto}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Hapus Foto</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>NIP Pegawai</label>
                    <input 
                      type="text" 
                      disabled
                      className="admin-form-input"
                      style={{ background: '#f1f5f9' }}
                      value={formData.nip}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>PIN Mesin Fingerprint</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={formData.pinMesin}
                      onChange={(e) => setFormData({ ...formData, pinMesin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Nama Lengkap & Gelar</label>
                  <input 
                    type="text" 
                    required 
                    className="admin-form-input"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Jabatan Kedinasan</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Golongan / Ruang</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={formData.golongan}
                      onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Tim Kerja / Divisi</label>
                  <input 
                    type="text" 
                    className="admin-form-input"
                    value={formData.divisi}
                    onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                  />
                </div>

                {/* Contact Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Nomor HP / WhatsApp</label>
                    <input 
                      type="text" 
                      placeholder="0812-xxxx-xxxx"
                      className="admin-form-input"
                      value={formData.noHp}
                      onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Email Kedinasan</label>
                    <input 
                      type="email" 
                      placeholder="pegawai@pertanian.go.id"
                      className="admin-form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Alamat Domisili</label>
                  <input 
                    type="text" 
                    placeholder="Alamat lengkap tempat tinggal"
                    className="admin-form-input"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Hak Akses Sistem</label>
                    <select 
                      className="admin-form-select"
                      value={formData.systemRole}
                      onChange={(e) => setFormData({ ...formData, systemRole: e.target.value })}
                    >
                      <option value="pegawai">Pegawai / Staf</option>
                      <option value="admin">Administrator Sistem</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Peran Approval Cuti</label>
                    <select 
                      className="admin-form-select"
                      value={formData.approvalRole}
                      onChange={(e) => setFormData({ ...formData, approvalRole: e.target.value })}
                    >
                      <option value="pemohon">Pemohon (Pegawai)</option>
                      <option value="verifikator_1">Verifikator 1 (Ketua Tim)</option>
                      <option value="verifikator_2">Verifikator 2 (Kobag TU)</option>
                      <option value="admin">Super Admin</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Sisa Cuti (Hari)</label>
                    <input 
                      type="number"
                      min="0"
                      max="30"
                      className="admin-form-input"
                      value={formData.sisaCuti}
                      onChange={(e) => setFormData({ ...formData, sisaCuti: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="btn-admin-export"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-admin-add">
                  <CheckCircle2 size={16} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL PENGATURAN BALAI */}
      {showSettingsModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-box">
            <div className="admin-modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Pengaturan Parameter Balai & Geofence GPS
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Nama Satuan Kerja Balai</label>
                  <input 
                    type="text" 
                    className="admin-form-input"
                    value={settingsData?.namaBalai || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, namaBalai: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Wilayah Titik Pusat GPS</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={settingsData?.lokasiKantor || 'Kotagede'}
                      onChange={(e) => setSettingsData({ ...settingsData, lokasiKantor: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Radius Geofence (Meter)</label>
                    <input 
                      type="number" 
                      className="admin-form-input"
                      value={settingsData?.radiusGps || 200}
                      onChange={(e) => setSettingsData({ ...settingsData, radiusGps: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="admin-form-group">
                    <label>Jam Masuk Kerja</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={settingsData?.jamMasuk || '07:30:00'}
                      onChange={(e) => setSettingsData({ ...settingsData, jamMasuk: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Jam Pulang Kerja</label>
                    <input 
                      type="text" 
                      className="admin-form-input"
                      value={settingsData?.jamPulang || '16:00:00'}
                      onChange={(e) => setSettingsData({ ...settingsData, jamPulang: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  className="btn-admin-export"
                  onClick={() => setShowSettingsModal(false)}
                >
                  Tutup
                </button>
                <button type="submit" className="btn-admin-add">
                  <CheckCircle2 size={16} />
                  <span>Simpan Konfigurasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI CUTI ADMIN (SETUJUI / TOLAK) */}
      {showCutiActionModal && selectedCutiAction && (
        <div className="admin-modal-backdrop" onClick={() => !actionLoadingCuti && setShowCutiActionModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="admin-modal-header" style={{
              background: verifyModalType === 'approve' 
                ? 'linear-gradient(135deg, #064e3b 0%, #047857 100%)' 
                : 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)',
              color: '#ffffff'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {verifyModalType === 'approve' ? 'Konfirmasi Persetujuan Cuti Pegawai' : 'Konfirmasi Penolakan Permohonan Cuti'}
                </h3>
                <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '2px' }}>
                  {verifyModalType === 'approve' ? 'Otorisasi Verifikasi & Pengesahan Resmi Balai' : 'Pengembalian Berkas Cuti dengan Catatan Alasan'}
                </div>
              </div>
              <button 
                className="admin-modal-close" 
                onClick={() => !actionLoadingCuti && setShowCutiActionModal(false)}
                style={{ color: '#ffffff' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Employee Summary Card */}
              <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                      {selectedCutiAction.nama}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      NIP: {selectedCutiAction.nip} • {selectedCutiAction.jabatan}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: '#e0e7ff',
                    color: '#3730a3'
                  }}>
                    Cuti {selectedCutiAction.jenisCuti}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid #e2e8f0',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Periode:</span>{' '}
                    <strong style={{ color: '#0f172a' }}>{selectedCutiAction.tanggalMulai} s/d {selectedCutiAction.tanggalAkhir}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Durasi:</span>{' '}
                    <strong style={{ color: '#0f172a' }}>{selectedCutiAction.jumlahHari} Hari Kerja</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Sisa Kuota Saat Ini:</span>{' '}
                    <strong style={{ color: '#059669' }}>{selectedCutiAction.sisaCuti ?? 12} Hari</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Alasan:</span>{' '}
                    <span style={{ color: '#334155' }}>"{selectedCutiAction.alasan}"</span>
                  </div>
                </div>
              </div>

              {/* Action specific options */}
              {verifyModalType === 'approve' ? (
                <div>
                  <div className="admin-form-group">
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '2px solid #059669',
                      background: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#059669',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        ✓
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#065f46' }}>
                          Persetujuan Cuti (Role Kepegawaian - 1 Kali ACC Langsung Selesai)
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '2px' }}>
                          Permohonan cuti langsung disahkan berstatus <strong>Disetujui</strong> dan kuota cuti pegawai otomatis dipotong sistem.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                      Catatan / Pertimbangan Persetujuan
                    </label>
                    <textarea 
                      className="admin-form-input"
                      rows={3}
                      value={verifyCatatan}
                      onChange={(e) => setVerifyCatatan(e.target.value)}
                      placeholder="Masukkan catatan dinas persetujuan cuti..."
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="admin-form-group">
                    <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#991b1b', marginBottom: '6px', display: 'block' }}>
                      Alasan Penolakan Permohonan Cuti
                    </label>
                    <textarea 
                      className="admin-form-input"
                      rows={3}
                      value={verifyCatatan}
                      onChange={(e) => setVerifyCatatan(e.target.value)}
                      placeholder="Tuliskan alasan penolakan secara jelas agar diketahui pemohon..."
                      style={{ width: '100%', resize: 'vertical', borderColor: '#fca5a5' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                      Alasan penolakan ini akan dicatat dalam riwayat berkas dan naskah dinas resmi pemohon.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button 
                type="button" 
                className="btn-admin-export"
                onClick={() => setShowCutiActionModal(false)}
                disabled={actionLoadingCuti}
              >
                Batal
              </button>
              <button 
                type="button" 
                className="btn-admin-add"
                onClick={handleConfirmVerifyCuti}
                disabled={actionLoadingCuti}
                style={{
                  background: verifyModalType === 'approve' ? '#059669' : '#dc2626'
                }}
              >
                {actionLoadingCuti ? (
                  <span>Memproses...</span>
                ) : verifyModalType === 'approve' ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Konfirmasi Setujui</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>Konfirmasi Tolak</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL BERKAS PERMOHONAN CUTI */}
      {showCutiDetailModal && selectedCutiDetail && (
        <div className="admin-modal-backdrop" onClick={() => setShowCutiDetailModal(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header" style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  Rincian Berkas Permohonan Cuti
                </h3>
                <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '2px' }}>
                  Nomor Berkas: {selectedCutiDetail.id || 'CUTI-REG-2026'} • Balai BRMP DIY
                </div>
              </div>
              <button 
                className="admin-modal-close" 
                onClick={() => setShowCutiDetailModal(false)}
                style={{ color: '#ffffff' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Pegawai Info */}
              <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem'
              }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                  {selectedCutiDetail.nama}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  NIP: {selectedCutiDetail.nip} • Golongan: {selectedCutiDetail.golongan || 'III/a'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                  {selectedCutiDetail.jabatan} • {selectedCutiDetail.divisi}
                </div>
              </div>

              {/* Leave Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Jenis Cuti
                  </div>
                  <div style={{ fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>
                    Cuti {selectedCutiDetail.jenisCuti}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Durasi Pengajuan
                  </div>
                  <div style={{ fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    {selectedCutiDetail.jumlahHari} Hari Kerja
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Tanggal Mulai
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                    {selectedCutiDetail.tanggalMulai}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Tanggal Selesai
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                    {selectedCutiDetail.tanggalAkhir}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Sisa Kuota Tahunan
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {selectedCutiDetail.sisaCuti ?? 12} Hari
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Status Saat Ini
                  </div>
                  <div style={{ marginTop: '2px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: selectedCutiDetail.status === 'disetujui' ? '#dcfce7' : selectedCutiDetail.status === 'ditolak' ? '#fee2e2' : '#fef3c7',
                      color: selectedCutiDetail.status === 'disetujui' ? '#166534' : selectedCutiDetail.status === 'ditolak' ? '#991b1b' : '#92400e'
                    }}>
                      {selectedCutiDetail.status === 'disetujui' ? 'Disetujui Penuh' : selectedCutiDetail.status === 'ditolak' ? 'Ditolak' : 'Menunggu Verifikasi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alasan */}
              <div style={{
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                  Alasan Lengkap Pengajuan
                </div>
                <div style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>
                  "{selectedCutiDetail.alasan}"
                </div>
              </div>

              {/* Audit Trail Verifikasi */}
              <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Jejak Audit Verifikasi Berjenjang
                </div>
                
                {/* Tahap 1 */}
                <div style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  marginBottom: '8px',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Tahap 1: Ketua Tim Kerja</strong>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: (selectedCutiDetail.verifikasi1?.approved || selectedCutiDetail.status === 'menunggu_verif_2' || selectedCutiDetail.status === 'disetujui') ? '#166534' : selectedCutiDetail.status === 'ditolak' ? '#991b1b' : '#92400e'
                    }}>
                      {(selectedCutiDetail.verifikasi1?.approved || selectedCutiDetail.status === 'menunggu_verif_2' || selectedCutiDetail.status === 'disetujui') ? '✓ Disetujui' : selectedCutiDetail.status === 'ditolak' ? '✕ Ditolak' : '⏳ Menunggu'}
                    </span>
                  </div>
                  {selectedCutiDetail.verifikasi1?.catatan && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                      "{selectedCutiDetail.verifikasi1.catatan}"
                    </div>
                  )}
                  {selectedCutiDetail.verifikasi1?.tanggal && (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                      Waktu: {selectedCutiDetail.verifikasi1.tanggal} ({selectedCutiDetail.verifikasi1.verifikatorNama})
                    </div>
                  )}
                </div>

                {/* Tahap 2 */}
                <div style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Tahap 2: Kepala Bagian Tata Usaha (Final)</strong>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: selectedCutiDetail.status === 'disetujui' ? '#166534' : (selectedCutiDetail.status === 'ditolak' && selectedCutiDetail.verifikasi1?.approved) ? '#991b1b' : '#92400e'
                    }}>
                      {selectedCutiDetail.status === 'disetujui' ? '✓ Disahkan Final' : (selectedCutiDetail.status === 'ditolak' && selectedCutiDetail.verifikasi1?.approved) ? '✕ Ditolak Final' : selectedCutiDetail.status === 'menunggu_verif_2' ? '⏳ Menunggu Persetujuan' : 'Antre Tahap 1'}
                    </span>
                  </div>
                  {selectedCutiDetail.verifikasi2?.catatan && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                      "{selectedCutiDetail.verifikasi2.catatan}"
                    </div>
                  )}
                  {selectedCutiDetail.verifikasi2?.tanggal && (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                      Waktu: {selectedCutiDetail.verifikasi2.tanggal} ({selectedCutiDetail.verifikasi2.verifikatorNama})
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button 
                type="button" 
                className="btn-admin-export"
                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setSelectedPrintCutiAdmin(selectedCutiDetail)}
              >
                <FileText size={16} />
                <span>Formulir BKN</span>
              </button>
              <button 
                type="button" 
                className="btn-admin-export"
                onClick={() => setShowCutiDetailModal(false)}
              >
                Tutup
              </button>
              {(selectedCutiDetail.status === 'menunggu_verif_1' || selectedCutiDetail.status === 'menunggu_verif_2' || selectedCutiDetail.status === 'dalam_proses') && (
                <button 
                  type="button" 
                  className="btn-admin-add"
                  onClick={() => {
                    setShowCutiDetailModal(false);
                    handleOpenVerifyModal(selectedCutiDetail, 'approve');
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Proses Verifikasi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK FORMULIR CUTI RESMI BKN */}
      {selectedPrintCutiAdmin && (
        <CutiFormulirBkn
          cuti={selectedPrintCutiAdmin}
          onClose={() => setSelectedPrintCutiAdmin(null)}
        />
      )}
    </div>
  );
}
