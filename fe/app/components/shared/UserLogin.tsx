"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Home, ArrowLeft } from 'lucide-react';
import { api } from '@/app/services/api';
import { ImageWithFallback } from './ImageWithFallback';
import { GoogleButton } from '../tenant/GoogleButton';
import { IMAGES } from '@/app/services/image';

interface UserLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onRegisterClick: () => void;
  onForgotPassword: () => void;
}

function useCountUp(end: number, duration: number = 3500, delay: number = 800, decimals: number = 0) {
  const [display, setDisplay] = useState(decimals > 0 ? '0.' + '0'.repeat(decimals) : '0');
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const startAnimation = useCallback(() => {
    if (hasStarted) return;
    setHasStarted(true);

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo for a smooth deceleration
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentValue = eased * end;

      if (decimals > 0) {
        setDisplay(currentValue.toFixed(decimals));
      } else {
        setDisplay(Math.floor(currentValue).toLocaleString());
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(decimals > 0 ? end.toFixed(decimals) : end.toLocaleString());
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, hasStarted, decimals]);

  useEffect(() => {
    const timer = setTimeout(() => {
      startAnimation();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, startAnimation]);

  return { display, ref };
}

export function UserLogin({ onLoginSuccess, onBack, onRegisterClick, onForgotPassword }: UserLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { display: activeTenantsDisplay } = useCountUp(500, 3500, 1000);
  const { display: ratingDisplay } = useCountUp(4.9, 3500, 1200, 1);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.login({ username, password }, rememberMe);
      onLoginSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login gagal');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white overflow-auto md:overflow-hidden">
      {/* Left Side: Visual Feature Section */}
      <div className="flex-shrink-0 md:w-1/2 lg:w-[55%] relative overflow-hidden bg-stone-900 min-h-[400px] md:min-h-0">
        {/* Background Image with animated zoom effect */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <ImageWithFallback
            src={IMAGES.LOGIN_BG}
            alt="Premium Interior"
            className="w-full h-full object-cover opacity-50"
            priority
          />
          {/* Elegant Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 to-transparent" />
        </motion.div>

        {/* Content Container - Perfectly Centered */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-8 md:p-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-6 md:mb-10 rounded-2xl md:rounded-3xl bg-amber-400/20 backdrop-blur-md border border-amber-400/30 shadow-2xl shadow-amber-400/20">
              <Home className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 leading-tight tracking-tight">
              Selamat Datang <span className="text-amber-400">Kembali</span>
            </h1>

            <p className="text-lg md:text-xl text-stone-300 font-medium leading-relaxed max-w-lg mx-auto mb-6 md:mb-10 opacity-90">
              Akses dashboard premium Anda untuk mengelola pemesanan dan rasakan kenyamanan kelas dunia.
            </p>

            <div className="flex items-center justify-center gap-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <motion.p
                  className="text-xl md:text-2xl font-bold text-white tabular-nums"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  {activeTenantsDisplay}+
                </motion.p>
                <p className="text-stone-400 text-[10px] md:text-sm uppercase tracking-wider font-semibold">
                  Penyewa Aktif
                </p>
              </div>
              <div className="w-px h-8 md:h-10 bg-white/20" />
              <div className="text-center">
                <motion.p
                  className="text-xl md:text-2xl font-bold text-white tabular-nums"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  {ratingDisplay}/5
                </motion.p>
                <p className="text-stone-400 text-[10px] md:text-sm uppercase tracking-wider font-semibold">
                  Rating Pengguna
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Branding/Logo floating at top left */}
        <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-stone-900 text-lg md:text-xl">
              R
            </span>
          </div>
          <span className="text-white font-bold text-base md:text-lg tracking-tight">
            Rahmat ZAW
          </span>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 lg:w-[45%] items-center justify-center p-12 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-sm"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-10 p-0 hover:bg-transparent text-slate-500 hover:text-stone-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
          </Button>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-3">Login Penghuni</h2>
            <p className="text-slate-500 font-medium leading-relaxed">Masukkan kredensial Anda untuk mengakses portal.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-stone-900 focus:ring-stone-900"
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                >
                  Ingat saya
                </label>
              </div>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-medium text-amber-600 hover:underline"
              >
                Lupa password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white h-11 font-semibold mt-6"
            >
              {isLoading ? 'Sedang masuk...' : 'Masuk'}
            </Button>
          </form>

          <GoogleButton
            isLoading={isLoading}
            onSuccess={(data) => {
              // Standard behavior for Google Login is usually Session persistence or same as unchecked.
              // We'll treat it as session storage by default unless we add logic, but code assumes explicit choice.
              // Let's default Google Login to LocalStorage (Persistent) as is common for OAuth
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              onLoginSuccess();
            }}
          />

          <p className="mt-8 text-center text-slate-600">
            Belum punya akun?{' '}
            <button
              onClick={onRegisterClick}
              className="text-amber-600 font-semibold hover:underline"
            >
              Daftar di sini
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
