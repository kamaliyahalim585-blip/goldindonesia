import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Sparkles,
  Lock,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { UserAccount, Transaction } from '../../types';
import { formatIDR, formatGrams } from '../../data/mockData';

interface TransferEmasModalProps {
  user: UserAccount;
  currentPrice: number;
  onClose: () => void;
  onSuccess: (updatedUser: Partial<UserAccount>, newTx: Transaction) => void;
  onShowToast: (msg: string) => void;
}

export const TransferEmasModal: React.FC<TransferEmasModalProps> = ({
  user,
  currentPrice,
  onClose,
  onSuccess,
  onShowToast
}) => {
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [grams, setGrams] = useState<string>('0.5');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  const parsedGrams = parseFloat(grams) || 0;
  const estimatedIdr = Math.round(parsedGrams * currentPrice);
  const userGoldBalance = user.goldHoldingsGram || 0;

  const handleLookupRecipient = (value: string) => {
    setRecipient(value);
    // Mock auto-resolution for common names or registered members
    if (value.length >= 4) {
      if (value.includes('@')) {
        const username = value.split('@')[0];
        setRecipientName(username.charAt(0).toUpperCase() + username.slice(1) + ' (Member Terverifikasi)');
      } else if (value.startsWith('08') || value.startsWith('+62')) {
        setRecipientName('Mitra Gold: ' + value.slice(-4) + ' (KYC Aktif)');
      } else {
        setRecipientName('Akun Mitra: ' + value);
      }
    } else {
      setRecipientName('');
    }
  };

  const handleValidate = () => {
    if (!recipient.trim()) {
      onShowToast('Silakan masukkan nomor HP, email, atau ID NusantaraGold penerima.');
      return;
    }
    if (parsedGrams <= 0) {
      onShowToast('Jumlah gram emas harus lebih dari 0.');
      return;
    }
    if (parsedGrams > userGoldBalance) {
      onShowToast(`Saldo emas Anda (${userGoldBalance} gr) tidak mencukupi untuk transfer ${parsedGrams} gr.`);
      return;
    }
    if (parsedGrams < 0.01) {
      onShowToast('Minimal transfer emas adalah 0,01 gram.');
      return;
    }
    setStep('confirm');
  };

  const handleExecuteTransfer = () => {
    const newGoldHoldings = Math.max(0, Number((userGoldBalance - parsedGrams).toFixed(4)));
    const txId = `TRF-AU-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dateFormatted = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()} • ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    const newTx: Transaction = {
      id: txId,
      category: 'tarik',
      title: `Transfer Emas ke ${recipientName || recipient}`,
      userId: user.uid,
      userEmail: user.email,
      goldGrams: parsedGrams,
      amountIdr: estimatedIdr,
      date: dateFormatted,
      timestamp: Date.now(),
      status: 'Approved',
      recipientName: recipientName || recipient,
      senderName: user.name,
      notes: notes || 'Transfer Tabungan Emas 24K',
      pricePerGram: currentPrice,
      taxOrFee: 0
    };

    setCompletedTx(newTx);
    setStep('success');
    onSuccess({ goldHoldingsGram: newGoldHoldings }, newTx);
    onShowToast(`Berhasil mengirim ${parsedGrams} gr emas ke ${recipientName || recipient}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#141311] border border-[#3D3529] rounded-2xl overflow-hidden shadow-2xl flex flex-col my-auto">
        {/* Header Bar */}
        <div className="p-4 border-b border-[#2E2820] bg-gradient-to-r from-[#211C14] to-[#141311] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4A3C13] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#F7F5F2] leading-none">Transfer Emas 24K</h3>
              <p className="text-[11px] text-[#A69B8D] mt-1">Kirim saldo emas fisik digital antar sesama pengguna instan tanpa biaya admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2A26] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {step === 'input' && (
            <div className="space-y-4">
              {/* Gold Holdings Info */}
              <div className="p-3 rounded-xl bg-[#1C1814] border border-[#382E20] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#A69B8D] block">Saldo Emas Anda Tersedia</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-base font-bold text-[#D4AF37] font-mono">{userGoldBalance.toFixed(4)}</span>
                    <span className="text-xs text-[#8C857B]">gram</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGrams(userGoldBalance.toString())}
                  className="px-2.5 py-1 rounded-lg bg-[#332A17] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold hover:bg-[#4A3C13] transition"
                >
                  Gunakan Maksimal
                </button>
              </div>

              {/* Recipient Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#EAE6E1] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Penerima (Nomor HP / Email / ID Anggota)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => handleLookupRecipient(e.target.value)}
                    placeholder="Contoh: 081288997766 atau nama@email.com"
                    className="w-full bg-[#0F0E0D] border border-[#2E2820] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-sm text-[#F7F5F2] placeholder-[#666056] outline-none transition"
                  />
                </div>
                {recipientName && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Terdeteksi: {recipientName}</span>
                  </p>
                )}
              </div>

              {/* Grams Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#EAE6E1] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Jumlah Gramasi Emas</span>
                  </span>
                  <span className="text-[11px] text-[#A69B8D]">Min. 0,01 gr</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={userGoldBalance}
                    value={grams}
                    onChange={(e) => setGrams(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0F0E0D] border border-[#2E2820] focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-[#F7F5F2] outline-none transition pr-16"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#D4AF37]">
                    GRAM
                  </span>
                </div>

                {/* Quick weight buttons */}
                <div className="flex gap-2 pt-1">
                  {[0.1, 0.5, 1, 2, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setGrams(val.toString())}
                      className="flex-1 py-1 rounded-lg bg-[#1F1B16] border border-[#2E2820] text-xs font-mono text-[#D4AF37] hover:border-[#D4AF37]/50 transition"
                    >
                      {val}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Value conversion preview */}
              <div className="p-3 rounded-xl bg-[#0F0E0D] border border-[#2E2820] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#8C857B]">
                  <span>Estimasi Nilai Pasar Saat Ini</span>
                  <span className="text-[#F7F5F2] font-mono font-bold">{formatIDR(estimatedIdr)}</span>
                </div>
                <div className="flex justify-between text-[#8C857B]">
                  <span>Biaya Administrasi Transfer</span>
                  <span className="text-emerald-400 font-bold">GRATIS (Rp 0)</span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A69B8D]">Catatan / Pesan Pengirim (Opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Hadiah pernikahan / tabungan emas"
                  className="w-full bg-[#0F0E0D] border border-[#2E2820] focus:border-[#D4AF37] rounded-xl px-3.5 py-2 text-xs text-[#F7F5F2] placeholder-[#666056] outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleValidate}
                disabled={userGoldBalance <= 0 || parsedGrams <= 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-slate-950 font-bold text-sm hover:brightness-110 active:scale-[0.99] transition shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Lanjutkan Konfirmasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-[#1C1814] border border-[#382E20] space-y-3">
                <div className="text-center pb-3 border-b border-[#2E2820]">
                  <span className="text-xs text-[#8C857B] block uppercase tracking-wider">Akan Ditransfer</span>
                  <span className="text-3xl font-mono font-extrabold text-[#D4AF37] mt-1 block">
                    {parsedGrams} <span className="text-base">gr Emas 24K</span>
                  </span>
                  <span className="text-xs text-[#A69B8D] font-mono mt-0.5 block">≈ {formatIDR(estimatedIdr)}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8C857B]">Penerima:</span>
                    <span className="text-[#F7F5F2] font-semibold text-right">{recipientName || recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C857B]">Pengirim:</span>
                    <span className="text-[#F7F5F2] font-semibold">{user.name}</span>
                  </div>
                  {notes && (
                    <div className="flex justify-between">
                      <span className="text-[#8C857B]">Pesan:</span>
                      <span className="text-[#D4AF37] italic">{notes}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#2E2820] pt-2">
                    <span className="text-[#8C857B]">Biaya Transfer:</span>
                    <span className="text-emerald-400 font-bold">Rp 0 (Bebas Biaya)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Transaksi diproses real-time dan emas langsung masuk ke portofolio penerima secara resmi.</span>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="flex-1 py-2.5 rounded-xl bg-[#1A1816] border border-[#2E2820] text-xs font-semibold text-[#A69B8D] hover:text-[#F7F5F2] transition cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs hover:brightness-110 transition shadow-md shadow-emerald-950/50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Emas Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {step === 'success' && completedTx && (
            <div className="space-y-4 animate-fade-in text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#F7F5F2]">Transfer Emas Berhasil!</h4>
                <p className="text-xs text-[#A69B8D] mt-1">
                  Sebanyak <strong className="text-[#D4AF37]">{parsedGrams} gr</strong> emas berhasil dipindahkan ke{' '}
                  <strong className="text-[#F7F5F2]">{recipientName || recipient}</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141210] border border-[#2E2820] text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-[#8C857B]">ID Transaksi</span>
                  <span className="font-mono text-[#D4AF37]">{completedTx.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C857B]">Waktu</span>
                  <span className="text-[#F7F5F2]">{completedTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8C857B]">Sisa Emas Anda</span>
                  <span className="font-mono font-bold text-[#F7F5F2]">{formatGrams(user.goldHoldingsGram)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-slate-950 font-bold text-xs hover:brightness-110 transition shadow cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
