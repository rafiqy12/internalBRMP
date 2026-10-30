import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import DashboardView from './components/DashboardView';
import AbsensiBulanan from './components/AbsensiBulanan';
import AbsensiChart from './components/AbsensiChart';
import AdmsMonitor from './components/AdmsMonitor';
import PengajuanCuti from './components/PengajuanCuti';
import PengaturanAkun from './components/PengaturanAkun';
import SptProgram from './spt/SptProgram';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './admin/AdminLogin';
import { getStoredAvatar } from './services/api';
import { 
  LayoutDashboard, 
  CalendarCheck2, 
  CalendarOff, 
  FileText, 
  Menu 
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('brmp_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.nip === '198001012005011001' || parsed?.id === 'PEG-ADM') {
        parsed.systemRole = 'admin';
        parsed.approvalRole = 'admin';
        parsed.role = 'admin';
        parsed.roleLabel = 'Administrator (Akses Penuh Semua Modul)';
      }
      if (parsed?.nip && !parsed.fotoProfil) {
        const cached = getStoredAvatar(parsed.nip);
        if (cached) parsed.fotoProfil = cached;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect whether current route is the Secret Admin Portal (/admin or #/admin)
  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/admin') || hash.startsWith('#/admin') || path.includes('/admin');
  };

  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);

  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Close mobile drawer whenever viewport resizes to desktop or view changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isUserAdmin = Boolean(
    user && (
      user.systemRole === 'admin' ||
      user.role === 'admin' ||
      user.approvalRole === 'admin' ||
      user.approvalRole === 'kepegawaian' ||
      user.nip === '198001012005011001' ||
      user.nip === '199005022025051006' ||
      String(user.nama || '').toLowerCase().includes('romy') ||
      user.id === 'PEG-ADM' ||
      user.id === 'PEG-005'
    )
  );

  const handleLoginSuccess = (userData, fromAdminGate = false) => {
    const targetNip = userData?.nip;
    const cachedPhoto = getStoredAvatar(targetNip);
    const mergedUser = {
      ...userData,
      fotoProfil: userData.fotoProfil || cachedPhoto || null
    };
    setUser(mergedUser);
    localStorage.setItem('brmp_user', JSON.stringify(mergedUser));

    const isAdminUser = Boolean(
      mergedUser.systemRole === 'admin' ||
      mergedUser.role === 'admin' ||
      mergedUser.approvalRole === 'admin' ||
      mergedUser.nip === '198001012005011001' ||
      mergedUser.id === 'PEG-ADM'
    );

    if (isAdminUser || fromAdminGate) {
      setCurrentView('admin-dashboard');
      if (typeof window !== 'undefined' && window.location.hash !== '#/admin' && !window.location.pathname.includes('/admin')) {
        window.history.pushState(null, '', '#/admin');
      }
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('brmp_user');
  };

  const handleSwitchUser = (newUser) => {
    if (!newUser) return;
    const targetNip = newUser?.nip;
    const cachedPhoto = getStoredAvatar(targetNip);
    const mergedUser = {
      ...newUser,
      fotoProfil: newUser.fotoProfil || cachedPhoto || null
    };
    setUser(mergedUser);
    localStorage.setItem('brmp_user', JSON.stringify(mergedUser));
  };

  // 1. GERBANG PORTAL ADMIN (/admin atau #/admin)
  if (isAdminRoute && (!user || !isUserAdmin)) {
    return (
      <AdminLogin 
        onLoginSuccess={(adminUser) => {
          handleLoginSuccess(adminUser, true);
        }} 
      />
    );
  }

  // 2. GERBANG PORTAL PEGAWAI BIASA (/)
  if (!user) {
    return (
      <Login 
        onLoginSuccess={(regUser) => {
          handleLoginSuccess(regUser, false);
        }} 
      />
    );
  }

  // Map currentView to the SPT target view in the brmpSPT program
  const getSptTargetView = () => {
    if (currentView === 'spt-pengajuan' || currentView === 'pengajuan-spt') return 'pengajuan';
    if (currentView === 'spt-tracking' || currentView === 'report-spt') return 'tracking';
    if (currentView === 'spt-approval-ketimker') return 'approval-ketimker';
    if (currentView === 'spt-approval-kobag') return 'approval-kobag';
    if (currentView === 'spt-approval' || currentView === 'approval-spt') return 'approval';
    if (currentView === 'spt-admin-sekretariat' || currentView === 'spt-admin') return 'admin-sekretariat';
    if (currentView === 'spt-monitoring-kopoks') return 'monitoring-kopoks';
    if (currentView === 'spt-sop' || currentView === 'sop-spt') return 'sop';
    return 'dashboard';
  };

  const isSptView = currentView.includes('spt') && !currentView.startsWith('admin');

  return (
    <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Top Header Navbar */}
      <Navbar 
        user={user} 
        currentView={currentView}
        isUserAdmin={isUserAdmin}
        onLogout={handleLogout} 
        onSwitchUser={handleSwitchUser} 
        onNavigate={setCurrentView}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%', minWidth: 0 }}>
        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="sidebar-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Tutup Menu"
          />
        )}

        {/* Sidebar Nav */}
        <Sidebar 
          currentView={currentView} 
          setCurrentView={(v) => {
            setCurrentView(v);
            setIsMobileMenuOpen(false);
          }} 
          user={user} 
          isUserAdmin={isUserAdmin}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onLogout={handleLogout}
        />

        {/* Dynamic Main View */}
        <main className={`main-content ${isSptView ? 'flush-view' : ''}`}>
          {currentView === 'dashboard' && (
            isUserAdmin ? (
              <AdminDashboard 
                user={user} 
                onNavigate={setCurrentView} 
                onUpdateUser={handleSwitchUser} 
                onLogout={handleLogout} 
                initialTab="dashboard" 
              />
            ) : (
              <DashboardView user={user} onNavigate={setCurrentView} />
            )
          )}

          {/* Admin Dashboard & Management Views */}
          {currentView.startsWith('admin') && (
            isUserAdmin ? (
              <AdminDashboard 
                user={user} 
                onNavigate={setCurrentView} 
                onUpdateUser={handleSwitchUser}
                onLogout={handleLogout}
                initialTab={
                  currentView === 'admin-pegawai' ? 'pegawai' :
                  currentView === 'admin-presensi' ? 'presensi' :
                  currentView === 'admin-cuti' ? 'cuti' :
                  currentView === 'admin-spt' ? 'spt' :
                  currentView === 'admin-disposisi' ? 'disposisi' :
                  currentView === 'admin-agenda' ? 'agenda' :
                  currentView === 'admin-pengaturan' ? 'pengaturan' : 'dashboard'
                } 
              />
            ) : (
              <DashboardView user={user} onNavigate={setCurrentView} />
            )
          )}

          {currentView === 'absensi-bulanan' && (
            <AbsensiBulanan user={user} />
          )}

          {currentView === 'absensi-chart' && (
            <AbsensiChart />
          )}

          {currentView === 'adms-monitor' && (
            <AdmsMonitor user={user} />
          )}

          {currentView === 'pengajuan-cuti' && (
            <PengajuanCuti user={user} onSwitchUser={handleSwitchUser} />
          )}

          {currentView === 'pengaturan-akun' && (
            <PengaturanAkun user={user} onUpdateUser={handleSwitchUser} />
          )}

          {/* Program Asli SPT (brmpSPT Digital Standar Kementan RI) */}
          {isSptView && (
            <SptProgram 
              user={user} 
              targetView={getSptTargetView()} 
            />
          )}
        </main>
      </div>

      {/* Modern Mobile Bottom Navigation Bar (Very User Friendly on Mobile) */}
      <nav className="mobile-bottom-nav no-print">
        <button 
          className={`bottom-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }}
        >
          <LayoutDashboard size={20} />
          <span>Beranda</span>
        </button>

        <button 
          className={`bottom-nav-item ${currentView.includes('absensi') ? 'active' : ''}`}
          onClick={() => { setCurrentView('absensi-bulanan'); setIsMobileMenuOpen(false); }}
        >
          <CalendarCheck2 size={20} />
          <span>Absensi</span>
        </button>

        <button 
          className={`bottom-nav-item ${currentView === 'pengajuan-cuti' ? 'active' : ''}`}
          onClick={() => { setCurrentView('pengajuan-cuti'); setIsMobileMenuOpen(false); }}
        >
          <CalendarOff size={20} />
          <span>Cuti</span>
        </button>

        <button 
          className={`bottom-nav-item ${currentView.includes('spt') ? 'active' : ''}`}
          onClick={() => { setCurrentView('spt-dashboard'); setIsMobileMenuOpen(false); }}
        >
          <FileText size={20} />
          <span>SPT</span>
        </button>

        <button 
          className={`bottom-nav-item ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
