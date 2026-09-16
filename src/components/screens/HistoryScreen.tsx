import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  PlusCircle, 
  WalletCards, 
  Search, 
  Filter, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Transaction, TransactionCategory, ScreenTab } from '../../types';
import { 
  APP_IMAGES, 
  formatIDR, 
  formatIDRNumberOnly, 
  formatGrams, 
  formatGramsNumberOnly 
} from '../../data/mockData';

interface HistoryScreenProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateTab: (tab: ScreenTab) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  transactions,
  onSelectTransaction,
  onNavigateTab
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs: { key: string; label: string; activeClass: string }[] = [
    { key: 'all', label: 'Semua Transaksi', activeClass: 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)]' },
    { key: 'beli', label: 'Beli Emas', activeClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]' },
    { key: 'jual', label: 'Jual Emas', activeClass: 'bg-gradient-to-r from-rose-500 to-red-500 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.35)]' },
    { key: 'deposit', label: 'Deposit Kas', activeClass: 'bg-gradient-to-r from-sky-500 to-blue-500 text-slate-950 border-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.35)]' },
    { key: 'tarik', label: 'Tarik Saldo', activeClass: 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]' }
  ];

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedFilter !== 'all' && tx.category !== selectedFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        tx.title.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        (tx.brandName && tx.brandName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusChip = (status: Transaction['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-sm">
            Berhasil
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-500/50 shadow-sm">
            Diproses
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-500/50 shadow-sm">
            Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryMeta = (category: TransactionCategory) => {
    switch (category) {
      case 'beli':
        return {
          icon: <ArrowDownLeft className="w-4 h-4 text-emerald-400 stroke-[2.5]" />,
          bg: 'bg-emerald-950/70 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
        };
      case 'jual':
        return {
          icon: <ArrowUpRight className="w-4 h-4 text-rose-400 stroke-[2.5]" />,
          bg: 'bg-rose-950/70 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
        };
      case 'deposit':
        return {
          icon: <PlusCircle className="w-4 h-4 text-sky-400 stroke-[2.5]" />,
          bg: 'bg-sky-950/70 border border-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
        };
      case 'tarik':
        return {
          icon: <WalletCards className="w-4 h-4 text-purple-400 stroke-[2.5]" />,
          bg: 'bg-purple-950/70 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
        };
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Title & Stats */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-serif text-2xl text-[#F7F5F2]">Riwayat Transaksi</h2>
          <p className="text-xs text-[#9E978E]">Buku catatan seluruh mutasi emas & dana kas</p>
        </div>
        <span className="text-xs text-[#D4AF37] font-mono">{filteredTransactions.length} Rekor</span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9E978E] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari ID transaksi atau nama..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#1A1816] border border-[#2E2A26] rounded-xl text-xs text-[#F7F5F2] placeholder-[#9E978E] focus:outline-none focus:border-[#D4AF37] transition"
        />
      </div>

      {/* Filter Tabs (Bold & Distinctive) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isFilterActive = selectedFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                isFilterActive
                  ? `${tab.activeClass} scale-105`
                  : 'bg-[#181512] text-[#9E978E] border border-[#2E2820] hover:text-[#F7F5F2] hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Transactions List or Empty State */}
      {filteredTransactions.length === 0 ? (
        /* Empty State with empty_portfolio image */
        <div className="relative rounded-2xl overflow-hidden border border-[#2E2820] my-6 p-8 text-center shadow-lg">
          {/* Background image with dark linear gradient scrim */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${APP_IMAGES.empty_portfolio})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0D] via-[#0F0E0D]/90 to-[#0F0E0D]/60" />

          <div className="relative z-10 max-w-xs mx-auto space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center shadow-md">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#F7F5F2]">Belum Ada Transaksi</h3>
            <p className="text-xs text-[#9E978E] leading-relaxed">
              Mulai langkah investasi pertama Anda dengan emas murni berstandar SNI dan internasional.
            </p>
            <button
              onClick={() => onNavigateTab('trade')}
              className="mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 hover:brightness-110 transition cursor-pointer"
            >
              Mulai Beli Emas Sekarang
            </button>
          </div>
        </div>
      ) : (
        /* Vertical List with minimal divider */
        <div className="rounded-2xl bg-[#1A1816]/90 backdrop-blur-md border border-[#2E2820] overflow-hidden divide-y divide-[#28231C] shadow-lg">
          {filteredTransactions.map((tx) => {
            const meta = getCategoryMeta(tx.category);
            const isOutflow = tx.category === 'beli' || tx.category === 'tarik';

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="p-4 hover:bg-[#262018]/60 transition cursor-pointer flex items-center justify-between gap-3 group"
              >
                {/* Left: Icon & Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${meta.bg}`}>
                    {meta.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#F7F5F2] truncate group-hover:text-amber-300 transition-colors">
                        {tx.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#A0988C]">{tx.date}</span>
                      {tx.goldGrams && (
                        <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30 tabular-nums">
                          {formatGramsNumberOnly(tx.goldGrams)} gr
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Semantic Status Chip */}
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <div className={`flex items-baseline gap-1 font-mono font-bold text-xs tabular-nums ${isOutflow ? 'text-rose-400' : 'text-emerald-400'}`}>
                    <span>{isOutflow ? '-Rp' : '+Rp'}</span>
                    <span className="text-sm">{formatIDRNumberOnly(tx.amountIdr)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getStatusChip(tx.status)}
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E675E] group-hover:text-amber-400 transition" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
