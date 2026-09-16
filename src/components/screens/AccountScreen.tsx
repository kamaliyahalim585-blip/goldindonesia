import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Copy, 
  Check, 
  Gift, 
  Fingerprint, 
  KeyRound, 
  HelpCircle, 
  FileText, 
  LogOut, 
  ChevronRight,
  Share2,
  UserCog,
  Sparkles,
  Building2,
  Upload,
  UserPlus,
  LogIn,
  AlertTriangle,
  Headphones,
  MessageSquareText
} from 'lucide-react';
import { UserAccount } from '../../types';
import { 
  formatIDR, 
  formatIDRNumberOnly, 
  formatGramsNumberOnly,
  BASE_BUY_PRICE 
} from '../../data/mockData';

interface AccountScreenProps {
  user: UserAccount;
  onUpdateUser: (updated: Partial<UserAccount>) => void;
  onLogout: () => void;
  onOpenAuth?: (tab?: 'login' | 'register') => void;
  onOpenProfileModal?: () => void;
  onOpenPinModal?: () => void;
  onOpenCertModal?: () => void;
  onOpenHelpModal?: () => void;
  onOpenBankModal?: () => void;
  onOpenKycModal?: () => void;
  onOpenProofTransfer?: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onOpenAuth,
  onOpenProfileModal,
  onOpenPinModal,
  onOpenCertModal,
  onOpenHelpModal,
  onOpenBankModal,
  onOpenKycModal,
  onOpenProofTransfer
}) => {
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [biometric, setBiometric] = useState(user.biometricEnabled);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const goldValueEstimate = Math.round(user.goldHoldingsGram * BASE_BUY_PRICE);
  const totalAssetsValue = user.balanceIdr + goldValueEstimate;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleShareReferral = async () => {
    const text = `Daftar akun IndoGold menggunakan kode referral saya [${user.referralCode}] dan dapatkan bonus saldo gratis hingga Rp 30.000 untuk mulai investasi emas 24K!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bonus Investasi Emas IndoGold 24K',
          text,
          url: window.location.origin
        });
      } catch (e) {
        handleCopyReferral();
      }
    } else {
      handleCopyReferral();
    }
  };

  const handleToggleBiometric = () => {
    const nextVal = !biometric;
    setBiometric(nextVal);
    onUpdateUser({ biometricEnabled: nextVal });
  };

  return (
    <div className="space-y-4 pb-28 animate-fade-in">
      {/* 1. Profile Banner with Luxurious Dark Gold Gradient */}
      <section className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/35 shadow-xl bg-gradient-to-b from-[#24201A] via-[#161412] to-[#0F0E0D] p-5 sm:p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Avatar and User Details */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4A3C13] via-[#2B2313] to-[#0F0E0D] border-2 border-[#D4AF37] flex items-center justify-center font-serif text-2xl text-[#F3E5AB] shadow-lg shadow-black/60 shrink-0">
                {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0F0E0D] flex items-center justify-center" title="Online & Terverifikasi">
                <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-xl font-bold text-[#F7F5F2] truncate">{user.name}</h2>
                <button 
                  onClick={onOpenKycModal}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-[10px] font-semibold cursor-pointer hover:border-emerald-400 transition"
                  title="Status Verifikasi KYC"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>KYC Terverifikasi</span>
                </button>
              </div>
              <p className="text-xs text-[#A0988C] mt-0.5 truncate">{user.email}</p>
              <p className="text-[11px] font-mono text-[#D4AF37] mt-0.5">{user.phone || '+62 812-3456-7890'}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenProfileModal}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0F0E0D] text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20 active:scale-95"
            >
              <UserCog className="w-4 h-4 text-[#0F0E0D] stroke-[2.4]" />
              <span>Kelola Profil</span>
            </button>
          </div>
        </div>

        {/* Quick Financial Overview Bar */}
        <div className="mt-5 pt-4 border-t border-[#2E2820] grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#0F0E0D]/80 border border-[#26211B]">
            <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block">Saldo Kas Tunai</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-bold text-[#D4AF37]">Rp</span>
              <span className="font-mono text-base font-bold text-[#F7F5F2] tabular-nums">
                {formatIDRNumberOnly(user.balanceIdr)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0F0E0D]/80 border border-[#26211B]">
            <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block">Simpanan Emas 24K</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-base font-bold text-amber-400 tabular-nums">
                {formatGramsNumberOnly(user.goldHoldingsGram)}
              </span>
              <span className="text-xs font-semibold text-[#8C857B]">gr</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#0F0E0D]/80 border border-[#26211B]">
            <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block">Total Aset Portofolio</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xs font-bold text-[#D4AF37]">Rp</span>
              <span className="font-mono text-base font-bold text-[#F3E5AB] tabular-nums">
                {formatIDRNumberOnly(totalAssetsValue)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Layanan Prioritas: Live Chat 24 Jam & Bantuan */}
      <section className="rounded-2xl bg-gradient-to-r from-[#2A2315] via-[#1E1911] to-[#161412] border border-[#D4AF37]/50 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] text-[#0F0E0D] flex items-center justify-center font-bold shadow-lg shadow-[#D4AF37]/25 shrink-0">
                <Headphones className="w-6 h-6 stroke-[2.3]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#161412]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#F7F5F2]">Live Chat Prioritas 24 Jam</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-xs text-[#C2BCB3] mt-0.5">
                Bicara langsung dengan staf CS IndoGold dalam aplikasi (Respon instan)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenHelpModal}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0F0E0D] text-xs font-bold hover:brightness-110 active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/25 shrink-0"
          >
            <MessageSquareText className="w-4 h-4 stroke-[2.4]" />
            <span>Mulai Chat</span>
          </button>
        </div>
      </section>

      {/* 3. Linked Bank Account Card & Bukti Transfer in clean compact layout */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Rekening Pencairan */}
        <div className="rounded-2xl bg-[#161412] border border-[#2E2820] p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">Rekening Penarikan</span>
            </div>
            <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
              Terverifikasi
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F0E0D] border border-[#26211B]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2E2616] to-[#1A1814] border border-[#D4AF37]/40 flex items-center justify-center font-mono font-bold text-[11px] text-[#F3E5AB] shrink-0">
                BCA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#F7F5F2] truncate">BCA • 8271 •••• 8821</p>
                <p className="text-[10px] text-[#A0988C] truncate">a.n. {user.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenBankModal}
              className="py-1 px-2.5 rounded-lg bg-[#24201A] border border-[#3D3528] text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0E0D] transition cursor-pointer shrink-0"
            >
              Ubah
            </button>
          </div>
        </div>

        {/* Kirim Bukti Transfer Manual */}
        <div className="rounded-2xl bg-[#161412] border border-[#2E2820] p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">Konfirmasi Deposit</span>
            </div>
            <span className="text-[10px] text-[#F3E5AB] bg-[#2E2616] px-2 py-0.5 rounded-full border border-[#D4AF37]/35 font-semibold">
              Permata & OVO
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F0E0D] border border-[#26211B]">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-[#F7F5F2]">Kirim Bukti Transfer</p>
              <p className="text-[10px] text-[#A0988C] truncate">Unggah struk setor via transfer bank</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onOpenProofTransfer) onOpenProofTransfer();
              }}
              className="py-1.5 px-3 rounded-lg bg-[#2E2616] border border-[#D4AF37]/40 text-xs font-bold text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0F0E0D] transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Unggah</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Referral Code Luxury Card with Bonus Rules */}
      <section className="relative rounded-2xl bg-[#161412] border border-[#D4AF37]/35 p-4 sm:p-5 overflow-hidden shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2E2616] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] block">Program Referral Pengguna Baru</span>
              <span className="text-[10px] text-[#A0988C]">Daftar dapat Rp 20.000 • Pakai referral +Rp 10.000</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#2E2616] text-[#F3E5AB] border border-[#D4AF37]/40">
            Bonus Berlipat
          </span>
        </div>

        {/* Promo summary text */}
        <div className="mt-2.5 p-2.5 rounded-xl bg-[#0F0E0D] border border-[#26211B] text-[11px] text-[#C2BCB3] leading-relaxed">
          Bagikan kode referral Anda ke rekan atau kerabat. Pengguna baru otomatis menerima <strong className="text-amber-300">Rp 20.000</strong> saat mendaftar, dan tambahan <strong className="text-emerald-400">+Rp 10.000</strong> jika memasukkan kode Anda (Total <strong className="text-[#F3E5AB]">Rp 30.000</strong>). Anda juga menerima bonus <strong className="text-[#D4AF37]">Rp 10.000</strong> per teman terdaftar!
        </div>

        {/* Referral Copy Box */}
        <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-[#1A1814] border border-[#3A3224]">
          <div>
            <span className="text-[9px] text-[#8C857B] uppercase tracking-wider block">Kode Referral Anda</span>
            <span className="font-mono text-base font-bold tracking-widest text-[#F7F5F2] mt-0.5 block">
              {user.referralCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReferral}
              className="py-1.5 px-3 rounded-lg bg-[#2E2616] border border-[#4A4033] text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0F0E0D] transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              {copiedReferral ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
            <button
              onClick={handleShareReferral}
              className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0F0E0D] font-bold hover:opacity-95 transition flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Bagikan</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 pt-2.5 border-t border-[#262018] flex items-center justify-between text-xs text-[#A0988C]">
          <span>Teman Tergabung: <strong className="text-[#F7F5F2] font-mono">{user.referralCount || 3} Orang</strong></span>
          <span className="text-[#D4AF37] font-semibold font-mono">
            Total Bonus Diterima: +{formatIDR((user.referralCount || 3) * 10000)}
          </span>
        </div>
      </section>

      {/* 5. Menu Keamanan & Pengaturan Akun (Cohesive IndoGold Theme) */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C857B] px-1">
          Keamanan & Proteksi Transaksi
        </h3>

        <div className="rounded-2xl bg-[#161412] border border-[#2E2820] divide-y divide-[#24201B] overflow-hidden shadow-lg">
          {/* Biometric Toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E2616] to-[#1A1814] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37]">
                <Fingerprint className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F7F5F2]">Biometrik (Face ID / Sidik Jari)</h4>
                <p className="text-[10px] text-[#A0988C]">Otentikasi biometrik cepat untuk otorisasi transaksi</p>
              </div>
            </div>
            <button
              onClick={handleToggleBiometric}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                biometric ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] shadow-sm shadow-[#D4AF37]/30' : 'bg-[#26231F] border border-[#4A433D]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#0F0E0D] absolute top-1 transition-transform ${
                  biometric ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* PIN Keamanan 6-Digit */}
          <div 
            onClick={onOpenPinModal}
            className="p-4 flex items-center justify-between hover:bg-[#1E1A16] transition cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E2616] to-[#1A1814] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                <KeyRound className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#F7F5F2] group-hover:text-[#D4AF37] transition-colors">
                    PIN Transaksi (6 Digit)
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#2E2616] text-[#F3E5AB] border border-[#D4AF37]/30">
                    Wajib Penarikan & Profil
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
                  Status: Aktif & Terenkripsi SHA-256
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#D4AF37] bg-[#2E2616]/80 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                Ganti PIN
              </span>
              <ChevronRight className="w-4 h-4 text-[#8C857B] group-hover:text-[#D4AF37] transition" />
            </div>
          </div>

          {/* Edit Profil Detail Lengkap */}
          <div 
            onClick={onOpenProfileModal}
            className="p-4 flex items-center justify-between hover:bg-[#1E1A16] transition cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E2616] to-[#1A1814] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                <UserCog className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F7F5F2] group-hover:text-[#D4AF37] transition-colors">
                  Data Investor & NPWP
                </h4>
                <p className="text-[10px] text-[#A0988C]">Perbarui NIK, NPWP & alamat domisili (Verifikasi PIN 6-Digit)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#D4AF37] bg-[#2E2616]/80 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                Ubah Data
              </span>
              <ChevronRight className="w-4 h-4 text-[#8C857B] group-hover:text-[#D4AF37] transition" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Layanan Cetak Fisik & Akun */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8C857B] px-1">
          Layanan Fisik & Akun
        </h3>

        <div className="rounded-2xl bg-[#161412] border border-[#2E2820] divide-y divide-[#24201B] overflow-hidden shadow-lg">
          {/* Sertifikat Fisik Emas */}
          <div 
            onClick={onOpenCertModal}
            className="p-4 flex items-center justify-between hover:bg-[#1E1A16] transition cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E2616] to-[#1A1814] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F7F5F2] group-hover:text-[#D4AF37] transition-colors">
                  Cetak Sertifikat & Tarik Emas Fisik
                </h4>
                <p className="text-[10px] text-[#A0988C]">Pengiriman emas batangan asli ANTAM/UBS berasuransi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#D4AF37] bg-[#2E2616]/80 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                Tarik Fisik
              </span>
              <ChevronRight className="w-4 h-4 text-[#8C857B] group-hover:text-[#D4AF37] transition" />
            </div>
          </div>

          {/* Live Chat Bantuan Buka Modal */}
          <div 
            onClick={onOpenHelpModal}
            className="p-4 flex items-center justify-between hover:bg-[#1E1A16] transition cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E2616] to-[#1A1814] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#F7F5F2] group-hover:text-[#D4AF37] transition-colors">
                    Live Chat Customer Service 24/7
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-[#A0988C]">Hubungi staf bantuan langsung di dalam aplikasi (tanpa WhatsApp/Email)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#D4AF37] bg-[#2E2616]/80 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                Buka Chat
              </span>
              <ChevronRight className="w-4 h-4 text-[#8C857B] group-hover:text-[#D4AF37] transition" />
            </div>
          </div>

          {/* Ganti Akun / Masuk / Daftar Akun Baru */}
          <div 
            onClick={() => {
              if (onOpenAuth) onOpenAuth('register');
            }}
            className="p-4 flex items-center justify-between hover:bg-[#1E1A16] transition cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E2616] to-[#1A1814] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition-transform">
                <UserPlus className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F7F5F2] group-hover:text-[#D4AF37] transition-colors">
                  Ganti Akun atau Buka Akun Baru
                </h4>
                <p className="text-[10px] text-[#A0988C]">Masuk dengan akun lain atau daftarkan akun baru (Bonus s.d Rp 30.000)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#F3E5AB] bg-[#2E2616] px-2 py-0.5 rounded border border-[#D4AF37]/40">
                Login / Daftar
              </span>
              <ChevronRight className="w-4 h-4 text-[#8C857B] group-hover:text-[#D4AF37] transition" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. Logout Button (Sleek Obsidian Reducer) */}
      <button
        type="button"
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full py-3.5 px-4 rounded-xl bg-[#1A1615] border border-rose-500/30 text-rose-300 hover:bg-rose-950/30 hover:border-rose-500/50 transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer shadow-md"
      >
        <LogOut className="w-4 h-4 text-rose-400 stroke-[2.4]" />
        <span>Keluar dari Sesi IndoGold</span>
      </button>

      {/* In-App Logout Confirmation Modal (Avoids iframe window.confirm block) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#161412] border border-[#3A3224] p-5 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0 shadow-md">
                <LogOut className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#F7F5F2]">Keluar dari Sesi?</h3>
                <p className="text-[11px] text-[#A0988C]">Konfirmasi pengakhiran sesi akun IndoGold Anda</p>
              </div>
            </div>

            <p className="text-xs text-[#C2BCB3] leading-relaxed bg-[#0F0E0D] p-3 rounded-xl border border-[#26211B]">
              Saldo kas, simpanan emas 24K, dan riwayat transaksi Anda tersimpan aman. Setelah keluar sesi, Anda akan langsung diarahkan ke menu pendaftaran akun baru.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#26211B] text-[#C2BCB3] text-xs font-bold hover:bg-[#332C24] hover:text-white transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold hover:brightness-110 transition cursor-pointer shadow-md shadow-rose-900/30"
              >
                Ya, Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Version Info & Regulatory Stamping */}
      <div className="text-center pt-2 space-y-1">
        <p className="text-[10px] text-[#A0988C]/80 font-medium">
          IndoGold Bullion App v2.5.0 • Luxe 24K Edition
        </p>
        <p className="text-[9px] text-[#787168]">
          Terdaftar & Diawasi Resmi oleh BAPPEBTI No. 002/BAPPEBTI/CP-EMAS & ICDX Kliring Berjangka
        </p>
      </div>
    </div>
  );
};
