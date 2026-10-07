import React, { useState } from 'react';
import { 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Coins, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  TrendingUp, 
  Wallet, 
  Building2, 
  FileCheck2, 
  Lock, 
  AlertCircle,
  HelpCircle,
  Gift,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart
} from 'lucide-react';
import { UserAccount, EmiratesPackage, TradeType, Transaction } from '../../types';
import { 
  EMIRATES_PACKAGES, 
  formatIDR, 
  formatIDRNumberOnly, 
  formatGrams, 
  formatGramsNumberOnly, 
  BASE_BUY_PRICE, 
  BASE_SELL_PRICE 
} from '../../data/mockData';
import { PinVerificationModal } from '../PinVerificationModal';

interface PaketSpesialScreenProps {
  user: UserAccount;
  currentBuyPrice?: number;
  currentSellPrice?: number;
  onActivatePackage: (pkg: EmiratesPackage) => void;
  onGoToDeposit: (suggestedAmount: number) => void;
  onOpenCertificate: (mode?: 'sertifikat' | 'cetak_fisik') => void;
  onClaimDailyProfit?: (amountIdr: number) => void;
  onStartTrade?: (type: TradeType) => void;
  onShowToast: (msg: string) => void;
}

export const PaketSpesialScreen: React.FC<PaketSpesialScreenProps> = ({
  user,
  currentBuyPrice = BASE_BUY_PRICE,
  currentSellPrice = BASE_SELL_PRICE,
  onActivatePackage,
  onGoToDeposit,
  onOpenCertificate,
  onClaimDailyProfit,
  onStartTrade,
  onShowToast,
}) => {
  const [activeTabMode, setActiveTabMode] = useState<'paket' | 'portofolio_harian'>('paket');
  const [selectedTier, setSelectedTier] = useState<'bronze' | 'gold' | 'platinum'>('gold');
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const activePackage = EMIRATES_PACKAGES.find((p) => p.id === selectedTier) || EMIRATES_PACKAGES[1];
  const userBalance = user.balanceIdr || 0;
  const isBalanceSufficient = userBalance >= activePackage.priceIdr;
  const balanceDeficit = Math.max(0, activePackage.priceIdr - userBalance);

  // Safe user figures
  const safeGoldGrams = (user?.goldHoldingsGram !== undefined && !isNaN(Number(user.goldHoldingsGram))) ? Number(user.goldHoldingsGram) : 0;
  const safeBalanceIdr = (user?.balanceIdr !== undefined && !isNaN(Number(user.balanceIdr))) ? Number(user.balanceIdr) : 0;
  const goldValueIdr = Math.round(safeGoldGrams * currentBuyPrice);
  const totalWealthIdr = safeBalanceIdr + goldValueIdr;

  // Daily profit calculation (3% basis)
  const baseInvestmentBasis = Math.max(goldValueIdr, 1000000);
  const dailyProfitBasis = Math.round(baseInvestmentBasis * 0.03);
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = user.lastDailyProfitClaimDate === todayDateStr;

  const handleStartPurchase = () => {
    if (!isBalanceSufficient) {
      onShowToast(`Saldo kas Anda kurang Rp ${formatIDRNumberOnly(balanceDeficit)}. Membuka menu deposit...`);
      onGoToDeposit(activePackage.priceIdr);
      return;
    }
    setShowPinModal(true);
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onActivatePackage(activePackage);
    }, 600);
  };

  const handleClaimProfit = () => {
    if (isClaimedToday || isClaiming) return;
    setIsClaiming(true);

    setTimeout(() => {
      setIsClaiming(false);
      if (onClaimDailyProfit) {
        onClaimDailyProfit(dailyProfitBasis);
      }
      onShowToast(`Selamat! Bonus profit harian ${formatIDR(dailyProfitBasis)} berhasil diklaim dan masuk ke saldo kas.`);
    }, 700);
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in text-[#F7F5F2]">
      {/* Top Toggle Switcher: Paket Spesial vs Portofolio Saya */}
      <div className="flex p-1.5 rounded-2xl bg-[#161411] border border-[#2B241A] shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTabMode('paket')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTabMode === 'paket'
              ? 'bg-gradient-to-r from-amber-500/25 via-amber-400/30 to-amber-500/25 text-amber-300 border border-amber-400/50 shadow-md'
              : 'text-[#A0988C] hover:text-[#F7F5F2]'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Paket Investasi Spesial</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabMode('portofolio_harian')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTabMode === 'portofolio_harian'
              ? 'bg-gradient-to-r from-emerald-500/25 via-emerald-400/30 to-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-md'
              : 'text-[#A0988C] hover:text-[#F7F5F2]'
          }`}
        >
          <PieChart className="w-4 h-4 text-emerald-400" />
          <span>Portofolio & Profit Emas</span>
        </button>
      </div>

      {activeTabMode === 'paket' ? (
        <>
          {/* Hero Banner: Paket Spesial Emirates Gold 24K */}
          <section className="relative rounded-3xl overflow-hidden border-2 border-amber-500/60 bg-gradient-to-b from-[#241C12] via-[#1A150F] to-[#110F0D] p-5 sm:p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/30 shrink-0">
                    <Award className="w-6 h-6 stroke-[2.4]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-300 border border-amber-400/40">
                        Dubai UAE Accredited 24K
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                        Cashback Tunai s/d 25%
                      </span>
                    </div>
                    <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#F7F5F2] mt-1">
                      Paket Investasi Emirates Gold
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-xl bg-[#1C1814] border border-[#3E3424] text-[11px] text-[#C2BCB3] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Garansi 100% Emas Murni</span>
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#C2BCB3] leading-relaxed">
                Investasikan dana Anda pada emas batangan murni berlisensi internasional <strong className="text-amber-300">Emirates Gold 24K (Dubai/UAE)</strong>. Setiap paket memberikan fisik emas bersertifikat dan bonus cashback tunai instan langsung masuk ke saldo kas Anda!
              </p>
            </div>
          </section>

          {/* User Active Balance & Quick Action Bar */}
          <section className="p-4 sm:p-5 rounded-2xl bg-[#141210] border border-[#2E2820] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Wallet className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <span className="text-[11px] text-[#A0988C] font-medium">Saldo Kas Aktif Anda</span>
                <div className="font-mono text-lg sm:text-xl font-bold text-[#F7F5F2]">
                  {formatIDR(userBalance)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => onGoToDeposit(activePackage.priceIdr)}
                className="flex-1 sm:flex-none py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Top Up Saldo</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCertificate('sertifikat')}
                className="py-2 px-3 rounded-xl bg-[#1F1B16] hover:bg-[#2A241C] border border-[#3E3424] text-amber-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Sertifikat</span>
              </button>
            </div>
          </section>

          {/* 3 Package Tier Tabs Selector */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-serif text-sm sm:text-base font-bold text-[#F7F5F2] flex items-center gap-2">
                <span>Pilih Jenis Paket</span>
                <span className="text-[11px] font-sans font-normal text-[#8C857B]">(Klik untuk melihat rincian & ambil paket)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EMIRATES_PACKAGES.map((pkg) => {
                const isSelected = selectedTier === pkg.id;
                const isGold = pkg.id === 'gold';
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedTier(pkg.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? isGold 
                          ? 'bg-gradient-to-b from-[#241E14] via-[#1B1610] to-[#12100E] border-amber-400 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400/50 scale-[1.02]'
                          : 'bg-gradient-to-b from-[#201B14] to-[#14110E] border-amber-400/80 shadow-lg scale-[1.01]'
                        : 'bg-[#141210] border-[#2A241C] hover:border-[#4A3D2A] opacity-90'
                    }`}
                  >
                    {isGold && (
                      <span className="absolute -top-3 right-4 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-[#D4AF37] text-slate-950 shadow-md">
                        Paling Favorit
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          pkg.id === 'bronze' ? 'text-[#E8A87C]' : pkg.id === 'gold' ? 'text-amber-300' : 'text-cyan-300'
                        }`}>
                          Tier {pkg.tier}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          pkg.id === 'bronze' 
                            ? 'bg-[#CD7F32]/20 text-[#E8A87C] border-[#CD7F32]/40' 
                            : pkg.id === 'gold' 
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' 
                            : 'bg-cyan-400/20 text-cyan-200 border-cyan-400/40'
                        }`}>
                          Bonus +{pkg.bonusPercent}%
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="font-mono text-xl font-extrabold text-[#F7F5F2]">
                          Rp {pkg.priceIdr === 15000000 ? '15 Juta' : pkg.priceIdr === 25000000 ? '25 Juta' : '50 Juta'}
                        </div>
                        <div className="text-xs text-amber-300 font-semibold mt-1 flex items-center gap-1.5">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>Fisik Emirates Gold {pkg.goldGrams} gr</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#2B241A] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8C857B]">Cashback Tunai:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +{formatIDR(pkg.bonusAmountIdr)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTier(pkg.id);
                          handleStartPurchase();
                        }}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-[#D4AF37] hover:brightness-110 text-slate-950 font-extrabold'
                            : 'bg-[#221D16] hover:bg-[#2F271E] text-amber-300 border border-[#3E3424]'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ambil Paket {pkg.tier}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Active Selected Package Detail Showcase & Purchase Trigger */}
          <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#1E1912] via-[#15120E] to-[#0E0C0A] border-2 border-[#D4AF37]/50 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2C241B]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  Rincian Paket Terpilih
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#F7F5F2] mt-0.5">
                  {activePackage.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  Bonus Cashback Tunai {activePackage.bonusPercent}% Langsung Cair
                </span>
              </div>
            </div>

            {/* Benefit Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#0F0D0B] border border-[#2B241A] space-y-1">
                <span className="text-[11px] text-[#8C857B]">Dana Investasi</span>
                <div className="font-mono text-base sm:text-lg font-bold text-[#F7F5F2]">
                  {formatIDR(activePackage.priceIdr)}
                </div>
                <p className="text-[10px] text-[#A0988C]">Didebet langsung dari saldo kas Anda</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0F0D0B] border border-[#2B241A] space-y-1">
                <span className="text-[11px] text-[#8C857B]">Fisik Emas Diterima</span>
                <div className="font-mono text-base sm:text-lg font-bold text-amber-300">
                  {activePackage.goldGrams} Gram 24K
                </div>
                <p className="text-[10px] text-[#A0988C]">Emirates Gold Dubai (Sertifikat SNI & LBMA)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0F0D0B] border border-emerald-500/30 space-y-1 bg-gradient-to-br from-emerald-950/20 to-transparent">
                <span className="text-[11px] text-emerald-400 font-semibold">Bonus Cashback Tunai ({activePackage.bonusPercent}%)</span>
                <div className="font-mono text-base sm:text-lg font-bold text-emerald-300">
                  +{formatIDR(activePackage.bonusAmountIdr)}
                </div>
                <p className="text-[10px] text-emerald-400/80">Otomatis masuk kembali ke saldo kas</p>
              </div>
            </div>

            {/* Profit Calculator / Total Value Summary */}
            <div className="p-4 rounded-2xl bg-[#0A0908] border border-[#2A2318] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#C2BCB3]">
                <span>Nilai Fisik Emas ({activePackage.goldGrams}g @ {formatIDR(currentBuyPrice)}/g):</span>
                <span className="font-mono font-bold text-[#F7F5F2]">
                  {formatIDR(Math.round(activePackage.goldGrams * currentBuyPrice))}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#C2BCB3]">
                <span>Bonus Tunai Tambahan ({activePackage.bonusPercent}%):</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{formatIDR(activePackage.bonusAmountIdr)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#262018] flex items-center justify-between text-sm">
                <span className="font-bold text-[#F7F5F2]">Estimasi Total Nilai yang Didapat:</span>
                <span className="font-mono font-extrabold text-amber-300 text-base">
                  {formatIDR(Math.round(activePackage.goldGrams * currentBuyPrice) + activePackage.bonusAmountIdr)}
                </span>
              </div>
            </div>

            {/* Action Bar with Pin Verification */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#A0988C] flex items-center gap-2">
                {isBalanceSufficient ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Saldo kas mencukupi ({formatIDR(userBalance)})
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Saldo kas kurang {formatIDR(balanceDeficit)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {isBalanceSufficient ? (
                  <button
                    type="button"
                    onClick={handleStartPurchase}
                    disabled={isProcessing}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] hover:brightness-110 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ambil Paket {activePackage.tier} Sekarang</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onGoToDeposit(activePackage.priceIdr)}
                    className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm transition-all shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Top Up Kas ({formatIDR(activePackage.priceIdr)}) & Ambil Paket</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Active Packages Owned by User */}
          {user.activePackages && user.activePackages.length > 0 && (
            <section className="space-y-3">
              <h3 className="font-serif text-sm sm:text-base font-bold text-[#F7F5F2] flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Paket Investasi Aktif Anda ({user.activePackages.length})</span>
              </h3>

              <div className="space-y-2">
                {user.activePackages.map((upkg) => (
                  <div 
                    key={upkg.id}
                    className="p-3.5 rounded-2xl bg-[#141210] border border-amber-500/40 flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#F7F5F2]">
                          {upkg.packageName}
                        </div>
                        <div className="text-xs text-[#8C857B]">
                          Fisik: <strong className="text-amber-300">{upkg.goldGrams}g Emirates Gold</strong> • Cashback: <strong className="text-emerald-400">+{formatIDR(upkg.bonusAmountIdr)}</strong>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                      Aktif
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Features Information */}
          <section className="p-4 sm:p-5 rounded-2xl bg-[#12100E] border border-[#2B231A] space-y-3">
            <h4 className="font-serif text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Standar Keamanan Emas Fisik Dubai Emirates Gold</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#A0988C]">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>99.99% Emas Murni (24 Karat) dengan kode seri segel CertiCard anti-pemalsuan.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Bonus cashback tunai dijamin langsung masuk ke saldo kas tanpa potongan.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Dapat dicetak fisik atau dicairkan kembali kapan saja dengan likuiditas instan.</span>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Portofolio Harian & Klaim Profit 3% */
        <section className="space-y-5">
          {/* Wealth Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1E1912] via-[#15120E] to-[#0E0C0A] border-2 border-emerald-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A0988C] font-semibold">Total Nilai Portofolio Emas & Kas</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                Profit +3% Harian
              </span>
            </div>

            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#F7F5F2]">
              {formatIDR(totalWealthIdr)}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#2C241B]">
              <div>
                <span className="text-[11px] text-[#8C857B]">Saldo Kas IDR:</span>
                <div className="font-mono font-bold text-sm text-[#F7F5F2]">{formatIDR(safeBalanceIdr)}</div>
              </div>
              <div>
                <span className="text-[11px] text-[#8C857B]">Total Emas Fisik:</span>
                <div className="font-mono font-bold text-sm text-amber-300">{formatGrams(safeGoldGrams)}</div>
              </div>
            </div>
          </div>

          {/* Daily 3% Profit Claim Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#161412] to-[#12100E] border border-emerald-500/50 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5 stroke-[2.3]" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#F7F5F2]">Klaim Bagi Hasil Profit 3% Harian</h4>
                  <p className="text-[11px] text-[#A0988C]">Klaim dividen keuntungan Anda setiap 24 jam</p>
                </div>
              </div>

              <span className="font-mono text-base font-extrabold text-emerald-400">
                +{formatIDR(dailyProfitBasis)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClaimProfit}
              disabled={isClaimedToday || isClaiming}
              className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                isClaimedToday
                  ? 'bg-[#1C1814] text-[#8C857B] border border-[#2B231A] cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-extrabold shadow-emerald-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isClaimedToday ? 'Profit Hari Ini Sudah Diklaim' : `Klaim Profit Harian Sekarang (${formatIDR(dailyProfitBasis)})`}</span>
            </button>
          </div>
        </section>
      )}

      {/* Pin Verification Modal (100% Functional with isOpen, expectedPin, title, subtitle) */}
      {showPinModal && (
        <PinVerificationModal
          isOpen={showPinModal}
          expectedPin={user.pinCode || '123456'}
          title={`Investasi ${activePackage.name}`}
          subtitle={`Konfirmasi pendebetan kas ${formatIDR(activePackage.priceIdr)} dan penerimaan bonus cashback ${activePackage.bonusPercent}% (${formatIDR(activePackage.bonusAmountIdr)})`}
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  );
};
