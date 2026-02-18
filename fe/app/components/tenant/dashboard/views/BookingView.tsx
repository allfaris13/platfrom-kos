import { CreditCard } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { BookingFlow } from '../../booking/booking-flow';

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

  return <BookingFlow roomId={selectedRoomId} initialData={bookingDraft} onBack={() => setActiveView('room-detail')} />;
}
