import { UserAccount, Transaction } from '../types';

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
 * Get all locally cached registered accounts
 */
export function getRegisteredAccounts(): Record<string, RegisteredAccountRecord> {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse registered accounts vault:', err);
    return {};
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
 * Verify credentials against the vault
 */
export function verifyVaultCredentials(
  email: string, 
  password: string
): { success: boolean; account?: RegisteredAccountRecord; reason?: 'not_found' | 'wrong_password' } {
  const account = findRegisteredAccount(email);
  if (!account) {
    return { success: false, reason: 'not_found' };
  }
  if (account.password !== password) {
    return { success: false, reason: 'wrong_password' };
  }
  return { success: true, account };
}
