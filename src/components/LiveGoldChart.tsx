import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Radio } from 'lucide-react';
import { CHART_DATA_BY_PERIOD, BASE_BUY_PRICE, BASE_SELL_PRICE, formatIDR } from '../data/mockData';
import { ChartPeriod } from '../types';

interface LiveGoldChartProps {
  buyPrice?: number;
  sellPrice?: number;
  lastUpdated?: Date;
  isUpdatingLive?: boolean;
  onManualRefresh?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const PERIODS: ChartPeriod[] = [
  { key: '1D', label: '1H' },
  { key: '1W', label: '1M' },
  { key: '1M', label: '1B' },
  { key: '1Y', label: '1T' },
  { key: 'ALL', label: 'Semua' }
];

export const LiveGoldChart: React.FC<LiveGoldChartProps> = ({ 
  buyPrice = BASE_BUY_PRICE, 
  sellPrice = BASE_SELL_PRICE,
  lastUpdated,
  isUpdatingLive = false,
  onManualRefresh,
  onRefresh, 
  isRefreshing = false 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1D');
  const [hoveredPoint, setHoveredPoint] = useState<{ time: string; price: number; x: number; y: number } | null>(null);

  const rawData = CHART_DATA_BY_PERIOD[selectedPeriod] || CHART_DATA_BY_PERIOD['1D'];
  // If in 1D period, update the latest point with current live buyPrice
  const data = selectedPeriod === '1D' && rawData.length > 0
    ? [...rawData.slice(0, -1), { ...rawData[rawData.length - 1], price: buyPrice }]
    : rawData;

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const priceRange = maxPrice - minPrice || 1;

  // Chart dimensions
  const svgWidth = 400;
  const svgHeight = 150;
  const paddingX = 15;
  const paddingY = 20;

  // Calculate points
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (svgWidth - paddingX * 2);
    const normalizedY = (d.price - minPrice) / priceRange;
    // higher price = lower y coordinate
    const y = (svgHeight - paddingY) - (normalizedY * (svgHeight - paddingY * 2));
    return { ...d, x, y };
  });

