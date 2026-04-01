import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, ChevronRight, AlertCircle, Upload, CheckCircle2, Building, Banknote } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCost = duration * bookingData.pricePerMonth;

  // Logika hitung tanggal baru (sederhana)
  const calculateNewDate = (currentDate: string, monthsToAdd: number) => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + monthsToAdd);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleConfirmExtend = async () => {
    if (paymentMethod === 'transfer' && !proofFile) {
      toast.error('Bukti Transfer Diperlukan', {
        description: 'Silahkan unggah bukti transfer anda terlebih dahulu.'
      });
      return;
    }

    setLoading(true);
    try {
      const paymentResponse = await api.extendBooking(bookingData.id, duration, paymentMethod); // Call API Directly

      if (paymentMethod === 'transfer' && proofFile && paymentResponse.id) {
        await api.uploadPaymentProof(paymentResponse.id, proofFile);
      }

      toast.success('Permintaan perpanjangan sewa berhasil dibuat!', {
        description: `Tagihan baru sebesar Rp ${totalCost.toLocaleString()} telah dibuat. Silakan tunggu konfirmasi dari admin.`,
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

              {/* Payment Method Selector */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Banknote className="w-4 h-4" /> Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-2 ${
                      paymentMethod === 'transfer'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Building className={`w-6 h-6 ${paymentMethod === 'transfer' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <span className="block text-sm font-bold">Transfer Bank</span>
                      <span className="text-[10px] mt-1 line-clamp-2 leading-tight opacity-80">Verifikasi manual dengan bukti transfer</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-start gap-2 ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Banknote className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div className="text-left">
                      <span className="block text-sm font-bold">Tunai (Cash)</span>
                      <span className="text-[10px] mt-1 line-clamp-2 leading-tight opacity-80">Bayar langsung dan konfirmasi ke admin</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Upload Proof for Transfer Bank */}
              {paymentMethod === 'transfer' && (
                <div className="space-y-3">
                  {/* Bank Account Info */}
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      Rekening Tujuan Transfer
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-blue-500 font-medium mb-0.5">Bank BCA</p>
                        <p className="text-xl font-black text-blue-900 tracking-wider">1234567890</p>
                        <p className="text-xs text-blue-600 mt-0.5">a.n. <span className="font-semibold">Koskosan Official</span></p>
                      </div>
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between text-xs">
                      <span className="text-blue-500">Nominal transfer</span>
                      <span className="font-bold text-blue-900">Rp {totalCost.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Bukti Transfer
                  </label>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                      proofFile 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    {proofFile ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                        <span className="text-sm font-medium text-emerald-700">{proofFile.name}</span>
                        <span className="text-xs text-emerald-600">Klik untuk mengganti gambar</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-700">Unggah Bukti Transfer</span>
                        <span className="text-xs text-slate-500 text-center max-w-[200px]">Format JPG, PNG, atau JPEG max 5MB</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Summary Info */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tanggal Selesai Baru</span>
                  <span className="font-bold text-slate-900">{calculateNewDate(bookingData.currentEndDate, duration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Biaya Per Bulan</span>
                  <span className="font-medium text-slate-900">Rp {bookingData.pricePerMonth.toLocaleString('id-ID')}</span>
                </div>
                <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total Pembayaran</span>
                  <span className="text-2xl font-black text-stone-900">Rp {totalCost.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-4 bg-blue-50 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Perpanjangan akan diverifikasi oleh admin. Pastikan nominal transfer sesuai jika memilih metode Transfer Bank.
                </p>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-slate-100 bg-white">
              <Button 
                onClick={handleConfirmExtend}
                disabled={loading || (paymentMethod === 'transfer' && !proofFile)}
                className="w-full h-14 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-600 text-white rounded-2xl flex items-center justify-center gap-2 text-lg font-bold shadow-xl shadow-stone-200 group transition-all"
              >
                {loading ? 'Memproses...' : 'Konfirmasi & Bayar'}
                {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
