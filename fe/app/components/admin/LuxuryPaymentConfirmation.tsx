"use client";

import { useState } from 'react';
import { Check, X, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { payments as initialPayments } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

export function LuxuryPaymentConfirmation() {
  const [payments, setPayments] = useState(initialPayments);
  const [viewingPayment, setViewingPayment] = useState<typeof payments[0] | null>(null);

  const handleConfirm = (id: string) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, status: 'Confirmed' as const } : p
    ));
  };

  const handleReject = (id: string) => {
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
      case 'Confirmed': return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400';
      case 'Pending': return 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400';
      case 'Rejected': return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400';
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
          Pembayaran
        </h1>
        <p className="text-slate-400 text-sm md:text-base">Review and confirm tenant payments</p>
      </div>

      {/* Stats Cards - Grid responsif (1 kolom mobile, 3 kolom desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          { label: 'Pending Confirmation', status: 'Pending', icon: Clock, color: 'orange' },
          { label: 'Confirmed Payments', status: 'Confirmed', icon: CheckCircle2, color: 'green' },
          { label: 'Rejected Payments', status: 'Rejected', icon: XCircle, color: 'red' }
        ].map((stat) => (
          <div key={stat.status} className={`group relative overflow-hidden bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/10 border border-${stat.color}-500/20 rounded-2xl p-5 md:p-6 transition-all`}>
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${stat.color}-500/20 to-transparent rounded-full blur-2xl`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 bg-${stat.color}-500/20 rounded-xl`}>
                  <stat.icon className={`size-5 md:size-6 text-${stat.color}-400`} />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {payments.filter(p => p.status === stat.status).length}
                </p>
              </div>
              <p className="text-slate-400 text-xs md:text-sm">{stat.label}</p>
              <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600`}
                  style={{ width: `${(payments.filter(p => p.status === stat.status).length / payments.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Activity Feed */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">Payment Timeline</h2>
        
        <div className="space-y-4">
          {payments.map((payment, index) => (
            <div key={payment.id} className="group relative">
              {/* Timeline Line (Desktop Only) */}
              {index !== payments.length - 1 && (
                <div className="hidden sm:block absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-slate-700 to-transparent" />
              )}
              
              {/* Payment Card */}
              <div className="relative flex flex-col sm:flex-row gap-4 p-4 md:p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-all duration-300">
                {/* Status Icon */}
                <div className={`flex-shrink-0 size-10 md:size-12 rounded-xl bg-gradient-to-br ${getStatusColor(payment.status)} border flex items-center justify-center z-10 mx-auto sm:mx-0`}>
                  {getStatusIcon(payment.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 md:gap-4 mb-3">
                    <div className="text-center sm:text-left">
                      <h3 className="text-base md:text-lg font-semibold text-white truncate">
                        {payment.tenantName}
                      </h3>
                      <p className="text-xs md:text-sm text-slate-400">
                        {payment.roomName} • {payment.method}
                      </p>
                    </div>
                    <div className="text-center sm:text-right">
                      <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                        {formatPrice(payment.amount)}
                      </p>
                      <p className="text-[10px] md:text-xs text-slate-500">{payment.date}</p>
                    </div>
                  </div>

                  {/* Actions - Scrollable di mobile jika terlalu banyak tombol */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-medium border ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingPayment(payment)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 md:h-9 text-xs"
                    >
                      <Eye className="size-3.5 md:size-4 mr-1.5" />
                      Receipt
                    </Button>

                    {payment.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfirm(payment.id)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8 md:h-9 text-xs"
                        >
                          <Check className="size-3.5 md:size-4 mr-1.5" />
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(payment.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 md:h-9 text-xs"
                        >
                          <X className="size-3.5 md:size-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Receipt Dialog */}
      <Dialog open={!!viewingPayment} onOpenChange={() => setViewingPayment(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white rounded-2xl p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Payment Details
            </DialogTitle>
          </DialogHeader>
          
          {viewingPayment && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Payment ID', value: viewingPayment.id },
                  { label: 'Tenant', value: viewingPayment.tenantName },
                  { label: 'Room', value: viewingPayment.roomName },
                  { label: 'Amount', value: formatPrice(viewingPayment.amount), highlight: true },
                  { label: 'Date', value: viewingPayment.date },
                  { label: 'Method', value: viewingPayment.method }
                ].map((item, i) => (
                  <div key={i} className="p-3 md:p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{item.label}</p>
                    <p className={`font-semibold text-sm md:text-base ${item.highlight ? 'text-amber-400' : 'text-white'}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs md:text-sm text-slate-400 mb-3">Receipt Preview</p>
                <div className="bg-slate-800/30 rounded-xl p-8 md:p-12 text-center border-2 border-dashed border-slate-700">
                  <div className="size-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                    <svg className="size-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500">Image: {viewingPayment.receiptUrl}</p>
                </div>
              </div>

              {viewingPayment.status === 'Pending' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 text-white" 
                    onClick={() => { handleConfirm(viewingPayment.id); setViewingPayment(null); }}
                  >
                    <Check className="size-4 mr-2" /> Confirm
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full bg-red-500/10 border-red-500/30 text-red-400"
                    onClick={() => { handleReject(viewingPayment.id); setViewingPayment(null); }}
                  >
                    <X className="size-4 mr-2" /> Reject
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