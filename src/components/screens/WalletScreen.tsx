import React, { useState } from 'react';
import { 
  PlusCircle, 
  WalletCards, 
  Check, 
  Building2, 
  Smartphone, 
  AlertCircle,
  Copy,
  ShieldCheck,
  ArrowLeft,
  Upload,
  Search,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronDown,
  X,
  Users,
  Share2,
  Lock,
  Unlock,
  Gift
} from 'lucide-react';
import { Transaction, UserAccount, WalletActionType } from '../../types';
import { 
  OFFICIAL_DEPOSIT_METHODS, 
  ALL_INDONESIAN_BANKS, 
  ALL_INDONESIAN_EWALLETS, 
  FinancialInstitution,
  formatIDR, 
  formatIDRNumberOnly 
} from '../../data/mockData';
import { ProofTransferModal } from '../ProofTransferModal';
import { PinVerificationModal } from '../PinVerificationModal';

interface WalletScreenProps {
  user: UserAccount;
  initialAction?: WalletActionType;
  onCompleteTransaction: (transaction: Transaction, newBalance: number, newGoldHoldings: number) => void;
  onBack?: () => void;
  onShowToast?: (msg: string) => void;
  onUpdateUser?: (updated: Partial<UserAccount>) => void;
}

const QUICK_AMOUNTS = [100000, 500000, 1000000, 5000000, 10000000];

