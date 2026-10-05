export type ScreenTab = 'beranda' | 'portofolio' | 'riwayat' | 'akun';

export type TradeType = 'beli' | 'jual';

export type WalletActionType = 'deposit' | 'tarik';

export type ActiveFlow = 'beli' | 'jual' | 'deposit' | 'tarik' | null;

export type TransactionStatus = 'Approved' | 'Pending' | 'Rejected';

export type TransactionCategory = 'beli' | 'jual' | 'deposit' | 'tarik';

export interface Transaction {
  id: string;
  category: TransactionCategory;
  title: string;
  userId?: string;
  userEmail?: string;
  brandCode?: string;
  brandName?: string;
  goldGrams?: number;
  amountIdr: number;
  date: string;
  timestamp: number;
  status: TransactionStatus;
  paymentMethod?: string;
  accountNumber?: string;
  recipientName?: string;
  senderName?: string;
  senderAccount?: string;
  proofImage?: string;
  notes?: string;
  pricePerGram?: number;
  taxOrFee?: number;
}

export interface GoldBrand {
  id: string;
  code: string;
  initials: string;
  name: string;
  company: string;
  purity: string;
  premiumPerGram: number; // e.g. 0 for ANTAM base, or minor difference
  description: string;
}

export interface ChartPeriod {
  key: '1D' | '1W' | '1M' | '1Y' | 'ALL';
  label: string;
}

export interface PricePoint {
  time: string;
  price: number;
}

export interface HistoricalGoldPricePoint {
  date: string;
  fullDate: string;
  dayNumber: number;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  dailyChange: number;
  dailyChangePct: number;
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  type: 'ewallet' | 'bank';
  accountNumber: string;
  logoText: string;
  color: string;
  feeText: string;
}

export interface KycData {
  nik: string;
  fullName: string;
  ktpPhoto?: string;
  selfiePhoto?: string;
  address?: string;
  submittedAt?: number;
  rejectionReason?: string;
}

export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface KycVerificationRecord {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  nik: string;
  ktpPhoto: string;
  selfiePhoto: string;
  address?: string;
  status: KycStatus;
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface EmiratesPackage {
  id: 'bronze' | 'gold' | 'platinum';
  name: string;
  tier: 'Bronze' | 'Gold' | 'Platinum';
  priceIdr: number;
  goldBrand: 'Emirates Gold';
  goldGrams: number;
  bonusPercent: number;
  bonusAmountIdr: number;
  badge: string;
  colorScheme: {
    from: string;
    to: string;
    border: string;
    accent: string;
    textAccent: string;
    glow: string;
  };
  features: string[];
  description: string;
}

export interface UserPackage {
  id: string;
  packageId: 'bronze' | 'gold' | 'platinum';
  packageName: string;
  priceIdr: number;
  goldGrams: number;
  bonusPercent: number;
  bonusAmountIdr: number;
  purchasedAt: number;
  status: 'active' | 'completed';
}

export interface UserAccount {
  uid?: string;
  name: string;
  email: string;
  phone: string;
  isKycVerified: boolean;
  kycLevel: string;
  kycStatus?: KycStatus;
  kycData?: KycData;
  referralCode: string;
  referralBonus: number;
  balanceIdr: number;
  goldHoldingsGram: number;
  biometricEnabled: boolean;
  pinSet: boolean;
  pinCode?: string;
  signupBonusReceived?: boolean;
  dailyProfitEarnedTotal?: number;
  lastDailyProfitClaimDate?: string;
  referralCount?: number;
  referredBy?: string;
  role?: 'user' | 'admin';
  activePackages?: UserPackage[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'bot';
  senderName?: string;
  text: string;
  time: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  userGoldHoldings: number;
  userBalanceIdr: number;
  status: 'active' | 'pending' | 'resolved';
  unreadByAdmin: number;
  unreadByUser: number;
  lastUpdated: number;
  messages: ChatMessage[];
}

export interface GoldPriceConfig {
  buyPrice: number;
  sellPrice: number;
  updatedAt: number;
  updatedBy: string;
}
