import { useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { payments as initialPayments } from '@/app/data/mockData';
import { Button } from '@/app/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

export function PaymentConfirmation() {
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Payment Confirmation</h2>
        <p className="text-slate-600 mt-1">Review and confirm tenant payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-slate-600">Pending</p>
          <p className="text-2xl font-semibold text-orange-600 mt-1">
            {payments.filter(p => p.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-slate-600">Confirmed</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">
            {payments.filter(p => p.status === 'Confirmed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-slate-600">Rejected</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">
            {payments.filter(p => p.status === 'Rejected').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{payment.tenantName}</TableCell>
                <TableCell>{payment.roomName}</TableCell>
                <TableCell>{formatPrice(payment.amount)}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'Confirmed'
                      ? 'bg-green-100 text-green-700'
                      : payment.status === 'Pending'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {payment.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingPayment(payment)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    {payment.status === 'Pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleConfirm(payment.id)}
                        >
                          <Check className="size-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(payment.id)}
                        >
                          <X className="size-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingPayment} onOpenChange={() => setViewingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {viewingPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Payment ID</p>
                  <p className="font-medium">{viewingPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tenant</p>
                  <p className="font-medium">{viewingPayment.tenantName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Room</p>
                  <p className="font-medium">{viewingPayment.roomName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Amount</p>
                  <p className="font-medium">{formatPrice(viewingPayment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="font-medium">{viewingPayment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Method</p>
                  <p className="font-medium">{viewingPayment.method}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Receipt</p>
                <div className="bg-slate-100 rounded-lg p-8 text-center">
                  <p className="text-slate-500">Receipt preview would appear here</p>
                  <p className="text-xs text-slate-400 mt-2">{viewingPayment.receiptUrl}</p>
                </div>
              </div>
              {viewingPayment.status === 'Pending' && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      handleConfirm(viewingPayment.id);
                      setViewingPayment(null);
                    }}
                  >
                    <Check className="size-4 mr-2" />
                    Confirm
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      handleReject(viewingPayment.id);
                      setViewingPayment(null);
                    }}
                  >
                    <X className="size-4 mr-2" />
                    Reject
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
