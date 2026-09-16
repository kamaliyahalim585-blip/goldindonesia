/**
 * IndoGold Design System Tokens
 * Archetype: 6 Glass / Luxe DARK
 * Primary Palette: Deep Charcoal (#0F0E0D) & Antique Gold (#D4AF37)
 */

export const THEME = {
  colors: {
    // Base Canvas & Surfaces
    background: '#0F0E0D',
    surfaceDark: '#12110F',
    surfaceCard: '#1A1816',
    surfaceElevated: '#26231F',
    surfaceGlass: 'rgba(26, 24, 22, 0.85)',
    surfaceGlassLight: 'rgba(38, 35, 31, 0.70)',

    // Borders & Dividers
    borderSubtle: '#2E2820',
    borderMuted: '#24211E',
    borderGold: 'rgba(212, 175, 55, 0.35)',
    borderGoldActive: '#D4AF37',

    // Antique Gold Brand Accents
    gold: {
      primary: '#D4AF37',
      hover: '#F3E5AB',
      muted: '#4A3C13',
      subtle: 'rgba(212, 175, 55, 0.15)',
      glow: 'rgba(212, 175, 55, 0.25)',
    },

    // Semantic Accents (Action Colors)
    semantic: {
      buyGreen: '#10B981',
      buyGreenBg: 'rgba(16, 185, 129, 0.15)',
      sellRose: '#F43F5E',
      sellRoseBg: 'rgba(244, 63, 94, 0.15)',
      depositSky: '#0EA5E9',
      depositSkyBg: 'rgba(14, 165, 233, 0.15)',
      withdrawPurple: '#A855F7',
      withdrawPurpleBg: 'rgba(168, 85, 247, 0.15)',
    },

    // Status Colors
    status: {
      approved: '#10B981',
      pending: '#F59E0B',
      rejected: '#EF4444',
    },

    // Neutral Text Hierarchy
    text: {
      primary: '#F7F5F2',
      secondary: '#EAE6E1',
      muted: '#9E978E',
      caption: '#7A746C',
    },

    // 6 Gold Brand Identifiers & Fallback Tint Tokens
    brandTokens: {
      ANTAM: {
        code: 'ANTAM',
        name: 'ANTAM Logam Mulia',
        initials: 'ATM',
        badgeColor: 'text-amber-300',
        badgeBg: 'bg-amber-950/60 border-amber-500/50',
        ringColor: 'ring-amber-400',
        avatarBg: 'bg-gradient-to-br from-amber-500/30 to-amber-700/20 text-amber-300 border border-amber-400/40',
      },
      PAMP: {
        code: 'PAMP',
        name: 'PAMP Suisse',
        initials: 'PMP',
        badgeColor: 'text-cyan-300',
        badgeBg: 'bg-cyan-950/60 border-cyan-500/50',
        ringColor: 'ring-cyan-400',
        avatarBg: 'bg-gradient-to-br from-cyan-500/30 to-blue-700/20 text-cyan-300 border border-cyan-400/40',
      },
      UBS: {
        code: 'UBS',
        name: 'UBS Gold',
        initials: 'UBS',
        badgeColor: 'text-emerald-300',
        badgeBg: 'bg-emerald-950/60 border-emerald-500/50',
        ringColor: 'ring-emerald-400',
        avatarBg: 'bg-gradient-to-br from-emerald-500/30 to-teal-700/20 text-emerald-300 border border-emerald-400/40',
      },
      G24: {
        code: 'G24',
        name: 'Galeri 24 Pegadaian',
        initials: 'G24',
        badgeColor: 'text-yellow-300',
        badgeBg: 'bg-yellow-950/60 border-yellow-500/50',
        ringColor: 'ring-yellow-400',
        avatarBg: 'bg-gradient-to-br from-yellow-500/30 to-amber-800/20 text-yellow-300 border border-yellow-400/40',
      },
      LOTUS: {
        code: 'LOTUS',
        name: 'Lotus Archi',
        initials: 'LTS',
        badgeColor: 'text-purple-300',
        badgeBg: 'bg-purple-950/60 border-purple-500/50',
        ringColor: 'ring-purple-400',
        avatarBg: 'bg-gradient-to-br from-purple-500/30 to-indigo-700/20 text-purple-300 border border-purple-400/40',
      },
      HARTA: {
        code: 'HARTA',
        name: 'Hartadinata Gold',
        initials: 'HRT',
        badgeColor: 'text-rose-300',
        badgeBg: 'bg-rose-950/60 border-rose-500/50',
        ringColor: 'ring-rose-400',
        avatarBg: 'bg-gradient-to-br from-rose-500/30 to-red-700/20 text-rose-300 border border-rose-400/40',
      },
    },
  },

  // Typography Specifications
  typography: {
    fontDisplay: 'font-serif', // Playfair / Cormorant Garamond style
    fontBody: 'font-sans',     // Satoshi / Inter clean style
    weightHeader: 500,         // Capped strictly at 500 for elegance
    weightData: 500,
  },

  // Bonus Rules Specification
  bonuses: {
    signupBonusIdr: 20000,     // Rp 20,000 signup bonus
    referralBonusIdr: 10000,   // Rp 10,000 per referral
    dailyProfitPercent: 3.0,   // 3% daily profit
  },
} as const;
