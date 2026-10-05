import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  limit,
  handleFirestoreError,
  OperationType,
  FirebaseUser
} from '../lib/firebase';
import { Transaction, UserAccount, ChatSession, ChatMessage, GoldPriceConfig } from '../types';
import { RegisteredAccountRecord } from './authStorage';

/**
 * Helper to encode email for safe document IDs
 */
export function encodeChatId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Robust extraction of clean email address from string, transaction, or mixed format
 * Handles cases like "BCA • 12345 (user@domain.com)", "user@domain.com", or Transaction object
 */
export function extractCleanEmail(val?: string | Transaction | null): string {
  if (!val) return '';
  if (typeof val === 'object') {
    if (val.userEmail && val.userEmail.includes('@')) {
      return val.userEmail.trim().toLowerCase();
    }
    return extractCleanEmail(val.senderAccount || val.notes || '');
  }
  const str = String(val).trim();
  const match = str.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (match) {
    return match[1].trim().toLowerCase();
  }
  if (str.includes('@')) {
    return str.toLowerCase();
  }
  return '';
}

/**
 * Fetch or initialize a user profile in Firestore
 */
export async function syncUserProfile(
  firebaseUser: FirebaseUser,
  customName?: string,
  isNewUser?: boolean,
  referralCodeUsed?: string
): Promise<UserAccount> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const path = `users/${firebaseUser.uid}`;

  try {
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: firebaseUser.uid,
        name: data.name || firebaseUser.displayName || 'Investor NusantaraGold',
        email: data.email || firebaseUser.email || '',
        phone: data.phone || '0812-9876-5432',
        isKycVerified: data.kycVerified ?? true,
        kycLevel: 'Tingkat 2 (Terverifikasi Dukcapil)',
        referralCode: data.referralCode || `NG${firebaseUser.uid.slice(0, 5).toUpperCase()}`,
        referralBonus: 10000,
        balanceIdr: Number(data.balanceIdr ?? 1500000),
        goldHoldingsGram: Number(data.goldHoldingsGram ?? 12.5),
        biometricEnabled: data.biometricEnabled ?? true,
        pinSet: data.pinSet ?? true,
        pinCode: data.pinCode || '123456',
        signupBonusReceived: data.signupBonusReceived ?? true,
        dailyProfitEarnedTotal: Number(data.dailyProfitEarnedTotal ?? 0),
        lastDailyProfitClaimDate: data.lastDailyProfitClaimDate || '',
        referralCount: Number(data.referralCount ?? 3),
      };
    } else {
      // Calculate initial balance: default starter + bonus if new
      let initialBalance = 1500000;
      let bonusGiven = false;
      if (isNewUser) {
        initialBalance += 20000; // Rp 20.000 signup bonus
        if (referralCodeUsed) {
          initialBalance += 10000; // Rp 10.000 referral bonus
        }
        bonusGiven = true;
      }

      const newProfile: Record<string, unknown> = {
        id: firebaseUser.uid,
        name: customName || firebaseUser.displayName || 'Investor NusantaraGold',
        email: firebaseUser.email || '',
        phone: '0812-9876-5432',
        referralCode: `IG${firebaseUser.uid.slice(0, 5).toUpperCase()}`,
        kycVerified: true,
        balanceIdr: initialBalance,
        goldHoldingsGram: 12.5,
        biometricEnabled: true,
        pinSet: true,
        signupBonusReceived: bonusGiven,
        dailyProfitEarnedTotal: 0,
        lastDailyProfitClaimDate: '',
        referralCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userRef, newProfile);

      return {
        uid: firebaseUser.uid,
        name: newProfile.name as string,
        email: newProfile.email as string,
        phone: newProfile.phone as string,
        isKycVerified: true,
        kycLevel: 'Tingkat 2 (Terverifikasi Dukcapil)',
        referralCode: newProfile.referralCode as string,
        referralBonus: 10000,
        balanceIdr: initialBalance,
        goldHoldingsGram: 12.5,
        biometricEnabled: true,
        pinSet: true,
        signupBonusReceived: bonusGiven,
        dailyProfitEarnedTotal: 0,
        lastDailyProfitClaimDate: '',
        referralCount: 0,
      };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Update user profile in Firestore
 */
export async function saveUserProfile(
  uid: string, 
  updates: Partial<UserAccount>
): Promise<void> {
  const userRef = doc(db, 'users', uid);

  try {
    const payload: Record<string, unknown> = {
      updatedAt: new Date().toISOString()
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.balanceIdr !== undefined) payload.balanceIdr = updates.balanceIdr;
    if (updates.goldHoldingsGram !== undefined) payload.goldHoldingsGram = updates.goldHoldingsGram;
    if (updates.biometricEnabled !== undefined) payload.biometricEnabled = updates.biometricEnabled;
    if (updates.dailyProfitEarnedTotal !== undefined) payload.dailyProfitEarnedTotal = updates.dailyProfitEarnedTotal;
    if (updates.lastDailyProfitClaimDate !== undefined) payload.lastDailyProfitClaimDate = updates.lastDailyProfitClaimDate;
    if (updates.referralCount !== undefined) payload.referralCount = updates.referralCount;
    if (updates.signupBonusReceived !== undefined) payload.signupBonusReceived = updates.signupBonusReceived;

    await setDoc(userRef, payload, { merge: true });
  } catch (error) {
    console.warn('saveUserProfile Firestore notice:', error);
  }
}

/**
 * Save transaction to Firestore with rich fields
 */
export async function saveTransaction(
  uid: string, 
  tx: Transaction,
  userEmail?: string,
  userName?: string
): Promise<void> {
  const txRef = doc(db, 'transactions', tx.id);

  try {
    // Safety check: ensure proof image does not exceed Firestore's 1MB document size limit
    let safeProof = tx.proofImage;
    if (safeProof && safeProof.length > 500000) {
      safeProof = safeProof.substring(0, 450000);
    }

    const cleanEmail = extractCleanEmail(userEmail || tx.userEmail || tx.senderAccount);
    const effectiveEmail = cleanEmail || userEmail || tx.senderAccount || '';
    const effectiveName = userName || tx.senderName || tx.recipientName || 'Investor';

    const payload: Record<string, unknown> = {
      id: tx.id,
      userId: uid,
      userEmail: effectiveEmail,
      category: tx.category,
      title: tx.title,
      amountIdr: Number(tx.amountIdr || 0),
      grams: Number(tx.goldGrams || 0),
      brand: tx.brandCode || '',
      brandName: tx.brandName || '',
      date: tx.date || 'Hari ini, Baru saja',
      timestamp: Number(tx.timestamp || Date.now()),
      status: tx.status || 'Pending',
      paymentMethod: tx.paymentMethod || 'Transfer Bank',
      taxOrFee: Number(tx.taxOrFee || 0),
      updatedAt: new Date().toISOString()
    };
    if (effectiveEmail) {
      payload.userEmail = effectiveEmail;
      payload.senderAccount = tx.senderAccount || effectiveEmail;
    }
    if (effectiveName) {
      payload.userName = effectiveName;
      payload.senderName = tx.senderName || effectiveName;
    }
    if (tx.recipientName) payload.recipientName = tx.recipientName;
    if (safeProof) payload.proofImage = safeProof;
    if (tx.notes) payload.notes = tx.notes;

    await setDoc(txRef, payload, { merge: true });
  } catch (error) {
    console.warn('saveTransaction to Firestore note:', error);
  }
}

/**
 * Real-time listener for user profile
 */
export function subscribeToUserProfile(
  uid: string,
  onUpdate: (data: Partial<UserAccount>) => void
): () => void {
  const userRef = doc(db, 'users', uid);
  const path = `users/${uid}`;

  return onSnapshot(
    userRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (!d) return;

        const updatePayload: Partial<UserAccount> = {};
        if (d.name && typeof d.name === 'string' && d.name.trim()) {
          updatePayload.name = d.name.trim();
        }
        if (d.email && typeof d.email === 'string' && d.email.trim()) {
          updatePayload.email = d.email.trim();
        }
        if (d.phone && typeof d.phone === 'string' && d.phone.trim()) {
          updatePayload.phone = d.phone.trim();
        }
        if (d.balanceIdr !== undefined && d.balanceIdr !== null && !isNaN(Number(d.balanceIdr))) {
          updatePayload.balanceIdr = Number(d.balanceIdr);
        }
        if (d.goldHoldingsGram !== undefined && d.goldHoldingsGram !== null && !isNaN(Number(d.goldHoldingsGram))) {
          updatePayload.goldHoldingsGram = Number(d.goldHoldingsGram);
        }
        if (d.biometricEnabled !== undefined) {
          updatePayload.biometricEnabled = Boolean(d.biometricEnabled);
        }
        if (d.dailyProfitEarnedTotal !== undefined && !isNaN(Number(d.dailyProfitEarnedTotal))) {
          updatePayload.dailyProfitEarnedTotal = Number(d.dailyProfitEarnedTotal);
        }
        if (d.lastDailyProfitClaimDate && typeof d.lastDailyProfitClaimDate === 'string') {
          updatePayload.lastDailyProfitClaimDate = d.lastDailyProfitClaimDate;
        }
        if (d.referralCount !== undefined && !isNaN(Number(d.referralCount))) {
          updatePayload.referralCount = Number(d.referralCount);
        }
        if (d.isKycVerified !== undefined) {
          updatePayload.isKycVerified = Boolean(d.isKycVerified);
        }
        if (d.kycLevel && typeof d.kycLevel === 'string') {
          updatePayload.kycLevel = d.kycLevel;
        }

        if (Object.keys(updatePayload).length > 0) {
          onUpdate(updatePayload);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Real-time listener for user transactions with dual UID and email reconciliation
 */
export function subscribeToUserTransactions(
  uid: string,
  onUpdate: (txs: Transaction[]) => void,
  userEmail?: string
): () => void {
  const cleanEmail = extractCleanEmail(userEmail);
  const txsCol = collection(db, 'transactions');
  const txMap = new Map<string, Transaction>();

  const parseDoc = (docSnap: any): Transaction => {
    const d = docSnap.data();
    return {
      id: d.id || docSnap.id,
      userId: d.userId,
      userEmail: d.userEmail || cleanEmail,
      category: d.category || 'deposit',
      title: d.title || 'Transaksi',
      amountIdr: Number(d.amountIdr || 0),
      goldGrams: Number(d.grams || d.goldGrams || 0),
      brandCode: d.brand || d.brandCode,
      brandName: d.brandName,
      date: d.date || 'Hari ini',
      timestamp: Number(d.timestamp || Date.now()),
      status: (d.status as 'Pending' | 'Approved' | 'Rejected') || 'Pending',
      paymentMethod: d.paymentMethod || 'Saldo Kas',
      recipientName: d.recipientName,
      senderName: d.senderName,
      senderAccount: d.senderAccount || d.userEmail || cleanEmail,
      proofImage: d.proofImage,
      notes: d.notes,
      taxOrFee: d.taxOrFee,
    };
  };

  const notify = () => {
    const items = Array.from(txMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    if (items.length > 0) {
      onUpdate(items);
    }
  };

  const unsubs: (() => void)[] = [];

  // 1. Listen by UID if provided
  if (uid && uid.trim()) {
    const qUid = query(txsCol, where('userId', '==', uid.trim()));
    const unsubUid = onSnapshot(
      qUid,
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            const tx = parseDoc(docSnap);
            txMap.set(tx.id, tx);
          }
        });
        notify();
      },
      (error) => {
        console.warn('subscribeToUserTransactions uid notice:', error);
      }
    );
    unsubs.push(unsubUid);
  }

  // 2. Listen by userEmail if provided
  if (cleanEmail) {
    const qEmail = query(txsCol, where('userEmail', '==', cleanEmail));
    const unsubEmail = onSnapshot(
      qEmail,
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            const tx = parseDoc(docSnap);
            txMap.set(tx.id, tx);
          }
        });
        notify();
      },
      (error) => {
        console.warn('subscribeToUserTransactions email notice:', error);
      }
    );
    unsubs.push(unsubEmail);
  }

  return () => {
    unsubs.forEach((u) => {
      if (typeof u === 'function') u();
    });
  };
}

