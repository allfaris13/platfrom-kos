"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '@/app/services/api';
import { ImageWithFallback } from './ImageWithFallback';
import { useTranslations } from 'next-intl';

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = useTranslations('auth');
  const tc = useTranslations('common');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.forgotPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('failedToSend'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white overflow-auto md:overflow-hidden">
       <div className="flex-shrink-0 md:w-1/2 lg:w-[55%] relative overflow-hidden bg-stone-900 min-h-[400px] md:min-h-0 hidden md:block">
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
         </motion.div>
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
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> {tc('backToLogin')}
          </Button>

          {success ? (
              <div className="flex flex-col items-center text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                      <h2 className="text-3xl font-bold text-stone-900 mb-2">{t('checkEmail')}</h2>
                      <p className="text-slate-500">
                          {t('resetLinkSent')} <strong>{email}</strong>.
                      </p>
                  </div>
                  <Button
                    onClick={onBack}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white h-11 font-semibold"
                  >
                    {tc('backToLogin')}
                  </Button>
              </div>
          ) : (
              <>
                <div className="mb-10">
                    <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-3">{t('forgotPasswordTitle')}</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {t('forgotPasswordSubtitle')}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
                    {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                    <Label htmlFor="email">{t('emailLabel')}</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('emailPlaceholder')}
                        className="mt-1"
                        required
                    />
                    </div>

                    <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-stone-900 hover:bg-stone-800 text-white h-11 font-semibold mt-6"
                    >
                    {isLoading ? t('sending') : t('sendResetLink')}
                    </Button>
                </form>
              </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
