import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { HomeScreen } from './components/screens/HomeScreen';
import { PaketSpesialScreen } from './components/screens/PaketSpesialScreen';
import { TradeScreen } from './components/screens/TradeScreen';
import { WalletScreen } from './components/screens/WalletScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { AccountScreen } from './components/screens/AccountScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { StandaloneAdminPortal } from './components/screens/StandaloneAdminPortal';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ActiveModals, ActiveModalType } from './components/ActiveModals';
import { InstallPromptBanner } from './components/InstallPromptBanner';
import { INITIAL_USER, INITIAL_TRANSACTIONS, formatIDR } from './data/mockData';
import { ScreenTab, TradeType, WalletActionType, Transaction, UserAccount, EmiratesPackage } from './types';
import { CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  onAuthStateChanged, 
  fbSignOut, 
  testFirestoreConnection,
  FirebaseUser 
} from './lib/firebase';
import { 
  syncUserProfile, 
  saveUserProfile, 
  saveTransaction, 
  subscribeToUserProfile, 
  subscribeToUserTransactions,
  encodeChatId,
  extractCleanEmail
} from './services/databaseService';
import { 
  saveRegisteredAccountRecord, 
  findRegisteredAccount,
  getRegisteredAccounts 
} from './services/authStorage';
import { 
  isUserAdmin, 
  recordPlatformTransaction,
  getAllPlatformTransactions,
  INDOGOLD_SYNC_EVENT
} from './services/adminService';

