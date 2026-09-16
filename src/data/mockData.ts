import { GoldBrand, PaymentMethodItem, PricePoint, HistoricalGoldPricePoint, Transaction, UserAccount } from '../types';

export const APP_IMAGES = {
  auth_hero: 'https://images.unsplash.com/photo-1594970351817-5eb9a5728fa0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjBsdXh1cnklMjB0ZXh0dXJlJTIwYmFja2dyb3VuZCUyMGdvbGQlMjBkdXN0fGVufDB8fHx8MTc4OTI2MzcwNHww&ixlib=rb-4.1.0&q=85',
  profile_banner: 'https://images.unsplash.com/photo-1762463176312-1757d5125c85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYmFyJTIwc3RhY2slMjBwcmVtaXVtfGVufDB8fHx8MTc4OTI2MzcxMXww&ixlib=rb-4.1.0&q=85',
  empty_portfolio: 'https://images.unsplash.com/photo-1762463176312-1757d5125c85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYmFyJTIwc3RhY2slMjBwcmVtaXVtfGVufDB8fHx8MTc4OTI2MzcxMXww&ixlib=rb-4.1.0&q=85'
};

export const INITIAL_USER: UserAccount = {
  name: 'Khoirul Anis',
  email: 'khoirulanisss@gmail.com',
  phone: '+62 812-3456-7890',
  isKycVerified: true,
  kycLevel: 'Level 2 (Terverifikasi KYC)',
  referralCode: 'INDOGOLD99',
  referralBonus: 10000,
  balanceIdr: 25450000,
  goldHoldingsGram: 18.45,
  biometricEnabled: true,
  pinSet: true,
  pinCode: '123456',
  signupBonusReceived: true,
  dailyProfitEarnedTotal: 450000,
  referralCount: 3
};

export const BASE_BUY_PRICE = 1450000;
export const BASE_SELL_PRICE = 1390000;
export const DAILY_CHANGE_IDR = 12000;
export const DAILY_CHANGE_PCT = 0.84;

export const GOLD_BRANDS: GoldBrand[] = [
  {
    id: 'antam',
    code: 'ANTAM',
    initials: 'ATM',
    name: 'ANTAM Logam Mulia',
    company: 'PT Aneka Tambang Tbk',
    purity: '99.99% Fine Gold',
    premiumPerGram: 0,
    description: 'Standar kemurnian internasional LBMA terakreditasi resmi BUMN.'
  },
  {
    id: 'pamp',
    code: 'PAMP',
    initials: 'PMP',
    name: 'PAMP Suisse',
    company: 'MKS PAMP Group Geneva',
    purity: '99.99% Swiss Fine Gold',
    premiumPerGram: 15000,
    description: 'Emas batangan premium dunia bersertifikat Veriscan Swiss.'
  },
  {
    id: 'ubs',
    code: 'UBS',
    initials: 'UBS',
    name: 'UBS Gold',
    company: 'PT Untung Bersama Sejahtera',
    purity: '99.99% Fine Gold',
    premiumPerGram: -5000,
    description: 'Emas murni dengan motif eksklusif karya pengrajin terkemuka Indonesia.'
  },
  {
    id: 'g24',
    code: 'G24',
    initials: 'G24',
    name: 'Galeri 24 Pegadaian',
    company: 'PT Pegadaian Galeri Dua Empat',
    purity: '99.99% Fine Gold',
    premiumPerGram: -2000,
    description: 'Emas batangan resmi anak perusahaan PT Pegadaian (Persero).'
  },
  {
    id: 'lotus',
    code: 'LOTUS',
    initials: 'LTS',
    name: 'Lotus Archi',
    company: 'PT Lotus Archi Nusantara',
    purity: '99.99% Fine Gold',
    premiumPerGram: -3000,
    description: 'Emas investasi modern dengan teknologi barcode keamanan terpadu.'
  },
  {
    id: 'harta',
    code: 'HARTA',
    initials: 'HRT',
    name: 'Hartadinata Gold',
    company: 'PT Hartadinata Abadi Tbk',
    purity: '99.99% Fine Gold',
    premiumPerGram: -4000,
    description: 'Emas batangan inovatif kemasan mikro dan reguler standar SNI.'
  }
];

