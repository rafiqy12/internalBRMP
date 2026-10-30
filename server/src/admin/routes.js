import { Router } from 'express';
import { 
  instansiSettings, 
  updateInstansiSettings, 
  disposisiList,
  agendaList,
  adminPaniteraList,
  adminSptList,
  adminMenimbangList,
  adminDasarList
} from './adminStore.js';
import { users, cutiHistory } from '../data/store.js';
import { admsLogs, admsMachines } from '../routes/adms.js';

const router = Router();

// GET /api/admin/summary
// Summary metrik kartu eksekutif dan status sistem
router.get('/summary', (req, res) => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

  const pendingCuti = cutiHistory.filter(c => c.status && c.status.startsWith('menunggu'));

  const totalMaster = Math.max(117, users.length);
  const hadirCount = admsLogs && admsLogs.length > 0 
    ? new Set(admsLogs.map(l => l.pin)).size 
    : Math.max(105, Math.floor(totalMaster * 0.9));
  const izinCutiCount = Math.max(1, totalMaster - hadirCount);

  res.json({
    success: true,
    data: {
      serverStatus: 'Online',
      serverVersion: 'VERSI KITA 2.5 BRMP DIY',
      waktuServer: timeStr,
      gpsRadius: `Kotagede (${instansiSettings.radiusGps}m)`,
      hakAkses: 'Super Administrator',
      instansi: instansiSettings,
      metrics: {
        totalMasterPegawai: {
          value: totalMaster,
          displayNumber: totalMaster,
          label: 'TOTAL MASTER PEGAWAI',
          subLeft: '✓ Terdaftar Lengkap',
          subRight: 'ASN & PPPK Balai'
        },
        presensiHariIni: {
          value: hadirCount,
          displayNumber: hadirCount,
          label: 'PRESENSI HARI INI',
          subLeft: `✓ ${Math.round((hadirCount / (totalMaster || 1)) * 100)}% Hadir`,
          subRight: `${izinCutiCount} Izin / Cuti`
        },
        permohonanCuti: {
          value: cutiHistory.length,
          displayNumber: cutiHistory.length,
          label: 'PERMOHONAN CUTI',
          subLeft: `⚡ ${pendingCuti.length || 0} Menunggu Approval`,
          subRight: 'Tahun 2026'
        },
        suratPerintahTugas: {
          value: adminSptList.length,
          displayNumber: adminSptList.length,
          label: 'SURAT PERINTAH TUGAS',
          subLeft: '📍 Sleman & Kulon Progo',
          subRight: 'Dinas Lapangan'
        }
      }
    }
  });
});

// GET /api/admin/presensi-all
router.get('/presensi-all', (req, res) => {
  const todayIso = new Date().toISOString().split('T')[0];

  // 1. Jika ada log real-time dari Mesin Fisik ADMS (Solution / ZKTeco)
  if (admsLogs && admsLogs.length > 0) {
    const formattedAdms = admsLogs.map((l, i) => {
      const isCheckIn = String(l.statusAbsen || '').toLowerCase() === 'masuk';
      const isCheckOut = String(l.statusAbsen || '').toLowerCase() === 'pulang';
      return {
        id: l.id || `PRS-ADMS-${String(i + 1).padStart(4, '0')}`,
        sn: l.sn || 'UCR6235200084',
        nip: l.pin,
        nama: l.nama,
        jabatan: l.jabatan || 'Pegawai BRMP DIY',
        divisi: l.divisi || 'Balai Besar Penerapan Modernisasi Pertanian DIY',
        status: l.statusAbsen || 'Hadir',
        jamMasuk: isCheckIn ? l.jam : (l.jamMasuk || '-'),
        jamPulang: isCheckOut ? l.jam : (l.jamPulang || '-'),
        tanggal: todayIso, // Sinkronisasi otomatis ke kalender hari ini
        tanggalHariIni: todayIso,
        tanggalAsli: l.tanggal || '2026-10-28',
        jam: l.jam,
        datetime: l.datetime,
        jarakMeter: 0,
        lokasi: 'Lobi Kantor BRMP DIY (Mesin ADMS)',
        metode: `Mesin Fingerprint (${l.sn || 'UCR6235200084'})`,
        keterangan: l.keterangan || (isCheckIn ? (l.jam > '07:30:00' ? `Terlambat (${l.jam})` : `Tepat Waktu (${l.jam})`) : `Presensi Pulang (${l.jam})`)
      };
    });

    return res.json({
      success: true,
      total: formattedAdms.length,
      source: 'ADMS_MACHINE',
      data: formattedAdms
    });
  }

  // 2. Fallback: Seluruh data master pegawai BRMP DIY
  const records = users.map((u, i) => {
    const isLate = i % 11 === 2;
    const isCuti = i % 13 === 7;
    const isLuarRadius = i % 17 === 5;

    let status = 'Hadir';
    let jamMasuk = '07:15:20';
    let jamPulang = '16:02:10';
    let distance = Math.floor(25 + (i * 12) % 150);

    if (isCuti) {
      status = 'Cuti / Izin';
      jamMasuk = '-';
      jamPulang = '-';
      distance = 0;
    } else if (isLate) {
      status = 'Terlambat';
      jamMasuk = '07:48:15';
      distance = 85;
    } else if (isLuarRadius) {
      status = 'Di Luar Radius';
      jamMasuk = '07:22:10';
      distance = 450;
    }

    return {
      id: `PRS-${String(i + 1).padStart(4, '0')}`,
      pegawaiId: u.id,
      nip: u.nip,
      nama: u.nama,
      jabatan: u.jabatan,
      divisi: u.divisi,
      status,
      jamMasuk,
      jamPulang,
      tanggal: todayIso,
      tanggalHariIni: todayIso,
      tanggalAsli: '2026-10-28',
      jarakMeter: distance,
      lokasi: distance <= instansiSettings.radiusGps ? 'Dalam Radius (Kotagede)' : 'Luar Radius GPS',
      metode: i % 2 === 0 ? 'ADMS Fingerprint (Mesin Lobi)' : 'Mobile Geofence GPS'
    };
  });

  res.json({
    success: true,
    total: records.length,
    source: 'MASTER_PEGAWAI',
    data: records
  });
});

