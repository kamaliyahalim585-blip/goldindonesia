import React from 'react';
import { X, TrendingUp, ShieldCheck, Gift, Bell } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const notifications = [
    {
      id: 1,
      title: 'Kenaikan Harga Emas Harian',
      desc: 'Harga emas Antam naik +0.84% ke Rp 1.450.000/gr seiring lonjakan emas spot dunia.',
      time: '1 jam lalu',
      icon: TrendingUp,
      unread: true
    },
    {
      id: 2,
      title: 'Bonus Referral Tersedia',
      desc: 'Bagikan kode INDOGOLD99 dan raih Rp 10.000 untuk setiap rekan yang berinvestasi.',
      time: '5 jam lalu',
      icon: Gift,
      unread: true
    },
    {
      id: 3,
      title: 'Verifikasi Keamanan KYC Disetujui',
      desc: 'Akun Anda telah ditingkatkan ke Level 2 dengan batas simpanan tak terbatas.',
      time: '1 hari lalu',
      icon: ShieldCheck,
      unread: false
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#1A1816] border border-[#2E2A26] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#2E2A26] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif text-lg text-[#F7F5F2]">Notifikasi Akun</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2A26] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition ${
                  n.unread
                    ? 'bg-[#26231F] border-[#4A3C13]'
                    : 'bg-[#0F0E0D] border-[#24211E]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#4A3C13]/50 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs text-[#F7F5F2]">{n.title}</h4>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />}
                    </div>
                    <p className="text-[11px] text-[#9E978E] mt-0.5 leading-relaxed">{n.desc}</p>
                    <span className="text-[9px] text-[#D4AF37] block mt-1">{n.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-[#0F0E0D] border-t border-[#2E2A26]">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#26231F] text-xs text-[#EAE6E1] hover:text-[#D4AF37] transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
