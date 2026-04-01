"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageCircle, TrendingUp, DollarSign, Home, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { api } from '@/app/services/api';
import { getImageUrl } from '@/app/utils/api-url';
import { useTranslations } from 'next-intl';

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

interface BookingStatsDetailProps {
  bookings?: Booking[];
  onBack: () => void;
}

export function BookingStatsDetail({ bookings: initialBookings, onBack }: BookingStatsDetailProps) {
  const t = useTranslations('history');
  const [bookings, setBookings] = useState<Booking[]>(initialBookings || []);
  const [isLoading, setIsLoading] = useState(!initialBookings || initialBookings.length === 0);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 4));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(2026, 1, 4));

  // Fetch bookings if not provided
  useEffect(() => {
    if (initialBookings && initialBookings.length > 0) {
      setBookings(initialBookings);
      setIsLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const data = await api.getMyBookings();
        
        const mapped = data.map((b) => {
          const moveIn = new Date(b.tanggal_mulai);
          const moveOut = new Date(moveIn);
          moveOut.setMonth(moveOut.getMonth() + b.durasi_sewa);
          
          const room = b.kamar || { 
            nomor_kamar: '?', 
            tipe_kamar: 'Unknown', 
            image_url: '', 
            floor: 0, 
            harga_per_bulan: 0 
          };

          return {
            id: b.id.toString(),
            roomName: room.nomor_kamar + " - " + room.tipe_kamar,
            roomImage: getImageUrl(room.image_url) || '',
            location: `Floor ${room.floor}`,
            status: b.status_bayar === 'Confirmed' ? 'Confirmed' : (b.status_bayar === 'Pending' ? 'Pending' : 'Completed'),
            moveInDate: b.tanggal_mulai,
            moveOutDate: moveOut.toISOString().split('T')[0],
            monthlyRent: room.harga_per_bulan,
            totalPaid: b.total_bayar || 0,
            duration: b.durasi_sewa.toString(),
            rawStatus: b.status_bayar || 'Pending'
          };
        });
        setBookings(mapped);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [initialBookings]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = bookings.filter(b => b.rawStatus === 'Confirmed').length;
    const pending = bookings.filter(b => b.rawStatus === 'Pending').length;
    const total = bookings.reduce((sum, b) => sum + b.totalPaid, 0);
    const averagePerMonth = bookings.length > 0 ? total / bookings.length : 0;

    return { total: bookings.length, completed, pending, totalSpent: total, averagePerMonth };
  }, [bookings]);

  // Calendar logic
  const monthYear = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  interface BookingEvent {
    type: 'move-in' | 'move-out' | 'active';
    booking: Booking;
  }

  // Get booking events for calendar
  const bookingEventsByDay = useMemo(() => {
    const eventMap: Record<number, BookingEvent[]> = {};
    
    bookings.forEach(booking => {
      const startDate = new Date(booking.moveInDate);
      const endDate = new Date(booking.moveOutDate);

      // Mark start, end, and all days in between
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const day = d.getDate();
        if (d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()) {
          if (!eventMap[day]) eventMap[day] = [];
          
          if (d.getTime() === startDate.getTime()) {
            eventMap[day].push({ type: 'move-in', booking });
          } else if (d.getTime() === endDate.getTime()) {
            eventMap[day].push({ type: 'move-out', booking });
          } else {
            eventMap[day].push({ type: 'active', booking });
          }
        }
      }
    });

    return eventMap;
  }, [bookings, currentDate]);

  // Find active booking on selected date
  const activeBookingOnDate = useMemo(() => {
    if (!selectedDate) return null;
    return bookings.find(b => {
      const start = new Date(b.moveInDate);
      const end = new Date(b.moveOutDate);
      return selectedDate >= start && selectedDate <= end;
    });
  }, [selectedDate, bookings]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleRegisterWhatsApp = () => {
    const message = "Halo Admin, saya ingin mendaftarkan nomor saya untuk notifikasi pemesanan.";
    window.open(`https://wa.me/6281239450638?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-stone-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading your booking statistics...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-stone-700 hover:text-stone-900 dark:text-slate-300 dark:hover:text-white font-semibold mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to My Bookings
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-14 h-14 bg-gradient-to-br from-stone-700 to-stone-900 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <TrendingUp className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Booking Statistics</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Detailed insights and smart calendar</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Detailed Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="space-y-4">
              {/* Total Bookings */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="bg-gradient-to-br from-stone-700 to-stone-900 p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <Home className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-sm font-semibold text-stone-200 uppercase tracking-wide mb-1">Total Rooms Booked</p>
                  <p className="text-4xl font-bold mb-2">{stats.total}</p>
                  <p className="text-xs text-stone-200">Active & Completed</p>
                </div>
              </Card>

              {/* Confirmed Bookings */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle2 className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-sm font-semibold text-emerald-100 uppercase tracking-wide mb-1">Confirmed</p>
                  <p className="text-4xl font-bold mb-2">{stats.completed}</p>
                  <p className="text-xs text-emerald-100">Payment verified</p>
                </div>
              </Card>

              {/* Pending Bookings */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <Clock className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-sm font-semibold text-amber-100 uppercase tracking-wide mb-1">Pending Bills</p>
                  <p className="text-4xl font-bold mb-2">{stats.pending}</p>
                  <p className="text-xs text-amber-100">Awaiting confirmation</p>
                </div>
              </Card>

              {/* Total Spent */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide mb-1">Total Spent</p>
                  <p className="text-2xl font-bold mb-2">Rp {stats.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-blue-100">All bookings combined</p>
                </div>
              </Card>

              {/* Average per Booking */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp className="w-6 h-6 opacity-80" />
                  </div>
                  <p className="text-sm font-semibold text-purple-100 uppercase tracking-wide mb-1">Avg per Booking</p>
                  <p className="text-2xl font-bold mb-2">Rp {stats.averagePerMonth.toLocaleString()}</p>
                  <p className="text-xs text-purple-100">Average cost</p>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Right: Smart Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-stone-700 to-stone-900 p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Smart Calendar</h2>
                    <p className="text-stone-200 text-sm mt-1">Track your bookings at a glance</p>
                  </div>
                  <Button
                    onClick={handleRegisterWhatsApp}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Alerts
                  </Button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-bold capitalize">{monthYear}</h3>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-slate-600 dark:text-slate-400 text-sm py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {emptyDays.map(i => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {days.map(day => {
                    const events = bookingEventsByDay[day] || [];
                    const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
                    const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

                    return (
                      <motion.button
                        key={day}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                        className={`aspect-square rounded-lg font-semibold transition-all flex flex-col items-center justify-center text-sm relative group ${
                          isSelected
                            ? 'bg-stone-900 text-white shadow-lg dark:bg-white dark:text-stone-900'
                            : isToday
                            ? 'border-2 border-stone-700 dark:border-white bg-stone-50 dark:bg-slate-800'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white'
                        }`}
                      >
                        <span>{day}</span>
                        {events.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap justify-center">
                            {events.slice(0, 2).map((event, idx) => (
                              <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  event.type === 'move-in'
                                    ? 'bg-emerald-500'
                                    : event.type === 'move-out'
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                                }`}
                              />
                            ))}
                            {events.length > 2 && (
                              <span className="text-xs text-slate-500">+{events.length - 2}</span>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Legend:</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Move-in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Move-out</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Details */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 p-6">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
                    {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  
                  {activeBookingOnDate ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Active Booking</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{activeBookingOnDate.roomName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Check-in</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{activeBookingOnDate.moveInDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-1">Check-out</p>
                          <p className="font-semibold text-slate-900 dark:text-white">{activeBookingOnDate.moveOutDate}</p>
                        </div>
                      </div>
                      <div>
                        <Badge className={`mt-3 ${
                          activeBookingOnDate.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {activeBookingOnDate.status}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-500 dark:text-slate-400">No booking on this date</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* All Bookings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">All Your Bookings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{booking.roomName}</h3>
                      <Badge className={
                        booking.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{booking.location}</p>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Check-in</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{booking.moveInDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Duration</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{booking.duration} {t('months')}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Monthly Rent:</span>
                        <span className="font-bold text-slate-900 dark:text-white">Rp {booking.monthlyRent.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-slate-600 dark:text-slate-400">Total Paid:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Rp {booking.totalPaid.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
