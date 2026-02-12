"use client";

import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { LuxuryDashboard } from "@/app/components/admin/LuxuryDashboard";
import { LuxuryReports } from "@/app/components/admin/LuxuryReports";
import { LuxuryRoomManagement } from "@/app/components/admin/LuxuryRoomManagement";
import { TenantData } from "@/app/components/admin/TenantData";
import { LuxuryPaymentConfirmation } from "@/app/components/admin/LuxuryPaymentConfirmation";
import { GalleryData } from "@/app/components/admin/GalleryData";
import { AdminLogin } from "@/app/components/shared/AdminLogin";
import { Button } from "@/app/components/ui/button";
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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.role === 'admin') {
          setIsAdminAuthenticated(true);
        }
      } catch (e) {
        console.warn("Corrupted user data in localStorage, clearing...", e);
        localStorage.removeItem('user');
      }
    }
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
    <div className="flex h-screen bg-slate-950 overflow-hidden font-['Poppins']">
      <AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Subtle Decorative Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -z-10" />

        <header className="sticky top-0 z-20 p-4 border-b border-slate-900/50 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline font-medium">Back to Site</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <h2 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] hidden md:block">
              Control Panel / <span className="text-slate-300">{currentPage}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-white text-xs font-bold leading-tight">Administrator</span>
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
              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl px-4 py-2 font-bold text-[10px] transition-all"
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
