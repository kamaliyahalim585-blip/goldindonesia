import React, { useState, useEffect, useCallback } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  X, 
  Delete, 
  Fingerprint, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface PinVerificationModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  expectedPin?: string;
  biometricEnabled?: boolean;
  onSuccess: () => void;
  onClose: () => void;
  onForgotPin?: () => void;
}

export const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  isOpen,
  title = 'Verifikasi PIN Keamanan',
  subtitle = 'Masukkan 6 digit PIN transaksi Anda untuk mengonfirmasi tindakan ini.',
  expectedPin = '123456',
  biometricEnabled = true,
  onSuccess,
  onClose,
  onForgotPin
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setShake(false);
      setIsSuccess(false);
      setIsVerifying(false);
    }
  }, [isOpen]);

  const handleVerify = useCallback((enteredPin: string) => {
    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      // Compare against expected PIN (or default '123456' if not set)
      const targetPin = expectedPin && expectedPin.length === 6 ? expectedPin : '123456';
      
      if (enteredPin === targetPin) {
        setIsSuccess(true);
        setIsVerifying(false);
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setIsVerifying(false);
        setShake(true);
        const remaining = attemptsLeft - 1;
        setAttemptsLeft(remaining);
        setPin('');

        if (remaining <= 0) {
          setError('Anda telah 3 kali salah memasukkan PIN. Akun diamankan sementara.');
        } else {
          setError(`PIN salah! Sisa percobaan: ${remaining} kali. (Default: ${targetPin})`);
        }

        setTimeout(() => setShake(false), 600);
      }
    }, 350);
  }, [expectedPin, attemptsLeft, onSuccess]);

  const handleKeyPress = useCallback((digit: string) => {
    if (isVerifying || isSuccess || attemptsLeft <= 0) return;
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 6) {
        handleVerify(nextPin);
      }
    }
  }, [pin, isVerifying, isSuccess, attemptsLeft, handleVerify]);

  const handleDelete = useCallback(() => {
    if (isVerifying || isSuccess || attemptsLeft <= 0) return;
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
      setError(null);
    }
  }, [pin, isVerifying, isSuccess, attemptsLeft]);

  // Physical keyboard listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyPress, handleDelete, onClose]);

  const handleBiometricAuth = () => {
    if (isVerifying || isSuccess) return;
    setIsVerifying(true);
    setError(null);

    // Simulate biometric authentication
    setTimeout(() => {
      setIsSuccess(true);
      setIsVerifying(false);
      setTimeout(() => {
        onSuccess();
      }, 500);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-sm bg-[#161412] border border-[#3E3524] rounded-3xl overflow-hidden shadow-2xl relative transition-transform ${
          shake ? 'animate-shake border-rose-500/80' : ''
        }`}
      >
        {/* Top Decorative Gold Bar */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#0F0E0D] border border-[#2E2820] flex items-center justify-center text-[#9E978E] hover:text-[#F7F5F2] hover:border-[#D4AF37]/50 transition cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Content */}
        <div className="pt-6 pb-2 px-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#4A3C13] via-[#2A2312] to-[#161412] border-2 border-[#D4AF37]/60 flex items-center justify-center text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)] mb-3">
            {isSuccess ? (
              <CheckCircle2 className="w-7 h-7 text-[#8CEB9C] animate-scale-up" />
            ) : (
              <Lock className="w-6 h-6 stroke-[2.3]" />
            )}
          </div>

          <h3 className="font-serif text-lg font-bold text-[#F7F5F2] tracking-tight">
            {isSuccess ? 'Verifikasi Berhasil' : title}
          </h3>
          <p className="text-xs text-[#A0988C] mt-1 px-1 leading-relaxed">
            {isSuccess ? 'Otorisasi keamanan berhasil diverifikasi.' : subtitle}
          </p>
        </div>

        {/* PIN Dots Indicator */}
        <div className="py-4 px-6">
          <div className="flex items-center justify-center gap-3.5 my-2">
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = index < pin.length;
              const isCurrent = index === pin.length && !isSuccess;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 flex items-center justify-center ${
                    isSuccess
                      ? 'bg-[#8CEB9C] shadow-[0_0_12px_rgba(140,235,156,0.6)] scale-110'
                      : isFilled
                      ? 'bg-gradient-to-b from-[#F3E5AB] to-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)] scale-110'
                      : isCurrent
                      ? 'border-2 border-[#D4AF37] bg-[#2A2312] animate-pulse'
                      : 'border border-[#4A4033] bg-[#0F0E0D]'
                  }`}
                >
                  {showNumbers && isFilled && (
                    <span className="text-[9px] font-bold text-slate-950 font-mono">
                      {pin[index]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Peek numbers toggle */}
          <div className="flex items-center justify-center mt-2">
            <button
              type="button"
              onClick={() => setShowNumbers(!showNumbers)}
              className="flex items-center gap-1.5 text-[10px] text-[#8C857B] hover:text-[#D4AF37] transition cursor-pointer"
            >
              {showNumbers ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showNumbers ? 'Sembunyikan Angka' : 'Tampilkan Angka'}</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs flex items-center justify-center gap-2 animate-fade-in text-center">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              <span className="leading-tight text-[11px]">{error}</span>
            </div>
          )}

          {/* Verifying Spinner */}
          {isVerifying && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#D4AF37] mt-2 animate-pulse">
              <div className="w-3 h-3 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              <span>Memverifikasi enkripsi PIN...</span>
            </div>
          )}
        </div>

        {/* Numeric Keypad (Luxury Tactile Grid) */}
        <div className="p-5 pt-2 bg-[#12100E] border-t border-[#26211B]">
          <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                disabled={isVerifying || isSuccess || attemptsLeft <= 0}
                onClick={() => handleKeyPress(num)}
                className="h-12 rounded-2xl bg-[#1D1914] border border-[#382F24] hover:bg-[#2A2318] hover:border-[#D4AF37]/50 active:scale-95 text-lg font-mono font-bold text-[#F7F5F2] hover:text-[#D4AF37] transition-all flex items-center justify-center shadow-sm disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {num}
              </button>
            ))}

            {/* Bottom Row: Biometric or Empty, 0, Backspace */}
            {biometricEnabled ? (
              <button
                type="button"
                disabled={isVerifying || isSuccess || attemptsLeft <= 0}
                onClick={handleBiometricAuth}
                title="Verifikasi dengan Biometrik (Face ID / Sidik Jari)"
                className="h-12 rounded-2xl bg-[#1D1914] border border-sky-500/40 hover:bg-sky-950/40 hover:border-sky-400 active:scale-95 text-sky-400 transition-all flex items-center justify-center shadow-sm disabled:opacity-40 disabled:pointer-events-none cursor-pointer group"
              >
                <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={isVerifying || isSuccess || attemptsLeft <= 0}
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-2xl bg-[#1D1914] border border-[#382F24] hover:bg-[#2A2318] hover:border-[#D4AF37]/50 active:scale-95 text-lg font-mono font-bold text-[#F7F5F2] hover:text-[#D4AF37] transition-all flex items-center justify-center shadow-sm disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              0
            </button>

            <button
              type="button"
              disabled={isVerifying || isSuccess || attemptsLeft <= 0 || pin.length === 0}
              onClick={handleDelete}
              title="Hapus Digit"
              className="h-12 rounded-2xl bg-[#1D1914] border border-[#382F24] hover:bg-[#2A2318] hover:border-rose-400/50 active:scale-95 text-[#A0988C] hover:text-rose-400 transition-all flex items-center justify-center shadow-sm disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Footer Security Note & Forgot PIN */}
          <div className="mt-4 pt-3 border-t border-[#221D17] flex items-center justify-between text-[11px] text-[#8C857B] px-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Terenkripsi SHA-256</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onForgotPin) onForgotPin();
                else alert(`PIN Default untuk pengujian adalah 123456. Anda dapat mengubahnya di Menu Akun > PIN Transaksi.`);
              }}
              className="text-[#D4AF37] hover:underline cursor-pointer font-medium"
            >
              Lupa PIN?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
