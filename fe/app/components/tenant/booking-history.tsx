import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ExtendBooking } from './extend-booking';
import { CancelBooking } from './cancel-booking';
import { Calendar as CalendarUI } from '@/app/components/ui/calendar';
import { 
  Calendar, 
  MapPin, 
  Eye,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Trash2,
  Loader2,
  MessageCircle,
  Bell,
  ChevronRight,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '@/app/services/api';
import { useEffect } from 'react';

interface Booking {
  id: string;
  roomName: string;
  roomImage: string;
  location: string;
  status: string;
  moveInDate: string;
  moveOutDate: string;
  monthlyRent: number;
  totalPaid: number;
  duration: string;
  rawStatus: string;
}

interface KamarData {
  nomor_kamar: string;
  tipe_kamar: string;
  image_url: string;
  floor: number;
  harga_per_bulan: number;
}


interface BookingHistoryProps {
  onViewRoom: (roomId: string) => void;
}

export function BookingHistory({ onViewRoom }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarExpanded, setCalendarExpanded] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await api.getMyBookings();
        const mapped = data.map((b: { id: number; kamar: KamarData; tanggal_mulai: string; durasi_sewa: number; status_bayar: string; total_bayar: number }) => {
          const moveIn = new Date(b.tanggal_mulai);
          const moveOut = new Date(moveIn);
          moveOut.setMonth(moveOut.getMonth() + b.durasi_sewa);

          return {
            id: b.id.toString(),
            roomName: b.kamar.nomor_kamar + " - " + b.kamar.tipe_kamar,
            roomImage: b.kamar.image_url.startsWith('http') ? b.kamar.image_url : `http://localhost:8080${b.kamar.image_url}`,
            location: `Floor ${b.kamar.floor}`,
            status: b.status_bayar === 'Confirmed' ? 'Confirmed' : (b.status_bayar === 'Pending' ? 'Pending' : 'Completed'),
            moveInDate: b.tanggal_mulai,
            moveOutDate: moveOut.toISOString().split('T')[0],
            monthlyRent: b.kamar.harga_per_bulan,
            totalPaid: b.total_bayar,
            duration: `${b.durasi_sewa} Months`,
            rawStatus: b.status_bayar
          };
        });
        setBookings(mapped);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Process bookings for calendar with start/end/due dates
  const processedBookings = useMemo(() => {
    return bookings.map(b => {
      const start = new Date(b.moveInDate);
      const end = new Date(b.moveOutDate);
      const due = new Date(end);
      due.setDate(due.getDate() - 3);

      return {
        ...b,
        startDate: start,
        endDate: end,
        dueDate: due
      };
    });
  }, [bookings]);

  // Find booking active on selected date
  const activeBooking = useMemo(() => {
    if (!selectedDate) return null;
    return processedBookings.find(b => {
      return selectedDate >= b.startDate && selectedDate <= b.endDate;
    });
  }, [selectedDate, processedBookings]);

  // WhatsApp notification registration
  const handleRegisterWhatsApp = () => {
    const message = "Halo Admin Rahmat ZAW, saya ingin mendaftarkan nomor saya untuk notifikasi kalender pintar.";
    window.open(`https://wa.me/628124911926?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleExtendClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setExtendModalOpen(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle2 className="w-5 h-5" />;
      case 'Pending': return <Clock className="w-5 h-5" />;
      case 'Completed': return <CheckCircle2 className="w-5 h-5" />;
      case 'Cancelled': return <XCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Pending': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Completed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors overflow-x-hidden min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-stone-700 to-stone-900 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Calendar className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">My Bookings</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Track and manage all your rental reservations</p>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {[
            { label: 'Number Room', value: bookings.length.toString(), icon: '🏠', color: 'from-stone-700 to-stone-900', bgColor: 'from-stone-50 to-stone-100 dark:from-slate-900 dark:to-slate-900' },
            { label: 'Bill Completed', value: bookings.filter(b => b.rawStatus === 'Confirmed').length.toString(), icon: '✓', color: 'from-emerald-500 to-emerald-600', bgColor: 'from-emerald-50 to-emerald-100 dark:from-slate-900 dark:to-slate-900' },
            { label: 'Pending Bills', value: bookings.filter(b => b.rawStatus === 'Pending').length.toString(), icon: '⏳', color: 'from-amber-500 to-amber-600', bgColor: 'from-amber-50 to-amber-100 dark:from-slate-900 dark:to-slate-900' },
            { label: 'Total', value: `Rp ${bookings.reduce((sum, b) => sum + b.totalPaid, 0).toLocaleString()}`, icon: '💰', color: 'from-blue-500 to-blue-600', bgColor: 'from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-900' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className={`p-6 bg-gradient-to-br ${stat.bgColor} border-0 dark:border dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold mb-2 uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Smart Calendar Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <Card className="border-0 dark:border dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <div 
              className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => setCalendarExpanded(!calendarExpanded)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-stone-700 to-stone-900 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Calendar</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">View your bookings timeline and upcoming due dates</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: calendarExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-6 h-6 text-slate-400" />
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
              {calendarExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 border-t border-slate-200 dark:border-slate-800">
                    {/* WhatsApp Alert Button */}
                    <div className="mb-6 flex justify-end">
                      <Button 
                        onClick={handleRegisterWhatsApp}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Enable WhatsApp Alerts
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Calendar */}
                      <div className="lg:col-span-8">
                        <Card className="border-0 shadow-xl bg-slate-50 dark:bg-slate-800/50 overflow-hidden rounded-2xl">
                          <CardContent className="p-0">
                            <CalendarUI
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              className="p-6 w-full"
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
                                head_cell: "text-slate-400 dark:text-slate-500 rounded-md w-full font-medium text-[0.8rem] uppercase tracking-widest",
                                row: "flex w-full mt-2",
                                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full",
                                day: "h-14 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center cursor-pointer",
                                day_selected: "bg-stone-900 text-white hover:bg-stone-800 focus:bg-stone-900 focus:text-white dark:bg-white dark:text-stone-900 dark:hover:bg-slate-200",
                                day_today: "bg-slate-200 dark:bg-slate-700 text-stone-900 dark:text-white font-bold border-2 border-stone-300 dark:border-slate-600",
                                day_outside: "text-slate-300 opacity-50 dark:text-slate-600",
                                day_disabled: "text-slate-300 opacity-50 dark:text-slate-600",
                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                              }}
                            />
                          </CardContent>
                        </Card>
                      </div>

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
                              <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                                <div className="relative h-40">
                                  <ImageWithFallback 
                                    src={activeBooking.roomImage}
                                    alt="Room"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute top-4 right-4">
                                    <Badge className="bg-white/90 backdrop-blur-md text-stone-900 border-0 font-bold px-3 py-1">
                                      {activeBooking.location}
                                    </Badge>
                                  </div>
                                </div>
                                <CardHeader>
                                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    {activeBooking.roomName}
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
                                      <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                                        <ChevronRight className="w-4 h-4 text-emerald-500" />
                                        {activeBooking.startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                      </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Check Out</p>
                                      <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
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

                                  <Button 
                                    onClick={() => handleExtendClick(activeBooking)}
                                    className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-6 rounded-xl shadow-xl transition-all"
                                  >
                                    Extend Stay
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800"
                            >
                              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <Info className="w-8 h-8 text-slate-300" />
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Booking</h3>
                              <p className="text-sm text-slate-400 max-w-[200px]">Select a date to view your room status and important dates.</p>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Stay Summary Widget */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-stone-700 to-stone-900 text-white rounded-2xl overflow-hidden">
                          <CardContent className="p-6">
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Bookings List */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.4 }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-stone-600 animate-spin" />
              <p className="text-slate-500 font-medium italic">Sinking your luxury reservations...</p>
            </div>
          ) : bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -5 }}
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 dark:border dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
                <div className="flex flex-col md:flex-row">
                  {/* Room Image with Overlay */}
                  <motion.div 
                    className="md:w-80 h-56 md:h-auto flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ImageWithFallback
                      src={booking.roomImage}
                      alt={booking.roomName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>

                  {/* Booking Details */}
                  <div className="flex-1 p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                          {booking.roomName}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4 text-stone-900 dark:text-stone-400" />
                          <span className="font-medium">{booking.location}</span>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Badge className={`${getStatusColor(booking.status)} border-2 flex items-center gap-2 px-4 py-2 font-semibold text-sm shadow-md hover:shadow-lg transition-all`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {/* Check-in Card */}
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all"
                        whileHover={{ y: -2 }}
                      >
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2 uppercase tracking-wide">Check-in</p>
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                          <Calendar className="w-5 h-5 text-stone-900 dark:text-slate-400" />
                          <span className="font-semibold">{new Date(booking.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </motion.div>

                      {/* Check-out Card */}
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all"
                        whileHover={{ y: -2 }}
                      >
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mb-2 uppercase tracking-wide">Check-out</p>
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                          <Calendar className="w-5 h-5 text-stone-900 dark:text-slate-400" />
                          <span className="font-semibold">{new Date(booking.moveOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </motion.div>

                      {/* Duration Card */}
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-md transition-all"
                        whileHover={{ y: -2 }}
                      >
                        <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold mb-2 uppercase tracking-wide">Duration</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                          <span className="font-semibold text-purple-900 dark:text-purple-200">{booking.duration}</span>
                        </div>
                      </motion.div>

                      {/* Monthly Card */}
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-md transition-all"
                        whileHover={{ y: -2 }}
                      >
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-2 uppercase tracking-wide">Monthly</p>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Rp</span>
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 text-lg">{booking.monthlyRent.toLocaleString()}</span>
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Total Amount Paid</p>
                          <p className="text-4xl font-bold bg-gradient-to-r from-stone-700 to-stone-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                            Rp {booking.totalPaid.toLocaleString()}
                          </p>
                        </div>
                      </motion.div>

                      <div className="flex gap-3 flex-wrap">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            onClick={() => onViewRoom(booking.id)}
                            className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-md hover:shadow-lg transition-all dark:text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </motion.div>
                        {booking.status === 'Confirmed' && (
                          <>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                onClick={() => handleExtendClick(booking)}
                                className="bg-gradient-to-r from-stone-700 to-stone-900 dark:from-stone-600 dark:to-stone-800 hover:from-stone-600 hover:to-stone-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Extend Booking
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                onClick={() => handleCancelClick(booking)}
                                variant="outline"
                                className="border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 font-semibold shadow-md hover:shadow-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </motion.div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {!isLoading && bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-16 text-center bg-gradient-to-br from-slate-50 to-stone-50 dark:from-slate-900 dark:to-slate-950 border-0 dark:border dark:border-slate-800 shadow-lg">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Calendar className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">No bookings yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg max-w-md mx-auto">
                Start your journey to premium living. Explore our collection of luxury boarding houses and apartments.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-gradient-to-r from-stone-700 to-stone-900 dark:from-stone-600 dark:to-stone-800 text-white font-semibold px-8 py-2.5 shadow-lg hover:shadow-xl transition-all">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Rooms
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modals remain same, they should handle dark mode internally via their components */}
      {selectedBooking && (
        <ExtendBooking 
          isOpen={extendModalOpen}
          onClose={() => setExtendModalOpen(false)}
          bookingData={{
            id: selectedBooking.id,
            roomName: selectedBooking.roomName,
            currentEndDate: selectedBooking.moveOutDate,
            pricePerMonth: selectedBooking.monthlyRent,
            image: selectedBooking.roomImage,
          }}
        />
      )}

      {selectedBooking && (
        <CancelBooking 
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          bookingData={{
            id: selectedBooking.id,
            roomName: selectedBooking.roomName,
            moveOutDate: selectedBooking.moveOutDate,
            monthlyRent: selectedBooking.monthlyRent,
            totalPaid: selectedBooking.totalPaid,
            image: selectedBooking.roomImage,
            duration: selectedBooking.duration,
            status: selectedBooking.status as 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled',
          }}
        />
      )}
    </div>
  );
}