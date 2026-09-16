import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  KeyRound, 
  FileText, 
  Building2, 
  Send, 
  ExternalLink, 
  CheckCircle2,
  Lock,
  PhoneCall,
  Mail,
  Coins,
  User as UserIcon,
  MapPin,
  Sparkles,
  Save
} from 'lucide-react';
import { UserAccount, Transaction } from '../types';
import { formatIDR } from '../data/mockData';
import { GoldCertificateModal } from './GoldCertificateModal';
import { ProofTransferModal } from './ProofTransferModal';
import { PinVerificationModal } from './PinVerificationModal';
import { LiveChatModal } from './modals/LiveChatModal';

export type ActiveModalType = 
  | 'articles' 
  | 'help' 
  | 'pin' 
  | 'certificate' 
  | 'bank' 
  | 'kyc' 
  | 'profile'
  | 'proof_transfer'
  | null;

interface ActiveModalsProps {
  activeModal: ActiveModalType;
  onClose: () => void;
  user: UserAccount;
  onUpdateUser: (updated: Partial<UserAccount>) => void;
  onShowToast: (msg: string) => void;
  onSubmitProof?: (newTx: Transaction, amount: number) => void;
  onStartTrade?: (type: 'buy' | 'sell') => void;
}

export const ActiveModals: React.FC<ActiveModalsProps> = ({
  activeModal,
  onClose,
  user,
  onUpdateUser,
  onShowToast,
  onSubmitProof,
  onStartTrade
}) => {
  if (!activeModal) return null;

  {/* Modul Kirim Bukti Transfer */}
  if (activeModal === 'proof_transfer') {
    return (
      <ProofTransferModal
        user={user}
        onClose={onClose}
        onSubmitProof={(tx, amt) => {
          if (onSubmitProof) onSubmitProof(tx, amt);
        }}
        onShowToast={onShowToast}
      />
    );
  }

  {/* 4. Modul Sertifikat Keaslian Emas & Pengiriman Fisik */}
  if (activeModal === 'certificate') {
    return (
      <GoldCertificateModal 
        user={user} 
        initialGrams={user.goldHoldingsGram > 0 ? user.goldHoldingsGram : 0}
        onClose={onClose} 
        onShowToast={onShowToast} 
        onStartTrade={onStartTrade}
      />
    );
  }

  {/* Modul Live Chat Bantuan Prioritas 24 Jam */}
  if (activeModal === 'help') {
    return (
      <LiveChatModal
        user={user}
        onClose={onClose}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      {/* 1. Modul Riset & Wawasan Pasar Emas */}
      {activeModal === 'articles' && (
        <ArticlesModal onClose={onClose} />
      )}

      {/* 3. Modul Ganti PIN Keamanan 6 Digit */}
      {activeModal === 'pin' && (
        <PinModal 
          user={user}
          onClose={onClose} 
          onUpdateUser={onUpdateUser}
          onShowToast={onShowToast} 
        />
      )}

      {/* 5. Modul Rekening Bank Terdaftar */}
      {activeModal === 'bank' && (
        <BankModal onClose={onClose} onShowToast={onShowToast} />
      )}

      {/* 6. Modul Status KYC */}
      {activeModal === 'kyc' && (
        <KycModal user={user} onClose={onClose} />
      )}

      {/* 7. Modul Edit Profil & Akun Pengguna */}
      {activeModal === 'profile' && (
        <ProfileModal
          user={user}
          onClose={onClose}
          onUpdateUser={onUpdateUser}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};

/* --- SUB COMPONENT 1: Articles / Wawasan Pasar Emas --- */
const ArticlesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

  const articles = [
    {
      id: 1,
      tag: 'ANALISIS MAKROEKONOMI',
      title: 'Sentimen Emas Global: Ekspektasi Suku Bunga Global Menguatkan Posisi Emas',
      date: '13 Sep 2026 • 2 jam lalu',
      author: 'Tim Riset IndoGold Bullion',
      content: `Emas batangan mencatatkan momentum kenaikan konsisten di kuartal ketiga 2026. Pelemahan indeks dolar serta langkah bank sentral global dalam menambah cadangan emas fisik (official gold reserves) menopang harga beli lokal di atas level Rp 1.450.000 per gram. Bagi investor ritel, strategi Dollar Cost Averaging (DCA) tetap menjadi rekomendasi utama untuk memitigasi volatilitas jangka pendek.`
    },
    {
      id: 2,
      tag: 'PANDUAN INVESTOR',
      title: 'Perbedaan Emas Batangan ANTAM, UBS, dan PAMP Suisse: Mana Pilihan Terbaik?',
      date: '12 Sep 2026 • Kemarin',
      author: 'Edukasi Portofolio IndoGold',
      content: `ANTAM CertiCard diakui dengan standar LBMA (London Bullion Market Association) yang diakui secara global. UBS Gold menawarkan biaya cetak kompetitif dengan likuiditas tinggi di toko emas seluruh nusantara. PAMP Suisse dari Swiss menghadirkan teknologi Veriscan dengan cetakan artistik Lady Fortuna yang sangat diminati oleh kolektor internasional.`
    },
    {
      id: 3,
      tag: 'STRATEGI TABUNGAN',
      title: 'Lindung Nilai (Hedging) Inflasi: Mengapa Alokasi Emas 10-20% Ideal?',
      date: '10 Sep 2026 • 3 hari lalu',
      author: 'Financial Advisory IndoGold',
      content: `Data historis 30 tahun menunjukkan daya beli emas tetap konstan terhadap kebutuhan pokok. Mengalokasikan 10% hingga 20% dari total kekayaan ke dalam emas murni 24 karat terbukti menjaga nilai riil portofolio dari penurunan nilai mata uang tunai.`
    }
  ];

  return (
    <div className="w-full max-w-lg bg-[#1A1816] border border-[#2E2A26] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
      <div className="p-4 border-b border-[#2E2A26] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-serif text-lg text-[#F7F5F2]">Wawasan & Riset Pasar Emas</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2A26] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-3">
        {selectedArticle !== null ? (
          <div className="space-y-3 animate-fade-in">
            <button
              onClick={() => setSelectedArticle(null)}
              className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 mb-2"
            >
              ← Kembali ke Daftar Artikel
            </button>
            {(() => {
              const art = articles.find((a) => a.id === selectedArticle)!;
              return (
                <div className="space-y-2">
                  <span className="text-[10px] text-[#D4AF37] bg-[#4A3C13]/60 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                    {art.tag}
                  </span>
                  <h4 className="font-serif text-base text-[#F7F5F2] leading-snug">{art.title}</h4>
                  <p className="text-[11px] text-[#9E978E]">{art.date} • Oleh {art.author}</p>
                  <div className="p-3.5 rounded-xl bg-[#0F0E0D] border border-[#24211E] text-xs text-[#EAE6E1] leading-relaxed mt-2">
                    {art.content}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          articles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art.id)}
              className="p-3.5 rounded-xl bg-[#0F0E0D] border border-[#24211E] hover:border-[#D4AF37]/50 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[10px] text-[#9E978E] mb-1">
                <span className="text-[#D4AF37] font-medium">{art.tag}</span>
                <span>{art.date}</span>
              </div>
              <h4 className="text-xs text-[#F7F5F2] group-hover:text-[#F3E5AB] font-medium leading-snug">
                {art.title}
              </h4>
              <span className="text-[11px] text-[#D4AF37] mt-2 inline-flex items-center gap-1 font-sans">
                Baca Analisis Lengkap →
              </span>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-[#0F0E0D] border-t border-[#2E2A26]">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#26231F] text-xs text-[#EAE6E1] hover:text-[#D4AF37] transition"
        >
          Tutup Wawasan
        </button>
      </div>
    </div>
  );
};

/* --- SUB COMPONENT 2: Pusat Bantuan & Layanan 24/7 --- */
const HelpModal: React.FC<{ onClose: () => void; onShowToast: (msg: string) => void }> = ({
  onClose,
  onShowToast
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Bagaimana cara mencetak emas fisik ke rumah?',
      a: 'Anda dapat menukarkan gramatur tabungan emas digital menjadi batangan fisik (ANTAM, UBS, PAMP) melalui menu "Cetak Sertifikat Fisik Emas" di tab Akun. Pengiriman menggunakan ekspedisi berasuransi 100% langsung ke alamat Anda.'
    },
    {
      q: 'Berapa minimal transaksi beli emas di IndoGold?',
      a: 'Minimal pembelian emas digital mulai dari Rp 10.000 atau setara ~0.0069 gram. Anda bebas menambah tabungan emas kapan pun tanpa batasan waktu.'
    },
    {
      q: 'Apakah emas di IndoGold aman dan memiliki wujud fisik nyata?',
      a: 'Sangat aman. Setiap gram saldo emas digital didukung 1:1 oleh fisik emas batangan 24 karat yang tersimpan di lembaga kliring kustodi resmi teregulasi BAPPEBTI Republik Indonesia.'
    },
    {
      q: 'Berapa lama proses penarikan saldo kas ke rekening?',
      a: 'Penarikan saldo kas diproses instan melalui jaringan BI-FAST (1-5 menit) untuk bank BCA, Mandiri, BRI, dan BNI 24 jam sehari.'
    }
  ];

  return (
    <div className="w-full max-w-md bg-[#1A1816] border border-[#2E2A26] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
      <div className="p-4 border-b border-[#2E2A26] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-serif text-lg text-[#F7F5F2]">Pusat Bantuan IndoGold</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2A26] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-4">
        {/* Kontak Cepat Prioritas */}
        <div className="p-3.5 rounded-xl bg-[#0F0E0D] border border-[#24211E] space-y-2">
          <span className="text-[10px] uppercase text-[#9E978E] tracking-wider block">Bantuan Prioritas 24/7</span>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onShowToast('Menghubungkan ke Tim Prioritas WhatsApp: +62 811-INDOGOLD');
                onClose();
              }}
              className="p-2.5 rounded-lg bg-[#26231F] border border-[#4A433D] hover:border-[#D4AF37] transition flex items-center gap-2 text-xs text-[#EAE6E1]"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#8CEB9C]" />
              <span>WhatsApp 24 Jam</span>
            </button>

            <button
              onClick={() => {
                onShowToast('Email bantuan dialihkan ke support@indogold.co.id');
                onClose();
              }}
              className="p-2.5 rounded-lg bg-[#26231F] border border-[#4A433D] hover:border-[#D4AF37] transition flex items-center gap-2 text-xs text-[#EAE6E1]"
            >
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Kirim Tiket Email</span>
            </button>
          </div>
        </div>

        {/* Pertanyaan Populer (FAQ) */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-[#9E978E] mb-2 px-1">Pertanyaan Umum (FAQ)</h4>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#0F0E0D] border border-[#24211E] overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-3 text-left text-xs font-medium text-[#F7F5F2] flex items-center justify-between hover:text-[#D4AF37]"
                >
                  <span>{faq.q}</span>
                  <span className="text-sm text-[#D4AF37]">{activeFaq === idx ? '−' : '+'}</span>
                </button>
                {activeFaq === idx && (
                  <div className="px-3 pb-3 text-[11px] text-[#9E978E] leading-relaxed border-t border-[#1F1C19] pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 bg-[#0F0E0D] border-t border-[#2E2A26]">
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#26231F] text-xs text-[#EAE6E1] hover:text-[#D4AF37] transition"
        >
          Tutup Bantuan
        </button>
      </div>
    </div>
  );
};

/* --- SUB COMPONENT 3: Ubah PIN Transaksi 6 Digit --- */
const PinModal: React.FC<{ 
  user: UserAccount;
  onClose: () => void; 
  onUpdateUser?: (updated: Partial<UserAccount>) => void;
  onShowToast: (msg: string) => void;
}> = ({
  user,
  onClose,
  onUpdateUser,
  onShowToast
}) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    const actualCurrentPin = user.pinCode || '123456';
    if (oldPin !== actualCurrentPin) {
      setPinError(`PIN Lama tidak sesuai. (PIN Awal Pengujian: ${actualCurrentPin})`);
      return;
    }

    if (newPin.length !== 6 || isNaN(Number(newPin))) {
      setPinError('PIN baru harus terdiri dari tepat 6 digit angka.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('Konfirmasi PIN baru tidak sesuai.');
      return;
    }

    if (onUpdateUser) {
      onUpdateUser({ pinCode: newPin, pinSet: true });
    }
    onShowToast('PIN Transaksi 6-Digit baru berhasil disimpan dan aktif!');
    onClose();
  };

  return (
    <div className="w-full max-w-sm bg-[#1A1816] border border-[#2E2A26] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-[#2E2A26] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-serif text-lg text-[#F7F5F2]">PIN Transaksi (6 Digit)</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2A26] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSavePin} className="p-4 space-y-3 text-xs">
        {pinError && (
          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-[11px] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}
        <div>
          <label className="text-[11px] text-[#9E978E] block mb-1">PIN Lama</label>
          <input
            type="password"
            maxLength={6}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            placeholder="Masukkan 6 angka PIN lama"
            className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2A26] text-center tracking-widest text-base font-mono text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-[11px] text-[#9E978E] block mb-1">PIN Baru (6 Angka)</label>
          <input
            type="password"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="6 digit angka baru"
            className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2A26] text-center tracking-widest text-base font-mono text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-[11px] text-[#9E978E] block mb-1">Konfirmasi PIN Baru</label>
          <input
            type="password"
            maxLength={6}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="Ulangi 6 digit angka baru"
            className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2A26] text-center tracking-widest text-base font-mono text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none"
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#0F0E0D] font-semibold text-xs hover:bg-[#F3E5AB] transition cursor-pointer"
          >
            Simpan PIN Baru
          </button>
        </div>
      </form>
    </div>
  );
};

/* --- SUB COMPONENT 5: Rekening Bank Terdaftar --- */
const BankModal: React.FC<{ onClose: () => void; onShowToast: (msg: string) => void }> = ({
  onClose,
  onShowToast
}) => {
  const [bankName, setBankName] = useState('BCA');
  const [accNumber, setAccNumber] = useState('8271882100');
  const [accHolder, setAccHolder] = useState('Khoirul Anis');

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast(`Rekening pencairan ${bankName} (${accNumber}) berhasil diperbarui.`);
    onClose();
  };

  return (
    <div className="w-full max-w-sm bg-[#1A1816] border border-[#2E2A26] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-[#2E2A26] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-serif text-lg text-[#F7F5F2]">Ubah Rekening Bank</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2A26] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSaveBank} className="p-4 space-y-3 text-xs">
        <div>
          <label className="text-[11px] text-[#9E978E] block mb-1">Nama Bank</label>
          <select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2A26] text-xs text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none"
          >
            <option value="BCA">Bank Central Asia (BCA)</option>
            <option value="Mandiri">Bank Mandiri</option>
            <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
            <option value="BNI">Bank Negara Indonesia (BNI)</option>
            <option value="CIMB">CIMB Niaga</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-[#9E978E] block mb-1">Nomor Rekening</label>
          <input
            type="text"
            value={accNumber}
            onChange={(e) => setAccNumber(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2A26] font-mono text-xs text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="text-[11px] text-[#9E978E] block mb-1">Nama Pemilik Rekening</label>
          <input
            type="text"
            value={accHolder}
            onChange={(e) => setAccHolder(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#2E2A26] text-xs text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none"
            required
          />
          <p className="text-[9px] text-[#9E978E] mt-1">*Nama harus sama dengan identitas KTP terverifikasi.</p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#0F0E0D] font-semibold text-xs hover:bg-[#F3E5AB] transition cursor-pointer"
          >
            Simpan Rekening Utama
          </button>
        </div>
      </form>
    </div>
  );
};

/* --- SUB COMPONENT 6: Verifikasi KYC Modal --- */
const KycModal: React.FC<{ user: UserAccount; onClose: () => void }> = ({ user, onClose }) => {
  return (
    <div className="w-full max-w-sm bg-[#1A1816] border border-[#2E2A26] rounded-2xl overflow-hidden shadow-2xl p-5 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-[#2E5C3E]/30 border border-[#2E5C3E] mx-auto flex items-center justify-center text-[#8CEB9C]">
        <ShieldCheck className="w-6 h-6" />
      </div>

      <h3 className="font-serif text-lg text-[#F7F5F2]">Status KYC Terverifikasi</h3>
      <p className="text-xs text-[#9E978E] leading-relaxed">
        Akun atas nama <strong className="text-[#F7F5F2]">{user.name}</strong> telah memenuhi verifikasi identitas Level 2 (BAPPEBTI).
      </p>

      <div className="bg-[#0F0E0D] p-3 rounded-xl border border-[#24211E] text-left text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-[#9E978E]">Status Akun:</span>
          <span className="text-[#8CEB9C]">Aktif & Terlindungi</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9E978E]">Limit Simpanan Emas:</span>
          <span className="text-[#D4AF37]">Tanpa Batas (Unlimited)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#9E978E]">Limit Penarikan Kas:</span>
          <span className="text-[#EAE6E1]">Rp 100.000.000 / hari</span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2.5 rounded-xl bg-[#26231F] text-xs text-[#EAE6E1] hover:text-[#D4AF37] transition cursor-pointer"
      >
        Tutup Informasi
      </button>
    </div>
  );
};

/* --- SUB COMPONENT 7: Edit Profil & Akun Pengguna Realistis --- */
const ProfileModal: React.FC<{
  user: UserAccount;
  onClose: () => void;
  onUpdateUser: (updated: Partial<UserAccount>) => void;
  onShowToast: (msg: string) => void;
}> = ({ user, onClose, onUpdateUser, onShowToast }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '+62 812-3456-7890');
  const [nik, setNik] = useState('3275081908950002');
  const [npwp, setNpwp] = useState('89.442.115.8-012.000');
  const [address, setAddress] = useState('Sudirman Central Business District, Jakarta Selatan');
  const [isSaving, setIsSaving] = useState(false);
  const [showPinAuth, setShowPinAuth] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama lengkap tidak boleh kosong');
      return;
    }
    // Otorisasi PIN 6-digit sebelum perubahan profil disimpan
    setShowPinAuth(true);
  };

  const handlePinAuthSuccess = () => {
    setShowPinAuth(false);
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      });
      setIsSaving(false);
      onShowToast('Profil dan data investor berhasil disimpan dengan otorisasi PIN!');
      onClose();
    }, 400);
  };

  return (
    <div className="w-full max-w-md bg-[#161412] border border-[#2E2820] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      {/* Header */}
      <div className="p-4 border-b border-[#2E2820] flex items-center justify-between bg-[#1A1816]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4A3C13] to-[#26231F] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-sm">
            <UserIcon className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif text-base text-[#F7F5F2]">Pengaturan Akun & Profil</h3>
            <p className="text-[10px] text-[#A0988C]">Kelola data identitas dan preferensi akun investor</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2820] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs">
        {/* Tier & Status Banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-[#2B2313] via-[#1E1B17] to-[#141210] border border-[#D4AF37]/35 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold block">
                Status Keanggotaan
              </span>
              <span className="text-xs font-bold text-[#F7F5F2]">VIP Member • 24K Bullion Investor</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#2E5C3E]/40 border border-[#2E5C3E] text-[#8CEB9C] text-[10px] font-semibold">
            KYC Level 2
          </span>
        </div>

        {/* Full Name */}
        <div>
          <label className="text-[11px] font-medium text-[#C2BCB3] block mb-1">
            Nama Lengkap (Sesuai KTP)
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none transition"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-[11px] font-medium text-[#C2BCB3] block mb-1">
            Alamat Email Terdaftar
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none transition"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-[11px] font-medium text-[#C2BCB3] block mb-1">
            Nomor Telepon / WhatsApp
          </label>
          <div className="relative">
            <PhoneCall className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none transition"
              required
            />
          </div>
        </div>

        {/* Grid: NIK & NPWP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-[#C2BCB3] block mb-1">
              NIK KTP (16 Digit)
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-emerald-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                maxLength={16}
                className="w-full pl-8 pr-2 py-2 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs font-mono text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#C2BCB3] block mb-1">
              NPWP (Pajak PPh 0,45%)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#D4AF37] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                className="w-full pl-8 pr-2 py-2 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs font-mono text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <label className="text-[11px] font-medium text-[#C2BCB3] block mb-1">
            Alamat Domisili / Pengiriman Fisik
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#8C857B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#F7F5F2] focus:border-[#D4AF37] focus:outline-none transition"
            />
          </div>
          <span className="text-[10px] text-[#8C857B] mt-1 block">
            Digunakan untuk konfirmasi tujuan pengiriman sertifikat & emas fisik berasuransi.
          </span>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#26231F] text-[#C2BCB3] text-xs hover:text-white transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0F0E0D] font-bold text-xs hover:opacity-90 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil (Verifikasi PIN)'}</span>
          </button>
        </div>
      </form>

      {/* PIN Security Verification Modal for Profile Changes */}
      <PinVerificationModal
        isOpen={showPinAuth}
        title="Otorisasi Ubah Profil"
        subtitle="Masukkan 6 digit PIN transaksi Anda untuk mengonfirmasi pembaruan data akun investor."
        expectedPin={user.pinCode || '123456'}
        biometricEnabled={user.biometricEnabled}
        onSuccess={handlePinAuthSuccess}
        onClose={() => setShowPinAuth(false)}
      />
    </div>
  );
};

