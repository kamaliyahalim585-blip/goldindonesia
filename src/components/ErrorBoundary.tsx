import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public declare props: Props;
  public declare state: State;
  public declare setState: (state: Partial<State> | ((prevState: State) => Partial<State>), callback?: () => void) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NusantaraGold ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Fix potential corrupted local storage keys if any
      const savedUser = localStorage.getItem('indogold_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (!parsed.name || typeof parsed.name !== 'string') {
            parsed.name = 'Investor NusantaraGold';
          }
          if (parsed.balanceIdr === undefined || isNaN(Number(parsed.balanceIdr))) {
            parsed.balanceIdr = 0;
          }
          if (parsed.goldHoldingsGram === undefined || isNaN(Number(parsed.goldHoldingsGram))) {
            parsed.goldHoldingsGram = 0;
          }
          localStorage.setItem('indogold_user', JSON.stringify(parsed));
        } catch (_) {}
      }
    } catch (_) {}

    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F0E0D] text-[#F7F5F2] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#161412] border border-[#3E3424] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center mx-auto text-amber-300">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <h2 className="font-serif text-xl font-bold text-[#F7F5F2]">
              Sinkronisasi Tampilan Diperbarui
            </h2>

            <p className="text-xs text-[#A0988C] leading-relaxed">
              Data transaksi atau saldo akun Anda berhasil diperbarui oleh server. Silakan klik tombol di bawah untuk menyegarkan tampilan aplikasi.
            </p>

            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              <span>Muat Ulang Tampilan</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
