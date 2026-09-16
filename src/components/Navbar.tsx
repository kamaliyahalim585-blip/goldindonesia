import React from 'react';
import { ShieldCheck, Bell, Sparkles } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  user: UserAccount;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenNotifications
}) => {
  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      onOpenAuth();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F0E0D]/85 backdrop-blur-xl border-b border-[#2E2820] transition-all">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleProfileClick}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-300 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.35)]">
            <span className="font-serif font-black text-lg text-slate-950 leading-none">IG</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-wide text-[#F7F5F2]">IndoGold</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-sm">
                LUXE 24K
              </span>
            </div>
            <p className="text-[10px] text-[#A0988C] tracking-tight font-medium">Investasi Emas Murni Fisik & Digital</p>
          </div>
        </div>

        {/* Right actions: KYC badge & Notification Bell */}
        <div className="flex items-center gap-2.5">
          {user.isKycVerified && (
            <div 
              onClick={handleProfileClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border-2 border-emerald-400/80 text-[11px] font-bold text-emerald-300 cursor-pointer shadow-sm shadow-emerald-950/50 hover:scale-105 transition-all"
              title="Status: Terverifikasi KYC Tingkat 2"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
              <span>KYC Terverifikasi</span>
            </div>
          )}

          <button
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-xl bg-[#1A1816] border border-[#2E2820] flex items-center justify-center text-[#EAE6E1] hover:text-amber-400 hover:border-amber-400/60 transition relative shadow-sm cursor-pointer"
            title="Notifikasi"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4 stroke-[2.2]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
          </button>

          <button
            onClick={handleProfileClick}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 hover:border-amber-300 transition text-xs font-serif font-bold shadow-sm cursor-pointer"
            title="Profil & Akun Pengguna"
          >
            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </button>
        </div>
      </div>
    </header>
  );
};
