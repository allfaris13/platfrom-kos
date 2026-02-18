import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { api, PaymentReminder, Payment, Booking } from '@/app/services/api';
import { getImageUrl } from '@/app/utils/api-url';

export interface UIBooking {
  id: string;
  roomName: string;
  roomImage: string;
  location: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  status_pemesanan: string;
  moveInDate: string;
  moveOutDate: string;
  monthlyRent: number;
  totalPaid: number;
  duration: string;
  rawStatus?: string;
  pendingPaymentId?: number;
  payments?: Payment[];
  startDate: Date;
  endDate: Date;
  dueDate: Date;
}

export function useHistory() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  
  // Modal States
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<UIBooking | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  // Data Fetching with SWR
  const { 
    data: bookingsData, 
    isLoading: isLoadingBookings, 
    mutate: mutateBookings 
  } = useSWR('api/my-bookings', api.getMyBookings);

  const { 
    data: remindersData, 
    isLoading: isLoadingReminders 
  } = useSWR('api/reminders', api.getReminders);

  const mappedBookings = useMemo(() => {
    if (!bookingsData || !Array.isArray(bookingsData)) return [];
    
    return bookingsData.map((b: Booking) => {
      const moveIn = new Date(b.tanggal_mulai);
      const moveOut = new Date(moveIn);
      moveOut.setMonth(moveOut.getMonth() + b.durasi_sewa);

      const pendingPayment = b.pembayaran?.find((p: Payment) => p.status_pembayaran === 'Pending');

      const start = new Date(b.tanggal_mulai);
      const end = new Date(moveOut);
      const due = new Date(end);
      due.setDate(due.getDate() - 3);

      return {
        id: b.id.toString(),
        roomName: `${b.kamar?.nomor_kamar || 'Kamar'} - ${b.kamar?.tipe_kamar || ''}`,
        roomImage: getImageUrl(b.kamar?.image_url),
        location: `Floor ${b.kamar?.floor || '-'}`,
        status: (b.status_pemesanan === 'Confirmed' ? 'Confirmed' : 
                b.status_pemesanan === 'Pending' ? 'Pending' : 
                b.status_pemesanan === 'Cancelled' ? 'Cancelled' : 'Completed') as 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled',
        status_pemesanan: b.status_pemesanan,
        moveInDate: b.tanggal_mulai,
        moveOutDate: moveOut.toISOString().split('T')[0],
        monthlyRent: b.kamar?.harga_per_bulan || 0,
        totalPaid: b.total_bayar || 0,
        duration: `${b.durasi_sewa} Months`,
        rawStatus: b.status_bayar,
        pendingPaymentId: pendingPayment?.id,
        payments: b.pembayaran || [],
        startDate: start,
        endDate: end,
        dueDate: due
      };
    });
  }, [bookingsData]);

  const activeBooking = useMemo(() => {
    if (!selectedDate) return null;
    return mappedBookings.find(b => {
      return selectedDate >= b.startDate && selectedDate <= b.endDate;
    });
  }, [selectedDate, mappedBookings]);

  // Handlers
  const handleExtendClick = useCallback((booking: UIBooking) => {
    setSelectedBooking(booking);
    setExtendModalOpen(true);
  }, []);

  const handleCancelClick = useCallback((booking: UIBooking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  }, []);

  const handleUploadClick = useCallback((paymentId: number) => {
    setSelectedPaymentId(paymentId);
    setUploadModalOpen(true);
  }, []);

  const handleViewDetails = useCallback((booking: UIBooking) => {
    setSelectedBooking(booking);
    setViewDetailsModalOpen(true);
  }, []);

  const refreshData = useCallback(() => {
    mutateBookings();
  }, [mutateBookings]);

  return {
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
    setSelectedBooking,
    selectedPaymentId,
    setSelectedPaymentId,
    bookings: mappedBookings,
    reminders: (remindersData || []) as PaymentReminder[],
    activeBooking,
    isLoading: isLoadingBookings,
    isLoadingReminders,
    handleExtendClick,
    handleCancelClick,
    handleUploadClick,
    handleViewDetails,
    refreshData
  };
}