export const CHART_DATA_BY_PERIOD: Record<string, PricePoint[]> = {
  '1D': [
    { time: '09:00', price: 1438000 },
    { time: '11:00', price: 1441500 },
    { time: '13:00', price: 1439000 },
    { time: '15:00', price: 1446000 },
    { time: '17:00', price: 1448200 },
    { time: '19:00', price: 1447000 },
    { time: '21:00', price: 1450000 }
  ],
  '1W': [
    { time: 'Sen', price: 1425000 },
    { time: 'Sel', price: 1431000 },
    { time: 'Rab', price: 1428000 },
    { time: 'Kam', price: 1439000 },
    { time: 'Jum', price: 1442000 },
    { time: 'Sab', price: 1446000 },
    { time: 'Min', price: 1450000 }
  ],
  '1M': [
    { time: 'Mgg 1', price: 1395000 },
    { time: 'Mgg 2', price: 1412000 },
    { time: 'Mgg 3', price: 1428000 },
    { time: 'Mgg 4', price: 1450000 }
  ],
  '1Y': [
    { time: 'Jan', price: 1145000 },
    { time: 'Mar', price: 1210000 },
    { time: 'Mei', price: 1285000 },
    { time: 'Jul', price: 1340000 },
    { time: 'Sep', price: 1395000 },
    { time: 'Nov', price: 1420000 },
    { time: 'Des', price: 1450000 }
  ],
  'ALL': [
    { time: '2021', price: 925000 },
    { time: '2022', price: 1015000 },
    { time: '2023', price: 1130000 },
    { time: '2024', price: 1320000 },
    { time: '2025', price: 1410000 },
    { time: '2026', price: 1450000 }
  ]
};

