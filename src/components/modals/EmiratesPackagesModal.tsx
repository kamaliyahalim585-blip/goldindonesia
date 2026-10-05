import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight, 
  TrendingUp, 
  Coins, 
  Wallet, 
  Building2, 
  FileCheck2,
  Lock,
  AlertCircle
} from 'lucide-react';
import { UserAccount, EmiratesPackage, Transaction } from '../../types';
import { EMIRATES_PACKAGES, formatIDR, formatIDRNumberOnly, formatGrams } from '../../data/mockData';
import { PinVerificationModal } from '../PinVerificationModal';

interface EmiratesPackagesModalProps {
  user: UserAccount;
  onClose: () => void;
  onActivatePackage: (pkg: EmiratesPackage) => void;
  onGoToDeposit: (suggestedAmount: number) => void;
  onShowToast: (msg: string) => void;
}

export const EmiratesPackagesModal: React.FC<EmiratesPackagesModalProps> = ({
  user,
  onClose,
  onActivatePackage,
  onGoToDeposit,
  onShowToast
}) => {
  const [selectedTier, setSelectedTier] = useState<'bronze' | 'gold' | 'platinum'>('gold');
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const activePackage = EMIRATES_PACKAGES.find((p) => p.id === selectedTier) || EMIRATES_PACKAGES[1];
  const userBalance = user.balanceIdr || 0;
  const isBalanceSufficient = userBalance >= activePackage.priceIdr;
  const balanceDeficit = Math.max(0, activePackage.priceIdr - userBalance);

  const handleStartPurchase = () => {
    if (!isBalanceSufficient) {
      onShowToast(`Saldo kas Anda kurang Rp ${formatIDRNumberOnly(balanceDeficit)}. Membuka menu deposit...`);
      onGoToDeposit(activePackage.priceIdr);
      onClose();
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
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1C1813] via-[#141210] to-[#0D0C0B] border border-[#D4AF37]/50 shadow-2xl text-[#F7F5F2] flex flex-col">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-5 sm:p-6 border-b border-[#2C261D] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-[#D4AF37]/30 shrink-0">
              <Award className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Resmi Dubai UAE
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Sertifikasi LBMA
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F7F5F2] mt-0.5">
                Paket Investasi Emirates Gold 24K
              </h2>
              <p className="text-xs text-[#A0988C] mt-0.5">
                Emas batangan murni berlisensi internasional dengan cashback tunai instan hingga 25%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#221D17] text-[#A0988C] hover:text-[#F7F5F2] hover:bg-[#2C261D] transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="relative z-10 p-5 sm:p-6 space-y-6 flex-1">
          {/* Tier Switcher Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#0F0D0B] border border-[#2B241A]">
            {EMIRATES_PACKAGES.map((pkg) => {
              const isSelected = selectedTier === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedTier(pkg.id)}
                  className={`py-3 px-2 rounded-xl text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-[#D4AF37] shadow-lg shadow-black/50'
                      : 'hover:bg-[#1C1814] text-[#A0988C] border border-transparent'
                  }`}
                >
                  {pkg.id === 'gold' && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-300 text-slate-950 shadow">
                      Terfavorit
                    </span>
                  )}
                  <div className="text-xs sm:text-sm font-bold text-[#F7F5F2]">
                    {pkg.tier}
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-[#D4AF37] mt-0.5">
                    Rp {formatIDRNumberOnly(pkg.priceIdr / 1000000)} Jt
                  </div>
                  <div className="text-[10px] font-bold text-emerald-400 mt-0.5">
                    Bonus +{pkg.bonusPercent}%
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Package Hero Card */}
          <div className="relative rounded-3xl p-6 overflow-hidden border border-[#D4AF37]/60 shadow-xl bg-gradient-to-b from-[#241F17] via-[#1A1612] to-[#12100E]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#342C20]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/40">
                    Tier {activePackage.tier}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                    {activePackage.badge}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#F7F5F2] mt-2">
                  {activePackage.name}
                </h3>
                <p className="text-xs text-[#A0988C] mt-1 max-w-md">
                  {activePackage.description}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-[#8C857B] block font-semibold">
                  Nilai Investasi Paket
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#F7F5F2] mt-0.5 block tracking-tight">
                  {formatIDR(activePackage.priceIdr)}
                </span>
                <span className="text-[11px] text-[#A0988C]">
                  Sekali bayar • Imbal hasil langsung cair
                </span>
              </div>
            </div>

            {/* Key Benefits 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
              {/* Fisik Emas Emirates */}
              <div className="p-3.5 rounded-2xl bg-[#141210] border border-[#2E2820] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block">
                    Fisik Emas Emirates Gold
                  </span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    {formatGrams(activePackage.goldGrams)} Murni 24K (999.9)
                  </span>
                  <span className="text-[10px] text-[#A0988C] block">
                    Sertifikat resmi bersegel Dubai UAE
                  </span>
                </div>
              </div>

              {/* Bonus Cashback Tunai Instan */}
              <div className="p-3.5 rounded-2xl bg-[#141210] border border-emerald-500/40 flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block">
                    Bonus Cashback Tunai ({activePackage.bonusPercent}%)
                  </span>
                  <span className="text-sm font-bold text-emerald-300 font-mono">
                    +{formatIDR(activePackage.bonusAmountIdr)}
                  </span>
                  <span className="text-[10px] text-emerald-400/90 block font-medium">
                    Langsung masuk ke saldo kas Anda
                  </span>
                </div>
              </div>
            </div>

            {/* Feature List Checklist */}
            <div className="space-y-2 pt-2 border-t border-[#2C2419]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] block">
                Fasilitas & Hak Istimewa Investor:
              </span>
              <div className="space-y-2">
                {activePackage.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#C8C2BA]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Balance Check Bar */}
          <div className="p-4 rounded-2xl bg-[#151310] border border-[#2E2820] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#221C14] border border-[#3E3424] flex items-center justify-center text-[#D4AF37]">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8C857B] font-semibold block">
                  Saldo Kas Tunai Anda
                </span>
                <span className="font-mono text-base font-bold text-[#F7F5F2]">
                  {formatIDR(userBalance)}
                </span>
              </div>
            </div>

            {isBalanceSufficient ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Saldo Kas Mencukupi</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Kurang {formatIDR(balanceDeficit)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="relative z-10 p-5 sm:p-6 border-t border-[#2C261D] bg-[#12100E] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#8C857B] text-center sm:text-left">
            <span>Garansi 100% Kepemilikan Emas & Keamanan Dana Terenkripsi BI</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-[#1C1814] hover:bg-[#25201A] border border-[#352D21] text-[#A0988C] font-semibold text-xs transition cursor-pointer w-1/3 sm:w-auto"
            >
              Tutup
            </button>

            {isBalanceSufficient ? (
              <button
                type="button"
                onClick={handleStartPurchase}
                disabled={isProcessing}
                className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] hover:brightness-110 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ambil Paket {activePackage.tier} & Klaim Bonus</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onGoToDeposit(activePackage.priceIdr);
                  onClose();
                }}
                className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Wallet className="w-4 h-4" />
                <span>Top Up Kas Sekarang ({formatIDR(activePackage.priceIdr)})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <PinVerificationModal
          userPin={user.pinCode || '123456'}
          actionTitle={`Investasi ${activePackage.name}`}
          actionSubtitle={`Konfirmasi pendebetan kas ${formatIDR(activePackage.priceIdr)} dan penerimaan bonus ${formatIDR(activePackage.bonusAmountIdr)}`}
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  );
};
