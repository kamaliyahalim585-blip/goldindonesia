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
  Upload
} from 'lucide-react';
import { UserAccount, ScreenTab, TradeType, WalletActionType } from '../../types';
import { LiveGoldChart } from '../LiveGoldChart';
import { HistoricalGoldChartRecharts } from '../HistoricalGoldChartRecharts';
import { 
  BASE_BUY_PRICE, 
  BASE_SELL_PRICE, 
  formatIDRNumberOnly, 
  formatGramsNumberOnly 
} from '../../data/mockData';
import goldBarsWallpaper from '../../assets/images/gold_bars_bg_1789520085299.jpg';

interface HomeScreenProps {
  user: UserAccount;
  onNavigateTab: (tab: ScreenTab) => void;
  onStartTrade: (type: TradeType) => void;
  onStartWallet: (type: WalletActionType) => void;
  onOpenArticles?: () => void;
  onOpenKyc?: () => void;
  onOpenCertificate?: () => void;
  onOpenProofTransfer?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  onNavigateTab,
  onStartTrade,
  onStartWallet,
  onOpenArticles,
  onOpenKyc,
  onOpenCertificate,
  onOpenProofTransfer
}) => {
  // Live gold price state initialized with baseline
  const [currentBuyPrice, setCurrentBuyPrice] = useState<number>(BASE_BUY_PRICE);
  const [currentSellPrice, setCurrentSellPrice] = useState<number>(BASE_SELL_PRICE);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsUntilNextUpdate, setSecondsUntilNextUpdate] = useState<number>(60);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Helper to generate realistic market fluctuation (-0.3% to +0.35%, rounded to nearest Rp 1.000)
  const calculateNextPrice = (prevBuy: number) => {
    // Generate slight random delta between -4,000 and +5,000 IDR
    const stepOptions = [-5000, -4000, -3000, -2000, -1000, 1000, 2000, 3000, 4000, 5000, 6000];
    const randomStep = stepOptions[Math.floor(Math.random() * stepOptions.length)];
    
    // Keep buy price within a realistic band [1.430.000 - 1.475.000]
    let nextBuy = prevBuy + randomStep;
    if (nextBuy < 1430000) nextBuy = 1435000;
    if (nextBuy > 1475000) nextBuy = 1470000;
    
    // Spread between buy and sell is usually around Rp 60.000
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
    }, 60000); // exactly every 60 seconds (1 minute)

    // Countdown timer ticks every 1 second for transparent user feedback
    const countdownInterval = setInterval(() => {
      setSecondsUntilNextUpdate(prev => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => {
      clearInterval(updateInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Total wealth calculation dynamically tied to live gold market price
  const goldValueIdr = Math.round(user.goldHoldingsGram * currentBuyPrice);
  const totalWealthIdr = user.balanceIdr + goldValueIdr;

  return (
    <div className="space-y-5 pb-8 animate-fade-in relative">
      {/* Wallpaper Aksen Emas Batangan Transparan (Dashboard Background Watermark) */}
      <div className="absolute -top-3 -left-3 -right-3 h-80 sm:h-96 pointer-events-none overflow-hidden rounded-3xl z-0 opacity-20 select-none">
        <img
          src={goldBarsWallpaper}
          alt="Wallpaper Emas Batangan IndoGold"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter contrast-125 brightness-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0E0D]/30 via-[#0F0E0D]/75 to-[#0F0E0D]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0E0D]/80 via-transparent to-[#0F0E0D]/80" />
      </div>

      {/* Hero Wealth Card */}
      <section className="relative rounded-2xl bg-gradient-to-b from-[#26231F]/90 via-[#1A1816]/95 to-[#0F0E0D] border border-[#3D3528] p-5 sm:p-6 overflow-hidden shadow-2xl z-10 backdrop-blur-xs">
        {/* Aksen Emas Batangan Transparan di Sudut Kanan Kartu Hero */}
        <div className="absolute -right-4 -bottom-4 w-60 h-44 pointer-events-none overflow-hidden rounded-2xl opacity-25 mix-blend-screen select-none">
          <img
            src={goldBarsWallpaper}
            alt="Aksen Emas Batangan 24K"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter contrast-125 brightness-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0D] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#1A1816]/60 to-[#1A1816]" />
        </div>

        {/* Subtle decorative gold ring in background */}
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full border border-[#D4AF37]/15 pointer-events-none" />
        <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full border border-[#D4AF37]/20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-[#9E978E]">
              Total Estimasi Portofolio
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37] bg-[#4A3C13]/40 border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Kemurnian 24K</span>
            </div>
          </div>

          {/* Large Serif typography for Total Balance */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-serif font-bold text-[#D4AF37]">Rp</span>
            <h1 className="font-mono text-3xl sm:text-4xl tracking-tight font-bold text-[#F7F5F2] tabular-nums">
              {formatIDRNumberOnly(totalWealthIdr)}
            </h1>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#2E2820]">
            <div 
              onClick={() => onNavigateTab('portofolio')}
              className="p-3 rounded-xl bg-[#0F0E0D]/80 border border-[#26211B] cursor-pointer hover:border-[#D4AF37]/50 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block">Simpanan Emas</span>
                <span className="text-[9px] font-bold text-[#D4AF37] group-hover:translate-x-0.5 transition-transform">24K &rarr;</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm font-bold text-[#D4AF37] tabular-nums">
                    {formatGramsNumberOnly(user.goldHoldingsGram)}
                  </span>
                  <span className="text-[10px] text-[#8C857B]">gr</span>
                </div>
                <span className="text-[10px] font-mono text-[#A0988C] tabular-nums">
                  ~Rp {formatIDRNumberOnly(goldValueIdr)}
                </span>
              </div>
            </div>

            <div 
              onClick={() => onStartWallet('deposit')}
              className="p-3 rounded-xl bg-[#0F0E0D]/80 border border-[#26211B] cursor-pointer hover:border-[#D4AF37]/50 transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block">Saldo Tunai Kas</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C857B] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[10px] font-semibold text-[#D4AF37]">Rp</span>
                <span className="font-mono text-sm font-bold text-[#F7F5F2] tabular-nums">
                  {formatIDRNumberOnly(user.balanceIdr)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Translucent Glass Card for Live Gold Chart */}
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

      {/* 4-Icon Grid (Beli, Jual, Deposit, Tarik) with Vibrant, Bold & Attractive Accents */}
      <section className="bg-[#1A1816]/85 backdrop-blur-md rounded-2xl border border-[#2E2820] p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">Menu Transaksi Utama</h2>
          </div>
          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            Bebas Biaya Admin
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 text-center">
          {/* 1. Beli Emas (Vibrant Emerald) */}
          <button
            onClick={() => onStartTrade('beli')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-emerald-400/80 flex items-center justify-center text-white group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all shadow-md shadow-emerald-950/60">
              <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold mt-2 text-[#F7F5F2] group-hover:text-emerald-400 transition">
              Beli Emas
            </span>
            <span className="text-[9px] font-medium text-emerald-300/90 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/20 mt-0.5">
              Mulai 0,01 gr
            </span>
          </button>

          {/* 2. Jual Emas (Vibrant Coral/Rose Gold) */}
          <button
            onClick={() => onStartTrade('jual')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-600 to-red-600 border-2 border-rose-400/80 flex items-center justify-center text-white group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all shadow-md shadow-rose-950/60">
              <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold mt-2 text-[#F7F5F2] group-hover:text-rose-400 transition">
              Jual Emas
            </span>
            <span className="text-[9px] font-medium text-rose-300/90 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-500/20 mt-0.5">
              Cairkan Kas
            </span>
          </button>

          {/* 3. Deposit Saldo (Brilliant Royal Blue/Cyan) */}
          <button
            onClick={() => onStartWallet('deposit')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 border-2 border-sky-400/80 flex items-center justify-center text-white group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all shadow-md shadow-sky-950/60">
              <PlusCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold mt-2 text-[#F7F5F2] group-hover:text-sky-400 transition">
              Deposit
            </span>
            <span className="text-[9px] font-medium text-sky-300/90 bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-500/20 mt-0.5">
              Permata & OVO
            </span>
          </button>

          {/* 4. Tarik Dana (Radiant Purple/Fuchsia) */}
          <button
            onClick={() => onStartWallet('tarik')}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-700 border-2 border-purple-400/80 flex items-center justify-center text-white group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all shadow-md shadow-purple-950/60">
              <WalletCards className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xs font-semibold mt-2 text-[#F7F5F2] group-hover:text-purple-400 transition">
              Tarik Tunai
            </span>
            <span className="text-[9px] font-medium text-purple-300/90 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-500/20 mt-0.5">
              Semua Bank/E-Wallet
            </span>
          </button>
        </div>

        {/* Layanan Cepat Terverifikasi: Sertifikat Asli & Bukti Transfer */}
        <div className="pt-3 border-t border-[#2A2620] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Sertifikat Keaslian 24K */}
          <button
            onClick={() => {
              if (onOpenCertificate) onOpenCertificate();
              else onNavigateTab('akun');
            }}
            className="p-3 rounded-xl bg-[#131210] border border-[#383124] hover:border-[#D4AF37]/60 flex items-center justify-between transition cursor-pointer group shadow-sm text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#382D12] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#F7F5F2] group-hover:text-[#D4AF37] transition truncate">
                    Sertifikat Emas 24K
                  </span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#382D12] text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
                    Resmi LBMA
                  </span>
                </div>
                <span className="text-[10px] text-[#A0988C] block truncate">
                  Cek & unduh sertifikat keaslian fisik
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C857B] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition shrink-0" />
          </button>

          {/* Kirim Bukti Transfer */}
          <button
            onClick={() => {
              if (onOpenProofTransfer) onOpenProofTransfer();
              else onStartWallet('deposit');
            }}
            className="p-3 rounded-xl bg-[#131210] border border-[#383124] hover:border-[#D4AF37]/60 flex items-center justify-between transition cursor-pointer group shadow-sm text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#241F16] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:scale-105 transition shrink-0">
                <Upload className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#F7F5F2] group-hover:text-[#D4AF37] transition truncate">
                    Bukti Transfer
                  </span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#2E5C3E]/40 text-[#8CEB9C] border border-[#2E5C3E] shrink-0">
                    Auto-Verif
                  </span>
                </div>
                <span className="text-[10px] text-[#A0988C] block truncate">
                  Konfirmasi setoran Permata & OVO
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8C857B] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition shrink-0" />
          </button>
        </div>
      </section>

      {/* Historical 30-Day Gold Price Analysis (Recharts) */}
      <HistoricalGoldChartRecharts />

      {/* Market News / Wawasan Investasi */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onOpenArticles}>
            <Flame className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-xs uppercase tracking-wider text-[#9E978E]">Wawasan Pasar Emas</h3>
          </div>
          <button 
            onClick={onOpenArticles}
            className="text-xs text-[#D4AF37] cursor-pointer hover:underline bg-transparent border-none p-0"
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
              <span>EDUKASI INDOGOLD</span>
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
          <p className="text-[#EAE6E1]">Terdaftar & Diawasi Resmi oleh BAPPEBTI</p>
          <p className="text-[#9E978E] text-[10px] mt-0.5">Fisik emas tersimpan aman di kliring kustodi teregulasi pemerintah RI.</p>
        </div>
      </section>
    </div>
  );
};
