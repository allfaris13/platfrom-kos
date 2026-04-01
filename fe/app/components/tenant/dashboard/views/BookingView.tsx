"use client";

import { useMemo, useEffect, useState } from 'react';
import { CreditCard, Home, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { BookingFlow } from '../../booking/booking-flow';
import { api } from '@/app/services/api';

interface BookingViewProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
  selectedRoomId: string;
  bookingDraft?: { moveInDate?: string; duration?: string; guests?: string };
  setActiveView: (view: string) => void;
}

export function BookingView({
  isLoggedIn,
  onLogout,
  selectedRoomId,
  bookingDraft,
  setActiveView
}: BookingViewProps) {
  // Read user role synchronously from localStorage with useMemo (no setState needed)
  const userRole = useMemo<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      return JSON.parse(userStr)?.role ?? null;
    } catch {
      return null;
    }
  }, []);

  const [hasActiveBooking, setHasActiveBooking] = useState<boolean | null>(null);

  useEffect(() => {
    if (userRole !== 'tenant') return;
    let cancelled = false;
    api.getMyBookings()
      .then((bookings) => {
        if (cancelled) return;
        const active = bookings.some(
          (b) => b.status_pemesanan === 'Confirmed' || b.status_pemesanan === 'Pending'
        );
        setHasActiveBooking(active);
      })
      .catch(() => {
        if (!cancelled) setHasActiveBooking(false);
      });
    return () => { cancelled = true; };
  }, [userRole]);

  // Not logged in guard
  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
          <CreditCard className="w-20 h-20 text-blue-500 mx-auto mb-6 opacity-20" />
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Siap untuk Pindah?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">Silakan login terlebih dahulu untuk melakukan pemesanan kamar premium ini secara aman.</p>
          <Button onClick={onLogout} className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-6 text-lg rounded-xl font-bold shadow-xl shadow-stone-900/20">Masuk untuk Memesan</Button>
        </div>
      </div>
    );
  }

  // Checking active booking state (only for tenant role, null = still loading)
  if (userRole === 'tenant' && hasActiveBooking === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto" />
      </div>
    );
  }

  // Tenant with active booking guard
  if (userRole === 'tenant' && hasActiveBooking === true) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-2xl border border-blue-100 dark:border-blue-900/30">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Anda Sudah Punya Kamar</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-2 text-base max-w-md mx-auto">
            Anda sudah memiliki kamar aktif. Satu akun hanya bisa menyewa satu kamar dalam satu waktu.
          </p>
          <p className="text-slate-400 dark:text-slate-500 mb-8 text-sm">
            Untuk menyewa kamar lain, batalkan atau selesaikan terlebih dahulu sewa kamar Anda saat ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => setActiveView('history')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Lihat Kamar Aktif Saya
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveView('home')}
              className="border-slate-300 dark:border-slate-700 px-6 py-3 rounded-xl"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <BookingFlow roomId={selectedRoomId} initialData={bookingDraft} onBack={() => setActiveView('room-detail')} />;
}