/**
 * Direct fetch of all platform transactions from Firestore (Admin Desk)
 */
export async function fetchAllPlatformTransactionsFromFirestore(): Promise<Transaction[]> {
  try {
    const txsCol = collection(db, 'transactions');
    const snap = await getDocs(txsCol);
    const items: Transaction[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (!d) return;
      items.push({
        id: d.id || docSnap.id,
        category: d.category || 'deposit',
        title: d.title || 'Transaksi Platform',
        amountIdr: Number(d.amountIdr || 0),
        goldGrams: Number(d.grams || d.goldGrams || 0),
        brandCode: d.brand || d.brandCode,
        brandName: d.brandName,
        date: d.date || 'Hari ini',
        timestamp: Number(d.timestamp || Date.now()),
        status: (d.status as 'Pending' | 'Approved' | 'Rejected') || 'Pending',
        paymentMethod: d.paymentMethod || 'Transfer Bank',
        recipientName: d.recipientName || '',
        senderName: d.senderName || d.userName || '',
        senderAccount: d.senderAccount || d.userEmail || '',
        proofImage: d.proofImage,
        notes: d.notes,
        taxOrFee: d.taxOrFee || 0,
      });
    });
    return items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (err) {
    console.warn('fetchAllPlatformTransactionsFromFirestore error:', err);
    return [];
  }
}

