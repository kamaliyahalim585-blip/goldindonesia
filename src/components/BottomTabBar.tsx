import React from 'react';
import { Home, PieChart, Clock, User } from 'lucide-react';
import { ScreenTab } from '../types';

interface BottomTabBarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
}

interface TabConfig {
  id: ScreenTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
  dotColor: string;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentTab, onSelectTab }) => {
  const tabs: TabConfig[] = [
    { 
      id: 'beranda', 
      label: 'Beranda', 
      icon: Home, 
      activeColor: 'text-amber-400', 
      activeBg: 'bg-amber-400/15', 
      activeBorder: 'border-amber-400/40',
      dotColor: 'bg-amber-400' 
    },
    { 
      id: 'portofolio', 
      label: 'Portofolio', 
      icon: PieChart, 
      activeColor: 'text-emerald-400', 
      activeBg: 'bg-emerald-400/15', 
      activeBorder: 'border-emerald-400/40',
      dotColor: 'bg-emerald-400' 
    },
    { 
      id: 'riwayat', 
      label: 'Riwayat', 
      icon: Clock, 
      activeColor: 'text-purple-400', 
      activeBg: 'bg-purple-400/15', 
      activeBorder: 'border-purple-400/40',
      dotColor: 'bg-purple-400' 
    },
    { 
      id: 'akun', 
      label: 'Akun', 
      icon: User, 
      activeColor: 'text-rose-400', 
      activeBg: 'bg-rose-400/15', 
      activeBorder: 'border-rose-400/40',
      dotColor: 'bg-rose-400' 
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#12110F]/95 backdrop-blur-2xl border-t border-[#2E2820] pb-safe pt-2 transition-all shadow-[0_-8px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-2xl mx-auto px-2.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[62px] rounded-xl transition-all duration-200 relative cursor-pointer ${
                isActive 
                  ? `${tab.activeBg} ${tab.activeBorder} border shadow-sm` 
                  : 'hover:bg-white/5 text-[#9E978E] hover:text-[#F7F5F2]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? `${tab.activeColor} scale-110` : 'text-[#8E877D]'
                }`} />
                {isActive && (
                  <span className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${tab.dotColor} animate-pulse shadow-[0_0_8px_currentColor]`} />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight transition-colors ${
                isActive ? `${tab.activeColor} font-bold` : 'text-[#8E877D]'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
