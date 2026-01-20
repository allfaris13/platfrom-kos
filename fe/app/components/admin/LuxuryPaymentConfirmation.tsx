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
      case 'Confirmed':
        return <CheckCircle2 className="size-5" />;
      case 'Pending':
        return <Clock className="size-5" />;
      case 'Rejected':
        return <XCircle className="size-5" />;
      default:
        return <AlertCircle className="size-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400';
      case 'Pending':
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400';
      case 'Rejected':
        return 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400';
      default:
        return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-2">
          Pembayaran
        </h1>
        <p className="text-slate-400">Review and confirm tenant payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-orange-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Clock className="size-6 text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {payments.filter(p => p.status === 'Pending').length}
              </p>
            </div>
            <p className="text-slate-400 text-sm">Pending Confirmation</p>
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                style={{ width: `${(payments.filter(p => p.status === 'Pending').length / payments.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-green-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle2 className="size-6 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {payments.filter(p => p.status === 'Confirmed').length}
              </p>
            </div>
            <p className="text-slate-400 text-sm">Confirmed Payments</p>
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600"
                style={{ width: `${(payments.filter(p => p.status === 'Confirmed').length / payments.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-2xl p-6 hover:shadow-2xl hover:shadow-red-500/10 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/20 to-transparent rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <XCircle className="size-6 text-red-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {payments.filter(p => p.status === 'Rejected').length}
              </p>
            </div>
            <p className="text-slate-400 text-sm">Rejected Payments</p>
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-red-600"
                style={{ width: `${(payments.filter(p => p.status === 'Rejected').length / payments.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Activity Feed */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">Payment Timeline</h2>
        
        <div className="space-y-4">
          {payments.map((payment, index) => (
            <div 
              key={payment.id} 
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Timeline Line */}
              {index !== payments.length - 1 && (
                <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-slate-700 to-transparent" />
              )}
              
              {/* Payment Card */}
              <div className="relative flex gap-4 p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 hover:border-amber-500/30 transition-all duration-300">
                {/* Status Icon */}
                <div className={`flex-shrink-0 size-12 rounded-xl bg-gradient-to-br ${getStatusColor(payment.status)} border flex items-center justify-center relative z-10`}>
                  {getStatusIcon(payment.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {payment.tenantName}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {payment.roomName} • {payment.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                        {formatPrice(payment.amount)}
                      </p>
                      <p className="text-xs text-slate-500">{payment.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border bg-gradient-to-r ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingPayment(payment)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <Eye className="size-4 mr-2" />
                      View Receipt
                    </Button>

                    {payment.status === 'Pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfirm(payment.id)}
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                        >
                          <Check className="size-4 mr-2" />
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(payment.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="size-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Receipt Overlay */}
      <Dialog open={!!viewingPayment} onOpenChange={() => setViewingPayment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Payment Receipt Details
            </DialogTitle>
          </DialogHeader>
          {viewingPayment && (
            <div className="space-y-6 mt-4">
              {/* Payment Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Payment ID</p>
                  <p className="font-semibold text-white">{viewingPayment.id}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Tenant</p>
                  <p className="font-semibold text-white">{viewingPayment.tenantName}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Room</p>
                  <p className="font-semibold text-white">{viewingPayment.roomName}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Amount</p>
                  <p className="font-semibold text-amber-400">{formatPrice(viewingPayment.amount)}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Date</p>
                  <p className="font-semibold text-white">{viewingPayment.date}</p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Method</p>
                  <p className="font-semibold text-white">{viewingPayment.method}</p>
                </div>
              </div>

              {/* Receipt Image Preview */}
              <div>
                <p className="text-sm text-slate-400 mb-3">Receipt Image</p>
                <div className="relative bg-slate-800/30 rounded-xl p-12 text-center border-2 border-dashed border-slate-700">
                  <div className="space-y-3">
                    <div className="size-20 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                      <svg className="size-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500">Receipt preview would appear here</p>
                    <p className="text-xs text-slate-600">{viewingPayment.receiptUrl}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {viewingPayment.status === 'Pending' && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20" 
                    onClick={() => {
                      handleConfirm(viewingPayment.id);
                      setViewingPayment(null);
                    }}
                  >
                    <Check className="size-5 mr-2" />
                    Confirm Payment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                    onClick={() => {
                      handleReject(viewingPayment.id);
                      setViewingPayment(null);
                    }}
                  >
                    <X className="size-5 mr-2" />
                    Reject Payment
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
