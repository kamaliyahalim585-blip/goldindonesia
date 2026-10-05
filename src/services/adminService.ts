import { Transaction, UserAccount, ChatMessage, ChatSession, GoldPriceConfig, KycVerificationRecord } from '../types';
import { 
  getRegisteredAccounts, 
  saveRegisteredAccountRecord, 
  findRegisteredAccount, 
  RegisteredAccountRecord 
} from './authStorage';
import { BASE_BUY_PRICE, BASE_SELL_PRICE, INITIAL_KYC_VERIFICATIONS } from '../data/mockData';
import {
  subscribeToAllPlatformTransactions,
  fetchAllPlatformTransactionsFromFirestore,
  subscribeToPendingTransactions,
  PendingAggregation,
  updateTransactionStatusInFirestore,
  subscribeToAllChatSessions,
  subscribeToUserChatSession,
  sendChatMessageToFirestore,
  markChatReadInFirestore,
  subscribeToAllUsers,
  adminAdjustUserPortfolioInFirestore,
  adminUpdateUserKycInFirestore,
  adminResetUserPinInFirestore,
  subscribeToGoldPriceConfig,
  setGoldPriceConfigInFirestore,
  saveTransaction,
  saveUserProfile,
  encodeChatId,
  extractCleanEmail
} from './databaseService';

export const INDOGOLD_SYNC_EVENT = 'indogold_platform_sync';

/**
 * Broadcast sync event to all local active components and tabs
 */
export function broadcastPlatformSync(detail?: any): void {
  try {
    const payload = {
      timestamp: Date.now(),
      ...detail
    };
    localStorage.setItem('indogold_sync_trigger', JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent(INDOGOLD_SYNC_EVENT, { detail: payload }));
  } catch (_) {}
}

// Re-export real-time subscriptions for easy consumption
export {
  subscribeToAllPlatformTransactions as subscribeToPlatformTransactions,
  fetchAllPlatformTransactionsFromFirestore as fetchPlatformTransactionsFromFirestore,
  subscribeToPendingTransactions,
  subscribeToAllChatSessions as subscribeToChatSessions,
  subscribeToUserChatSession,
  subscribeToAllUsers as subscribeToUsersList,
  subscribeToGoldPriceConfig as subscribeToGoldPrice
};
export type { PendingAggregation };

const ALL_TXS_STORAGE_KEY = 'indogold_platform_master_txs_v1';
const CHAT_SESSIONS_STORAGE_KEY = 'indogold_chat_sessions_v1';
const GOLD_PRICE_STORAGE_KEY = 'indogold_gold_price_config_v1';
const KYC_VERIFICATIONS_STORAGE_KEY = 'indogold_kyc_verifications_v1';

/**
 * Check if a user has Admin role or super-admin privileges
 */
export function isUserAdmin(user?: UserAccount | null): boolean {
  if (!user || !user.email) return false;
  const email = user.email.trim().toLowerCase();
  return (
    user.role === 'admin' ||
    email === 'admin@nusantaragold.id' ||
    email === 'admin@indogold.id' ||
    email === 'khoirulanisss@gmail.com' ||
    email === 'kamaliyahalim585@gmail.com'
  );
}

/**
 * Get pending metrics for badges in Navbar and AccountScreen
 */
export function getAdminBadgeCounts(): {
  pendingWithdrawals: number;
  pendingDeposits: number;
  unreadChats: number;
  totalPending: number;
} {
  const txs = getAllPlatformTransactions();
  const sessions = getAllChatSessions();

  const pendingWithdrawals = txs.filter((t) => t.category === 'tarik' && t.status === 'Pending').length;
  const pendingDeposits = txs.filter((t) => t.category === 'deposit' && t.status === 'Pending').length;
  const unreadChats = Object.values(sessions).reduce((sum, s) => sum + (s.unreadByAdmin || 0), 0);

  return {
    pendingWithdrawals,
    pendingDeposits,
    unreadChats,
    totalPending: pendingWithdrawals + pendingDeposits + unreadChats
  };
}

/**
 * Seed initial sample pending transactions for the Admin Control Desk
 */
const INITIAL_ADMIN_TRANSACTIONS: Transaction[] = [
  {
    id: 'WD-78219',
    category: 'tarik',
    title: 'Penarikan Saldo ke Bank Central Asia (BCA)',
    amountIdr: 2500000,
    date: 'Hari ini, 10:45 WIB',
    timestamp: Date.now() - 3600000 * 2,
    status: 'Pending',
    paymentMethod: 'Bank Central Asia (BCA) • 8271 9928 11',
    recipientName: 'Kamaliya Halim',
    senderAccount: 'kamaliyahalim585@gmail.com',
    taxOrFee: 0,
    notes: 'Pencairan saldo kas hasil penjualan emas 24K via BI-FAST.'
  },
  {
    id: 'DEP-49102',
    category: 'deposit',
    title: 'Deposit Saldo Tunai Transfer Manual Permata',
    amountIdr: 5000000,
    date: 'Hari ini, 11:15 WIB',
    timestamp: Date.now() - 3600000 * 1.5,
    status: 'Pending',
    paymentMethod: 'Bank Permata Virtual/Manual • 8271 0812 3456',
    senderName: 'Budi Santoso',
    senderAccount: 'investor@indogold.id',
    proofImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    taxOrFee: 0,
    notes: 'Transfer ATM Bank Permata ref: TRX992818. Menunggu verifikasi mutasi bank oleh admin.'
  },
  {
    id: 'WD-31908',
    category: 'tarik',
    title: 'Penarikan Saldo ke E-Wallet DANA',
    amountIdr: 750000,
    date: 'Kemarin, 16:30 WIB',
    timestamp: Date.now() - 3600000 * 24,
    status: 'Approved',
    paymentMethod: 'DANA • 0812-9988-7766',
    recipientName: 'Investor VIP NusantaraGold',
    senderAccount: 'investor@indogold.id',
    taxOrFee: 0,
    notes: 'Pencairan berhasil ditransfer melalui sistem BI-FAST otomatis.'
  }
];

