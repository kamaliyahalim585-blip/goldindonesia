import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomTabBar } from './components/BottomTabBar';
import { HomeScreen } from './components/screens/HomeScreen';
import { PortfolioScreen } from './components/screens/PortfolioScreen';
import { TradeScreen } from './components/screens/TradeScreen';
import { WalletScreen } from './components/screens/WalletScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { AccountScreen } from './components/screens/AccountScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { TransactionReceiptModal } from './components/TransactionReceiptModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ActiveModals, ActiveModalType } from './components/ActiveModals';
import { InstallPromptBanner } from './components/InstallPromptBanner';
import { INITIAL_USER, INITIAL_TRANSACTIONS } from './data/mockData';
import { ScreenTab, TradeType, WalletActionType, Transaction, UserAccount } from './types';
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
  subscribeToUserTransactions 
} from './services/databaseService';
import { 
  saveRegisteredAccountRecord, 
  findRegisteredAccount 
} from './services/authStorage';

export default function App() {
  const [user, setUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('indogold_user');
    if (saved) {
      try {
        return JSON.parse(saved);
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
        return JSON.parse(saved);
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
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('register');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('indogold_authenticated');
    return saved === 'true';
  });
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Validate Firestore Connection on initial boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setIsAuthenticated(true);
        localStorage.setItem('indogold_authenticated', 'true');
        try {
          const profile = await syncUserProfile(fbUser);
          setUser(profile);
        } catch (err) {
          console.warn('Sync profile fallback:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync when authenticated
  useEffect(() => {
    if (!firebaseUser?.uid) return;

    const unsubProfile = subscribeToUserProfile(firebaseUser.uid, (data) => {
      setUser((prev) => ({ ...prev, ...data }));
    });

    const unsubTxs = subscribeToUserTransactions(firebaseUser.uid, (txs) => {
      if (txs && txs.length > 0) {
        setTransactions(txs);
      }
    });

    return () => {
      unsubProfile();
      unsubTxs();
    };
  }, [firebaseUser]);

  // Fallback sync to localStorage and local vault
  useEffect(() => {
    localStorage.setItem('indogold_user', JSON.stringify(user));
    if (user.email) {
      const existingAcc = findRegisteredAccount(user.email);
      if (existingAcc) {
        saveRegisteredAccountRecord({
          ...existingAcc,
          userProfile: user,
          transactions: transactions
        });
      }
    }
  }, [user, transactions]);

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
    setUser((prev) => ({
      ...prev,
      balanceIdr: newBalance,
      goldHoldingsGram: newGoldHoldings
    }));
    setTransactions((prev) => [tx, ...prev]);
    setSelectedReceiptTx(tx);
    setActiveActionFlow(null);

    // Save to Firestore if authenticated
    if (firebaseUser?.uid) {
      try {
        await saveUserProfile(firebaseUser.uid, {
          balanceIdr: newBalance,
          goldHoldingsGram: newGoldHoldings
        });
        await saveTransaction(firebaseUser.uid, tx);
      } catch (err) {
        console.warn('Firestore write warning (offline mode fallback):', err);
      }
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
      paymentMethod: 'IndoGold 3% Daily Yield Vault',
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
        paymentMethod: 'IndoGold Welcome Bonus',
        taxOrFee: 0,
        notes: 'Bonus saldo tunai pendaftaran akun baru IndoGold Luxe 24K'
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
          paymentMethod: 'IndoGold Referral Program',
          taxOrFee: 0,
          notes: `Hadiah bonus ekstra referral kode ${referralCodeUsed.trim().toUpperCase()}`
        };
        newTransactionsList.push(refTx);
      }
    }

    const currentFbUser = auth.currentUser;

    if (isNewRegistration) {
      const newUserProfile: UserAccount = {
        name,
        email,
        phone: phone || '+62 812-3456-7890',
        balanceIdr: bonusAmount,
        goldHoldingsGram: 0,
        dailyProfitEarnedTotal: 0,
        referralCode: `IG${Math.floor(100000 + Math.random() * 900000)}`,
        referralCount: 0,
        referralBonus: 0,
        isKycVerified: true,
        kycLevel: 'Level 1 (Terverifikasi Dasar)',
        biometricEnabled: true,
        signupBonusReceived: true,
        pinSet: true,
        pinCode: initialPin || '123456'
      };

      setUser(newUserProfile);
      setTransactions(newTransactionsList);

      // Save to local vault immediately so user can log back in anytime on this origin
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

      if (currentFbUser?.uid) {
        try {
          await saveUserProfile(currentFbUser.uid, newUserProfile);
          for (const tx of newTransactionsList) {
            await saveTransaction(currentFbUser.uid, tx);
          }
        } catch (err) {
          console.warn('Sync new user to Firestore note:', err);
        }
      }

      showToast(`Selamat datang ${name}! Saldo Anda telah terisi ${bonusDescriptions.join(' + ')} (Total Rp ${bonusAmount.toLocaleString('id-ID')})!`);
    } else {
      // Existing user login
      if (restoredProfile) {
        setUser(restoredProfile);
        if (restoredTransactions && restoredTransactions.length > 0) {
          setTransactions(restoredTransactions);
        }
      } else if (currentFbUser) {
        try {
          const synced = await syncUserProfile(currentFbUser, name, false, undefined);
          setUser(synced);
        } catch (err) {
          console.warn('Error syncing profile from auth success:', err);
        }
      } else {
        const found = findRegisteredAccount(email);
        if (found) {
          setUser(found.userProfile);
          if (found.transactions && found.transactions.length > 0) {
            setTransactions(found.transactions);
          }
        } else {
          setUser((prev) => ({
            ...prev,
            email,
            name: name || prev.name,
          }));
        }
      }
      showToast(`Selamat datang kembali di IndoGold, ${name}!`);
    }

    setIsAuthenticated(true);
    localStorage.setItem('indogold_authenticated', 'true');
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
    setAuthDefaultTab('register');
    setShowAuthModal(false);
    setActiveActionFlow(null);
    setActiveModal(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
    showToast('Anda telah keluar dari sesi. Silakan mendaftar akun baru (Bonus s.d Rp 30.000) atau masuk.');
  };

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
        {/* PWA Install Banner for Mobile & Desktop Home Screen Installation */}
        <InstallPromptBanner />

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
                onNavigateTab={handleNavigate}
                onStartTrade={handleStartTrade}
                onStartWallet={handleStartWallet}
                onOpenArticles={() => setActiveModal('articles')}
                onOpenKyc={() => setActiveModal('kyc')}
                onOpenCertificate={() => setActiveModal('certificate')}
                onOpenProofTransfer={() => setActiveModal('proof_transfer')}
              />
            </motion.div>
          )}

          {!activeActionFlow && currentTab === 'portofolio' && (
            <motion.div
              key="portofolio"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <PortfolioScreen
                user={user}
                onStartTrade={handleStartTrade}
                onClaimDailyProfit={handleClaimDailyProfit}
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
              />
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Active Feature Modals (Articles, Help, Pin, Certificate, Bank, KYC, Proof Transfer) */}
      <ActiveModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onShowToast={showToast}
        onSubmitProof={(tx, amount) => handleCompleteTransaction(tx, amount, 0)}
        onStartTrade={handleStartTrade}
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