/**
 * Real-time listener for ALL platform transactions (Admin Desk)
 */
export function subscribeToAllPlatformTransactions(
  onUpdate: (txs: Transaction[]) => void
): () => void {
  const txsCol = collection(db, 'transactions');

  return onSnapshot(
    txsCol,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (!d) return;
        items.push({
          id: d.id || docSnap.id,
          category: d.category || 'deposit',
          title: d.title || 'Transaksi Platform',
          amountIdr: Number(d.amountIdr || 0),
          goldGrams: Number(d.grams || d.goldGrams || 0),
          brandCode: d.brand || d.brandCode,
          brandName: d.brandName,
          date: d.date || 'Hari ini',
          timestamp: Number(d.timestamp || Date.now()),
          status: (d.status as 'Pending' | 'Approved' | 'Rejected') || 'Pending',
          paymentMethod: d.paymentMethod || 'Transfer Bank',
          recipientName: d.recipientName || '',
          senderName: d.senderName || d.userName || '',
          senderAccount: d.senderAccount || d.userEmail || '',
          proofImage: d.proofImage,
          notes: d.notes,
          taxOrFee: d.taxOrFee || 0,
        });
      });
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      onUpdate(items);
    },
    (error) => {
      console.warn('subscribeToAllPlatformTransactions snapshot notice:', error);
    }
  );
}