// GET /api/admin/disposisi
router.get('/disposisi', (req, res) => {
  res.json({
    success: true,
    total: disposisiList.length,
    data: disposisiList
  });
});

// POST /api/admin/disposisi
router.post('/disposisi', (req, res) => {
  const { noSurat, perihal, asalSurat, instruksi, penerima, sifat } = req.body;
  const newDisp = {
    id: `DSP-${String(disposisiList.length + 1).padStart(3, '0')}`,
    noSurat: noSurat || `0${disposisiList.length + 50}/BRMP/DISP/2025`,
    perihal: perihal || 'Disposisi Kedinasan',
    asalSurat: asalSurat || 'Balai DIY',
    tanggal: new Date().toISOString().split('T')[0],
    sifat: sifat || 'Penting',
    instruksi: instruksi || 'Segera ditindaklanjuti',
    status: 'Menunggu',
    penerima: penerima || 'Kepala Tim Kerja'
  };

  disposisiList.unshift(newDisp);
  res.status(201).json({
    success: true,
    message: 'Disposisi baru berhasil disimpan',
    data: newDisp
  });
});

// GET /api/admin/settings
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    data: instansiSettings
  });
});

// PUT /api/admin/settings
router.put('/settings', (req, res) => {
  const updated = updateInstansiSettings(req.body);
  res.json({
    success: true,
    message: 'Pengaturan instansi berhasil disimpan',
    data: updated
  });
});

// ==========================================
// ADMIN SPT & PANITERA ENDPOINTS
// ==========================================

// GET /api/admin/spt
router.get('/spt', (req, res) => {
  res.json({
    success: true,
    data: {
      sptList: adminSptList,
      paniteraList: adminPaniteraList,
      menimbang: adminMenimbangList,
      dasar: adminDasarList
    }
  });
});

// POST /api/admin/spt/panitera
router.post('/spt/panitera', (req, res) => {
  const { nip, nama, jabatan } = req.body;
  if (!nip || !nama) {
    return res.status(400).json({ success: false, message: 'NIP dan Nama wajib disertakan' });
  }

  const existing = adminPaniteraList.find(p => p.nip === nip);
  if (existing) {
    return res.json({ success: true, message: 'Pegawai sudah terdaftar sebagai Panitera', data: existing });
  }

  const newPan = {
    id: `PEG-${nip.slice(-3)}`,
    nip,
    nama,
    jabatan: jabatan || 'Pegawai Balai',
    role: 'Panitera SPT',
    assignedBy: req.body.assignedBy || 'Administrator Sistem',
    assignedAt: new Date().toISOString().split('T')[0]
  };

  adminPaniteraList.unshift(newPan);
  res.status(201).json({
    success: true,
    message: `Pegawai ${nama} berhasil ditetapkan sebagai Panitera SPT`,
    data: newPan
  });
});

// DELETE /api/admin/spt/panitera/:id
router.delete('/spt/panitera/:id', (req, res) => {
  const { id } = req.params;
  const idx = adminPaniteraList.findIndex(p => p.id === id || p.nip === id);
  if (idx !== -1) {
    const removed = adminPaniteraList.splice(idx, 1)[0];
    return res.json({ success: true, message: `Peran Panitera dari ${removed.nama} berhasil dicabut` });
  }
  res.status(404).json({ success: false, message: 'Panitera tidak ditemukan' });
});

// POST /api/admin/spt/terbitkan
router.post('/spt/terbitkan', (req, res) => {
  const { id, nomorSpt } = req.body;
  const spt = adminSptList.find(s => s.id === id);
  if (!spt) {
    return res.status(404).json({ success: false, message: 'SPT tidak ditemukan' });
  }

  spt.nomorSpt = nomorSpt;
  spt.status = 'published';
  spt.diterbitkanAt = new Date().toLocaleString('id-ID');
  spt.hasQr = true;

  res.json({
    success: true,
    message: `Nomor dinas ${nomorSpt} berhasil diterbitkan`,
    data: spt
  });
});

export default router;