export default function App() {
  const [user, setUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('indogold_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_USER,
            ...parsed,
            name: (parsed.name && typeof parsed.name === 'string' && parsed.name.trim()) ? parsed.name.trim() : INITIAL_USER.name,
            balanceIdr: (parsed.balanceIdr !== undefined && !isNaN(Number(parsed.balanceIdr))) ? Number(parsed.balanceIdr) : INITIAL_USER.balanceIdr,
            goldHoldingsGram: (parsed.goldHoldingsGram !== undefined && !isNaN(Number(parsed.goldHoldingsGram))) ? Number(parsed.goldHoldingsGram) : INITIAL_USER.goldHoldingsGram,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USER;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('indogold_txs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t) => t && typeof t === 'object' && t.id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [currentTab, setCurrentTab] = useState<ScreenTab>('beranda');
  const [activeActionFlow, setActiveActionFlow] = useState<'trade' | 'wallet' | null>(null);
  const [tradeType, setTradeType] = useState<TradeType>('beli');
  const [walletAction, setWalletAction] = useState<WalletActionType>('deposit');
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  const checkIsAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    if (import.meta.env.VITE_STANDALONE_ADMIN_PORTAL === 'true') return true;
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/admin' || 
      path.startsWith('/admin/') || 
      path === '/portal-admin' ||
      path.startsWith('/portal-admin/') ||
      search.includes('admin') || 
      hash.includes('admin')
    );
  };

  const [isStandaloneAdmin, setIsStandaloneAdmin] = useState<boolean>(() => checkIsAdminRoute());

  useEffect(() => {
    const handleLocationChange = () => {
      setIsStandaloneAdmin(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Shortcut Ctrl+Shift+A or Cmd+Shift+A to access isolated admin portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        try {
          window.history.pushState({}, '', '?admin=portal');
        } catch (_) {}
        setIsStandaloneAdmin(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [selectedEmiratesTier, setSelectedEmiratesTier] = useState<'bronze' | 'gold' | 'platinum'>('gold');
  const [certModalMode, setCertModalMode] = useState<'sertifikat' | 'cetak_fisik'>('sertifikat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(auth.currentUser);

  // Validate Firestore Connection on initial boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Strictly listen to Firebase Auth state for session grant and revocation
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        setIsAuthenticated(true);
        localStorage.setItem('nusantaragold_authenticated', 'true');
        localStorage.setItem('indogold_authenticated', 'true');
        try {
          const profile = await syncUserProfile(fbUser);
          const cleanEmail = extractCleanEmail(fbUser.email);
          const vaultAcc = cleanEmail ? findRegisteredAccount(cleanEmail) : null;
          if (vaultAcc && vaultAcc.userProfile) {
            setUser({
              ...vaultAcc.userProfile,
              ...profile,
              balanceIdr: vaultAcc.userProfile.balanceIdr,
              goldHoldingsGram: vaultAcc.userProfile.goldHoldingsGram,
            });
          } else {
            setUser(profile);
          }
        } catch (err) {
          console.warn('Sync profile fallback:', err);
        }
      } else {
        // If not in Firebase Auth, check if there is an active session from verified registered account
        const isAuthSaved = 
          localStorage.getItem('nusantaragold_authenticated') === 'true' || 
          localStorage.getItem('indogold_authenticated') === 'true';
        const savedUserStr = localStorage.getItem('nusantaragold_user') || localStorage.getItem('indogold_user');

        if (isAuthSaved && savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed && parsed.email) {
              const account = findRegisteredAccount(parsed.email);
              if (account) {
                // Account is confirmed in registered vault
                setIsAuthenticated(true);
                setUser(account.userProfile);
                if (account.transactions && account.transactions.length > 0) {
                  setTransactions(account.transactions);
                }
                setIsAuthChecking(false);
                return;
              }
            }
          } catch (_) {}
        }

        // Unauthenticated session - strictly revoke
        setIsAuthenticated(false);
        localStorage.removeItem('indogold_authenticated');
        localStorage.removeItem('nusantaragold_authenticated');
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync when authenticated or when user email is present
  useEffect(() => {
    const cleanEmail = extractCleanEmail(user.email);
    const effectiveUid = firebaseUser?.uid || (cleanEmail ? encodeChatId(cleanEmail) : null);
    if (!effectiveUid && !cleanEmail) return;

    const unsubs: (() => void)[] = [];

    // Subscribe to user profile by UID
    if (effectiveUid) {
      const unsubProfile = subscribeToUserProfile(effectiveUid, (data) => {
        if (data) {
          setUser((prev) => {
            const safeName = (data.name && typeof data.name === 'string' && data.name.trim()) 
              || prev.name 
              || 'Investor NusantaraGold';
            const safeBal = (data.balanceIdr !== undefined && data.balanceIdr !== null && !isNaN(Number(data.balanceIdr)))
              ? Number(data.balanceIdr)
              : (prev.balanceIdr ?? 0);
            const safeGold = (data.goldHoldingsGram !== undefined && data.goldHoldingsGram !== null && !isNaN(Number(data.goldHoldingsGram)))
              ? Number(data.goldHoldingsGram)
              : (prev.goldHoldingsGram ?? 0);

            return {
              ...prev,
              ...data,
              name: safeName,
              balanceIdr: safeBal,
              goldHoldingsGram: safeGold,
            };
          });
        }
      });
      unsubs.push(unsubProfile);
    }

    // Subscribe to user profile by encoded email if UID is different
    if (cleanEmail && effectiveUid !== encodeChatId(cleanEmail)) {
      const unsubProfileEmail = subscribeToUserProfile(encodeChatId(cleanEmail), (data) => {
        if (data) {
          setUser((prev) => {
            const safeName = (data.name && typeof data.name === 'string' && data.name.trim()) 
              || prev.name 
              || 'Investor NusantaraGold';
            const safeBal = (data.balanceIdr !== undefined && data.balanceIdr !== null && !isNaN(Number(data.balanceIdr)))
              ? Number(data.balanceIdr)
              : (prev.balanceIdr ?? 0);
            const safeGold = (data.goldHoldingsGram !== undefined && data.goldHoldingsGram !== null && !isNaN(Number(data.goldHoldingsGram)))
              ? Number(data.goldHoldingsGram)
              : (prev.goldHoldingsGram ?? 0);

            return {
              ...prev,
              ...data,
              name: safeName,
              balanceIdr: safeBal,
              goldHoldingsGram: safeGold,
            };
          });
        }
      });
      unsubs.push(unsubProfileEmail);
    }

    // Subscribe to user transactions (with dual UID and email query)
    const unsubTxs = subscribeToUserTransactions(
      effectiveUid || '',
      (txs) => {
        if (txs && txs.length > 0) {
          setTransactions((prev) => {
            const map = new Map<string, Transaction>();
            prev.forEach((t) => map.set(t.id, t));
            txs.forEach((t) => {
              const existing = map.get(t.id);
              map.set(t.id, { ...existing, ...t });
            });
            return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          });
        }
      },
      cleanEmail
    );
    unsubs.push(unsubTxs);

    return () => {
      unsubs.forEach((u) => {
        if (typeof u === 'function') u();
      });
    };
  }, [firebaseUser, user.email]);

  // Real-time sync with Admin panel actions, multi-tab changes, and local vault
  useEffect(() => {
    const handlePlatformSync = () => {
      const cleanEmail = extractCleanEmail(user.email);
      if (!cleanEmail) return;

      // 1. Sync user balance from local vault
      const vaultAcc = findRegisteredAccount(cleanEmail);
      if (vaultAcc && vaultAcc.userProfile) {
        setUser((prev) => {
          const vProf = vaultAcc.userProfile;
          const safeBal = (vProf.balanceIdr !== undefined && !isNaN(Number(vProf.balanceIdr)))
            ? Number(vProf.balanceIdr)
            : (prev.balanceIdr ?? 0);
          const safeGold = (vProf.goldHoldingsGram !== undefined && !isNaN(Number(vProf.goldHoldingsGram)))
            ? Number(vProf.goldHoldingsGram)
            : (prev.goldHoldingsGram ?? 0);
          const safeName = vProf.name || prev.name || 'Investor NusantaraGold';

          return {
            ...prev,
            ...vProf,
            name: safeName,
            balanceIdr: safeBal,
            goldHoldingsGram: safeGold,
            isKycVerified: vProf.isKycVerified !== undefined ? vProf.isKycVerified : prev.isKycVerified
          };
        });
      }

      // 2. Sync transactions from master platform store
      const allMasterTxs = getAllPlatformTransactions();
      const userMasterTxs = allMasterTxs.filter((t) => {
        const txEmail = extractCleanEmail(t.userEmail || t.senderAccount || t.notes);
        return txEmail === cleanEmail;
      });

      if (userMasterTxs.length > 0) {
        setTransactions((prev) => {
          const map = new Map<string, Transaction>();
          prev.forEach((t) => map.set(t.id, t));
          userMasterTxs.forEach((t) => {
            const ex = map.get(t.id);
            map.set(t.id, { ...ex, ...t });
          });
          return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        });

        setSelectedReceiptTx((prevTx) => {
          if (!prevTx) return null;
          const matching = userMasterTxs.find((t) => t.id === prevTx.id);
          return matching ? { ...prevTx, ...matching } : prevTx;
        });
      }
    };

    window.addEventListener(INDOGOLD_SYNC_EVENT, handlePlatformSync);
    window.addEventListener('storage', (e) => {
      if (e.key === 'indogold_sync_trigger' || e.key === 'indogold_platform_master_txs_v1' || e.key === 'indogold_accounts_vault_v1') {
        handlePlatformSync();
      }
    });

    return () => {
      window.removeEventListener(INDOGOLD_SYNC_EVENT, handlePlatformSync);
    };
  }, [user.email]);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('indogold_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('indogold_txs', JSON.stringify(transactions));
  }, [transactions]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleStartTrade = (type: TradeType) => {
    setTradeType(type);
    setActiveActionFlow('trade');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartWallet = (action: WalletActionType) => {
    setWalletAction(action);
    setActiveActionFlow('wallet');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (target: ScreenTab | 'trade' | 'wallet') => {
    if (target === 'trade') {
      handleStartTrade('beli');
    } else if (target === 'wallet') {
      handleStartWallet('deposit');
    } else {
      setActiveActionFlow(null);
      setCurrentTab(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCompleteTransaction = async (
    tx: Transaction,
    newBalance: number,
    newGoldHoldings: number
  ) => {
    // Enrich transaction with user's sender account and name
    const enrichedTx: Transaction = {
      ...tx,
      senderAccount: tx.senderAccount || user.email,
      senderName: tx.senderName || user.name
    };

    setUser((prev) => ({
      ...prev,
      balanceIdr: newBalance,
      goldHoldingsGram: newGoldHoldings
    }));
    setTransactions((prev) => [enrichedTx, ...prev.filter((t) => t.id !== enrichedTx.id)]);
    setSelectedReceiptTx(enrichedTx);
    setActiveActionFlow(null);

    // Record to master platform transaction list
    recordPlatformTransaction(enrichedTx, user.email);

    // Save to Firestore always with guaranteed effectiveUid
    const effectiveUid = firebaseUser?.uid || (user.email ? encodeChatId(user.email) : 'investor_account');
    try {
      await saveTransaction(effectiveUid, enrichedTx, user.email, user.name);
    } catch (err) {
      console.warn('Firestore write warning for saveTransaction:', err);
    }

    try {
      await saveUserProfile(effectiveUid, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        balanceIdr: newBalance,
        goldHoldingsGram: newGoldHoldings
      });
    } catch (err) {
      console.warn('Firestore write warning for saveUserProfile:', err);
    }

    showToast(`Transaksi ${tx.title} berhasil diproses!`);
  };

  const handleClaimDailyProfit = async (amountIdr: number) => {
    const todayDate = new Date().toISOString().slice(0, 10);
    const newTotal = (user.dailyProfitEarnedTotal || 0) + amountIdr;
    const newBalance = user.balanceIdr + amountIdr;

    setUser((prev) => ({
      ...prev,
      balanceIdr: newBalance,
      dailyProfitEarnedTotal: newTotal,
      lastDailyProfitClaimDate: todayDate,
    }));

    const profitTx: Transaction = {
      id: `CUAN-${Math.floor(10000 + Math.random() * 90000)}`,
      category: 'deposit',
      title: 'Dividen Profit Harian 3% (Daily Yield)',
      amountIdr: amountIdr,
      date: 'Hari ini, Baru saja',
      timestamp: Date.now(),
      status: 'Approved',
      paymentMethod: 'NusantaraGold 3% Daily Yield Vault',
      taxOrFee: 0
    };
    setTransactions((prev) => [profitTx, ...prev]);

    if (firebaseUser?.uid) {
      try {
        await saveUserProfile(firebaseUser.uid, {
          balanceIdr: newBalance,
          dailyProfitEarnedTotal: newTotal,
          lastDailyProfitClaimDate: todayDate,
        });
        await saveTransaction(firebaseUser.uid, profitTx);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }
    }
  };

  const handleUpdateUser = async (updated: Partial<UserAccount>) => {
    setUser((prev) => ({ ...prev, ...updated }));
    if (firebaseUser?.uid) {
      try {
        await saveUserProfile(firebaseUser.uid, updated);
      } catch (err) {
        console.warn('Firestore update warning:', err);
      }
    }
    showToast('Pengaturan akun berhasil disimpan.');
  };

  const handleActivatePackage = async (pkg: EmiratesPackage) => {
    if (user.balanceIdr < pkg.priceIdr) {
      showToast(`Saldo kas Anda (${formatIDR(user.balanceIdr)}) belum mencukupi untuk ${pkg.name}. Silakan deposit terlebih dahulu.`);
      setActiveModal(null);
      handleStartWallet('deposit');
      return;
    }

    const newBalance = user.balanceIdr - pkg.priceIdr + pkg.bonusAmountIdr;
    const newGold = Number((user.goldHoldingsGram + pkg.goldGrams).toFixed(4));

    const packageTx: Transaction = {
      id: `PKG-${Date.now()}`,
      category: 'beli',
      title: `Investasi ${pkg.name} (${pkg.goldBrand} ${pkg.goldGrams}g)`,
      amountIdr: pkg.priceIdr,
      goldGrams: pkg.goldGrams,
      date: 'Hari ini, Baru saja',
      timestamp: Date.now(),
      status: 'Approved',
      paymentMethod: 'Saldo Kas Platform',
      taxOrFee: 0,
      notes: `Aktivasi ${pkg.name}: Emas fisik ${pkg.goldGrams}g Emirates Gold 24K + Bonus Cashback ${pkg.bonusPercent}% (${formatIDR(pkg.bonusAmountIdr)})`
    };

    const bonusTx: Transaction = {
      id: `BONUS-PKG-${Date.now() + 1}`,
      category: 'deposit',
      title: `Bonus Cashback ${pkg.bonusPercent}% (${pkg.name})`,
      amountIdr: pkg.bonusAmountIdr,
      date: 'Hari ini, Baru saja',
      timestamp: Date.now() + 1,
      status: 'Approved',
      paymentMethod: 'Emirates Gold Reward Cashback',
      taxOrFee: 0,
      notes: `Bonus tunai instan ${pkg.bonusPercent}% dari aktivasi paket investasi ${pkg.name}`
    };

    const newPackageRecord = {
      id: `upkg-${Date.now()}`,
      packageId: pkg.id,
      packageName: pkg.name,
      priceIdr: pkg.priceIdr,
      goldGrams: pkg.goldGrams,
      bonusPercent: pkg.bonusPercent,
      bonusAmountIdr: pkg.bonusAmountIdr,
      purchasedAt: Date.now(),
      status: 'active' as const
    };

    const updatedUser: UserAccount = {
      ...user,
      balanceIdr: newBalance,
      goldHoldingsGram: newGold,
      activePackages: [...(user.activePackages || []), newPackageRecord]
    };

    setUser(updatedUser);
    setTransactions((prev) => [bonusTx, packageTx, ...prev]);

    // Simpan ke vault akun terdaftar
    const cleanEmail = extractCleanEmail(user.email);
    if (cleanEmail) {
      const userAcc = findRegisteredAccount(cleanEmail);
      if (userAcc) {
        saveRegisteredAccountRecord({
          ...userAcc,
          userProfile: updatedUser,
          transactions: [bonusTx, packageTx, ...(userAcc.transactions || [])],
          updatedAt: Date.now()
        });
      }
    }

    const effectiveUid = firebaseUser?.uid || (cleanEmail ? encodeChatId(cleanEmail) : 'guest');
    try {
      await saveUserProfile(effectiveUid, updatedUser);
      await saveTransaction(effectiveUid, packageTx, user.email, user.name);
      await saveTransaction(effectiveUid, bonusTx, user.email, user.name);
      recordPlatformTransaction(packageTx, user.email);
      recordPlatformTransaction(bonusTx, user.email);
    } catch (err) {
      console.warn('Sync package purchase warning:', err);
    }

    setActiveModal(null);
    showToast(`Sukses! ${pkg.name} aktif. Emas fisik ${pkg.goldGrams}g Emirates Gold & Bonus ${formatIDR(pkg.bonusAmountIdr)} telah masuk ke portofolio Anda!`);
  };

  const handleAuthSuccess = async (
    email: string, 
    name: string, 
    isNewRegistration?: boolean, 
    referralCodeUsed?: string,
    initialPin?: string,
    phone?: string,
    passwordUsed?: string,
    restoredProfile?: UserAccount,
    restoredTransactions?: Transaction[]
  ) => {
    let bonusAmount = 0;
    const bonusDescriptions: string[] = [];
    const newTransactionsList: Transaction[] = [];

    if (isNewRegistration) {
      bonusAmount += 20000; // Rp 20.000 signup bonus
      bonusDescriptions.push('Bonus Daftar Rp 20.000');

      const signupTx: Transaction = {
        id: `BONUS-REG-${Math.floor(10000 + Math.random() * 90000)}`,
        category: 'deposit',
        title: 'Bonus Pendaftaran Pengguna Baru',
        amountIdr: 20000,
        date: 'Hari ini, Baru saja',
        timestamp: Date.now(),
        status: 'Approved',
        paymentMethod: 'NusantaraGold Welcome Bonus',
        taxOrFee: 0,
        notes: 'Bonus saldo tunai pendaftaran akun baru NusantaraGold Luxe 24K'
      };
      newTransactionsList.push(signupTx);

      if (referralCodeUsed && referralCodeUsed.trim()) {
        bonusAmount += 10000; // Rp 10.000 referral bonus
        bonusDescriptions.push('Bonus Referral Rp 10.000');

        const refTx: Transaction = {
          id: `BONUS-REF-${Math.floor(10000 + Math.random() * 90000)}`,
          category: 'deposit',
          title: `Bonus Referral Kode [${referralCodeUsed.trim().toUpperCase()}]`,
          amountIdr: 10000,
          date: 'Hari ini, Baru saja',
          timestamp: Date.now() + 1,
          status: 'Approved',
          paymentMethod: 'NusantaraGold Referral Program',
          taxOrFee: 0,
          notes: `Hadiah bonus ekstra referral kode ${referralCodeUsed.trim().toUpperCase()}`
        };
        newTransactionsList.push(refTx);

        // Tambahkan hitungan 1 teman ke pengundang secara real-time
        try {
          const refCode = referralCodeUsed.trim().toUpperCase();
          const allAccounts = getRegisteredAccounts();
          for (const [accEmail, accRecord] of Object.entries(allAccounts)) {
            if (accRecord.userProfile.referralCode?.toUpperCase() === refCode) {
              const nextCount = (accRecord.userProfile.referralCount || 0) + 1;
              saveRegisteredAccountRecord({
                ...accRecord,
                userProfile: {
                  ...accRecord.userProfile,
                  referralCount: nextCount
                }
              });
              const referrerUid = encodeChatId(accEmail);
              saveUserProfile(referrerUid, {
                ...accRecord.userProfile,
                referralCount: nextCount
              }).catch(() => {});
              break;
            }
          }
        } catch (err) {
          console.warn('Increment referrer target count error:', err);
        }
      }
    }

    const currentFbUser = auth.currentUser;

    if (isNewRegistration) {
      const newUserProfile: UserAccount = {
        name,
        email,
        phone: phone || '+62 812-3456-7890',
        balanceIdr: bonusAmount, // Tepat Rp 20.000 atau Rp 30.000 (jika referral)
        goldHoldingsGram: 0,     // 0 gram emas untuk pengguna baru
        dailyProfitEarnedTotal: 0,
        referralCode: `IG${Math.floor(100000 + Math.random() * 900000)}`,
        referralCount: 0,
        referralBonus: 0,
        referredBy: referralCodeUsed?.trim().toUpperCase(),
        isKycVerified: false,
        kycStatus: 'unverified',
        kycLevel: 'Level 1 (Terdaftar)',
        biometricEnabled: true,
        signupBonusReceived: true,
        pinSet: true,
        pinCode: initialPin || '123456',
        role: 'user'
      };

      setUser(newUserProfile);
      setTransactions(newTransactionsList);

      localStorage.setItem('indogold_user', JSON.stringify(newUserProfile));
      localStorage.setItem('nusantaragold_user', JSON.stringify(newUserProfile));
      localStorage.setItem('indogold_authenticated', 'true');
      localStorage.setItem('nusantaragold_authenticated', 'true');
      localStorage.setItem('indogold_last_email', email);
      localStorage.setItem('nusantaragold_last_email', email);

      // Save to local vault & Firestore immediately so user can log back in anytime on any session
      saveRegisteredAccountRecord({
        email,
        password: passwordUsed || '123456',
        name,
        phone: phone || '+62 812-3456-7890',
        pin: initialPin || '123456',
        userProfile: newUserProfile,
        transactions: newTransactionsList,
        updatedAt: Date.now()
      });

      const syncUid = currentFbUser?.uid || encodeChatId(email);
      try {
        await saveUserProfile(syncUid, newUserProfile);
      } catch (err) {
        console.warn('Sync new user profile to Firestore note:', err);
      }

      for (const tx of newTransactionsList) {
        try {
          await saveTransaction(syncUid, tx, email, name);
          recordPlatformTransaction(tx, email);
        } catch (err) {
          console.warn('Sync new user tx to Firestore note:', err);
        }
      }

      showToast(`Selamat datang ${name}! Saldo Anda telah terisi ${bonusDescriptions.join(' + ')} (Total Rp ${bonusAmount.toLocaleString('id-ID')})!`);
    } else {
      // Existing user login
      const cleanEmail = extractCleanEmail(email);
      const vaultAcc = cleanEmail ? findRegisteredAccount(cleanEmail) : null;
      const targetProfile = restoredProfile || vaultAcc?.userProfile;

      if (targetProfile) {
        setUser(targetProfile);
        if (restoredTransactions && restoredTransactions.length > 0) {
          setTransactions(restoredTransactions);
        } else if (vaultAcc?.transactions && vaultAcc.transactions.length > 0) {
          setTransactions(vaultAcc.transactions);
        }
      } else if (currentFbUser) {
        try {
          const synced = await syncUserProfile(currentFbUser, name, false, undefined);
          setUser(synced);
        } catch (err) {
          console.warn('Error syncing profile from auth success:', err);
        }
      } else {
        setUser((prev) => ({
          ...prev,
          email,
          name: name || prev.name,
        }));
      }

      const activeProfile = targetProfile || user;
      localStorage.setItem('indogold_user', JSON.stringify(activeProfile));
      localStorage.setItem('nusantaragold_user', JSON.stringify(activeProfile));
      localStorage.setItem('indogold_authenticated', 'true');
      localStorage.setItem('nusantaragold_authenticated', 'true');
      localStorage.setItem('indogold_last_email', email);
      localStorage.setItem('nusantaragold_last_email', email);

      showToast(`Selamat datang kembali di NusantaraGold, ${name || activeProfile.name}!`);
    }

    setIsAuthenticated(true);
    localStorage.setItem('indogold_authenticated', 'true');
    localStorage.setItem('nusantaragold_authenticated', 'true');
    setShowAuthModal(false);
    setCurrentTab('beranda');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthDefaultTab(tab);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Signout note:', e);
    }
    setFirebaseUser(null);
    setIsAuthenticated(false);
    localStorage.setItem('indogold_authenticated', 'false');
    localStorage.setItem('nusantaragold_authenticated', 'false');
    setAuthDefaultTab('login');
    setShowAuthModal(false);
    setActiveActionFlow(null);
    setActiveModal(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
    showToast('Anda telah keluar dari sesi. Silakan masuk kembali dengan email dan kata sandi Anda.');
  };

  // Dedicated Isolated Admin Portal (Accessible via /admin, ?admin=true, or secret shortcut)
  if (isStandaloneAdmin) {
    return (
      <StandaloneAdminPortal
        onBackToApp={() => {
          if (import.meta.env.VITE_STANDALONE_ADMIN_PORTAL === 'true') {
            const externalAppUrl = import.meta.env.VITE_INVESTOR_APP_URL;
            if (externalAppUrl) {
              window.location.href = externalAppUrl;
            } else {
              showToast('Ini adalah server web khusus portal administrator terpisah.');
            }
            return;
          }
          try {
            window.history.pushState({}, '', '/');
          } catch (_) {}
          setIsStandaloneAdmin(false);
          window.dispatchEvent(new CustomEvent(INDOGOLD_SYNC_EVENT, { detail: { type: 'admin_portal_exit' } }));
        }}
      />
    );
  }

  // If user is not authenticated (or after logout), show the full-screen Registration/Login view directly
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F0E0D] text-[#F7F5F2] font-sans selection:bg-[#4A3C13] selection:text-[#D4AF37]">
        <AuthScreen
          key={`auth-full-${authDefaultTab}`}
          isModal={false}
          defaultTab={authDefaultTab}
          onSuccess={handleAuthSuccess}
        />
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] p-3.5 rounded-xl bg-[#1A1816] border border-[#D4AF37]/50 shadow-2xl flex items-center justify-between gap-3 text-xs text-[#F7F5F2] animate-bounce-short">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#8CEB9C] shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#9E978E] hover:text-[#F7F5F2]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0E0D] text-[#F7F5F2] flex flex-col font-sans selection:bg-[#4A3C13] selection:text-[#D4AF37]">
      {/* Sticky Glass Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenProfile={() => setActiveModal('profile')}
        onOpenNotifications={() => setShowNotifications(true)}
      />

      {/* Main Content Container with mobile-first maximum width */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 pb-20 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {/* Active Sub-flows: Trade (Buy/Sell) */}
          {activeActionFlow === 'trade' && (
            <motion.div
              key={`flow-trade-${tradeType}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <TradeScreen
                key={tradeType}
                user={user}
                initialType={tradeType}
                onCompleteTransaction={handleCompleteTransaction}
                onBack={() => setActiveActionFlow(null)}
              />
            </motion.div>
          )}

          {/* Active Sub-flows: Wallet (Deposit/Withdraw) */}
          {activeActionFlow === 'wallet' && (
            <motion.div
              key={`flow-wallet-${walletAction}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <WalletScreen
                key={walletAction}
                user={user}
                initialAction={walletAction}
                onCompleteTransaction={handleCompleteTransaction}
                onBack={() => setActiveActionFlow(null)}
                onShowToast={showToast}
                onUpdateUser={handleUpdateUser}
              />
            </motion.div>
          )}

          {/* 4 Main Bottom Tabs */}
          {!activeActionFlow && currentTab === 'beranda' && (
            <motion.div
              key="beranda"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <HomeScreen
                user={user}
                transactions={transactions}
                onSelectTransaction={(tx) => setSelectedReceiptTx(tx)}
                onNavigateTab={handleNavigate}
                onStartTrade={handleStartTrade}
                onStartWallet={handleStartWallet}
                onOpenArticles={() => setActiveModal('articles')}
                onOpenKyc={() => setActiveModal('kyc')}
                onOpenCertificate={(mode) => {
                  setCertModalMode(mode || 'sertifikat');
                  setActiveModal('certificate');
                }}
                onOpenProofTransfer={() => setActiveModal('proof_transfer')}
                onOpenPromoKit={() => setActiveModal('promo_kit')}
                onOpenTransferEmas={() => setActiveModal('transfer_emas')}
                onOpenEmiratesPackages={(tier) => {
                  if (tier) setSelectedEmiratesTier(tier);
                  setActiveModal('emirates_packages');
                }}
                onOpenHelp={() => setActiveModal('help')}
                onOpenNotifications={() => setShowNotifications(true)}
              />
            </motion.div>
          )}

          {!activeActionFlow && currentTab === 'portofolio' && (
            <motion.div
              key="paket-spesial"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <PaketSpesialScreen
                user={user}
                onActivatePackage={handleActivatePackage}
                onGoToDeposit={() => {
                  handleStartWallet('deposit');
                }}
                onOpenCertificate={(mode) => {
                  setCertModalMode(mode || 'sertifikat');
                  setActiveModal('certificate');
                }}
                onClaimDailyProfit={handleClaimDailyProfit}
                onStartTrade={handleStartTrade}
                onShowToast={showToast}
              />
            </motion.div>
          )}

          {!activeActionFlow && currentTab === 'riwayat' && (
            <motion.div
              key="riwayat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <HistoryScreen
                transactions={transactions}
                onSelectTransaction={(tx) => setSelectedReceiptTx(tx)}
                onNavigateTab={handleNavigate}
              />
            </motion.div>
          )}

          {!activeActionFlow && currentTab === 'akun' && (
            <motion.div
              key="akun"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <AccountScreen
                user={user}
                onUpdateUser={handleUpdateUser}
                onLogout={handleLogout}
                onOpenAuth={(tab) => handleOpenAuth(tab || 'register')}
                onOpenProfileModal={() => setActiveModal('profile')}
                onOpenPinModal={() => setActiveModal('pin')}
                onOpenCertModal={() => setActiveModal('certificate')}
                onOpenHelpModal={() => setActiveModal('help')}
                onOpenBankModal={() => setActiveModal('bank')}
                onOpenKycModal={() => setActiveModal('kyc')}
                onOpenProofTransfer={() => setActiveModal('proof_transfer')}
                onOpenPromoKit={() => setActiveModal('promo_kit')}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean regulatory copyright footer with completely hidden 5-tap backdoor */}
        <div className="mt-8 mb-4 text-center">
          <p
            onClick={() => {
              const win = window as any;
              win.__secret_admin_taps = (win.__secret_admin_taps || 0) + 1;
              if (win.__secret_admin_taps >= 5) {
                win.__secret_admin_taps = 0;
                try {
                  window.history.pushState({}, '', '/admin');
                } catch (_) {}
                setIsStandaloneAdmin(true);
              }
              setTimeout(() => {
                win.__secret_admin_taps = 0;
              }, 3000);
            }}
            className="text-[11px] text-[#6E675D] select-none tracking-wide cursor-default"
          >
            © 2026 PT NusantaraGold Indonesia • Berizin & Diawasi BAPPEBTI
          </p>
        </div>
      </main>

      {/* Sticky Bottom Tab Bar (4 Tabs: Beranda, Portofolio, Riwayat, Akun) */}
      <BottomTabBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setActiveActionFlow(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Active Feature Modals (Articles, Help, Pin, Certificate, Bank, KYC, Proof Transfer, Promo Kit, Transfer Emas, Emirates Packages) */}
      <ActiveModals
        activeModal={activeModal}
        certModalMode={certModalMode}
        initialPackageTier={selectedEmiratesTier}
        onClose={() => setActiveModal(null)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onShowToast={showToast}
        onSubmitProof={(tx) => handleCompleteTransaction(tx, user.balanceIdr, user.goldHoldingsGram)}
        onTransferEmas={(updated, newTx) => {
          handleUpdateUser(updated);
          setTransactions((prev) => [newTx, ...prev]);
          recordPlatformTransaction(newTx);
          const effectiveUid = firebaseUser?.uid || encodeChatId(extractCleanEmail(user.email) || 'guest');
          saveTransaction(effectiveUid, newTx, user.email, user.name);
        }}
        onStartTrade={handleStartTrade}
        onActivatePackage={handleActivatePackage}
        onGoToDeposit={() => {
          setActiveModal(null);
          handleStartWallet('deposit');
        }}
      />

      {/* Transaction Receipt Modal */}
      {selectedReceiptTx && (
        <TransactionReceiptModal
          transaction={selectedReceiptTx}
          userName={user.name}
          onClose={() => setSelectedReceiptTx(null)}
          onViewCertificate={(grams, brand) => {
            setSelectedReceiptTx(null);
            setActiveModal('certificate');
          }}
        />
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      )}

      {/* Auth Screen Modal */}
      {showAuthModal && (
        <AuthScreen
          key={`auth-modal-${authDefaultTab}`}
          isModal
          defaultTab={authDefaultTab}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] p-3.5 rounded-xl bg-[#1A1816] border border-[#D4AF37]/50 shadow-2xl flex items-center justify-between gap-3 text-xs text-[#F7F5F2] animate-bounce-short">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#8CEB9C] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#9E978E] hover:text-[#F7F5F2]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
