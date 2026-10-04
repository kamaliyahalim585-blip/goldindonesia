import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  Send, 
  Eye, 
  AlertCircle,
  PlusCircle,
  Edit3,
  Sliders,
  DollarSign,
  UserCheck,
  Key,
  Shield,
  FileCheck,
  Check,
  X
} from 'lucide-react';
import { Transaction, UserAccount, ChatSession, ChatMessage } from '../../types';
import { 
  getAllPlatformTransactions, 
  approveWithdrawal, 
  rejectWithdrawal, 
  approveDeposit, 
  rejectDeposit, 
  manualAdjustUserPortfolio, 
  getAllChatSessions, 
  sendAdminChatMessage, 
  markChatAsReadByAdmin, 
  getAllUsersList, 
  updateUserKycStatus, 
  updateUserRole, 
  resetUserPin, 
  getGoldPriceConfig, 
  setGoldPriceConfig, 
  resetGoldPriceToDefault,
  subscribeToPlatformTransactions,
  fetchPlatformTransactionsFromFirestore,
  subscribeToChatSessions,
  subscribeToUsersList,
  subscribeToGoldPrice,
  syncFirestoreChatSessionsToLocal,
  syncFirestoreTransactionsToLocal,
  reconcileAllPlatformActivities
} from '../../services/adminService';
import { RegisteredAccountRecord, createAdminAccount } from '../../services/authStorage';
import { formatIDR } from '../../data/mockData';

export interface AdminScreenProps {
  currentAdmin: UserAccount;
  onExitAdmin: () => void;
  onShowToast: (msg: string) => void;
  externalActiveTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
}

export type AdminTab = 'withdrawals' | 'deposits' | 'chat' | 'users' | 'price' | 'overview';

