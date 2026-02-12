import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/app/services/api';

import NextImage from 'next/image';

interface ExtendBookingProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    id: string;
    roomName: string;
    currentEndDate: string;
    pricePerMonth: number;
    image: string;
  };
  onSuccess?: () => void;
}

export function ExtendBooking({ isOpen, onClose, bookingData, onSuccess }: ExtendBookingProps) {
  const [duration, setDuration] = useState(1); // dalam bulan
  const [loading, setLoading] = useState(false);
  // const { extendBooking } = useApp(); // Deprecated: using direct API
  const totalCost = duration * bookingData.pricePerMonth;

  // Logika hitung tanggal baru (sederhana)
  const calculateNewDate = (currentDate: string, monthsToAdd: number) => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + monthsToAdd);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleConfirmExtend = async () => {
    setLoading(true);
    try {
      await api.extendBooking(bookingData.id, duration); // Call API Directly

      toast.success('Permintaan perpanjangan sewa berhasil dibuat!', {
        description: `Tagihan baru sebesar Rp ${totalCost.toLocaleString()} telah dibuat. Silakan cek menu "My Bills" untuk melakukan pembayaran.`,
        duration: 5000,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to extend booking", error);
      toast.error("Gagal memperpanjang sewa", {
        description: "Terjadi kesalahan saat memproses permintaan anda."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Slide-over Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Perpanjang Sewa</h2>
                <p className="text-sm text-slate-500">Tambah durasi masa huni Anda</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Room Summary */}
              <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
                <NextImage 
                  src={bookingData.image} 
                  width={80}
                  height={80}
                  className="rounded-xl object-cover" 
                  alt="Room" 
                  unoptimized
                />
                <div>
                  <h3 className="font-bold text-slate-900">{bookingData.roomName}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    Berakhir pada: {bookingData.currentEndDate}
                  </div>
                  <Badge className="mt-2 bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                    Sewa Aktif
                  </Badge>
                </div>
              </div>

              {/* Duration Selector */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Pilih Tambahan Durasi
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 3, 6].map((month) => (
                    <button
                      key={month}
                      onClick={() => setDuration(month)}
                      className={`py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        duration === month
                          ? 'border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-200'
                          : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-lg font-bold">{month}</span>
                      <span className="text-[10px] uppercase tracking-wider font-medium">Bulan</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Info */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tanggal Selesai Baru</span>
                  <span className="font-bold text-slate-900">{calculateNewDate(bookingData.currentEndDate, duration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Biaya Per Bulan</span>
                  <span className="font-medium text-slate-900">${bookingData.pricePerMonth}</span>
                </div>
                <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total Pembayaran</span>
                  <span className="text-2xl font-black text-stone-900">${totalCost}</span>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-4 bg-blue-50 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Perpanjangan akan diproses setelah pembayaran diverifikasi. Harga sewa mengikuti ketentuan periode terbaru.
                </p>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <Button 
                onClick={handleConfirmExtend}
                disabled={loading}
                className="w-full h-14 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-600 text-white rounded-2xl flex items-center justify-center gap-2 text-lg font-bold shadow-xl shadow-stone-200 group"
              >
                {loading ? 'Memproses...' : 'Konfirmasi & Bayar'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
