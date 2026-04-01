'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

type Locale = 'id' | 'en';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'id',
  setLocale: () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

// Import messages statically to avoid dynamic import issues with Next.js
import idMessages from '@/messages/id.json';
import enMessages from '@/messages/en.json';

const messagesMap: Record<Locale, typeof idMessages> = {
  id: idMessages,
  en: enMessages,
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('id');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('app_locale') as Locale | null;
    if (stored && (stored === 'id' || stored === 'en')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(() => stored);
    }
    setIsHydrated(() => true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app_locale', newLocale);
    // Update document lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  const messages = messagesMap[locale];

  // Prevent hydration mismatch by rendering with default locale until client hydrates
  if (!isHydrated) {
    return (
      <NextIntlClientProvider locale="id" messages={messagesMap['id']} timeZone="Asia/Jakarta">
        <LanguageContext.Provider value={{ locale: 'id', setLocale }}>
          {children}
        </LanguageContext.Provider>
      </NextIntlClientProvider>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Jakarta">
      <LanguageContext.Provider value={{ locale, setLocale }}>
        {children}
      </LanguageContext.Provider>
    </NextIntlClientProvider>
  );
}
