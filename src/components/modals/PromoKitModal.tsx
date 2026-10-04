import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  ArrowDownLeft, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  Clock, 
  FileText, 
  Smartphone, 
  Coins, 
  Award, 
  ExternalLink,
  MessageCircle,
  Eye,
  Calendar,
  Lock,
  ChevronRight,
  Flame,
  Zap,
  Info
} from 'lucide-react';
import { UserAccount } from '../../types';
import { APP_IMAGES, formatIDR } from '../../data/mockData';

interface PromoKitModalProps {
  onClose: () => void;
  user: UserAccount;
  onShowToast: (msg: string) => void;
}

interface WithdrawalCycleItem {
  cycle: number;
  weekLabel: string;
  nominal: number;
  date: string;
  time: string;
  bankName: string;
  bankLogo: string;
  accountNumber: string;
  recipientName: string;
  refNumber: string;
  txId: string;
  status: 'DISETUJUI & LUNAS' | 'BERHASIL DICAIRKAN';
  notes: string;
}

export const PromoKitModal: React.FC<PromoKitModalProps> = ({
  onClose,
  user,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'withdrawal' | 'advantages' | 'copywriting' | 'gallery'>('withdrawal');
  const [selectedCycleIndex, setSelectedCycleIndex] = useState<number>(3); // default to cycle 4 (latest)
  const [viewStyle, setViewStyle] = useState<'banking_receipt' | 'executive_card' | 'timeline'>('banking_receipt');
  const [customInvestorName, setCustomInvestorName] = useState<string>(user.name || 'Khoirul Anis');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [copiedCaptionIndex, setCopiedCaptionIndex] = useState<number | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // 4 Cycles of 7-Week Withdrawals @ Rp 4.000.000 each
  const withdrawalCycles: WithdrawalCycleItem[] = [
    {
      cycle: 1,
      weekLabel: 'Minggu ke-7 (Siklus 1)',
      nominal: 4000000,
      date: '28 Mei 2026',
      time: '10:42:15 WIB',
      bankName: 'BANK CENTRAL ASIA (BCA)',
      bankLogo: 'BCA',
      accountNumber: '8271****921',
      recipientName: customInvestorName,
      refNumber: 'BIF-IDG260528-7019842',
      txId: 'WD-7W-01-8841',
      status: 'DISETUJUI & LUNAS',
      notes: 'Pencairan Bagi Hasil Tabungan Emas Siklus 7 Minggu'
    },
    {
      cycle: 2,
      weekLabel: 'Minggu ke-14 (Siklus 2)',
      nominal: 4000000,
      date: '16 Juli 2026',
      time: '14:15:30 WIB',
      bankName: 'BANK MANDIRI',
      bankLogo: 'MANDIRI',
      accountNumber: '1420****331',
      recipientName: customInvestorName,
      refNumber: 'BIF-IDG260716-7023190',
      txId: 'WD-7W-02-9952',
      status: 'DISETUJUI & LUNAS',
      notes: 'Pencairan Bagi Hasil Tabungan Emas Siklus 7 Minggu'
    },
    {
      cycle: 3,
      weekLabel: 'Minggu ke-21 (Siklus 3)',
      nominal: 4000000,
      date: '03 September 2026',
      time: '09:30:12 WIB',
      bankName: 'BANK RAKYAT INDONESIA (BRI)',
      bankLogo: 'BRI',
      accountNumber: '0341****872',
      recipientName: customInvestorName,
      refNumber: 'BIF-IDG260903-7035411',
      txId: 'WD-7W-03-1044',
      status: 'DISETUJUI & LUNAS',
      notes: 'Pencairan Bagi Hasil Tabungan Emas Siklus 7 Minggu'
    },
    {
      cycle: 4,
      weekLabel: 'Minggu ke-28 (Siklus 4 - Terbaru)',
      nominal: 4000000,
      date: '22 Oktober 2026',
      time: '11:20:45 WIB',
      bankName: 'BANK CENTRAL ASIA (BCA)',
      bankLogo: 'BCA',
      accountNumber: '8271****921',
      recipientName: customInvestorName,
      refNumber: 'BIF-IDG261022-7049872',
      txId: 'WD-7W-04-3329',
      status: 'DISETUJUI & LUNAS',
      notes: 'Pencairan Bagi Hasil Tabungan Emas Siklus 7 Minggu'
    }
  ];

  const currentCycle = withdrawalCycles[selectedCycleIndex];

  // Advantages data
  const advantagesList = [
    {
      title: 'Emas Murni 24K Fisik SNI & LBMA',
      highlight: '99.99% Bersertifikat Asli',
      desc: 'Setiap gram emas yang Anda miliki terikat langsung dengan batangan emas fisik bersertifikat resmi ANTAM & UBS, bukan sekadar angka digital di layar.',
      icon: <Coins className="w-5 h-5 text-amber-400" />
    },
    {
      title: 'Penarikan Instan 24/7 Masuk Rekening',
      highlight: 'Tanpa Potongan / Biaya Admin Rp 0',
      desc: 'Sistem transfer realtime BI-FAST mendukung 100+ bank nasional (BCA, Mandiri, BRI, BNI, BSI) & e-wallet. Dana langsung cair dalam hitungan menit.',
      icon: <Zap className="w-5 h-5 text-emerald-400" />
    },
    {
      title: 'Legalitas Terdaftar & Diawasi Resmi',
      highlight: 'BAPPEBTI & Kominfo Republik Indonesia',
      desc: 'Beroperasi di bawah kerangka regulasi perdagangan komoditi fisik emas resmi dan diawasi oleh lembaga berwenang pemerintah Indonesia.',
      icon: <ShieldCheck className="w-5 h-5 text-sky-400" />
    },
    {
      title: 'Bagi Hasil & Pertumbuhan Nilai Transparan',
      highlight: 'Cuan Terjadwal per 7 Minggu',
      desc: 'Keuntungan dividen emas dapat dicairkan secara berkala, salah satunya skema pencairan rutin Rp 4.000.000 setiap 7 minggu terbukti konsisten.',
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />
    },
    {
      title: 'Dapat Dicetak Menjadi Emas Fisik Batangan',
      highlight: 'Kirim Asli ke Rumah Berasuransi',
      desc: 'Kapan saja Anda ingin memegang emas asli, Anda dapat mengajukan cetak fisik mulai 0.5 gram dengan asuransi pengiriman 100% sampai di tangan.',
      icon: <Award className="w-5 h-5 text-amber-300" />
    },
    {
      title: 'Bonus Daftar Rp 30.000 & Modal Terjangkau',
      highlight: 'Mulai dari Rp 10.000',
      desc: 'Pengguna baru langsung dapat saldo bonus selamat datang Rp 20.000 + Rp 10.000 kode referral. Siapapun bisa mulai investasi tanpa modal besar.',
      icon: <Sparkles className="w-5 h-5 text-rose-400" />
    }
  ];

  // Copywriting Templates for Broadcast
  const marketingCaptions = [
    {
      title: 'Format WhatsApp / Telegram: Bukti WD 7 Mingguan',
      caption: `🔥 BUKTI NYATA BUKAN OMONG KOSONG! 🔥
Alhamdulillah, kembali cair bersih *Rp 4.000.000* tepat di siklus *7 minggu* dari tabungan emas NusantaraGold! 💰✨

Total yang sudah ditarik sejauh ini: *Rp 16.000.000* langsung masuk rekening bank tanpa potongan admin sepeser pun.

Kenapa saya nyaman & percaya di NusantaraGold?
✅ Emas fisik 24K (99.99%) resmi ANTAM & UBS
✅ Legalitas resmi terdaftar di BAPPEBTI & Kominfo
✅ Penarikan instan 24 jam via BI-FAST ke semua bank
✅ Bagi hasil & profit emas sangat transparan
✅ Bisa cetak emas fisik batangan dikirim ke alamat rumah

🎁 Mau coba mulai? Daftar sekarang dapat BONUS saldo Rp 30.000!
Gunakan kode referral resmi: *${user.referralCode || 'NUSANTARAGOLD99'}*

Tanya-tanya & panduan daftar langsung japri ya! 👇
WhatsApp: ${user.phone || '0812-xxxx-xxxx'}`
    },
    {
      title: 'Format Instagram / Facebook: Edukasi & Kelebihan Aplikasi',
      caption: `Masih nabung uang yang nilainya tergerus inflasi tiap tahun? 📉
Saatnya amankan masa depan dengan Emas Murni 24 Karat bersama NusantaraGold! 🏆

Inilah 5 Alasan Kenapa Ribuan Investor Memilih NusantaraGold:
1️⃣ Emas Asli Bersertifikat LBMA (Antam & UBS)
2️⃣ Penarikan Dana (Withdrawal) Cair Cepat dalam Menit
3️⃣ Terbukti konsisten pencairan hasil Rp 4.000.000 per 7 minggu
4️⃣ Terdaftar & Diawasi Resmi BAPPEBTI Republik Indonesia
5️⃣ Mulai nabung sangat terjangkau, cukup mulai Rp 10.000!

Yuk amankan aset emas Anda hari ini.
Klaim Bonus Pengguna Baru Rp 30.000 dengan kode: ${user.referralCode || 'NUSANTARAGOLD99'} 🚀

#NusantaraGold #InvestasiEmas #PassiveIncome #BuktiWD #EmasAntam #FinansialSehat`
    },
    {
      title: 'Format Singkat Status / Story: Bukti Transfer Rp 4.000.000',
      caption: `Tiap 7 minggu rutin cair Rp 4.000.000 dari hasil tabungan emas NusantaraGold 💸✨ 
Real masuk rekening, no drama, terdaftar resmi Bappebti. Yang mau tau caranya reply story ini ya! 📩`
    }
  ];

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCaptionIndex(index);
    onShowToast('Teks bahan promosi berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedCaptionIndex(null), 2500);
  };

  const handleCopySingle = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} berhasil disalin!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#141210] border border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-2xl relative my-auto flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#2C2720] bg-gradient-to-r from-[#1F1B15] via-[#2A2318] to-[#1F1B15] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-900/40">
              <div className="w-full h-full rounded-[14px] bg-[#141210] flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#F7F5F2]">
                  Pusat Bahan Promosi & Bukti WD
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  Resmi Terverifikasi
                </span>
              </div>
              <p className="text-xs text-[#A0988C]">
                Bukti penarikan rutin Rp 4.000.000 per 7 minggu & keunggulan NusantaraGold siap screenshot
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#262018] border border-[#3E3426] text-[#A0988C] hover:text-[#F7F5F2] hover:bg-[#342C1E] flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#262018] bg-[#110F0D] px-3 pt-2 gap-1 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('withdrawal')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'withdrawal'
                ? 'bg-[#1F1B15] text-[#F3E5AB] border-t-2 border-[#D4AF37]'
                : 'text-[#8C857B] hover:text-[#E8E2D8]'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>Bukti WD 7 Minggu (Rp 4 Juta)</span>
          </button>

          <button
            onClick={() => setActiveTab('advantages')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'advantages'
                ? 'bg-[#1F1B15] text-[#F3E5AB] border-t-2 border-[#D4AF37]'
                : 'text-[#8C857B] hover:text-[#E8E2D8]'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Kelebihan Aplikasi</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-[#1F1B15] text-[#F3E5AB] border-t-2 border-[#D4AF37]'
                : 'text-[#8C857B] hover:text-[#E8E2D8]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Gambar Grafis Promo</span>
          </button>

          <button
            onClick={() => setActiveTab('copywriting')}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'copywriting'
                ? 'bg-[#1F1B15] text-[#F3E5AB] border-t-2 border-[#D4AF37]'
                : 'text-[#8C857B] hover:text-[#E8E2D8]'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Teks Caption Broadcast</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-[#EAE6E1]">
          
          {/* TAB 1: BUKTI WITHDRAWAL 7 MINGGU (Rp 4.000.000) */}
          {activeTab === 'withdrawal' && (
            <div className="space-y-6 animate-fade-in">
              {/* Summary Banner */}
              <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-950/70 via-[#18261C] to-[#121E15] border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Pencairan Rutin 7 Mingguan</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
                        Disetujui & Cair 100%
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <h3 className="text-2xl font-bold font-mono text-[#F7F5F2]">Rp 4.000.000</h3>
                      <span className="text-xs text-[#A0988C]">/ siklus 7 minggu</span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs bg-black/40 p-2.5 rounded-xl border border-emerald-500/20">
                  <span className="text-[#A0988C] block text-[10px]">Total 4 Siklus Terbayar:</span>
                  <span className="text-base font-bold text-amber-300 font-mono">Rp 16.000.000</span>
                </div>
              </div>

              {/* Cycle Selector Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    Pilih Bukti Siklus Penarikan:
                  </label>
                  <span className="text-[10px] text-[#A0988C]">Klik untuk mengganti struk</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {withdrawalCycles.map((cycleItem, idx) => {
                    const isSelected = selectedCycleIndex === idx;
                    return (
                      <button
                        key={cycleItem.cycle}
                        onClick={() => setSelectedCycleIndex(idx)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#2E2616] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                            : 'bg-[#191612] border-[#2A231A] hover:bg-[#221D17]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#A0988C]">Siklus {cycleItem.cycle}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-xs font-bold text-[#F7F5F2] mt-1 font-mono">Rp 4.000.000</span>
                        <span className="text-[9px] text-[#8C857B] mt-0.5">{cycleItem.date}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name customization for personalization */}
              <div className="p-3 rounded-xl bg-[#181511] border border-[#2A241C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#A0988C]">Nama Penerima di Struk:</span>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={customInvestorName}
                      onChange={(e) => setCustomInvestorName(e.target.value)}
                      className="px-2 py-1 rounded bg-[#0F0E0D] border border-[#D4AF37] text-amber-200 text-xs font-bold focus:outline-none"
                      placeholder="Masukkan nama Anda"
                    />
                  ) : (
                    <strong className="text-amber-300 font-serif text-sm">{customInvestorName}</strong>
                  )}
                </div>
                <button
                  onClick={() => setIsEditingName(!isEditingName)}
                  className="text-[11px] text-[#D4AF37] hover:underline font-medium cursor-pointer"
                >
                  {isEditingName ? 'Simpan Nama' : 'Ubah Nama Promosi'}
                </button>
              </div>

              {/* View Style Switcher */}
              <div className="flex items-center justify-between gap-2 border-b border-[#2A241C] pb-2">
                <span className="text-xs font-bold text-[#C2BCB3]">Gaya Tampilan Struk Screenshot:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setViewStyle('banking_receipt')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      viewStyle === 'banking_receipt'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : 'bg-[#221D17] text-[#A0988C] hover:text-[#F7F5F2]'
                    }`}
                  >
                    Struk M-Banking
                  </button>
                  <button
                    onClick={() => setViewStyle('executive_card')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      viewStyle === 'executive_card'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : 'bg-[#221D17] text-[#A0988C] hover:text-[#F7F5F2]'
                    }`}
                  >
                    Sertifikat Gold
                  </button>
                  <button
                    onClick={() => setViewStyle('timeline')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      viewStyle === 'timeline'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : 'bg-[#221D17] text-[#A0988C] hover:text-[#F7F5F2]'
                    }`}
                  >
                    Timeline 7 Minggu
                  </button>
                </div>
              </div>

              {/* STYLE 1: STRUK M-BANKING (The highest converting format for WhatsApp & Social Media) */}
              {viewStyle === 'banking_receipt' && (
                <div id="promotional-banking-receipt" className="relative mx-auto max-w-md rounded-2xl bg-[#0C0F0D] border-2 border-emerald-500/50 p-6 shadow-2xl overflow-hidden font-sans">
                  {/* Top Watermark Pattern */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Bank Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-white text-blue-900 font-black text-xs tracking-wider">
                          {currentCycle.bankLogo}
                        </span>
                        <span className="text-xs font-bold tracking-wider text-[#A0988C]">BI-FAST TRANSFER</span>
                      </div>
                      <p className="text-[10px] text-emerald-400 font-mono mt-1">Status: TRANSFER DANA BERHASIL</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#8C857B] block">ID Transaksi</span>
                      <span className="font-mono text-xs text-[#F7F5F2] font-bold">{currentCycle.txId}</span>
                    </div>
                  </div>

                  {/* Nominal Section */}
                  <div className="my-6 text-center py-4 rounded-xl bg-[#141A16] border border-emerald-500/30">
                    <span className="text-[11px] text-[#A0988C] uppercase tracking-wider block">Total Dana Ditransfer</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tracking-tight mt-1">
                      Rp 4.000.000
                    </h2>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{currentCycle.status}</span>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-3 text-xs divide-y divide-white/5">
                    <div className="flex justify-between pt-2">
                      <span className="text-[#8C857B]">Penerima</span>
                      <span className="font-bold text-[#F7F5F2] text-right font-serif">{customInvestorName}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-[#8C857B]">Bank Tujuan</span>
                      <span className="font-medium text-[#F7F5F2]">{currentCycle.bankName}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-[#8C857B]">No. Rekening</span>
                      <span className="font-mono text-[#F7F5F2]">{currentCycle.accountNumber}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-[#8C857B]">Pengirim</span>
                      <span className="font-bold text-amber-300">INDOGOLD PT LOGAM MULIA</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-[#8C857B]">Waktu Transaksi</span>
                      <span className="text-[#F7F5F2] font-mono">{currentCycle.date} • {currentCycle.time}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-[#8C857B]">Nomor Referensi</span>
                      <span className="font-mono text-[11px] text-[#A0988C]">{currentCycle.refNumber}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-[#8C857B]">Keterangan</span>
                      <span className="text-amber-200 text-right max-w-[200px]">{currentCycle.notes} ({currentCycle.weekLabel})</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-[#8C857B]">Biaya Transfer</span>
                      <span className="font-bold text-emerald-400">Rp 0 (GRATIS)</span>
                    </div>
                  </div>

                  {/* Security & Regulatory Stamp */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C857B]">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Diawasi BAPPEBTI & Kominfo</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">TERVALIDASI SISTEM</span>
                  </div>
                </div>
              )}

              {/* STYLE 2: EXECUTIVE GOLD CERTIFICATE */}
              {viewStyle === 'executive_card' && (
                <div id="promotional-gold-card" className="relative mx-auto max-w-md rounded-2xl bg-gradient-to-b from-[#221C14] to-[#12100E] border-2 border-[#D4AF37] p-6 shadow-2xl overflow-hidden">
                  <div className="absolute top-2 right-2 text-6xl font-serif text-[#D4AF37]/10 select-none pointer-events-none">
                    24K
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
                        <div className="w-full h-full rounded-[10px] bg-[#141210] flex items-center justify-center font-bold text-amber-400 font-serif">
                          IG
                        </div>
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-[#F3E5AB]">INDOGOLD OFFICIAL VOUCHER</h4>
                        <p className="text-[10px] text-[#A0988C]">Surat Bukti Pencairan Portofolio Emas</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      PAID / LUNAS
                    </span>
                  </div>

                  {/* Amount Badge */}
                  <div className="my-5 p-4 rounded-xl bg-[#1A1610] border border-[#D4AF37]/40 text-center">
                    <span className="text-[10px] text-[#A0988C] uppercase tracking-widest block">Nominal Pencairan Emas</span>
                    <h2 className="text-3xl font-extrabold text-amber-300 font-serif mt-1">Rp 4.000.000</h2>
                    <span className="text-[11px] text-[#C2BCB3] block mt-1">
                      Siklus 7 Minggu • Bersih Masuk Rekening {currentCycle.bankLogo}
                    </span>
                  </div>

                  {/* Data Rows */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#2A241C] pb-1.5">
                      <span className="text-[#8C857B]">Nama Investor:</span>
                      <span className="font-bold text-[#F7F5F2]">{customInvestorName}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#2A241C] pb-1.5">
                      <span className="text-[#8C857B]">Tanggal Efektif:</span>
                      <span className="text-[#F7F5F2] font-mono">{currentCycle.date}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#2A241C] pb-1.5">
                      <span className="text-[#8C857B]">Metode Pembayaran:</span>
                      <span className="text-[#F7F5F2]">Transfer Realtime {currentCycle.bankName}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#2A241C] pb-1.5">
                      <span className="text-[#8C857B]">Ref Transaksi:</span>
                      <span className="text-amber-300 font-mono text-[11px]">{currentCycle.refNumber}</span>
                    </div>
                  </div>

                  {/* Official Gold Seal Footer */}
                  <div className="mt-5 pt-3 border-t border-[#D4AF37]/30 flex items-center justify-between text-[10px]">
                    <span className="text-[#A0988C]">Jaminan Emas Fisik SNI 99.99%</span>
                    <span className="text-amber-400 font-bold tracking-wider uppercase">PT INDOGOLD MAKMUR</span>
                  </div>
                </div>
              )}

              {/* STYLE 3: TIMELINE SIKLUS 7 MINGGU LENGKAP */}
              {viewStyle === 'timeline' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#191612] border border-[#2E2820] text-xs text-[#C2BCB3]">
                    Berikut adalah rekam jejak konsistensi penarikan berkala setiap 7 minggu dengan nominal tetap <strong>Rp 4.000.000</strong>:
                  </div>

                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-emerald-400 before:to-emerald-500">
                    {withdrawalCycles.map((cycleItem, index) => (
                      <div key={cycleItem.cycle} className="relative p-4 rounded-xl bg-[#181512] border border-[#2D261D] shadow-md">
                        {/* Bullet Icon */}
                        <div className="absolute -left-[27px] top-4 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#141210] flex items-center justify-center text-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-300">{cycleItem.weekLabel}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                              LUNAS
                            </span>
                          </div>
                          <span className="text-xs font-mono text-[#8C857B]">{cycleItem.date}</span>
                        </div>

                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="text-xl font-bold font-mono text-[#F7F5F2]">Rp 4.000.000</span>
                          <span className="text-xs text-[#A0988C]">{cycleItem.bankName}</span>
                        </div>

                        <p className="text-[11px] text-[#8C857B] mt-1 font-mono">
                          Ref: {cycleItem.refNumber} • Penerima: {customInvestorName}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#241E15] to-[#191612] border border-[#D4AF37]/50 text-center">
                    <span className="text-xs text-[#A0988C]">Total Akumulasi 4 Kali Pencairan:</span>
                    <h3 className="text-2xl font-bold text-amber-300 font-mono mt-0.5">Rp 16.000.000</h3>
                    <p className="text-[11px] text-emerald-400 mt-1">100% Berhasil Diterima Rekening Tanpa Hambatan</p>
                  </div>
                </div>
              )}

              {/* Action Buttons for Screenshotting / Copying */}
              <div className="p-4 rounded-2xl bg-[#181512] border border-[#2E2820] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#A0988C] text-center sm:text-left">
                  <span className="font-bold text-[#F7F5F2] block">Tips Promosi Screenshot:</span>
                  <span>Ambil tangkapan layar (screenshot) kartu di atas untuk diposting ke Story IG, WA, atau grup Facebook.</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleCopySingle(
                      `BUKTI PENARIKAN EMAS INDOGOLD\nNominal: Rp 4.000.000 (Siklus 7 Minggu)\nPenerima: ${customInvestorName}\nBank: ${currentCycle.bankName}\nStatus: ${currentCycle.status}\nNo Ref: ${currentCycle.refNumber}\nLegalitas: BAPPEBTI & Kominfo`,
                      'Ringkasan Bukti WD'
                    )}
                    className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-[#262018] border border-[#3E3426] text-xs font-bold text-[#F3E5AB] hover:bg-[#342C1E] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Salin Rincian</span>
                  </button>

                  <button
                    onClick={() => {
                      onShowToast('Silakan gunakan tombol Screenshot HP atau Snipping Tool untuk menangkap tampilan ini!');
                    }}
                    className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-slate-950 text-xs font-bold hover:brightness-110 transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Siap Screenshot</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KELEBIHAN APLIKASI INDOGOLD */}
          {activeTab === 'advantages' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header card with official accreditation badges */}
              <div className="rounded-2xl p-5 bg-gradient-to-r from-[#241E15] via-[#1D1812] to-[#241E15] border border-[#D4AF37]/40 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase block">Mengapa Memilih Kami</span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F7F5F2] mt-0.5">
                      6 Keunggulan Utama NusantaraGold
                    </h3>
                    <p className="text-xs text-[#A0988C] mt-1 max-w-md leading-relaxed">
                      Standar tertinggi investasi emas aman, berizin resmi, dengan imbal hasil nyata yang dicairkan rutin.
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-[#141210] border border-[#D4AF37]/30 text-center">
                      <span className="text-[9px] text-[#8C857B] block uppercase">Regulasi</span>
                      <span className="text-xs font-bold text-amber-300">BAPPEBTI & Kominfo</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-[#141210] border border-emerald-500/30 text-center">
                      <span className="text-[9px] text-[#8C857B] block uppercase">Kemurnian Emas</span>
                      <span className="text-xs font-bold text-emerald-400">99.99% SNI/LBMA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Grid Advantages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {advantagesList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#181512] border border-[#2E2820] hover:border-[#D4AF37]/50 transition space-y-2 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#262018] border border-[#3E3426] flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#F7F5F2]">{item.title}</h4>
                        <span className="text-[10px] font-bold text-amber-300 block">{item.highlight}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#A0988C] leading-relaxed pt-1 border-t border-[#262018]">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Comparison Table: NusantaraGold vs Tabungan Biasa */}
              <div className="rounded-2xl bg-[#161412] border border-[#2E2820] overflow-hidden shadow-lg">
                <div className="p-3.5 bg-[#1F1B15] border-b border-[#2E2820]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Tabel Perbandingan: NusantaraGold vs Tabungan Konvensional
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#2A241C] text-[#8C857B] text-[10px] uppercase">
                        <th className="p-3">Fitur Investasi</th>
                        <th className="p-3 text-amber-400">NusantaraGold Emas 24K</th>
                        <th className="p-3 text-[#A0988C]">Tabungan Bank Biasa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#24201A]">
                      <tr>
                        <td className="p-3 font-medium text-[#F7F5F2]">Lindung Nilai Inflasi</td>
                        <td className="p-3 text-emerald-400 font-bold">Tahan & Naik Tiap Tahun</td>
                        <td className="p-3 text-rose-400">Nilai Tergerus Inflasi</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-[#F7F5F2]">Hasil Bagi Keuntungan</td>
                        <td className="p-3 text-emerald-400 font-bold">Rutin Cair (Misal: Rp 4 Juta / 7 Minggu)</td>
                        <td className="p-3 text-[#A0988C]">Bunga Rendah (0.5% - 2%)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-[#F7F5F2]">Fisik Emas Nyata</td>
                        <td className="p-3 text-emerald-400 font-bold">Bisa Dicetak Batangan Asli</td>
                        <td className="p-3 text-[#A0988C]">Hanya Angka Saldo Digital</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-[#F7F5F2]">Biaya Admin Bulanan</td>
                        <td className="p-3 text-emerald-400 font-bold">Gratis Rp 0</td>
                        <td className="p-3 text-rose-400">Dipotong Rp 15rb - Rp 25rb / bulan</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-[#F7F5F2]">Kecepatan Penarikan Dana</td>
                        <td className="p-3 text-emerald-400 font-bold">Instan 24/7 Masuk Rekening</td>
                        <td className="p-3 text-[#A0988C]">Mengikuti Jam Kliring</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VISUAL GALLERY (Generated High-Res Promos) */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-[#191612] border border-[#2E2820] text-xs text-[#C2BCB3]">
                Klik pada gambar untuk memperbesar layar penuh. Gambar ini telah dioptimalkan dengan resolusi tajam untuk bahan posting WhatsApp Story, status media sosial, maupun materi promosi digital Anda.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Promo Card 1: Withdrawal Proof Flyer */}
                <div className="rounded-2xl bg-[#181512] border border-[#D4AF37]/35 overflow-hidden shadow-xl group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-black cursor-pointer" onClick={() => setZoomImage(APP_IMAGES.promo_withdrawal_proof)}>
                    <img 
                      src={APP_IMAGES.promo_withdrawal_proof} 
                      alt="Bukti Penarikan Rutin 7 Minggu Rp 4.000.000"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Poster Flyer Mobile</span>
                        <span className="text-white font-bold">Bukti WD 7 Minggu Rp 4.000.000</span>
                      </div>
                      <span className="p-2 rounded-xl bg-black/60 border border-white/20 text-white">
                        <Eye className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-xs text-[#A0988C]">Format Status / Story 9:16</span>
                    <a
                      href={APP_IMAGES.promo_withdrawal_proof}
                      download="NusantaraGold-Bukti-WD-4Juta.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#2E2616] border border-[#D4AF37]/50 text-xs font-bold text-amber-300 hover:bg-[#D4AF37] hover:text-black transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Gambar</span>
                    </a>
                  </div>
                </div>

                {/* Promo Card 2: App Advantages Infographic */}
                <div className="rounded-2xl bg-[#181512] border border-[#D4AF37]/35 overflow-hidden shadow-xl group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-black cursor-pointer" onClick={() => setZoomImage(APP_IMAGES.promo_kelebihan_app)}>
                    <img 
                      src={APP_IMAGES.promo_kelebihan_app} 
                      alt="Infografis Kelebihan NusantaraGold"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Infografis Resmi</span>
                        <span className="text-white font-bold">Kelebihan & Legalitas NusantaraGold</span>
                      </div>
                      <span className="p-2 rounded-xl bg-black/60 border border-white/20 text-white">
                        <Eye className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 flex items-center justify-between">
                    <span className="text-xs text-[#A0988C]">Format Banner Feed 4:3</span>
                    <a
                      href={APP_IMAGES.promo_kelebihan_app}
                      download="NusantaraGold-Kelebihan-Aplikasi.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#2E2616] border border-[#D4AF37]/50 text-xs font-bold text-amber-300 hover:bg-[#D4AF37] hover:text-black transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Gambar</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COPYWRITING BROADCAST TEXT */}
          {activeTab === 'copywriting' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-xl bg-[#181512] border border-[#2A241C] text-xs text-[#C2BCB3]">
                Salin teks caption siap pakai di bawah ini dan padukan dengan screenshot bukti penarikan Rp 4.000.000 untuk meningkatkan konversi calon pendaftar Anda.
              </div>

              {marketingCaptions.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#181512] border border-[#2E2820] space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-300">{item.title}</h4>
                    <button
                      onClick={() => handleCopyText(item.caption, idx)}
                      className="px-3 py-1.5 rounded-lg bg-[#2E2616] border border-[#D4AF37]/40 text-xs font-bold text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-black transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedCaptionIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-3 rounded-xl bg-[#0F0E0D] border border-[#26211B] text-xs text-[#EAE6E1] font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {item.caption}
                  </pre>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Modal Footer with Quick Share CTA */}
        <div className="p-4 border-t border-[#262018] bg-[#110F0D] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#A0988C] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Kode Referral Anda: <strong className="text-amber-300 font-mono">{user.referralCode || 'INDOGOLD99'}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Bukti Penarikan Rutin 7 Minggu Rp 4.000.000 NusantaraGold',
                    text: `Cair rutin Rp 4.000.000 per 7 minggu dari tabungan emas NusantaraGold! Gunakan kode ${user.referralCode || 'NUSANTARAGOLD99'} untuk bonus Rp 30.000.`,
                    url: window.location.origin
                  }).catch(() => {});
                } else {
                  handleCopyText(marketingCaptions[0].caption, 0);
                }
              }}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-slate-950 font-bold text-xs hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
            >
              <Share2 className="w-4 h-4 stroke-[2.3]" />
              <span>Bagikan Sekarang</span>
            </button>
          </div>
        </div>

      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#D4AF37]/50 shadow-2xl">
            <img 
              src={zoomImage} 
              alt="Preview Promosi NusantaraGold" 
              className="w-full h-full object-contain max-h-[85vh]"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/80 text-white hover:text-amber-300 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