export const WalletScreen: React.FC<WalletScreenProps> = ({
  user,
  initialAction = 'deposit',
  onCompleteTransaction,
  onBack,
  onShowToast,
  onUpdateUser
}) => {
  const [actionType, setActionType] = useState<WalletActionType>(initialAction);
  const [amountStr, setAmountStr] = useState<string>('1000000');
  
  // Deposit specific state
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<'permata' | 'ovo'>('permata');
  const [showProofModal, setShowProofModal] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Withdrawal specific state (All Indonesian Banks & E-wallets)
  const [withdrawalCategory, setWithdrawalCategory] = useState<'all' | 'bank' | 'ewallet'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<FinancialInstitution>(ALL_INDONESIAN_BANKS[0]);
  const [destinationAccount, setDestinationAccount] = useState<string>('8271 0812 3456');
  const [accountHolderName, setAccountHolderName] = useState<string>(user.name || '');
  const [showMinWithdrawalNotice, setShowMinWithdrawalNotice] = useState<boolean>(false);
  const [showReferralLockedNotice, setShowReferralLockedNotice] = useState<boolean>(false);
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Real-time Referral Target Calculation: Minimal 10 orang terdaftar
  const currentReferrals = user.referralCount ?? 0;
  const isWithdrawalUnlocked = currentReferrals >= 10;
  const remainingReferralsNeeded = Math.max(0, 10 - currentReferrals);
  const referralProgressPct = Math.min(100, Math.round((currentReferrals / 10) * 100));

  const handleSimulateAddReferral = () => {
    const nextCount = currentReferrals + 1;
    if (onUpdateUser) {
      onUpdateUser({ referralCount: nextCount });
    }
    if (onShowToast) {
      onShowToast(`Simulasi Demo: +1 Teman baru terdaftar! Total undangan: ${nextCount}/10.`);
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(user.referralCode || 'NGOLD2026');
    setCopiedReferral(true);
    if (onShowToast) {
      onShowToast(`Kode referral ${user.referralCode} berhasil disalin!`);
    }
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleShareReferral = () => {
    const shareText = `Halo! Yuk gabung investasi emas batangan 24K berizin di NusantaraGold. Dapatkan bonus pendaftaran hingga Rp 30.000 dan komisi referral 3%! Gunakan kode undangan saya: ${user.referralCode || 'NGOLD2026'}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const parsedAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;

  const handleQuickAmount = (val: number) => {
    setAmountStr(val.toLocaleString('id-ID'));
    setErrorMessage(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanStr = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr, 10);
    if (!isNaN(num)) {
      setAmountStr(num.toLocaleString('id-ID'));
    } else {
      setAmountStr('');
    }
    setErrorMessage(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onShowToast) {
      onShowToast(`Nomor ${id === 'permata' ? 'Bank Permata' : 'OVO'} (${text}) berhasil disalin!`);
    }
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Combine all Indonesian institutions for withdrawal
  const allInstitutions: FinancialInstitution[] = [
    ...ALL_INDONESIAN_BANKS,
    ...ALL_INDONESIAN_EWALLETS
  ];

  const filteredInstitutions = allInstitutions.filter((item) => {
    const matchesCategory = 
      withdrawalCategory === 'all' || 
      (withdrawalCategory === 'bank' && item.type === 'bank') ||
      (withdrawalCategory === 'ewallet' && item.type === 'ewallet');

    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleWithdrawalSubmit = () => {
    // Syarat Target Undang Teman: Minimal 10 orang terdaftar
    if (currentReferrals < 10) {
      const lockMsg = `Penarikan Terkunci: Sesuai regulasi platform, Anda wajib mengundang minimal 10 orang terdaftar sebelum penarikan dana dibuka (saat ini ${currentReferrals}/10 teman, kurang ${remainingReferralsNeeded} teman lagi).`;
      setErrorMessage(lockMsg);
      setShowReferralLockedNotice(true);
      if (onShowToast) {
        onShowToast(`Penarikan terkunci: Wajib mengundang minimal 10 teman (${currentReferrals}/10).`);
      }
      return;
    }

    if (parsedAmount < 100000) {
      const minMsg = 'Syarat Penarikan: Nominal penarikan dana minimal adalah Rp 100.000.';
      setErrorMessage(minMsg);
      setShowMinWithdrawalNotice(true);
      if (onShowToast) {
        onShowToast('Pemberitahuan Sistem: Syarat penarikan dana tunai minimal adalah Rp 100.000');
      }
      return;
    }

    if (parsedAmount > user.balanceIdr) {
      setErrorMessage(`Saldo kas Anda (${formatIDR(user.balanceIdr)}) tidak mencukupi untuk penarikan sebesar ${formatIDR(parsedAmount)}.`);
      return;
    }

    if (!destinationAccount.trim()) {
      setErrorMessage('Harap masukkan nomor rekening bank atau nomor ponsel e-wallet tujuan.');
      return;
    }

    if (!accountHolderName.trim()) {
      setErrorMessage('Harap masukkan nama lengkap pemilik rekening / akun penerima.');
      return;
    }

    setErrorMessage(null);
    // Buka dialog verifikasi PIN 6-digit keamanan ekstra
    setShowPinModal(true);
  };

  const handlePinVerifiedSuccess = () => {
    setShowPinModal(false);
    setIsProcessing(true);

    setTimeout(() => {
      const newBalance = user.balanceIdr - parsedAmount;
      const txId = `WD-${Math.floor(10000 + Math.random() * 90000)}`;

      const newTx: Transaction = {
        id: txId,
        category: 'tarik',
        title: `Penarikan ke ${selectedDestination.name}`,
        amountIdr: parsedAmount,
        date: 'Hari ini, Baru saja',
        timestamp: Date.now(),
        status: 'Pending',
        paymentMethod: `${selectedDestination.name} • ${destinationAccount.trim()}`,
        recipientName: accountHolderName.trim(),
        senderName: user.name,
        senderAccount: user.email,
        taxOrFee: 0,
        notes: `Penarikan saldo kas ke ${selectedDestination.name} nomor ${destinationAccount.trim()} a.n. ${accountHolderName.trim()} (${user.email || 'Pengguna'})`
      };

      setIsProcessing(false);
      onCompleteTransaction(newTx, newBalance, user.goldHoldingsGram);
      if (onShowToast) {
        onShowToast(`Permohonan penarikan ${formatIDR(parsedAmount)} ke ${selectedDestination.name} terverifikasi & diajukan!`);
      }
    }, 700);
  };

  const handleProofUploaded = (newTx: Transaction, amount: number) => {
    setShowProofModal(false);
    // Add transaction to history
    onCompleteTransaction(newTx, user.balanceIdr, user.goldHoldingsGram);
  };

  const activeDepositMethodObj = OFFICIAL_DEPOSIT_METHODS.find((m) => m.id === selectedDepositMethod) || OFFICIAL_DEPOSIT_METHODS[0];

  return (
    <div className="relative pb-32 animate-fade-in text-left">
      {/* Back button if opened from home action */}
      {onBack && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] hover:text-[#F3E5AB] transition cursor-pointer py-1.5 px-3 rounded-xl bg-[#1A1816] border border-[#2E2820]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </button>
          <span className="text-[11px] text-[#A0988C]">Dompet & Saldo Kas</span>
        </div>
      )}

      {/* Tab Switcher: Deposit vs Tarik */}
      <div className="flex p-1.5 bg-[#141210] rounded-2xl border border-[#2E2820] mb-5 shadow-lg">
        <button
          onClick={() => {
            setActionType('deposit');
            setErrorMessage(null);
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            actionType === 'deposit'
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border border-emerald-300 shadow-md shadow-emerald-950/60 scale-[1.02]'
              : 'text-[#9E978E] hover:text-[#F7F5F2] hover:bg-white/5'
          }`}
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Deposit Saldo</span>
        </button>

        <button
          onClick={() => {
            setActionType('tarik');
            setErrorMessage(null);
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            actionType === 'tarik'
              ? 'bg-gradient-to-r from-purple-500 via-fuchsia-600 to-pink-600 text-white border border-purple-300 shadow-md shadow-purple-950/60 scale-[1.02]'
              : 'text-[#9E978E] hover:text-[#F7F5F2] hover:bg-white/5'
          }`}
        >
          <WalletCards className="w-4 h-4 stroke-[2.5]" />
          <span>Tarik Saldo</span>
        </button>
      </div>

      {/* Balance overview card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#1A1816] via-[#141210] to-[#12110F] border border-[#2E2820] flex items-center justify-between mb-5 shadow-sm">
        <div>
          <span className="text-[10px] text-[#A0988C] uppercase tracking-wider block font-semibold">
            Saldo Kas Tersedia
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-sm font-bold text-[#D4AF37]">Rp</span>
            <span className="font-mono text-2xl font-bold text-[#F7F5F2] tabular-nums">
              {formatIDRNumberOnly(user?.balanceIdr || 0)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 block">
            Bebas Biaya Admin (0%)
          </span>
          <span className="text-[9px] text-[#8C857B] mt-1 block">Kliring Instan 24 Jam</span>
        </div>
      </div>

      {/* =======================
          SECTION 1: DEPOSIT FLOW (Hanya Bank Permata & OVO)
      ======================= */}
      {actionType === 'deposit' && (
        <div className="space-y-5">
          {/* Quick Notice Banner */}
          <div className="p-3.5 rounded-xl bg-[#1B241C] border border-emerald-500/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300 block">Metode Deposit Resmi NusantaraGold</span>
              <p className="text-[#C5D9C8] mt-0.5 leading-relaxed">
                Deposit saldo tunai hanya dilayani melalui rekening resmi <strong>Bank Permata</strong> dan akun <strong>OVO</strong> atas nama <strong>muhammad yusuf amiinuddiin</strong>.
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <section className="bg-[#161412] rounded-2xl border border-[#2E2820] p-4 sm:p-5 space-y-4 shadow-md">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#F7F5F2]">
                Rencana Nominal Deposit (IDR)
              </label>
              <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                Min. Rp 10.000
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#D4AF37]">
                Rp
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3.5 bg-[#0F0E0D] border border-[#2E2820] rounded-xl text-[#F7F5F2] text-xl font-mono font-bold focus:outline-none focus:border-amber-400 transition tabular-nums"
              />
            </div>

            {/* Quick Amount Chips */}
            <div>
              <span className="text-[11px] font-semibold text-[#A0988C] uppercase tracking-wider block mb-2">Pilihan Cepat Nominal:</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((val) => {
                  const isAmountSelected = parsedAmount === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isAmountSelected
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 border-2 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-105'
                          : 'bg-[#1E1B17] text-[#EAE6E1] border border-[#332C24] hover:border-amber-400/50 hover:bg-white/5'
                      }`}
                    >
                      {val >= 1000000 ? `${val / 1000000} Juta` : `${val / 1000} Ribu`}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Destination Official Channel Selection (Bank Permata & OVO) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Pilih Saluran Pembayaran Resmi
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold">Tersedia 2 Opsi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {OFFICIAL_DEPOSIT_METHODS.map((method) => {
                const isSelected = selectedDepositMethod === method.id;
                const isPermata = method.id === 'permata';

                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedDepositMethod(method.id as 'permata' | 'ovo')}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border text-left ${
                      isSelected
                        ? isPermata
                          ? 'bg-gradient-to-b from-[#18291F] via-[#101F15] to-[#0D1710] border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/80 scale-[1.01]'
                          : 'bg-gradient-to-b from-[#25172E] via-[#1A1021] to-[#120B17] border-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/80 scale-[1.01]'
                        : 'bg-[#161412] border-[#2E2820] hover:border-[#4A4033]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-md ${
                          isPermata ? 'bg-[#007A33]' : 'bg-[#4C2A86]'
                        }`}>
                          {isPermata ? 'PERM' : 'OVO'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#F7F5F2]">{method.name}</h4>
                          <span className="text-[10px] font-semibold text-emerald-400">{method.badge}</span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? isPermata ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-purple-400 bg-purple-400 text-slate-950'
                          : 'border-[#4A433D]'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Account number box with copy button */}
                    <div className="mt-4 p-3 rounded-xl bg-[#0F0E0D] border border-[#26211B] flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#8C857B] block">
                          {isPermata ? 'Nomor Rekening Permata' : 'Nomor Ponsel Akun OVO'}
                        </span>
                        <span className="font-mono text-base font-bold tracking-wider text-[#F7F5F2]">
                          {method.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(method.accountNumber, method.id);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-[#24201A] border border-[#3D3528] text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        {copiedId === method.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Account Holder Name */}
                    <div className="mt-2.5 flex items-center justify-between text-xs px-1">
                      <span className="text-[#8C857B]">Nama Penerima:</span>
                      <span className="font-mono font-bold text-[#F3E5AB]">
                        {method.accountName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Transfer Instructions Box */}
          <section className="rounded-2xl bg-[#161412] border border-[#2E2820] p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#D4AF37]" />
              Panduan Transfer {activeDepositMethodObj.name}:
            </h4>
            <ol className="space-y-2 text-xs text-[#A0988C] list-decimal list-inside leading-relaxed">
              {activeDepositMethodObj.instructions.map((step, idx) => (
                <li key={idx} className="pl-1">
                  <span className="text-[#EAE6E1]">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Prominent Upload Proof Action Card */}
          <section className="rounded-2xl bg-gradient-to-r from-[#241F18] via-[#1B1712] to-[#161412] border-2 border-dashed border-[#D4AF37]/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <Upload className="w-6 h-6 stroke-[2.3]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F7F5F2]">Sudah Melakukan Transfer?</h4>
                <p className="text-xs text-[#A0988C] mt-0.5">
                  Kirim foto atau screenshot struk transfer untuk proses verifikasi kilat (1-3 menit).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowProofModal(true)}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 text-xs font-bold tracking-wide uppercase hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 shrink-0 active:scale-95"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Kirim Bukti Transfer</span>
            </button>
          </section>
        </div>
      )}

      {/* =======================
          SECTION 2: WITHDRAWAL FLOW (Semua Bank & E-Wallet di Indonesia)
      ======================= */}
      {actionType === 'tarik' && (
        <div className="space-y-5">
          {/* Target Undang Teman Realtime: Minimal 10 Orang + Bonus 3% Deposit */}
          <section className={`rounded-2xl border p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all ${
            isWithdrawalUnlocked 
              ? 'bg-gradient-to-r from-emerald-950/40 via-[#181613] to-[#12100E] border-emerald-500/50 shadow-emerald-500/10'
              : 'bg-gradient-to-r from-purple-950/50 via-[#1E1815] to-[#141210] border-purple-500/60 shadow-purple-500/15'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2C241B]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  isWithdrawalUnlocked
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                }`}>
                  <Users className="w-5 h-5 stroke-[2.3]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#F7F5F2]">
                      Target Undang Teman (Syarat Penarikan)
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#A0988C]">
                    Wajib minimal 10 teman terdaftar untuk membuka akses pencairan dana
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto">
                {isWithdrawalUnlocked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold shadow-sm">
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Syarat Terpenuhi (Terbuka)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/90 border border-purple-500/60 text-purple-300 text-xs font-bold shadow-sm">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Terkunci (Kurang {remainingReferralsNeeded} Orang)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Realtime Progress Bar */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A0988C]">
                  Progress Real-Time: <strong className="text-[#F7F5F2] font-mono">{currentReferrals} / 10 Teman</strong>
                </span>
                <span className={`font-mono font-bold ${isWithdrawalUnlocked ? 'text-emerald-400' : 'text-purple-300'}`}>
                  {referralProgressPct}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0D0C0B] border border-[#2B231A] overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isWithdrawalUnlocked 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500'
                  }`}
                  style={{ width: `${referralProgressPct}%` }}
                />
              </div>
            </div>

            {/* Bonus 3% Explanation Card */}
            <div className="mt-3.5 p-3 rounded-xl bg-[#0D0C0B] border border-[#2B241A] flex items-start gap-2.5">
              <Gift className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11.5px] text-[#C2BCB3] leading-relaxed">
                <strong className="text-amber-300 font-semibold">Bonus Komisi 3% Real-time:</strong> Setiap teman yang Anda undang melakukan <span className="text-white font-semibold">deposit minimal Rp 500.000</span>, Anda otomatis menerima komisi tunai <strong className="text-emerald-400">3%</strong> dari nominal deposit langsung ke saldo kas Anda!
                <div className="mt-1 text-[10px] text-[#8C857B] font-mono">
                  Contoh: Teman deposit Rp 500.000 &rarr; Bonus Anda Rp 15.000 | Deposit Rp 10.000.000 &rarr; Bonus Anda Rp 300.000
                </div>
              </div>
            </div>

            {/* Referral Tools Bar: Copy Code + WhatsApp Share + Test Simulator */}
            <div className="mt-3.5 pt-3 border-t border-[#262018] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8C857B]">Kode Anda:</span>
                <span className="px-2 py-0.5 rounded-lg bg-[#1F1B16] border border-[#3E3424] font-mono text-xs font-bold text-amber-300">
                  {user.referralCode || 'NGOLD2026'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className="py-1 px-2.5 rounded-lg bg-[#2A2318] hover:bg-[#362C1E] text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedReferral ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedReferral ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShareReferral}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Ajak Teman</span>
                </button>

                {/* Simulator Tambah Teman (Mempermudah Pengujian/Demo) */}
                <button
                  type="button"
                  onClick={handleSimulateAddReferral}
                  className="py-1 px-2.5 rounded-xl bg-[#201D1A] hover:bg-[#2B2723] border border-[#3A3226] text-[#A0988C] hover:text-[#F7F5F2] text-[10.5px] font-medium transition cursor-pointer"
                  title="Simulasi tambah 1 referral untuk kemudahan uji coba penarikan"
                >
                  <span>+1 Demo</span>
                </button>
              </div>
            </div>
          </section>

          {/* Amount Input */}
          <section className="bg-[#161412] rounded-2xl border border-[#2E2820] p-4 sm:p-5 space-y-4 shadow-md">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#F7F5F2]">
                Nominal Penarikan Dana (IDR)
              </label>
              <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                Min. Rp 100.000
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-400">
                Rp
              </span>
              <input
                type="text"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3.5 bg-[#0F0E0D] border border-[#2E2820] rounded-xl text-[#F7F5F2] text-xl font-mono font-bold focus:outline-none focus:border-purple-400 transition tabular-nums"
              />
            </div>

            {/* Live Warning if below Rp 100.000 */}
            {parsedAmount > 0 && parsedAmount < 100000 && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between gap-2 animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">
                    Syarat penarikan minimal: <strong>Rp 100.000</strong> (Kurang {formatIDR(100000 - parsedAmount)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(100000)}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white text-[11px] font-bold shrink-0 hover:brightness-110 transition cursor-pointer"
                >
                  Ubah Rp 100.000
                </button>
              </div>
            )}

            {/* Quick Amount Chips */}
            <div>
              <span className="text-[11px] font-semibold text-[#A0988C] uppercase tracking-wider block mb-2">Pilihan Cepat Nominal:</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((val) => {
                  const isAmountSelected = parsedAmount === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isAmountSelected
                          ? 'bg-gradient-to-r from-purple-400 to-fuchsia-500 text-slate-950 border-2 border-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.35)] scale-105'
                          : 'bg-[#1E1B17] text-[#EAE6E1] border border-[#332C24] hover:border-purple-400/50 hover:bg-white/5'
                      }`}
                    >
                      {val >= 1000000 ? `${val / 1000000} Juta` : `${val / 1000} Ribu`}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border-2 border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
          </section>

          {/* Complete Destination Institution Selector (All Indonesian Banks & E-wallets) */}
          <section className="rounded-2xl bg-[#161412] border border-[#2E2820] p-4 sm:p-5 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Pilih Bank / E-Wallet Tujuan Penarikan
              </label>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#0F0E0D] p-1 rounded-xl border border-[#2E2820] text-[10px] self-start sm:self-auto">
                <button
                  onClick={() => setWithdrawalCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    withdrawalCategory === 'all'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-[#9E978E] hover:text-[#F7F5F2]'
                  }`}
                >
                  Semua (40+)
                </button>
                <button
                  onClick={() => setWithdrawalCategory('bank')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    withdrawalCategory === 'bank'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-[#9E978E] hover:text-[#F7F5F2]'
                  }`}
                >
                  Bank (30+ Bank)
                </button>
                <button
                  onClick={() => setWithdrawalCategory('ewallet')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                    withdrawalCategory === 'ewallet'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-[#9E978E] hover:text-[#F7F5F2]'
                  }`}
                >
                  E-Wallet (Semua)
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama bank / e-wallet (BCA, Mandiri, BRI, BSI, Permata, GoPay, OVO, DANA...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Scrollable grid of institutions */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-[#24201B] rounded-xl p-2 bg-[#0F0E0D]">
              {filteredInstitutions.length > 0 ? (
                filteredInstitutions.map((item) => {
                  const isSelected = selectedDestination.id === item.id;
                  const isBank = item.type === 'bank';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDestination(item)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#2B1B33] to-[#1A1220] border border-purple-400 text-white'
                          : 'bg-[#161412] hover:bg-[#201C18] text-[#EAE6E1] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isBank 
                            ? 'bg-[#005EAA]/25 text-sky-400 border border-sky-500/30' 
                            : 'bg-purple-950/40 text-purple-300 border border-purple-500/30'
                        }`}>
                          {item.code.slice(0, 4)}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-[#F7F5F2] truncate">{item.name}</h5>
                          <span className="text-[10px] text-[#8C857B]">{item.categoryName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.popular && (
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30">
                            Populer
                          </span>
                        )}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-[#4A433D]'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-[#8C857B]">
                  Tidak ada bank atau e-wallet yang cocok dengan kata kunci pencarian.
                </div>
              )}
            </div>

            {/* Account Details Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-[#F7F5F2] block mb-1">
                  Nomor Rekening / Nomor Ponsel E-Wallet <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  placeholder="Contoh: 8271009182 atau 0812xxxx"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs font-mono font-bold text-[#F7F5F2] focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#F7F5F2] block mb-1">
                  Nama Pemilik Rekening / Akun Penerima <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Nama lengkap sesuai KTP / Buku Tabungan"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Information pill */}
            <div className="p-3 rounded-xl bg-[#141210] border border-[#26211B] flex items-center justify-between text-xs text-[#A0988C]">
              <span>Tujuan Penarikan: <strong className="text-[#F7F5F2]">{selectedDestination.name}</strong></span>
              <span className="text-emerald-400 font-bold">Biaya Admin: Rp 0 (Gratis)</span>
            </div>
          </section>
        </div>
      )}

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-16 left-0 right-0 z-30 p-4 bg-gradient-to-t from-[#0F0E0D] via-[#0F0E0D]/95 to-transparent backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {actionType === 'deposit' ? (
            <>
              <button
                onClick={() => setShowProofModal(true)}
                className="flex-1 py-4 px-4 rounded-2xl text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 border-2 border-amber-300 active:scale-[0.99]"
              >
                <Upload className="w-4 h-4 stroke-[2.5]" />
                <span>Kirim Bukti Transfer ({formatIDR(parsedAmount)})</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleWithdrawalSubmit}
              disabled={isProcessing || parsedAmount <= 0}
              className={`w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl ${
                isProcessing || parsedAmount <= 0
                  ? 'bg-[#201D1A] text-[#7E776E] border border-[#2E2820] cursor-not-allowed'
                  : !isWithdrawalUnlocked
                  ? 'bg-gradient-to-r from-purple-900 to-indigo-950 text-purple-200 border-2 border-purple-500/50 hover:border-purple-400 active:scale-[0.99]'
                  : 'bg-gradient-to-r from-purple-500 via-fuchsia-600 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-[0_4px_25px_rgba(168,85,247,0.45)] border-2 border-purple-300 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  <span>Memproses Penarikan Dana...</span>
                </>
              ) : !isWithdrawalUnlocked ? (
                <>
                  <Lock className="w-5 h-5 text-purple-400 stroke-[2.5]" />
                  <span>Penarikan Terkunci (Wajib 10 Teman: {currentReferrals}/10)</span>
                </>
              ) : (
                <>
                  <WalletCards className="w-5 h-5 stroke-[2.5]" />
                  <span>Ajukan Penarikan Tunai ({formatIDR(parsedAmount)})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Proof of Transfer Modal */}
      {showProofModal && (
        <ProofTransferModal
          user={user}
          initialAmount={parsedAmount > 0 ? parsedAmount : 1000000}
          initialMethodId={selectedDepositMethod}
          onClose={() => setShowProofModal(false)}
          onSubmitProof={handleProofUploaded}
          onShowToast={onShowToast}
        />
      )}

      {/* 6-Digit PIN Security Verification for Withdrawal */}
      <PinVerificationModal
        isOpen={showPinModal}
        title="Otorisasi Penarikan Saldo"
        subtitle={`Masukkan 6 digit PIN Anda untuk mencairkan ${formatIDR(parsedAmount)} ke ${selectedDestination.name} (${destinationAccount})`}
        expectedPin={user.pinCode || '123456'}
        biometricEnabled={user.biometricEnabled}
        onSuccess={handlePinVerifiedSuccess}
        onClose={() => setShowPinModal(false)}
      />

      {/* Modal Notifikasi Syarat Penarikan Dana Minimal Rp 100.000 */}
      {showMinWithdrawalNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#161412] border-2 border-purple-500/60 rounded-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-[#2E2820] bg-gradient-to-r from-purple-950/40 via-[#1C1814] to-purple-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300">
                  <AlertCircle className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#F7F5F2]">Syarat Penarikan Dana</h3>
                  <p className="text-[10px] text-purple-300 font-mono">Pemberitahuan Sistem Otomatis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMinWithdrawalNotice(false)}
                className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2820] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5">
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 text-center space-y-1">
                <span className="text-xs text-[#A0988C] block uppercase tracking-wider">Syarat Batas Minimal Penarikan</span>
                <span className="text-2xl font-mono font-extrabold text-purple-300 block">
                  Rp 100.000
                </span>
                <p className="text-xs text-[#EAE6E1] mt-1">
                  Nominal yang diajukan: <strong className="text-rose-400">{formatIDR(parsedAmount)}</strong>
                </p>
              </div>

              <div className="space-y-2 text-xs text-[#C7BEAF]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span><strong>Ketentuan Perbankan & Kliring</strong>: Sesuai regulasi sistem transfer BI-FAST dan kliring perbankan mitra, nominal penarikan dana tunai ditetapkan minimal <strong>Rp 100.000</strong> per transaksi.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Bebas Biaya Admin</strong>: Seluruh penarikan dana ke semua bank (BCA, Mandiri, BRI, BNI, dll) dan e-wallet (DANA, OVO, GoPay) adalah <strong>Gratis (Rp 0)</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span><strong>Pemrosesan Otomatis</strong>: Sistem memproses pengiriman dana langsung 24 jam nonstop ke rekening tujuan Anda.</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleQuickAmount(100000);
                    setShowMinWithdrawalNotice(false);
                    setErrorMessage(null);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white font-bold text-xs hover:brightness-110 transition shadow cursor-pointer text-center"
                >
                  Ubah ke Rp 100.000
                </button>
                <button
                  type="button"
                  onClick={() => setShowMinWithdrawalNotice(false)}
                  className="py-2.5 px-4 rounded-xl bg-[#201D1A] border border-[#332C24] text-xs font-semibold text-[#A0988C] hover:text-[#F7F5F2] transition cursor-pointer"
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Peringatan Target Undang Teman (Minimal 10 Orang) */}
      {showReferralLockedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-[#161412] border-2 border-purple-500/70 rounded-3xl overflow-hidden shadow-2xl animate-scale-up text-[#F7F5F2]">
            <div className="p-4 sm:p-5 border-b border-[#2C241B] bg-gradient-to-r from-purple-950/60 via-[#1C1713] to-purple-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#F7F5F2]">Penarikan Belum Terbuka</h3>
                  <p className="text-[11px] text-purple-300 font-mono">Syarat: Minimal 10 Teman Terdaftar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReferralLockedNotice(false)}
                className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2820] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-4 rounded-2xl bg-[#0F0E0D] border border-[#2E261D] text-center space-y-2">
                <span className="text-[11px] text-[#A0988C] uppercase tracking-wider block font-semibold">
                  Progress Real-Time Undangan Anda
                </span>
                <div className="flex items-baseline justify-center gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-purple-300">{currentReferrals}</span>
                  <span className="text-lg text-[#8C857B]">/ 10 Orang</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#1A1815] overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all"
                    style={{ width: `${referralProgressPct}%` }}
                  />
                </div>
                <p className="text-xs text-amber-300 font-semibold mt-1">
                  Ajak {remainingReferralsNeeded} teman lagi untuk membuka akses pencairan dana tunai!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-[#C5BCB0] space-y-1.5">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Dapatkan Bonus 3% dari Setiap Teman</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Setiap rekan yang Anda undang melakukan deposit minimal <strong>Rp 500.000</strong>, Anda otomatis memperoleh komisi bonus <strong>3%</strong> langsung cair ke saldo kas Anda.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleShareReferral();
                    setShowReferralLockedNotice(false);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Ajak Teman via WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSimulateAddReferral();
                    if (currentReferrals + 1 >= 10) {
                      setShowReferralLockedNotice(false);
                    }
                  }}
                  className="py-3 px-3 rounded-xl bg-[#231E18] hover:bg-[#2F2920] border border-[#3E3424] text-xs font-semibold text-amber-300 hover:text-amber-200 transition cursor-pointer text-center"
                  title="Simulasi Tambah 1 Referral Demo"
                >
                  <span>+1 Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReferralLockedNotice(false)}
                  className="py-3 px-4 rounded-xl bg-[#1C1814] border border-[#2F271D] text-xs font-semibold text-[#A0988C] hover:text-[#F7F5F2] transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
