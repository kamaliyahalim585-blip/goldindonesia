import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Download, 
  Printer, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  FileText, 
  Truck,
  AlertTriangle,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { UserAccount } from '../types';
import { formatGrams } from '../data/mockData';
import { generateGoldCertificatePdf, GoldCertificateData } from '../utils/pdfGenerator';

interface GoldCertificateModalProps {
  user: UserAccount;
  initialGrams?: number;
  initialBrand?: string;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onStartTrade?: (type: 'buy' | 'sell') => void;
}

export const GoldCertificateModal: React.FC<GoldCertificateModalProps> = ({
  user,
  initialGrams = 0,
  initialBrand = 'ANTAM CertiCard',
  onClose,
  onShowToast,
  onStartTrade
}) => {
  const hasGold = (user.goldHoldingsGram || 0) > 0;

  // If user has gold, default to their full holdings or initialGrams (capped at holdings)
  const defaultWeight = hasGold 
    ? (initialGrams > 0 && initialGrams <= user.goldHoldingsGram ? initialGrams : user.goldHoldingsGram)
    : 1;

  const [selectedWeight, setSelectedWeight] = useState<number>(defaultWeight);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [copiedSerial, setCopiedSerial] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [mode, setMode] = useState<'sertifikat' | 'cetak_fisik'>('sertifikat');
  const [shippingAddress, setShippingAddress] = useState('Jl. Jenderal Sudirman Kav. 21, SCBD, Jakarta Selatan 12190');
  const [isSubmittingPhysical, setIsSubmittingPhysical] = useState(false);

  // Generate deterministic official registration & serial numbers based on selection
  const certNumber = `CERT-IDG-2026-${Math.abs(Math.round(selectedWeight * 1337 + 10420)).toString().padStart(6, '0')}`;
  const serialNumber = `AU9999-JKT-${selectedBrand.slice(0, 3).toUpperCase()}-${Math.floor(selectedWeight * 1000 + 772).toString().padStart(6, '0')}`;
  const issueDate = '15 September 2026';

  const certificateData: GoldCertificateData = {
    certificateNumber: certNumber,
    serialNumber: serialNumber,
    ownerName: user.name,
    brand: selectedBrand,
    fineness: 'Fine Gold 999.9 (24 Karat)',
    weightGrams: hasGold ? selectedWeight : 0, // Enforce 0 if user has no gold
    issueDate: issueDate,
    assayerName: 'Ir. Bambang Sugiarto, M.T.',
    accreditationNumber: 'KAN LP-001-IDN'
  };

  const handleDownloadPdf = () => {
    if (!hasGold) {
      onShowToast('Akses Terkunci: Anda belum memiliki saldo emas. Silakan beli emas terlebih dahulu.');
      return;
    }

    setIsGenerating(true);
    try {
      generateGoldCertificatePdf(certificateData);
      onShowToast(`Sertifikat Emas Asli (${serialNumber}) berhasil diunduh dalam format PDF.`);
    } catch (err: any) {
      console.error('Failed to generate certificate PDF:', err);
      onShowToast(err?.message || 'Gagal membuat dokumen PDF sertifikat. Silakan coba beberapa saat lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!hasGold) {
      onShowToast('Akses Terkunci: Anda belum memiliki saldo emas. Silakan beli emas terlebih dahulu.');
      return;
    }
    window.print();
  };

  const handleCopySerial = () => {
    navigator.clipboard.writeText(serialNumber);
    setCopiedSerial(true);
    setTimeout(() => setCopiedSerial(false), 2000);
  };

  // Build weight options: User can select either their exact holding or standard denominations <= holdings
  const standardDenominations = [1, 2, 5, 10, 25, 50, 100];
  const availableWeights = hasGold
    ? Array.from(new Set([user.goldHoldingsGram, ...standardDenominations.filter(w => w <= user.goldHoldingsGram)])).sort((a, b) => a - b)
    : [1, 2, 5, 10];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#141311] border border-[#3D3529] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] my-auto">
        {/* Header Modal Bar */}
        <div className="p-4 border-b border-[#2E2820] bg-gradient-to-r from-[#211C14] to-[#141311] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4A3C13] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#F7F5F2] leading-none flex items-center gap-2">
                <span>Sertifikat Keaslian Logam Mulia 24K</span>
                {hasGold ? (
                  <span className="text-[10px] bg-[#2E5C3E]/50 text-[#8CEB9C] border border-[#2E5C3E] px-2 py-0.5 rounded-full font-sans font-semibold">
                    Hak Cetak Aktif
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#5C2318]/50 text-[#F59E9E] border border-[#852C1F] px-2 py-0.5 rounded-full font-sans font-semibold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Belum Ada Emas
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-[#A69B8D] mt-1">
                Jaminan Kemurnian Fine Gold 999.9 Terakreditasi BAPPEBTI & KAN LP-001-IDN
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2A26] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* ACCESS PRIORITY STATUS BANNER */}
          {!hasGold ? (
            <div className="p-3.5 rounded-xl bg-[#271210] border border-[#B83E3E]/60 text-xs text-[#F5C2C2] space-y-2.5 shadow-inner">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#E05252]/20 text-[#FF7B7B] shrink-0 mt-0.5 border border-[#E05252]/30">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#FFA8A8] uppercase tracking-wider text-[11px]">
                      Hak Unduh & Cetak Dibatasi
                    </span>
                    <span className="px-2 py-0.2 text-[9.5px] font-semibold bg-[#802222] text-[#FFE8E8] rounded-full">
                      Saldo Anda: 0.0000 Gram
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#E0CDCD] mt-1 leading-relaxed">
                    Sesuai ketentuan bursa dan regulasi BAPPEBTI, penerbitan dan pengunduhan sertifikat keaslian fisik <strong>hanya diprioritaskan bagi investor yang telah memiliki simpanan emas aktif</strong> di portofolio IndoGold. Anda belum memiliki saldo emas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onStartTrade) onStartTrade('buy');
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C89B3C] text-[#141311] font-bold text-xs hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#7A5600]" />
                <span>Beli Emas Sekarang untuk Mengaktifkan Hak Unduh & Cetak</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#2B2313] via-[#1E1911] to-[#141311] border border-[#D4AF37]/50 text-xs text-[#F3E5AB] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#BFA673] block uppercase tracking-wider font-semibold">
                    Status Investor Prioritas Terverifikasi
                  </span>
                  <span className="text-xs font-bold text-[#F7F5F2]">
                    Saldo Simpanan Emas Anda: <span className="text-[#D4AF37]">{formatGrams(user.goldHoldingsGram)}</span> (Fine Gold 999.9)
                  </span>
                </div>
              </div>
              <span className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-semibold rounded-full bg-[#3D3012] border border-[#D4AF37]/50 text-[#D4AF37] shrink-0 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                Hak Cetak & Unduh Aktif
              </span>
            </div>
          )}

          {/* Sub Tab Navigation (Sertifikat Digital vs Cetak Fisik) */}
          <div className="flex p-1 bg-[#1A1815] rounded-xl border border-[#2E2820]">
            <button
              onClick={() => setMode('sertifikat')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'sertifikat'
                  ? 'bg-[#332A1C] text-[#D4AF37] font-semibold shadow-sm border border-[#D4AF37]/30'
                  : 'text-[#9E978E] hover:text-[#F7F5F2]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sertifikat Asli Digital (COA)</span>
            </button>
            <button
              onClick={() => setMode('cetak_fisik')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'cetak_fisik'
                  ? 'bg-[#332A1C] text-[#D4AF37] font-semibold shadow-sm border border-[#D4AF37]/30'
                  : 'text-[#9E978E] hover:text-[#F7F5F2]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Cetak & Pengiriman Fisik</span>
            </button>
          </div>

          {/* Controls: Refiner Brand & Weight Selection */}
          <div className="bg-[#1A1815] border border-[#2B251D] p-3.5 rounded-xl space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#A69B8D] font-medium">
                Pilih Produsen Terakreditasi LBMA
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['ANTAM CertiCard', 'UBS Gold Mint', 'PAMP Suisse'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
                      selectedBrand === b
                        ? 'bg-[#D4AF37] text-[#0F0E0D] font-semibold shadow-sm'
                        : 'bg-[#262119] text-[#A69B8D] hover:text-[#F7F5F2]'
                    }`}
                  >
                    {b.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#29231A]">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-[#A69B8D] font-medium">
                  Pilih Kepingan Berat Sertifikat
                </span>
                {!hasGold && (
                  <span className="text-[9px] text-[#A69B8D] bg-[#29231A] px-1.5 py-0.2 rounded">
                    (Mode Pratinjau)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {availableWeights.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeight(w)}
                    className={`px-2.5 py-1 rounded-lg text-xs text-center transition cursor-pointer ${
                      selectedWeight === w
                        ? 'bg-[#4A3C13] border border-[#D4AF37] text-[#D4AF37] font-semibold'
                        : 'bg-[#262119] border border-[#332A1F] text-[#A69B8D] hover:text-[#F7F5F2]'
                    }`}
                  >
                    {hasGold && w === user.goldHoldingsGram ? `Seluruh Saldo (${w} gr)` : `${w} gr`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {mode === 'sertifikat' ? (
            /* AUTHENTIC PRINT-READY GOLD CERTIFICATE DISPLAY */
            <div 
              id="printable-gold-certificate"
              className="relative bg-[#FAF8F2] text-[#1A1815] rounded-xl p-5 sm:p-7 border-8 border-[#C89B3C]/80 shadow-2xl overflow-hidden select-none"
              style={{
                boxShadow: '0 10px 35px -5px rgba(0, 0, 0, 0.4), inset 0 0 40px rgba(212, 175, 55, 0.12)'
              }}
            >
              {/* Classical Guilloche Outer Double Border */}
              <div className="absolute inset-1.5 border-2 border-[#D4AF37] rounded-sm pointer-events-none" />
              <div className="absolute inset-2.5 border border-[#8C660B]/40 rounded-sm pointer-events-none" />

              {/* Ornate Corner Accents */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#8C660B]" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#8C660B]" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#8C660B]" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#8C660B]" />

              {/* Security Watermark for Users without Gold */}
              {!hasGold && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none select-none bg-black/5 backdrop-blur-[0.5px]">
                  <div className="transform -rotate-25 bg-[#801818]/90 text-white px-8 py-3 rounded-xl shadow-2xl border-2 border-white/40 text-center">
                    <span className="block font-bold text-xs sm:text-sm tracking-widest uppercase">
                      PREVIEW CONTOH • BELUM MEMILIKI EMAS
                    </span>
                    <span className="block text-[10px] text-red-100 mt-0.5">
                      TIDAK DAPAT DICETAK ATAU DIUNDUH SEBELUM BELI EMAS
                    </span>
                  </div>
                </div>
              )}

              {/* Background Faint Guilloche & 999.9 Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
                <span className="font-serif text-9xl font-bold tracking-widest text-[#5C4509]">
                  999.9
                </span>
              </div>

              {/* Microprint Security Band at top */}
              <div className="text-center text-[7px] tracking-[0.25em] text-[#8C733E] uppercase font-mono select-none mb-1 opacity-75">
                ★ REPUBLIK INDONESIA • BAPPEBTI REGULATED • KAN LP-001-IDN • SNI 13-3487-2005 ★
              </div>

              {/* State & Authority Certificate Header */}
              <div className="text-center relative z-10 space-y-1 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EAD8A4]/70 border border-[#D4AF37] text-[9.5px] tracking-widest font-bold text-[#694B05] uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#694B05]" />
                  <span>KUSTODI EMAS FISIK RESMI • TERDAFTAR BAPPEBTI</span>
                </div>

                <div className="pt-1">
                  <h4 className="text-[10px] tracking-[0.2em] font-semibold text-[#8C6B1F] uppercase">
                    R E P U B L I K   I N D O N E S I A
                  </h4>
                  <h2 className="font-serif text-xl sm:text-2xl font-black text-[#261E10] tracking-tight uppercase mt-0.5">
                    Sertifikat Keaslian Logam Mulia
                  </h2>
                  <p className="text-[10.5px] tracking-wider text-[#7A5B15] font-semibold uppercase">
                    Certificate of Authenticity • Fine Gold 999.9 (24 Karat)
                  </p>
                </div>
              </div>

              {/* Official Minted Ingot Representation Card */}
              <div className="my-3.5 mx-auto max-w-xs p-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#B8860B] shadow-md border border-[#A67C1E] text-center relative overflow-hidden">
                {/* Metallic diagonal sheen */}
                <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/30 to-transparent transform rotate-45 pointer-events-none" />
                <div className="relative z-10">
                  <span className="block text-[9px] tracking-[0.2em] font-extrabold text-[#382802] uppercase">
                    {selectedBrand.toUpperCase()} • 24 KARAT
                  </span>
                  <span className="block font-serif text-xl sm:text-2xl font-black text-[#1F1701] my-0.5">
                    {formatGrams(selectedWeight)}
                  </span>
                  <div className="flex items-center justify-center gap-2 text-[9px] text-[#423105] font-semibold tracking-wider">
                    <span>FINE GOLD 999.9</span>
                    <span>•</span>
                    <span>SNI 13-3487</span>
                  </div>
                </div>
              </div>

              {/* Specification Grid (Assay Test Table) */}
              <div className="relative z-10 bg-white/95 rounded-lg border border-[#DECFA9] p-3.5 space-y-1.5 text-xs shadow-sm">
                <div className="flex justify-between items-center py-1 border-b border-[#EFE5CD]">
                  <span className="text-[#696155] text-[11px]">Nomor Registrasi Sertifikat</span>
                  <span className="font-mono font-bold text-[#8C660B] text-[11px]">{certNumber}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#EFE5CD]">
                  <span className="text-[#696155] text-[11px]">Nomor Seri Batangan (Serial No.)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#1F1D19] text-[11px]">{serialNumber}</span>
                    <button
                      onClick={handleCopySerial}
                      className="text-[#8C660B] hover:text-[#573F05] p-0.5 cursor-pointer"
                      title="Salin Nomor Seri"
                    >
                      {copiedSerial ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#EFE5CD]">
                  <span className="text-[#696155] text-[11px]">Berat Bersih (Fine Weight)</span>
                  <span className="font-bold text-[#1F1D19] text-[11px]">{selectedWeight.toFixed(4)} Gram ({formatGrams(selectedWeight)})</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#EFE5CD]">
                  <span className="text-[#696155] text-[11px]">Kadar Kemurnian Teruji</span>
                  <span className="font-bold text-[#8C660B] text-[11px]">99.99% Au (Fine Gold 999.9 - 24 Karat)</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#EFE5CD]">
                  <span className="text-[#696155] text-[11px]">Metode Uji Laboratorium</span>
                  <span className="font-medium text-[#2E281F] text-[11px]">Fire Assay & XRF Spectrometry</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#EFE5CD]">
                  <span className="text-[#696155] text-[11px]">Pabrikan & Pelebur Resmi</span>
                  <span className="font-semibold text-[#1F1D19] text-[11px]">{selectedBrand}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#EFE5CD]">
                  <span className="text-[#696155] text-[11px]">Pemilik Sah Terdaftar</span>
                  <span className="font-bold text-[#1F1D19] text-[11px]">{user.name} (KYC Terverifikasi)</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[#696155] text-[11px]">Tanggal Penerbitan Kustodi</span>
                  <span className="font-medium text-[#1F1D19] text-[11px]">{issueDate}</span>
                </div>
              </div>

              {/* Bottom Security Hologram, QR Code & Signatures */}
              <div className="mt-3.5 pt-2.5 border-t border-[#DECFA9] flex items-center justify-between text-[10px] relative z-10">
                {/* QR Code & Scan verification block */}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#D4AF37] p-1 flex items-center justify-center shadow-inner">
                    <QrCode className="w-8 h-8 text-[#5C4509]" />
                  </div>
                  <div>
                    <span className="block font-bold text-[#2A2215] text-[9.5px]">VERIFIKASI SISTEM</span>
                    <span className="block text-[8.5px] text-[#7A6F5C]">Scan Cek Status Kustodi</span>
                  </div>
                </div>

                {/* Circular Gold Seal */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF1D8] border border-[#D4AF37] text-[#694B05]">
                  <Award className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span className="text-[9px] font-bold tracking-wider">KAN LP-001-IDN</span>
                </div>

                {/* Sign-off Chief Assayer */}
                <div className="text-right">
                  <span className="block text-[9px] text-[#786E5D]">Chief Bullion Assayer:</span>
                  <span className="block font-serif font-bold text-[#292215] text-xs">Ir. Bambang Sugiarto, M.T.</span>
                  <span className="block text-[8.5px] text-[#8C660B]">Akreditasi KAN & BAPPEBTI RI</span>
                </div>
              </div>
            </div>
          ) : (
            /* PHYSICAL DELIVERY FORM VIEW */
            <div className="space-y-3.5 bg-[#1A1815] border border-[#2E2820] p-4 rounded-xl text-xs">
              <div className="p-3 rounded-xl bg-[#0F0E0D] border border-[#24211E] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#9E978E] block">Saldo Simpanan Emas Anda</span>
                  <span className="text-sm font-serif text-[#D4AF37] font-bold">{formatGrams(user.goldHoldingsGram || 0)}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                  user.goldHoldingsGram >= selectedWeight && selectedWeight > 0
                    ? 'text-[#8CEB9C] bg-[#2E5C3E]/30 border-[#2E5C3E]'
                    : 'text-[#F5A3A3] bg-[#5C2E2E]/30 border-[#5C2E2E]'
                }`}>
                  {user.goldHoldingsGram >= selectedWeight && selectedWeight > 0 ? 'Saldo Cukup' : 'Saldo Tidak Cukup'}
                </span>
              </div>

              <div>
                <label className="text-[11px] text-[#9E978E] block mb-1.5">
                  Alamat Pengiriman Emas Fisik (Asuransi Pengawalan 100%)
                </label>
                <textarea
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2A26] text-xs text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none"
                  placeholder="Masukkan alamat lengkap penerima, kota, kode pos, dan nomor telepon..."
                />
                <p className="text-[10px] text-[#9E978E] mt-1">
                  *Emas batangan dikirim dalam kemasan CertiCard tamper-evident dengan segel keamanan anti-pembobolan dan kurir bersenjata resmi.
                </p>
              </div>

              <div className="bg-[#0F0E0D] p-3 rounded-xl border border-[#24211E] space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#9E978E]">
                  <span>Biaya Cetak & Sertifikasi {selectedBrand}:</span>
                  <span className="text-[#F7F5F2]">Rp 85.000</span>
                </div>
                <div className="flex justify-between text-[#9E978E]">
                  <span>Ongkir Kurir Khusus & Asuransi All-Risk:</span>
                  <span className="text-[#F7F5F2]">Rp 35.000</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#24211E] font-semibold">
                  <span className="text-[#F7F5F2]">Total Biaya Ekspedisi:</span>
                  <span className="text-[#D4AF37]">Rp 120.000</span>
                </div>
              </div>

              <button
                disabled={isSubmittingPhysical || !hasGold || user.goldHoldingsGram < selectedWeight}
                onClick={() => {
                  if (!hasGold) {
                    onShowToast('Anda belum memiliki emas untuk dicetak fisik. Silakan beli emas terlebih dahulu.');
                    return;
                  }
                  if (user.goldHoldingsGram < selectedWeight) {
                    onShowToast(`Saldo emas Anda (${user.goldHoldingsGram} gr) tidak mencukupi untuk mencetak ${selectedWeight} gr.`);
                    return;
                  }
                  setIsSubmittingPhysical(true);
                  setTimeout(() => {
                    setIsSubmittingPhysical(false);
                    onShowToast(`Permohonan pencetakan & ekspedisi fisik ${selectedWeight} gr ${selectedBrand} berhasil diajukan! No. Resi aman segera aktif.`);
                    onClose();
                  }, 800);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E6C35C] text-[#0F0E0D] font-bold text-xs hover:from-[#F3E5AB] hover:to-[#D4AF37] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
              >
                {!hasGold 
                  ? 'Pencetakan Fisik Terkunci (Perlu Saldo Emas)' 
                  : isSubmittingPhysical 
                    ? 'Memproses Permohonan...' 
                    : `Konfirmasi Permohonan Cetak Fisik (${selectedWeight} gr)`}
              </button>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-[#141311] border-t border-[#2E2820] flex flex-col sm:flex-row gap-2.5">
          {hasGold ? (
            <>
              <button
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#141311] font-bold text-xs hover:brightness-105 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#634803]" />
                <span>{isGenerating ? 'Membuat Dokumen PDF...' : 'Unduh Sertifikat Asli (PDF)'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-3 px-4 rounded-xl bg-[#262119] border border-[#403525] text-[#EAE6E1] hover:text-[#D4AF37] hover:border-[#D4AF37] transition text-xs flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Print</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onShowToast('Akses Terkunci: Anda belum memiliki simpanan emas. Silakan beli emas terlebih dahulu untuk mengunduh sertifikat.');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#211E19] border border-[#3A3326] text-[#786F62] text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                title="Penerbitan sertifikat hanya untuk yang memiliki saldo emas"
              >
                <Lock className="w-4 h-4 text-[#8C7A64]" />
                <span>Unduh Terkunci (Beli Emas Terlebih Dahulu)</span>
              </button>

              <button
                onClick={() => {
                  onShowToast('Akses Terkunci: Anda belum memiliki simpanan emas untuk dicetak.');
                }}
                className="py-3 px-4 rounded-xl bg-[#1C1A17] border border-[#2B2720] text-[#696257] text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                title="Cetak hanya untuk yang memiliki saldo emas"
              >
                <Lock className="w-3.5 h-3.5 text-[#8C7A64]" />
                <span>Cetak Terkunci</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-[#1A1815] text-[#9E978E] hover:text-[#F7F5F2] transition text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
