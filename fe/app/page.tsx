"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { Button } from "@/app/components/ui/button";

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
import { LuxuryReports } from "@/app/components/admin/LuxuryReports";

// Tenant Components
import { UserPlatform } from "@/app/components/tenant/dashboard/DashboardLayout";
import { Loader2 } from "lucide-react";

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

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    
    // FETCH STORED DATA FIRST
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode;
    const storedUserCheckRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as "admin" | "tenant" | "guest";
    
    // If user has token, force them to their dashboard unless they are explicitly admin
    if (storedToken) {
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
  if (!isClient || viewMode === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="size-20 bg-amber-500 rounded-2xl rotate-12 absolute blur-2xl opacity-20 animate-pulse" />
          <div className="size-16 bg-white rounded-2xl flex items-center justify-center relative z-10 shadow-2xl">
            <span className="text-3xl font-bold text-slate-900">R</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-6 text-amber-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
            Rahmat ZAW
          </p>
        </div>
      </div>
    );
  }

  // Default Login Screen (User/Tenant)
  if (viewMode === "login") {
    return (
      <UserLogin
        onLoginSuccess={() => {
          setUserRole("tenant");
          setViewMode("tenant");
        }}
        onBack={() => setViewMode("home")}
        onRegisterClick={() => setViewMode("register")}
        onForgotPassword={() => setViewMode("forgot-password")}
      />
    );
  }

  // User Registration Screen
  if (viewMode === "register") {
    return (
      <UserRegister
        onRegisterSuccess={() => setViewMode("login")}
        onBackToLogin={() => setViewMode("login")}
      />
    );
  }

  // Forgot Password Screen
  if (viewMode === "forgot-password") {
    return (
      <ForgotPassword
        onBack={() => setViewMode("login")}
      />
    );
  }

  // Home Selection Screen - REMOVED NULL RETURN
  // Falls through to default return

  // Admin Portal
  if (viewMode === "admin" || userRole === "admin") {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <AdminSidebar
          currentPage={adminPage}
          onNavigate={(page) => setAdminPage(page as AdminPage)}
        />
        <div className="flex-1 overflow-auto">
          <div className="p-4 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between">
            <Button variant="outline" onClick={() => setViewMode("home")}>
              Kembali ke Beranda
            </Button>
            <Button
              variant="outline"
              onClick={() => setViewMode("tenant")}
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
            >
              Beralih ke Tampilan Pengguna
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearStoredState();
                setUserRole(null);
                setAdminPage("dashboard");
                setViewMode("login");
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Keluar
            </Button>
          </div>
          {adminPage === "dashboard" && <LuxuryDashboard />}
          {adminPage === "gallery" && <GalleryData />}
          {adminPage === "rooms" && <LuxuryRoomManagement />}
          {adminPage === "tenants" && <TenantData />}
          {adminPage === "payments" && <LuxuryPaymentConfirmation />}
          {adminPage === "reports" && <LuxuryReports />}
        </div>
      </div>
    );
  }

  // Tenant Portal
  if (viewMode === "tenant") {
    return <UserPlatform onLogout={() => {
        clearStoredState();
        setUserRole(null);
        setViewMode("login");
    }} />;
  }

  // Default: Tenant/Guest Portal
  return (
    <UserPlatform
      onLogout={() => {
        clearStoredState();
        setUserRole(null);
        setViewMode("login");
      }}
    />
  );
}
