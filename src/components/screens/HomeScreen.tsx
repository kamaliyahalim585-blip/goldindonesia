import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  WalletCards, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  ChevronRight, 
  Flame, 
  Clock, 
  Send, 
  Eye, 
  EyeOff, 
  Printer, 
  CheckCircle2, 
  History, 
  RefreshCw, 
  HelpCircle, 
  Bell, 
  Coins,
  TrendingUp,
  Receipt,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { UserAccount, ScreenTab, TradeType, WalletActionType, Transaction } from '../../types';
import { LiveGoldChart } from '../LiveGoldChart';
import { HistoricalGoldChartRecharts } from '../HistoricalGoldChartRecharts';
import { 
  BASE_BUY_PRICE, 
  BASE_SELL_PRICE, 
  formatIDRNumberOnly, 
  formatGramsNumberOnly,
  formatIDR
} from '../../data/mockData';
import goldBarsWallpaper from '../../assets/images/gold_bars_bg_1789520085299.jpg';

interface HomeScreenProps {
  user: UserAccount;
  transactions?: Transaction[];
  onNavigateTab: (tab: ScreenTab) => void;
  onStartTrade: (type: TradeType) => void;
  onStartWallet: (type: WalletActionType) => void;
  onSelectTransaction?: (tx: Transaction) => void;
  onOpenArticles?: () => void;
  onOpenKyc?: () => void;
  onOpenCertificate?: (mode?: 'sertifikat' | 'cetak_fisik') => void;
  onOpenProofTransfer?: () => void;
  onOpenTransferEmas?: () => void;
  onOpenEmiratesPackages?: (tier?: 'bronze' | 'gold' | 'platinum') => void;
  onOpenHelp?: () => void;
  onOpenNotifications?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  transactions = [],
  onNavigateTab,
  onStartTrade,
  onStartWallet,
  onSelectTransaction,
  onOpenArticles,
  onOpenKyc,
  onOpenCertificate,
  onOpenProofTransfer,
  onOpenTransferEmas,
  onOpenEmiratesPackages,
  onOpenHelp,
  onOpenNotifications
}) => {
  // Live gold price state initialized with baseline
  const [currentBuyPrice, setCurrentBuyPrice] = useState<number>(BASE_BUY_PRICE);
  const [currentSellPrice, setCurrentSellPrice] = useState<number>(BASE_SELL_PRICE);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsUntilNextUpdate, setSecondsUntilNextUpdate] = useState<number>(60);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);

  // Helper to generate realistic market fluctuation (-0.3% to +0.35%, rounded to nearest Rp 1.000)
  const calculateNextPrice = (prevBuy: number) => {
    const stepOptions = [-5000, -4000, -3000, -2000, -1000, 1000, 2000, 3000, 4000, 5000, 6000];
    const randomStep = stepOptions[Math.floor(Math.random() * stepOptions.length)];
    
    let nextBuy = prevBuy + randomStep;
    if (nextBuy < 1430000) nextBuy = 1435000;
    if (nextBuy > 1475000) nextBuy = 1470000;
    
    const nextSell = nextBuy - 60000;
    return { nextBuy, nextSell };
  };

  // Trigger price update
  const triggerPriceUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setCurrentBuyPrice(prev => {
        const { nextBuy, nextSell } = calculateNextPrice(prev);
        setCurrentSellPrice(nextSell);
        return nextBuy;
      });
      setLastUpdated(new Date());
      setSecondsUntilNextUpdate(60);
      setIsUpdating(false);
    }, 450);
  };

  // 1-minute interval for live gold market fluctuations
  useEffect(() => {
    const updateInterval = setInterval(() => {
      triggerPriceUpdate();
    }, 60000);

    const countdownInterval = setInterval(() => {
      setSecondsUntilNextUpdate(prev => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Total wealth calculation dynamically tied to live gold market price
  const safeGoldGrams = (user?.goldHoldingsGram !== undefined && !isNaN(Number(user.goldHoldingsGram))) ? Number(user.goldHoldingsGram) : 0;
  const safeBalanceIdr = (user?.balanceIdr !== undefined && !isNaN(Number(user.balanceIdr))) ? Number(user.balanceIdr) : 0;
  const goldValueIdr = Math.round(safeGoldGrams * currentBuyPrice);
  const totalWealthIdr = safeBalanceIdr + goldValueIdr;

  // Filter 3 latest transactions
  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="space-y-4 pb-8 animate-fade-in relative">
      {/* Wallpaper Aksen Emas Batangan Transparan (Dashboard Background Watermark) */}
      <div className="absolute -top-4 -left-4 -right-4 h-80 sm:h-96 pointer-events-none overflow-hidden rounded-3xl z-0 opacity-20 select-none">
        <img
          src={goldBarsWallpaper}
          alt="Wallpaper Emas Batangan NusantaraGold"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter contrast-125 brightness-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E0D]/30 via-[#0F0E0D]/75 to-[#0F0E0D]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0E0D]/80 via-transparent to-[#0F0E0D]/80" />
      </div>

      {/* Hero "Saldo Rupiah" & Portfolio Card */}
      <section className="relative rounded-2xl bg-gradient-to-b from-[#24201A] via-[#1A1713] to-[#12100E] border border-[#453A26] p-5 sm:p-6 overflow-hidden shadow-2xl z-10 backdrop-blur-md">
        {/* Subtle decorative gold sheen */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-gradient-to-br from-[#D4AF37]/15 to-transparent blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-44 h-44 rounded-full bg-gradient-to-tr from-amber-600/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Card Top Row: Label & Eye Privacy Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#A69B8D] font-medium">
                Saldo Rupiah & Kas Tunai
              </span>
              <button
                type="button"
                onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                className="text-[#8C857B] hover:text-[#D4AF37] transition p-1"
                title={isBalanceHidden ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
              >
                {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37] bg-[#4A3C13]/50 border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-full shadow-inner">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span className="font-semibold">Kemurnian 24K</span>
            </div>
          </div>

          {/* Primary Saldo Rupiah Display */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37]">Rp</span>
              <h1 className="font-mono text-3xl sm:text-4xl tracking-tight font-extrabold text-[#F7F5F2] tabular-nums">
                {isBalanceHidden ? '••••••••' : formatIDRNumberOnly(safeBalanceIdr)}
              </h1>
            </div>
            
            {/* Total Estimated Wealth (Gold + Cash) */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#A69B8D]">
              <span>Total Estimasi Aset:</span>
              <span className="font-mono font-bold text-[#F7F5F2] tabular-nums">
                {isBalanceHidden ? '••••••••' : `Rp ${formatIDRNumberOnly(totalWealthIdr)}`}
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                +0.85%
              </span>
            </div>
          </div>

          {/* Breakdown Capsules Row */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#2E2820]">
            {/* Saldo Emas Gramasi */}
            <div 
              onClick={() => onNavigateTab('portofolio')}
              className="p-3 rounded-xl bg-[#141210]/90 border border-[#2F2920] hover:border-[#D4AF37]/60 transition cursor-pointer group shadow-inner"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold">Simpanan Emas</span>
                <span className="text-[9px] font-bold text-[#D4AF37] group-hover:translate-x-0.5 transition-transform">
                  Portofolio &rarr;
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#D4AF37] tabular-nums">
                    {isBalanceHidden ? '••••' : formatGramsNumberOnly(safeGoldGrams)}
                  </span>
                  <span className="text-[10px] text-[#8C857B]">gr</span>
                </div>
                <span className="text-[10px] font-mono text-[#A69B8D] tabular-nums">
                  {isBalanceHidden ? '••••' : `~Rp ${formatIDRNumberOnly(goldValueIdr)}`}
                </span>
              </div>
            </div>

            {/* Saldo Kas Tunai */}
            <div 
              onClick={() => onStartWallet('deposit')}
              className="p-3 rounded-xl bg-[#141210]/90 border border-[#2F2920] hover:border-[#D4AF37]/60 transition cursor-pointer group shadow-inner"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold">Kas Siap Pakai</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C857B] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition" />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[10px] font-semibold text-[#D4AF37]">Rp</span>
                <span className="font-mono text-sm sm:text-base font-bold text-[#F7F5F2] tabular-nums">
                  {isBalanceHidden ? '••••••••' : formatIDRNumberOnly(user.balanceIdr)}
                </span>
              </div>
            </div>
          </div>

          {/* 4 Menu Tombol Aksi Cepat Dashboard (Refined Luxury Fintech Proportions) */}
          <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-[#26211A]">
            {/* Beli Emas */}
            <button
              type="button"
              onClick={() => onStartTrade('beli')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-[#161310]/95 hover:bg-[#1E1B16] border border-[#3A301E] hover:border-emerald-500/60 transition-all group cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-1.5 group-hover:bg-emerald-500/20 group-hover:border-emerald-400 group-hover:scale-105 transition-all shadow-[0_0_10px_rgba(52,211,153,0.15)]">
                <ArrowDownLeft className="w-5 h-5 text-emerald-400 stroke-[2.2]" />
              </div>
              <span className="text-[11.5px] font-bold text-[#F7F5F2] group-hover:text-emerald-300 transition-colors">
                Beli Emas
              </span>
              <span className="text-[9.5px] text-[#8C857B] font-medium mt-0.5">Mulai Rp 10rb</span>
            </button>

            {/* Jual Emas */}
            <button
              type="button"
              onClick={() => onStartTrade('jual')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-[#161310]/95 hover:bg-[#1E1B16] border border-[#3A301E] hover:border-amber-500/60 transition-all group cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-1.5 group-hover:bg-amber-500/20 group-hover:border-amber-400 group-hover:scale-105 transition-all shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                <ArrowUpRight className="w-5 h-5 text-amber-400 stroke-[2.2]" />
              </div>
              <span className="text-[11.5px] font-bold text-[#F7F5F2] group-hover:text-amber-300 transition-colors">
                Jual Emas
              </span>
              <span className="text-[9.5px] text-[#8C857B] font-medium mt-0.5">Cair Instan</span>
            </button>

            {/* Top Up / Deposit Saldo Kas */}
            <button
              type="button"
              onClick={() => onStartWallet('deposit')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-[#161310]/95 hover:bg-[#1E1B16] border border-[#3A301E] hover:border-sky-500/60 transition-all group cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-1.5 group-hover:bg-sky-500/20 group-hover:border-sky-400 group-hover:scale-105 transition-all shadow-[0_0_10px_rgba(56,189,248,0.15)]">
                <PlusCircle className="w-5 h-5 text-sky-400 stroke-[2.2]" />
              </div>
              <span className="text-[11.5px] font-bold text-[#F7F5F2] group-hover:text-sky-300 transition-colors">
                Top Up Kas
              </span>
              <span className="text-[9.5px] text-[#8C857B] font-medium mt-0.5">Bank & QRIS</span>
            </button>

            {/* Tarik Kas Tunai */}
            <button
              type="button"
              onClick={() => onStartWallet('tarik')}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-[#161310]/95 hover:bg-[#1E1B16] border border-[#3A301E] hover:border-purple-500/60 transition-all group cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-1.5 group-hover:bg-purple-500/20 group-hover:border-purple-400 group-hover:scale-105 transition-all shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                <WalletCards className="w-5 h-5 text-purple-400 stroke-[2.2]" />
              </div>
              <span className="text-[11.5px] font-bold text-[#F7F5F2] group-hover:text-purple-300 transition-colors">
                Tarik Kas
              </span>
              <span className="text-[9.5px] text-[#8C857B] font-medium mt-0.5">Min Rp 100rb</span>
            </button>
          </div>
        </div>
      </section>

      {/* Menu Layanan Unggulan NusantaraGold (3 Fitur Utama Berukuran Profesional & Simetris) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#A0988C] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Layanan Fitur Emas</span>
          </h3>
          <span className="text-[10px] text-[#8C857B]">Fitur Unggulan</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Cetak Emas Fisik */}
          <div
            onClick={() => onOpenCertificate && onOpenCertificate('cetak_fisik')}
            className="p-3 rounded-2xl bg-[#151311] border border-[#2B2620] hover:border-[#D4AF37]/80 hover:bg-[#1C1915] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 group-hover:border-[#D4AF37] transition-all">
                <Printer className="w-4 h-4" />
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Antam/UBS
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-[#F7F5F2] group-hover:text-[#D4AF37] transition flex items-center justify-between">
                <span>Cetak Fisik</span>
                <ChevronRight className="w-3 h-3 text-[#6E675D] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-[#8C857B] mt-0.5 font-medium leading-tight">Emas Batangan 24K</p>
            </div>
          </div>

          {/* Transfer Emas */}
          <div
            onClick={onOpenTransferEmas}
            className="p-3 rounded-2xl bg-[#151311] border border-[#2B2620] hover:border-emerald-500/70 hover:bg-[#1C1915] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/10 border border-emerald-400/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-400 transition-all">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                Gratis
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-[#F7F5F2] group-hover:text-emerald-300 transition flex items-center justify-between">
                <span>Transfer Emas</span>
                <ChevronRight className="w-3 h-3 text-[#6E675D] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-[#8C857B] mt-0.5 font-medium leading-tight">Kirim Antar Investor</p>
            </div>
          </div>

          {/* Sertifikat Kepemilikan 24K */}
          <div
            onClick={() => onOpenCertificate && onOpenCertificate('sertifikat')}
            className="p-3 rounded-2xl bg-[#151311] border border-[#2B2620] hover:border-purple-500/70 hover:bg-[#1C1915] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-400/10 border border-purple-400/25 flex items-center justify-center text-purple-400 group-hover:scale-105 group-hover:border-purple-400 transition-all">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-purple-400/10 text-purple-300 border border-purple-400/20">
                Resmi
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-[#F7F5F2] group-hover:text-purple-300 transition flex items-center justify-between">
                <span>Sertifikat 24K</span>
                <ChevronRight className="w-3 h-3 text-[#6E675D] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-[#8C857B] mt-0.5 font-medium leading-tight">Standar SNI & LBMA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Eksklusif: Paket Investasi Emirates Gold 24K (Bonus s/d 25%) */}
      <section className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 bg-gradient-to-b from-[#241E14] via-[#1A1610] to-[#12100E] p-4 sm:p-5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3.5">
          {/* Header Banner */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/25 shrink-0">
                <Award className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Paket Unggulan
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Cashback s/d 25%
                  </span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#F7F5F2] mt-0.5">
                  Paket Investasi Emirates Gold 24K
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenEmiratesPackages}
              className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-300 text-slate-950 text-xs font-bold hover:brightness-110 transition shadow cursor-pointer shrink-0"
            >
              <span>Buka Semua Paket</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-[#C2BCB3] leading-relaxed">
            Dapatkan fisik emas batangan murni berlisensi Dubai <strong className="text-amber-300">Emirates Gold 24K</strong> dengan bonus cashback tunai langsung cair ke saldo kas Anda:
          </p>

          {/* 3 Package Mini Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Bronze Card */}
            <div 
              onClick={() => onOpenEmiratesPackages && onOpenEmiratesPackages('bronze')}
              className="p-3.5 rounded-2xl bg-[#141210] border border-[#CD7F32]/50 hover:border-[#CD7F32] transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E8A87C]">
                    Tier Bronze
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#CD7F32]/20 text-[#E8A87C] border border-[#CD7F32]/40">
                    Bonus +8%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-mono text-base font-extrabold text-[#F7F5F2]">Rp 15 Juta</span>
                  <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
                    Fisik Emirates Gold 10 gr
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#262018] flex items-center justify-between text-[11px]">
                <span className="text-[#8C857B]">Cashback:</span>
                <span className="text-emerald-400 font-bold font-mono">+Rp 1.200.000</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmiratesPackages && onOpenEmiratesPackages('bronze');
                }}
                className="mt-2.5 w-full py-1.5 rounded-lg bg-[#241E18] hover:bg-[#342B22] text-[#E8A87C] border border-[#CD7F32]/40 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Ambil Paket Bronze</span>
              </button>
            </div>

            {/* Gold Card */}
            <div 
              onClick={() => onOpenEmiratesPackages && onOpenEmiratesPackages('gold')}
              className="p-3.5 rounded-2xl bg-[#17140F] border-2 border-amber-400/80 hover:border-amber-300 transition-all cursor-pointer group shadow-md shadow-amber-500/15 flex flex-col justify-between relative"
            >
              <span className="absolute -top-2.5 right-3 text-[9px] font-bold px-2 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-[#D4AF37] text-slate-950 shadow">
                Paling Favorit
              </span>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Tier Gold
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Bonus +18%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-mono text-base font-extrabold text-[#F7F5F2]">Rp 25 Juta</span>
                  <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
                    Fisik Emirates Gold 17.5 gr
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#2E281C] flex items-center justify-between text-[11px]">
                <span className="text-[#8C857B]">Cashback:</span>
                <span className="text-emerald-400 font-bold font-mono">+Rp 4.500.000</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmiratesPackages && onOpenEmiratesPackages('gold');
                }}
                className="mt-2.5 w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-[#D4AF37] hover:brightness-110 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/25 transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ambil Paket Gold</span>
              </button>
            </div>

            {/* Platinum Card */}
            <div 
              onClick={() => onOpenEmiratesPackages && onOpenEmiratesPackages('platinum')}
              className="p-3.5 rounded-2xl bg-[#141210] border border-cyan-400/50 hover:border-cyan-300 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Tier Platinum
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/40">
                    Bonus +25%
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-mono text-base font-extrabold text-[#F7F5F2]">Rp 50 Juta</span>
                  <div className="text-[11px] text-amber-300 font-semibold mt-0.5">
                    Fisik Emirates Gold 35 gr
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#262018] flex items-center justify-between text-[11px]">
                <span className="text-[#8C857B]">Cashback:</span>
                <span className="text-emerald-400 font-bold font-mono">+Rp 12.500.000</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEmiratesPackages && onOpenEmiratesPackages('platinum');
                }}
                className="mt-2.5 w-full py-1.5 rounded-lg bg-[#182226] hover:bg-[#202E34] text-cyan-300 border border-cyan-400/40 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Ambil Paket Platinum</span>
              </button>
            </div>
          </div>

          {/* Action Button on Mobile */}
          <button
            type="button"
            onClick={onOpenEmiratesPackages}
            className="w-full sm:hidden py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pilih Paket Emirates & Ambil Cashback</span>
          </button>
        </div>
      </section>

      {/* Live Gold Chart & Price Ticker */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between px-1 text-[11px] text-[#9E978E]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#8CEB9C] animate-pulse" />
            <span>Feed Pasar Real-Time Terhubung</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#9E978E]">
            <Clock className="w-3 h-3 text-[#D4AF37]" />
            <span>Update berikutnya dlm {secondsUntilNextUpdate}d</span>
          </div>
        </div>

        <LiveGoldChart 
          buyPrice={currentBuyPrice}
          sellPrice={currentSellPrice}
          lastUpdated={lastUpdated}
          isUpdatingLive={isUpdating}
          onManualRefresh={triggerPriceUpdate}
        />
      </section>

      {/* Historical 30-Day Gold Price Analysis (Recharts) */}
      <HistoricalGoldChartRecharts />

      {/* Transaksi Terakhir di Dashboard (Recent Activity) */}
      {recentTransactions.length > 0 && (
        <section className="bg-[#1A1816]/90 backdrop-blur-md rounded-2xl border border-[#2E2820] p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">Aktivitas Terakhir</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('riwayat')}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Semua Riwayat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isPositive = tx.category === 'jual' || tx.category === 'deposit';
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                  className="p-3 rounded-xl bg-[#12100E] border border-[#2E2820] hover:border-[#D4AF37]/50 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.category === 'beli' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' :
                      tx.category === 'jual' ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40' :
                      tx.category === 'deposit' ? 'bg-sky-950/80 text-sky-400 border border-sky-500/40' :
                      'bg-purple-950/80 text-purple-400 border border-purple-500/40'
                    }`}>
                      {tx.category === 'beli' && <ArrowDownLeft className="w-4 h-4" />}
                      {tx.category === 'jual' && <ArrowUpRight className="w-4 h-4" />}
                      {tx.category === 'deposit' && <PlusCircle className="w-4 h-4" />}
                      {tx.category === 'tarik' && <WalletCards className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#F7F5F2] truncate group-hover:text-[#D4AF37] transition">
                          {tx.title}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                          tx.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                          tx.status === 'Pending' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                          'bg-rose-950 text-rose-300 border border-rose-500/30'
                        }`}>
                          {tx.status === 'Approved' ? 'Berhasil' : tx.status === 'Pending' ? 'Diproses' : 'Ditolak'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8C857B] block">
                        {tx.date}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-mono text-xs font-bold block ${
                      isPositive ? 'text-emerald-400' : 'text-[#F7F5F2]'
                    }`}>
                      {isPositive ? '+' : '-'}{formatIDR(tx.amountIdr)}
                    </span>
                    {tx.goldGrams && (
                      <span className="text-[10px] text-[#A69B8D] font-mono">
                        {tx.goldGrams} gr
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Market News / Wawasan Investasi */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onOpenArticles}>
            <Flame className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-xs uppercase tracking-wider text-[#9E978E] font-semibold">Wawasan Pasar Emas</h3>
          </div>
          <button 
            type="button"
            onClick={onOpenArticles}
            className="text-xs text-[#D4AF37] cursor-pointer hover:underline bg-transparent border-none p-0 font-medium"
          >
            Lihat Riset
          </button>
        </div>

        <div className="space-y-2">
          <div 
            onClick={onOpenArticles}
            className="p-3.5 rounded-xl bg-[#1A1816]/70 border border-[#2E2A26] hover:border-[#4A433D] transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] text-[#9E978E] mb-1">
              <span>ANALISIS KOMODITAS</span>
              <span>2 jam lalu</span>
            </div>
            <h4 className="text-xs text-[#F7F5F2] leading-snug">
              Sentimen Emas Global: Pemotongan Suku Bunga Federal Reserve Dorong Permintaan Logam Mulia ke Rekor Baru
            </h4>
          </div>

          <div 
            onClick={onOpenArticles}
            className="p-3.5 rounded-xl bg-[#1A1816]/70 border border-[#2E2A26] hover:border-[#4A433D] transition cursor-pointer"
          >
            <div className="flex items-center justify-between text-[10px] text-[#9E978E] mb-1">
              <span>EDUKASI NUSANTARAGOLD</span>
              <span>Kemarin</span>
            </div>
            <h4 className="text-xs text-[#F7F5F2] leading-snug">
              Perbedaan Emas Batangan ANTAM, UBS & PAMP Suisse: Mana Pilihan Terbaik untuk Lindung Nilai?
            </h4>
          </div>
        </div>
      </section>

      {/* Security & Regulator Seal */}
      <section 
        onClick={onOpenKyc}
        className="p-3.5 rounded-xl bg-[#26231F]/50 border border-[#2E2A26] hover:border-[#D4AF37]/40 flex items-center gap-3 cursor-pointer transition"
      >
        <div className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <div className="text-[11px] leading-tight">
          <p className="text-[#EAE6E1] font-semibold">Terdaftar & Diawasi Resmi oleh BAPPEBTI</p>
          <p className="text-[#9E978E] text-[10px] mt-0.5">Fisik emas tersimpan aman di kliring kustodi teregulasi pemerintah RI (KBI & ICH).</p>
        </div>
      </section>
    </div>
  );
};
