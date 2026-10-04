import React from 'react';
import { ShieldCheck, Bell } from 'lucide-react';
import nusantaragoldLogo from '../assets/images/nusantaragold_logo_1791089607884.jpg';
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
          <img 
            src={nusantaragoldLogo} 
            alt="Logo NusantaraGold" 
            className="w-10 h-10 rounded-xl object-contain bg-black border border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0" 
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl font-bold tracking-wide text-[#F7F5F2]">NusantaraGold</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-sm">
                LUXE 24K
              </span>
            </div>
            <p className="text-[10px] text-[#A0988C] tracking-tight font-medium">Investasi Emas Murni Fisik & Digital</p>
          </div>
        </div>

        {/* Right actions: Notification Bell & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
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
