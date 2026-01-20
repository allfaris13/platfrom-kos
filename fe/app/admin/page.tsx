"use client";

import { useState } from "react";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminDashboard } from "@/app/components/admin/AdminDashboard";
import { FinancialReports } from "@/app/components/admin/FinancialReports";
import { RoomManagement } from "@/app/components/admin/RoomManagement";
import { TenantData } from "@/app/components/admin/TenantData";
import { PaymentConfirmation } from "@/app/components/admin/PaymentConfirmation";
import { GalleryData } from "@/app/components/admin/GalleryData";

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard />;
      case "rooms":
        return <RoomManagement />;
      case "tenants":
        return <TenantData />;
      case "payments":
        return <PaymentConfirmation />;
      case "reports":
        return <FinancialReports />;
      case "gallery":
        return <GalleryData />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      <AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  );
}