export const HISTORICAL_30D_GOLD_DATA: HistoricalGoldPricePoint[] = [
  { date: '15 Agu', fullDate: '15 Agustus 2026', dayNumber: 1, buyPrice: 1408000, sellPrice: 1348000, spread: 60000, dailyChange: 0, dailyChangePct: 0 },
  { date: '16 Agu', fullDate: '16 Agustus 2026', dayNumber: 2, buyPrice: 1406000, sellPrice: 1346000, spread: 60000, dailyChange: -2000, dailyChangePct: -0.14 },
  { date: '17 Agu', fullDate: '17 Agustus 2026', dayNumber: 3, buyPrice: 1410000, sellPrice: 1350000, spread: 60000, dailyChange: 4000, dailyChangePct: 0.28 },
  { date: '18 Agu', fullDate: '18 Agustus 2026', dayNumber: 4, buyPrice: 1412000, sellPrice: 1352000, spread: 60000, dailyChange: 2000, dailyChangePct: 0.14 },
  { date: '19 Agu', fullDate: '19 Agustus 2026', dayNumber: 5, buyPrice: 1415000, sellPrice: 1355000, spread: 60000, dailyChange: 3000, dailyChangePct: 0.21 },
  { date: '20 Agu', fullDate: '20 Agustus 2026', dayNumber: 6, buyPrice: 1414000, sellPrice: 1354000, spread: 60000, dailyChange: -1000, dailyChangePct: -0.07 },
  { date: '21 Agu', fullDate: '21 Agustus 2026', dayNumber: 7, buyPrice: 1418000, sellPrice: 1358000, spread: 60000, dailyChange: 4000, dailyChangePct: 0.28 },
  { date: '22 Agu', fullDate: '22 Agustus 2026', dayNumber: 8, buyPrice: 1421000, sellPrice: 1361000, spread: 60000, dailyChange: 3000, dailyChangePct: 0.21 },
  { date: '23 Agu', fullDate: '23 Agustus 2026', dayNumber: 9, buyPrice: 1420000, sellPrice: 1360000, spread: 60000, dailyChange: -1000, dailyChangePct: -0.07 },
  { date: '24 Agu', fullDate: '24 Agustus 2026', dayNumber: 10, buyPrice: 1424000, sellPrice: 1364000, spread: 60000, dailyChange: 4000, dailyChangePct: 0.28 },
  { date: '25 Agu', fullDate: '25 Agustus 2026', dayNumber: 11, buyPrice: 1422000, sellPrice: 1362000, spread: 60000, dailyChange: -2000, dailyChangePct: -0.14 },
  { date: '26 Agu', fullDate: '26 Agustus 2026', dayNumber: 12, buyPrice: 1427000, sellPrice: 1367000, spread: 60000, dailyChange: 5000, dailyChangePct: 0.35 },
  { date: '27 Agu', fullDate: '27 Agustus 2026', dayNumber: 13, buyPrice: 1430000, sellPrice: 1370000, spread: 60000, dailyChange: 3000, dailyChangePct: 0.21 },
  { date: '28 Agu', fullDate: '28 Agustus 2026', dayNumber: 14, buyPrice: 1428000, sellPrice: 1368000, spread: 60000, dailyChange: -2000, dailyChangePct: -0.14 },
  { date: '29 Agu', fullDate: '29 Agustus 2026', dayNumber: 15, buyPrice: 1433000, sellPrice: 1373000, spread: 60000, dailyChange: 5000, dailyChangePct: 0.35 },
  { date: '30 Agu', fullDate: '30 Agustus 2026', dayNumber: 16, buyPrice: 1435000, sellPrice: 1375000, spread: 60000, dailyChange: 2000, dailyChangePct: 0.14 },
  { date: '31 Agu', fullDate: '31 Agustus 2026', dayNumber: 17, buyPrice: 1432000, sellPrice: 1372000, spread: 60000, dailyChange: -3000, dailyChangePct: -0.21 },
  { date: '01 Sep', fullDate: '01 September 2026', dayNumber: 18, buyPrice: 1436000, sellPrice: 1376000, spread: 60000, dailyChange: 4000, dailyChangePct: 0.28 },
  { date: '02 Sep', fullDate: '02 September 2026', dayNumber: 19, buyPrice: 1439000, sellPrice: 1379000, spread: 60000, dailyChange: 3000, dailyChangePct: 0.21 },
  { date: '03 Sep', fullDate: '03 September 2026', dayNumber: 20, buyPrice: 1437000, sellPrice: 1377000, spread: 60000, dailyChange: -2000, dailyChangePct: -0.14 },
  { date: '04 Sep', fullDate: '04 September 2026', dayNumber: 21, buyPrice: 1441000, sellPrice: 1381000, spread: 60000, dailyChange: 4000, dailyChangePct: 0.28 },
  { date: '05 Sep', fullDate: '05 September 2026', dayNumber: 22, buyPrice: 1444000, sellPrice: 1384000, spread: 60000, dailyChange: 3000, dailyChangePct: 0.21 },
  { date: '06 Sep', fullDate: '06 September 2026', dayNumber: 23, buyPrice: 1442000, sellPrice: 1382000, spread: 60000, dailyChange: -2000, dailyChangePct: -0.14 },
  { date: '07 Sep', fullDate: '07 September 2026', dayNumber: 24, buyPrice: 1446000, sellPrice: 1386000, spread: 60000, dailyChange: 4000, dailyChangePct: 0.28 },
  { date: '08 Sep', fullDate: '08 September 2026', dayNumber: 25, buyPrice: 1448000, sellPrice: 1388000, spread: 60000, dailyChange: 2000, dailyChangePct: 0.14 },
  { date: '09 Sep', fullDate: '09 September 2026', dayNumber: 26, buyPrice: 1447000, sellPrice: 1387000, spread: 60000, dailyChange: -1000, dailyChangePct: -0.07 },
  { date: '10 Sep', fullDate: '10 September 2026', dayNumber: 27, buyPrice: 1452000, sellPrice: 1392000, spread: 60000, dailyChange: 5000, dailyChangePct: 0.35 },
  { date: '11 Sep', fullDate: '11 September 2026', dayNumber: 28, buyPrice: 1454000, sellPrice: 1394000, spread: 60000, dailyChange: 2000, dailyChangePct: 0.14 },
  { date: '12 Sep', fullDate: '12 September 2026', dayNumber: 29, buyPrice: 1449000, sellPrice: 1389000, spread: 60000, dailyChange: -5000, dailyChangePct: -0.34 },
  { date: '13 Sep', fullDate: '13 September 2026', dayNumber: 30, buyPrice: 1450000, sellPrice: 1390000, spread: 60000, dailyChange: 1000, dailyChangePct: 0.07 }
];

