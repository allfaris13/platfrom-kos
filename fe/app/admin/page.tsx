"use client";

import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { LuxuryDashboard } from "@/app/components/admin/LuxuryDashboard";
import { LuxuryReports } from "@/app/components/admin/LuxuryReports";
import { LuxuryRoomManagement } from "@/app/components/admin/LuxuryRoomManagement";
import { TenantData } from "@/app/components/admin/TenantData";
import { LuxuryPaymentConfirmation } from "@/app/components/admin/LuxuryPaymentConfirmation";
import { GalleryData } from "@/app/components/admin/GalleryData";
import { AdminLogin } from "@/app/components/shared/AdminLogin";
import { api } from "@/app/services/api";
import { Button } from "@/app/components/ui/button";
import { LanguageSwitcher } from "@/app/components/shared/LanguageSwitcher";
import { ThemeToggle } from "@/app/components/shared/ThemeToggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    
    const checkAdminAuth = async () => {
      try {
        // 1. Broadly check for the possibility of a session (including cookies)
        const likelyAuthenticated = !!localStorage.getItem('token') || !!sessionStorage.getItem('token') || document.cookie.includes('access_token') || !!localStorage.getItem('user');
        
        if (!likelyAuthenticated) {
          setIsAdminAuthenticated(false);
          return;
        }

        // 2. Verify with Backend (Source of Truth)
        const profile = await api.getProfile();
        if (profile && profile.user && profile.user.role === 'admin') {
          setIsAdminAuthenticated(true);
          // Sync local storage with latest backend data
          localStorage.setItem('user', JSON.stringify(profile.user));
        } else {
          setIsAdminAuthenticated(false);
        }
      } catch (e) {
        console.error("Admin verification failed:", e);
        setIsAdminAuthenticated(false);
      }
    };

    checkAdminAuth();
  }, []);

  if (!isMounted) return null;

  if (!isAdminAuthenticated) {
    return (
      <AdminLogin
        onLoginSuccess={() => setIsAdminAuthenticated(true)}
        onBack={() => window.location.href = '/'}
      />
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <LuxuryDashboard key="dashboard" />;
      case "rooms":
        return <LuxuryRoomManagement key="rooms" />;
      case "tenants":
        return <TenantData key="tenants" />;
      case "payments":
        return <LuxuryPaymentConfirmation key="payments" />;
      case "reports":
        return <LuxuryReports key="reports" />;
      case "gallery":
        return <GalleryData key="gallery" />;
      default:
        return <LuxuryDashboard key="default" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden font-['Poppins'] transition-colors duration-300">
      <AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Subtle Decorative Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -z-10" />

        <header className="sticky top-0 z-20 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline font-medium">Back to Site</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 hidden sm:block" />
            <h2 className="text-slate-500 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] hidden md:block">
              Control Panel / <span className="text-slate-900 dark:text-slate-300">{currentPage}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1" />

            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-slate-900 dark:text-white text-xs font-bold leading-tight">Administrator</span>
              <span className="text-emerald-500 text-[10px] font-medium flex items-center gap-1">
                <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAdminAuthenticated(false);
              }}
              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 dark:border-red-500/30 rounded-xl px-4 py-2 font-bold text-[10px] transition-all"
            >
              Logout
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 1.01 }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
