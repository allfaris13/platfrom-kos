'use client';

import React, { createContext, useState, useCallback } from 'react';
import { AppContextType, Room, Booking, User, RoomStatus, BookingStatus, ExtendBookingRequest } from './types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

// REMOVED: Mock data to prevent desync with backend API
// All data now comes exclusively from the backend

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // State initialized empty - will be populated from API
  const [rooms, setRooms] = useState<Room[]>([]);

  // All state initialized empty - populated from API only
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Room Management Functions
  const getRoomById = useCallback((roomId: string) => {
    return rooms.find(room => room.id === roomId);
  }, [rooms]);

  const updateRoomStatus = useCallback((roomId: string, status: RoomStatus) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId ? { ...room, status } : room
      )
    );
  }, []);

  const getAllRooms = useCallback(() => {
    return rooms;
  }, [rooms]);

  // Booking Management Functions
  const addBooking = useCallback((booking: Booking) => {
    setBookings(prevBookings => [...prevBookings, booking]);
    // Update room status to Occupied
    updateRoomStatus(booking.roomId, 'Occupied');
  }, [updateRoomStatus]);

  const updateBooking = useCallback((bookingId: string, updates: Partial<Booking>) => {
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      )
    );
  }, []);

  const getBookingsByUserId = useCallback((userId: string) => {
    return bookings.filter(booking => booking.userId === userId);
  }, [bookings]);

  const getBookingsByStatus = useCallback((status: BookingStatus) => {
    return bookings.filter(booking => booking.status === status);
  }, [bookings]);

  const getAllBookings = useCallback(() => {
    return bookings;
  }, [bookings]);

  const cancelBooking = useCallback((bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      updateBooking(bookingId, { status: 'Cancelled' });
      // Update room status back to Available
      updateRoomStatus(booking.roomId, 'Available');
    }
  }, [bookings, updateBooking, updateRoomStatus]);

  const extendBooking = useCallback((request: ExtendBookingRequest) => {
    const booking = bookings.find(b => b.id === request.bookingId);
    if (booking) {
      updateBooking(request.bookingId, {
        moveOutDate: request.newEndDate,
        totalPaid: booking.totalPaid + request.additionalCost,
        status: 'Active'
      });
    }
  }, [bookings, updateBooking]);

  // Stats Functions
  const getTotalBookings = useCallback(() => {
    return bookings.length;
  }, [bookings]);

  const getTotalRevenue = useCallback(() => {
    return bookings.reduce((total, booking) => total + booking.totalPaid, 0);
  }, [bookings]);

  const getActiveBookings = useCallback(() => {
    return bookings.filter(b => b.status === 'Active' || b.status === 'Confirmed').length;
  }, [bookings]);

  const getOccupiedRooms = useCallback(() => {
    return rooms.filter(r => r.status === 'Occupied').length;
  }, [rooms]);

  const contextValue: AppContextType = {
    // Room Management
    rooms,
    getRoomById,
    updateRoomStatus,
    getAllRooms,

    // Booking Management
    bookings,
    addBooking,
    updateBooking,
    getBookingsByUserId,
    getBookingsByStatus,
    getAllBookings,
    cancelBooking,
    extendBooking,

    // User Management
    currentUser,
    setCurrentUser,

    // Stats
    getTotalBookings,
    getTotalRevenue,
    getActiveBookings,
    getOccupiedRooms,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
