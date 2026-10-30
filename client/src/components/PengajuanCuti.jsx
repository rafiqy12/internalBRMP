import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { 
  CalendarOff, 
  Save, 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  ShieldCheck,
  UserCheck,
  Check,
  X,
  User,
  Users,
  Search,
  ArrowRight,
  Filter,
  Printer,
  ChevronRight,
  FileCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import CutiFormulirBkn from './CutiFormulirBkn';

export default function PengajuanCuti({ user: initialUser, onSwitchUser }) {
  // Active Tab: 'form' | 'my-history' | 'verification' | 'user-roles'
  const [activeTab, setActiveTab] = useState('form');

  const [currentUser, setCurrentUser] = useState(initialUser);
  const [cutiSummary, setCutiSummary] = useState({
    totalPengajuan: 0,
    menungguVerif1: 0,
    menungguVerif2: 0,
    disetujui: 0,
    ditolak: 0
  });

  // Form states
  const [jenisCuti, setJenisCuti] = useState('Tahunan');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [alasan, setAlasan] = useState('');
  const [jumlahHari, setJumlahHari] = useState(0);
  const [alamatCuti, setAlamatCuti] = useState('');
  const [noTelpCuti, setNoTelpCuti] = useState('');

  // Printable and workflow modal states
  const [selectedPrintCuti, setSelectedPrintCuti] = useState(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [lastSubmittedCuti, setLastSubmittedCuti] = useState(null);

  // Data states
  const [myHistory, setMyHistory] = useState([]);
  const [allHistory, setAllHistory] = useState([]);
  const [pendingVerif1, setPendingVerif1] = useState([]);
  const [pendingVerif2, setPendingVerif2] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Loading & Alert states
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal Verification Action (Approve / Reject)
  const [selectedCuti, setSelectedCuti] = useState(null);
  const [verifyStage, setVerifyStage] = useState(1);
  const [verifyAction, setVerifyAction] = useState('approve'); // 'approve' | 'reject'
  const [verifyNote, setVerifyNote] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Sync prop changes & default contact values
  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
      if (initialUser.alamat && !alamatCuti) setAlamatCuti(initialUser.alamat);
      if (initialUser.noHp && !noTelpCuti) setNoTelpCuti(initialUser.noHp);
    }
  }, [initialUser]);

  // Compute number of days automatically
  useEffect(() => {
    if (tanggalMulai && tanggalAkhir) {
      const start = new Date(tanggalMulai);
      const end = new Date(tanggalAkhir);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setJumlahHari(days);
      } else {
        setJumlahHari(0);
      }
    } else {
      setJumlahHari(0);
    }
  }, [tanggalMulai, tanggalAkhir]);

  // Fetch initial cuti data
  const loadCutiData = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCuti(currentUser?.nip, currentUser?.approvalRole);
      if (res) {
        if (res.user) {
          setCurrentUser(prev => ({ ...prev, ...res.user }));
        }
        if (res.summary) setCutiSummary(res.summary);
        if (res.myHistory) setMyHistory(res.myHistory);
        if (res.history) setAllHistory(res.history);
        if (res.pendingVerif1) setPendingVerif1(res.pendingVerif1);
        if (res.pendingVerif2) setPendingVerif2(res.pendingVerif2);
      }

      // Also fetch user list for admin/role switcher
      const usersRes = await apiService.getUsers();
      if (usersRes) setAllUsers(usersRes);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memuat data cuti.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCutiData();
  }, [currentUser?.nip, currentUser?.approvalRole]);

  // Submit pengajuan cuti baru
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!jenisCuti || !tanggalMulai || !tanggalAkhir || !alasan.trim()) {
      setErrorMsg('Semua kolom form wajib diisi');
      return;
    }

    if (new Date(tanggalAkhir) < new Date(tanggalMulai)) {
      setErrorMsg('Tanggal akhir tidak boleh lebih awal dari tanggal mulai');
      return;
    }

    const totalSisa = (Number(currentUser?.sisaCutiN) || 0) + (Number(currentUser?.sisaCutiN1) || 0) || currentUser?.sisaCuti || 12;

    if (jenisCuti === 'Tahunan' && totalSisa < jumlahHari) {
      setErrorMsg(`Total sisa cuti Anda (${totalSisa} hari) tidak mencukupi untuk ${jumlahHari} hari pengajuan.`);
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        pegawaiId: currentUser?.id,
        nip: currentUser?.nip,
        nama: currentUser?.nama,
        jabatan: currentUser?.jabatan,
        divisi: currentUser?.divisi,
        masaKerja: currentUser?.masaKerja || "01 Tahun 03 Bulan",
        jenisCuti,
        tanggalMulai,
        tanggalAkhir,
        alasan,
        alamatCuti: alamatCuti || currentUser?.alamat || "Yogyakarta",
        noTelpCuti: noTelpCuti || currentUser?.noHp || "085268238966"
      };

      const res = await apiService.submitCuti(payload);
      if (res.success) {
        setSuccessMsg('Pengajuan cuti berhasil dibuat dan berstatus DALAM PROSES!');
        setLastSubmittedCuti(res.data);
        setShowWorkflowModal(true);
        // Reset form
        setAlasan('');
        setTanggalMulai('');
        setTanggalAkhir('');
        setJumlahHari(0);
        await loadCutiData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyimpan pengajuan cuti.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Verify Modal
  const openVerificationModal = (cutiItem, stage, action) => {
    setSelectedCuti(cutiItem);
    setVerifyStage(stage);
    setVerifyAction(action);
    setVerifyNote(action === 'approve' ? 'Disetujui. Tugas dinas selama cuti telah dikoordinasikan.' : 'Mohon maaf, permohonan cuti belum dapat disetujui karena beban agenda dinas padat.');
    setShowVerifyModal(true);
  };

  // Submit Verification (Approve / Reject) - 1 Kali ACC Langsung Selesai & Potong Kuota
  const handleConfirmVerification = async () => {
    if (!selectedCuti) return;
    setActionLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let res;
      if (verifyAction === 'approve') {
        res = await apiService.selesaikanCuti(
          selectedCuti.id,
          currentUser,
          verifyNote || 'Disetujui oleh Petugas Kepegawaian. Kuota resmi terpotong sistem.'
        );
      } else {
        res = await apiService.verifyCuti(
          selectedCuti.id,
          2,
          'reject',
          currentUser,
          verifyNote || 'Permohonan cuti belum dapat disetujui.'
        );
      }

      if (res.success) {
        setSuccessMsg(res.message || (verifyAction === 'approve' ? 'Permohonan cuti berhasil di-ACC dan kuota dipotong!' : 'Permohonan cuti ditolak.'));
        setShowVerifyModal(false);
        setSelectedCuti(null);
        await loadCutiData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses persetujuan cuti.');
    } finally {
      setActionLoading(false);
    }
  };

  // Selesaikan alur & ACC langsung oleh Petugas Kepegawaian (Memotong kuota FIFO)
  const handleSelesaikanAlur = async (cutiItem) => {
    const isTahunan = cutiItem.jenisCuti === 'Tahunan';
    const confirmText = isTahunan
      ? `Selesaikan alur & ACC Cuti Tahunan (${cutiItem.jumlahHari} hari) atas nama ${cutiItem.nama}?\n\nSistem akan otomatis memotong kuota cuti pegawai secara berjenjang (menghabiskan sisa tahun lalu N-1 terlebih dahulu, lalu jatah tahun berjalan N).`
      : `Selesaikan alur & ACC ${cutiItem.jenisCuti} (${cutiItem.jumlahHari} hari) atas nama ${cutiItem.nama}?`;

    if (!window.confirm(confirmText)) return;

    try {
      setActionLoading(true);
      setSuccessMsg('');
      setErrorMsg('');
      const res = await apiService.selesaikanCuti(
        cutiItem.id,
        currentUser,
        'Alur cuti selesai dan disahkan oleh Petugas Kepegawaian. Kuota resmi terpotong sistem.'
      );

      if (res.success) {
        setSuccessMsg(res.message || 'Alur pengajuan cuti berhasil diselesaikan dan di-ACC!');
        await loadCutiData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menyelesaikan alur cuti.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Cuti (Pemohon)
  const handleCancelCuti = async (cutiId) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pengajuan cuti ini?')) return;
    try {
      setActionLoading(true);
      const res = await apiService.cancelCuti(cutiId);
      if (res.success) {
        setSuccessMsg('Pengajuan cuti berhasil dibatalkan.');
        await loadCutiData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membatalkan cuti.');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Change Employee Role
  const handleChangeRole = async (targetUserId, newRole) => {
    try {
      setActionLoading(true);
      const res = await apiService.updateUserRole(targetUserId, {
        approvalRole: newRole,
        systemRole: newRole === 'admin' ? 'admin' : 'pegawai'
      });

      if (res.success) {
        setSuccessMsg(`Role berhasil diubah menjadi: ${res.data.roleLabel}`);
        await loadCutiData();
        // If updating the active user itself, update state
        if (currentUser?.id === targetUserId || currentUser?.nip === targetUserId) {
          const updatedSelf = {
            ...currentUser,
            approvalRole: newRole,
            roleLabel: res.data.roleLabel,
            systemRole: newRole === 'admin' ? 'admin' : 'pegawai'
          };
          setCurrentUser(updatedSelf);
          if (onSwitchUser) onSwitchUser(updatedSelf);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memperbarui role pegawai.');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Change Fingerprint Machine PIN
  const handleChangePin = async (targetUserId, currentPin) => {
    const newPin = window.prompt(`Masukkan Nomor PIN Mesin Absensi Baru (saat ini: ${currentPin || '-'}):`, currentPin || '');
    if (newPin === null) return;
    const clean = newPin.trim();
    if (!clean) {
      alert('PIN tidak boleh kosong');
      return;
    }
    try {
      setActionLoading(true);
      const res = await apiService.updateUserRole(targetUserId, { pinMesin: clean });
      if (res.success) {
        setSuccessMsg(`PIN Mesin untuk ${res.data.nama} berhasil diubah ke: ${clean}`);
        await loadCutiData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengubah PIN Mesin.');
    } finally {
      setActionLoading(false);
    }
  };

  const jenisCutiList = [
    "Tahunan",
    "Sakit",
    "Alasan Penting",
    "Melahirkan",
    "Karena Istri Melahirkan",
    "Cuti Besar",
    "Cuti di Luar Tanggungan Negara"
  ];

  // Helper render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'dalam_proses':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} />
            <span>Dalam Proses (Ikuti Alur)</span>
          </span>
        );
      case 'menunggu_verif_1':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} />
            <span>Dalam Proses (Verifikasi 1)</span>
          </span>
        );
      case 'menunggu_verif_2':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <Clock size={13} />
            <span>Dalam Proses (Verifikasi 2)</span>
          </span>
        );
      case 'disetujui':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <CheckCircle2 size={13} />
            <span>Disetujui / Di-ACC Petugas</span>
          </span>
        );
      case 'ditolak':
      case 'ditolak_verif_1':
      case 'ditolak_verif_2':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
            <X size={13} />
            <span>Ditolak</span>
          </span>
        );
      default:
        return <span className="status-badge pending">{status}</span>;
    }
  };

  // Helper render Persetujuan Kepegawaian (1 Kali ACC Langsung Selesai & Potong Kuota)
  const renderVerificationStepper = (item) => {
    const isApproved = item.status === 'disetujui';
    const isRejected = item.status === 'ditolak' || item.status?.startsWith('ditolak');
    const verif = item.verifikasi?.tahap2?.status === 'disetujui' ? item.verifikasi.tahap2 : (item.verifikasi?.tahap1?.status === 'disetujui' ? item.verifikasi.tahap1 : null);

    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: '200px' }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: isApproved ? '#10b981' : isRejected ? '#ef4444' : '#f59e0b',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 800,
          flexShrink: 0,
          marginTop: '2px'
        }}>
          {isApproved ? '✓' : isRejected ? '✕' : '⏳'}
        </div>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isApproved ? '#166534' : isRejected ? '#b91c1c' : '#1e293b' }}>
            {isApproved ? 'Disetujui Kepegawaian (ACC)' : isRejected ? 'Ditolak Kepegawaian' : 'Menunggu ACC Kepegawaian'}
          </div>
          <div style={{ fontSize: '0.7rem', color: isApproved ? '#15803d' : isRejected ? '#b91c1c' : '#64748b' }}>
            {isApproved ? (verif?.verifikatorNama ? `Oleh: ${verif.verifikatorNama}` : 'Alur Selesai & Kuota Terpotong') : isRejected ? 'Permohonan ditolak petugas' : '1 Kali ACC langsung selesai'}
          </div>
          {(verif?.catatan || item.catatan) && (
            <div style={{ fontSize: '0.68rem', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
              "{verif?.catatan || item.catatan}"
            </div>
          )}
        </div>
      </div>
    );
  };

  // Determine permissions - Role Kepegawaian berwenang melakukan ACC Cuti 1 kali langsung
  const isKepegawaian = 
    currentUser?.approvalRole === 'kepegawaian' ||
    currentUser?.approvalRole === 'admin' ||
    currentUser?.systemRole === 'admin' ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'kepegawaian' ||
    currentUser?.nip === '198001012005011001' ||
    currentUser?.nip === '199005022025051006' ||
    String(currentUser?.nama || '').toLowerCase().includes('romy') ||
    String(currentUser?.divisi || '').toLowerCase().includes('kepegawaian') ||
    String(currentUser?.divisi || '').toLowerCase().includes('sumber daya manusia') ||
    String(currentUser?.jabatan || '').toLowerCase().includes('kepegawaian') ||
    String(currentUser?.jabatan || '').toLowerCase().includes('sumber daya manusia');

  const isAdmin = 
    currentUser?.systemRole === 'admin' || 
    currentUser?.approvalRole === 'admin' ||
    currentUser?.nip === '198001012005011001' ||
    currentUser?.nip === '199005022025051006' ||
    String(currentUser?.nama || '').toLowerCase().includes('romy');
  const isVerifikator1 = isKepegawaian;
  const isVerifikator2 = isKepegawaian;

  // Filtered pending cuti
  const pendingCutiCount = allHistory.filter(c => c.status === 'dalam_proses' || c.status?.startsWith('menunggu')).length;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Breadcrumb Header */}
      <div className="breadcrumb-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="breadcrumb-title">
              <CalendarOff size={24} style={{ color: 'var(--primary-600)' }} />
              <span>Sistem Cuti Internal Pegawai BRMP DIY</span>
            </h1>
            <div className="breadcrumb-path">
              <span>KITA BRMP DIY</span>
              <span>/</span>
              <span>Cuti Pegawai</span>
              <span>/</span>
              <span style={{ color: 'var(--primary-700)', fontWeight: 700 }}>Persetujuan Kepegawaian (1 Kali ACC)</span>
            </div>
          </div>

          {/* Current Active Role Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#ffffff',
            padding: '8px 14px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: isAdmin ? '#fee2e2' : isKepegawaian ? '#ecfdf5' : 'var(--primary-50)',
              color: isAdmin ? '#dc2626' : isKepegawaian ? '#059669' : 'var(--primary-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: !isAdmin && !isKepegawaian ? '1px solid var(--primary-200)' : 'none'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Peran Pengguna Saat Ini
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                {currentUser?.roleLabel || (isAdmin ? 'Administrator Kepegawaian' : isKepegawaian ? 'Petugas Kepegawaian (ACC Cuti)' : 'Pegawai (Pemohon Cuti)')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="brmp-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary-600)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Sisa Cuti Tahunan</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: '4px 0 0 0' }}>
                {(Number(currentUser?.sisaCutiN) || 0) + (Number(currentUser?.sisaCutiN1) || 0) || currentUser?.sisaCuti || 12} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Hari</span>
              </h3>
            </div>
            <div style={{ padding: '10px', background: 'var(--primary-50)', borderRadius: '10px', color: 'var(--primary-600)', border: '1px solid var(--primary-200)' }}>
              <Calendar size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '8px', lineHeight: 1.4 }}>
            <div>• Sisa Thn Lalu (<strong>N-1</strong>): <strong style={{ color: '#d97706' }}>{currentUser?.sisaCutiN1 || 0} hari</strong> <em>(prioritas 1)</em></div>
            <div>• Jatah Thn Ini (<strong>N</strong>): <strong>{currentUser?.sisaCutiN !== undefined ? currentUser.sisaCutiN : (currentUser?.sisaCuti || 12)} hari</strong></div>
            <div style={{ color: '#64748b' }}>• Cuti Terpakai: {currentUser?.cutiTerpakai || 0} hari</div>
          </div>
        </div>

        <div 
          className="brmp-card" 
          onClick={() => { if (isKepegawaian) setActiveTab('verification'); }}
          style={{ 
            padding: '1.25rem', 
            borderLeft: '4px solid #f59e0b',
            cursor: isKepegawaian ? 'pointer' : 'default',
            transition: 'all 0.15s ease'
          }}
          title={isKepegawaian ? "Klik untuk buka halaman Persetujuan / ACC Cuti" : undefined}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Permohonan Dalam Proses {isKepegawaian && <strong style={{ color: '#d97706', fontSize: '0.7rem' }}>(Klik untuk ACC)</strong>}
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', margin: '4px 0 0 0' }}>
                {allHistory.filter(c => c.status === 'dalam_proses' || c.status?.startsWith('menunggu')).length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Berkas</span>
              </h3>
            </div>
            <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '10px', color: '#d97706' }}>
              <Clock size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
            Menunggu penyelesaian alur berkas fisik / ACC
          </div>
        </div>

        <div className="brmp-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Disetujui / Selesai (ACC)</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', margin: '4px 0 0 0' }}>
                {allHistory.filter(c => c.status === 'disetujui').length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>Berkas</span>
              </h3>
            </div>
            <div style={{ padding: '10px', background: '#dcfce7', borderRadius: '10px', color: '#15803d' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
            Alur disahkan & kuota terpotong sistem
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #86efac',
          color: '#166534',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: 500 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#166534' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {errorMsg && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: 500 }}>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#b91c1c' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Modern Main Tab Navigation */}
      <div className="cuti-tabs-nav" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '2px',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button
          onClick={() => setActiveTab('form')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'form' ? '3px solid var(--primary-600)' : '3px solid transparent',
            color: activeTab === 'form' ? 'var(--primary-700)' : '#64748b',
            fontWeight: activeTab === 'form' ? 700 : 500,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <CalendarOff size={17} />
          <span>Form Pengajuan Cuti</span>
        </button>

        <button
          onClick={() => setActiveTab('my-history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'my-history' ? '3px solid var(--primary-600)' : '3px solid transparent',
            color: activeTab === 'my-history' ? 'var(--primary-700)' : '#64748b',
            fontWeight: activeTab === 'my-history' ? 700 : 500,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <Clock size={17} />
          <span>Riwayat Cuti Saya</span>
          <span style={{ background: activeTab === 'my-history' ? 'var(--primary-50)' : '#f1f5f9', color: activeTab === 'my-history' ? 'var(--primary-700)' : '#64748b', border: activeTab === 'my-history' ? '1px solid var(--primary-200)' : 'none', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
            {myHistory.length}
          </span>
        </button>

        {/* Tab Persetujuan Cuti (Khusus Petugas Kepegawaian & Admin) */}
        {isKepegawaian && (
          <button
            onClick={() => setActiveTab('verification')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'verification' ? '3px solid var(--primary-600)' : '3px solid transparent',
              color: activeTab === 'verification' ? 'var(--primary-700)' : '#64748b',
              fontWeight: activeTab === 'verification' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={17} />
            <span>Persetujuan Cuti (Role Kepegawaian)</span>
            {pendingCutiCount > 0 && (
              <span style={{ background: '#f59e0b', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                {pendingCutiCount}
              </span>
            )}
          </button>
        )}

        {/* Tab Manajemen Role Pegawai (Khusus Admin / Pengaturan Role) */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('user-roles')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'user-roles' ? '3px solid var(--primary-600)' : '3px solid transparent',
              color: activeTab === 'user-roles' ? 'var(--primary-700)' : '#64748b',
              fontWeight: activeTab === 'user-roles' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <Users size={17} />
            <span>Kelola Role Pegawai (Admin)</span>
          </button>
        )}
      </div>

      {/* TAB 1: FORMULIR PENGAJUAN CUTI */}
      {activeTab === 'form' && (
        <div className="cuti-form-grid">
          {/* Left: Input Form */}
          <div className="brmp-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ padding: '8px', background: 'var(--primary-50)', borderRadius: '8px', color: 'var(--primary-600)', border: '1px solid var(--primary-200)' }}>
                <CalendarOff size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                  Form Pengajuan Cuti
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Persetujuan Cuti oleh Petugas Kepegawaian (1 Kali ACC Langsung Selesai)
                </span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Pegawai Info */}
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Pemohon:</span>
                  <strong style={{ color: '#1e293b' }}>{currentUser?.nama}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>NIP / Jabatan:</span>
                  <span style={{ color: '#475569' }}>{currentUser?.nip} ({currentUser?.jabatan})</span>
                </div>
              </div>

              {/* Jenis Cuti */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Jenis Cuti</label>
                <select
                  className="form-input"
                  value={jenisCuti}
                  onChange={(e) => setJenisCuti(e.target.value)}
                  style={{ height: '42px' }}
                >
                  {jenisCutiList.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal Mulai & Akhir */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Tanggal Mulai</label>
                  <input
                    type="date"
                    className="form-input"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Tanggal Akhir</label>
                  <input
                    type="date"
                    className="form-input"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Total Hari Kalkulasi */}
              {jumlahHari > 0 && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Calendar size={16} />
                    <span>Total Durasi Cuti:</span>
                  </div>
                  <span style={{ background: '#16a34a', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem' }}>
                    {jumlahHari} Hari Kerja
                  </span>
                </div>
              )}

              {/* Alasan Cuti */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>Alasan Cuti</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Tuliskan alasan lengkap pengajuan cuti Anda..."
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Alamat & Nomor Telepon Selama Cuti (Sesuai Format Formulir BKN) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Alamat Selama Cuti
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Jakarta / Yogyakarta"
                    value={alamatCuti}
                    onChange={(e) => setAlamatCuti(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    No. Telp / HP Selama Cuti
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Contoh: 085268238966"
                    value={noTelpCuti}
                    onChange={(e) => setNoTelpCuti(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Tombol Simpan & Kirim */}
              <button
                type="submit"
                className="btn-primary"
                disabled={actionLoading}
                style={{
                  background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                  padding: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '8px',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(22,163,74,0.3)'
                }}
              >
                <Save size={18} />
                <span>{actionLoading ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Cuti'}</span>
              </button>
            </form>
          </div>

          {/* Right: Alur Verifikasi & Ketentuan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="brmp-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary-600)' }} />
                <span>Alur Persetujuan Cuti (Role Kepegawaian)</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Step 1 Box - ACC Kepegawaian */}
                <div style={{ display: 'flex', gap: '12px', background: '#ecfdf5', padding: '14px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '14px' }}>
                    ✓
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#065f46' }}>
                      Persetujuan Tunggal (1 Kali ACC Langsung Selesai)
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#047857', lineHeight: 1.45 }}>
                      Pengajuan cuti ditelaah dan disetujui dalam <strong>1 kali ACC</strong> oleh <strong>Petugas Kepegawaian</strong>. Tidak ada alur ganda atau bertingkat.
                    </p>
                  </div>
                </div>

                {/* Step 2 Box - Potong Kuota FIFO */}
                <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0, fontSize: '12px' }}>
                    ⚡
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#0369a1' }}>
                      Kuota Cuti Otomatis Terpotong (FIFO)
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      Setelah di-ACC oleh Kepegawaian, sistem otomatis memotong kuota cuti tahun lalu (N-1) terlebih dahulu, lalu jatah tahun berjalan (N). Lembar BKN resmi langsung siap dicetak.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Sisa Cuti Info */}
            <div className="brmp-card" style={{ padding: '1.25rem', background: '#faf5ff', border: '1px solid #e9d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7e22ce', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                <Sparkles size={16} />
                <span>Ketentuan Sisa Cuti & Kuota Tahunan</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b21a8', lineHeight: 1.5 }}>
                Berdasarkan regulasi BKN & Kementan RI, kuota cuti tahunan pegawai adalah 12 hari kerja per tahun kalender. Hak cuti yang tidak digunakan dapat hangus sesuai batas waktu kadaluarsa kedinasan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT CUTI SAYA */}
      {activeTab === 'my-history' && (
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Riwayat Pengajuan Cuti Saya
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Pantau riwayat dan status persetujuan cuti Anda secara transparan
              </span>
            </div>

            <button
              onClick={() => setActiveTab('form')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
              }}
            >
              <CalendarOff size={15} />
              <span>Ajukan Cuti Baru</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="brmp-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>NO</th>
                  <th>TGL PENGAJUAN</th>
                  <th>RENTANG TANGGAL</th>
                  <th>DURASI</th>
                  <th>JENIS CUTI</th>
                  <th>ALASAN</th>
                  <th style={{ minWidth: '240px' }}>PROGRES 2 VERIFIKASI</th>
                  <th>STATUS AKHIR</th>
                  <th style={{ textAlign: 'center' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {myHistory.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      <CalendarOff size={36} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                      <div>Belum ada pengajuan cuti yang tercatat.</div>
                    </td>
                  </tr>
                ) : (
                  myHistory.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                      <td>{item.tanggalPengajuan}</td>
                      <td>
                        <strong>{item.tanggalMulai}</strong> <br />
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>s/d {item.tanggalAkhir}</span>
                      </td>
                      <td>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                          {item.jumlahHari} hari
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.jenisCuti}</span>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.8rem', color: '#475569' }}>
                        {item.alasan}
                      </td>
                      <td>
                        {renderVerificationStepper(item)}
                      </td>
                      <td>
                        {renderStatusBadge(item.status)}
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => setSelectedPrintCuti(item)}
                          style={{
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            color: '#15803d',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginRight: '6px'
                          }}
                          title="Cetak Formulir Permintaan dan Pemberian Cuti (Format Resmi BKN)"
                        >
                          <Printer size={13} />
                          <span>Formulir BKN</span>
                        </button>

                        {(item.status === 'dalam_proses' || item.status === 'menunggu_verif_1') && (
                          <button
                            onClick={() => handleCancelCuti(item.id)}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fca5a5',
                              color: '#dc2626',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            title="Batalkan permohonan cuti"
                          >
                            Batalkan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INBOX VERIFIKASI CUTI (APPROVAL BERJENJANG) */}
      {activeTab === 'verification' && (
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary-600)' }} />
                <span>Inbox Persetujuan Cuti Pegawai (Role Kepegawaian)</span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Wewenang: <strong>Petugas Kepegawaian</strong> • 1 Kali ACC Langsung Selesai & Potong Kuota Cuti
              </span>
            </div>

            {/* Status filter pills */}
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === 'all' ? '#fff' : 'transparent',
                  color: statusFilter === 'all' ? 'var(--primary-700)' : '#64748b',
                  boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Semua ({allHistory.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === 'pending' ? '#fff' : 'transparent',
                  color: statusFilter === 'pending' ? '#d97706' : '#64748b',
                  boxShadow: statusFilter === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Menunggu ACC ({pendingCutiCount})
              </button>
              <button
                onClick={() => setStatusFilter('disetujui')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === 'disetujui' ? '#fff' : 'transparent',
                  color: statusFilter === 'disetujui' ? '#15803d' : '#64748b',
                  boxShadow: statusFilter === 'disetujui' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Disetujui ({allHistory.filter(c => c.status === 'disetujui').length})
              </button>
              <button
                onClick={() => setStatusFilter('ditolak')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === 'ditolak' ? '#fff' : 'transparent',
                  color: statusFilter === 'ditolak' ? '#dc2626' : '#64748b',
                  boxShadow: statusFilter === 'ditolak' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Ditolak ({allHistory.filter(c => c.status?.startsWith('ditolak')).length})
              </button>
            </div>
          </div>

          {/* Table Inbox */}
          <div style={{ overflowX: 'auto' }}>
            <table className="brmp-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>DATA PEGAWAI</th>
                  <th>TGL CUTI</th>
                  <th>DURASI</th>
                  <th>JENIS & ALASAN</th>
                  <th>STATUS SAAT INI</th>
                  <th style={{ minWidth: '180px' }}>AKSI PERSETUJUAN</th>
                </tr>
              </thead>
              <tbody>
                {allHistory
                  .filter(item => {
                    if (statusFilter === 'pending') return item.status === 'dalam_proses' || item.status?.startsWith('menunggu');
                    if (statusFilter === 'tahap1' || statusFilter === 'tahap2') return item.status === 'dalam_proses' || item.status?.startsWith('menunggu');
                    if (statusFilter === 'disetujui') return item.status === 'disetujui';
                    if (statusFilter === 'ditolak') return item.status?.startsWith('ditolak');
                    return true;
                  })
                  .map((item, idx) => {
                    const canVerifyTahap1 = (isVerifikator1 || isAdmin) && item.status === 'menunggu_verif_1';
                    const canVerifyTahap2 = (isVerifikator2 || isAdmin) && item.status === 'menunggu_verif_2';

                    return (
                      <tr key={item.id || idx}>
                        <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                        <td>
                          <strong style={{ display: 'block', color: '#1e293b' }}>{item.nama}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>NIP: {item.nip}</span> <br />
                          <span style={{ fontSize: '0.7rem', color: 'var(--primary-700)', fontWeight: 600 }}>{item.divisi}</span>
                        </td>
                        <td>
                          <strong>{item.tanggalMulai}</strong> <br />
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>s/d {item.tanggalAkhir}</span>
                        </td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                            {item.jumlahHari} hari
                          </span>
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{item.jenisCuti}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px', maxWidth: '180px' }}>
                            "{item.alasan}"
                          </div>
                        </td>
                        <td>
                          {renderStatusBadge(item.status)}
                        </td>
                        <td style={{ minWidth: '180px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {/* Tombol Cetak Formulir Resmi BKN */}
                            <button
                              onClick={() => setSelectedPrintCuti(item)}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#1e293b',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                              title="Lihat & Cetak Formulir Permintaan dan Pemberian Cuti Format BKN"
                            >
                              <Printer size={13} style={{ color: '#16a34a' }} />
                              <span>Formulir BKN</span>
                            </button>

                            {/* Aksi Petugas jika belum disetujui */}
                            {item.status !== 'disetujui' && !item.status.startsWith('ditolak') && (
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => handleSelesaikanAlur(item)}
                                  disabled={actionLoading}
                                  style={{
                                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    boxShadow: '0 2px 6px rgba(22,163,74,0.3)'
                                  }}
                                  title="Selesaikan Alur dan Potong Kuota Cuti secara Otomatis (FIFO N-1 lalu N)"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>ACC & Selesaikan</span>
                                </button>
                                <button
                                  onClick={() => openVerificationModal(item, 2, 'reject')}
                                  disabled={actionLoading}
                                  style={{
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #fca5a5',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                  title="Tolak Pengajuan Cuti"
                                >
                                  <X size={13} />
                                  <span>Tolak</span>
                                </button>
                              </div>
                            )}

                            {/* Info jika sudah disetujui / ditolak */}
                            {item.status === 'disetujui' && (
                              <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>
                                ✓ Alur telah selesai di-ACC. Kuota pegawai resmi terpotong.
                                {item.pemotongan && (
                                  <div style={{ fontSize: '0.68rem', color: '#475569', fontStyle: 'italic', marginTop: '2px' }}>
                                    {item.pemotongan.keterangan}
                                  </div>
                                )}
                              </div>
                            )}

                            {item.status.startsWith('ditolak') && (
                              <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontStyle: 'italic' }}>
                                Pengajuan ditolak oleh petugas.
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KELOLA ROLE PEGAWAI (KHUSUS ADMIN) */}
      {activeTab === 'user-roles' && isAdmin && (
        <div className="brmp-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} style={{ color: 'var(--primary-600)' }} />
                <span>Manajemen Hak Akses & Role Pegawai</span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Kelola 115 pegawai BRMP DIY: ganti peran cuti (Pemohon, Verifikator 1, Verifikator 2, Admin) dan mapping PIN Mesin Absensi Fingerprint.
              </span>
            </div>

            <span style={{ background: 'var(--primary-50)', color: 'var(--primary-800)', border: '1px solid var(--primary-200)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
              {allUsers.length} Pegawai Terdaftar
            </span>
          </div>

          {/* Search Box */}
          <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Cari nama, NIP, tim kerja, atau PIN mesin..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none',
                background: '#ffffff'
              }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="brmp-table">
              <thead>
                <tr>
                  <th>NO</th>
                  <th>NIP & NAMA PEGAWAI</th>
                  <th>JABATAN / DIVISI</th>
                  <th style={{ textAlign: 'center' }}>PIN MESIN</th>
                  <th>SISA CUTI</th>
                  <th>PERAN AKTIF (ROLE)</th>
                  <th style={{ minWidth: '220px' }}>GANTI ROLE PEGAWAI</th>
                </tr>
              </thead>
              <tbody>
                {allUsers
                  .filter(peg => 
                    (peg.nama || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    (peg.nip || '').includes(userSearchTerm) ||
                    (peg.jabatan || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    (peg.divisi || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                    (peg.pinMesin || '').includes(userSearchTerm)
                  )
                  .map((peg, idx) => (
                  <tr key={peg.id || idx}>
                    <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{peg.nama}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        NIP: {peg.nip} {peg.golongan ? `• Gol: ${peg.golongan}` : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{peg.jabatan}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{peg.divisi}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleChangePin(peg.id || peg.nip, peg.pinMesin)}
                        title="Klik untuk mengubah PIN Mesin Fingerprint"
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          color: '#1e293b',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>PIN: {peg.pinMesin || '-'}</span>
                        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>✏️</span>
                      </button>
                    </td>
                    <td>
                      <span style={{ background: '#f0fdf4', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
                        {peg.sisaCuti} Hari
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: peg.approvalRole === 'admin' ? '#fee2e2' : peg.approvalRole === 'verifikator_2' ? '#fef3c7' : peg.approvalRole === 'verifikator_1' ? '#e0e7ff' : '#f1f5f9',
                        color: peg.approvalRole === 'admin' ? '#dc2626' : peg.approvalRole === 'verifikator_2' ? '#d97706' : peg.approvalRole === 'verifikator_1' ? '#4338ca' : '#475569'
                      }}>
                        {peg.roleLabel || peg.approvalRole}
                      </span>
                    </td>
                    <td>
                      <select
                        value={peg.approvalRole}
                        onChange={(e) => handleChangeRole(peg.id || peg.nip, e.target.value)}
                        disabled={actionLoading}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        <option value="pemohon">Pegawai Biasa (Pemohon Cuti)</option>
                        <option value="kepegawaian">Petugas Kepegawaian (Wewenang ACC Cuti)</option>
                        <option value="admin">Administrator Kepegawaian (Akses Penuh)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI (SETUJUI / TOLAK) */}
      {showVerifyModal && selectedCuti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {verifyAction === 'approve' ? (
                  <CheckCircle2 size={22} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={22} className="text-red-600" />
                )}
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {verifyAction === 'approve' ? 'ACC & Setujui Cuti (Kepegawaian)' : 'Tolak Permohonan Cuti'}
                </h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Pemohon Cuti:</span>
                <strong style={{ color: '#1e293b' }}>{selectedCuti.nama}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>Jenis & Durasi:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{selectedCuti.jenisCuti} ({selectedCuti.jumlahHari} hari)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Alasan:</span>
                <span style={{ color: '#475569', fontStyle: 'italic' }}>"{selectedCuti.alasan}"</span>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                Catatan Persetujuan Kepegawaian {verifyAction === 'reject' ? '(Wajib - Alasan Penolakan)' : '(Opsional)'}
              </label>
              <textarea
                className="form-input"
                rows="3"
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                placeholder="Tuliskan catatan disposisi / verifikasi..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowVerifyModal(false)}
                disabled={actionLoading}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleConfirmVerification}
                disabled={actionLoading}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: verifyAction === 'approve' ? '#16a34a' : '#dc2626',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {verifyAction === 'approve' ? <Check size={16} /> : <X size={16} />}
                <span>{actionLoading ? 'Memproses...' : verifyAction === 'approve' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PETUNJUK ALUR SETELAH SUBMIT CUTI */}
      {showWorkflowModal && lastSubmittedCuti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0' }}>
                Formulir Cuti Berhasil Dibuat!
              </h3>
              <div style={{
                display: 'inline-block',
                background: '#fef3c7',
                color: '#b45309',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 800
              }}>
                STATUS: DALAM PROSES
              </div>
            </div>

            {/* Kotak Instruksi Alur */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '1.2rem',
              marginBottom: '1.5rem',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              color: '#334155'
            }}>
              <strong style={{ display: 'block', color: '#0f172a', marginBottom: '8px', fontSize: '0.92rem' }}>
                Silahkan Ikuti Alur Pengajuan Cuti:
              </strong>
              <ol style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>
                  <strong>Cetak Formulir Permintaan dan Pemberian Cuti</strong> resmi (format BKN) melalui tombol di bawah.
                </li>
                <li>
                  Mintakan <strong>paraf/pertimbangan Atasan Langsung</strong> pada formulir cetak fisik tersebut.
                </li>
                <li>
                  Serahkan berkas fisik ke <strong>Petugas Kepegawaian</strong> untuk penyelesaian alur/ACC.
                </li>
              </ol>
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#065f46',
                fontWeight: 600
              }}>
                ℹ️ Catatan: Sisa kuota cuti Anda saat ini <strong>belum dipotong</strong>. Kuota akan otomatis dipotong oleh sistem setelah berkas disahkan dan di-ACC oleh Petugas Kepegawaian.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setShowWorkflowModal(false);
                  setActiveTab('my-history');
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Tutup & Lihat Riwayat
              </button>
              <button
                onClick={() => {
                  setSelectedPrintCuti(lastSubmittedCuti);
                  setShowWorkflowModal(false);
                  setActiveTab('my-history');
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
                }}
              >
                <Printer size={16} />
                <span>Cetak Formulir Cuti Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK FORMULIR RESMI BKN */}
      {selectedPrintCuti && (
        <CutiFormulirBkn
          cuti={selectedPrintCuti}
          onClose={() => setSelectedPrintCuti(null)}
        />
      )}
    </div>
  );
}
