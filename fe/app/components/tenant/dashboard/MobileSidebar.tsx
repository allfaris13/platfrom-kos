import { motion, AnimatePresence } from 'framer-motion';
import { Home, LogIn, LogOut, MessageCircle, X, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  hidden?: boolean;
}

interface MobileSidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  menuItems: MenuItem[];
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export function MobileSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
  activeView,
  setActiveView,
  menuItems,
  isLoggedIn,
  onLogout
}: MobileSidebarProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed top-0 bottom-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-[70] shadow-2xl flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-br from-stone-900 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white uppercase tracking-tighter leading-none">Rahmat ZAW</h1>
                  <p className="text-[8px] text-slate-300 uppercase font-black mt-1">Prime Stay</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Menu */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
              {menuItems.filter(item => !item.hidden).map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-stone-800 to-stone-900 text-white shadow-xl shadow-stone-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-sm">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    setActiveView('contact');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${activeView === 'contact'
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40'
                    }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Hubungi Kami</span>
                </button>

                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      onLogout?.();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">Keluar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      router.push('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-white bg-stone-900 hover:bg-stone-800 shadow-lg shadow-stone-900/20"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="text-sm">Masuk</span>
                  </button>
                )}
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest font-bold">
                &copy; 2026 Rahmat ZAW
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