export interface PendingAggregation {
  pendingDeposits: Transaction[];
  pendingWithdrawals: Transaction[];
  allPending: Transaction[];
  totalPendingDepositIdr: number;
  totalPendingWithdrawalIdr: number;
  totalPendingCount: number;
  lastUpdated: number;
  latestPendingTx?: Transaction | null;
  newlyAddedTx?: Transaction | null;
}

/**
 * Real-time listening service that aggregates pending deposit and withdrawal transactions
 * directly from Firestore to ensure the Admin dashboard reflects live user activity immediately.
 */
export function subscribeToPendingTransactions(
  onUpdate: (aggregation: PendingAggregation) => void
): () => void {
  const txsCol = collection(db, 'transactions');
  let initialLoadDone = false;
  const knownTxIds = new Set<string>();

  return onSnapshot(
    txsCol,
    (snapshot) => {
      const pendingDeps: Transaction[] = [];
      const pendingWds: Transaction[] = [];
      let freshlyAdded: Transaction | null = null;

      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (!d) return;

        const txId = d.id || docSnap.id;
        const status = (d.status || '').toLowerCase();
        if (status !== 'pending') return;

        const cat = (d.category || '').toLowerCase();
        const title = (d.title || '').toLowerCase();

        const tx: Transaction = {
          id: txId,
          category: (d.category as any) || 'deposit',
          title: d.title || (cat.includes('tarik') ? 'Penarikan Kas' : 'Deposit Saldo Kas'),
          amountIdr: Number(d.amountIdr || 0),
          goldGrams: Number(d.grams || d.goldGrams || 0),
          brandCode: d.brand || d.brandCode,
          brandName: d.brandName,
          date: d.date || 'Hari ini',
          timestamp: Number(d.timestamp || Date.now()),
          status: 'Pending',
          paymentMethod: d.paymentMethod || 'Transfer Bank',
          recipientName: d.recipientName || '',
          senderName: d.senderName || d.userName || '',
          senderAccount: d.senderAccount || d.userEmail || '',
          proofImage: d.proofImage,
          notes: d.notes,
          taxOrFee: d.taxOrFee || 0,
        };

        if (initialLoadDone && !knownTxIds.has(txId)) {
          freshlyAdded = tx;
        }
        knownTxIds.add(txId);

        if (cat === 'deposit' || cat === 'setor' || title.includes('deposit')) {
          pendingDeps.push(tx);
        } else if (cat === 'tarik' || cat === 'withdraw' || title.includes('tarik')) {
          pendingWds.push(tx);
        } else {
          if (tx.recipientName || tx.title.toLowerCase().includes('tarik')) {
            pendingWds.push(tx);
          } else {
            pendingDeps.push(tx);
          }
        }
      });

      initialLoadDone = true;

      pendingDeps.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      pendingWds.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      const allPending = [...pendingDeps, ...pendingWds].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      const totalPendingDepositIdr = pendingDeps.reduce((sum, t) => sum + t.amountIdr, 0);
      const totalPendingWithdrawalIdr = pendingWds.reduce((sum, t) => sum + t.amountIdr, 0);

      onUpdate({
        pendingDeposits: pendingDeps,
        pendingWithdrawals: pendingWds,
        allPending,
        totalPendingDepositIdr,
        totalPendingWithdrawalIdr,
        totalPendingCount: allPending.length,
        lastUpdated: Date.now(),
        latestPendingTx: allPending[0] || null,
        newlyAddedTx: freshlyAdded
      });
    },
    (error) => {
      console.warn('subscribeToPendingTransactions snapshot notice:', error);
    }
  );
}

