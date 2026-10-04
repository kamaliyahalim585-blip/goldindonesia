import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Shield, 
  Sparkles, 
  ExternalLink, 
  LogOut, 
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
  Eye,
  EyeOff,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Volume2,
  VolumeX,
  RefreshCw,
  Bell,
  Radio
} from 'lucide-react';
import nusantaragoldLogo from '../../assets/images/nusantaragold_logo_1791089607884.jpg';
import { AdminScreen, AdminTab } from './AdminScreen';
import { UserAccount, Transaction } from '../../types';
import { 
  isUserAdmin, 
  subscribeToPendingTransactions, 
  PendingAggregation,
  fetchPlatformTransactionsFromFirestore 
} from '../../services/adminService';
import { formatIDR } from '../../data/mockData';
import { 
  createAdminAccount, 
  findRegisteredAccount, 
  saveRegisteredAccountRecord
} from '../../services/authStorage';
import { auth, googleProvider, signInWithPopup } from '../../lib/firebase';

interface StandaloneAdminPortalProps {
  onBackToApp: () => void;
}

export const StandaloneAdminPortal: React.FC<StandaloneAdminPortalProps> = ({ onBackToApp }) => {
  const [adminUser, setAdminUser] = useState<UserAccount | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Tab synchronized with AdminScreen
  const [activeTab, setActiveTab] = useState<AdminTab>('withdrawals');

  // Real-time Firestore aggregation state for pending deposit and withdrawal transactions
  const [pendingAggregation, setPendingAggregation] = useState<PendingAggregation>({
    pendingDeposits: [],
    pendingWithdrawals: [],
    allPending: [],
    totalPendingDepositIdr: 0,
    totalPendingWithdrawalIdr: 0,
    totalPendingCount: 0,
    lastUpdated: Date.now(),
    latestPendingTx: null,
    newlyAddedTx: null
  });
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);
  const [recentLiveAlert, setRecentLiveAlert] = useState<{
    tx: Transaction;
    type: 'deposit' | 'withdrawal';
    timestamp: number;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Gentle audio chime for new live user activity
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      // 2-tone melodic notification chime: E5 (659Hz) -> A5 (880Hz)
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.11);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.48);
    } catch (_) {
      // AudioContext blocked without interaction
    }
  };

  // Real-time Firestore listener for pending transactions
  useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      unsub = subscribeToPendingTransactions((agg) => {
        setPendingAggregation(agg);
        setIsLiveConnected(true);

        if (agg.newlyAddedTx) {
          const tx = agg.newlyAddedTx;
          const isDeposit = 
            tx.category === 'deposit' || 
            (tx.title && tx.title.toLowerCase().includes('deposit'));
          const txType: 'deposit' | 'withdrawal' = isDeposit ? 'deposit' : 'withdrawal';
          const typeLabel = isDeposit ? 'Deposit' : 'Penarikan Dana';
          const actor = tx.senderName || tx.senderAccount || 'Investor';

          setRecentLiveAlert({
            tx,
            type: txType,
            timestamp: Date.now()
          });

          showToast(`⚡ Transaksi Live: Pengajuan ${typeLabel} ${formatIDR(tx.amountIdr)} dari ${actor}`);

          if (soundAlertEnabled) {
            playAlertChime();
          }
        }
      });
    } catch (err) {
      console.warn('subscribeToPendingTransactions error:', err);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [soundAlertEnabled]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchPlatformTransactionsFromFirestore();
      showToast('Data antrean pending Firestore berhasil disegarkan.');
    } catch (_) {}
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Check existing session on mount
  useEffect(() => {
    try {
      const savedAdmin = localStorage.getItem('indogold_admin_session');
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin) as UserAccount;
        if (isUserAdmin(parsed)) {
          setAdminUser(parsed);
          return;
        }
      }

      // Check if current logged-in firebase/local user is admin
      const currentUserStr = localStorage.getItem('indogold_user');
      if (currentUserStr) {
        const current = JSON.parse(currentUserStr) as UserAccount;
        if (isUserAdmin(current)) {
          setAdminUser(current);
          return;
        }
      }

      // Check firebase auth user email
      const fbUser = auth.currentUser;
      if (fbUser && fbUser.email && (
        fbUser.email.toLowerCase() === 'khoirulanisss@gmail.com' ||
        fbUser.email.toLowerCase() === 'kamaliyahalim585@gmail.com' ||
        fbUser.email.toLowerCase().includes('admin')
      )) {
        const adminAcc = createAdminAccount(
          fbUser.displayName || (fbUser.email.toLowerCase().includes('kamaliya') ? 'Kamaliya Halim (Super Admin)' : 'Super Admin Master'),
          fbUser.email,
          'secretAdmin123',
          '123456',
          '+62 812-9988-7766',
          'Super Administrator Master'
        );
        setAdminUser(adminAcc.userProfile);
        localStorage.setItem('indogold_admin_session', JSON.stringify(adminAcc.userProfile));
      }
    } catch (e) {
      console.error('Error verifying admin session:', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const normEmail = email.trim().toLowerCase();

    // Check authorization: must be registered admin, khoirulanisss@gmail.com, kamaliyahalim585@gmail.com, or admin@nusantaragold.id
    const isMasterEmail = 
      normEmail === 'khoirulanisss@gmail.com' || 
      normEmail === 'kamaliyahalim585@gmail.com' ||
      normEmail === 'admin@nusantaragold.id' || 
      normEmail === 'admin@indogold.id' || 
      normEmail.includes('admin');

    if (!isMasterEmail) {
      setIsLoading(false);
      setErrorMessage('Akses ditolak. Email tidak terdaftar dalam sistem hak akses Administrator NusantaraGold.');
      return;
    }

    if (!password) {
      setIsLoading(false);
      setErrorMessage('Silakan masukkan kata sandi master administrator.');
      return;
    }

    // Find account in storage or create authorized admin account
    let adminRecord = findRegisteredAccount(normEmail);
    if (!adminRecord) {
      const adminName = normEmail === 'kamaliyahalim585@gmail.com'
        ? 'Kamaliya Halim (Super Admin)'
        : normEmail === 'khoirulanisss@gmail.com'
        ? 'Admin Super NusantaraGold'
        : 'Admin Super NusantaraGold';

      adminRecord = createAdminAccount(
        adminName,
        normEmail,
        password,
        pin || '123456',
        '+62 812-9988-7766',
        'Super Administrator Master'
      );
    } else {
      // Ensure role is admin
      adminRecord.userProfile.role = 'admin';
      adminRecord.userProfile.kycLevel = 'Super Administrator Master';
      saveRegisteredAccountRecord(adminRecord);
    }

    setAdminUser(adminRecord.userProfile);
    localStorage.setItem('indogold_admin_session', JSON.stringify(adminRecord.userProfile));
    setIsLoading(false);
    showToast(`Selamat datang, Administrator ${adminRecord.name}!`);
  };

  const handleGoogleAdminLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      if (!fbUser || !fbUser.email) {
        throw new Error('Gagal mendapatkan informasi akun Google.');
      }

      const userEmail = fbUser.email.toLowerCase();
      // Specifically allow the owner email, kamaliyahalim585@gmail.com, or any admin email
      if (
        userEmail === 'khoirulanisss@gmail.com' || 
        userEmail === 'kamaliyahalim585@gmail.com' ||
        userEmail.includes('admin')
      ) {
        const adminName = userEmail === 'kamaliyahalim585@gmail.com'
          ? 'Kamaliya Halim (Super Admin)'
          : 'Admin Super NusantaraGold';

        const adminAcc = createAdminAccount(
          adminName,
          userEmail,
          'google-auth-secured',
          '123456',
          fbUser.phoneNumber || '+62 812-9988-7766',
          'Super Administrator Master'
        );
        setAdminUser(adminAcc.userProfile);
        localStorage.setItem('indogold_admin_session', JSON.stringify(adminAcc.userProfile));
        showToast(`Autentikasi Google berhasil! Akses Super Admin diberikan untuk ${adminName}.`);
      } else {
        setErrorMessage(`Akun ${userEmail} bukan akun administrator terdaftar.`);
      }
    } catch (err: any) {
      console.error('Google Admin Login error:', err);
      setErrorMessage(err.message || 'Gagal login via Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMasterLogin = (targetEmail: string, name: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const adminAcc = createAdminAccount(
        name,
        targetEmail,
        'admin123456',
        '123456',
        '+62 812-9988-7766',
        'Super Administrator Master'
      );
      setAdminUser(adminAcc.userProfile);
      localStorage.setItem('indogold_admin_session', JSON.stringify(adminAcc.userProfile));
      setIsLoading(false);
      showToast(`Akses Super Admin diaktifkan untuk ${name}`);
    }, 400);
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('indogold_admin_session');
    setAdminUser(null);
    showToast('Sesi administrator telah keluar dengan aman.');
  };

  // If already authenticated as Admin, show the Full Admin Screen Workstation
  if (adminUser) {
    return (
      <div className="min-h-screen bg-[#0A0908] text-[#F7F5F2] flex flex-col font-sans">
        {/* Top Dedicated Administrator Bar */}
        <header className="sticky top-0 z-50 bg-[#141210]/95 backdrop-blur-xl border-b border-[#362D1D] px-4 py-2.5 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
            {/* Upper Nav Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img 
                  src={nusantaragoldLogo} 
                  alt="Logo NusantaraGold" 
                  className="w-9 h-9 rounded-xl object-contain bg-black border border-amber-400/60 shadow-md shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-bold text-[#F7F5F2] tracking-wide">
                      NusantaraGold Control Management
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      Isolated Admin Portal
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#A0988C]">
                    <span>Operator: <strong className="text-amber-300 font-semibold">{adminUser.name}</strong> ({adminUser.email})</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isLiveConnected ? 'Firestore Real-Time Aktif' : 'Menghubungkan ke Cloud...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Audio chime toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundAlertEnabled;
                    setSoundAlertEnabled(next);
                    showToast(next ? 'Notifikasi suara transaksi live diaktifkan' : 'Notifikasi suara dinonaktifkan');
                    if (next) playAlertChime();
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    soundAlertEnabled
                      ? 'bg-amber-500/15 border-amber-400/50 text-amber-300 hover:bg-amber-500/25'
                      : 'bg-[#1E1B17] border-[#3E3424] text-[#A0988C] hover:text-[#F7F5F2]'
                  }`}
                  title={soundAlertEnabled ? 'Suara Notifikasi Live Aktif' : 'Suara Notifikasi Live Nonaktif'}
                >
                  {soundAlertEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Suara Live</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-[#756E63]" />
                      <span className="hidden sm:inline">Bisu</span>
                    </>
                  )}
                </button>

                {/* Cloud Refresh */}
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="p-1.5 rounded-xl bg-[#1E1B17] hover:bg-[#28241F] border border-[#3E3424] text-[#C2BCB3] hover:text-[#F7F5F2] transition cursor-pointer disabled:opacity-50"
                  title="Segarkan antrean pending Firestore"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.open('/', '_blank');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#1E1B17] hover:bg-[#28241F] border border-[#3E3424] text-[#C2BCB3] hover:text-[#F7F5F2] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Buka Aplikasi Investor di Tab Baru"
                >
                  <span>Buka App Investor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onBackToApp}
                  className="px-3 py-1.5 rounded-xl bg-[#1E1B17] hover:bg-[#28241F] border border-[#3E3424] text-[#C2BCB3] hover:text-[#F7F5F2] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Kembali ke tampilan aplikasi"
                >
                  <span>Kembali ke App</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutAdmin}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  title="Keluar dari sesi administrator"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Portal</span>
                </button>
              </div>
            </div>

            {/* Real-Time Live Aggregation Bar */}
            <div className="pt-2 border-t border-[#262016] flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Firestore Stream:</span>
                  <strong className="text-white font-bold">{pendingAggregation.totalPendingCount} Antrean</strong>
                </div>

                <span className="text-xs text-[#736B5F] hidden md:inline">
                  Pembaruan: {new Date(pendingAggregation.lastUpdated).toLocaleTimeString('id-ID')}
                </span>
              </div>

              {/* Direct Tab Switching Badges for Aggregated Pending Deposits and Withdrawals */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Pending Deposits Button Badge */}
                <button
                  type="button"
                  onClick={() => setActiveTab('deposits')}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition cursor-pointer text-xs font-semibold ${
                    activeTab === 'deposits'
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                      : 'bg-[#181613] border-[#362D1D] text-[#C2BCB3] hover:text-[#F7F5F2] hover:border-amber-500/40'
                  }`}
                  title="Klik untuk membuka antrean verifikasi deposit"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  <span>Deposit Pending:</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                    pendingAggregation.pendingDeposits.length > 0 
                      ? 'bg-amber-400 text-slate-950 animate-pulse' 
                      : 'bg-[#2A241B] text-[#A0988C]'
                  }`}>
                    {pendingAggregation.pendingDeposits.length}
                  </span>
                  <span className="text-amber-200/95 font-mono text-[11px] font-bold">
                    {formatIDR(pendingAggregation.totalPendingDepositIdr)}
                  </span>
                </button>

                {/* Pending Withdrawals Button Badge */}
                <button
                  type="button"
                  onClick={() => setActiveTab('withdrawals')}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition cursor-pointer text-xs font-semibold ${
                    activeTab === 'withdrawals'
                      ? 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-md shadow-rose-500/10'
                      : 'bg-[#181613] border-[#362D1D] text-[#C2BCB3] hover:text-[#F7F5F2] hover:border-rose-500/40'
                  }`}
                  title="Klik untuk membuka antrean persetujuan penarikan"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <span>Penarikan Pending:</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                    pendingAggregation.pendingWithdrawals.length > 0 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-[#2A241B] text-[#A0988C]'
                  }`}>
                    {pendingAggregation.pendingWithdrawals.length}
                  </span>
                  <span className="text-rose-200/95 font-mono text-[11px] font-bold">
                    {formatIDR(pendingAggregation.totalPendingWithdrawalIdr)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Real-time Incoming Activity Ticker / Alert */}
        {recentLiveAlert && (Date.now() - recentLiveAlert.timestamp < 35000) && (
          <div className="bg-gradient-to-r from-amber-950/90 via-[#2B2111] to-[#17140E] border-b border-amber-500/40 px-4 py-2.5 flex items-center justify-between gap-3 text-xs shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="font-bold text-amber-300 shrink-0">
                Transaksi Pengguna Baru:
              </span>
              <span className="text-[#F7F5F2] truncate">
                Pengajuan {recentLiveAlert.type === 'deposit' ? 'Deposit' : 'Penarikan Dana'} sebesar{' '}
                <strong className="text-amber-200 font-mono font-bold">{formatIDR(recentLiveAlert.tx.amountIdr)}</strong> oleh{' '}
                <span className="text-slate-200 font-semibold">{recentLiveAlert.tx.senderName || recentLiveAlert.tx.senderAccount}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab(recentLiveAlert.type === 'deposit' ? 'deposits' : 'withdrawals');
                  setRecentLiveAlert(null);
                }}
                className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer active:scale-95 shadow-sm flex items-center gap-1"
              >
                <span>Tinjau Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => setRecentLiveAlert(null)}
                className="text-[#9E978E] hover:text-[#F7F5F2] p-1 rounded-md"
                title="Tutup banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Full Admin Workstation Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4">
          <AdminScreen
            currentAdmin={adminUser}
            onExitAdmin={onBackToApp}
            onShowToast={showToast}
            externalActiveTab={activeTab}
            onTabChange={setActiveTab}
          />
        </main>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] p-3.5 rounded-xl bg-[#1A1816] border border-amber-400/60 shadow-2xl flex items-center justify-between gap-3 text-xs text-[#F7F5F2] animate-bounce-short">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#9E978E] hover:text-[#F7F5F2]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // If not logged in, show High-Security Dedicated Admin Portal Login
  return (
    <div className="min-h-screen bg-[#070605] text-[#F7F5F2] flex flex-col justify-center items-center p-4 relative selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Back to App Link */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={onBackToApp}
          className="px-3.5 py-1.5 rounded-xl bg-[#141210] hover:bg-[#1E1B17] border border-[#2E2820] text-[#A0988C] hover:text-[#F7F5F2] text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
        >
          <span>← Kembali ke Aplikasi Investor</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 my-8">
        {/* Portal Header */}
        <div className="text-center mb-6">
          <div className="inline-block relative mb-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur-sm opacity-70 pointer-events-none" />
            <img 
              src={nusantaragoldLogo} 
              alt="Logo Resmi NusantaraGold" 
              className="relative w-20 h-20 rounded-2xl object-contain bg-black border-2 border-amber-400 shadow-2xl mx-auto" 
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2 shadow-sm">
            <Shield className="w-3.5 h-3.5 fill-amber-300 stroke-[2.5]" />
            <span>PORTAL TERPISAH ADMINISTRATOR</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F7F5F2] tracking-tight">
            NusantaraGold Control Management
          </h1>
          <p className="text-xs text-[#A0988C] mt-1 max-w-sm mx-auto">
            Area terbatas & terisolasi khusus pemilik aplikasi & tim verifikator transaksi BAPPEBTI.
          </p>
        </div>

        {/* Security Warning Notice */}
        <div className="p-3 rounded-xl bg-[#141210] border border-[#2E2820] mb-5 flex items-start gap-2.5 text-[11px] text-[#A0988C]">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Panel ini adalah halaman web terpisah khusus administrator (<code className="text-amber-300 font-mono">/admin</code>). Akses diizinkan untuk super admin <strong className="text-amber-300">kamaliyahalim585@gmail.com</strong> & <strong className="text-amber-300">khoirulanisss@gmail.com</strong>.
          </span>
        </div>

        {/* Login Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#181512] to-[#100E0C] border-2 border-amber-400/60 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/80 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick One-Click Admin Logins */}
          <div className="mb-5 pb-5 border-b border-[#2A241B] space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#A0988C] tracking-wider block mb-1">
              Akses Cepat Super Admin (1-Klik Langsung Masuk)
            </span>

            {/* Kamaliya Halim */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickMasterLogin('kamaliyahalim585@gmail.com', 'Kamaliya Halim (Super Admin)')}
              className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-400/20 flex items-center justify-between active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 fill-slate-950 stroke-[2.5]" />
                <div className="text-left">
                  <span className="block font-bold">Masuk sebagai Kamaliya Halim</span>
                  <span className="text-[10px] text-slate-900 font-mono font-medium">kamaliyahalim585@gmail.com</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Khoirul Anis */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickMasterLogin('khoirulanisss@gmail.com', 'Admin Super NusantaraGold')}
              className="w-full py-2 px-3.5 rounded-xl bg-[#201C16] hover:bg-[#28231C] border border-[#3E3424] text-[#EAE6E1] text-xs font-bold transition cursor-pointer flex items-center justify-between active:scale-95 disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <div className="text-left">
                  <span className="block">Masuk sebagai Owner (khoirulanisss@gmail.com)</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {/* Google Login */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleAdminLogin}
              className="w-full py-2 px-3 rounded-xl bg-[#171410] hover:bg-[#201C16] border border-[#2E2820] text-[#C2BCB3] hover:text-[#F7F5F2] text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Login via Akun Google Resmi</span>
            </button>
          </div>

          {/* Form Login Manual Kredensial Admin */}
          <form onSubmit={handleAdminLogin} className="space-y-3.5">
            <span className="text-[10px] uppercase font-bold text-[#A0988C] tracking-wider block">
              Atau Masuk dengan Kredensial Admin
            </span>

            <div>
              <label className="text-xs text-[#C2BCB3] font-medium block mb-1">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kamaliyahalim585@gmail.com / khoirulanisss@gmail.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#12100E] border border-[#2E2820] rounded-xl text-xs text-[#F7F5F2] focus:outline-none focus:border-amber-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[#C2BCB3] font-medium block mb-1">
                Kata Sandi Master
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi master"
                  className="w-full pl-9 pr-8 py-2 bg-[#12100E] border border-[#2E2820] rounded-xl text-xs text-[#F7F5F2] focus:outline-none focus:border-amber-400 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-[#8C857B] hover:text-amber-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#C2BCB3] font-medium block mb-1">
                PIN Master (6 Digit Opsional)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full pl-9 pr-3 py-2 bg-[#12100E] border border-[#2E2820] rounded-xl text-xs font-mono text-[#F7F5F2] focus:outline-none focus:border-amber-400 transition tracking-widest text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20 transition active:scale-95 disabled:opacity-50"
            >
              <span>{isLoading ? 'Memverifikasi Akses...' : 'Autentikasi & Masuk Portal'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Security watermark footer */}
        <div className="text-center mt-6 text-[10px] text-[#6E675D]">
          <span>Protected by NusantaraGold Security Vault • IP Logged • 256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] p-3.5 rounded-xl bg-[#1A1816] border border-amber-400/60 shadow-2xl flex items-center justify-between gap-3 text-xs text-[#F7F5F2] animate-bounce-short">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#9E978E] hover:text-[#F7F5F2]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
