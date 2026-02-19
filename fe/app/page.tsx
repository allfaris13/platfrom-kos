"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { useTranslations } from "next-intl";

// Login Components
import { UserLogin } from "@/app/components/shared/UserLogin";
import { UserRegister } from "@/app/components/shared/UserRegister";
import { ForgotPassword } from "@/app/components/shared/ForgotPassword";

// Admin Components
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { LuxuryDashboard } from "@/app/components/admin/LuxuryDashboard";
import { GalleryData } from "@/app/components/admin/GalleryData";
import { LuxuryRoomManagement } from "@/app/components/admin/LuxuryRoomManagement";
import { TenantData } from "@/app/components/admin/TenantData";
import { LuxuryPaymentConfirmation } from "@/app/components/admin/LuxuryPaymentConfirmation";
// import { LuxuryReports } from "@/app/components/admin/LuxuryReports";
import dynamic from "next/dynamic";

const LuxuryReports = dynamic(
  () => import("@/app/components/admin/LuxuryReports").then((mod) => mod.LuxuryReports),
  { ssr: false }
);

// Tenant Components
import { UserPlatform } from "@/app/components/tenant/dashboard/DashboardLayout";
import { Loader2, LogOut } from "lucide-react";

type ViewMode = "login" | "register" | "forgot-password" | "home" | "admin" | "tenant";
type AdminPage =
  | "dashboard"
  | "gallery"
  | "rooms"
  | "tenants"
  | "payments"
  | "reports";

// Storage keys
const STORAGE_KEYS = {
  VIEW_MODE: "app_view_mode",
  ADMIN_PAGE: "app_admin_page",
  USER_ROLE: "app_user_role",
};

export default function App() {
  // Initialize with null/placeholder to prevent rendering wrong page before hydration
  const [viewMode, setViewMode] = useState<ViewMode | null>(null);
  const [adminPage, setAdminPage] = useState<AdminPage>("dashboard");
  const [userRole, setUserRole] = useState<"admin" | "tenant" | "guest" | null>(
    null,
  );
  const [isClient, setIsClient] = useState(false);
  const t = useTranslations('common');

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    
    // FETCH STORED DATA FIRST
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUserStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    const isAuthenticated = !!storedToken || !!storedUserStr; // Support both checks
    
    const storedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode;
    const storedUserCheckRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as "admin" | "tenant" | "guest";
    
    // If user is authenticated, force them to their dashboard unless they are explicitly admin
    if (isAuthenticated) {
        if (storedUserCheckRole === 'admin') {
           // Admin logic
           if (storedViewMode === 'login' || storedViewMode === 'register' || storedViewMode === 'forgot-password') {
               setViewMode('admin');
           } else {
               setViewMode(storedViewMode || 'admin');
           }
        } else {
           // For tenant/users
           if (storedViewMode === 'login' || storedViewMode === 'register' || storedViewMode === 'forgot-password' || !storedViewMode) {
               setViewMode('tenant');
               setUserRole('tenant');
           } else {
               setViewMode(storedViewMode);
               if (storedUserCheckRole) setUserRole(storedUserCheckRole);
           }
        }
    } else {
        // No token, respect stored view or default to home
        setViewMode(storedViewMode || "home");
        // Also restore user role if checking logic falls through but we have one stored (edge case)
        if (storedUserCheckRole) setUserRole(storedUserCheckRole);
    }

    const storedAdminPage = localStorage.getItem(
      STORAGE_KEYS.ADMIN_PAGE,
    ) as AdminPage;
    if (storedAdminPage) setAdminPage(storedAdminPage);

    // Role is handled above with token check slightly, but let's keep this for non-token cases or consistency
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isClient || !viewMode) return;
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.ADMIN_PAGE, adminPage);
  }, [adminPage, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (userRole) {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, userRole);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    }
  }, [userRole, isClient]);

  // Function to clear all stored state (for logout)
  const clearStoredState = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('token'); // Also clear token
    localStorage.removeItem('user');
  };

  // 0. Loading/Splash Screen - PREVENTS FLICKER
  // MUST BE AFTER ALL HOOKS
  // 0. Loading/Splash Screen - PREMIUM ENHANCEMENT
  if (!isClient || viewMode === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 overflow-hidden relative">
        {/* Abstract Background Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="size-24 bg-gradient-to-tr from-amber-500 to-orange-400 rounded-3xl rotate-12 absolute blur-2xl opacity-40 animate-pulse" />
          <div className="size-20 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(245,158,11,0.3)] border border-white/20">
            <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">R</span>
          </div>
        </motion.div>
        
        <div className="flex flex-col items-center gap-4 z-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <Loader2 className="size-4 text-amber-500 animate-spin" />
            <p className="text-slate-300 text-[10px] font-medium tracking-[0.3em] uppercase">
                {t('initializingPlatform')}
            </p>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-xs font-light"
          >
            {t('premiumExperience')}
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="min-h-screen"
      >
        {/* Default Login Screen (User/Tenant) */}
        {viewMode === "login" && (
          <UserLogin
            onLoginSuccess={(user) => {
              if (user?.user?.role === 'admin') {
                  setUserRole("admin");
                  setViewMode("admin");
              } else {
                  setUserRole("tenant");
                  setViewMode("tenant");
              }
            }}
            onBack={() => setViewMode("home")}
            onRegisterClick={() => setViewMode("register")}
            onForgotPassword={() => setViewMode("forgot-password")}
          />
        )}

        {/* User Registration Screen */}
        {viewMode === "register" && (
          <UserRegister
            onRegisterSuccess={() => setViewMode("login")}
            onBackToLogin={() => setViewMode("login")}
          />
        )}

        {/* Forgot Password Screen */}
        {viewMode === "forgot-password" && (
          <ForgotPassword
            onBack={() => setViewMode("login")}
          />
        )}

        {/* Admin Portal */}
        {(viewMode === "admin" || userRole === "admin") && (
          <div className="flex h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <AdminSidebar
              currentPage={adminPage}
              onNavigate={(page) => setAdminPage(page as AdminPage)}
            />
            <div className="flex-1 overflow-auto">
              <div className="sticky top-0 z-10 p-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => setViewMode("home")} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        {t('backToHome')}
                    </Button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("tenant")}
                    className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-500"
                    >
                    {t('switchToTenantView')}
                    </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearStoredState();
                    setUserRole(null);
                    setAdminPage("dashboard");
                    setViewMode("login");
                  }}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 font-medium"
                >
                  <LogOut className="size-4 mr-2" />
                  {t('signOut')}
                </Button>
              </div>
              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={adminPage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {adminPage === "dashboard" && <LuxuryDashboard />}
                    {adminPage === "gallery" && <GalleryData />}
                    {adminPage === "rooms" && <LuxuryRoomManagement />}
                    {adminPage === "tenants" && <TenantData />}
                    {adminPage === "payments" && <LuxuryPaymentConfirmation />}
                    {adminPage === "reports" && <LuxuryReports />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Tenant/Default Portal */}
        {(viewMode === "tenant" || viewMode === "home" || (!viewMode && isClient)) && (
            <UserPlatform 
                onLogout={() => {
                    clearStoredState();
                    setUserRole(null);
                    setViewMode("login");
                }}
                onBackToAdmin={() => setViewMode("admin")}
            />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
