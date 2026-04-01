import { motion } from 'framer-motion';
import { LogIn, LogOut, MessageCircle, Menu, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { Button } from '@/app/components/ui/button';
import { ThemeToggleButton } from '@/app/components/ui/ThemeToggleButton';
import { LanguageSwitcher } from '@/app/components/shared/LanguageSwitcher';
import { useTranslations } from 'next-intl';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  hidden?: boolean;
}

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isLoggedIn: boolean;
  onLogout?: () => void;
  menuItems: MenuItem[];
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Header({
  activeView,
  setActiveView,
  isLoggedIn,
  onLogout,
  menuItems,
  mobileMenuOpen,
  setMobileMenuOpen
}: HeaderProps) {
  const router = useRouter();
  const t = useTranslations('nav');
  const tc = useTranslations('common');

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-md hover:shadow-lg transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveView('home')}>
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-slate-200">
              <NextImage src="/logo.svg" alt="Rahmat ZAW Logo" width={44} height={44} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Rahmat ZAW</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">{t('malangPrimeStay')}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {menuItems.filter(item => !item.hidden).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeView === item.id
                    ? 'bg-gradient-to-r from-stone-700 to-stone-900 text-white shadow-lg'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {!isLoggedIn && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-stone-900 text-white hover:bg-stone-800 transition-all duration-200 ml-2 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>{tc('login')}</span>
              </motion.button>
            )}

            {/* Contact Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView('contact')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-200 ml-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('contactUs')}</span>
            </motion.button>

            {/* Logout Button */}
            {isLoggedIn && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all duration-200 ml-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </motion.button>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle Button */}
            <ThemeToggleButton />
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggleButton />
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
