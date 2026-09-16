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
  handleFirestoreError,
  OperationType,
  FirebaseUser
} from '../lib/firebase';
import { Transaction, UserAccount } from '../types';

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
        name: data.name || firebaseUser.displayName || 'Investor IndoGold',
        email: data.email || firebaseUser.email || '',
        phone: data.phone || '0812-9876-5432',
        isKycVerified: data.kycVerified ?? true,
        kycLevel: 'Tingkat 2 (Terverifikasi Dukcapil)',
        referralCode: data.referralCode || `IG${firebaseUser.uid.slice(0, 5).toUpperCase()}`,
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
        name: customName || firebaseUser.displayName || 'Investor IndoGold',
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
  const path = `users/${uid}`;

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

    await updateDoc(userRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Save transaction to Firestore
 */
export async function saveTransaction(
  uid: string, 
  tx: Transaction
): Promise<void> {
  const txRef = doc(db, 'transactions', tx.id);
  const path = `transactions/${tx.id}`;

  try {
    await setDoc(txRef, {
      id: tx.id,
      userId: uid,
      category: tx.category,
      title: tx.title,
      amountIdr: tx.amountIdr,
      grams: tx.goldGrams || 0,
      brand: tx.brandCode || '',
      brandName: tx.brandName || '',
      date: tx.date,
      timestamp: tx.timestamp,
      status: tx.status,
      paymentMethod: tx.paymentMethod || 'Saldo Kas IndoGold',
      taxOrFee: tx.taxOrFee || 0,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
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
        onUpdate({
          name: d.name,
          email: d.email,
          phone: d.phone,
          balanceIdr: Number(d.balanceIdr),
          goldHoldingsGram: Number(d.goldHoldingsGram),
          biometricEnabled: Boolean(d.biometricEnabled),
          dailyProfitEarnedTotal: Number(d.dailyProfitEarnedTotal || 0),
          lastDailyProfitClaimDate: d.lastDailyProfitClaimDate,
          referralCount: Number(d.referralCount || 0),
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Real-time listener for user transactions
 */
export function subscribeToUserTransactions(
  uid: string,
  onUpdate: (txs: Transaction[]) => void
): () => void {
  const txsCol = collection(db, 'transactions');
  const path = 'transactions';
  const q = query(
    txsCol,
    where('userId', '==', uid),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: d.id || docSnap.id,
          category: d.category,
          title: d.title,
          amountIdr: d.amountIdr,
          goldGrams: d.grams,
          brandCode: d.brand,
          brandName: d.brandName,
          date: d.date,
          timestamp: d.timestamp,
          status: d.status,
          paymentMethod: d.paymentMethod,
          taxOrFee: d.taxOrFee,
        });
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
