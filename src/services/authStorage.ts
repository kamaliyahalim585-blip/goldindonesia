import { UserAccount, Transaction } from '../types';
import { INITIAL_USER, INITIAL_TRANSACTIONS } from '../data/mockData';
import { db, doc, getDoc, setDoc } from '../lib/firebase';

export interface RegisteredAccountRecord {
  email: string;
  password: string;
  name: string;
  phone?: string;
  pin: string;
  userProfile: UserAccount;
  transactions: Transaction[];
  updatedAt: number;
}

const VAULT_STORAGE_KEY = 'indogold_accounts_vault_v1';
const VAULT_STORAGE_KEY_V2 = 'nusantaragold_accounts_vault_v1';

export const encodeDocId = (email: string): string => {
  return email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * Known default accounts for instant access
 */
const DEFAULT_ACCOUNTS: Record<string, RegisteredAccountRecord> = {
  'admin@nusantaragold.id': {
    email: 'admin@nusantaragold.id',
    password: 'admin123456',
    name: 'Admin Super NusantaraGold',
    phone: '+62 811-9988-0000',
    pin: '999999',
    userProfile: {
      ...INITIAL_USER,
      name: 'Admin Super NusantaraGold',
      email: 'admin@nusantaragold.id',
      role: 'admin',
      balanceIdr: 150000000,
      goldHoldingsGram: 100.0,
      isKycVerified: true,
      kycLevel: 'Super Administrator Master',
      biometricEnabled: true,
      pinSet: true,
      pinCode: '999999'
    },
    transactions: INITIAL_TRANSACTIONS,
    updatedAt: Date.now()
  },
  'admin@indogold.id': {
    email: 'admin@indogold.id',
    password: 'admin123456',
    name: 'Admin Super NusantaraGold',
    phone: '+62 811-9988-0000',
    pin: '999999',
    userProfile: {
      ...INITIAL_USER,
      name: 'Admin Super NusantaraGold',
      email: 'admin@indogold.id',
      role: 'admin',
      balanceIdr: 150000000,
      goldHoldingsGram: 100.0,
      isKycVerified: true,
      kycLevel: 'Super Administrator Master',
      biometricEnabled: true,
      pinSet: true,
      pinCode: '999999'
    },
    transactions: INITIAL_TRANSACTIONS,
    updatedAt: Date.now()
  },
  'khoirulanisss@gmail.com': {
    email: 'khoirulanisss@gmail.com',
    password: '', // will accept any password and authenticate as admin
    name: 'Admin Super NusantaraGold',
    phone: '+62 812-3456-7890',
    pin: '123456',
    userProfile: {
      ...INITIAL_USER,
      name: 'Admin Super NusantaraGold',
      email: 'khoirulanisss@gmail.com',
      role: 'admin',
      balanceIdr: 75000000,
      goldHoldingsGram: 50.0,
      isKycVerified: true,
      kycLevel: 'Super Administrator Master',
      biometricEnabled: true,
      pinSet: true,
      pinCode: '123456'
    },
    transactions: INITIAL_TRANSACTIONS,
    updatedAt: Date.now()
  },
  'kamaliyahalim585@gmail.com': {
    email: 'kamaliyahalim585@gmail.com',
    password: '', // will accept any password entered by user and authenticate as admin
    name: 'Kamaliya Halim (Super Admin)',
    phone: '+62 812-3456-7890',
    pin: '123456',
    userProfile: {
      ...INITIAL_USER,
      name: 'Kamaliya Halim (Super Admin)',
      email: 'kamaliyahalim585@gmail.com',
      role: 'admin',
      balanceIdr: 100000000,
      goldHoldingsGram: 100.0,
      isKycVerified: true,
      kycLevel: 'Super Administrator Master',
      biometricEnabled: true,
      pinSet: true,
      pinCode: '123456'
    },
    transactions: INITIAL_TRANSACTIONS,
    updatedAt: Date.now()
  },
  'investor@nusantaragold.id': {
    email: 'investor@nusantaragold.id',
    password: 'nusantaragold2026',
    name: 'Investor VIP NusantaraGold',
    phone: '+62 812-9988-7766',
    pin: '123456',
    userProfile: {
      ...INITIAL_USER,
      name: 'Investor VIP NusantaraGold',
      email: 'investor@nusantaragold.id',
      role: 'user',
      balanceIdr: 5000000,
      goldHoldingsGram: 25.0
    },
    transactions: INITIAL_TRANSACTIONS,
    updatedAt: Date.now()
  },
  'investor@indogold.id': {
    email: 'investor@indogold.id',
    password: 'indogold2026',
    name: 'Investor VIP NusantaraGold',
    phone: '+62 812-9988-7766',
    pin: '123456',
    userProfile: {
      ...INITIAL_USER,
      name: 'Investor VIP NusantaraGold',
      email: 'investor@indogold.id',
      role: 'user',
      balanceIdr: 5000000,
      goldHoldingsGram: 25.0
    },
    transactions: INITIAL_TRANSACTIONS,
    updatedAt: Date.now()
  }
};

/**
 * Get all locally cached registered accounts
 */
export function getRegisteredAccounts(): Record<string, RegisteredAccountRecord> {
  try {
    const rawV2 = localStorage.getItem(VAULT_STORAGE_KEY_V2);
    const rawV1 = localStorage.getItem(VAULT_STORAGE_KEY);
    const parsedV2 = rawV2 ? JSON.parse(rawV2) : {};
    const parsedV1 = rawV1 ? JSON.parse(rawV1) : {};
    return { ...DEFAULT_ACCOUNTS, ...parsedV1, ...parsedV2 };
  } catch (err) {
    console.warn('Failed to parse registered accounts vault:', err);
    return { ...DEFAULT_ACCOUNTS };
  }
}

/**
 * Save account record to Firestore asynchronously
 */
export async function saveAccountRecordToFirestore(record: RegisteredAccountRecord): Promise<void> {
  try {
    const normalizedEmail = record.email.trim().toLowerCase();
    const docId = encodeDocId(normalizedEmail);
    const userRef = doc(db, 'users', docId);

    const safeBal = Number(record.userProfile?.balanceIdr !== undefined ? record.userProfile.balanceIdr : 20000);
    const safeGold = Number(record.userProfile?.goldHoldingsGram !== undefined ? record.userProfile.goldHoldingsGram : 0);

    await setDoc(userRef, {
      id: docId,
      email: normalizedEmail,
      password: record.password,
      name: record.name,
      phone: record.phone || '',
      pin: record.pin,
      pinCode: record.pin,
      balanceIdr: safeBal,
      goldHoldingsGram: safeGold,
      referralCode: record.userProfile?.referralCode || `IG${Math.floor(100000 + Math.random() * 900000)}`,
      referralCount: Number(record.userProfile?.referralCount || 0),
      referralBonus: Number(record.userProfile?.referralBonus || 0),
      referredBy: record.userProfile?.referredBy || '',
      isKycVerified: Boolean(record.userProfile?.isKycVerified ?? false),
      kycStatus: record.userProfile?.kycStatus || 'unverified',
      kycLevel: record.userProfile?.kycLevel || 'Level 1 (Terdaftar)',
      role: record.userProfile?.role || 'user',
      signupBonusReceived: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('saveAccountRecordToFirestore notice:', err);
  }
}

/**
 * Save or update a registered account record (saves to both localStorage keys & Firestore)
 */
export function saveRegisteredAccountRecord(record: RegisteredAccountRecord): void {
  try {
    const vault = getRegisteredAccounts();
    const normalizedEmail = record.email.trim().toLowerCase();
    vault[normalizedEmail] = {
      ...record,
      email: normalizedEmail,
      updatedAt: Date.now()
    };
    const serialized = JSON.stringify(vault);
    localStorage.setItem(VAULT_STORAGE_KEY, serialized);
    localStorage.setItem(VAULT_STORAGE_KEY_V2, serialized);

    // Save to Firestore in background
    saveAccountRecordToFirestore(record).catch(() => {});
  } catch (err) {
    console.warn('Failed to save to accounts vault:', err);
  }
}

/**
 * Find an account by email
 */
export function findRegisteredAccount(email: string): RegisteredAccountRecord | null {
  const vault = getRegisteredAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  return vault[normalizedEmail] || null;
}

/**
 * Auto-provision a new user account seamlessly
 */
export function autoProvisionAccount(
  email: string, 
  password: string, 
  customName?: string
): RegisteredAccountRecord {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Format readable name from email if not provided
  let derivedName = customName;
  if (!derivedName) {
    const userPart = normalizedEmail.split('@')[0].replace(/[0-9_.-]/g, ' ').trim();
    if (userPart.length > 2) {
      derivedName = userPart
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    } else {
      derivedName = 'Investor NusantaraGold';
    }
  }

  const newAccount: RegisteredAccountRecord = {
    email: normalizedEmail,
    password: password,
    name: derivedName || 'Investor NusantaraGold',
    phone: '+62 812-3456-7890',
    pin: '123456',
    userProfile: {
      ...INITIAL_USER,
      name: derivedName || 'Investor NusantaraGold',
      email: normalizedEmail,
      balanceIdr: 2500000,
      goldHoldingsGram: 12.5,
      isKycVerified: true,
      kycLevel: 'Level 2 (Terverifikasi Dukcapil)',
      biometricEnabled: true,
      pinSet: true,
      pinCode: '123456'
    },
    transactions: INITIAL_TRANSACTIONS,
    updatedAt: Date.now()
  };

  saveRegisteredAccountRecord(newAccount);
  return newAccount;
}

/**
 * Create a new Admin account in the vault with full privileges
 */
export function createAdminAccount(
  name: string,
  email: string,
  password: string,
  pin: string = '123456',
  phone: string = '+62 812-8899-0000',
  roleTitle: string = 'Super Administrator'
): RegisteredAccountRecord {
  const normalizedEmail = email.trim().toLowerCase();
  const newAdminAccount: RegisteredAccountRecord = {
    email: normalizedEmail,
    password: password || 'admin123456',
    name: name.trim(),
    phone: phone.trim(),
    pin: pin || '123456',
    userProfile: {
      ...INITIAL_USER,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: 'admin',
      balanceIdr: 100000000, // Rp 100.000.000 platform liquidity for testing
      goldHoldingsGram: 50.0,
      isKycVerified: true,
      kycLevel: roleTitle || 'Super Administrator Master',
      biometricEnabled: true,
      pinSet: true,
      pinCode: pin || '123456',
      referralCode: `ADMIN${Math.floor(1000 + Math.random() * 9000)}`,
      referralBonus: 0,
      referralCount: 0
    },
    transactions: INITIAL_TRANSACTIONS,
    updatedAt: Date.now()
  };

  saveRegisteredAccountRecord(newAdminAccount);
  return newAdminAccount;
}

/**
 * Verify credentials against the vault
 */
export function verifyVaultCredentials(
  email: string, 
  password: string
): { success: boolean; account?: RegisteredAccountRecord; reason?: 'not_found' | 'wrong_password' } {
  const normalizedEmail = email.trim().toLowerCase();
  const account = findRegisteredAccount(normalizedEmail);
  
  if (!account) {
    return { success: false, reason: 'not_found' };
  }
  
  // If account has no password yet (e.g. pre-seeded email), bind to the entered password
  if (!account.password || account.password === password) {
    if (!account.password) {
      account.password = password;
      saveRegisteredAccountRecord(account);
    }
    return { success: true, account };
  }

  return { success: false, reason: 'wrong_password', account };
}

/**
 * Robust async verification checking local storage vault and Firestore database
 */
export async function verifyAccountCredentialsAsync(
  email: string,
  password: string
): Promise<{ success: boolean; account?: RegisteredAccountRecord; reason?: 'not_found' | 'wrong_password' }> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try local cache first
  const localRes = verifyVaultCredentials(normalizedEmail, password);
  if (localRes.success || localRes.reason === 'wrong_password') {
    return localRes;
  }

  // 2. Query Firestore /users/{encodedEmail} in case user registered on another device/browser
  try {
    const docId = encodeDocId(normalizedEmail);
    const snap = await getDoc(doc(db, 'users', docId));
    if (snap.exists()) {
      const data = snap.data();
      const storedPassword = data.password;

      // If password matches or account has no password yet
      if (!storedPassword || storedPassword === password) {
        const safeBal = Number(data.balanceIdr !== undefined ? data.balanceIdr : 20000);
        const safeGold = Number(data.goldHoldingsGram !== undefined ? data.goldHoldingsGram : 0);

        const restoredAccount: RegisteredAccountRecord = {
          email: normalizedEmail,
          password: password,
          name: data.name || 'Investor NusantaraGold',
          phone: data.phone || undefined,
          pin: data.pin || data.pinCode || '123456',
          userProfile: {
            ...INITIAL_USER,
            name: data.name || 'Investor NusantaraGold',
            email: normalizedEmail,
            phone: data.phone || '0812-3456-7890',
            balanceIdr: safeBal,
            goldHoldingsGram: safeGold,
            referralCode: data.referralCode || `IG${Math.floor(100000 + Math.random() * 900000)}`,
            referralCount: Number(data.referralCount || 0),
            referralBonus: Number(data.referralBonus || 0),
            referredBy: data.referredBy,
            isKycVerified: Boolean(data.isKycVerified ?? false),
            kycStatus: data.kycStatus || 'unverified',
            kycLevel: data.kycLevel || 'Level 1 (Terdaftar)',
            biometricEnabled: data.biometricEnabled ?? true,
            signupBonusReceived: true,
            pinSet: true,
            pinCode: data.pin || data.pinCode || '123456',
            role: data.role || 'user'
          },
          transactions: Array.isArray(data.transactions) ? data.transactions : [],
          updatedAt: Date.now()
        };

        // Cache into local storage
        saveRegisteredAccountRecord(restoredAccount);
        return { success: true, account: restoredAccount };
      } else {
        return { success: false, reason: 'wrong_password' };
      }
    }
  } catch (err) {
    console.warn('Firestore verification in verifyAccountCredentialsAsync error:', err);
  }

  return { success: false, reason: 'not_found' };
}
