"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/shared/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { ExtendBooking } from './extend-booking';
import { CancelBooking } from './cancel-booking';
import { Calendar as CalendarUI } from '@/app/components/ui/calendar';
import {
  Calendar,
  MapPin,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Trash2,
  Loader2,
  Info,
  ChevronDown,
  Home,
  Wallet,
  Upload,
  Search
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs-component";
import { UploadProofModal } from '../booking/upload-proof-modal';
import { BookingDetailsModal } from '../booking/booking-details-modal';
import { useHistory } from './hooks/useHistory';

export function BookingHistory() {
  const {
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    calendarExpanded,
    setCalendarExpanded,
    extendModalOpen,
    setExtendModalOpen,
    cancelModalOpen,
    setCancelModalOpen,
    uploadModalOpen,
    setUploadModalOpen,
    viewDetailsModalOpen,
    setViewDetailsModalOpen,
    selectedBooking,
    selectedPaymentId,
    setSelectedPaymentId,
    bookings,
    reminders,
    activeBooking,
    isLoading,
    isLoadingReminders,
    handleExtendClick,
    handleCancelClick,
    handleViewDetails,
    refreshData
  } = useHistory();

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
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {[
            {
              label: 'Total Rooms',
              value: bookings.length.toString(),
              icon: <Home className="w-6 h-6" />,
              delay: 0
            },
            {
              label: 'Completed Bills',
              value: bookings.filter(b => b.rawStatus === 'Confirmed').length.toString(),
              icon: <CheckCircle2 className="w-6 h-6" />,
              delay: 0.1
            },
            {
              label: 'Pending Bills',
              value: bookings.filter(b => b.rawStatus === 'Pending').length.toString(),
              icon: <Clock className="w-6 h-6" />,
              delay: 0.2
            },
            {
              label: 'Total Expenses',
              value: `Rp ${bookings.reduce((sum, b) => sum + b.totalPaid, 0).toLocaleString()}`,
              icon: <Wallet className="w-6 h-6" />,
              delay: 0.3
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-stone-50 dark:bg-slate-800 flex items-center justify-center text-stone-900 dark:text-white group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-stone-900 transition-colors duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {stat.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-full">
              <TabsTrigger value="bookings" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-stone-900 dark:data-[state=active]:bg-stone-800 dark:data-[state=active]:text-white">Active Bookings</TabsTrigger>
              <TabsTrigger value="bills" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-stone-900 dark:data-[state=active]:bg-stone-800 dark:data-[state=active]:text-white relative">
                My Bills
                {reminders.filter(r => r.status_reminder !== 'Paid').length > 0 && (
                   <span className="absolute -top-1 -right-1 flex h-4 w-4">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 text-[10px] text-white items-center justify-center font-bold">
                       {reminders.filter(r => r.status_reminder !== 'Paid').length}
                     </span>
                   </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bookings" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mb-8"
            >
              <Card className="border-0 dark:border dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setCalendarExpanded(!calendarExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-stone-700 to-stone-900 rounded-lg flex items-center justify-center shadow-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Bookings Calendar</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: calendarExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-slate-400" />
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
                      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-7">
                            <Card className="border-0 shadow-lg bg-slate-50 dark:bg-slate-800/50 overflow-hidden rounded-xl">
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

                          <div className="lg:col-span-5 space-y-4">
                            <AnimatePresence mode="wait">
                              {activeBooking ? (
                                <motion.div
                                  key={activeBooking.id}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                >
                                  <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                                    <div className="relative h-32">
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
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-base font-bold">
                                        {activeBooking.roomName}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                          <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Check In</p>
                                          <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                            {activeBooking.startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                          </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                          <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Check Out</p>
                                          <p className="font-semibold text-xs text-slate-900 dark:text-white">
                                            {activeBooking.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
                                        <p className="text-[9px] font-bold text-amber-900 dark:text-amber-200 uppercase mb-1">Due: {activeBooking.dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
                                          {activeBooking.dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                      </div>

                                      <Button
                                        onClick={() => handleExtendClick(activeBooking)}
                                        className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2 text-sm rounded-lg shadow-lg transition-all"
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
              className="space-y-5 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.15, delayChildren: 0.4 }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 text-stone-600 animate-spin" />
                  <p className="text-slate-500 font-medium italic">Syncing your luxury reservations...</p>
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

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                          <motion.div
                            className="p-3 md:p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all"
                            whileHover={{ y: -2 }}
                          >
                            <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 md:mb-2 uppercase tracking-wide">Check-in</p>
                            <div className="flex items-center gap-1.5 md:gap-2 text-slate-900 dark:text-white">
                              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-stone-900 dark:text-slate-400" />
                              <span className="font-semibold text-xs md:text-base">{new Date(booking.moveInDate).toLocaleDateString('en-GB')}</span>
                            </div>
                          </motion.div>

                          <motion.div
                            className="p-3 md:p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all"
                            whileHover={{ y: -2 }}
                          >
                            <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 font-semibold mb-1 md:mb-2 uppercase tracking-wide">Check-out</p>
                            <div className="flex items-center gap-1.5 md:gap-2 text-slate-900 dark:text-white">
                              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-stone-900 dark:text-slate-400" />
                              <span className="font-semibold text-xs md:text-base">{new Date(booking.moveOutDate).toLocaleDateString('en-GB')}</span>
                            </div>
                          </motion.div>

                          <motion.div
                            className="p-3 md:p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50 hover:shadow-md transition-all"
                            whileHover={{ y: -2 }}
                          >
                            <p className="text-[10px] md:text-xs text-purple-700 dark:text-purple-400 font-semibold mb-1 md:mb-2 uppercase tracking-wide">Duration</p>
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Clock className="w-4 h-4 md:w-5 md:h-5 text-purple-700 dark:text-purple-400" />
                              <span className="font-semibold text-xs md:text-base text-purple-900 dark:text-purple-200">{booking.duration}</span>
                            </div>
                          </motion.div>

                          <motion.div
                            className="p-3 md:p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-md transition-all"
                            whileHover={{ y: -2 }}
                          >
                            <p className="text-[10px] md:text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1 md:mb-2 uppercase tracking-wide">Monthly</p>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-emerald-900 dark:text-emerald-200 text-[10px] md:text-sm">Rp</span>
                              <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm md:text-lg">{booking.monthlyRent.toLocaleString()}</span>
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
                                onClick={() => handleViewDetails(booking)}
                                className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold shadow-md hover:shadow-lg transition-all dark:text-white"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </motion.div>
                            
                            {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                                <>
                                    {(booking.status === 'Confirmed' || booking.status === 'Pending') && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                          <Button
                                            onClick={() => handleExtendClick(booking)}
                                            className="bg-gradient-to-r from-stone-700 to-stone-900 dark:from-stone-600 dark:to-stone-800 hover:from-stone-600 hover:to-stone-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                          >
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Extend
                                          </Button>
                                        </motion.div>
                                    )}

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

                                    {booking.status === 'Pending' && booking.pendingPaymentId && (
                                       <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                          <Button
                                            onClick={() => {
                                              if (booking.pendingPaymentId) {
                                                setSelectedPaymentId(booking.pendingPaymentId);
                                                setUploadModalOpen(true);
                                              }
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                          >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Proof
                                          </Button>
                                       </motion.div>
                                    )}
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

            {!isLoading && bookings.length === 0 && activeTab === "bookings" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-stone-50 dark:from-slate-900 dark:to-slate-950 border-0 dark:border dark:border-slate-800 shadow-lg">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Calendar className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No bookings yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                    Start your journey to premium living. Explore our collection of luxury boarding houses and apartments.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-gradient-to-r from-stone-700 to-stone-900 dark:from-stone-600 dark:to-stone-800 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all">
                      <Search className="w-4 h-4 mr-2" />
                      Browse Rooms
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="bills">
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.4 }}
             >
                {isLoadingReminders ? (
                   <div className="flex flex-col items-center justify-center py-20">
                     <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
                     <p className="mt-4 text-slate-500">Loading bills...</p>
                   </div>
                ) : reminders.length === 0 ? (
                   <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                       <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Due Bills</h3>
                     <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">Great! You have no pending bills at the moment.</p>
                   </div>
                ) : (
                   <div className="grid gap-6">
                     {reminders.map((reminder) => (
                       <Card key={reminder.id} className="p-6 border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                           <div>
                             <div className="flex items-center gap-3 mb-2">
                               <Badge variant={reminder.status_reminder === 'Paid' ? 'default' : 'secondary'} className={
                                 reminder.status_reminder === 'Paid' 
                                   ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                                   : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                               }>
                                 {reminder.status_reminder === 'Paid' ? 'Paid' : 'Unpaid'}
                               </Badge>
                               <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                                 ID: #{reminder.id}
                               </span>
                             </div>
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                               Monthly Rent Bill
                             </h3>
                             <p className="text-slate-500 dark:text-slate-400 text-sm">
                               Due Date: {new Date(reminder.tanggal_reminder).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                             </p>
                           </div>
                           
                           <div className="flex flex-col items-end gap-2">
                             <p className="text-2xl font-bold text-slate-900 dark:text-white">
                               Rp {reminder.jumlah_bayar.toLocaleString()}
                             </p>
                             {reminder.status_reminder !== 'Paid' && (
                               <Button 
                                 size="sm" 
                                 onClick={() => {
                                   setSelectedPaymentId(reminder.pembayaran_id);
                                   setUploadModalOpen(true);
                                 }} 
                                 className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20"
                               >
                                 Pay Now
                               </Button>
                             )}
                           </div>
                         </div>
                       </Card>
                     ))}
                   </div>
                )}
             </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          isOpen={viewDetailsModalOpen}
          onClose={() => setViewDetailsModalOpen(false)}
          booking={selectedBooking as unknown as Parameters<typeof BookingDetailsModal>[0]['booking']}
        />
      )}

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
          onSuccess={refreshData}
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
            status: selectedBooking.status,
          }}
          onSuccess={refreshData}
        />
      )}

      {selectedPaymentId && (
        <UploadProofModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          paymentId={selectedPaymentId}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}