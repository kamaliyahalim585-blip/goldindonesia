import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  Coins, 
  Gift, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  PieChart,
  Percent
} from 'lucide-react';
import { UserAccount, TradeType } from '../../types';
import { 
  GOLD_BRANDS, 
  formatIDR, 
  formatIDRNumberOnly, 
  formatGrams, 
  formatGramsNumberOnly, 
  BASE_BUY_PRICE, 
  BASE_SELL_PRICE, 
  APP_IMAGES 
} from '../../data/mockData';
import { THEME } from '../../theme';

interface PortfolioScreenProps {
  user: UserAccount;
  currentBuyPrice?: number;
  currentSellPrice?: number;
  onStartTrade: (type: TradeType) => void;
  onOpenCertificate: () => void;
  onClaimDailyProfit?: (amountIdr: number) => void;
  onShowToast: (msg: string) => void;
}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = ({
  user,
  currentBuyPrice = BASE_BUY_PRICE,
  currentSellPrice = BASE_SELL_PRICE,
  onStartTrade,
  onOpenCertificate,
  onClaimDailyProfit,
  onShowToast,
}) => {
  const [selectedProjectionDays, setSelectedProjectionDays] = useState<number>(1);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  // Total valuation
  const goldValueIdr = Math.round(user.goldHoldingsGram * currentBuyPrice);
  const totalWealthIdr = user.balanceIdr + goldValueIdr;

  // 3% Daily profit math
  // 3% daily yield calculated on the gold value (minimum basis Rp 1.000.000 if gold is small)
  const baseInvestmentBasis = Math.max(goldValueIdr, 1000000);
  const dailyProfitAmountIdr = Math.round(baseInvestmentBasis * (THEME.bonuses.dailyProfitPercent / 100));

  // Compound projection
  const calculateCompoundReturn = (days: number) => {
    const rate = THEME.bonuses.dailyProfitPercent / 100;
    const finalMultiplier = Math.pow(1 + rate, days);
    const projectedProfit = Math.round(baseInvestmentBasis * (finalMultiplier - 1));
    return projectedProfit;
  };

  // Allocation distribution across the 6 brands (realistic portfolio split)
  const brandHoldingsRatio: Record<string, number> = {
    ANTAM: 0.40, // 40%
    PAMP: 0.20,  // 20%
    UBS: 0.15,   // 15%
    G24: 0.10,   // 10%
    LOTUS: 0.08, // 8%
    HARTA: 0.07, // 7%
  };

  const handleClaimProfit = () => {
    if (user.lastDailyProfitClaimDate === new Date().toISOString().slice(0, 10)) {
      onShowToast('Anda sudah mengklaim profit harian 3% untuk hari ini. Kembali lagi besok!');
      return;
    }

    setIsClaiming(true);
    setTimeout(() => {
      setIsClaiming(false);
      if (onClaimDailyProfit) {
        onClaimDailyProfit(dailyProfitAmountIdr);
      }
      onShowToast(`Berhasil! Keuntungan harian 3% (${formatIDR(dailyProfitAmountIdr)}) telah masuk ke saldo kas Anda.`);
    }, 600);
  };

  const isClaimedToday = user.lastDailyProfitClaimDate === new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5 pb-8 animate-fade-in">
      {/* Portfolio Header Glass Card */}
      <section className="relative rounded-2xl bg-gradient-to-b from-[#26231F]/90 via-[#1A1816] to-[#0F0E0D] border border-[#2E2820] p-5 sm:p-6 overflow-hidden shadow-xl">
        {/* Subtle Background Scrim */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${APP_IMAGES.profile_banner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0D] via-[#0F0E0D]/80 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <PieChart className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#A0988C]">
                Portofolio Emas Murni
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-400/40 px-3 py-1 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>6 Brand Terverifikasi</span>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block">Total Simpanan Emas Fisik</span>
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mt-1">
              <div className="flex items-baseline gap-1">
                <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-amber-400 tabular-nums">
                  {formatGramsNumberOnly(user.goldHoldingsGram)}
                </h1>
                <span className="text-base sm:text-lg font-bold text-[#A0988C]">gram</span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#8C857B] font-mono tabular-nums">
                ≈ Rp {formatIDRNumberOnly(goldValueIdr)}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#2E2820]">
            <div className="p-3 rounded-xl bg-[#0F0E0D]/80 border border-[#262018]">
              <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block">Saldo Kas Tersedia</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[10px] font-semibold text-[#D4AF37]">Rp</span>
                <span className="font-mono text-sm font-bold text-[#F7F5F2] tabular-nums">
                  {formatIDRNumberOnly(user.balanceIdr)}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0F0E0D]/80 border border-[#262018]">
              <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block">Total Nilai Bersih</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[10px] font-semibold text-emerald-400">Rp</span>
                <span className="font-mono text-sm font-bold text-emerald-300 tabular-nums">
                  {formatIDRNumberOnly(totalWealthIdr)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Trade CTAs */}
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            <button
              onClick={() => onStartTrade('beli')}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50 hover:brightness-110 transition cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Beli Emas Lagi</span>
            </button>
            <button
              onClick={() => onStartTrade('jual')}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-950/50 hover:brightness-110 transition cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Jual / Cairkan Kas</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3% Daily Profit Feature Banner & Claim Card */}
      <section className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#1A1816] to-[#141210] border-2 border-amber-500/40 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0">
              <Percent className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#F7F5F2]">Keuntungan Harian 3%</h3>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                  Daily Yield
                </span>
              </div>
              <p className="text-[11px] text-[#A0988C]">
                Reward dividen pasif harian sebesar 3% dihitung dari nilai portofolio Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Daily Profit Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-[#12110F]/90 border border-amber-500/20">
            <span className="text-[10px] text-[#A0988C] block">Profit Hari Ini (3%)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-bold text-amber-400 font-mono">+Rp</span>
              <span className="text-sm font-bold font-mono text-amber-400 tabular-nums">
                {formatIDRNumberOnly(dailyProfitAmountIdr)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#12110F]/90 border border-amber-500/20">
            <span className="text-[10px] text-[#A0988C] block">Total Profit Terakumulasi</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-bold text-emerald-400 font-mono">+Rp</span>
              <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                {formatIDRNumberOnly(user.dailyProfitEarnedTotal || 450000)}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#12110F]/90 border border-amber-500/20 flex flex-col justify-center">
            <span className="text-[10px] text-[#A0988C] block">Status Klaim Hari Ini</span>
            <span className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${isClaimedToday ? 'text-emerald-400' : 'text-amber-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isClaimedToday ? 'Sudah Diklaim' : 'Siap Diklaim'}
            </span>
          </div>
        </div>

        {/* Claim Action Button */}
        <button
          onClick={handleClaimProfit}
          disabled={isClaiming || isClaimedToday}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            isClaimedToday 
              ? 'bg-[#26231F] border border-[#3E3830] text-[#7A746C] cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-950/50'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>
            {isClaiming 
              ? 'Mengklaim Profit...' 
              : isClaimedToday 
                ? 'Profit Hari Ini Sudah Masuk ke Saldo Kas' 
                : `Klaim Dividen Harian 3% (+Rp ${formatIDRNumberOnly(dailyProfitAmountIdr)})`}
          </span>
        </button>

        {/* Interactive Compound Calculator Projection */}
        <div className="pt-2 border-t border-[#2A241C]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#D4AF37]">
              Simulasi Bunga Bergulung (Compound Profit):
            </span>
            <div className="flex gap-1">
              {[1, 7, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedProjectionDays(days)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    selectedProjectionDays === days 
                      ? 'bg-amber-400 text-slate-950' 
                      : 'bg-[#26231F] text-[#9E978E] hover:text-white'
                  }`}
                >
                  {days} Hari
                </button>
              ))}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#12110F] border border-[#2E2820] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#9E978E]">
              Estimasi Total Keuntungan dlm {selectedProjectionDays} Hari:
            </span>
            <div className="flex items-baseline gap-1 font-mono font-bold text-emerald-400">
              <span className="text-xs">+Rp</span>
              <span className="text-sm tabular-nums">
                {formatIDRNumberOnly(calculateCompoundReturn(selectedProjectionDays))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Gold Brands Breakdown Card */}
      <section className="rounded-2xl bg-[#1A1816]/90 border border-[#2E2820] p-4 sm:p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2]">
              Alokasi 6 Brand Emas Fisik
            </h3>
          </div>
          <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            Kemurnian 99.99%
          </span>
        </div>

        {/* Visual Allocation Bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex gap-0.5 bg-[#26231F]">
          <div style={{ width: '40%' }} className="h-full bg-amber-400" title="ANTAM 40%" />
          <div style={{ width: '20%' }} className="h-full bg-cyan-400" title="PAMP 20%" />
          <div style={{ width: '15%' }} className="h-full bg-emerald-400" title="UBS 15%" />
          <div style={{ width: '10%' }} className="h-full bg-yellow-400" title="Galeri 24 10%" />
          <div style={{ width: '8%' }} className="h-full bg-purple-400" title="Lotus Archi 8%" />
          <div style={{ width: '7%' }} className="h-full bg-rose-400" title="Hartadinata 7%" />
        </div>

        {/* 6 Brand Item Cards with Tinted Fallback Initials */}
        <div className="divide-y divide-[#262018] pt-1">
          {GOLD_BRANDS.map((brand) => {
            const ratio = brandHoldingsRatio[brand.code] || 0.1;
            const grams = Number((user.goldHoldingsGram * ratio).toFixed(2));
            const valueIdr = Math.round(grams * currentBuyPrice);
            const brandToken = THEME.colors.brandTokens[brand.code as keyof typeof THEME.colors.brandTokens];

            return (
              <div 
                key={brand.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-white/[0.02] rounded-lg px-1 transition"
              >
                {/* Brand Fallback Initials in Tinted Squircle */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm transition-transform group-hover:scale-105 ${brandToken?.avatarBg || 'bg-amber-950/60 text-amber-300 border border-amber-500/40'}`}>
                    {brand.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#F7F5F2] truncate group-hover:text-amber-300 transition-colors">
                        {brand.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-[#A0988C] truncate mt-0.5">
                      {brand.company} • {brand.purity}
                    </p>
                  </div>
                </div>

                {/* Right: Holding values */}
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-xs font-bold text-amber-400 font-mono tabular-nums">
                      {formatGramsNumberOnly(grams)}
                    </span>
                    <span className="text-[10px] text-[#8C857B]">gr</span>
                  </div>
                  <span className="text-[10px] text-[#A0988C] font-mono block mt-0.5 tabular-nums">
                    Rp {formatIDRNumberOnly(valueIdr)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Physical Certificate CTA Banner */}
        <div className="pt-3 border-t border-[#262018] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-[#EAE6E1]">Simpanan Emas Bersertifikat Resmi</span>
          </div>
          <button
            onClick={onOpenCertificate}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
          >
            <span>Cetak Sertifikat</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