/**
 * Get all platform master transactions
 */
export function getAllPlatformTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(ALL_TXS_STORAGE_KEY);
    let txs: Transaction[] = raw ? JSON.parse(raw) : [];
    
    // If empty, initialize with default seed transactions
    if (txs.length === 0) {
      txs = [...INITIAL_ADMIN_TRANSACTIONS];
      localStorage.setItem(ALL_TXS_STORAGE_KEY, JSON.stringify(txs));
    }

    // Also merge transactions from all vault accounts
    const vault = getRegisteredAccounts();
    const existingIds = new Set(txs.map((t) => t.id));

    Object.values(vault).forEach((acc) => {
      if (acc.transactions && Array.isArray(acc.transactions)) {
        acc.transactions.forEach((t) => {
          if (!existingIds.has(t.id)) {
            existingIds.add(t.id);
            txs.push({
              ...t,
              senderAccount: t.senderAccount || acc.email
            });
          }
        });
      }
    });

    // Sort descending by timestamp
    return txs.sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.warn('Failed to load platform transactions:', err);
    return INITIAL_ADMIN_TRANSACTIONS;
  }
}

/**
 * Save master transactions ledger
 */
export function saveMasterTransactions(txs: Transaction[]): void {
  try {
    localStorage.setItem(ALL_TXS_STORAGE_KEY, JSON.stringify(txs));
  } catch (err) {
    console.warn('Failed to save master transactions:', err);
  }
}

/**
 * Merge Firestore transactions with local transactions and persist to master store
 */
