import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Fingerprint, 
  CalendarCheck2, 
  FileBadge2, 
  FolderKanban, 
  Sliders, 
  LogOut, 
  Bell, 
  ArrowUpRight, 
  X 
} from 'lucide-react';
import './AdminDashboard.css';

/**
 * AdminSidebar Component
 * Dedicated Administrator Navigation Sidebar for BRMP DIY
 * Isolated inside client/src/admin/ for clean modularity.
 */
export default function AdminSidebar({ 
  currentView, 
  setCurrentView, 
  user, 
  isOpen, 
  onClose, 
  onLogout 
}) {
  // Live Indonesian dynamic date
  const [currentDateString, setCurrentDateString] = useState(() => {
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  });

  useEffect(() => {
    const updateDate = () => {
      const today = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      setCurrentDateString(`${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`);
    };
    const timer = setInterval(updateDate, 60000);
    return () => clearInterval(timer);
  }, []);

  // Local tracking of active admin tab for instant visual feedback and preventing route collision
  const [activeAdminTab, setActiveAdminTab] = useState(() => {
    return sessionStorage.getItem('brmp_admin_tab') || 'dashboard';
  });

  useEffect(() => {
    const handleTabChange = (e) => {
      if (e?.detail) {
        setActiveAdminTab(e.detail);
      }
    };
    window.addEventListener('brmp-admin-tab-change', handleTabChange);
    return () => window.removeEventListener('brmp-admin-tab-change', handleTabChange);
  }, []);

  useEffect(() => {
    if (currentView === 'admin-pegawai') {
      setActiveAdminTab('pegawai');
      sessionStorage.removeItem('brmp_admin_tab');
    } else if (currentView === 'admin-presensi') {
      setActiveAdminTab('presensi');
      sessionStorage.removeItem('brmp_admin_tab');
    } else if (currentView === 'admin-cuti') {
      setActiveAdminTab('cuti');
      sessionStorage.removeItem('brmp_admin_tab');
    } else if (currentView === 'admin-disposisi' || currentView === 'admin-agenda') {
      setActiveAdminTab('disposisi');
      sessionStorage.removeItem('brmp_admin_tab');
    } else if (currentView === 'admin-pengaturan' || currentView === 'pengaturan-akun') {
      setActiveAdminTab('pengaturan');
      sessionStorage.removeItem('brmp_admin_tab');
    } else if (currentView === 'dashboard' || currentView === 'admin-dashboard') {
      const saved = sessionStorage.getItem('brmp_admin_tab');
      if (saved === 'spt') {
        setActiveAdminTab('spt');
      } else {
        setActiveAdminTab('dashboard');
      }
    }
  }, [currentView]);

  const navigateTo = (view) => {
    if (setCurrentView) {
      setCurrentView(view);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleNavTab = (tabKey, viewName) => {
    setActiveAdminTab(tabKey);
    if (tabKey === 'spt') {
      sessionStorage.setItem('brmp_admin_tab', 'spt');
      window.dispatchEvent(new CustomEvent('brmp-admin-tab-change', { detail: 'spt' }));
      navigateTo('admin-dashboard');
    } else {
      sessionStorage.removeItem('brmp_admin_tab');
      window.dispatchEvent(new CustomEvent('brmp-admin-tab-change', { detail: tabKey }));
      navigateTo(viewName);
    }
  };

  const isTabActive = (tabKey) => {
    if (activeAdminTab === 'spt') {
      return tabKey === 'spt';
    }
    if (tabKey === 'spt') {
      return activeAdminTab === 'spt' || currentView === 'admin-spt';
    }
    if (tabKey === 'dashboard') {
      return (currentView === 'dashboard' || currentView === 'admin-dashboard') && activeAdminTab !== 'spt';
    }
    if (tabKey === 'pegawai') {
      return currentView === 'admin-pegawai' || activeAdminTab === 'pegawai';
    }
    if (tabKey === 'presensi') {
      return currentView === 'admin-presensi' || activeAdminTab === 'presensi';
    }
    if (tabKey === 'cuti') {
      return currentView === 'admin-cuti' || activeAdminTab === 'cuti';
    }
    if (tabKey === 'disposisi') {
      return currentView === 'admin-disposisi' || currentView === 'admin-agenda' || activeAdminTab === 'disposisi';
    }
    if (tabKey === 'pengaturan') {
      return currentView === 'admin-pengaturan' || currentView === 'pengaturan-akun' || activeAdminTab === 'pengaturan';
    }
    return false;
  };

  return (
    <aside 
      className={`app-sidebar admin-sidebar-green no-print ${isOpen ? 'sidebar-open' : ''}`}
      style={{ 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        height: 'calc(100vh - 64px)',
        maxHeight: 'calc(100vh - 64px)',
        position: 'sticky',
        top: '64px',
        overflowY: 'auto',
        overflowX: 'hidden',
        borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '4px 0 16px rgba(6, 78, 59, 0.25)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.25) transparent'
      }}
    >
      {/* Mobile Drawer Close Header */}
      <div 
        className="sidebar-mobile-header" 
        style={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)', 
          background: 'rgba(0, 0, 0, 0.2)' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>BRMP DIY ADMIN</span>
        </div>
        <button 
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Tutup navigasi"
          title="Tutup navigasi"
          style={{ color: '#ffffff' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Institutional Branding Header */}
      <div style={{
        padding: '1.25rem 1.15rem 0.95rem',
        background: 'rgba(0, 0, 0, 0.16)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        textAlign: 'center'
      }}>
        <div style={{ 
          marginBottom: '10px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '1.18rem',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            margin: 0,
            letterSpacing: '0.01em',
            textAlign: 'center'
          }}>
            BRMP DIY
          </h2>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#a7f3d0',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            textAlign: 'center',
            marginTop: '4px'
          }}>
            ADMINISTRATOR
          </span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '7px 10px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
          fontSize: '0.74rem',
          fontWeight: 700,
          color: '#d1fae5',
          textAlign: 'center'
        }}>
          {currentDateString}
        </div>
      </div>

      {/* Navigation Menus with 4 Categories */}
      <nav className="sidebar-nav" style={{ padding: '0.75rem 0' }}>
        
        {/* KATEGORI 1: DASHBOARD */}
        <div style={{ padding: '8px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          DASHBOARD
        </div>

        <button 
          className={`nav-item-btn ${isTabActive('dashboard') ? 'active-green' : ''}`}
          onClick={() => handleNavTab('dashboard', 'admin-dashboard')}
          style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
        >
          <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
              flexShrink: 0
            }}>
              <LayoutDashboard size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: isTabActive('dashboard') ? 800 : 600 }}>
              Dashboard Utama
            </span>
          </div>
        </button>

        {/* KATEGORI 2: MASTER DATA */}
        <div style={{ padding: '14px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          MASTER DATA
        </div>

        <button 
          className={`nav-item-btn ${isTabActive('pegawai') ? 'active-green' : ''}`}
          onClick={() => handleNavTab('pegawai', 'admin-pegawai')}
          style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
        >
          <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
              flexShrink: 0
            }}>
              <UserCheck size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: isTabActive('pegawai') ? 800 : 600 }}>
              Data Kepegawaian
            </span>
          </div>
        </button>

        <button 
          className={`nav-item-btn ${isTabActive('presensi') ? 'active-green' : ''}`}
          onClick={() => handleNavTab('presensi', 'admin-presensi')}
          style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
        >
          <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
              flexShrink: 0
            }}>
              <Fingerprint size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: isTabActive('presensi') ? 800 : 600 }}>
              Presensi & Biometrik
            </span>
          </div>
        </button>

        {/* KATEGORI 3: LAYANAN & VERIFIKASI */}
        <div style={{ padding: '14px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          LAYANAN & VERIFIKASI
        </div>

        <button 
          className={`nav-item-btn ${isTabActive('cuti') ? 'active-green' : ''}`}
          onClick={() => handleNavTab('cuti', 'admin-cuti')}
          style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
        >
          <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
              flexShrink: 0
            }}>
              <CalendarCheck2 size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: isTabActive('cuti') ? 800 : 600 }}>
              Verifikasi Cuti Pegawai
            </span>
          </div>
        </button>

        <button 
          className={`nav-item-btn ${isTabActive('spt') ? 'active-green' : ''}`}
          onClick={() => handleNavTab('spt', 'admin-dashboard')}
          style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
        >
          <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
              flexShrink: 0
            }}>
              <FileBadge2 size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: isTabActive('spt') ? 800 : 600 }}>
              Administrasi SPT
            </span>
          </div>
        </button>

        <button 
          className={`nav-item-btn ${isTabActive('disposisi') ? 'active-green' : ''}`}
          onClick={() => handleNavTab('disposisi', 'admin-disposisi')}
          style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
        >
          <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
              flexShrink: 0
            }}>
              <FolderKanban size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: isTabActive('disposisi') ? 800 : 600 }}>
              Disposisi & Agenda Dinas
            </span>
          </div>
        </button>

        {/* KATEGORI 4: PENGATURAN */}
        <div style={{ padding: '14px 14px 4px', fontSize: '0.68rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          PENGATURAN
        </div>

        <button 
          className={`nav-item-btn ${isTabActive('pengaturan') ? 'active-green' : ''}`}
          onClick={() => handleNavTab('pengaturan', 'admin-pengaturan')}
          style={{ borderRadius: '0 8px 8px 0', margin: '2px 0' }}
        >
          <div className="nav-item-left" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0d9488 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
              flexShrink: 0
            }}>
              <Sliders size={16} strokeWidth={2.4} />
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: isTabActive('pengaturan') ? 800 : 600 }}>
              Pengaturan Sistem
            </span>
          </div>
        </button>

      </nav>

      {/* Bottom Sticky Section: Notification Card & Logout */}
      <div style={{
        marginTop: 'auto',
        padding: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        background: 'rgba(0, 0, 0, 0.14)'
      }}>
        {/* Prioritas Layanan Notification Card */}
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '10px',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                background: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309',
                position: 'relative'
              }}>
                <Bell size={13} strokeWidth={2.6} />
                <span style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '-1px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#ef4444'
                }} />
              </div>
              <span style={{
                color: '#92400e',
                fontSize: '0.74rem',
                fontWeight: 900,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                PRIORITAS LAYANAN
              </span>
            </div>

            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              background: 'rgba(255, 255, 255, 0.7)',
              color: '#b45309',
              padding: '2px 7px',
              borderRadius: '9999px',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }}>
              Hari Ini
            </span>
          </div>

          <p style={{
            color: '#78350f',
            fontSize: '0.78rem',
            lineHeight: 1.45,
            margin: '0 0 10px 0',
            fontWeight: 600
          }}>
            Periksa permohonan yang menunggu tanggapan sebelum jam 15.59.
          </p>

          <button
            type="button"
            onClick={() => navigateTo('admin-cuti')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              color: '#92400e',
              fontWeight: 800,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.12)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(245, 158, 11, 0.25)';
              e.currentTarget.style.background = '#fffbeb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.12)';
              e.currentTarget.style.background = '#ffffff';
            }}
            title="Buka daftar permohonan yang menunggu verifikasi"
          >
            <span>Buka daftar</span>
            <ArrowUpRight size={14} strokeWidth={2.6} />
          </button>
        </div>

        {/* Tombol Keluar dari Sistem */}
        <button
          type="button"
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.45)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.35)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
          }}
          title="Keluar dari sesi Administrator"
        >
          <LogOut size={16} strokeWidth={2.4} />
          <span>Keluar dari Sistem</span>
        </button>
      </div>
    </aside>
  );
}
