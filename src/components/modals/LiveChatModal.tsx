import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User as UserIcon, 
  Headphones, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Clock,
  CheckCheck
} from 'lucide-react';
import { UserAccount } from '../../types';

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'agent';
  text: string;
  time: string;
  isQuickOption?: boolean;
}

interface LiveChatModalProps {
  user: UserAccount;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const QUICK_TOPICS = [
  'Cara cetak emas fisik',
  'Konfirmasi bukti transfer',
  'Pencairan dana / WD',
  'Bonus referral Rp 30.000',
  'Ganti PIN transaksi'
];

export const LiveChatModal: React.FC<LiveChatModalProps> = ({
  user,
  onClose,
  onShowToast
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Halo ${user.name.split(' ')[0] || 'Investor'}! Selamat datang di Layanan Live Chat Resmi IndoGold 24K. Petugas CS Prioritas dan Asisten kami siap membantu Anda 24 jam nonstop.`,
      time: 'Baru saja'
    },
    {
      id: 'welcome-2',
      sender: 'bot',
      text: 'Silakan ketik pertanyaan Anda atau pilih topik cepat berikut untuk respon instan:',
      time: 'Baru saja'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentName, setAgentName] = useState('Putri • Tim CS Prioritas IndoGold');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getAutoResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('cetak') || q.includes('fisik') || q.includes('kirim')) {
      return 'Untuk penarikan & cetak emas fisik (ANTAM CertiCard, UBS, PAMP Suisse), Anda dapat mengakses menu "Cetak Sertifikat & Tarik Emas Fisik" pada tab Akun. Pengiriman menggunakan kurir berasuransi 100% langsung ke alamat Anda.';
    }
    if (q.includes('transfer') || q.includes('bukti') || q.includes('deposit') || q.includes('setor') || q.includes('permata')) {
      return 'Pembayaran deposit melalui Virtual Account BCA/Mandiri/BRI/BNI diproses otomatis dalam 1 menit. Jika transfer manual ke Rekening Permata atau E-Wallet OVO, silakan upload bukti melalui tombol "Kirim Bukti Transfer Manual" di tab Akun agar tim verifikator kami segera menyetujuinya.';
    }
    if (q.includes('cair') || q.includes('wd') || q.includes('tarik dana') || q.includes('rekening')) {
      return 'Penarikan saldo kas tunai diproses via jaringan BI-FAST instan (1-5 menit) ke rekening bank terdaftar Anda tanpa batasan jam kerja. Pastikan nomor rekening dan nama Anda sudah sesuai dengan data KYC.';
    }
    if (q.includes('referral') || q.includes('bonus') || q.includes('30.000') || q.includes('30000') || q.includes('20000')) {
      return `Setiap pengguna baru yang mendaftar otomatis menerima saldo Rp 20.000, dan jika menggunakan kode referral Anda [${user.referralCode}], mereka mendapat ekstra +Rp 10.000 (total Rp 30.000). Anda juga otomatis mendapatkan bonus Rp 10.000 per teman terdaftar!`;
    }
    if (q.includes('pin') || q.includes('password') || q.includes('sandi') || q.includes('keamanan')) {
      return 'PIN keamanan 6-digit dapat diubah kapan saja melalui menu "Keamanan & Proteksi Transaksi" di tab Akun. PIN ini wajib untuk setiap penarikan saldo dan perubahan profil demi melindungi aset emas Anda.';
    }
    return `Terima kasih pesan Anda: "${query}". Pesan Anda telah kami teruskan ke petugas ${agentName}. Saldo kas dan kepemilikan ${user.goldHoldingsGram.toFixed(4)} gr emas Anda terpantau aman dalam sistem kustodi terenkripsi BAPPEBTI. Ada hal lain yang bisa kami bantu?`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputVal('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replyText = getAutoResponse(text);
      const replyMsg: Message = {
        id: `reply-${Date.now()}`,
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#141210] border border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] max-h-[90vh]">
        {/* Header Live Chat */}
        <div className="p-4 bg-gradient-to-r from-[#24201A] via-[#1A1815] to-[#141210] border-b border-[#3A3224] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] text-[#0F0E0D] flex items-center justify-center font-bold shadow-md shadow-[#D4AF37]/20">
                <Headphones className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#141210]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm font-bold text-[#F7F5F2]">Live Chat Prioritas IndoGold</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-[#A0988C] flex items-center gap-1.5 mt-0.5">
                <span>{agentName}</span>
                <span>•</span>
                <span className="text-[#D4AF37]">Respon &lt; 1 Menit</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#24201A] border border-[#3A3224] flex items-center justify-center text-[#A0988C] hover:text-[#D4AF37] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Badge Ribbon */}
        <div className="px-4 py-1.5 bg-[#1F1C18] border-b border-[#2D261C] flex items-center justify-between text-[10px] text-[#C2BCB3]">
          <div className="flex items-center gap-1.5 text-[#D4AF37]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Koneksi Live Chat Terenkripsi End-to-End BAPPEBTI</span>
          </div>
          <span className="text-[#8C857B]">ID Sesi: #{user.referralCode}-CS</span>
        </div>

        {/* Chat Message Scroll Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-[#141210] to-[#0D0C0B]">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#2E2616] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center shrink-0 text-xs">
                    {m.sender === 'bot' ? <Bot className="w-4 h-4" /> : <Headphones className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                )}
                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#3A3224] border border-[#5A4E38] text-[#F3E5AB] flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C49B27] text-[#0F0E0D] font-medium rounded-tr-none shadow-md shadow-[#D4AF37]/10'
                        : 'bg-[#1E1B17] border border-[#3A3224] text-[#EDE8E1] rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-[9px] text-[#7E7870] ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{m.time}</span>
                    {isUser && <CheckCheck className="w-3 h-3 text-[#D4AF37]" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 items-center mr-auto">
              <div className="w-7 h-7 rounded-xl bg-[#2E2616] border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="px-3.5 py-2 rounded-2xl rounded-tl-none bg-[#1E1B17] border border-[#3A3224] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Topics Pills */}
        <div className="px-4 py-2 bg-[#171512] border-t border-[#2A241C] overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-[#8C857B] shrink-0">Bantuan Cepat:</span>
          {QUICK_TOPICS.map((topic, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(topic)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-[#24201A] border border-[#3D3528] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0E0D] transition cursor-pointer"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-[#1A1815] border-t border-[#3A3224] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ketik pertanyaan atau kendala transaksi Anda..."
            className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#0F0E0D] border border-[#3D3528] text-xs text-[#F7F5F2] placeholder:text-[#7A746C] focus:outline-none focus:border-[#D4AF37] transition"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0F0E0D] flex items-center justify-center hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-md shadow-[#D4AF37]/20 shrink-0"
          >
            <Send className="w-4 h-4 stroke-[2.3]" />
          </button>
        </form>
      </div>
    </div>
  );
};