export function syncFirestoreTransactionsToLocal(firestoreTxs: Transaction[]): Transaction[] {
  try {
    const local = getAllPlatformTransactions();
    const txMap = new Map<string, Transaction>();

    // Start with local transactions
    for (const t of local) {
      if (t && t.id) {
        txMap.set(t.id, t);
      }
    }

    // Overlay/insert live Firestore transactions (Firestore is authoritative for live server activity)
    for (const fsTx of firestoreTxs) {
      if (!fsTx || !fsTx.id) continue;
      const existing = txMap.get(fsTx.id);
      if (existing) {
        txMap.set(fsTx.id, {
          ...existing,
          ...fsTx,
          status: fsTx.status || existing.status,
          notes: fsTx.notes || existing.notes,
          proofImage: fsTx.proofImage || existing.proofImage,
          senderAccount: fsTx.senderAccount || existing.senderAccount,
          senderName: fsTx.senderName || existing.senderName
        });
      } else {
        txMap.set(fsTx.id, fsTx);
      }
    }

    const merged = Array.from(txMap.values()).sort(
      (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
    );

    saveMasterTransactions(merged);
    return merged;
  } catch (err) {
    console.warn('syncFirestoreTransactionsToLocal error:', err);
    return firestoreTxs;
  }
}

/**
 * Register a transaction to the platform ledger and sync to Firestore
 */
export function recordPlatformTransaction(tx: Transaction, userEmail?: string): void {
  try {
    const txs = getAllPlatformTransactions();
    const enrichedTx: Transaction = {
      ...tx,
      senderAccount: tx.senderAccount || userEmail
    };
    const updated = [enrichedTx, ...txs.filter((t) => t.id !== tx.id)];
    saveMasterTransactions(updated);

    // CRITICAL: Push directly to Firestore so the admin control panel receives it immediately!
    const effectiveUid = userEmail 
      ? userEmail.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')
      : (tx.id ? `usr_${tx.id}` : 'investor_user');

    saveTransaction(effectiveUid, enrichedTx, userEmail, enrichedTx.senderName).catch((err) => {
      console.warn('recordPlatformTransaction Firestore sync notice:', err);
    });
  } catch (err) {
    console.warn('Failed to record platform transaction:', err);
  }
}

/**
 * ADMIN ACTION: Approve a withdrawal request
 */
export async function approveWithdrawal(
  txId: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string; updatedTx?: Transaction }> {
  const txs = getAllPlatformTransactions();
  const txIndex = txs.findIndex((t) => t.id === txId);
  const tx = txIndex !== -1 ? txs[txIndex] : undefined;
  const cleanEmail = extractCleanEmail(tx?.userEmail || tx?.senderAccount || tx?.notes);

  // 1. Sync to Firestore in real-time
  try {
    await updateTransactionStatusInFirestore(
      txId, 
      'Approved', 
      adminNotes, 
      cleanEmail, 
      tx?.amountIdr, 
      'tarik'
    );
  } catch (err) {
    console.warn('Firestore approve withdrawal error:', err);
  }

  if (tx && tx.status === 'Approved') {
    return { success: false, message: 'Transaksi ini sudah disetujui sebelumnya.' };
  }

  const updatedTx: Transaction = {
    ...(tx || {
      id: txId,
      category: 'tarik',
      title: 'Penarikan Dana',
      amountIdr: 0,
      date: 'Hari ini',
      timestamp: Date.now(),
      status: 'Pending',
      paymentMethod: 'Transfer Bank'
    }),
    status: 'Approved',
    userEmail: cleanEmail || tx?.userEmail,
    notes: adminNotes 
      ? `${tx?.notes || ''} [Disetujui Admin: ${adminNotes}]`.trim()
      : `${tx?.notes || ''} [Disetujui Admin via BI-FAST Otomatis]`.trim()
  };

  if (txIndex !== -1) {
    txs[txIndex] = updatedTx;
  } else {
    txs.unshift(updatedTx);
  }
  saveMasterTransactions(txs);

  // Update in user account vault if associated
  if (cleanEmail) {
    const userAcc = findRegisteredAccount(cleanEmail);
    if (userAcc) {
      const userTxs = (userAcc.transactions || []).map((t) => (t.id === txId ? updatedTx : t));
      saveRegisteredAccountRecord({
        ...userAcc,
        transactions: userTxs
      });
    }
  }

  broadcastPlatformSync({
    type: 'withdrawal_approved',
    txId,
    email: cleanEmail
  });

  return { 
    success: true, 
    message: `Penarikan ID #${txId} sebesar Rp ${(tx?.amountIdr || 0).toLocaleString('id-ID')} berhasil disetujui & ditransfer!`,
    updatedTx 
  };
}

/**
 * ADMIN ACTION: Reject a withdrawal request and REFUND the balance to the user
 */
export async function rejectWithdrawal(
  txId: string,
  reason: string
): Promise<{ success: boolean; message: string; updatedTx?: Transaction }> {
  const txs = getAllPlatformTransactions();
  const txIndex = txs.findIndex((t) => t.id === txId);
  const tx = txIndex !== -1 ? txs[txIndex] : undefined;
  const cleanEmail = extractCleanEmail(tx?.userEmail || tx?.senderAccount || tx?.notes);

  // 1. Sync to Firestore in real-time (refunds user's balance in Firestore)
  try {
    await updateTransactionStatusInFirestore(
      txId, 
      'Rejected', 
      reason, 
      cleanEmail, 
      tx?.amountIdr, 
      'tarik'
    );
  } catch (err) {
    console.warn('Firestore reject withdrawal error:', err);
  }

  if (tx && tx.status === 'Rejected') {
    return { success: false, message: 'Transaksi ini sudah ditolak sebelumnya.' };
  }

  const updatedTx: Transaction = {
    ...(tx || {
      id: txId,
      category: 'tarik',
      title: 'Penarikan Dana',
      amountIdr: 0,
      date: 'Hari ini',
      timestamp: Date.now(),
      status: 'Pending',
      paymentMethod: 'Transfer Bank'
    }),
    status: 'Rejected',
    userEmail: cleanEmail || tx?.userEmail,
    notes: `Ditolak Admin: ${reason || 'Data rekening tidak sesuai dengan KTP'}`
  };

  if (txIndex !== -1) {
    txs[txIndex] = updatedTx;
  } else {
    txs.unshift(updatedTx);
  }
  saveMasterTransactions(txs);

  // Refund the amount to the user's account in the local vault as well
  if (cleanEmail && tx) {
    const userAcc = findRegisteredAccount(cleanEmail);
    if (userAcc) {
      const refundedBalance = userAcc.userProfile.balanceIdr + tx.amountIdr;
      const userTxs = (userAcc.transactions || []).map((t) => (t.id === txId ? updatedTx : t));
      
      const refundNoticeTx: Transaction = {
        id: `REFUND-${Math.floor(10000 + Math.random() * 90000)}`,
        category: 'deposit',
        title: `Pengembalian Saldo (Penarikan Ditolak: ${reason})`,
        amountIdr: tx.amountIdr,
        date: 'Hari ini, Baru saja',
        timestamp: Date.now(),
        status: 'Approved',
        userEmail: cleanEmail,
        paymentMethod: 'Refund Saldo Kas NusantaraGold',
        notes: `Dana dikembalikan utuh ke saldo kas Anda karena penarikan #${txId} ditolak.`
      };

      saveRegisteredAccountRecord({
        ...userAcc,
        userProfile: {
          ...userAcc.userProfile,
          balanceIdr: refundedBalance
        },
        transactions: [refundNoticeTx, ...userTxs]
      });
    }
  }

  broadcastPlatformSync({
    type: 'withdrawal_rejected',
    txId,
    email: cleanEmail
  });

  return {
    success: true,
    message: `Penarikan ID #${txId} berhasil ditolak. Dana Rp ${(tx?.amountIdr || 0).toLocaleString('id-ID')} telah dikembalikan utuh ke saldo kas pengguna.`,
    updatedTx
  };
}

/**
 * ADMIN ACTION: Approve a deposit request and CREDIT the balance to the user
 */
export async function approveDeposit(
  txId: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string; updatedTx?: Transaction }> {
  const txs = getAllPlatformTransactions();
  const txIndex = txs.findIndex((t) => t.id === txId);
  const tx = txIndex !== -1 ? txs[txIndex] : undefined;
  const cleanEmail = extractCleanEmail(tx?.userEmail || tx?.senderAccount || tx?.notes);

  // 1. Sync to Firestore in real-time (credits user's balance in Firestore)
  try {
    await updateTransactionStatusInFirestore(
      txId, 
      'Approved', 
      adminNotes, 
      cleanEmail, 
      tx?.amountIdr, 
      'deposit'
    );
  } catch (err) {
    console.warn('Firestore approve deposit error:', err);
  }

  if (tx && tx.status === 'Approved') {
    return { success: false, message: 'Deposit ini sudah disetujui sebelumnya.' };
  }

  const updatedTx: Transaction = {
    ...(tx || {
      id: txId,
      category: 'deposit',
      title: 'Deposit Saldo',
      amountIdr: 0,
      date: 'Hari ini',
      timestamp: Date.now(),
      status: 'Pending',
      paymentMethod: 'Transfer Bank'
    }),
    status: 'Approved',
    userEmail: cleanEmail || tx?.userEmail,
    notes: adminNotes 
      ? `${tx?.notes || ''} [Diverifikasi Admin: ${adminNotes}]`.trim()
      : `${tx?.notes || ''} [Mutasi Bank Diverifikasi & Saldo Diterima]`.trim()
  };

  if (txIndex !== -1) {
    txs[txIndex] = updatedTx;
  } else {
    txs.unshift(updatedTx);
  }
  saveMasterTransactions(txs);

  // Credit the amount to the user account locally
  if (cleanEmail && tx) {
    const userAcc = findRegisteredAccount(cleanEmail);
    if (userAcc) {
      const newBalance = userAcc.userProfile.balanceIdr + tx.amountIdr;
      const userTxs = (userAcc.transactions || []).map((t) => (t.id === txId ? updatedTx : t));
      saveRegisteredAccountRecord({
        ...userAcc,
        userProfile: {
          ...userAcc.userProfile,
          balanceIdr: newBalance
        },
        transactions: userTxs
      });

      // Bonus 3% untuk pengundang jika deposit minimal Rp 500.000
      if (tx.amountIdr >= 500000 && userAcc.userProfile.referredBy) {
        const refCode = userAcc.userProfile.referredBy.trim().toUpperCase();
        const allAccounts = getRegisteredAccounts();
        for (const [referrerEmail, referrerRecord] of Object.entries(allAccounts)) {
          if (referrerRecord.userProfile.referralCode?.toUpperCase() === refCode) {
            const bonus3Pct = Math.round(tx.amountIdr * 0.03);
            const refNewBalance = referrerRecord.userProfile.balanceIdr + bonus3Pct;
            const refTotalBonus = (referrerRecord.userProfile.referralBonus || 0) + bonus3Pct;

            const referralBonusTx: Transaction = {
              id: `REF-BONUS-${Math.floor(10000 + Math.random() * 90000)}`,
              category: 'deposit',
              title: `Komisi Referral 3% (Deposit ${userAcc.userProfile.name})`,
              amountIdr: bonus3Pct,
              date: 'Hari ini, Baru saja',
              timestamp: Date.now(),
              status: 'Approved',
              paymentMethod: 'Komisi Referral 3% Platform',
              notes: `Bonus komisi 3% dari deposit teman (${userAcc.userProfile.name}) sebesar Rp ${tx.amountIdr.toLocaleString('id-ID')}`
            };

            saveRegisteredAccountRecord({
              ...referrerRecord,
              userProfile: {
                ...referrerRecord.userProfile,
                balanceIdr: refNewBalance,
                referralBonus: refTotalBonus
              },
              transactions: [referralBonusTx, ...(referrerRecord.transactions || [])],
              updatedAt: Date.now()
            });

            // Catat di mutasi master transaksi
            recordPlatformTransaction(referralBonusTx, referrerEmail);

            // Sinkronkan ke Firestore pengundang
            const referrerUid = encodeChatId(referrerEmail);
            saveTransaction(referrerUid, referralBonusTx, referrerEmail, referrerRecord.userProfile.name).catch(() => {});
            saveUserProfile(referrerUid, {
              ...referrerRecord.userProfile,
              balanceIdr: refNewBalance,
              referralBonus: refTotalBonus
            }).catch(() => {});

            broadcastPlatformSync({
              type: 'deposit_approved',
              txId: referralBonusTx.id,
              email: referrerEmail,
              amount: bonus3Pct
            });
            break;
          }
        }
      }
    }
  }

  broadcastPlatformSync({
    type: 'deposit_approved',
    txId,
    email: cleanEmail,
    amount: tx?.amountIdr
  });

  return {
    success: true,
    message: `Deposit ID #${txId} sebesar Rp ${(tx?.amountIdr || 0).toLocaleString('id-ID')} berhasil diverifikasi! Saldo otomatis masuk ke akun pengguna.`,
    updatedTx
  };
}

/**
 * ADMIN ACTION: Reject a deposit request
 */
export async function rejectDeposit(
  txId: string,
  reason: string
): Promise<{ success: boolean; message: string; updatedTx?: Transaction }> {
  const txs = getAllPlatformTransactions();
  const txIndex = txs.findIndex((t) => t.id === txId);
  const tx = txIndex !== -1 ? txs[txIndex] : undefined;
  const cleanEmail = extractCleanEmail(tx?.userEmail || tx?.senderAccount || tx?.notes);

  // 1. Sync to Firestore in real-time
  try {
    await updateTransactionStatusInFirestore(
      txId, 
      'Rejected', 
      reason, 
      cleanEmail, 
      tx?.amountIdr, 
      'deposit'
    );
  } catch (err) {
    console.warn('Firestore reject deposit error:', err);
  }

  const updatedTx: Transaction = {
    ...(tx || {
      id: txId,
      category: 'deposit',
      title: 'Deposit Saldo',
      amountIdr: 0,
      date: 'Hari ini',
      timestamp: Date.now(),
      status: 'Pending',
      paymentMethod: 'Transfer Bank'
    }),
    status: 'Rejected',
    userEmail: cleanEmail || tx?.userEmail,
    notes: `Deposit Ditolak Admin: ${reason || 'Bukti transfer tidak valid atau dana belum masuk mutasi bank'}`
  };

  if (txIndex !== -1) {
    txs[txIndex] = updatedTx;
  } else {
    txs.unshift(updatedTx);
  }
  saveMasterTransactions(txs);

  if (cleanEmail) {
    const userAcc = findRegisteredAccount(cleanEmail);
    if (userAcc) {
      const userTxs = (userAcc.transactions || []).map((t) => (t.id === txId ? updatedTx : t));
      saveRegisteredAccountRecord({
        ...userAcc,
        transactions: userTxs
      });
    }
  }

  broadcastPlatformSync({
    type: 'deposit_rejected',
    txId,
    email: cleanEmail
  });

  return {
    success: true,
    message: `Deposit ID #${txId} ditolak.`,
    updatedTx
  };
}

/**
 * ADMIN ACTION: Adjust user balance or gold manually
 */
export async function manualAdjustUserPortfolio(
  targetEmail: string,
  amountIdrAdjustment: number,
  goldGramsAdjustment: number,
  notes: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = targetEmail.trim().toLowerCase();

  // 1. Sync to Firestore in real-time
  try {
    await adminAdjustUserPortfolioInFirestore(
      normalizedEmail, 
      amountIdrAdjustment, 
      goldGramsAdjustment, 
      notes
    );
  } catch (err) {
    console.warn('Firestore manual adjust portfolio error:', err);
  }

  // 2. Sync to local account record
  const userAcc = findRegisteredAccount(normalizedEmail);
  if (userAcc) {
    const newBalance = Math.max(0, userAcc.userProfile.balanceIdr + amountIdrAdjustment);
    const newGold = Math.max(0, userAcc.userProfile.goldHoldingsGram + goldGramsAdjustment);

    const auditTx: Transaction = {
      id: `ADJ-${Math.floor(10000 + Math.random() * 90000)}`,
      category: amountIdrAdjustment >= 0 ? 'deposit' : 'tarik',
      title: `Penyesuaian Manual Admin (${notes || 'Koreksi/Kompensasi Saldo'})`,
      amountIdr: Math.abs(amountIdrAdjustment),
      goldGrams: Math.abs(goldGramsAdjustment),
      date: 'Hari ini, Baru saja',
      timestamp: Date.now(),
      status: 'Approved',
      paymentMethod: 'NusantaraGold Treasury Admin Desk',
      senderAccount: normalizedEmail,
      notes: `Penyesuaian oleh Admin NusantaraGold: IDR ${amountIdrAdjustment >= 0 ? '+' : ''}${amountIdrAdjustment.toLocaleString('id-ID')}, Emas ${goldGramsAdjustment >= 0 ? '+' : ''}${goldGramsAdjustment.toFixed(4)} gr. Keterangan: ${notes}`
    };

    saveRegisteredAccountRecord({
      ...userAcc,
      userProfile: {
        ...userAcc.userProfile,
        balanceIdr: newBalance,
        goldHoldingsGram: newGold
      },
      transactions: [auditTx, ...(userAcc.transactions || [])]
    });

    recordPlatformTransaction(auditTx, normalizedEmail);

    broadcastPlatformSync({
      type: 'portfolio_adjusted',
      email: normalizedEmail
    });

    return {
      success: true,
      message: `Portofolio ${userAcc.name} berhasil diperbarui! Saldo Kas: Rp ${newBalance.toLocaleString('id-ID')}, Emas: ${newGold.toFixed(4)} gr.`
    };
  }

  broadcastPlatformSync({
    type: 'portfolio_adjusted',
    email: normalizedEmail
  });

  return {
    success: true,
    message: `Portofolio ${targetEmail} berhasil diperbarui di server cloud.`
  };
}

/**
 * MASTER SYNCHRONIZATION: Synchronize ALL activities, transactions, and balances
 * across the application, Firestore, local vault, and active tabs.
 */
export async function reconcileAllPlatformActivities(): Promise<{
  syncedTxs: number;
  reconciledUsers: number;
  message: string;
}> {
  try {
    // 1. Fetch all transactions from Firestore
    const remoteTxs = await fetchAllPlatformTransactionsFromFirestore();
    const localTxs = getAllPlatformTransactions();

    const txMap = new Map<string, Transaction>();
    localTxs.forEach((t) => txMap.set(t.id, t));
    remoteTxs.forEach((t) => {
      const existing = txMap.get(t.id);
      txMap.set(t.id, { ...existing, ...t });
    });

    const mergedTxs = Array.from(txMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    saveMasterTransactions(mergedTxs);

    // 2. Reconcile with local accounts vault
    const vault = getRegisteredAccounts();
    let reconciledUsersCount = 0;

    Object.keys(vault).forEach((userEmail) => {
      const acc = vault[userEmail];
      if (!acc) return;

      const userEmailClean = extractCleanEmail(userEmail);
      if (!userEmailClean) return;

      const userTxs = mergedTxs.filter((t) => {
        const txEmail = extractCleanEmail(t.userEmail || t.senderAccount || t.notes);
        return txEmail === userEmailClean;
      });

      if (userTxs.length > 0) {
        // Merge into account transactions
        const existingTxMap = new Map<string, Transaction>();
        (acc.transactions || []).forEach((t) => existingTxMap.set(t.id, t));
        userTxs.forEach((t) => {
          const ex = existingTxMap.get(t.id);
          existingTxMap.set(t.id, { ...ex, ...t });
        });

        const updatedUserTxs = Array.from(existingTxMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Re-calculate or preserve verified balances
        saveRegisteredAccountRecord({
          ...acc,
          transactions: updatedUserTxs
        });
        reconciledUsersCount++;
      }
    });

    // 3. Broadcast sync so all client views immediately refresh
    broadcastPlatformSync({ type: 'reconcile_all', count: mergedTxs.length });

    return {
      syncedTxs: mergedTxs.length,
      reconciledUsers: reconciledUsersCount,
      message: `Berhasil menyinkronkan ${mergedTxs.length} aktivitas transaksi dan ${reconciledUsersCount} akun pengguna.`
    };
  } catch (err) {
    console.warn('reconcileAllPlatformActivities notice:', err);
    return {
      syncedTxs: 0,
      reconciledUsers: 0,
      message: 'Sinkronisasi selesai dengan data lokal platform.'
    };
  }
}

/**
 * -------------------------------------------------------------
 * LIVE CHAT CUSTOMER SERVICE DESK FOR ADMIN & USERS
 * -------------------------------------------------------------
 */

const DEFAULT_CHAT_SESSIONS: Record<string, ChatSession> = {
  'kamaliyahalim585@gmail.com': {
    id: 'chat-kamaliya',
    userEmail: 'kamaliyahalim585@gmail.com',
    userName: 'Kamaliya Halim',
    userPhone: '+62 812-3456-7890',
    userGoldHoldings: 12.5,
    userBalanceIdr: 2500000,
    status: 'active',
    unreadByAdmin: 1,
    unreadByUser: 0,
    lastUpdated: Date.now() - 3600000,
    messages: [
      {
        id: 'msg-k1',
        sender: 'bot',
        text: 'Halo Kamaliya! Layanan Live Chat Resmi NusantaraGold 24K siap membantu Anda.',
        time: '10:00 WIB',
        timestamp: Date.now() - 3600000 * 2
      },
      {
        id: 'msg-k2',
        sender: 'user',
        text: 'Halo admin, permohonan penarikan dana saya Rp 2.500.000 ke BCA kira-kira berapa lama ya prosesnya?',
        time: '10:45 WIB',
        timestamp: Date.now() - 3600000 * 1.5
      }
    ]
  },
  'investor@indogold.id': {
    id: 'chat-investor',
    userEmail: 'investor@indogold.id',
    userName: 'Investor VIP NusantaraGold',
    userPhone: '+62 812-9988-7766',
    userGoldHoldings: 25.0,
    userBalanceIdr: 5000000,
    status: 'active',
    unreadByAdmin: 0,
    unreadByUser: 0,
    lastUpdated: Date.now() - 3600000 * 5,
    messages: [
      {
        id: 'msg-inv1',
        sender: 'user',
        text: 'Selamat siang min, saya sudah transfer deposit Rp 5.000.000 ke Permata. Bukti transfer sudah saya upload.',
        time: '11:16 WIB',
        timestamp: Date.now() - 3600000 * 4
      },
      {
        id: 'msg-inv2',
        sender: 'agent',
        senderName: 'Putri • Tim CS NusantaraGold',
        text: 'Baik Kak, data deposit sedang diverifikasi oleh tim keuangan kami. Estimasi proses 1-3 menit.',
        time: '11:18 WIB',
        timestamp: Date.now() - 3600000 * 3.9
      }
    ]
  }
};

/**
 * Get all live chat sessions
 */
export function getAllChatSessions(): Record<string, ChatSession> {
  try {
    const raw = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_CHAT_SESSIONS, ...parsed };
  } catch (err) {
    console.warn('Failed to load chat sessions:', err);
    return DEFAULT_CHAT_SESSIONS;
  }
}

/**
 * Save chat sessions to local storage
 */
export function saveChatSessions(sessions: Record<string, ChatSession>): void {
  try {
    localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to save chat sessions:', err);
  }
}

/**
 * Merge Firestore chat sessions with local chat sessions and persist
 */
export function syncFirestoreChatSessionsToLocal(
  firestoreSessions: Record<string, ChatSession>
): Record<string, ChatSession> {
  const local = getAllChatSessions();
  const merged: Record<string, ChatSession> = { ...local };

  for (const [rawEmail, fsSess] of Object.entries(firestoreSessions)) {
    const key = rawEmail.trim().toLowerCase();
    if (!merged[key]) {
      merged[key] = fsSess;
    } else {
      const existingMsgIds = new Set(merged[key].messages.map((m) => m.id));
      const combinedMessages = [...merged[key].messages];

      for (const m of fsSess.messages) {
        if (!existingMsgIds.has(m.id)) {
          combinedMessages.push(m);
          existingMsgIds.add(m.id);
        }
      }

      merged[key] = {
        ...merged[key],
        ...fsSess,
        messages: combinedMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)),
        lastUpdated: Math.max(merged[key].lastUpdated || 0, fsSess.lastUpdated || 0),
        unreadByAdmin: Math.max(merged[key].unreadByAdmin || 0, fsSess.unreadByAdmin || 0)
      };
    }
  }

  saveChatSessions(merged);
  return merged;
}

