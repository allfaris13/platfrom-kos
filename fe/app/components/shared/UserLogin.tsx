"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Home, ArrowLeft } from 'lucide-react';
import { api, LoginResponse } from '@/app/services/api';
import { ImageWithFallback } from './ImageWithFallback';
import { GoogleButton } from './GoogleButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

interface UserLoginProps {
  onLoginSuccess: (user: LoginResponse) => void;
  onBack: () => void;
  onRegisterClick: () => void;
  onForgotPassword: () => void;
}

export function UserLogin({ onLoginSuccess, onBack, onRegisterClick, onForgotPassword }: UserLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('auth');
  const tc = useTranslations('common');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.login({ username, password });
      const loginData = response as unknown as LoginResponse;
      onLoginSuccess(loginData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('loginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white overflow-auto md:overflow-hidden">
      {/* Left Side: Visual Feature Section */}
      <div className="flex-shrink-0 md:w-1/2 lg:w-[55%] relative overflow-hidden bg-stone-900 min-h-[400px] md:min-h-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000"
            alt="Premium Interior"
            className="w-full h-full object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 to-transparent" />
        </motion.div>

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
              {t('welcomeBack')} <span className="text-amber-400">{t('welcomeBackHighlight')}</span>
            </h1>

            <p className="text-lg md:text-xl text-stone-300 font-medium leading-relaxed max-w-lg mx-auto mb-6 md:mb-10 opacity-90">
              {t('loginSubtitle')}
            </p>

            <div className="flex items-center justify-center gap-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-white">500+</p>
                <p className="text-stone-400 text-[10px] md:text-sm uppercase tracking-wider font-semibold">
                  {t('activeTenants')}
                </p>
              </div>
              <div className="w-px h-8 md:h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-white">
                  4.9/5
                </p>
                <p className="text-stone-400 text-[10px] md:text-sm uppercase tracking-wider font-semibold">
                  {t('userRating')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Branding */}
        <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-stone-900 text-lg md:text-xl">R</span>
          </div>
          <span className="text-white font-bold text-base md:text-lg tracking-tight">Rahmat ZAW</span>
        </div>

        {/* Language Switcher on visual side */}
        <div className="absolute top-6 right-6 md:top-12 md:right-12 z-20">
          <LanguageSwitcher className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
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
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> {tc('back')}
          </Button>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-3">{t('tenantLogin')}</h2>
            <p className="text-slate-500 font-medium leading-relaxed">{t('enterCredentials')}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">{t('username')}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('usernamePlaceholder')}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">{t('password')}</Label>
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
                  {t('rememberMe')}
                </label>
              </div>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-medium text-amber-600 hover:underline"
              >
                {t('forgotPassword')}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white h-11 font-semibold mt-6"
            >
              {isLoading ? t('loggingIn') : t('loginButton')}
            </Button>
          </form>

          <GoogleButton
            isLoading={isLoading}
            onSuccess={(data) => {
              const loginData = data as LoginResponse;
              if (loginData.user) {
                localStorage.setItem('user', JSON.stringify(loginData.user));
              }
              onLoginSuccess(loginData);
            }}
          />

          <p className="mt-8 text-center text-slate-600">
            {t('noAccount')}{' '}
            <button
              onClick={onRegisterClick}
              className="text-amber-600 font-semibold hover:underline"
            >
              {t('registerHere')}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
