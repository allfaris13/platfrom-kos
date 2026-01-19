import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ImageWithFallback } from '@/app/components/gambar/ImageWithFallback';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ExtendBooking } from './extend-booking';
import { CancelBooking } from './cancel-booking';
import { 
  Calendar, 
  MapPin, 
  DollarSign,
  Eye,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Star,
  Trash2
} from 'lucide-react';

interface Booking {
  id: string;
  roomName: string;
  roomImage: string;
  location: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  moveInDate: string;
  moveOutDate: string;
  monthlyRent: number;
  totalPaid: number;
  duration: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    roomName: 'Deluxe Suite #12',
    roomImage: 'https://images.unsplash.com/photo-1668512624222-2e375314be39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBib2FyZGluZyUyMGhvdXNlJTIwYmVkcm9vbXxlbnwxfHx8fDE3Njg1NzcyMzF8MA&ixlib=rb-4.1.0&q=80&w=400',
    location: 'Downtown District',
    status: 'Confirmed',
    moveInDate: '2026-02-01',
    moveOutDate: '2026-08-01',
    monthlyRent: 1200,
    totalPaid: 2400,
    duration: '6 months'
  },
  {
    id: '2',
    roomName: 'Modern Studio #24',
    roomImage: 'https://images.unsplash.com/photo-1662454419736-de132ff75638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY4NTc3MjMxfDA&ixlib=rb-4.1.0&q=80&w=400',
    location: 'University Area',
    status: 'Pending',
    moveInDate: '2026-03-01',
    moveOutDate: '2026-06-01',
    monthlyRent: 800,
    totalPaid: 1600,
    duration: '3 months'
  },
  {
    id: '3',
    roomName: 'Premium Apartment #8',
    roomImage: 'https://images.unsplash.com/photo-1507138451611-3001135909fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc2ODUwNTcxM3ww&ixlib=rb-4.1.0&q=80&w=400',
    location: 'Business District',
    status: 'Completed',
    moveInDate: '2025-08-01',
    moveOutDate: '2026-01-01',
    monthlyRent: 1500,
    totalPaid: 9000,
    duration: '6 months'
  },
];

interface BookingHistoryProps {
  onViewRoom: (roomId: string) => void;
}

export function BookingHistory({ onViewRoom }: BookingHistoryProps) {
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
            { label: 'Total Bookings', value: '3', icon: '📅', color: 'from-stone-700 to-stone-900', bgColor: 'from-stone-50 to-stone-100 dark:from-slate-900 dark:to-slate-900' },
            { label: 'Active', value: '1', icon: '✓', color: 'from-emerald-500 to-emerald-600', bgColor: 'from-emerald-50 to-emerald-100 dark:from-slate-900 dark:to-slate-900' },
            { label: 'Pending', value: '1', icon: '⏳', color: 'from-amber-500 to-amber-600', bgColor: 'from-amber-50 to-amber-100 dark:from-slate-900 dark:to-slate-900' },
            { label: 'Total Spent', value: '$13,000', icon: '💰', color: 'from-blue-500 to-blue-600', bgColor: 'from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-900' },
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

        {/* Bookings List */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.15, delayChildren: 0.4 }}
        >
          {mockBookings.map((booking, index) => (
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
                          <DollarSign className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 text-lg">{booking.monthlyRent.toLocaleString()}</span>
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Total Amount Paid</p>
                          <p className="text-4xl font-bold bg-gradient-to-r from-stone-700 to-stone-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                            ${booking.totalPaid.toLocaleString()}
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
        {mockBookings.length === 0 && (
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
            status: selectedBooking.status,
          }}
        />
      )}
    </div>
  );
}