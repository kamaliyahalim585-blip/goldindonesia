import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Info,
  Maximize2
} from 'lucide-react';
import { HISTORICAL_30D_GOLD_DATA, formatIDR } from '../data/mockData';
import { HistoricalGoldPricePoint } from '../types';

type ViewMode = 'beli' | 'jual' | 'both';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: HistoricalGoldPricePoint;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.dailyChange >= 0;

    return (
      <div className="rounded-xl bg-[#1A1816]/95 backdrop-blur-md border border-[#D4AF37]/50 p-3 shadow-2xl text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-[#2E2A26] pb-1.5 mb-1">
          <span className="text-[#9E978E] text-[11px] font-medium">{data.fullDate}</span>
          <span className="text-[10px] text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#4A3C13]/50">Hari ke-{data.dayNumber}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#EAE6E1]">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              Harga Beli:
            </span>
            <span className="text-[#F7F5F2] font-semibold">{formatIDR(data.buyPrice)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#EAE6E1]">
              <span className="w-2 h-2 rounded-full bg-[#F3E5AB]" />
              Harga Buyback:
            </span>
            <span className="text-[#F3E5AB] font-semibold">{formatIDR(data.sellPrice)}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#24211E]">
            <span className="text-[#9E978E]">Selisih Spread:</span>
            <span className="text-[#9E978E]">{formatIDR(data.spread)}</span>
          </div>

          {data.dayNumber > 1 && (
            <div className="flex items-center justify-between text-[10px] pt-0.5">
              <span className="text-[#9E978E]">Perubahan Harian:</span>
              <span className={`flex items-center gap-0.5 font-medium ${isPositive ? 'text-[#8CEB9C]' : 'text-[#F87171]'}`}>
                {isPositive ? '+' : ''}{formatIDR(data.dailyChange)} ({isPositive ? '+' : ''}{data.dailyChangePct}%)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const HistoricalGoldChartRecharts: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [showAverageLine, setShowAverageLine] = useState<boolean>(true);

  // Statistics calculation for the 30-day window
  const stats = useMemo(() => {
    const data = HISTORICAL_30D_GOLD_DATA;
    if (!data.length) return null;

    const first = data[0];
    const last = data[data.length - 1];
    const diffBuy = last.buyPrice - first.buyPrice;
    const diffBuyPct = (diffBuy / first.buyPrice) * 100;

    let minBuy = data[0].buyPrice;
    let maxBuy = data[0].buyPrice;
    let minPoint = data[0];
    let maxPoint = data[0];
    let totalBuy = 0;

    data.forEach((p) => {
      totalBuy += p.buyPrice;
      if (p.buyPrice < minBuy) {
        minBuy = p.buyPrice;
        minPoint = p;
      }
      if (p.buyPrice > maxBuy) {
        maxBuy = p.buyPrice;
        maxPoint = p;
      }
    });

    const avgBuy = Math.round(totalBuy / data.length);

    return {
      first,
      last,
      diffBuy,
      diffBuyPct,
      minPoint,
      maxPoint,
      avgBuy
    };
  }, []);

  // Format y-axis values cleanly (e.g., 1.41 jt)
  const formatYAxis = (val: number) => {
    const inMillions = val / 1000000;
    return `${inMillions.toFixed(2)} jt`;
  };

  return (
    <section className="rounded-2xl bg-[#1A1816]/80 backdrop-blur-md border border-[#2E2A26] p-4 sm:p-5 relative overflow-hidden shadow-lg">
      {/* Glow highlight */}
      <div className="absolute top-0 right-1/4 w-56 h-56 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#4A3C13]/60 border border-[#D4AF37]/30 text-[#D4AF37]">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-serif tracking-tight text-[#F7F5F2]">
              Tren Harga Emas 30 Hari Terakhir
            </h2>
          </div>
          <p className="text-[11px] text-[#9E978E] mt-1 flex items-center gap-1.5">
            <span>Visualisasi historis berbasis Recharts</span>
            <span className="inline-block w-1 h-1 rounded-full bg-[#D4AF37]" />
            <span>15 Agu - 13 Sep 2026</span>
          </p>
        </div>

        {/* 30D Return Badge */}
        {stats && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#0F0E0D] border border-[#24211E] px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-[#2E5C3E]/30 border border-[#2E5C3E] flex items-center justify-center text-[#8CEB9C]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[#9E978E] block uppercase tracking-wider">Perubahan 30 Hari</span>
              <span className="text-xs text-[#8CEB9C] font-semibold">
                +{stats.diffBuyPct.toFixed(2)}% (+{formatIDR(stats.diffBuy)})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mode Selector & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pt-1 border-t border-[#24211E]">
        {/* Toggle Mode */}
        <div className="flex items-center bg-[#0F0E0D] p-1 rounded-xl border border-[#24211E]">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'both'
                ? 'bg-[#4A3C13] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm font-medium'
                : 'text-[#9E978E] hover:text-[#EAE6E1]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Keduanya</span>
          </button>
          <button
            onClick={() => setViewMode('beli')}
            className={`px-3 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'beli'
                ? 'bg-[#4A3C13] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm font-medium'
                : 'text-[#9E978E] hover:text-[#EAE6E1]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span>Harga Beli</span>
          </button>
          <button
            onClick={() => setViewMode('jual')}
            className={`px-3 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'jual'
                ? 'bg-[#4A3C13] text-[#F3E5AB] border border-[#F3E5AB]/40 shadow-sm font-medium'
                : 'text-[#9E978E] hover:text-[#EAE6E1]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#F3E5AB]" />
            <span>Harga Buyback</span>
          </button>
        </div>

        {/* Average Line Toggle */}
        <button
          onClick={() => setShowAverageLine(!showAverageLine)}
          className={`px-2.5 py-1 rounded-lg text-[11px] border transition cursor-pointer flex items-center gap-1.5 ${
            showAverageLine 
              ? 'bg-[#26231F] border-[#D4AF37]/40 text-[#D4AF37]' 
              : 'bg-[#0F0E0D] border-[#24211E] text-[#9E978E] hover:text-[#EAE6E1]'
          }`}
        >
          <span>Garis Rata-rata</span>
          <span className={`w-1.5 h-1.5 rounded-full ${showAverageLine ? 'bg-[#D4AF37]' : 'bg-[#4A433D]'}`} />
        </button>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="w-full h-64 sm:h-72 -ml-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={HISTORICAL_30D_GOLD_DATA}
            margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
          >
            <defs>
              {/* Gradient for Harga Beli */}
              <linearGradient id="rechartsBuyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
              </linearGradient>

              {/* Gradient for Harga Buyback */}
              <linearGradient id="rechartsSellGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F3E5AB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F3E5AB" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#2E2A26" 
              vertical={false} 
              opacity={0.7}
            />

            <XAxis
              dataKey="date"
              stroke="#9E978E"
              tickLine={false}
              axisLine={{ stroke: '#2E2A26' }}
              tick={{ fill: '#9E978E', fontSize: 10 }}
              interval={4} // show every 5th day cleanly on mobile and desktop
            />

            <YAxis
              stroke="#9E978E"
              tickLine={false}
              axisLine={{ stroke: '#2E2A26' }}
              tick={{ fill: '#9E978E', fontSize: 10 }}
              domain={['dataMin - 15000', 'dataMax + 10000']}
              tickFormatter={formatYAxis}
              width={52}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Average Reference Line */}
            {showAverageLine && stats && (
              <ReferenceLine
                y={stats.avgBuy}
                stroke="#D4AF37"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: `Rata² ${formatYAxis(stats.avgBuy)}`,
                  fill: '#D4AF37',
                  fontSize: 9,
                  position: 'insideTopRight'
                }}
              />
            )}

            {/* Area for Harga Beli */}
            {(viewMode === 'both' || viewMode === 'beli') && (
              <Area
                type="monotone"
                dataKey="buyPrice"
                name="Harga Beli"
                stroke="#D4AF37"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rechartsBuyGradient)"
                activeDot={{
                  r: 5,
                  fill: '#F3E5AB',
                  stroke: '#0F0E0D',
                  strokeWidth: 2
                }}
              />
            )}

            {/* Area for Harga Buyback */}
            {(viewMode === 'both' || viewMode === 'jual') && (
              <Area
                type="monotone"
                dataKey="sellPrice"
                name="Harga Buyback"
                stroke="#F3E5AB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rechartsSellGradient)"
                activeDot={{
                  r: 4,
                  fill: '#D4AF37',
                  stroke: '#0F0E0D',
                  strokeWidth: 2
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4 Quick Stat Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#24211E]">
          {/* 1. Harga Terendah */}
          <div className="bg-[#0F0E0D]/70 p-2.5 rounded-xl border border-[#24211E]">
            <span className="text-[10px] text-[#9E978E] block flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-[#F87171]" />
              Terendah (30H)
            </span>
            <span className="text-xs font-semibold text-[#F7F5F2] mt-0.5 block">
              {formatIDR(stats.minPoint.buyPrice)}
            </span>
            <span className="text-[9px] text-[#9E978E]">{stats.minPoint.date} 2026</span>
          </div>

          {/* 2. Harga Tertinggi */}
          <div className="bg-[#0F0E0D]/70 p-2.5 rounded-xl border border-[#24211E]">
            <span className="text-[10px] text-[#9E978E] block flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#8CEB9C]" />
              Tertinggi (30H)
            </span>
            <span className="text-xs font-semibold text-[#D4AF37] mt-0.5 block">
              {formatIDR(stats.maxPoint.buyPrice)}
            </span>
            <span className="text-[9px] text-[#9E978E]">{stats.maxPoint.date} 2026</span>
          </div>

          {/* 3. Rata-rata Harga */}
          <div className="bg-[#0F0E0D]/70 p-2.5 rounded-xl border border-[#24211E]">
            <span className="text-[10px] text-[#9E978E] block">Rata-rata (30H)</span>
            <span className="text-xs font-semibold text-[#EAE6E1] mt-0.5 block">
              {formatIDR(stats.avgBuy)}
            </span>
            <span className="text-[9px] text-[#9E978E]">Volatilitas Stabil</span>
          </div>

          {/* 4. Selisih Spread */}
          <div className="bg-[#0F0E0D]/70 p-2.5 rounded-xl border border-[#24211E]">
            <span className="text-[10px] text-[#9E978E] block">Spread Beli/Buyback</span>
            <span className="text-xs font-semibold text-[#F3E5AB] mt-0.5 block">
              Rp 60.000 / gr
            </span>
            <span className="text-[9px] text-[#9E978E]">Standar Pasar Fisik</span>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-[#9E978E] pt-2 border-t border-[#24211E]/60">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-[#D4AF37]" />
          Arahkan kursor atau sentuh grafik untuk melihat rincian tanggal tertentu.
        </span>
        <span className="hidden sm:inline text-[#D4AF37]">IndoGold Market Index</span>
      </div>
    </section>
  );
};