export interface OfficialDepositMethod {
  id: string;
  name: string;
  type: 'bank' | 'ewallet';
  accountNumber: string;
  accountName: string;
  logoText: string;
  badge: string;
  color: string;
  instructions: string[];
}

export const OFFICIAL_DEPOSIT_METHODS: OfficialDepositMethod[] = [
  {
    id: 'permata',
    name: 'Bank Permata',
    type: 'bank',
    accountNumber: '009960243614',
    accountName: 'muhammad yusuf amiinuddiin',
    logoText: 'PERMATA',
    badge: 'Rekening Resmi Bank',
    color: '#007A33',
    instructions: [
      'Buka aplikasi PermataME, ATM Permata, atau m-Banking / Internet Banking bank apa saja (BCA, Mandiri, BRI, BNI, dll).',
      'Pilih menu Transfer Antar Bank / Ke Rekening Permata.',
      'Masukkan Kode Bank Permata 013 dan Nomor Rekening: 009960243614',
      'Pastikan nama penerima tertera: muhammad yusuf amiinuddiin.',
      'Masukkan nominal transfer sesuai nominal deposit yang diinginkan.',
      'Simpan bukti transfer dan unggah melalui menu "Kirim Bukti Transfer" untuk konfirmasi instan.'
    ]
  },
  {
    id: 'ovo',
    name: 'OVO Premier',
    type: 'ewallet',
    accountNumber: '087889999393',
    accountName: 'muhammad yusuf amiinuddiin',
    logoText: 'OVO',
    badge: 'Akun Resmi E-Wallet',
    color: '#4C2A86',
    instructions: [
      'Buka aplikasi OVO Anda.',
      'Pilih menu Transfer > Ke Sesama OVO (atau dari e-wallet / m-Banking lain).',
      'Masukkan Nomor Ponsel OVO Tujuan: 087889999393',
      'Pastikan nama penerima muncul: muhammad yusuf amiinuddiin.',
      'Masukkan nominal saldo yang ingin Anda depositkan.',
      'Selesaikan transfer dan unggah struk / screenshot bukti transfer ke menu "Kirim Bukti Transfer".'
    ]
  }
];

export interface FinancialInstitution {
  id: string;
  name: string;
  code: string;
  type: 'bank' | 'ewallet';
  popular?: boolean;
  categoryName: string;
}

