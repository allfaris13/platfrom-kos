'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const t = useTranslations('language');

  const toggleLocale = () => {
    setLocale(locale === 'id' ? 'en' : 'id');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLocale}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 
        bg-slate-100 dark:bg-slate-900/80 text-amber-600 dark:text-amber-500 
        hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 
        border border-slate-200 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-500/50 ${className}`}
      title={t('switchTo')}
    >
      <Globe className="w-4 h-4" />
      <span>{locale === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
    </motion.button>
  );
}
