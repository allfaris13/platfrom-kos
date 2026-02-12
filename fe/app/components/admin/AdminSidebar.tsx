'use client';

import { LayoutDashboard, Image as ImageIcon, Home, Users, CreditCard, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggleButton } from '@/app/components/ui/ThemeToggleButton';

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

  const menuItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'rooms', label: 'Data Kamar', icon: Home },
    { id: 'tenants', label: 'Data Penyewa', icon: Users },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard },
    { id: 'reports', label: 'Laporan', icon: TrendingUp },
    { id: 'gallery', label: 'Galeri', icon: ImageIcon }
  ];

  if (!isMounted) return null;

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside
        className="hidden lg:flex sticky top-0 h-screen w-72 flex-col transition-all duration-300 z-40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/50"
      >
        {/* Logo Area */}
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Home className="size-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Rahmat ZAW
              </h1>
              <p className="text-xs text-slate-500 font-medium">Premium Management</p>
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
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 shadow-lg shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
        <div className="p-4 border-t border-slate-800/50 space-y-3">
          <div className="flex justify-center">
            <ThemeToggleButton />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="size-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Administrator</p>
              <p className="text-xs text-slate-500 truncate">admin@luxstay.id</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-1 left-0 right-0 z-50 px-2 pb-2">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex justify-around items-center p-2">
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
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-500 hover:text-slate-300'
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