export const AdminScreen: React.FC<AdminScreenProps> = ({
  currentAdmin,
  onExitAdmin,
  onShowToast,
  externalActiveTab,
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(externalActiveTab || 'withdrawals');

  useEffect(() => {
    if (externalActiveTab && externalActiveTab !== activeTab) {
      setActiveTab(externalActiveTab);
    }
  }, [externalActiveTab]);

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chatSessions, setChatSessions] = useState<Record<string, ChatSession>>({});
  const [selectedChatEmail, setSelectedChatEmail] = useState<string>('');
  const [chatInputText, setChatInputText] = useState<string>('');
  const [usersList, setUsersList] = useState<RegisteredAccountRecord[]>([]);
  const [priceConfig, setPriceConfigState] = useState(getGoldPriceConfig());
  const [newBuyPrice, setNewBuyPrice] = useState(priceConfig.buyPrice.toString());
  const [newSellPrice, setNewSellPrice] = useState(priceConfig.sellPrice.toString());

  // Filter & Search states
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [userSearch, setUserSearch] = useState('');

  // Modals inside admin
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTargetEmail, setAdjustTargetEmail] = useState('');
  const [adjustAmountIdr, setAdjustAmountIdr] = useState('');
  const [adjustGoldGrams, setAdjustGoldGrams] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Create New Admin Account Modal
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [adminNewName, setAdminNewName] = useState('');
  const [adminNewEmail, setAdminNewEmail] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminNewPin, setAdminNewPin] = useState('123456');
  const [adminNewPhone, setAdminNewPhone] = useState('+62 812-');
  const [adminNewRoleTitle, setAdminNewRoleTitle] = useState('Super Administrator Master');

  // Reject prompt modal
  const [rejectModalTx, setRejectModalTx] = useState<Transaction | null>(null);
  const [rejectReason, setRejectReason] = useState('Data penerima tidak sesuai verifikasi KTP');

  // Preview Proof Slip modal
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);

  // Load all platform data from local storage and remote Firestore
  const loadData = async () => {
    // 1. Immediate local load
    const txs = getAllPlatformTransactions();
    setTransactions(txs);

    const sessions = getAllChatSessions();
    setChatSessions(sessions);
    if (!selectedChatEmail || !sessions[selectedChatEmail]) {
      const sorted = Object.values(sessions).sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
      setSelectedChatEmail(sorted[0]?.userEmail || '');
    }

    const users = getAllUsersList();
    setUsersList(users);

    const price = getGoldPriceConfig();
    setPriceConfigState(price);
    setNewBuyPrice(price.buyPrice.toString());
    setNewSellPrice(price.sellPrice.toString());

    // 2. Direct Firestore sync to ensure freshly registered or submitted transactions are caught immediately
    try {
      const remoteTxs = await fetchPlatformTransactionsFromFirestore();
      if (remoteTxs && remoteTxs.length > 0) {
        const merged = syncFirestoreTransactionsToLocal(remoteTxs);
        setTransactions(merged);
      }
    } catch (err) {
      console.warn('loadData Firestore fetch notice:', err);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const reconcileRes = await reconcileAllPlatformActivities();
      await loadData();
      onShowToast(reconcileRes.message || 'Semua aktivitas aplikasi & saldo pengguna berhasil disinkronkan!');
    } catch (_) {
      await loadData();
      onShowToast('Sinkronisasi selesai.');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    loadData();

    // Attach real-time cloud listeners with Firestore
    const unsubTxs = subscribeToPlatformTransactions((liveTxs) => {
      if (liveTxs && liveTxs.length > 0) {
        const merged = syncFirestoreTransactionsToLocal(liveTxs);
        setTransactions(merged);
      }
    });

    const unsubChats = subscribeToChatSessions((liveSessions) => {
      if (liveSessions && Object.keys(liveSessions).length > 0) {
        const merged = syncFirestoreChatSessionsToLocal(liveSessions);
        setChatSessions(merged);
        setSelectedChatEmail((prev) => {
          if (prev && merged[prev]) return prev;
          const sorted = Object.values(merged).sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
          return sorted[0]?.userEmail || '';
        });
      }
    });

    const unsubUsers = subscribeToUsersList((liveUsers) => {
      if (liveUsers && liveUsers.length > 0) {
        setUsersList(liveUsers);
      }
    });

    const unsubPrice = subscribeToGoldPrice((price) => {
      if (price) {
        setPriceConfigState(price);
      }
    });

    const interval = setInterval(loadData, 4000);

    return () => {
      clearInterval(interval);
      if (typeof unsubTxs === 'function') unsubTxs();
      if (typeof unsubChats === 'function') unsubChats();
      if (typeof unsubUsers === 'function') unsubUsers();
      if (typeof unsubPrice === 'function') unsubPrice();
    };
  }, []);

  // Summary Metrics calculations with flexible category and status matching
  const pendingWithdrawals = transactions.filter((t) => {
    const isWd = t.category === 'tarik' || t.category === 'withdraw' || (t.title && t.title.toLowerCase().includes('tarik'));
    const isPending = (t.status || '').toLowerCase() === 'pending';
    return isWd && isPending;
  });

  const pendingDeposits = transactions.filter((t) => {
    const isDep = t.category === 'deposit' || t.category === 'setor' || (t.title && t.title.toLowerCase().includes('deposit'));
    const isPending = (t.status || '').toLowerCase() === 'pending';
    return isDep && isPending;
  });
  const totalPendingWithdrawalIdr = pendingWithdrawals.reduce((sum, t) => sum + t.amountIdr, 0);
  const totalPendingDepositIdr = pendingDeposits.reduce((sum, t) => sum + t.amountIdr, 0);
  
  const sessionList = (Object.values(chatSessions) as ChatSession[]).sort((a, b) => {
    if ((b.unreadByAdmin || 0) !== (a.unreadByAdmin || 0)) {
      return (b.unreadByAdmin || 0) - (a.unreadByAdmin || 0);
    }
    return (b.lastUpdated || 0) - (a.lastUpdated || 0);
  });
  const totalPlatformBalance = usersList.reduce((sum, u) => sum + (u.userProfile?.balanceIdr || 0), 0);
  const totalPlatformGold = usersList.reduce((sum, u) => sum + (u.userProfile?.goldHoldingsGram || 0), 0);
  const unreadChatCount: number = sessionList.reduce((sum, s) => sum + (s.unreadByAdmin || 0), 0);

  // 1. Handle Approve Withdrawal
  const handleApproveWithdrawal = async (txId: string) => {
    const res = await approveWithdrawal(txId);
    if (res.success) {
      onShowToast(res.message);
      loadData();
    } else {
      onShowToast(res.message);
    }
  };

  // 2. Handle Confirm Reject
  const handleConfirmReject = async () => {
    if (!rejectModalTx) return;
    if (rejectModalTx.category === 'tarik') {
      const res = await rejectWithdrawal(rejectModalTx.id, rejectReason);
      onShowToast(res.message);
    } else if (rejectModalTx.category === 'deposit') {
      const res = await rejectDeposit(rejectModalTx.id, rejectReason);
      onShowToast(res.message);
    }
    setRejectModalTx(null);
    setRejectReason('Data tidak valid / belum masuk mutasi');
    loadData();
  };

  // 3. Handle Approve Deposit
  const handleApproveDeposit = async (txId: string) => {
    const res = await approveDeposit(txId);
    if (res.success) {
      onShowToast(res.message);
      loadData();
    } else {
      onShowToast(res.message);
    }
  };

  // 4. Handle Admin Chat Reply
  const handleSendAdminReply = (presetText?: string) => {
    const text = presetText || chatInputText.trim();
    if (!text || !selectedChatEmail) return;

    sendAdminChatMessage(
      selectedChatEmail,
      'Admin Super NusantaraGold',
      text
    );
    setChatInputText('');
    loadData();
    onShowToast(`Pesan berhasil dikirim ke ${selectedChatEmail}`);
  };

  // 5. Handle Adjust Balance/Gold
  const handleSubmitAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetEmail) return;

    const idrNum = parseInt(adjustAmountIdr || '0', 10);
    const goldNum = parseFloat(adjustGoldGrams || '0');

    const res = await manualAdjustUserPortfolio(
      adjustTargetEmail,
      idrNum,
      goldNum,
      adjustNotes || 'Penyesuaian Saldo oleh Super Admin'
    );

    onShowToast(res.message);
    setShowAdjustModal(false);
    setAdjustAmountIdr('');
    setAdjustGoldGrams('');
    setAdjustNotes('');
    loadData();
  };

  // 6. Handle Gold Price Save
  const handleSavePrice = () => {
    const buy = parseInt(newBuyPrice.replace(/[^0-9]/g, ''), 10);
    const sell = parseInt(newSellPrice.replace(/[^0-9]/g, ''), 10);
    if (!buy || !sell) {
      onShowToast('Nominal harga beli dan jual harus valid!');
      return;
    }
    setGoldPriceConfig(buy, sell, currentAdmin.email);
    onShowToast(`Harga emas diperbarui: Beli ${formatIDR(buy)}, Jual ${formatIDR(sell)}`);
    loadData();
  };

  const handleResetPrice = () => {
    resetGoldPriceToDefault();
    onShowToast('Harga emas dikembalikan ke standar pasar Antam LBMA');
    loadData();
  };

  // Filtered transactions for Withdrawals tab
  const withdrawalList = transactions.filter((t) => {
    const isWd = t.category === 'tarik' || t.category === 'withdraw' || (t.title && t.title.toLowerCase().includes('tarik'));
    const matchesFilter = txStatusFilter === 'all' || (t.status || '').toLowerCase() === txStatusFilter.toLowerCase();
    const searchLower = txSearch.trim().toLowerCase();
    const matchesSearch = !searchLower ||
      t.id.toLowerCase().includes(searchLower) ||
      (t.recipientName && t.recipientName.toLowerCase().includes(searchLower)) ||
      (t.senderAccount && t.senderAccount.toLowerCase().includes(searchLower)) ||
      (t.senderName && t.senderName.toLowerCase().includes(searchLower)) ||
      (t.notes && t.notes.toLowerCase().includes(searchLower)) ||
      t.title.toLowerCase().includes(searchLower);
    return isWd && matchesFilter && matchesSearch;
  });

  // Filtered transactions for Deposits tab
  const depositList = transactions.filter((t) => {
    const isDep = t.category === 'deposit' || t.category === 'setor' || (t.title && t.title.toLowerCase().includes('deposit'));
    const matchesFilter = txStatusFilter === 'all' || (t.status || '').toLowerCase() === txStatusFilter.toLowerCase();
    const searchLower = txSearch.trim().toLowerCase();
    const matchesSearch = !searchLower ||
      t.id.toLowerCase().includes(searchLower) ||
      (t.senderName && t.senderName.toLowerCase().includes(searchLower)) ||
      (t.senderAccount && t.senderAccount.toLowerCase().includes(searchLower)) ||
      (t.recipientName && t.recipientName.toLowerCase().includes(searchLower)) ||
      (t.notes && t.notes.toLowerCase().includes(searchLower)) ||
      t.title.toLowerCase().includes(searchLower);
    return isDep && matchesFilter && matchesSearch;
  });

  // Active chat session
  const activeSession = chatSessions[selectedChatEmail];

  return (
    <div className="min-h-screen pb-32 text-left bg-[#0A0908] text-[#F7F5F2] font-sans animate-fade-in">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#141210]/95 backdrop-blur-xl border-b border-[#D4AF37]/40 shadow-xl px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24201A] border border-[#3E3424] text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/15 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke App</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                <Shield className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-serif text-base font-bold text-amber-300">Pusat Kontrol Super Admin</h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300">
                    Master Access
                  </span>
                </div>
                <p className="text-[11px] text-[#A0988C]">
                  Logged in: <strong className="text-[#F7F5F2]">{currentAdmin.name}</strong> ({currentAdmin.email})
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F1C18] border border-[#3E3424] text-xs text-[#C2BCB3] hover:text-amber-400 transition cursor-pointer disabled:opacity-50"
              title="Refresh Data Cloud & Realtime"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Sinkronisasi...' : 'Sinkronkan Cloud'}</span>
            </button>

            <button
              onClick={() => {
                setAdjustTargetEmail(usersList[0]?.email || '');
                setShowAdjustModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 hover:scale-[1.02] transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Koreksi Saldo Manual</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-6xl mx-auto mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => handleSelectTab('withdrawals')}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-[#1C1A16] text-[#A0988C] hover:text-[#F7F5F2]'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Kontrol Penarikan</span>
            {pendingWithdrawals.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectTab('deposits')}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'deposits'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-[#1C1A16] text-[#A0988C] hover:text-[#F7F5F2]'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Kontrol Deposit</span>
            {pendingDeposits.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                {pendingDeposits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectTab('chat')}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-[#1C1A16] text-[#A0988C] hover:text-[#F7F5F2]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Chat CS Desk</span>
            {unreadChatCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold animate-pulse">
                {unreadChatCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectTab('users')}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-[#1C1A16] text-[#A0988C] hover:text-[#F7F5F2]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelola Investor ({usersList.length})</span>
          </button>

          <button
            onClick={() => handleSelectTab('price')}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'price'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-[#1C1A16] text-[#A0988C] hover:text-[#F7F5F2]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Kontrol Harga Emas</span>
          </button>

          <button
            onClick={() => handleSelectTab('overview')}
            className={`px-3 py-2 rounded-xl font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-[#1C1A16] text-[#A0988C] hover:text-[#F7F5F2]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Ringkasan Metrik</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* KPI Quick Metrics Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1C1914] to-[#12100E] border border-amber-500/25 shadow-md">
            <span className="text-[11px] text-[#A0988C] flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />
              <span>Pending Penarikan (WD)</span>
            </span>
            <div className="text-lg font-bold text-red-400 mt-1">
              {pendingWithdrawals.length} Permohonan
            </div>
            <p className="text-[11px] text-[#E0D8CC] font-mono mt-0.5">{formatIDR(totalPendingWithdrawalIdr)}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1C1914] to-[#12100E] border border-amber-500/25 shadow-md">
            <span className="text-[11px] text-[#A0988C] flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Deposit Masuk</span>
            </span>
            <div className="text-lg font-bold text-amber-400 mt-1">
              {pendingDeposits.length} Verifikasi
            </div>
            <p className="text-[11px] text-[#E0D8CC] font-mono mt-0.5">{formatIDR(totalPendingDepositIdr)}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1C1914] to-[#12100E] border border-amber-500/25 shadow-md">
            <span className="text-[11px] text-[#A0988C] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Total Investor Terdaftar</span>
            </span>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              {usersList.length} Akun
            </div>
            <p className="text-[11px] text-[#E0D8CC] font-mono mt-0.5">Total Emas: {totalPlatformGold.toFixed(2)} gr</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1C1914] to-[#12100E] border border-amber-500/25 shadow-md">
            <span className="text-[11px] text-[#A0988C] flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Chat Aktif</span>
            </span>
            <div className="text-lg font-bold text-cyan-400 mt-1">
              {Object.keys(chatSessions).length} Percakapan
            </div>
            <p className="text-[11px] text-[#E0D8CC] font-mono mt-0.5">
              {unreadChatCount > 0 ? `${unreadChatCount} pesan belum dibalas` : 'Semua tiket terjawab'}
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: KONTROL PENARIKAN (WITHDRAWALS) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161412] p-4 rounded-2xl border border-[#2E2820]">
              <div>
                <h2 className="font-serif text-lg font-bold text-amber-300">Daftar Permohonan Penarikan Saldo (WD)</h2>
                <p className="text-xs text-[#A0988C]">
                  Admin dapat menyetujui transfer instan atau menolak dan mengembalikan saldo kas ke pengguna.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A0988C]" />
                  <input
                    type="text"
                    placeholder="Cari ID/Nama/Rek..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-xs text-[#F7F5F2] focus:border-amber-400 outline-none w-44"
                  />
                </div>

                <select
                  value={txStatusFilter}
                  onChange={(e: any) => setTxStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-xs text-[#F7F5F2] outline-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="Pending">Menunggu Verifikasi (Pending)</option>
                  <option value="Approved">Disetujui (Approved)</option>
                  <option value="Rejected">Ditolak (Rejected)</option>
                </select>
              </div>
            </div>

            {withdrawalList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#141210] border border-[#2E2820] text-[#A0988C]">
                <Clock className="w-8 h-8 mx-auto mb-2 text-amber-400 opacity-60" />
                <p className="text-sm">Tidak ada transaksi penarikan yang cocok dengan filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawalList.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-[#161412] border border-[#2E2820] hover:border-amber-400/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-400">#{tx.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'Approved'
                            ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                            : tx.status === 'Pending'
                            ? 'bg-amber-950 border border-amber-500/50 text-amber-300 animate-pulse'
                            : 'bg-red-950 border border-red-500/50 text-red-300'
                        }`}>
                          {tx.status}
                        </span>
                        <span className="text-xs text-[#A0988C]">{tx.date}</span>
                      </div>

                      <h3 className="font-bold text-sm text-[#F7F5F2]">{tx.title}</h3>

                      <div className="text-xs text-[#C2BCB3] space-y-0.5">
                        <p>
                          Penerima: <strong className="text-amber-200">{tx.recipientName || 'Investor'}</strong> • Rekening: <span className="font-mono">{tx.paymentMethod}</span>
                        </p>
                        <p className="text-[#A0988C]">
                          Email Pengguna: <span className="text-[#F7F5F2]">{tx.senderAccount || 'Akun Investor'}</span>
                        </p>
                        {tx.notes && (
                          <p className="text-[11px] text-[#A0988C] italic">Catatan: {tx.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#A0988C]">Nominal Pencairan:</span>
                        <div className="text-lg font-bold font-mono text-red-400">
                          -{formatIDR(tx.amountIdr)}
                        </div>
                      </div>

                      {/* Action buttons if Pending */}
                      {tx.status === 'Pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveWithdrawal(tx.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Setujui & Transfer</span>
                          </button>

                          <button
                            onClick={() => setRejectModalTx(tx)}
                            className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 hover:bg-red-900 text-red-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Tolak & Refund</span>
                          </button>
                        </div>
                      )}

                      {tx.status === 'Approved' && (
                        <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Dana Telah Ditransfer</span>
                        </div>
                      )}

                      {tx.status === 'Rejected' && (
                        <div className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                          <XCircle className="w-4 h-4" />
                          <span>Ditolak (Saldo Direfund)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: KONTROL DEPOSIT & BUKTI TRANSFER */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161412] p-4 rounded-2xl border border-[#2E2820]">
              <div>
                <h2 className="font-serif text-lg font-bold text-amber-300">Daftar Pengajuan Deposit & Bukti Transfer</h2>
                <p className="text-xs text-[#A0988C]">
                  Verifikasi setoran bank & bukti transfer manual. Begitu disetujui, saldo otomatis masuk ke dompet user.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A0988C]" />
                  <input
                    type="text"
                    placeholder="Cari ID/Nama/Akun..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-xs text-[#F7F5F2] focus:border-amber-400 outline-none w-44"
                  />
                </div>

                <select
                  value={txStatusFilter}
                  onChange={(e: any) => setTxStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-xs text-[#F7F5F2] outline-none cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="Pending">Menunggu Verifikasi (Pending)</option>
                  <option value="Approved">Disetujui (Approved)</option>
                  <option value="Rejected">Ditolak (Rejected)</option>
                </select>
              </div>
            </div>

            {depositList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#141210] border border-[#2E2820] text-[#A0988C]">
                <Clock className="w-8 h-8 mx-auto mb-2 text-amber-400 opacity-60" />
                <p className="text-sm">Tidak ada transaksi deposit yang cocok dengan filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {depositList.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-[#161412] border border-[#2E2820] hover:border-amber-400/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-amber-400">#{tx.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'Approved'
                            ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                            : tx.status === 'Pending'
                            ? 'bg-amber-950 border border-amber-500/50 text-amber-300 animate-pulse'
                            : 'bg-red-950 border border-red-500/50 text-red-300'
                        }`}>
                          {tx.status}
                        </span>
                        <span className="text-xs text-[#A0988C]">{tx.date}</span>
                      </div>

                      <h3 className="font-bold text-sm text-[#F7F5F2]">{tx.title}</h3>

                      <div className="text-xs text-[#C2BCB3] space-y-0.5">
                        <p>
                          Pengirim: <strong className="text-amber-200">{tx.senderName || tx.senderAccount || 'Investor'}</strong> • Metode: <span>{tx.paymentMethod}</span>
                        </p>
                        <p className="text-[#A0988C]">
                          Email: <span className="text-[#F7F5F2]">{tx.senderAccount || '-'}</span>
                        </p>
                        {tx.notes && (
                          <p className="text-[11px] text-[#A0988C] italic">Keterangan: {tx.notes}</p>
                        )}
                      </div>

                      {/* Bukti Transfer Button if present */}
                      {tx.proofImage && (
                        <button
                          onClick={() => setPreviewProofUrl(tx.proofImage || null)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer mt-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Slip Bukti Transfer</span>
                        </button>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#A0988C]">Nominal Deposit:</span>
                        <div className="text-lg font-bold font-mono text-emerald-400">
                          +{formatIDR(tx.amountIdr)}
                        </div>
                      </div>

                      {/* Action buttons if Pending */}
                      {tx.status === 'Pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveDeposit(tx.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Verifikasi & Tambah Saldo</span>
                          </button>

                          <button
                            onClick={() => setRejectModalTx(tx)}
                            className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 hover:bg-red-900 text-red-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Tolak Bukti</span>
                          </button>
                        </div>
                      )}

                      {tx.status === 'Approved' && (
                        <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Saldo Telah Ditambahkan</span>
                        </div>
                      )}

                      {tx.status === 'Rejected' && (
                        <div className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                          <XCircle className="w-4 h-4" />
                          <span>Deposit Ditolak</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: LIVE CHAT CUSTOMER SERVICE DESK */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[650px] bg-[#141210] rounded-2xl border border-[#2E2820] overflow-hidden shadow-2xl">
            {/* Left Column: Chat Sessions List */}
            <div className="border-b md:border-b-0 md:border-r border-[#2E2820] flex flex-col bg-[#110F0D]">
              <div className="p-3.5 border-b border-[#2E2820] bg-[#191714]">
                <h3 className="font-serif text-sm font-bold text-amber-300">Antrian Chat Investor</h3>
                <p className="text-[11px] text-[#A0988C]">Pilih percakapan untuk membalas secara real-time</p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#221E19]">
                {sessionList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#A0988C]">Belum ada sesi obrolan aktif.</div>
                ) : (
                  sessionList.map((s) => {
                    const isSelected = s.userEmail === selectedChatEmail;
                    const lastMsg = s.messages[s.messages.length - 1];
                    return (
                      <div
                        key={s.userEmail}
                        onClick={() => {
                          setSelectedChatEmail(s.userEmail);
                          markChatAsReadByAdmin(s.userEmail);
                        }}
                        className={`p-3.5 cursor-pointer transition flex items-start justify-between gap-2 ${
                          isSelected ? 'bg-amber-500/15 border-l-4 border-amber-400' : 'hover:bg-[#1A1815]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-[#F7F5F2] truncate">{s.userName}</span>
                            {s.unreadByAdmin > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold animate-pulse">
                                {s.unreadByAdmin} Baru
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#A0988C] truncate mt-0.5">
                            {lastMsg ? lastMsg.text : 'Memulai percakapan'}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-amber-300/80 font-mono mt-1">
                            <span>Emas: {s.userGoldHoldings.toFixed(2)} gr</span>
                            <span>•</span>
                            <span>{formatIDR(s.userBalanceIdr)}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-[#8C857B] shrink-0">
                          {lastMsg?.time || ''}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Chat Window */}
            <div className="md:col-span-2 flex flex-col bg-[#141210]">
              {activeSession ? (
                <>
                  {/* Chat Header */}
                  <div className="p-3.5 border-b border-[#2E2820] bg-[#1A1815] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-sm font-bold text-[#F7F5F2]">{activeSession.userName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                          Investor Aktif
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A0988C] mt-0.5">
                        Email: <strong className="text-amber-300">{activeSession.userEmail}</strong> • Saldo: {formatIDR(activeSession.userBalanceIdr)} • Emas: {activeSession.userGoldHoldings.toFixed(4)} gr
                      </p>
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-[#141210] to-[#0D0C0B]">
                    {activeSession.messages.map((m) => {
                      const isAdmin = m.sender === 'agent';
                      const isUser = m.sender === 'user';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#A0988C]">
                            <span>{isAdmin ? 'Admin Super NusantaraGold' : activeSession.userName}</span>
                            <span>•</span>
                            <span>{m.time}</span>
                          </div>
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-md ${
                              isAdmin
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-none'
                                : isUser
                                ? 'bg-[#221F1B] border border-[#3A3224] text-[#F7F5F2] rounded-tl-none'
                                : 'bg-[#1C1A17] border border-amber-500/20 text-amber-200'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Canned Replies for CS Admin */}
                  <div className="px-3.5 py-2 bg-[#191714] border-t border-[#2E2820] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
                    <span className="text-[#8C857B] font-bold text-[10px] shrink-0">Template Cepat:</span>
                    <button
                      onClick={() => handleSendAdminReply('Halo Kak, deposit Anda telah berhasil kami verifikasi dan saldo telah masuk ke dompet!')}
                      className="px-2.5 py-1 rounded-lg bg-[#24201A] hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-[#3E3424] transition shrink-0 cursor-pointer"
                    >
                      ✅ Deposit Berhasil Masuk
                    </button>
                    <button
                      onClick={() => handleSendAdminReply('Penarikan dana Anda telah berhasil diproses melalui jaringan BI-FAST dan terkirim ke rekening bank tujuan.')}
                      className="px-2.5 py-1 rounded-lg bg-[#24201A] hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-[#3E3424] transition shrink-0 cursor-pointer"
                    >
                      🚀 Penarikan Sukses Terkirim
                    </button>
                    <button
                      onClick={() => handleSendAdminReply('Mohon lampirkan foto KTP yang jelas dan selfie pada menu Verifikasi Akun untuk menyelesaikan KYC.')}
                      className="px-2.5 py-1 rounded-lg bg-[#24201A] hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-[#3E3424] transition shrink-0 cursor-pointer"
                    >
                      📑 Verifikasi KYC KTP
                    </button>
                  </div>

                  {/* Input form */}
                  <div className="p-3 bg-[#191714] border-t border-[#2E2820] flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ketik balasan resmi dari Admin NusantaraGold..."
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendAdminReply();
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-xs text-[#F7F5F2] outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => handleSendAdminReply()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Balasan</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-[#A0988C]">
                  Pilih salah satu sesi obrolan di sebelah kiri untuk melihat percakapan.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: KELOLA PENGGUNA & KYC */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161412] p-4 rounded-2xl border border-[#2E2820]">
              <div>
                <h2 className="font-serif text-lg font-bold text-amber-300">Daftar Pengguna & Investor Terdaftar</h2>
                <p className="text-xs text-[#A0988C]">
                  Daftar seluruh investor terdaftar, rincian saldo kas & emas, tanggal bergabung, status KYC, serta hak akses administrator.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/25 cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>Buat Akun Admin Baru</span>
                </button>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#A0988C]" />
                  <input
                    type="text"
                    placeholder="Cari nama / email pengguna..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-xs text-[#F7F5F2] focus:border-amber-400 outline-none w-56"
                  />
                </div>
              </div>
            </div>

            {/* Total Investor & Balance Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#161412] border border-[#2E2820]">
                <span className="text-[10px] uppercase font-bold text-[#8C857B] tracking-wider block">Total Pengguna Terdaftar</span>
                <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">
                  {usersList.length} Akun Investor
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">Database Aktif</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161412] border border-[#2E2820]">
                <span className="text-[10px] uppercase font-bold text-[#8C857B] tracking-wider block">Total Saldo Kas Investor</span>
                <span className="text-xl font-bold font-mono text-[#F7F5F2] mt-1 block">
                  {formatIDR(usersList.reduce((acc, u) => acc + (u.userProfile?.balanceIdr || 0), 0))}
                </span>
                <span className="text-[10px] text-[#A0988C]">Kustodi Kas Tunai</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161412] border border-[#2E2820]">
                <span className="text-[10px] uppercase font-bold text-[#8C857B] tracking-wider block">Total Cadangan Emas Fisik</span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                  {usersList.reduce((acc, u) => acc + (u.userProfile?.goldHoldingsGram || 0), 0).toFixed(4)} gr
                </span>
                <span className="text-[10px] text-[#A0988C]">Brankas Murni 24K</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161412] border border-[#2E2820]">
                <span className="text-[10px] uppercase font-bold text-[#8C857B] tracking-wider block">Status Verifikasi KYC</span>
                <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">
                  {usersList.filter((u) => u.userProfile?.isKycVerified).length} / {usersList.length}
                </span>
                <span className="text-[10px] text-[#8C857B]">Terverifikasi Dukcapil</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {usersList
                .filter((u) => 
                  u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(userSearch.toLowerCase())
                )
                .map((u) => {
                  const prof = u.userProfile;
                  const isAdminRole = 
                    prof?.role === 'admin' || 
                    u.email === 'admin@nusantaragold.id' || 
                    u.email === 'admin@indogold.id' || 
                    u.email === 'khoirulanisss@gmail.com' ||
                    u.email === 'kamaliyahalim585@gmail.com';

                  const regDateStr = u.updatedAt
                    ? new Date(u.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Terdaftar Resmi';

                  return (
                    <div
                      key={u.email}
                      className="p-4 rounded-2xl bg-[#161412] border border-[#2E2820] space-y-3 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[#F7F5F2]">{u.name}</h3>
                            {isAdminRole && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/60 text-amber-300 text-[10px] font-bold">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#A0988C] font-mono mt-0.5">{u.email}</p>
                          <div className="flex items-center gap-3 text-[11px] text-[#8C857B] mt-1">
                            <span>📞 {u.phone || '+62 8xx-xxxx-xxxx'}</span>
                            <span>•</span>
                            <span className="text-amber-400/80 font-medium">📅 Daftar: {regDateStr}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            prof?.isKycVerified
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          }`}>
                            {prof?.isKycVerified ? 'KYC Terverifikasi' : 'Pending KYC'}
                          </span>
                        </div>
                      </div>

                      {/* Portfolio balance numbers */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0F0E0D] border border-[#262018] text-xs">
                        <div>
                          <span className="text-[10px] text-[#A0988C]">Saldo Kas IDR:</span>
                          <p className="font-bold text-amber-300 font-mono text-sm">{formatIDR(prof?.balanceIdr || 0)}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#A0988C]">Simpanan Emas 24K:</span>
                          <p className="font-bold text-amber-300 font-mono text-sm">{(prof?.goldHoldingsGram || 0).toFixed(4)} gr</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1 text-xs flex-wrap">
                        {/* Toggle KYC */}
                        <button
                          onClick={() => {
                            const nextState = !prof?.isKycVerified;
                            updateUserKycStatus(u.email, nextState);
                            onShowToast(`Status KYC ${u.name} diubah ke ${nextState ? 'Terverifikasi' : 'Belum Verifikasi'}`);
                            loadData();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#24201A] border border-[#3E3424] hover:border-amber-400 text-xs text-[#C2BCB3] hover:text-amber-300 transition cursor-pointer flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{prof?.isKycVerified ? 'Batalkan KYC' : 'Setujui KYC'}</span>
                        </button>

                        {/* Reset PIN */}
                        <button
                          onClick={() => {
                            resetUserPin(u.email, '123456');
                            onShowToast(`PIN keamanan untuk ${u.name} berhasil direset ke [123456]`);
                            loadData();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#24201A] border border-[#3E3424] hover:border-amber-400 text-xs text-[#C2BCB3] hover:text-amber-300 transition cursor-pointer flex items-center gap-1"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Reset PIN (123456)</span>
                        </button>

                        {/* Promote / Demote Admin */}
                        <button
                          onClick={() => {
                            const nextRole = isAdminRole ? 'user' : 'admin';
                            updateUserRole(u.email, nextRole);
                            onShowToast(`Hak akses ${u.name} diubah menjadi [${nextRole === 'admin' ? 'Super Admin' : 'User Biasa'}]`);
                            loadData();
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1 ${
                            isAdminRole
                              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                              : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{isAdminRole ? 'Cabut Admin' : 'Jadikan Admin'}</span>
                        </button>

                        {/* Adjust Balance */}
                        <button
                          onClick={() => {
                            setAdjustTargetEmail(u.email);
                            setShowAdjustModal(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sesuaikan Saldo</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: KONTROL HARGA EMAS & PASAR */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'price' && (
          <div className="space-y-4 max-w-2xl">
            <div className="bg-[#161412] p-5 rounded-2xl border border-[#2E2820] space-y-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-amber-300">Kontrol Harga Emas Real-Time</h2>
                <p className="text-xs text-[#A0988C]">
                  Admin dapat mengubah harga beli dan jual emas fisik/digital secara live. Perubahan ini langsung diterapkan di seluruh aplikasi (Beranda, Kalkulator, dan Portofolio).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E0D8CC]">Harga Beli Emas Saat Ini (IDR / gr)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-amber-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={newBuyPrice}
                      onChange={(e) => setNewBuyPrice(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-sm text-[#F7F5F2] font-mono outline-none focus:border-amber-400"
                    />
                  </div>
                  <p className="text-[10px] text-[#A0988C]">Harga yang dibayar pengguna untuk membeli emas.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#E0D8CC]">Harga Jual / Buyback Emas (IDR / gr)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-amber-400 font-bold">Rp</span>
                    <input
                      type="number"
                      value={newSellPrice}
                      onChange={(e) => setNewSellPrice(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-sm text-[#F7F5F2] font-mono outline-none focus:border-amber-400"
                    />
                  </div>
                  <p className="text-[10px] text-[#A0988C]">Harga yang diterima pengguna saat menjual emas.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0F0E0D] border border-[#2E2820] text-xs text-[#A0988C] space-y-1">
                <p>Status Terakhir: <strong className="text-amber-300">{priceConfig.updatedBy}</strong></p>
                <p>Waktu Diperbarui: {new Date(priceConfig.updatedAt).toLocaleString('id-ID')}</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSavePrice}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] transition cursor-pointer"
                >
                  Terapkan Perubahan Harga
                </button>

                <button
                  onClick={handleResetPrice}
                  className="px-4 py-2.5 rounded-xl bg-[#24201A] border border-[#3A3224] text-xs text-[#C2BCB3] hover:text-amber-300 transition cursor-pointer"
                >
                  Kembalikan ke Standar Antam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 6: RINGKASAN METRIK SISTEM */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-[#161412] p-5 rounded-2xl border border-[#2E2820] space-y-4">
              <h2 className="font-serif text-lg font-bold text-amber-300">Ringkasan Operasional & Aset NusantaraGold</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#0F0E0D] border border-[#2E2820]">
                  <span className="text-[#A0988C]">Total Saldo Kas Likuid Investor</span>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">{formatIDR(totalPlatformBalance)}</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F0E0D] border border-[#2E2820]">
                  <span className="text-[#A0988C]">Total Cadangan Emas Fisik</span>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">{totalPlatformGold.toFixed(4)} Gram</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0F0E0D] border border-[#2E2820]">
                  <span className="text-[#A0988C]">Estimasi Total Nilai Aset (AUM)</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {formatIDR(totalPlatformBalance + Math.round(totalPlatformGold * priceConfig.buyPrice))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: MANUAL ADJUST BALANCE & GOLD */}
      {/* ------------------------------------------------------------- */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#161412] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E2820] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif text-base font-bold text-[#F7F5F2]">Koreksi Saldo Pengguna Manual</h3>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="w-7 h-7 rounded-full bg-[#24201A] text-[#A0988C] hover:text-[#F7F5F2] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjust} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[#A0988C] font-semibold">Pilih Akun Pengguna Target:</label>
                <select
                  value={adjustTargetEmail}
                  onChange={(e) => setAdjustTargetEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] outline-none"
                >
                  {usersList.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[#A0988C] font-semibold">
                  Penambahan/Pengurangan Saldo Kas IDR (Contoh: 500000 atau -100000):
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={adjustAmountIdr}
                  onChange={(e) => setAdjustAmountIdr(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A0988C] font-semibold">
                  Penambahan/Pengurangan Gram Emas (Contoh: 2.5 atau -1.0):
                </label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="0.0"
                  value={adjustGoldGrams}
                  onChange={(e) => setAdjustGoldGrams(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A0988C] font-semibold">Catatan Alasan Koreksi:</label>
                <input
                  type="text"
                  placeholder="Misal: Kompensasi bonus deposit / klaim promo"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#24201A] text-[#C2BCB3] hover:text-[#F7F5F2] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Simpan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: REJECT TRANSACTION WITH REASON */}
      {/* ------------------------------------------------------------- */}
      {rejectModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#161412] border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-serif text-base font-bold">
                Tolak Transaksi {rejectModalTx.category === 'tarik' ? 'Penarikan' : 'Deposit'} #{rejectModalTx.id}
              </h3>
            </div>

            <p className="text-xs text-[#A0988C]">
              {rejectModalTx.category === 'tarik' 
                ? 'Dana sebesar Rp ' + rejectModalTx.amountIdr.toLocaleString('id-ID') + ' akan otomatis dikembalikan ke saldo kas pengguna.'
                : 'Bukti transaksi akan ditandai ditolak dan pengguna akan diberi tahu.'}
            </p>

            <div className="space-y-1 text-xs">
              <label className="text-[#E0D8CC] font-semibold">Alasan Penolakan:</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] outline-none focus:border-red-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setRejectModalTx(null)}
                className="px-4 py-2 rounded-xl bg-[#24201A] text-[#C2BCB3] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PREVIEW PROOF IMAGE SLIP */}
      {/* ------------------------------------------------------------- */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="max-w-lg w-full bg-[#161412] border border-[#3A3224] rounded-2xl overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-sm font-bold text-amber-300">Slip Bukti Transfer Manual</h4>
              <button
                onClick={() => setPreviewProofUrl(null)}
                className="w-7 h-7 rounded-full bg-[#24201A] text-[#A0988C] hover:text-[#F7F5F2] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#2E2820] bg-black max-h-[70vh] flex items-center justify-center">
              <img
                src={previewProofUrl}
                alt="Bukti Transfer"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: BUAT AKUN ADMIN BARU */}
      {/* ------------------------------------------------------------- */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[#161412] border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E2820]">
              <div className="flex items-center gap-2 text-amber-300">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                <h3 className="font-serif text-base font-bold">
                  Buat Akun Administrator Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateAdminModal(false)}
                className="w-7 h-7 rounded-full bg-[#24201A] text-[#A0988C] hover:text-[#F7F5F2] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#A0988C]">
              Akun ini akan langsung memiliki akses ke Panel Kontrol Admin NusantaraGold untuk menyetujui penarikan, deposit, membalas chat pelanggan, dan mengatur saldo.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!adminNewEmail.trim() || !adminNewPassword.trim() || !adminNewName.trim()) {
                  onShowToast('Harap lengkapi nama, email, dan password admin.');
                  return;
                }
                createAdminAccount(
                  adminNewName,
                  adminNewEmail,
                  adminNewPassword,
                  adminNewPin || '123456',
                  adminNewPhone || '+62 812-8899-0000',
                  adminNewRoleTitle
                );
                onShowToast(`Akun Admin ${adminNewName} (${adminNewEmail}) berhasil dibuat!`);
                setShowCreateAdminModal(false);
                setAdminNewName('');
                setAdminNewEmail('');
                setAdminNewPassword('');
                loadData();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-[#E0D8CC] font-semibold block mb-1">Nama Lengkap Admin:</label>
                <input
                  type="text"
                  placeholder="Contoh: Admin Finance 01"
                  value={adminNewName}
                  onChange={(e) => setAdminNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[#E0D8CC] font-semibold block mb-1">Alamat Email Resmi Admin:</label>
                <input
                  type="email"
                  placeholder="admin.finance@nusantaragold.id"
                  value={adminNewEmail}
                  onChange={(e) => setAdminNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[#E0D8CC] font-semibold block mb-1">Kata Sandi (Password):</label>
                  <input
                    type="password"
                    placeholder="Min. 6 Karakter"
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-[#E0D8CC] font-semibold block mb-1">PIN Otorisasi (6 Digit):</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="123456"
                    value={adminNewPin}
                    onChange={(e) => setAdminNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] outline-none focus:border-amber-400 font-mono tracking-widest text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[#E0D8CC] font-semibold block mb-1">Nomor WhatsApp / Kontak:</label>
                <input
                  type="tel"
                  placeholder="+62 812-xxxx-xxxx"
                  value={adminNewPhone}
                  onChange={(e) => setAdminNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-[#F7F5F2] outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[#E0D8CC] font-semibold block mb-1">Tingkat Hak Akses (Role):</label>
                <select
                  value={adminNewRoleTitle}
                  onChange={(e) => setAdminNewRoleTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0E0D] border border-[#3A3224] text-amber-300 outline-none focus:border-amber-400"
                >
                  <option value="Super Administrator Master">Super Administrator Master (Akses Segala Fitur)</option>
                  <option value="Admin Customer Service & Chat">Admin Customer Service & Live Chat</option>
                  <option value="Admin Finance & Mutasi Bank">Admin Finance (Deposit & Penarikan)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2E2820]">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#24201A] text-[#C2BCB3] hover:text-[#F7F5F2] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:opacity-95 text-slate-950 font-bold shadow-lg shadow-amber-400/25 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Buat Akun Admin Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
