import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";

import { Copy, CheckCircle2, Clock, XCircle, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";
import { ImageWithFallback } from "@/app/components/shared/ImageWithFallback";
import { Payment } from "@/app/services/api";

// import { Booking } from "@/app/services/api"; // Remove strict Booking import

interface BookingDetails {
    id: string | number;
    status_pemesanan: string;
    roomName?: string;
    roomImage?: string;
    kamar?: { nomor_kamar: string; tipe_kamar: string; image_url: string; floor: number; harga_per_bulan: number; };
    durasi_sewa?: number;
    duration?: string;
    monthlyRent?: number;
    moveInDate?: string;
    tanggal_mulai?: string;
    moveOutDate?: string;
    tanggal_keluar?: string;
    payments?: Payment[];
}

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | null;
}

export function BookingDetailsModal({ isOpen, onClose, booking }: BookingDetailsModalProps) {
  if (!booking) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 hover:bg-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              Booking Details
              <Badge variant="outline" className={getStatusColor(booking.status_pemesanan)}>
                {booking.status_pemesanan}
              </Badge>
            </DialogTitle>
          </div>
          <DialogDescription>
            Invoice Reference: #{booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
            {/* Room Snapshot */}
            <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                <ImageWithFallback
                  src={booking.roomImage || booking.kamar?.image_url || ''}
                  alt={booking.roomName || booking.kamar?.nomor_kamar || 'Room'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{booking.roomName || booking.kamar?.nomor_kamar || 'Room'}</h3>
                <p className="text-sm text-slate-500 mb-2">Kota Malang, Jawa Timur</p>
                <div className="flex gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                    {booking.duration || (booking.durasi_sewa ? `${booking.durasi_sewa} Bulan` : '-')}
                  </span>
                  <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                    Rp {(booking.monthlyRent || booking.kamar?.harga_per_bulan || 0).toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Check In</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {(booking.moveInDate || booking.tanggal_mulai) ? new Date(booking.moveInDate || booking.tanggal_mulai!).toLocaleDateString() : '-'}
                </p>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Check Out</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {(booking.moveOutDate || booking.tanggal_keluar) ? new Date(booking.moveOutDate || booking.tanggal_keluar!).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Payment Information
              </h4>
              
              {/* Bank Transfer Instructions (Only show if not cancelled/completed fully?) 
                  Actually, always good to show "How to pay" if there is outstanding balance. 
                  But for now, let's just show standard info 
              */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 mb-6">
                <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 text-sm">Bank Transfer Details</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div>
                      <p className="text-xs text-slate-500">Bank BCA</p>
                      <p className="font-mono font-bold text-lg">1234567890</p>
                      <p className="text-xs text-slate-500">a.n. Koskosan Official</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard("1234567890")}>
                      <Copy className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h5 className="font-semibold text-sm text-slate-500 mb-3">Transaction History</h5>
                <div className="space-y-3">
                  {booking.payments && booking.payments.length > 0 ? (
                    booking.payments.map((payment: Payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            payment.status_pembayaran === 'Confirmed' ? 'bg-emerald-100 text-emerald-600' :
                            payment.status_pembayaran === 'Pending' ? 'bg-amber-100 text-amber-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {payment.status_pembayaran === 'Confirmed' ? <CheckCircle2 className="w-4 h-4" /> :
                             payment.status_pembayaran === 'Pending' ? <Clock className="w-4 h-4" /> :
                             <XCircle className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">Payment #{payment.id}</p>
                            <p className="text-xs text-slate-500">
                                {payment.tanggal_bayar ? new Date(payment.tanggal_bayar).toLocaleDateString() : 'Date N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">Rp {payment.jumlah_bayar.toLocaleString()}</p>
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {payment.status_pembayaran}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 italic text-center py-4">No payment history found.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
            <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