/**
 * Admin action: Update transaction status (Approve / Reject) in Firestore
 * and adjust user balance accordingly (e.g. credit deposit or refund withdrawal)
 */
export async function updateTransactionStatusInFirestore(
  txId: string,
  status: 'Approved' | 'Rejected',
  adminNotes?: string,
  targetEmail?: string,
  amountIdr?: number,
  category?: string
): Promise<void> {
  const txRef = doc(db, 'transactions', txId);
  const path = `transactions/${txId}`;

  try {
    const txSnap = await getDoc(txRef);
    const existing = txSnap.exists() ? txSnap.data() : null;
    const cat = category || existing?.category;
    const amt = amountIdr !== undefined ? amountIdr : Number(existing?.amountIdr || 0);
    const userUid = existing?.userId;
    const cleanEmail = extractCleanEmail(targetEmail) || 
      extractCleanEmail(existing?.userEmail) || 
      extractCleanEmail(existing?.senderAccount) || 
      extractCleanEmail(existing?.notes);

    const fullNote = adminNotes 
      ? `${existing?.notes || ''} [Admin: ${adminNotes}]`.trim()
      : `${existing?.notes || ''} [Admin ${status}]`.trim();

    // 1. Update the transaction status in Firestore
    await setDoc(txRef, {
      id: txId,
      status,
      notes: fullNote,
      ...(cleanEmail ? { userEmail: cleanEmail } : {}),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 2. Comprehensive balance reconciliation across all Firestore user references
    const targetUserRefs: any[] = [];
    const seenIds = new Set<string>();

    if (userUid && userUid.trim()) {
      targetUserRefs.push(doc(db, 'users', userUid.trim()));
      seenIds.add(userUid.trim());
    }

    if (cleanEmail) {
      const encodedId = encodeChatId(cleanEmail);
      if (!seenIds.has(encodedId)) {
        targetUserRefs.push(doc(db, 'users', encodedId));
        seenIds.add(encodedId);
      }

      // Query any user document by email
      try {
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where('email', '==', cleanEmail));
        const qSnap = await getDocs(q);
        qSnap.forEach((d) => {
          if (!seenIds.has(d.id)) {
            targetUserRefs.push(doc(db, 'users', d.id));
            seenIds.add(d.id);
          }
        });
      } catch (err) {
        console.warn('Query users by email notice:', err);
      }
    }

    // Now update balances on all matching user references in Firestore
    for (const uRef of targetUserRefs) {
      try {
        const uSnap = await getDoc(uRef);
        let currentBal = 0;
        let userData: any = {};
        if (uSnap.exists()) {
          userData = uSnap.data() || {};
          currentBal = Number(userData.balanceIdr || 0);
        }

        let newBal = currentBal;
        let shouldUpdate = false;

        if (status === 'Approved' && (cat === 'deposit' || cat === 'setor')) {
          // Deposit approved -> credit balance
          newBal = currentBal + amt;
          shouldUpdate = true;
        } else if (status === 'Rejected' && (cat === 'tarik' || cat === 'withdraw')) {
          // Withdrawal rejected -> refund balance
          newBal = currentBal + amt;
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          const fallbackName = userData.name || existing?.userName || existing?.senderName || 'Investor NusantaraGold';
          const fallbackGold = (userData.goldHoldingsGram !== undefined && !isNaN(Number(userData.goldHoldingsGram)))
            ? Number(userData.goldHoldingsGram)
            : 0;

          await setDoc(uRef, {
            ...userData,
            name: fallbackName,
            email: cleanEmail || userData.email || '',
            balanceIdr: newBal,
            goldHoldingsGram: fallbackGold,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (uErr) {
        console.warn('Balance reconciliation sub-update notice:', uErr);
      }
    }
  } catch (error) {
    console.warn('updateTransactionStatusInFirestore notice:', error);
  }
}

/**
 * Real-time listener for ALL chat sessions (Admin Desk)
 */
export function subscribeToAllChatSessions(
  onUpdate: (sessions: Record<string, ChatSession>) => void
): () => void {
  const chatsCol = collection(db, 'chats');

  return onSnapshot(
    chatsCol,
    (snapshot) => {
      const result: Record<string, ChatSession> = {};
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        const email = (d.userEmail || docSnap.id).trim().toLowerCase();
        result[email] = {
          id: d.id || docSnap.id,
          userEmail: email,
          userName: d.userName || 'Investor NusantaraGold',
          userPhone: d.userPhone || '',
          userGoldHoldings: Number(d.userGoldHoldings || 0),
          userBalanceIdr: Number(d.userBalanceIdr || 0),
          status: d.status || 'active',
          unreadByAdmin: Number(d.unreadByAdmin || 0),
          unreadByUser: Number(d.unreadByUser || 0),
          lastUpdated: Number(d.lastUpdated || d.updatedAt || Date.now()),
          messages: Array.isArray(d.messages) ? d.messages : []
        };
      });
      onUpdate(result);
    },
    (error) => {
      console.warn('subscribeToAllChatSessions Firestore notice:', error);
    }
  );
}

/**
 * Real-time listener for single user's chat session (LiveChatModal)
 */
export function subscribeToUserChatSession(
  userEmail: string,
  onUpdate: (session: ChatSession | null) => void
): () => void {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const chatId = encodeChatId(normalizedEmail);
  const chatRef = doc(db, 'chats', chatId);

  return onSnapshot(
    chatRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        onUpdate({
          id: docSnap.id,
          userEmail: d.userEmail || normalizedEmail,
          userName: d.userName || 'Investor NusantaraGold',
          userPhone: d.userPhone || '',
          userGoldHoldings: Number(d.userGoldHoldings || 0),
          userBalanceIdr: Number(d.userBalanceIdr || 0),
          status: d.status || 'active',
          unreadByAdmin: Number(d.unreadByAdmin || 0),
          unreadByUser: Number(d.unreadByUser || 0),
          lastUpdated: Number(d.lastUpdated || Date.now()),
          messages: Array.isArray(d.messages) ? d.messages : []
        });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn('subscribeToUserChatSession Firestore notice:', error);
    }
  );
}

/**
 * Send a chat message (user or admin) to Firestore in real-time
 */
export async function sendChatMessageToFirestore(
  userEmail: string,
  message: ChatMessage,
  sessionMeta?: {
    userName?: string;
    userPhone?: string;
    userGoldHoldings?: number;
    userBalanceIdr?: number;
  }
): Promise<void> {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const chatId = encodeChatId(normalizedEmail);
  const chatRef = doc(db, 'chats', chatId);

  try {
    const docSnap = await getDoc(chatRef);
    const isFromUser = message.sender === 'user';

    if (docSnap.exists()) {
      const data = docSnap.data();
      const existingMessages: ChatMessage[] = Array.isArray(data.messages) ? data.messages : [];
      const updatedMessages = [...existingMessages, message];

      await updateDoc(chatRef, {
        messages: updatedMessages,
        lastMessage: message.text,
        lastMessageTime: message.time,
        lastUpdated: Date.now(),
        unreadByAdmin: isFromUser ? (Number(data.unreadByAdmin || 0) + 1) : 0,
        unreadByUser: !isFromUser ? (Number(data.unreadByUser || 0) + 1) : 0,
        userGoldHoldings: sessionMeta?.userGoldHoldings !== undefined ? sessionMeta.userGoldHoldings : (data.userGoldHoldings || 0),
        userBalanceIdr: sessionMeta?.userBalanceIdr !== undefined ? sessionMeta.userBalanceIdr : (data.userBalanceIdr || 0),
        updatedAt: Date.now()
      });
    } else {
      // Create new chat session doc
      await setDoc(chatRef, {
        id: chatId,
        userEmail: normalizedEmail,
        userName: sessionMeta?.userName || normalizedEmail.split('@')[0],
        userPhone: sessionMeta?.userPhone || '',
        userGoldHoldings: sessionMeta?.userGoldHoldings || 0,
        userBalanceIdr: sessionMeta?.userBalanceIdr || 0,
        status: 'active',
        unreadByAdmin: isFromUser ? 1 : 0,
        unreadByUser: isFromUser ? 0 : 1,
        lastMessage: message.text,
        lastMessageTime: message.time,
        lastUpdated: Date.now(),
        messages: [message],
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.warn('sendChatMessageToFirestore notice:', error);
  }
}

/**
 * Mark chat read in Firestore
 */
export async function markChatReadInFirestore(
  userEmail: string,
  by: 'admin' | 'user'
): Promise<void> {
  const chatId = encodeChatId(userEmail);
  const chatRef = doc(db, 'chats', chatId);
  const path = `chats/${chatId}`;

  try {
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      await updateDoc(chatRef, {
        [by === 'admin' ? 'unreadByAdmin' : 'unreadByUser']: 0,
        updatedAt: Date.now()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Real-time listener for ALL users in Firestore (Admin Desk)
 */
export function subscribeToAllUsers(
  onUpdate: (users: RegisteredAccountRecord[]) => void
): () => void {
  const usersCol = collection(db, 'users');
  const path = 'users';

  return onSnapshot(
    usersCol,
    (snapshot) => {
      const list: RegisteredAccountRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          email: d.email || `${docSnap.id}@nusantaragold.user`,
          password: '',
          name: d.name || 'Investor NusantaraGold',
          phone: d.phone || '0812-9876-5432',
          pin: d.pinCode || '123456',
          updatedAt: Date.now(),
          transactions: [],
          userProfile: {
            uid: docSnap.id,
            name: d.name || 'Investor NusantaraGold',
            email: d.email || '',
            phone: d.phone || '',
            role: d.role === 'admin' ? 'admin' : 'user',
            isKycVerified: Boolean(d.kycVerified),
            kycLevel: d.role === 'admin' ? 'Super Administrator Master' : 'Tingkat 2 (Terverifikasi Dukcapil)',
            referralCode: d.referralCode || 'INDO2026',
            referralBonus: 10000,
            balanceIdr: Number(d.balanceIdr || 0),
            goldHoldingsGram: Number(d.goldHoldingsGram || 0),
            biometricEnabled: Boolean(d.biometricEnabled),
            pinSet: true,
            pinCode: d.pinCode || '123456',
            signupBonusReceived: true,
            dailyProfitEarnedTotal: Number(d.dailyProfitEarnedTotal || 0),
            lastDailyProfitClaimDate: d.lastDailyProfitClaimDate || '',
            referralCount: Number(d.referralCount || 0)
          }
        });
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Admin action: Manual adjustment of user balance/gold in Firestore
 */
export async function adminAdjustUserPortfolioInFirestore(
  targetEmail: string,
  deltaBalanceIdr: number,
  deltaGoldGrams: number,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', targetEmail.trim().toLowerCase()), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, message: `Akun dengan email ${targetEmail} tidak ditemukan di database.` };
    }

    const userDoc = snap.docs[0];
    const uData = userDoc.data();
    const newBal = Math.max(0, Number(uData.balanceIdr || 0) + deltaBalanceIdr);
    const newGold = Math.max(0, Number(uData.goldHoldingsGram || 0) + deltaGoldGrams);

    await updateDoc(doc(db, 'users', userDoc.id), {
      balanceIdr: newBal,
      goldHoldingsGram: newGold,
      updatedAt: new Date().toISOString()
    });

    // Create audit transaction log
    const auditTx: Transaction = {
      id: `ADJ-${Math.floor(10000 + Math.random() * 90000)}`,
      category: deltaBalanceIdr >= 0 ? 'deposit' : 'tarik',
      title: `Penyesuaian Saldo Treasury Admin (${notes || 'Koreksi Finansial'})`,
      amountIdr: Math.abs(deltaBalanceIdr),
      goldGrams: Math.abs(deltaGoldGrams),
      date: 'Hari ini, Baru saja',
      timestamp: Date.now(),
      status: 'Approved',
      paymentMethod: 'NusantaraGold Treasury Ledger Audit',
      notes: notes || 'Penyesuaian portfolio resmi oleh Super Admin NusantaraGold.'
    };

    await saveTransaction(userDoc.id, auditTx, targetEmail, uData.name);

    return { 
      success: true, 
      message: `Saldo ${targetEmail} berhasil disesuaikan: Rp ${newBal.toLocaleString('id-ID')} & ${newGold.toFixed(4)} gr emas.` 
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'users');
  }
}

/**
 * Admin action: Update user KYC in Firestore
 */
export async function adminUpdateUserKycInFirestore(
  targetEmail: string,
  isVerified: boolean
): Promise<void> {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('email', '==', targetEmail.trim().toLowerCase()), limit(1));
  const snap = await getDocs(q);

  if (!snap.empty) {
    await updateDoc(doc(db, 'users', snap.docs[0].id), {
      kycVerified: isVerified,
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Admin action: Reset user PIN in Firestore
 */
export async function adminResetUserPinInFirestore(
  targetEmail: string,
  newPin: string
): Promise<void> {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('email', '==', targetEmail.trim().toLowerCase()), limit(1));
  const snap = await getDocs(q);

  if (!snap.empty) {
    await updateDoc(doc(db, 'users', snap.docs[0].id), {
      pinCode: newPin,
      pinSet: true,
      updatedAt: new Date().toISOString()
    });
  }
}

/**
 * Real-time listener for Gold Price configuration in Firestore
 */
export function subscribeToGoldPriceConfig(
  onUpdate: (config: GoldPriceConfig) => void
): () => void {
  const configRef = doc(db, 'config', 'goldPrice');
  const path = 'config/goldPrice';

  return onSnapshot(
    configRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        onUpdate({
          buyPrice: Number(d.buyPrice),
          sellPrice: Number(d.sellPrice),
          updatedAt: Number(d.updatedAt || Date.now()),
          updatedBy: d.updatedBy || 'Super Admin'
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Admin action: Update Gold Price config in Firestore
 */
export async function setGoldPriceConfigInFirestore(
  buyPrice: number,
  sellPrice: number,
  adminEmail: string = 'Super Admin'
): Promise<void> {
  const configRef = doc(db, 'config', 'goldPrice');
  const path = 'config/goldPrice';

  try {
    await setDoc(configRef, {
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      updatedAt: Date.now(),
      updatedBy: adminEmail
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

