import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { PaymentReminder } from '@/app/services/api';
import { CheckCircle2, CreditCard, BanknoteIcon as FileSpreadsheet, ListOrdered, Calendar } from 'lucide-react';
import { getImageUrl } from '@/app/utils/api-url';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminder: PaymentReminder;
}

export function PaymentDetailsModal({ isOpen, onClose, reminder }: PaymentDetailsModalProps) {
  const t = useTranslations('history');
  if (!reminder || !reminder.pembayaran) return null;

  const { pembayaran } = reminder;
  const isTransfer = !!pembayaran.bukti_transfer;
  
  const paymentMethodText = isTransfer ? 'Bank Transfer' : (pembayaran.metode_pembayaran || 'Cash');
  const paymentTypeText = 
    pembayaran.tipe_pembayaran === 'dp' ? t('dpPaymentType') : 
    pembayaran.tipe_pembayaran === 'extend' ? t('extensionPaymentType') : 
    t('fullPaymentType');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-slate-950 border-0 shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            {t('paymentDetailsTitle')}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {t('paymentDetailsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Header Amount */}
          <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 font-medium mb-1">{t('totalPaidText')}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
              Rp {reminder.jumlah_bayar.toLocaleString()}
            </h3>
            <Badge className="mt-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-none">
              {t('paidBadge')}
            </Badge>
          </div>

          {/* Details List */}
          <div className="space-y-4 px-2">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <ListOrdered className="w-4 h-4" />
                <span className="text-sm font-medium">{t('paymentTypeTitle')}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {paymentTypeText}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm font-medium">{t('paymentMethodTitle')}</span>
              </div>
              <span className="text-sm font-semibold capitalize text-slate-900 dark:text-white">
                {paymentMethodText}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{t('paymentDateTitle')}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {pembayaran.tanggal_bayar ? new Date(pembayaran.tanggal_bayar).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
              </span>
            </div>

            {pembayaran.pemesanan?.kamar && (
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('roomNameTitle')}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {pembayaran.pemesanan.kamar.nomor_kamar}
                </span>
              </div>
            )}
            
            {pembayaran.bukti_transfer && (
               <div className="pt-2">
                 <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" /> 
                    {t('paymentProofTitle')}
                 </p>
                 <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 relative aspect-[4/3] w-full">
                   <Image 
                     src={getImageUrl(pembayaran.bukti_transfer)} 
                     alt="Proof of Payment"
                     fill
                     className="object-contain"
                   />
                 </div>
               </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
