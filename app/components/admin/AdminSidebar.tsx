'use client';

import { LayoutDashboard, ImageIcon, Home, Users, CreditCard, Menu, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggleButton } from '@/app/components/ui/ThemeToggleButton';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AdminSidebar({ currentPage, onNavigate }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'rooms', label: 'Data Kamar', icon: Home },
    { id: 'tenants', label: 'Data Penyewa', icon: Users },
    { id: 'payments', label: 'Pembayaran', icon: CreditCard },
    { id: 'reports', label: 'Laporan', icon: TrendingUp },
    { id: 'gallery', label: 'Galeri', icon: ImageIcon }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-slate-900 rounded-xl shadow-lg border border-slate-700"
      >
        {isOpen ? <X className="size-6 text-white" /> : <Menu className="size-6 text-white" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen
          w-72 flex flex-col transition-all duration-300 z-40
          bg-linear-to-b from-slate-950 via-slate-900 to-slate-950
          border-r border-slate-800/50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Area */}
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-12 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Home className="size-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-linear-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                LuxStay
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
                onClick={() => {
                  onNavigate(item.id);
                  setIsOpen(false);
                }}
                className={`
                  group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-200 relative overflow-hidden
                  ${isActive 
                    ? 'bg-linear-to-r from-amber-500/20 to-amber-600/20 text-amber-400 shadow-lg shadow-amber-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-amber-400 to-amber-600 rounded-r" />
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
          {/* Theme Toggle Button */}
          <div className="flex justify-center">
            <ThemeToggleButton />
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="size-11 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Administrator</p>
              <p className="text-xs text-slate-500 truncate">admin@luxstay.id</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}