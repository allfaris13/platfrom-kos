"use client";

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Calendar } from '@/app/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { api } from '@/app/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  MessageCircle, 
  Bell, 
  ChevronRight,
  Info
} from 'lucide-react';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';

interface Booking {
  id: number;
  kamar: {
    nomor_kamar: string;
    tipe_kamar: string;
    image_url: string;
    floor: number;
  };
  tanggal_mulai: string;
  durasi_sewa: number;
  status_bayar: string;
}

export function SmartCalendar() {
  const { data: bookingsData } = useSWR('api/my-bookings', api.getMyBookings);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const processedBookings = useMemo(() => {
    if (!bookingsData) return [];
    return (bookingsData as Booking[]).map(b => {
      const start = new Date(b.tanggal_mulai);
      const end = new Date(start);
      end.setMonth(end.getMonth() + b.durasi_sewa);
      
      // Due date is usually 3 days before end date
      const due = new Date(end);
      due.setDate(due.getDate() - 3);

      return {
        ...b,
        startDate: start,
        endDate: end,
        dueDate: due
      };
    });
  }, [bookingsData]);

  // Find booking for selected date
  const activeBooking = useMemo(() => {
    if (!selectedDate) return null;
    return processedBookings.find(b => {
      return selectedDate >= b.startDate && selectedDate <= b.endDate;
    });
  }, [selectedDate, processedBookings]);

  // WhatsApp simulation
  const handleRegisterWhatsApp = () => {
    const message = "Halo Admin Rahmat ZAW, saya ingin mendaftarkan nomor saya untuk notifikasi kalender pintar.";
    window.open(`https://wa.me/628124911926?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-32 space-y-8 min-h-[800px]"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-stone-700 to-stone-900 rounded-2xl flex items-center justify-center shadow-2xl">
            <CalendarIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Calendar</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your stay and never miss a due date.</p>
          </div>
        </div>
        
        <Button 
          onClick={handleRegisterWhatsApp}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Enable WhatsApp Alerts
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Card */}
        <Card className="lg:col-span-8 border-0 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden rounded-3xl">
          <CardContent className="p-0">
             <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="p-8 w-full"
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-lg font-bold text-slate-900 dark:text-white",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell: "text-slate-400 rounded-md w-full font-medium text-[0.8rem] uppercase tracking-widest",
                    row: "flex w-full mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full",
                    day: "h-14 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center cursor-pointer",
                    day_selected: "bg-stone-900 text-white hover:bg-stone-800 focus:bg-stone-900 focus:text-white dark:bg-white dark:text-stone-900 dark:hover:bg-slate-200",
                    day_today: "bg-slate-100 dark:bg-slate-800 text-stone-900 dark:text-white font-bold border-2 border-stone-200 dark:border-slate-700",
                    day_outside: "text-slate-300 opacity-50 dark:text-slate-600",
                    day_disabled: "text-slate-300 opacity-50 dark:text-slate-600",
                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                }}
             />
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="lg:col-span-4 space-y-6">
          <AnimatePresence mode="wait">
            {activeBooking ? (
              <motion.div
                key={activeBooking.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                  <div className="relative h-40">
                     <ImageWithFallback 
                        src={activeBooking.kamar.image_url.startsWith('http') ? activeBooking.kamar.image_url : `http://localhost:8080${activeBooking.kamar.image_url}`}
                        alt="Room"
                        className="w-full h-full object-cover"
                     />
                     <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-stone-900 border-0 font-bold px-3 py-1">
                            Floor {activeBooking.kamar.floor}
                        </Badge>
                     </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        {activeBooking.kamar.nomor_kamar} - {activeBooking.kamar.tipe_kamar}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        Pondok Alam, Sigura-gura
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Check In</p>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <ChevronRight className="w-4 h-4 text-emerald-500" />
                                {activeBooking.startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Check Out</p>
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <ChevronRight className="w-4 h-4 text-red-500" />
                                {activeBooking.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/50">
                        <div className="flex items-center gap-3 mb-3">
                            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">Next Due Date</p>
                        </div>
                        <p className="text-3xl font-black text-amber-700 dark:text-amber-300">
                            {activeBooking.dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 italic font-medium">
                            Reminder will be sent 3 days before expiry.
                        </p>
                    </div>

                    <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-6 rounded-xl shadow-xl transition-all">
                        Extend Stay
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Info className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Booking</h3>
                <p className="text-sm text-slate-400 max-w-[200px]">Select a date to view your room status and important dates.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats Widget */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-700 to-stone-900 text-white rounded-3xl overflow-hidden mb-12">
            <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold uppercase tracking-widest text-xs">Stay Summary</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                        <span className="text-stone-300 font-medium tracking-wide">Active Bookings</span>
                        <span className="font-black text-xl">{processedBookings.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                        <span className="text-stone-300 font-medium tracking-wide">Next Expiry</span>
                        <span className="font-bold text-amber-400 uppercase tracking-tighter">
                            {processedBookings.length > 0 ? processedBookings[0].endDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
                        </span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
