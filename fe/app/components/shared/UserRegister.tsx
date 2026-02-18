"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { UserPlus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/app/services/api";
import { ImageWithFallback } from "./ImageWithFallback";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface UserRegisterProps {
  onRegisterSuccess: () => void;
  onBackToLogin: () => void;
}

export function UserRegister({
  onRegisterSuccess,
  onBackToLogin,
}: UserRegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [nik, setNik] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const t = useTranslations('auth');
  const tc = useTranslations('common');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await api.register({ username, password, email, nomor_hp: phone, alamat_asal: address, tanggal_lahir: birthdate, nik, role: "tenant" });
      toast.success(t('accountCreatedToast'), {
        description: t('accountCreatedToastDesc'),
        duration: 5000,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('registrationFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-slate-100"
        >
          <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {t('accountCreated')}
          </h2>
          <p className="text-slate-600 mb-8">
            {t('redirectingToLogin')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white overflow-auto md:overflow-hidden">
      <div className="flex-shrink-0 md:w-1/2 lg:w-[55%] relative overflow-hidden bg-stone-900 min-h-[400px] md:min-h-0">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000"
            alt="Registration Background"
            className="w-full h-full object-cover opacity-50"
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
              <UserPlus className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 leading-tight tracking-tight">
              {t('startJourney')} <span className="text-amber-400">{t('startJourneyHighlight')}</span>
            </h1>

            <p className="text-lg md:text-xl text-stone-300 font-medium leading-relaxed max-w-lg mx-auto mb-6 md:mb-10 opacity-90">
              {t('registerSubtitle')}
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
                <p className="text-xl md:text-2xl font-bold text-white">4.9/5</p>
                <p className="text-stone-400 text-[10px] md:text-sm uppercase tracking-wider font-semibold">
                  {t('userRating')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-stone-900 text-lg md:text-xl">R</span>
          </div>
          <span className="text-white font-bold text-base md:text-lg tracking-tight">Rahmat ZAW</span>
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
            onClick={onBackToLogin}
            className="mb-10 p-0 hover:bg-transparent text-slate-500 hover:text-stone-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {tc('backToLogin')}
          </Button>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-stone-900 tracking-tight mb-3">
              {t('register')}
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              {t('registerFormSubtitle')}
            </p>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="username">{t('chooseUsername')}</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ex: arkan_tenant" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="email">{t('emailAddress')}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="nik">{t('nik')}</Label>
              <Input id="nik" value={nik} onChange={(e) => setNik(e.target.value)} placeholder={t('nikPlaceholder')} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="phone">{t('phoneNumber')}</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="address">{t('homeAddress')}</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Jl. Example No. 123, City" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="birthdate">{t('birthDate')}</Label>
              <Input id="birthdate" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="mt-1" required />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-stone-900 hover:bg-stone-800 text-white h-11 font-semibold mt-6">
              {isLoading ? t('creatingAccount') : t('registerButton')}
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-600">
            {t('hasAccount')}{" "}
            <button onClick={onBackToLogin} className="text-amber-600 font-semibold hover:underline">
              {t('loginHere')}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