/**
 * Get or create a chat session for a specific user
 */
export function getOrCreateChatSession(
  userEmail: string,
  userName?: string,
  goldGrams = 0,
  balanceIdr = 0,
  userPhone?: string
): ChatSession {
  const sessions = getAllChatSessions();
  const key = userEmail.trim().toLowerCase();

  if (sessions[key]) {
    return sessions[key];
  }

  const newSession: ChatSession = {
    id: `chat-${Date.now()}`,
    userEmail: key,
    userName: userName || key.split('@')[0],
    userPhone: userPhone || '+62 812-xxxx-xxxx',
    userGoldHoldings: goldGrams,
    userBalanceIdr: balanceIdr,
    status: 'active',
    unreadByAdmin: 0,
    unreadByUser: 0,
    lastUpdated: Date.now(),
    messages: [
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `Halo ${userName || 'Investor'}! Selamat datang di Layanan Live Chat Resmi NusantaraGold 24K. Petugas CS Prioritas dan Admin kami siap melayani Anda.`,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      }
    ]
  };

  sessions[key] = newSession;
  saveChatSessions(sessions);
  return newSession;
}

/**
 * Send a message FROM USER
 */
export function sendUserChatMessage(
  userEmail: string,
  userName: string,
  text: string,
  goldGrams = 0,
  balanceIdr = 0,
  userPhone?: string
): ChatSession {
  const sessions = getAllChatSessions();
  const key = userEmail.trim().toLowerCase();
  const session = sessions[key] || getOrCreateChatSession(key, userName, goldGrams, balanceIdr, userPhone);

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: 'user',
    text,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now()
  };

  // 1. Sync to Firestore in real time
  sendChatMessageToFirestore(key, newMsg, {
    userName,
    userPhone,
    userGoldHoldings: goldGrams,
    userBalanceIdr: balanceIdr
  }).catch((err) => console.warn('Firestore user chat sync notice:', err));

  session.messages.push(newMsg);
  session.unreadByAdmin += 1;
  session.lastUpdated = Date.now();
  session.status = 'active';
  session.userGoldHoldings = goldGrams;
  session.userBalanceIdr = balanceIdr;

  sessions[key] = session;
  saveChatSessions(sessions);
  return session;
}

