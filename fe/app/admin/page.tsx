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
import { useState } from "react";

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user && user.role === 'admin';
        } catch (e) {
          console.warn("Corrupted user data in localStorage, clearing...", e);
          localStorage.removeItem('user');
          return false;
        }
      }
    }
    return false;
  });

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
        return <LuxuryDashboard />;
      case "rooms":
        return <LuxuryRoomManagement />;
      case "tenants":
        return <TenantData />;
      case "payments":
        return <LuxuryPaymentConfirmation />;
      case "reports":
        return <LuxuryReports />;
      case "gallery":
        return <GalleryData />;
      default:
        return <LuxuryDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950">
          <Button variant="ghost" asChild className="text-slate-400 hover:text-white">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Site
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setIsAdminAuthenticated(false);
            }}
          >
            Logout
          </Button>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
