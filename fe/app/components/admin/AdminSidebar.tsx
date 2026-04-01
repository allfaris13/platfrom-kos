'use client';

import { LayoutDashboard, Image as LucideImageIcon, Home, Users, CreditCard, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { ThemeToggleButton } from '@/app/components/ui/ThemeToggleButton';
import { LanguageSwitcher } from '@/app/components/shared/LanguageSwitcher';
import { useTranslations } from 'next-intl';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AdminSidebar({ currentPage, onNavigate }: AdminSidebarProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const t = useTranslations('admin');

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'rooms', label: t('rooms'), icon: Home },
    { id: 'tenants', label: t('tenants'), icon: Users },
    { id: 'payments', label: t('payments'), icon: CreditCard },
    { id: 'reports', label: t('reports'), icon: TrendingUp },
    { id: 'gallery', label: t('gallery'), icon: LucideImageIcon }
  ];



  const [user, setUser] = useState<{ username: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  // Helper to title case name if it's all lowercase or weirdly cased
  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside
        className="hidden lg:flex sticky top-0 h-screen w-72 flex-col transition-all duration-300 z-40 bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-800/50"
      >
        {/* Logo Area */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="size-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-200 overflow-hidden">
              <NextImage src="/logo.svg" alt="Rahmat ZAW Logo" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
                Rahmat ZAW
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">{t('premiumManagement')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-200 relative overflow-hidden
                  ${isActive
                    ? 'bg-gradient-to-r from-amber-500/15 to-amber-600/15 dark:from-amber-500/20 dark:to-amber-600/20 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/5 dark:shadow-amber-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600 rounded-r" />
                )}
                <Icon className={`size-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto size-2 bg-amber-500 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 space-y-3">
          <div className="flex justify-center gap-2">
            <LanguageSwitcher />
            <ThemeToggleButton />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50">
            <div className="size-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">
                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'AD'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.username ? formatName(user.username) : t('administrator')}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || 'admin@luxstay.id'}
              </p>
            </div>

          </div>
        </div>
      </aside>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-1 left-0 right-0 z-50 px-2 pb-2">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl flex justify-around items-center p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }
                `}
              >
                <Icon className={`size-6 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium transition-all duration-200">
                  {item.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
