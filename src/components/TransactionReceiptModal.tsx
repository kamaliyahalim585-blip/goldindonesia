import React, { useState } from 'react';
import { X, Check, Copy, ShieldCheck, Download, Clock, AlertCircle, Printer, Award } from 'lucide-react';
import { Transaction } from '../types';
import { formatIDR, formatGrams } from '../data/mockData';
import { generateTransactionReceiptPdf } from '../utils/pdfGenerator';

interface TransactionReceiptModalProps {
  transaction: Transaction | null;
  userName?: string;
  onClose: () => void;
  onViewCertificate?: (grams: number, brand?: string) => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  transaction,
  userName = 'Khoirul Anis',
  onClose,
  onViewCertificate
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    Approved: {
      label: 'Berhasil (Approved)',
      bg: 'bg-[#2E5C3E]/30',
      text: 'text-[#8CEB9C]',
      border: 'border-[#2E5C3E]',
      icon: Check
    },
    Pending: {
      label: 'Diproses (Pending)',
      bg: 'bg-[#8A6D22]/30',
      text: 'text-[#FFD966]',
      border: 'border-[#8A6D22]',
      icon: Clock
    },
    Rejected: {
      label: 'Dibatalkan / Ditolak (Rejected)',
      bg: 'bg-[#7A2A2A]/30',
      text: 'text-[#FFB3B3]',
      border: 'border-[#7A2A2A]',
      icon: AlertCircle
    }
  }[transaction.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1A1816] border border-[#4A433D] rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Top Header Scrim */}
        <div className="relative p-5 pb-4 border-b border-[#2E2A26] bg-gradient-to-b from-[#26231F] to-[#1A1816]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#4A3C13] border border-[#D4AF37]/50 flex items-center justify-center">
                <span className="font-serif text-xs text-[#D4AF37]">IG</span>
              </div>
              <span className="font-serif text-lg text-[#F7F5F2]">Bukti Transaksi Resmi</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2A26] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center text-center">
            <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1.5 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusConfig.label}</span>
            </div>
            <h3 className="font-serif text-2xl text-[#D4AF37] mt-2">
              {formatIDR(transaction.amountIdr)}
            </h3>
            <p className="text-xs text-[#9E978E] mt-0.5">{transaction.title}</p>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-5 space-y-3.5 text-xs text-[#EAE6E1]">
          {/* Reference ID */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0F0E0D] border border-[#24211E]">
            <span className="text-[#9E978E]">ID Transaksi</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#F7F5F2]">{transaction.id}</span>
              <button
                onClick={handleCopy}
                className="p-1 text-[#D4AF37] hover:text-[#F3E5AB] transition"
                title="Salin ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#8CEB9C]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-2.5 px-1">
            <div className="flex justify-between">
              <span className="text-[#9E978E]">Waktu Transaksi</span>
              <span className="text-[#F7F5F2]">{transaction.date}</span>
            </div>

            {transaction.brandName && (
              <div className="flex justify-between">
                <span className="text-[#9E978E]">Merk & Produsen</span>
                <span className="text-[#F7F5F2]">{transaction.brandName}</span>
              </div>
            )}

            {transaction.goldGrams && (
              <div className="flex justify-between">
                <span className="text-[#9E978E]">Bobot Emas</span>
                <span className="text-[#D4AF37]">{formatGrams(transaction.goldGrams)}</span>
              </div>
            )}

            {transaction.pricePerGram && (
              <div className="flex justify-between">
                <span className="text-[#9E978E]">Harga per Gram</span>
                <span className="text-[#F7F5F2]">{formatIDR(transaction.pricePerGram)}</span>
              </div>
            )}

            {transaction.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-[#9E978E]">Metode / Saluran</span>
                <span className="text-[#F7F5F2] font-semibold">{transaction.paymentMethod}</span>
              </div>
            )}

            {transaction.recipientName && (
              <div className="flex justify-between">
                <span className="text-[#9E978E]">Rekening Penerima</span>
                <span className="text-[#F7F5F2] font-medium">{transaction.recipientName}</span>
              </div>
            )}

            {transaction.senderName && (
              <div className="flex justify-between">
                <span className="text-[#9E978E]">Nama Pengirim</span>
                <span className="text-[#F7F5F2]">{transaction.senderName}</span>
              </div>
            )}

            {transaction.senderAccount && (
              <div className="flex justify-between">
                <span className="text-[#9E978E]">No. Rek/HP Pengirim</span>
                <span className="text-[#F7F5F2] font-mono">{transaction.senderAccount}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-[#9E978E]">Biaya Layanan & Pajak</span>
              <span className="text-[#8CEB9C]">Gratis / Bebas PPN (0%)</span>
            </div>
          </div>

          {/* Bukti Transfer Image Preview if attached */}
          {transaction.proofImage && (
            <div className="p-3 rounded-xl bg-[#221D15] border border-[#4A3C13] space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300">Lampiran Bukti Transfer</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Terlampir
                </span>
              </div>
              <div className="rounded-lg overflow-hidden border border-[#3E341F] max-h-36 bg-black flex items-center justify-center">
                <img 
                  src={transaction.proofImage} 
                  alt="Bukti Transfer" 
                  className="w-full max-h-36 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          {/* Gold Certificate Quick-link if gold involved */}
          {transaction.goldGrams && onViewCertificate && (
            <div className="p-3 rounded-xl bg-[#262119] border border-[#4A3C13] flex items-center justify-between mt-3">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-[#D4AF37]" />
                <div>
                  <span className="text-xs font-medium text-[#F7F5F2] block">Sertifikat Keaslian Emas 24K</span>
                  <span className="text-[10px] text-[#A69B8D]">Kemurnian 999.9 terverifikasi LBMA & SNI</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onViewCertificate(transaction.goldGrams || 1, transaction.brandName);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37] text-[#0F0E0D] text-xs font-semibold hover:bg-[#F3E5AB] transition cursor-pointer"
              >
                Lihat Sertifikat
              </button>
            </div>
          )}

          {/* Security stamp note */}
          <div className="p-3 rounded-xl bg-[#26231F]/70 border border-[#2E2A26] flex items-start gap-2.5 mt-3">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#9E978E] leading-relaxed">
              Transaksi ini tersimpan pada buku besar terenkripsi IndoGold dan dijamin dengan fisik emas murni 24 Karat berstandar SNI/LBMA.
            </p>
          </div>

          {downloadError && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>{downloadError}</span>
            </div>
          )}
        </div>

        {/* Modal footer CTA */}
        <div className="p-4 bg-[#0F0E0D] border-t border-[#2E2A26] flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setIsDownloadingPdf(true);
              setDownloadError(null);
              try {
                generateTransactionReceiptPdf(transaction, userName);
                setDownloadSuccess(true);
                setTimeout(() => setDownloadSuccess(false), 3000);
              } catch (e) {
                console.error('Download PDF error:', e);
                setDownloadError('Gagal mengunduh struk PDF. Silakan coba sesaat lagi.');
                setTimeout(() => setDownloadError(null), 4000);
              } finally {
                setIsDownloadingPdf(false);
              }
            }}
            disabled={isDownloadingPdf}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#26231F] border border-[#4A433D] text-[#EAE6E1] hover:text-[#D4AF37] hover:border-[#D4AF37] transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#8CEB9C]" />
                <span className="text-[#8CEB9C]">Struk Terunduh!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloadingPdf ? 'Membuat PDF...' : 'Unduh Struk PDF'}</span>
              </>
            )}
          </button>
          <button
            onClick={() => window.print()}
            className="py-2.5 px-3 rounded-xl bg-[#1F1C19] border border-[#2E2A26] text-[#A69B8D] hover:text-[#F7F5F2] transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            title="Cetak Struk Transaksi"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-[#D4AF37] text-[#0F0E0D] font-semibold hover:bg-[#F3E5AB] transition text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
