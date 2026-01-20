"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';

// Login Component
import { Login } from '@/app/components/Login';

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

type ViewMode = 'login' | 'home' | 'admin' | 'tenant';
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
  // Load initial state from localStorage
  const getInitialViewMode = (): ViewMode => {
    if (typeof window === 'undefined') return 'login';
    const stored = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return (stored as ViewMode) || 'login';
  };

  const getInitialAdminPage = (): AdminPage => {
    if (typeof window === 'undefined') return 'dashboard';
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_PAGE);
    return (stored as AdminPage) || 'dashboard';
  };

  const getInitialTenantPage = (): TenantPage => {
    if (typeof window === 'undefined') return 'landing';
    const stored = localStorage.getItem(STORAGE_KEYS.TENANT_PAGE);
    return (stored as TenantPage) || 'landing';
  };

  const getInitialSelectedRoomId = (): string | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_ROOM_ID);
    return stored || null;
  };

  const getInitialBookingData = (): any => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKING_DATA);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const getInitialUserRole = (): 'admin' | 'tenant' | 'guest' | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    return (stored as 'admin' | 'tenant' | 'guest') || null;
  };

  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [adminPage, setAdminPage] = useState<AdminPage>(getInitialAdminPage);
  const [tenantPage, setTenantPage] = useState<TenantPage>(getInitialTenantPage);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(getInitialSelectedRoomId);
  const [bookingData, setBookingData] = useState<any>(getInitialBookingData);
  const [userRole, setUserRole] = useState<'admin' | 'tenant' | 'guest' | null>(getInitialUserRole);

  // Function to clear all stored state (for logout)
  const clearStoredState = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PAGE, adminPage);
  }, [adminPage]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TENANT_PAGE, tenantPage);
  }, [tenantPage]);

  useEffect(() => {
    if (selectedRoomId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_ROOM_ID, selectedRoomId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ROOM_ID);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    if (bookingData) {
      localStorage.setItem(STORAGE_KEYS.BOOKING_DATA, JSON.stringify(bookingData));
    } else {
      localStorage.removeItem(STORAGE_KEYS.BOOKING_DATA);
    }
  }, [bookingData]);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, userRole);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    }
  }, [userRole]);

  // Login Screen
  if (viewMode === 'login') {
    return (
      <Login
        onLoginAsAdmin={() => {
          setUserRole('admin');
          setViewMode('admin');
        }}
        onLoginAsUser={() => {
          setUserRole('tenant');
          setViewMode('tenant');
        }}
        onLoginAsGuest={() => {
          setUserRole('guest');
          setViewMode('home');
        }}
      />
    );
  }

  // Home Selection Screen
  if (viewMode === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Kos-kosan Management System
            </h1>
            <p className="text-xl text-blue-100">
              Complete boarding house management solution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Portal */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:scale-105 transition-transform">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white">
                <div className="size-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Admin Portal</h2>
                <p className="text-blue-100">
                  Manage rooms, tenants, payments, and reports
                </p>
              </div>
              <div className="p-8">
                <ul className="space-y-3 mb-6 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 bg-blue-600 rounded-full"></span>
                    Dashboard & Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 bg-blue-600 rounded-full"></span>
                    Room Management (CRUD)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 bg-blue-600 rounded-full"></span>
                    Payment Confirmation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 bg-blue-600 rounded-full"></span>
                    Financial Reports
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setViewMode('admin')}
                >
                  Enter Admin Portal
                </Button>
              </div>
            </div>

            {/* Tenant Portal */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:scale-105 transition-transform">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                <div className="size-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Tenant Portal</h2>
                <p className="text-blue-100">
                  Browse rooms, book, and manage your rentals
                </p>
              </div>
              <div className="p-8">
                <ul className="space-y-3 mb-6 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 bg-blue-600 rounded-full"></span>
                    Search & Browse Rooms
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 bg-blue-600 rounded-full"></span>
                    View Room Details
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 bg-blue-600 rounded-full"></span>
                    Online Booking & Payment
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 bg-blue-600 rounded-full"></span>
                    Rental History
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  size="lg"
                  variant="outline"
                  onClick={() => setViewMode('tenant')}
                >
                  Enter Tenant Portal
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="ghost" 
              className="text-blue-200 hover:text-white hover:bg-blue-600/20 mr-4"
              onClick={() => setViewMode('login')}
            >
              Back to Login
            </Button>
            <p className="text-blue-100 text-sm mt-4">
              © 2026 Kos-kosan Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin Portal
  if (viewMode === 'admin') {
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
              onClick={() => setViewMode('home')}
              className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-800"
            >
              Back to Home
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearStoredState();
                setViewMode('login');
                setUserRole(null);
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

  // Tenant Portal
  if (viewMode === 'tenant') {
    return (
      <UserPlatform 
        onLogout={() => setViewMode('login')}
      />
    );
  }

  return null;
}

