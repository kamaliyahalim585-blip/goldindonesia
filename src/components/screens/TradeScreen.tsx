import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Check, 
  Info, 
  ShieldCheck, 
  Sparkles,
  Wallet,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { GoldBrand, TradeType, Transaction, UserAccount } from '../../types';
import { GOLD_BRANDS, BASE_BUY_PRICE, BASE_SELL_PRICE, formatIDR, formatGrams } from '../../data/mockData';

interface TradeScreenProps {
  user: UserAccount;
  initialType?: TradeType;
  onCompleteTransaction: (transaction: Transaction, newBalance: number, newGoldHoldings: number) => void;
  onBack?: () => void;
}

const QUICK_GRAMS = [0.5, 1, 2, 5, 10, 25, 50];

export const TradeScreen: React.FC<TradeScreenProps> = ({
  user,
  initialType = 'beli',
  onCompleteTransaction,
  onBack
}) => {
  const [tradeType, setTradeType] = useState<TradeType>(initialType);
  const [selectedBrand, setSelectedBrand] = useState<GoldBrand>(GOLD_BRANDS[0]);
  const [inputMode, setInputMode] = useState<'gram' | 'idr'>('gram');
  const [gramValue, setGramValue] = useState<string>('1');
  const [idrValue, setIdrValue] = useState<string>('');
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<'saldo' | 'bank_va'>('saldo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Price calculation based on brand premium
  const currentBasePrice = tradeType === 'beli' ? BASE_BUY_PRICE : BASE_SELL_PRICE;
  const brandPricePerGram = currentBasePrice + selectedBrand.premiumPerGram;

  // Derive Grams and Total Rupiah
  const parsedGrams = parseFloat(gramValue) || 0;
  const totalAmountIdr = Math.round(parsedGrams * brandPricePerGram);

  // Quick gram button handler
  const handleSelectQuickGram = (grams: number) => {
    setGramValue(grams.toString());
    setIdrValue(Math.round(grams * brandPricePerGram).toLocaleString('id-ID'));
    setErrorMessage(null);
  };

  // Gram input change
  const handleGramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGramValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setIdrValue(Math.round(num * brandPricePerGram).toLocaleString('id-ID'));
    } else {
      setIdrValue('');
    }
    setErrorMessage(null);
  };

  // Rupiah input change
  const handleIdrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanStr = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr, 10);
    if (!isNaN(num)) {
      setIdrValue(num.toLocaleString('id-ID'));
      const calculatedGrams = (num / brandPricePerGram).toFixed(4);
      setGramValue(calculatedGrams);
    } else {
      setIdrValue('');
      setGramValue('');
    }
    setErrorMessage(null);
  };

  // Submit Transaction
  const handleSubmit = () => {
    if (parsedGrams <= 0) {
      setErrorMessage('Masukkan jumlah emas yang valid.');
      return;
    }

    if (tradeType === 'beli') {
      if (selectedPaymentSource === 'saldo' && totalAmountIdr > user.balanceIdr) {
        setErrorMessage(`Saldo kas Anda (${formatIDR(user.balanceIdr)}) tidak mencukupi untuk transaksi sebesar ${formatIDR(totalAmountIdr)}. Silakan lakukan deposit terlebih dahulu.`);
        return;
      }
    } else {
      // Jual
      if (parsedGrams > user.goldHoldingsGram) {
        setErrorMessage(`Simpanan emas Anda (${formatGrams(user.goldHoldingsGram)}) tidak mencukupi untuk penjualan ${formatGrams(parsedGrams)}.`);
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      let newBalance = user.balanceIdr;
      let newHoldings = user.goldHoldingsGram;

      if (tradeType === 'beli') {
        if (selectedPaymentSource === 'saldo') {
          newBalance = user.balanceIdr - totalAmountIdr;
        }
        newHoldings = Number((user.goldHoldingsGram + parsedGrams).toFixed(4));
      } else {
        newBalance = user.balanceIdr + totalAmountIdr;
        newHoldings = Number((user.goldHoldingsGram - parsedGrams).toFixed(4));
      }

      const newTx: Transaction = {
        id: `TRX-${Math.floor(10000 + Math.random() * 90000)}`,
        category: tradeType,
        title: tradeType === 'beli' ? `Pembelian Emas ${selectedBrand.code}` : `Penjualan Emas ${selectedBrand.code}`,
        brandCode: selectedBrand.code,
        brandName: selectedBrand.name,
        goldGrams: parsedGrams,
        amountIdr: totalAmountIdr,
        pricePerGram: brandPricePerGram,
        taxOrFee: 0,
        date: 'Hari ini, Baru saja',
        timestamp: Date.now(),
        status: 'Approved',
        paymentMethod: tradeType === 'beli' 
          ? (selectedPaymentSource === 'saldo' ? 'Saldo Kas IndoGold' : 'BCA Virtual Account')
          : 'Pencairan ke Saldo Kas'
      };

      setIsProcessing(false);
      onCompleteTransaction(newTx, newBalance, newHoldings);
    }, 900);
  };

  return (
    <div className="relative pb-28 animate-fade-in">
      {/* Back button if opened from home action */}
      {onBack && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer py-1.5 px-3 rounded-xl bg-[#1A1816] border border-[#2E2820]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </button>
          <span className="text-[11px] text-[#9E978E]">Transaksi Emas Fisik</span>
        </div>
      )}

      {/* Tab Switcher: Beli vs Jual (Bold & High Contrast) */}
      <div className="flex p-1.5 bg-[#141210] rounded-2xl border border-[#2E2820] mb-5 shadow-lg">
        <button
          onClick={() => {
            setTradeType('beli');
            setErrorMessage(null);
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            tradeType === 'beli'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400 shadow-md shadow-emerald-950/60 scale-[1.02]'
              : 'text-[#9E978E] hover:text-[#F7F5F2] hover:bg-white/5'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Beli Emas</span>
        </button>

        <button
          onClick={() => {
            setTradeType('jual');
            setErrorMessage(null);
          }}
          className={`flex-1 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            tradeType === 'jual'
              ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-red-600 text-white border border-rose-400 shadow-md shadow-rose-950/60 scale-[1.02]'
              : 'text-[#9E978E] hover:text-[#F7F5F2] hover:bg-white/5'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          <span>Jual Emas</span>
        </button>
      </div>

      {/* Brand Selection - Colorful & Distinctive Produsen Emas */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#F7F5F2] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Pilih Produsen Emas Terakreditasi (6 Brand)
          </label>
          <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
            99.99% Murni (24K)
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {GOLD_BRANDS.map((brand) => {
            const isSelected = selectedBrand.id === brand.id;
            
            // Distinctive color themes per brand
            const brandThemes: Record<string, { bg: string; text: string; border: string; glow: string }> = {
              antam: { bg: 'bg-gradient-to-br from-amber-400 to-amber-600', text: 'text-slate-950', border: 'border-amber-300', glow: 'shadow-[0_0_16px_rgba(251,191,36,0.35)]' },
              ubs: { bg: 'bg-gradient-to-br from-teal-400 to-emerald-600', text: 'text-slate-950', border: 'border-teal-300', glow: 'shadow-[0_0_16px_rgba(20,184,166,0.35)]' },
              pamp: { bg: 'bg-gradient-to-br from-sky-400 to-blue-600', text: 'text-white', border: 'border-sky-300', glow: 'shadow-[0_0_16px_rgba(56,189,248,0.35)]' },
              g24: { bg: 'bg-gradient-to-br from-yellow-400 to-amber-600', text: 'text-slate-950', border: 'border-yellow-300', glow: 'shadow-[0_0_16px_rgba(234,179,8,0.35)]' },
              lotus: { bg: 'bg-gradient-to-br from-fuchsia-400 to-purple-600', text: 'text-white', border: 'border-fuchsia-300', glow: 'shadow-[0_0_16px_rgba(217,70,239,0.35)]' },
              harta: { bg: 'bg-gradient-to-br from-rose-400 to-orange-500', text: 'text-white', border: 'border-rose-300', glow: 'shadow-[0_0_16px_rgba(251,113,133,0.35)]' },
            };
            const theme = brandThemes[brand.id] || brandThemes.antam;

            return (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand)}
                className={`flex flex-col items-center shrink-0 p-3 rounded-2xl transition-all cursor-pointer ${
                  isSelected
                    ? `bg-[#241F18] border-2 ${theme.border} ${theme.glow} scale-105`
                    : 'bg-[#1A1816]/80 border border-[#2E2820] hover:border-[#4A433D]'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-serif font-extrabold transition-transform shadow-md ${theme.bg} ${theme.text}`}
                >
                  <span className="tracking-wider">{brand.initials}</span>
                </div>
                <span className={`text-xs font-semibold mt-2 transition ${isSelected ? 'text-amber-300' : 'text-[#EAE6E1]'}`}>
                  {brand.code}
                </span>
                <span className="text-[10px] text-[#A0988C] font-mono">{brand.purity.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Brand Brief */}
        <div className="mt-2 p-3.5 rounded-xl bg-gradient-to-r from-[#1E1B15] to-[#14120E] border border-amber-500/30 flex items-center justify-between text-xs shadow-sm">
          <div>
            <span className="text-[#F7F5F2] font-serif font-bold text-sm block">{selectedBrand.name}</span>
            <p className="text-[11px] text-[#9E978E]">{selectedBrand.company}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-amber-400 font-mono block">{formatIDR(brandPricePerGram)} / gr</span>
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 inline-block mt-0.5">
              Sertifikat Garansi Asli
            </span>
          </div>
        </div>
      </section>

      {/* Input Conversion Form */}
      <section className="bg-[#1A1816]/80 backdrop-blur-md rounded-2xl border border-[#2E2A26] p-4 sm:p-5 mb-5 space-y-4">
        {/* Gram Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-[#9E978E]">Jumlah Emas (Gram)</label>
            <span className="text-[11px] text-[#9E978E]">
              {tradeType === 'jual' ? `Simpanan: ${formatGrams(user.goldHoldingsGram)}` : 'Minimal 0,01 gr'}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={gramValue}
              onChange={handleGramChange}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-[#0F0E0D] border border-[#2E2A26] rounded-xl text-[#F7F5F2] text-lg font-serif focus:outline-none focus:border-[#D4AF37] transition"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#D4AF37]">
              Gram
            </span>
          </div>
        </div>

        {/* Quick Gram Selector Chips (Vibrant & Bold) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#A0988C] uppercase tracking-wider">Pilihan Cepat Berat:</span>
            <span className="text-[10px] text-amber-300">Sentuh untuk memilih</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_GRAMS.map((g) => {
              const isGramSelected = parsedGrams === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleSelectQuickGram(g)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isGramSelected
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-2 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.4)] scale-105'
                      : 'bg-[#1E1B17] text-[#EAE6E1] border border-[#332C24] hover:border-amber-400/50 hover:bg-white/5'
                  }`}
                >
                  {g} gr
                </button>
              );
            })}
          </div>
        </div>

        {/* Equivalent IDR Input */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-[#F7F5F2]">Estimasi Total Nilai (IDR)</label>
            {tradeType === 'beli' && (
              <span className="text-[11px] font-mono text-emerald-400">
                Saldo Kas: {formatIDR(user.balanceIdr)}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A0988C]">
              Rp
            </span>
            <input
              type="text"
              value={idrValue}
              onChange={handleIdrChange}
              placeholder="0"
              className="w-full pl-11 pr-4 py-3 bg-[#0F0E0D] border border-[#2E2820] rounded-xl text-[#F7F5F2] text-lg font-serif focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Payment Source Selection (If Beli) - Bold & Distinctive */}
        {tradeType === 'beli' && (
          <div className="pt-3 border-t border-[#2A2620]">
            <span className="text-xs font-bold text-[#F7F5F2] uppercase tracking-wider block mb-2.5">
              Pilihan Sumber Dana Pembayaran
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedPaymentSource('saldo')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  selectedPaymentSource === 'saldo'
                    ? 'bg-gradient-to-br from-emerald-950/60 to-[#12231A] border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.3)] scale-[1.02]'
                    : 'bg-[#0F0E0D] border-[#2A2620] text-[#9E978E] hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F7F5F2]">Saldo IndoGold</span>
                  {selectedPaymentSource === 'saldo' ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#4A433D]" />
                  )}
                </div>
                <span className="text-xs font-bold text-emerald-400 block mt-1 font-mono">
                  {formatIDR(user.balanceIdr)}
                </span>
                <span className="text-[9px] text-emerald-300/80 block mt-0.5">Potong Saldo Instan</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentSource('bank_va')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  selectedPaymentSource === 'bank_va'
                    ? 'bg-gradient-to-br from-sky-950/60 to-[#121E23] border-sky-400 shadow-[0_0_16px_rgba(14,165,233,0.3)] scale-[1.02]'
                    : 'bg-[#0F0E0D] border-[#2A2620] text-[#9E978E] hover:border-sky-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F7F5F2]">Virtual Account</span>
                  {selectedPaymentSource === 'bank_va' ? (
                    <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-slate-950">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#4A433D]" />
                  )}
                </div>
                <span className="text-xs font-bold text-sky-400 block mt-1">BCA / Mandiri / BRI</span>
                <span className="text-[9px] text-sky-300/80 block mt-0.5">Verifikasi Otomatis 24J</span>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-[#7A2A2A]/25 border border-[#7A2A2A] text-[#FFB3B3] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Breakdown summary */}
        <div className="pt-3 border-t border-[#24211E] space-y-1.5 text-xs text-[#9E978E]">
          <div className="flex justify-between">
            <span>Harga per gram</span>
            <span className="text-[#F7F5F2]">{formatIDR(brandPricePerGram)}</span>
          </div>
          <div className="flex justify-between">
            <span>Biaya Layanan / Sertifikat</span>
            <span className="text-[#8CEB9C]">Rp 0 (Promo Bebas Biaya)</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak PPh 22 Emas Fisik</span>
            <span className="text-[#8CEB9C]">0% (Sesuai PMK 48/2023)</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#24211E] text-sm">
            <span className="text-[#F7F5F2]">
              {tradeType === 'beli' ? 'Total Pembayaran' : 'Total Dana Diterima'}
            </span>
            <span className="font-serif text-[#D4AF37] text-base">
              {formatIDR(totalAmountIdr)}
            </span>
          </div>
        </div>
      </section>

      {/* Sticky Bottom CTA respecting safe area */}
      <div className="fixed bottom-16 left-0 right-0 z-30 p-4 bg-gradient-to-t from-[#0F0E0D] via-[#0F0E0D]/95 to-transparent backdrop-blur-md">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={isProcessing || parsedGrams <= 0}
            className={`w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xl ${
              isProcessing || parsedGrams <= 0
                ? 'bg-[#201D1A] text-[#7E776E] border border-[#2E2820] cursor-not-allowed'
                : tradeType === 'beli'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_4px_25px_rgba(16,185,129,0.45)] border-2 border-emerald-300 active:scale-[0.99]'
                : 'bg-gradient-to-r from-rose-500 via-amber-600 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-[0_4px_25px_rgba(244,63,94,0.45)] border-2 border-rose-300 active:scale-[0.99]'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                <span>Memproses Pesanan Emas...</span>
              </>
            ) : tradeType === 'beli' ? (
              <>
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                <span>Konfirmasi Beli Emas {selectedBrand.code} ({formatIDR(totalAmountIdr)})</span>
              </>
            ) : (
              <>
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                <span>Konfirmasi Jual Emas {selectedBrand.code} ({formatGrams(parsedGrams)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
