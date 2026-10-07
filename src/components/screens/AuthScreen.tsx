import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Mail, 
  ArrowRight, 
  X, 
  Gift, 
  Tag, 
  PhoneCall, 
  KeyRound, 
  User as UserIcon, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  LogIn,
  UserPlus
} from 'lucide-react';
import nusantaragoldLogo from '../../assets/images/nusantaragold_logo_1791089607884.jpg';
import { APP_IMAGES, INITIAL_USER, INITIAL_TRANSACTIONS } from '../../data/mockData';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from '../../lib/firebase';
import { 
  saveRegisteredAccountRecord, 
  findRegisteredAccount,
  getRegisteredAccounts,
  verifyVaultCredentials,
  verifyAccountCredentialsAsync,
  createAdminAccount 
} from '../../services/authStorage';
import { UserAccount, Transaction } from '../../types';

interface AuthScreenProps {
  onSuccess: (
    email: string, 
    name: string, 
    isNewRegistration?: boolean, 
    referralCodeUsed?: string,
    initialPin?: string,
    phone?: string,
    passwordUsed?: string,
    restoredProfile?: UserAccount,
    restoredTransactions?: Transaction[]
  ) => void;
  onClose?: () => void;
  isModal?: boolean;
  defaultTab?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onClose,
  isModal = false,
  defaultTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState(() => {
    return localStorage.getItem('indogold_last_email') || '';
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bonus pendaftaran baru: Rp 20.000 (dasar) + Rp 10.000 jika menggunakan referral
  const hasReferralCode = regReferral.trim().length >= 3;
  const totalRegistrationBonus = hasReferralCode ? 30000 : 20000;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Harap masukkan alamat email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const normalizedEmail = loginEmail.trim().toLowerCase();
    try {
      localStorage.setItem('nusantaragold_last_email', normalizedEmail);
    } catch (_) {}

    // 1. Cek kredensial akun di vault lokal & database cloud Firestore
    const vaultResult = await verifyAccountCredentialsAsync(normalizedEmail, loginPassword);
    if (vaultResult.success && vaultResult.account) {
      const account = vaultResult.account;
      setIsLoading(false);

      // Sinkronisasi sesi Firebase di latar belakang jika tersedia
      signInWithEmailAndPassword(auth, normalizedEmail, loginPassword).catch(() => {});

      onSuccess(
        normalizedEmail,
        account.name || account.userProfile?.name || 'Investor NusantaraGold',
        false,
        undefined,
        account.pin || account.userProfile?.pinCode || '123456',
        account.phone || account.userProfile?.phone,
        loginPassword,
        account.userProfile,
        account.transactions
      );
      return;
    }

    if (vaultResult.reason === 'wrong_password') {
      setIsLoading(false);
      setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
      return;
    }

    // 2. Jika belum ada di vault, coba login melalui Firebase Authentication
    try {
      const res = await signInWithEmailAndPassword(auth, normalizedEmail, loginPassword);
      const fbUser = res.user;

      setIsLoading(false);
      onSuccess(
        fbUser.email || normalizedEmail,
        fbUser.displayName || 'Investor NusantaraGold',
        false,
        undefined,
        undefined,
        undefined,
        loginPassword
      );
    } catch (authErr: any) {
      setIsLoading(false);
      const code = authErr?.code || '';
      console.warn('Firebase login attempt notice:', code, authErr);

      if (code === 'auth/wrong-password') {
        setErrorMessage('Kata sandi yang Anda masukkan salah. Silakan periksa kembali.');
      } else if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setErrorMessage('Akun belum terdaftar. Silakan pindah ke tab "Daftar Akun Baru".');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('Format alamat email tidak valid.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMessage('Terlalu banyak percobaan masuk yang gagal. Silakan tunggu beberapa saat.');
      } else {
        setErrorMessage('Email atau kata sandi tidak sesuai. Pastikan akun sudah terdaftar.');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Harap masukkan nama lengkap Anda.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Harap masukkan alamat email yang aktif.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Kata sandi harus terdiri dari minimal 6 karakter.');
      return;
    }
    if (regPin.length !== 6 || isNaN(Number(regPin))) {
      setErrorMessage('PIN transaksi harus terdiri dari tepat 6 angka numerik.');
      return;
    }

    const normalizedEmail = regEmail.trim().toLowerCase();

    // Pastikan email belum terdaftar di vault
    const existingVaultAccount = findRegisteredAccount(normalizedEmail);
    if (existingVaultAccount) {
      setErrorMessage('Email ini sudah terdaftar. Silakan pindah ke tab "Masuk (Login)".');
      return;
    }

    setIsLoading(true);

    // Hitung bonus pendaftaran baru: Rp 20.000 atau Rp 30.000 jika memakai referral
    const hasRef = regReferral.trim().length >= 3;
    const bonusAmount = hasRef ? 30000 : 20000;

    const initialTransactions: Transaction[] = [
      {
        id: `BONUS-REG-${Math.floor(10000 + Math.random() * 90000)}`,
        category: 'deposit',
        title: 'Bonus Pendaftaran Pengguna Baru',
        amountIdr: 20000,
        date: 'Hari ini, Baru saja',
        timestamp: Date.now(),
        status: 'Approved',
        paymentMethod: 'NusantaraGold Welcome Bonus',
        taxOrFee: 0,
        notes: 'Bonus saldo kas sambutan pendaftaran akun baru NusantaraGold Luxe 24K'
      }
    ];

    if (hasRef) {
      initialTransactions.push({
        id: `BONUS-REF-${Math.floor(10000 + Math.random() * 90000)}`,
        category: 'deposit',
        title: `Bonus Referral Kode [${regReferral.trim().toUpperCase()}]`,
        amountIdr: 10000,
        date: 'Hari ini, Baru saja',
        timestamp: Date.now() + 1,
        status: 'Approved',
        paymentMethod: 'NusantaraGold Referral Program',
        taxOrFee: 0,
        notes: `Hadiah bonus ekstra referral kode ${regReferral.trim().toUpperCase()}`
      });
    }

    const newUserProfile: UserAccount = {
      name: regName.trim(),
      email: normalizedEmail,
      phone: regPhone.trim() || '+62 812-3456-7890',
      balanceIdr: bonusAmount, // Rp 20.000 atau Rp 30.000
      goldHoldingsGram: 0,     // 0 gram emas untuk pengguna baru
      dailyProfitEarnedTotal: 0,
      referralCode: `IG${Math.floor(100000 + Math.random() * 900000)}`,
      referralCount: 0,
      referralBonus: 0,
      referredBy: hasRef ? regReferral.trim().toUpperCase() : undefined,
      isKycVerified: false,
      kycStatus: 'unverified',
      kycLevel: 'Level 1 (Terdaftar)',
      biometricEnabled: true,
      signupBonusReceived: true,
      pinSet: true,
      pinCode: regPin,
      role: 'user'
    };

    // SIMPAN KE REGISTERED VAULT LOKAL (Lengkap dengan Kata Sandi untuk Login Ulang)
    saveRegisteredAccountRecord({
      email: normalizedEmail,
      password: regPassword,
      name: regName.trim(),
      phone: regPhone.trim() || undefined,
      pin: regPin,
      userProfile: newUserProfile,
      transactions: initialTransactions,
      updatedAt: Date.now()
    });

    // Coba daftarkan juga ke Firebase Auth
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, regPassword);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: regName.trim() });
      }
    } catch (authErr: any) {
      const code = authErr?.code || '';
      console.warn('Firebase register notice (account active in vault):', code, authErr);
      if (code === 'auth/email-already-in-use') {
        setIsLoading(false);
        setErrorMessage('Email ini sudah terdaftar. Silakan pindah ke tab "Masuk (Login)".');
        return;
      }
    }

    setIsLoading(false);

    onSuccess(
      normalizedEmail,
      regName.trim(),
      true, // isNewRegistration
      hasRef ? regReferral.trim().toUpperCase() : undefined,
      regPin,
      regPhone.trim() || undefined,
      regPassword,
      newUserProfile,
      initialTransactions
    );
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      setIsLoading(false);
      onSuccess(
        user.email || '',
        user.displayName || 'Investor NusantaraGold',
        false,
        undefined
      );
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Google sign in popup notice:', err);
      const code = err?.code || '';
      if (code === 'auth/unauthorized-domain') {
        setErrorMessage('Domain Vercel ini belum diizinkan di Firebase Authentication. Masuk ke Firebase Console > Authentication > Settings > Authorized domains, lalu masukkan domain vercel.app Anda.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('Jendela popup diblokir oleh browser Anda. Mohon izinkan popup untuk situs ini.');
      } else {
        setErrorMessage('Login dengan Google dibatalkan atau jendela popup ditutup. Silakan coba lagi.');
      }
    }
  };

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto'
          : 'relative min-h-screen w-full bg-[#0F0E0D] text-[#F7F5F2] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto'
      }
    >
      {/* Background with luxury gradient scrim */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${APP_IMAGES.auth_hero})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-[#0F0E0D]/90 to-[#0F0E0D] pointer-events-none" />

      {/* Centered Golden Spinner State when Loading */}
      {isLoading ? (
        <div className="relative z-20 flex flex-col items-center justify-center p-8 text-center my-auto bg-[#161412]/95 border border-[#3A3224] rounded-2xl shadow-2xl max-w-xs w-full">
          <div className="w-12 h-12 rounded-full border-2 border-[#4A3C13] border-t-[#D4AF37] animate-spin mb-4" />
          <h3 className="font-serif text-xl text-[#D4AF37]">Mengamankan Sesi</h3>
          <p className="text-xs text-[#9E978E] mt-1">Menghubungkan ke brankas emas berenkripsi NusantaraGold...</p>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md my-auto bg-[#141210]/95 border border-[#3A3224] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
          {/* Close button if modal */}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#24201A] border border-[#4A3C13] flex items-center justify-center text-[#A0988C] hover:text-[#D4AF37] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Brand Header with Official NusantaraGold Logo */}
          <div className="mb-4">
            <div className="flex items-center gap-3.5">
              <div className="relative group shrink-0">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300 pointer-events-none" />
                <img
                  src={nusantaragoldLogo}
                  alt="Logo Resmi Investasi NusantaraGold"
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-black border border-[#D4AF37]/60 shadow-xl shadow-amber-500/20"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2E2616] border border-[#D4AF37]/50 text-[11px] text-[#D4AF37] mb-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span>Platform Investasi Emas 24K BAPPEBTI</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F7F5F2] tracking-tight">
                  NusantaraGold
                </h1>
                <p className="text-[11px] text-[#A0988C] mt-0.5 leading-snug">
                  Investasi Hari Ini, Masa Depan Lebih Baik.
                </p>
              </div>
            </div>
          </div>

          {/* Luxury Navigation Tabs: Masuk vs Pendaftaran Pengguna Baru */}
          <div className="p-1 rounded-2xl bg-[#161412] border border-[#2E2820] grid grid-cols-2 gap-1.5 mb-4 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0F0E0D] shadow-md shadow-[#D4AF37]/20 font-black'
                  : 'text-[#A0988C] hover:text-[#F7F5F2]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0F0E0D] shadow-md shadow-[#D4AF37]/20 font-black'
                  : 'text-[#A0988C] hover:text-[#F7F5F2]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
              <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-[9px] font-black text-slate-950 border border-[#0F0E0D]">
                +20K
              </span>
            </button>
          </div>

          {/* TAB 1: FORM LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 animate-fade-in">
              <div>
                <label className="text-xs text-[#C2BCB3] font-medium block mb-1">
                  Alamat Email Terdaftar
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#161412] border border-[#2E2820] rounded-xl text-xs text-[#F7F5F2] focus:outline-none focus:border-[#D4AF37] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-[#C2BCB3] font-medium">Kata Sandi</label>
                  <button 
                    type="button" 
                    onClick={() => setErrorMessage('Untuk pemulihan kata sandi, silakan hubungi Live Chat Prioritas NusantaraGold atau daftar dengan email baru.')}
                    className="text-[11px] text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#161412] border border-[#2E2820] rounded-xl text-xs text-[#F7F5F2] focus:outline-none focus:border-[#D4AF37] transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C857B] hover:text-[#D4AF37] cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0F0E0D] font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 hover:opacity-95 transition"
              >
                <span>Masuk ke NusantaraGold</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Investor Demo & Register Link */}
              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('investor@nusantaragold.id');
                      setLoginPassword('nusantaragold2026');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-[#A0988C] hover:text-[#D4AF37] underline transition cursor-pointer"
                  >
                    ⚡ Coba Akun Demo Investor
                  </button>
                  <span className="text-[#3A352F] text-xs">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-[#D4AF37] hover:underline transition cursor-pointer font-medium"
                  >
                    Daftar Akun Baru
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: FORM PENDAFTARAN PENGGUNA BARU */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 animate-fade-in">
              {/* Highlight Promo Card with Official Logo Emblem */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2B2313] via-[#1E1911] to-[#161412] border-2 border-[#D4AF37]/60 shadow-lg">
                <div className="flex items-center gap-3 mb-2.5 pb-2.5 border-b border-[#3A3224]">
                  <img
                    src={nusantaragoldLogo}
                    alt="Logo Investasi NusantaraGold"
                    className="w-12 h-12 rounded-xl object-contain bg-black border border-[#D4AF37]/60 shadow-md shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                      Pendaftaran Investor Baru
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#F7F5F2] truncate">
                      Investasi NusantaraGold 24K
                    </h3>
                    <p className="text-[10px] text-[#A0988C] truncate">
                      Investasi Hari Ini, Masa Depan Lebih Baik
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold shrink-0">
                    Bonus Otomatis
                  </span>
                </div>

                <div className="space-y-1 text-xs pl-1">
                  <div className="flex items-center justify-between text-[#C2BCB3]">
                    <span>• Bonus Pendaftaran Akun Baru:</span>
                    <span className="font-bold text-amber-300">+Rp 20.000</span>
                  </div>
                  <div className="flex items-center justify-between text-[#C2BCB3]">
                    <span>• Bonus Tambahan Kode Referral:</span>
                    <span className={`font-bold ${hasReferralCode ? 'text-emerald-400' : 'text-[#8C857B]'}`}>
                      {hasReferralCode ? '+Rp 10.000 (Aktif)' : '+Rp 10.000 (Jika diisi)'}
                    </span>
                  </div>
                  <div className="pt-1.5 mt-1 border-t border-[#3A3224] flex items-center justify-between text-xs font-bold">
                    <span className="text-[#F7F5F2]">Total Saldo Awal Anda:</span>
                    <span className="text-amber-400 font-mono text-sm">
                      Rp {totalRegistrationBonus.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs text-[#C2BCB3] font-medium block mb-1">
                  Nama Lengkap (Sesuai KTP) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Budi Pratama"
                    className="w-full pl-9 pr-3 py-2 bg-[#161412] border border-[#2E2820] rounded-xl text-xs text-[#F7F5F2] focus:outline-none focus:border-[#D4AF37] transition"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-[#C2BCB3] font-medium block mb-1">
                    Email Aktif <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#161412] border border-[#2E2820] rounded-xl text-xs text-[#F7F5F2] focus:outline-none focus:border-[#D4AF37] transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#C2BCB3] font-medium block mb-1">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <PhoneCall className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+62 812..."
                      className="w-full pl-9 pr-3 py-2 bg-[#161412] border border-[#2E2820] rounded-xl text-xs text-[#F7F5F2] focus:outline-none focus:border-[#D4AF37] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Password & PIN Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-[#C2BCB3] font-medium block mb-1">
                    Kata Sandi <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 6 Karakter"
                      className="w-full pl-9 pr-8 py-2 bg-[#161412] border border-[#2E2820] rounded-xl text-xs text-[#F7F5F2] focus:outline-none focus:border-[#D4AF37] transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-[#8C857B] hover:text-[#D4AF37] cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#C2BCB3] font-medium block mb-1">
                    PIN Keamanan (6 Digit) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      maxLength={6}
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="6 Angka PIN"
                      className="w-full pl-9 pr-3 py-2 bg-[#161412] border border-[#2E2820] rounded-xl text-xs font-mono text-[#F7F5F2] focus:outline-none focus:border-[#D4AF37] transition text-center tracking-widest"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Referral Code Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[#C2BCB3] font-medium flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Kode Referral Teman (Opsional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setRegReferral('NUSANTARA99')}
                    className="text-[10px] text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Gunakan Kode: NUSANTARA99
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={regReferral}
                    onChange={(e) => setRegReferral(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode referral teman jika ada"
                    className={`w-full px-3 py-2 bg-[#161412] border rounded-xl text-xs font-mono uppercase tracking-wider text-[#F7F5F2] focus:outline-none transition ${
                      hasReferralCode ? 'border-emerald-500/80 bg-emerald-950/20' : 'border-[#2E2820] focus:border-[#D4AF37]'
                    }`}
                  />
                  {hasReferralCode && (
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>+Rp 10.000 Aktif</span>
                    </span>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Submit Registration Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0F0E0D] font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 hover:opacity-95 transition"
              >
                <span>Daftar & Klaim Rp {totalRegistrationBonus.toLocaleString('id-ID')}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          )}

          {/* Alternative Auth: Google Sign-in */}
          <div className="relative my-3.5 flex items-center justify-center">
            <div className="border-t border-[#2E2820] w-full" />
            <span className="bg-[#0F0E0D] px-2.5 text-[10px] uppercase tracking-wider text-[#736B61] shrink-0 font-medium">atau</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-xl bg-[#161412] hover:bg-[#201C18] border border-[#3A3224] text-xs font-semibold text-[#F7F5F2] transition flex items-center justify-center gap-3 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Lanjutkan dengan Akun Google</span>
          </button>

          {/* Regulatory footnote */}
          <div className="mt-4 pt-3 border-t border-[#221D17] flex items-center justify-center gap-2 text-[10px] text-[#8C857B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Terdaftar & Diawasi Resmi BAPPEBTI • Kliring Berjangka Indonesia</span>
          </div>
        </div>
      )}
    </div>
  );
};
