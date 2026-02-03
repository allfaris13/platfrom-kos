"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';

// Login Components
import { UserLogin } from '@/app/components/shared/UserLogin';
import { UserRegister } from '@/app/components/shared/UserRegister';

// Admin Components
import { AdminSidebar } from '@/app/components/admin/AdminSidebar';
import { LuxuryDashboard } from '@/app/components/admin/LuxuryDashboard';
import { GalleryData } from '@/app/components/admin/GalleryData';
import { LuxuryRoomManagement } from '@/app/components/admin/LuxuryRoomManagement';
import { TenantData } from '@/app/components/admin/TenantData';
import { LuxuryPaymentConfirmation } from '@/app/components/admin/LuxuryPaymentConfirmation';
import { LuxuryReports } from '@/app/components/admin/LuxuryReports';

// Tenant Components
import { UserPlatform } from '@/app/components/tenant/user-platform';

type ViewMode = 'login' | 'register' | 'home' | 'admin' | 'tenant';
type AdminPage = 'dashboard' | 'gallery' | 'rooms' | 'tenants' | 'payments' | 'reports';
type TenantPage = 'landing' | 'room-detail' | 'booking' | 'payment' | 'history';

// Storage keys
const STORAGE_KEYS = {
  VIEW_MODE: 'app_view_mode',
  ADMIN_PAGE: 'app_admin_page',
  TENANT_PAGE: 'app_tenant_page',
  SELECTED_ROOM_ID: 'app_selected_room_id',
  BOOKING_DATA: 'app_booking_data',
  USER_ROLE: 'app_user_role',
};

export default function App() {
  // Initialize with server-safe defaults to prevent hydration mismatch
  const [viewMode, setViewMode] = useState<ViewMode>('tenant');
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [tenantPage, setTenantPage] = useState<TenantPage>('landing');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<{ roomId: string; moveInDate: string; duration: string } | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'tenant' | 'guest' | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const init = () => {
      setIsClient(true);
      const storedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode;
      if (storedViewMode) setViewMode(storedViewMode);

      const storedAdminPage = localStorage.getItem(STORAGE_KEYS.ADMIN_PAGE) as AdminPage;
      if (storedAdminPage) setAdminPage(storedAdminPage);

      const storedTenantPage = localStorage.getItem(STORAGE_KEYS.TENANT_PAGE) as TenantPage;
      if (storedTenantPage) setTenantPage(storedTenantPage);

      const storedRoomId = localStorage.getItem(STORAGE_KEYS.SELECTED_ROOM_ID);
      if (storedRoomId) setSelectedRoomId(storedRoomId);

      const storedBookingData = localStorage.getItem(STORAGE_KEYS.BOOKING_DATA);
      if (storedBookingData) {
          try {
              // Defensive check for line 1 column 5 or other garbage
              const parsed = JSON.parse(storedBookingData);
              if (parsed && typeof parsed === 'object') {
                setBookingData(parsed);
              }
          } catch (e) {
              console.warn("Corrupted booking data found, clearing...", e);
              localStorage.removeItem(STORAGE_KEYS.BOOKING_DATA);
          }
      }

      const storedUserRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE) as 'admin' | 'tenant' | 'guest';
      if (storedUserRole) setUserRole(storedUserRole);
    };
    
    setTimeout(init, 0);
  }, []);

  // Save state to localStorage whenever it changes
  // We only save if isClient is true to avoid overwriting with initial defaults if effects run weirdly (though unlikely in this structure)
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.ADMIN_PAGE, adminPage);
  }, [adminPage, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.TENANT_PAGE, tenantPage);
  }, [tenantPage, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (selectedRoomId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_ROOM_ID, selectedRoomId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ROOM_ID);
    }
  }, [selectedRoomId, isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (bookingData) {
      localStorage.setItem(STORAGE_KEYS.BOOKING_DATA, JSON.stringify(bookingData));
    } else {
      localStorage.removeItem(STORAGE_KEYS.BOOKING_DATA);
    }
  }, [bookingData, isClient]);

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
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('token');
  };

  if (!isClient) return null;

  // Admin Portal
  if (viewMode === 'admin' || userRole === 'admin') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <AdminSidebar 
          currentPage={adminPage} 
          onNavigate={(page) => setAdminPage(page as AdminPage)} 
        />
        <div className="flex-1 overflow-auto">
          <div className="p-4 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setViewMode('tenant')}
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
            >
              Switch to User View
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearStoredState();
                window.location.href = '/login';
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </Button>
          </div>
          {adminPage === 'dashboard' && <LuxuryDashboard />}
          {adminPage === 'gallery' && <GalleryData />}
          {adminPage === 'rooms' && <LuxuryRoomManagement />}
          {adminPage === 'tenants' && <TenantData />}
          {adminPage === 'payments' && <LuxuryPaymentConfirmation />}
          {adminPage === 'reports' && <LuxuryReports />}
        </div>
      </div>
    );
  }

  // Default: Tenant/Guest Portal
  return (
    <UserPlatform 
       onLogout={() => {
         clearStoredState();
         window.location.reload();
       }}
    />
  );
}