  // Create SVG path string
  const linePath = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  // Closed path for subtle golden gradient area
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`
    : '';

  const activePrice = hoveredPoint ? hoveredPoint.price : buyPrice;
  const timeFormatted = lastUpdated 
    ? lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Baru saja';
  const activeTime = hoveredPoint ? `Waktu: ${hoveredPoint.time}` : `Live Update: ${timeFormatted} (Pembaruan tiap menit)`;

  // Diff from base 1.450.000
  const diffFromBase = buyPrice - BASE_BUY_PRICE;
  const diffFromBasePct = ((diffFromBase / BASE_BUY_PRICE) * 100);
  const totalChangeIdr = 12000 + diffFromBase;
  const totalChangePct = (totalChangeIdr / 1438000) * 100;
  const isPositive = totalChangeIdr >= 0;

  const handleRefreshClick = () => {
    if (onManualRefresh) {
      onManualRefresh();
    } else if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="rounded-2xl bg-[#1A1816]/75 backdrop-blur-md border border-[#2E2A26] p-4 sm:p-5 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs tracking-wider uppercase text-[#9E978E]">Harga Emas Murni 24K</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
              isPositive 
                ? 'bg-[#2E5C3E]/30 border border-[#2E5C3E] text-[#8CEB9C]' 
                : 'bg-[#5C2E2E]/30 border border-[#5C2E2E] text-[#EB8C8C]'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {isPositive ? '+' : ''}{totalChangePct.toFixed(2)}% ({isPositive ? '+' : ''}{formatIDR(totalChangeIdr)})
              </span>
            </div>
            {/* Live Indicator Pulse */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1A1816] border border-[#2E2A26] text-[10px] text-[#D4AF37]">
              <span className={`w-1.5 h-1.5 rounded-full bg-[#D4AF37] ${isUpdatingLive ? 'animate-ping' : 'animate-pulse'}`} />
              <span className="font-medium">LIVE</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="font-serif text-3xl tracking-tight text-[#D4AF37]">
              {formatIDR(activePrice)}
            </span>
            <span className="text-xs text-[#9E978E]">/ gram</span>
          </div>
          <p className="text-[11px] text-[#9E978E] mt-0.5">{activeTime}</p>
        </div>

        {/* Refresh button */}
        {(onManualRefresh || onRefresh) && (
          <button
            onClick={handleRefreshClick}
            className={`p-2 rounded-lg bg-[#26231F] border border-[#2E2A26] text-[#EAE6E1] hover:text-[#D4AF37] hover:border-[#4A433D] transition ${
              isRefreshing || isUpdatingLive ? 'animate-spin text-[#D4AF37]' : ''
            }`}
            title="Perbarui Harga Sekarang"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* SVG Interactive Chart */}
      <div className="w-full relative my-3">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-36 overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#F3E5AB" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaPath} fill="url(#goldGradient)" />

          {/* Line Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Reference grid line */}
          <line
            x1={paddingX}
            y1={svgHeight - 1}
            x2={svgWidth - paddingX}
            y2={svgHeight - 1}
            stroke="#24211E"
            strokeWidth="1"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                className={`transition-all duration-150 ${
                  hoveredPoint && hoveredPoint.time === pt.time
                    ? 'fill-[#F3E5AB] stroke-[#0F0E0D] stroke-2 scale-125'
                    : 'fill-[#D4AF37] opacity-80'
                }`}
              />
              {/* Invisible touch area */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="18"
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(pt)}
                onTouchStart={() => setHoveredPoint(pt)}
              />
            </g>
          ))}

          {/* Active tooltip marker */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingY / 2}
                x2={hoveredPoint.x}
                y2={svgHeight}
                stroke="#4A433D"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill="#F3E5AB"
                stroke="#0F0E0D"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Time labels underneath */}
        <div className="flex justify-between text-[10px] text-[#9E978E] px-2 pt-1 border-t border-[#24211E]">
          {data.map((d, i) => (
            <span key={i} className={i % 2 === 0 || data.length <= 5 ? 'block' : 'hidden sm:block'}>
              {d.time}
            </span>
          ))}
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="flex items-center justify-between gap-1 pt-2">
        <div className="flex items-center gap-1 bg-[#0F0E0D] p-1 rounded-lg border border-[#2E2A26] w-full sm:w-auto">
          {PERIODS.map((period) => (
            <button
              key={period.key}
              onClick={() => {
                setSelectedPeriod(period.key);
                setHoveredPoint(null);
              }}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs transition ${
                selectedPeriod === period.key
                  ? 'bg-[#4A3C13] text-[#D4AF37] border border-[#D4AF37]/40'
                  : 'text-[#9E978E] hover:text-[#EAE6E1]'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Spread Info */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-[#9E978E]">
          <div>
            Beli: <span className="text-[#F7F5F2] font-medium">{formatIDR(buyPrice)}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-[#4A433D]" />
          <div>
            Buyback: <span className="text-[#F7F5F2] font-medium">{formatIDR(sellPrice)}</span>
          </div>
        </div>
      </div>

      {/* Mobile Spread Strip */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#24211E] sm:hidden text-xs">
        <div className="bg-[#0F0E0D]/60 p-2 rounded-lg border border-[#24211E]">
          <span className="text-[10px] text-[#9E978E] block">Harga Beli</span>
          <span className="text-[#F7F5F2] font-medium">{formatIDR(buyPrice)}/gr</span>
        </div>
        <div className="bg-[#0F0E0D]/60 p-2 rounded-lg border border-[#24211E]">
          <span className="text-[10px] text-[#9E978E] block">Harga Buyback</span>
          <span className="text-[#F7F5F2] font-medium">{formatIDR(sellPrice)}/gr</span>
        </div>
      </div>
    </div>
  );
};