/**
 * Send a message FROM ADMIN to a user
 */
export function sendAdminChatMessage(
  userEmail: string,
  adminName: string,
  text: string
): ChatSession {
  const sessions = getAllChatSessions();
  const key = userEmail.trim().toLowerCase();
  const session = sessions[key] || getOrCreateChatSession(key);

  const newMsg: ChatMessage = {
    id: `admin-msg-${Date.now()}`,
    sender: 'agent',
    senderName: adminName || 'Admin Super NusantaraGold',
    text,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now()
  };

  // 1. Sync to Firestore in real time
  sendChatMessageToFirestore(key, newMsg).catch((err) => console.warn('Firestore admin chat sync notice:', err));

  session.messages.push(newMsg);
  session.unreadByUser += 1;
  session.unreadByAdmin = 0; // cleared by admin reading
  session.lastUpdated = Date.now();

  sessions[key] = session;
  saveChatSessions(sessions);
  return session;
}

/**
 * Mark chat session as read by Admin
 */
export function markChatAsReadByAdmin(userEmail: string): void {
  const key = userEmail.trim().toLowerCase();
  markChatReadInFirestore(key, 'admin').catch((err) => console.warn('Firestore mark read notice:', err));
  const sessions = getAllChatSessions();
  if (sessions[key]) {
    sessions[key].unreadByAdmin = 0;
    saveChatSessions(sessions);
  }
}

