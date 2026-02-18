import { History } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { BookingHistory } from '../booking-history';

interface HistoryViewProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export function HistoryView({ isLoggedIn, onLogout }: HistoryViewProps) {
  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
          <History className="w-20 h-20 text-indigo-500 mx-auto mb-6 opacity-20" />
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Riwayat Pemesanan</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">Pantau status transaksi dan riwayat sewa kamar kamu dengan login ke akun personal.</p>
          <Button onClick={onLogout} className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-6 text-lg rounded-xl font-bold shadow-xl shadow-stone-900/20">Login Sekarang</Button>
        </div>
      </div>
    );
  }

  return <BookingHistory />;
}
