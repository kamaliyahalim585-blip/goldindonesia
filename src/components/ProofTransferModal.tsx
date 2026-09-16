import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  Copy, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Smartphone, 
  FileText, 
  Clock, 
  ArrowRight,
  Eye,
  Trash2,
  Sparkles
} from 'lucide-react';
import { Transaction, UserAccount } from '../types';
import { OFFICIAL_DEPOSIT_METHODS, formatIDR, formatIDRNumberOnly } from '../data/mockData';

interface ProofTransferModalProps {
  user: UserAccount;
  initialAmount?: number;
  initialMethodId?: 'permata' | 'ovo';
  onClose: () => void;
  onSubmitProof: (newTx: Transaction, amount: number) => void;
  onShowToast: (msg: string) => void;
}

export const ProofTransferModal: React.FC<ProofTransferModalProps> = ({
  user,
  initialAmount = 1000000,
  initialMethodId = 'permata',
  onClose,
  onSubmitProof,
  onShowToast
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<'permata' | 'ovo'>(initialMethodId);
  const [amountStr, setAmountStr] = useState<string>(initialAmount.toLocaleString('id-ID'));
  const [senderName, setSenderName] = useState<string>(user.name || '');
  const [senderBank, setSenderBank] = useState<string>('BCA');
  const [senderAccount, setSenderAccount] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  );
  const [notes, setNotes] = useState<string>('');
  
  // File upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [createdTxId, setCreatedTxId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeMethod = OFFICIAL_DEPOSIT_METHODS.find((m) => m.id === selectedMethodId) || OFFICIAL_DEPOSIT_METHODS[0];
  const parsedAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onShowToast(`Nomor ${activeMethod.name} (${text}) berhasil disalin!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanStr = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(cleanStr, 10);
    if (!isNaN(num)) {
      setAmountStr(num.toLocaleString('id-ID'));
    } else {
      setAmountStr('');
    }
    setErrorMessage(null);
  };

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap unggah file foto atau gambar struk bukti transfer (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal adalah 5MB.');
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleUseSampleReceipt = () => {
    // Generate an elegant SVG mock receipt as data URL
    const svgReceipt = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520">
      <rect width="400" height="520" fill="%23141210" rx="16"/>
      <rect x="20" y="20" width="360" height="480" fill="%231E1B17" rx="12" stroke="%23D4AF37" stroke-width="2"/>
      <circle cx="200" cy="70" r="28" fill="%23007A33"/>
      <path d="M190 70 L197 77 L212 62" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>
      <text x="200" y="125" fill="%23F7F5F2" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">TRANSFER BERHASIL</text>
      <text x="200" y="145" fill="%23A0988C" font-family="sans-serif" font-size="11" text-anchor="middle">${transferDate}</text>
      <line x1="40" y1="165" x2="360" y2="165" stroke="%232E2820" stroke-width="1"/>
      <text x="50" y="195" fill="%238C857B" font-family="sans-serif" font-size="12">Jumlah Transfer</text>
      <text x="350" y="195" fill="%23D4AF37" font-family="monospace" font-size="16" font-weight="bold" text-anchor="end">Rp ${amountStr}</text>
      <text x="50" y="235" fill="%238C857B" font-family="sans-serif" font-size="12">Tujuan Transfer</text>
      <text x="350" y="235" fill="%23F7F5F2" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="end">${activeMethod.name}</text>
      <text x="50" y="270" fill="%238C857B" font-family="sans-serif" font-size="12">Nomor Rekening / HP</text>
      <text x="350" y="270" fill="%23F7F5F2" font-family="monospace" font-size="13" text-anchor="end">${activeMethod.accountNumber}</text>
      <text x="50" y="305" fill="%238C857B" font-family="sans-serif" font-size="12">Nama Penerima</text>
      <text x="350" y="305" fill="%23F3E5AB" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end">muhammad yusuf amiinuddiin</text>
      <text x="50" y="340" fill="%238C857B" font-family="sans-serif" font-size="12">Pengirim</text>
      <text x="350" y="340" fill="%23F7F5F2" font-family="sans-serif" font-size="12" text-anchor="end">${senderName || 'Khoirul Anis'}</text>
      <line x1="40" y1="365" x2="360" y2="365" stroke="%232E2820" stroke-width="1"/>
      <text x="200" y="405" fill="%238CEB9C" font-family="sans-serif" font-size="11" text-anchor="middle">Status: Terverifikasi oleh Sistem Perbankan</text>
      <text x="200" y="435" fill="%236E675E" font-family="monospace" font-size="10" text-anchor="middle">REF: PERMATA-829104810294</text>
    </svg>`;

    setImagePreview(svgReceipt);
    setFileName('struk_transfer_sukses.png');
    setFileSize('14.2 KB');
    setErrorMessage(null);
    onShowToast('Contoh struk bukti transfer berhasil dimuat');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedAmount < 10000) {
      setErrorMessage('Nominal deposit minimal adalah Rp 10.000.');
      return;
    }

    if (!senderName.trim()) {
      setErrorMessage('Harap masukkan nama lengkap pengirim sesuai rekening / akun.');
      return;
    }

    if (!imagePreview) {
      setErrorMessage('Harap lampirkan foto / screenshot struk bukti transfer Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const txId = `TRX-${Math.floor(10000 + Math.random() * 90000)}`;

    setTimeout(() => {
      const newTransaction: Transaction = {
        id: txId,
        category: 'deposit',
        title: `Deposit via ${activeMethod.name}`,
        amountIdr: parsedAmount,
        date: 'Hari ini, Baru saja',
        timestamp: Date.now(),
        status: 'Pending',
        paymentMethod: `${activeMethod.name} (${activeMethod.accountNumber})`,
        recipientName: activeMethod.accountName,
        senderName: senderName.trim(),
        senderAccount: senderAccount ? `${senderBank} • ${senderAccount}` : senderBank,
        proofImage: imagePreview,
        notes: notes || `Deposit ke ${activeMethod.name} a.n ${activeMethod.accountName}`,
        taxOrFee: 0
      };

      setCreatedTxId(txId);
      setIsSubmitting(false);
      setIsSuccess(true);
      onSubmitProof(newTransaction, parsedAmount);
      onShowToast(`Bukti transfer ${txId} berhasil dikirim untuk diverifikasi!`);
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-6 rounded-2xl bg-[#161412] border border-[#3D3528] shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A241C] flex items-center justify-between bg-gradient-to-r from-[#241F18] via-[#1A1713] to-[#161412] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Upload className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#F7F5F2]">
                Kirim Bukti Transfer
              </h2>
              <p className="text-[11px] text-[#A0988C]">
                Konfirmasi deposit resmi ke Bank Permata atau OVO
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#26211B] text-[#A0988C] hover:text-[#F7F5F2] hover:bg-[#383127] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-left">
          {isSuccess ? (
            /* Success State */
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-9 h-9 stroke-[2.3]" />
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#F7F5F2]">
                  Bukti Transfer Berhasil Terkirim!
                </h3>
                <p className="text-xs text-[#A0988C] mt-1 max-w-sm mx-auto leading-relaxed">
                  Tim verifikasi IndoGold sedang memeriksa mutasi saldo Anda. Saldo kas sebesar <strong className="text-amber-400">Rp {amountStr}</strong> akan segera otomatis masuk ke akun Anda.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-[#24201B]">
                  <span className="text-[#8C857B]">Nomor Referensi</span>
                  <span className="font-mono font-bold text-[#D4AF37]">{createdTxId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C857B]">Tujuan Transfer</span>
                  <span className="font-semibold text-[#F7F5F2]">{activeMethod.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C857B]">Nama Penerima</span>
                  <span className="font-mono text-[#F3E5AB]">muhammad yusuf amiinuddiin</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C857B]">Nominal Deposit</span>
                  <span className="font-mono font-bold text-emerald-400">Rp {amountStr}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8C857B]">Pengirim</span>
                  <span className="text-[#EAE6E1]">{senderName} ({senderBank})</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#24201B]">
                  <span className="text-[#8C857B]">Status Verifikasi</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/50 text-amber-300 text-[10px] font-bold">
                    Sedang Diverifikasi (1-3 Menit)
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-slate-950 font-bold text-xs hover:opacity-95 transition cursor-pointer shadow-lg shadow-[#D4AF37]/20"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            /* Upload & Verification Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Official Account Selection (Bank Permata & OVO ONLY) */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#A0988C] block mb-2">
                  1. Pilih Rekening / Akun Tujuan Transfer Resmi
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OFFICIAL_DEPOSIT_METHODS.map((m) => {
                    const isSelected = selectedMethodId === m.id;
                    const isPermata = m.id === 'permata';

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMethodId(m.id as 'permata' | 'ovo')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? isPermata 
                              ? 'bg-gradient-to-b from-[#16291C] to-[#0F1B12] border-emerald-400/80 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400'
                              : 'bg-gradient-to-b from-[#25172E] to-[#170E1C] border-purple-400/80 shadow-md shadow-purple-950/40 ring-1 ring-purple-400'
                            : 'bg-[#0F0E0D] border-[#2A241C] hover:border-[#4A4033]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                              isPermata ? 'bg-[#007A33]' : 'bg-[#4C2A86]'
                            }`}>
                              {isPermata ? 'PERM' : 'OVO'}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-[#F7F5F2]">{m.name}</h4>
                              <span className="text-[10px] text-emerald-400 font-medium">{m.badge}</span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-slate-950' : 'border-[#4A4033]'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Account Number with Copy */}
                        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-[#8C857B] block">
                              {isPermata ? 'No. Rekening' : 'No. Ponsel OVO'}
                            </span>
                            <span className="font-mono text-sm font-bold text-[#F7F5F2]">
                              {m.accountNumber}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(m.accountNumber, m.id);
                            }}
                            className="p-1.5 rounded-lg bg-[#24201A] hover:bg-[#3D3528] text-amber-300 transition text-[10px] flex items-center gap-1 border border-amber-400/30"
                            title="Salin Nomor"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === m.id ? 'Tersalin' : 'Salin'}</span>
                          </button>
                        </div>

                        <div className="mt-2 text-[11px] text-[#A0988C]">
                          a.n. <strong className="text-[#F3E5AB] font-mono">{m.accountName}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amount & Sender Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#F7F5F2] block mb-1">
                    Nominal Transfer (IDR) <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#D4AF37]">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={amountStr}
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-base font-mono font-bold text-[#F7F5F2] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#F7F5F2] block mb-1">
                    Nama Lengkap Pengirim <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Sesuai nama rekening / akun Anda"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#F7F5F2] block mb-1">
                    Bank / E-Wallet Asal
                  </label>
                  <input
                    type="text"
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    placeholder="Contoh: BCA, Mandiri, BRI, DANA, OVO"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#F7F5F2] block mb-1">
                    No. Rekening / No. HP Pengirim (Opsional)
                  </label>
                  <input
                    type="text"
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    placeholder="Contoh: 8271xxxx atau 0812xxxx"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Upload Proof Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#A0988C]">
                    2. Unggah Foto / Struk Bukti Transfer <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseSampleReceipt}
                    className="text-[11px] font-semibold text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Pakai Contoh Struk Transaksi</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  /* Preview Card */
                  <div className="p-3.5 rounded-xl bg-[#0F0E0D] border border-amber-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#3D3528] shrink-0 bg-black flex items-center justify-center">
                        <img 
                          src={imagePreview} 
                          alt="Bukti Transfer" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-[#F7F5F2] truncate">{fileName || 'bukti_transfer.jpg'}</h5>
                        <p className="text-[10px] text-emerald-400 font-mono mt-0.5">{fileSize || 'Ukuran valid'}</p>
                        <span className="text-[10px] text-[#8C857B]">Siap diverifikasi sistem</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg bg-[#24201A] hover:bg-[#383127] text-amber-300 text-xs transition cursor-pointer"
                        title="Ganti Foto"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFileName(null);
                          setFileSize(null);
                        }}
                        className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs transition cursor-pointer border border-rose-500/30"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Dropzone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-amber-400 bg-amber-950/20 scale-[1.01]'
                        : 'border-[#3D3528] bg-[#0F0E0D] hover:border-amber-500/50 hover:bg-[#141210]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#24201A] border border-[#3D3528] flex items-center justify-center mx-auto text-amber-400 mb-2">
                      <Upload className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <p className="text-xs font-bold text-[#F7F5F2]">
                      Tarik & lepas struk foto ke sini, atau <span className="text-[#D4AF37] underline">klik untuk memilih</span>
                    </p>
                    <p className="text-[10px] text-[#8C857B] mt-1">
                      Mendukung format JPG, PNG, WEBP (Maksimal 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-[#A0988C] block mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Transfer via m-BCA jam 14:30 WIB"
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:outline-none focus:border-amber-400"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Security info */}
              <div className="p-3 rounded-xl bg-[#141210] border border-[#26211B] flex items-start gap-2 text-[11px] text-[#A0988C]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Semua bukti transfer diverifikasi langsung oleh Admin Keuangan PT IndoGold Bullion Berjangka. Transaksi dilindungi enkripsi 256-bit SSL.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      <span>Mengirimkan Bukti Transfer...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>Kirim Bukti Transfer Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
