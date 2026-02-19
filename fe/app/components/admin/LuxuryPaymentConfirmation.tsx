"use client";

import { useState, useEffect, useCallback } from 'react';
import { getImageUrl } from '@/app/utils/api-url';
import { Check, X, Eye, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api, Payment as ApiPayment } from '@/app/services/api';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from "framer-motion";

interface Payment {
  id: number;
  tenantName: string;
  roomName: string;
  amount: number;
  date: string;
  method: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  receiptUrl: string;
}

export function LuxuryPaymentConfirmation() {
  const t = useTranslations('admin');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getAllPayments();
      
      const paymentData = Array.isArray(response) ? response : [];

      const mapped = paymentData.map((p: ApiPayment) => ({
        id: p.id,
        tenantName: p.pemesanan?.penyewa?.nama_lengkap || t('guest'),
        roomName: p.pemesanan?.kamar?.nomor_kamar || t('room'),
        amount: p.jumlah_bayar,
        date: new Date(p.tanggal_bayar).toLocaleDateString('id-ID'),
        method: t('transferBank'),
        status: p.status_pembayaran as Payment['status'],
        receiptUrl: getImageUrl(p.bukti_transfer) || '',
      }));
      
      setPayments(mapped);
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleConfirm = async (id: number) => {
    try {
      await api.confirmPayment(String(id));
      fetchPayments();
      toast.success(t('paymentConfirmedSuccess'));
    } catch (e) {
      console.error(e);
      toast.error(t('paymentConfirmedError'));
    }
  };

  const handleReject = (id: number) => {
    // Backend Reject not yet implemented, keeping local update for demo or skipping
    setPayments(payments.map(p =>
      p.id === id ? { ...p, status: 'Rejected' as const } : p
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle2 className="size-5" />;
      case 'Pending': return <Clock className="size-5" />;
      case 'Rejected': return <XCircle className="size-5" />;
      default: return <AlertCircle className="size-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-600 dark:text-green-400';
      case 'Pending': return 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-600 dark:text-orange-400';
      case 'Rejected': return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-600 dark:text-red-400';
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 bg-clip-text text-transparent mb-2">
          {t('paymentsTitle')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">{t('paymentsSubtitle')}</p>
      </motion.div>

      {/* Stats Cards - 2x2 Grid on Mobile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
      >
        {[
          { label: t('pendingConfirmation'), status: 'Pending', icon: Clock, color: 'orange' },
          { label: t('confirmedPayments'), status: 'Confirmed', icon: CheckCircle2, color: 'green' },
          { label: t('rejectedPayments'), status: 'Rejected', icon: XCircle, color: 'red' }
        ].map((stat) => (
          <div key={stat.status} className={`group relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-${stat.color}-500/10 dark:to-${stat.color}-600/10 border border-${stat.color}-200 dark:border-${stat.color}-500/20 rounded-2xl p-4 md:p-6 transition-all shadow-sm dark:shadow-none`}>
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${stat.color}-500/10 to-transparent rounded-full blur-2xl dark:from-${stat.color}-500/20`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className={`p-2 bg-${stat.color}-100 dark:bg-${stat.color}-500/20 rounded-xl`}>
                  <stat.icon className={`size-4 md:size-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <p className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  {payments.filter(p => p.status === stat.status).length}
                </p>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm">{stat.label}</p>
              <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600`}
                  style={{ width: `${payments.length > 0 ? (payments.filter(p => p.status === stat.status).length / payments.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Timeline Activity Feed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-white/50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm dark:shadow-none"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mb-6">{t('paymentTimeline')}</h2>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-slate-400 font-medium italic">{t('loadingPayments')}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 bg-slate-100 dark:bg-slate-800/10 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-slate-500">{t('noPaymentsRecord')}</p>
          </div>
        ) : (
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-x-visible gap-4 pb-4 sm:pb-0 snap-x">
            {payments.map((payment, index) => (
              <div key={payment.id} className="group relative">
                {/* Timeline Line (Desktop Only) */}
                {index !== payments.length - 1 && (
                  <div className="hidden sm:block absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 dark:from-slate-700 to-transparent" />
                )}

                {/* Payment Card */}
                <div className="relative flex flex-col sm:flex-row gap-4 p-4 md:p-5 bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 min-w-[280px] sm:min-w-0 snap-start shadow-sm dark:shadow-none">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 size-10 md:size-12 rounded-xl bg-gradient-to-br ${getStatusColor(payment.status)} border flex items-center justify-center z-10 mx-auto sm:mx-0`}>
                    {getStatusIcon(payment.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 md:gap-4 mb-3">
                      <div className="text-center sm:text-left">
                        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white truncate">
                          {payment.tenantName}
                        </h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                          {payment.roomName} • {payment.method}
                        </p>
                      </div>
                      <div className="text-center sm:text-right">
                        <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
                          {formatPrice(payment.amount)}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500">{payment.date}</p>
                      </div>
                    </div>

                    {/* Actions - Scrollable di mobile jika terlalu banyak tombol */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {t(payment.status.toLowerCase())}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingPayment(payment)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 h-8 md:h-9 text-xs"
                      >
                        <Eye className="size-3.5 md:size-4 mr-1.5" />
                        {t('receipt')}
                      </Button>

                      {payment.status === 'Pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfirm(payment.id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-500/10 h-8 md:h-9 text-xs"
                          >
                            <Check className="size-3.5 md:size-4 mr-1.5" />
                            {t('confirm')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(payment.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 md:h-9 text-xs"
                          >
                            <X className="size-3.5 md:size-4 mr-1.5" />
                            {t('reject')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Responsive Receipt Dialog */}
      <Dialog open={!!viewingPayment} onOpenChange={() => setViewingPayment(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent">
              {t('paymentDetails')}
            </DialogTitle>
          </DialogHeader>

          {viewingPayment && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: t('paymentId'), value: viewingPayment.id },
                  { label: t('tenant'), value: viewingPayment.tenantName },
                  { label: t('room'), value: viewingPayment.roomName },
                  { label: t('paymentAmount'), value: formatPrice(viewingPayment.amount), highlight: true },
                  { label: t('paymentDate'), value: viewingPayment.date },
                  { label: t('paymentMethod'), value: viewingPayment.method }
                ].map((item, i) => (
                  <div key={i} className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{item.label}</p>
                    <p className={`font-semibold text-sm md:text-base ${item.highlight ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-3">{t('receiptPreview')}</p>
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 md:p-6 text-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                  {viewingPayment.receiptUrl ? (
                    <div className="relative w-full h-64 md:h-96">
                       <Image 
                          src={viewingPayment.receiptUrl} 
                          alt="Receipt" 
                          fill
                          className="object-contain rounded-lg"
                          unoptimized
                       />
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="size-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                        <AlertCircle className="size-8 text-amber-500" />
                      </div>
                      <p className="text-sm text-slate-500">{t('noReceipt')}</p>
                    </div>
                  )}
                </div>
              </div>

              {viewingPayment.status === 'Pending' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 text-white"
                    onClick={() => { handleConfirm(viewingPayment.id); setViewingPayment(null); }}
                  >
                    <Check className="size-4 mr-2" /> {t('confirm')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                    onClick={() => { handleReject(viewingPayment.id); setViewingPayment(null); }}
                  >
                    <X className="size-4 mr-2" /> {t('reject')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}