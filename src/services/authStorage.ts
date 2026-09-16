import { UserAccount, Transaction } from '../types';
import { INITIAL_USER, INITIAL_TRANSACTIONS } from '../data/mockData';

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

/**
 * Known default accounts for instant access
 */
const DEFAULT_ACCOUNTS: Record<string, RegisteredAccountRecord> = {
  'kamaliyahalim585@gmail.com': {
    email: 'kamaliyahalim585@gmail.com',
    password: '', // will accept any password entered by user and save it
    name: 'Kamaliya Halim',
    phone: '+62 812-3456-7890',
    pin: '123456',
    userProfile: {
      ...INITIAL_USER,
      name: 'Kamaliya Halim',
      email: 'kamaliyahalim585@gmail.com',
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
  },
  'investor@indogold.id': {
    email: 'investor@indogold.id',
    password: 'indogold2026',
    name: 'Investor VIP IndoGold',
    phone: '+62 812-9988-7766',
    pin: '123456',
    userProfile: {
      ...INITIAL_USER,
      name: 'Investor VIP IndoGold',
      email: 'investor@indogold.id',
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
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_ACCOUNTS, ...parsed };
  } catch (err) {
    console.warn('Failed to parse registered accounts vault:', err);
    return { ...DEFAULT_ACCOUNTS };
  }
}

/**
 * Save or update a registered account record
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
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault));
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
      derivedName = 'Investor IndoGold';
    }
  }

  const newAccount: RegisteredAccountRecord = {
    email: normalizedEmail,
    password: password,
    name: derivedName || 'Investor IndoGold',
    phone: '+62 812-3456-7890',
    pin: '123456',
    userProfile: {
      ...INITIAL_USER,
      name: derivedName || 'Investor IndoGold',
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