export const ALL_INDONESIAN_BANKS: FinancialInstitution[] = [
  { id: 'bca', name: 'Bank Central Asia (BCA)', code: '014', type: 'bank', popular: true, categoryName: 'Bank Swasta Nasional' },
  { id: 'mandiri', name: 'Bank Mandiri', code: '008', type: 'bank', popular: true, categoryName: 'Bank BUMN' },
  { id: 'bri', name: 'Bank Rakyat Indonesia (BRI)', code: '002', type: 'bank', popular: true, categoryName: 'Bank BUMN' },
  { id: 'bni', name: 'Bank Negara Indonesia (BNI)', code: '009', type: 'bank', popular: true, categoryName: 'Bank BUMN' },
  { id: 'bsi', name: 'Bank Syariah Indonesia (BSI)', code: '451', type: 'bank', popular: true, categoryName: 'Bank Syariah BUMN' },
  { id: 'permata', name: 'Bank Permata', code: '013', type: 'bank', popular: true, categoryName: 'Bank Swasta Nasional' },
  { id: 'cimb', name: 'CIMB Niaga', code: '022', type: 'bank', popular: true, categoryName: 'Bank Swasta Nasional' },
  { id: 'btn', name: 'Bank Tabungan Negara (BTN)', code: '200', type: 'bank', popular: true, categoryName: 'Bank BUMN' },
  { id: 'danamon', name: 'Bank Danamon', code: '011', type: 'bank', popular: false, categoryName: 'Bank Swasta Nasional' },
  { id: 'panin', name: 'Bank Panin', code: '019', type: 'bank', popular: false, categoryName: 'Bank Swasta Nasional' },
  { id: 'jago', name: 'Bank Jago', code: '542', type: 'bank', popular: true, categoryName: 'Bank Digital' },
  { id: 'seabank', name: 'SeaBank Indonesia', code: '535', type: 'bank', popular: true, categoryName: 'Bank Digital' },
  { id: 'jenius', name: 'Jenius / BTPN', code: '213', type: 'bank', popular: true, categoryName: 'Bank Digital' },
  { id: 'allo', name: 'Allo Bank', code: '567', type: 'bank', popular: false, categoryName: 'Bank Digital' },
  { id: 'ocbc', name: 'Bank OCBC NISP', code: '028', type: 'bank', popular: false, categoryName: 'Bank Swasta Nasional' },
  { id: 'maybank', name: 'Maybank Indonesia', code: '016', type: 'bank', popular: false, categoryName: 'Bank Swasta Nasional' },
  { id: 'mega', name: 'Bank Mega', code: '426', type: 'bank', popular: false, categoryName: 'Bank Swasta Nasional' },
  { id: 'sinarmas', name: 'Bank Sinarmas', code: '153', type: 'bank', popular: false, categoryName: 'Bank Swasta Nasional' },
  { id: 'muamalat', name: 'Bank Muamalat', code: '147', type: 'bank', popular: false, categoryName: 'Bank Syariah' },
  { id: 'bnc', name: 'Bank Neo Commerce (BNC)', code: '490', type: 'bank', popular: false, categoryName: 'Bank Digital' },
  { id: 'bca_syariah', name: 'BCA Syariah', code: '536', type: 'bank', popular: false, categoryName: 'Bank Syariah' },
  { id: 'bukopin', name: 'KB Bank (Bukopin)', code: '441', type: 'bank', popular: false, categoryName: 'Bank Swasta Nasional' },
  { id: 'bjb', name: 'Bank BJB (Jawa Barat & Banten)', code: '110', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'dki', name: 'Bank DKI Jakarta', code: '111', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'jatim', name: 'Bank Jatim', code: '114', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'jateng', name: 'Bank Jateng', code: '113', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'sumut', name: 'Bank Sumut', code: '117', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'nagari', name: 'Bank Nagari (BPD Sumbar)', code: '118', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'kalbar', name: 'Bank Kalbar', code: '123', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'kaltimtara', name: 'Bank Kaltimtara', code: '124', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'sulselbar', name: 'Bank Sulselbar', code: '126', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'papua', name: 'Bank Papua', code: '132', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' },
  { id: 'aceh_syariah', name: 'Bank Aceh Syariah', code: '116', type: 'bank', popular: false, categoryName: 'Bank Pembangunan Daerah (BPD)' }
];

export const ALL_INDONESIAN_EWALLETS: FinancialInstitution[] = [
  { id: 'gopay', name: 'GoPay (Gojek)', code: 'GOPAY', type: 'ewallet', popular: true, categoryName: 'Dompet Digital Nasional' },
  { id: 'ovo', name: 'OVO (Visionet)', code: 'OVO', type: 'ewallet', popular: true, categoryName: 'Dompet Digital Nasional' },
  { id: 'dana', name: 'DANA Dompet Digital', code: 'DANA', type: 'ewallet', popular: true, categoryName: 'Dompet Digital Nasional' },
  { id: 'shopeepay', name: 'ShopeePay', code: 'SPAY', type: 'ewallet', popular: true, categoryName: 'Dompet Digital Nasional' },
  { id: 'linkaja', name: 'LinkAja (BUMN)', code: 'LINKAJA', type: 'ewallet', popular: true, categoryName: 'Dompet Digital BUMN' },
  { id: 'astrapay', name: 'AstraPay', code: 'ASTRAPAY', type: 'ewallet', popular: false, categoryName: 'Dompet Digital Nasional' },
  { id: 'isaku', name: 'i.saku (Indomaret)', code: 'ISAKU', type: 'ewallet', popular: false, categoryName: 'Dompet Digital Retail' },
  { id: 'doku', name: 'DOKU Wallet', code: 'DOKU', type: 'ewallet', popular: false, categoryName: 'Dompet Digital Nasional' },
  { id: 'sakuku', name: 'Sakuku (BCA)', code: 'SAKUKU', type: 'ewallet', popular: false, categoryName: 'Dompet Digital Bank' }
];

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'permata',
    name: 'Bank Permata (Resmi)',
    type: 'bank',
    accountNumber: '009960243614',
    logoText: 'PERMATA',
    color: '#007A33',
    feeText: 'Penerima: muhammad yusuf amiinuddiin'
  },
  {
    id: 'ovo',
    name: 'OVO Premier (Resmi)',
    type: 'ewallet',
    accountNumber: '087889999393',
    logoText: 'OVO',
    color: '#4C2A86',
    feeText: 'Penerima: muhammad yusuf amiinuddiin'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-94821',
    category: 'beli',
    title: 'Pembelian Emas ANTAM',
    brandCode: 'ANTAM',
    brandName: 'ANTAM Logam Mulia',
    goldGrams: 2.5,
    amountIdr: 3625000,
    pricePerGram: 1450000,
    taxOrFee: 0,
    date: 'Hari ini, 14:20 WIB',
    timestamp: Date.now() - 1000 * 60 * 120,
    status: 'Approved',
    paymentMethod: 'BCA Virtual Account'
  },
  {
    id: 'TRX-94788',
    category: 'deposit',
    title: 'Deposit Saldo Dompet',
    amountIdr: 5000000,
    date: 'Kemarin, 09:15 WIB',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    status: 'Approved',
    paymentMethod: 'Mandiri Virtual Account'
  },
  {
    id: 'TRX-94652',
    category: 'jual',
    title: 'Penjualan Emas UBS',
    brandCode: 'UBS',
    brandName: 'UBS Gold',
    goldGrams: 1.0,
    amountIdr: 1390000,
    pricePerGram: 1390000,
    taxOrFee: 0,
    date: '10 Sep 2026, 16:45 WIB',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    status: 'Approved',
    paymentMethod: 'BCA - Rekening Utama'
  },
  {
    id: 'TRX-94511',
    category: 'tarik',
    title: 'Penarikan Dana ke Rekening',
    amountIdr: 2000000,
    date: '08 Sep 2026, 11:30 WIB',
    timestamp: Date.now() - 1000 * 60 * 60 * 120,
    status: 'Pending',
    paymentMethod: 'BCA •••• 8821'
  },
  {
    id: 'TRX-94302',
    category: 'beli',
    title: 'Pembelian Emas PAMP Suisse',
    brandCode: 'PAMP',
    brandName: 'PAMP Suisse Geneva',
    goldGrams: 5.0,
    amountIdr: 7325000,
    pricePerGram: 1465000,
    taxOrFee: 0,
    date: '02 Sep 2026, 10:12 WIB',
    timestamp: Date.now() - 1000 * 60 * 60 * 260,
    status: 'Approved',
    paymentMethod: 'Saldo Tunai IndoGold'
  },
  {
    id: 'TRX-94109',
    category: 'deposit',
    title: 'Deposit Saldo E-Wallet',
    amountIdr: 500000,
    date: '28 Agu 2026, 19:22 WIB',
    timestamp: Date.now() - 1000 * 60 * 60 * 360,
    status: 'Rejected',
    paymentMethod: 'OVO Premier'
  }
];

export function formatIDR(amount: number): string {
  const formatted = Math.round(amount).toLocaleString('id-ID');
  return `Rp ${formatted}`;
}

export function formatIDRNumberOnly(amount: number): string {
  return Math.round(amount).toLocaleString('id-ID');
}

export function formatGrams(grams: number): string {
  const formatted = Number(grams).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
  return `${formatted} gr`;
}

export function formatGramsNumberOnly(grams: number): string {
  return Number(grams).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

