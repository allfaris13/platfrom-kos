import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

import { api } from '@/app/services/api';

import NextImage from 'next/image';

interface CancelBookingProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    id: string;
    roomName: string;
    moveOutDate: string;
    monthlyRent: number;
    totalPaid: number;
    image: string;
    duration: string;
    status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  };
  onSuccess?: () => void;
}



export function CancelBooking({ isOpen, onClose, bookingData, onSuccess }: CancelBookingProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  // const { cancelBooking } = useApp(); // Deprecated

  const handleConfirmCancel = async () => {
    if (!confirmed) {
      toast.error('Silakan centang kotak persetujuan terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      await api.cancelBooking(bookingData.id);
      
      toast.success('Booking berhasil dibatalkan', {
        description: `Booking telah dibatalkan sesuai kebijakan (No Refund). Status booking kini Cancelled.`,
        duration: 4000,
      });
      
      onSuccess?.();
      setConfirmed(false);
      onClose();
    } catch (error) {
      console.error("Failed to cancel booking", error);
      toast.error("Gagal membatalkan booking", {
        description: "Terjadi kesalahan saat memproses permintaan anda."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Batalkan Booking</h2>
                  <p className="text-xs text-slate-500">Proses pembatalan</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Room Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="flex gap-4">
                  <NextImage 
                    src={bookingData.image} 
                    width={80}
                    height={80}
                    className="rounded-xl object-cover" 
                    alt="Room" 
                    unoptimized
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{bookingData.roomName}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      Checkout: {bookingData.moveOutDate}
                    </div>
                    <Badge className={`mt-2 ${
                      bookingData.status === 'Confirmed' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    } hover:bg-opacity-100 border-none`}>
                      {bookingData.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-red-50 rounded-xl flex gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-relaxed">
                  Perhatian: Sesuai kebijakan terbaru, pembatalan booking <strong>TIDAK DAPAT DI-REFUND</strong> (No Refund). Uang yang sudah dibayarkan tidak dapat dikembalikan.
                </p>
              </div>

              {/* Refund Summary */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Total Pembayaran</span>
                  <span className="font-bold text-slate-900">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(bookingData.totalPaid)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-600">Potongan Hangus (100%)</span>
                  <span className="font-bold text-red-600">
                    -{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(bookingData.totalPaid)}
                  </span>
                </div>
                <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Refund Anda</span>
                  <span className="text-2xl font-black text-slate-400">Rp 0</span>
                </div>
                <p className="text-xs text-slate-500 pt-2">Kebijakan No Refund berlaku untuk semua pembatalan.</p>
              </div>

              {/* Confirmation Checkbox */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <input 
                  type="checkbox" 
                  id="confirm-cancel"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="confirm-cancel" className="text-xs text-slate-600 cursor-pointer">
                  Saya memahami bahwa pembatalan ini <strong>permanen</strong> dan saya <strong>tidak akan menerima pengembalian dana</strong> apapun.
                </label>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl space-y-3">
              <Button 
                onClick={handleConfirmCancel}
                disabled={loading || !confirmed}
                className="w-full h-12 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
              >
                {loading ? 'Memproses...' : 'Ya, Batalkan Booking'}
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full h-12 border-slate-300 text-slate-900 rounded-xl font-medium"
              >
                Tidak, Lanjutkan Sewa
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