/**
 * -------------------------------------------------------------
 * USER MANAGEMENT & KYC
 * -------------------------------------------------------------
 */

export function getAllUsersList(): RegisteredAccountRecord[] {
  const vault = getRegisteredAccounts();
  return Object.values(vault).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/**
 * KYC VERIFICATION QUEUE & MANAGEMENT FOR ADMIN
 */
export function getAllKycVerifications(): KycVerificationRecord[] {
  try {
    const raw = localStorage.getItem(KYC_VERIFICATIONS_STORAGE_KEY);
    let list: KycVerificationRecord[] = raw ? JSON.parse(raw) : [];
    if (list.length === 0) {
      list = [...INITIAL_KYC_VERIFICATIONS];
      localStorage.setItem(KYC_VERIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    }
    return list.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
  } catch (err) {
    console.warn('Failed to load KYC verifications:', err);
    return [...INITIAL_KYC_VERIFICATIONS];
  }
}

export function saveKycVerifications(records: KycVerificationRecord[]): void {
  try {
    localStorage.setItem(KYC_VERIFICATIONS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save KYC verifications:', err);
  }
}

export function submitKycVerification(record: KycVerificationRecord): void {
  const list = getAllKycVerifications();
  const existingIdx = list.findIndex((k) => k.id === record.id || k.userEmail.toLowerCase() === record.userEmail.toLowerCase());
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...record, submittedAt: Date.now(), status: 'pending' };
  } else {
    list.unshift(record);
  }
  saveKycVerifications(list);

  // Sync to local account record if exists
  const userAcc = findRegisteredAccount(record.userEmail);
  if (userAcc) {
    saveRegisteredAccountRecord({
      ...userAcc,
      userProfile: {
        ...userAcc.userProfile,
        isKycVerified: false,
        kycStatus: 'pending',
        kycLevel: 'Menunggu Verifikasi Admin',
        kycData: {
          nik: record.nik,
          fullName: record.userName,
          ktpPhoto: record.ktpPhoto,
          selfiePhoto: record.selfiePhoto,
          address: record.address,
          submittedAt: record.submittedAt
        }
      }
    });
  }

  broadcastPlatformSync({
    type: 'kyc_submitted',
    email: record.userEmail,
    kycId: record.id
  });
}

export async function approveKycVerification(
  kycId: string, 
  userEmail: string,
  adminName = 'Admin Super NusantaraGold'
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = extractCleanEmail(userEmail);
  const list = getAllKycVerifications();
  const item = list.find((k) => k.id === kycId || (cleanEmail && k.userEmail.toLowerCase() === cleanEmail));

  if (item) {
    item.status = 'verified';
    item.reviewedAt = Date.now();
    item.reviewedBy = adminName;
    saveKycVerifications(list);
  }

  if (cleanEmail) {
    updateUserKycStatus(cleanEmail, true, 'Level 2 (Terverifikasi KYC Resmi)');
    const userAcc = findRegisteredAccount(cleanEmail);
    if (userAcc) {
      saveRegisteredAccountRecord({
        ...userAcc,
        userProfile: {
          ...userAcc.userProfile,
          isKycVerified: true,
          kycStatus: 'verified',
          kycLevel: 'Level 2 (Terverifikasi KYC Resmi)'
        }
      });
    }
  }

  broadcastPlatformSync({
    type: 'kyc_approved',
    email: cleanEmail,
    kycId
  });

  return {
    success: true,
    message: `KYC investor ${cleanEmail || kycId} berhasil diverifikasi & disetujui!`
  };
}

export async function rejectKycVerification(
  kycId: string, 
  userEmail: string, 
  reason: string,
  adminName = 'Admin Super NusantaraGold'
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = extractCleanEmail(userEmail);
  const list = getAllKycVerifications();
  const item = list.find((k) => k.id === kycId || (cleanEmail && k.userEmail.toLowerCase() === cleanEmail));

  if (item) {
    item.status = 'rejected';
    item.reviewedAt = Date.now();
    item.reviewedBy = adminName;
    item.rejectionReason = reason;
    saveKycVerifications(list);
  }

  if (cleanEmail) {
    updateUserKycStatus(cleanEmail, false, 'Ditolak (Perlu Perbaikan Data)');
    const userAcc = findRegisteredAccount(cleanEmail);
    if (userAcc) {
      saveRegisteredAccountRecord({
        ...userAcc,
        userProfile: {
          ...userAcc.userProfile,
          isKycVerified: false,
          kycStatus: 'rejected',
          kycLevel: 'Ditolak: ' + reason
        }
      });
    }
  }

  broadcastPlatformSync({
    type: 'kyc_rejected',
    email: cleanEmail,
    kycId,
    reason
  });

  return {
    success: true,
    message: `Pengajuan KYC ${cleanEmail || kycId} ditolak. Alasan: ${reason}`
  };
}

export function updateUserKycStatus(
  email: string,
  isVerified: boolean,
  kycLevel?: string
): boolean {
  adminUpdateUserKycInFirestore(email, isVerified).catch((err) => console.warn('Firestore KYC sync notice:', err));
  const userAcc = findRegisteredAccount(email);
  if (!userAcc) return false;

  saveRegisteredAccountRecord({
    ...userAcc,
    userProfile: {
      ...userAcc.userProfile,
      isKycVerified: isVerified,
      kycLevel: kycLevel || (isVerified ? 'Level 2 (Terverifikasi KYC)' : 'Belum Terverifikasi')
    }
  });
  return true;
}

export function updateUserRole(
  email: string,
  role: 'admin' | 'user'
): boolean {
  const userAcc = findRegisteredAccount(email);
  if (!userAcc) return false;

  saveRegisteredAccountRecord({
    ...userAcc,
    userProfile: {
      ...userAcc.userProfile,
      role
    }
  });
  return true;
}

export function resetUserPin(email: string, newPin: string): boolean {
  adminResetUserPinInFirestore(email, newPin).catch((err) => console.warn('Firestore PIN sync notice:', err));
  const userAcc = findRegisteredAccount(email);
  if (!userAcc) return false;

  saveRegisteredAccountRecord({
    ...userAcc,
    pin: newPin,
    userProfile: {
      ...userAcc.userProfile,
      pinSet: true,
      pinCode: newPin
    }
  });
  return true;
}

/**
 * -------------------------------------------------------------
 * GOLD PRICE CONTROLS
 * -------------------------------------------------------------
 */

export function getGoldPriceConfig(): GoldPriceConfig {
  try {
    const raw = localStorage.getItem(GOLD_PRICE_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse gold price config:', err);
  }

  return {
    buyPrice: BASE_BUY_PRICE,
    sellPrice: BASE_SELL_PRICE,
    updatedAt: Date.now(),
    updatedBy: 'Sistem Pasar Otomatis (Antam LBMA)'
  };
}

export function setGoldPriceConfig(
  buyPrice: number,
  sellPrice: number,
  updatedBy: string
): void {
  setGoldPriceConfigInFirestore(buyPrice, sellPrice, updatedBy).catch((err) => console.warn('Firestore gold price sync notice:', err));
  try {
    const config: GoldPriceConfig = {
      buyPrice,
      sellPrice,
      updatedAt: Date.now(),
      updatedBy
    };
    localStorage.setItem(GOLD_PRICE_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save gold price config:', err);
  }
}

export function resetGoldPriceToDefault(): void {
  try {
    localStorage.removeItem(GOLD_PRICE_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to reset gold price config:', err);
  }
}
