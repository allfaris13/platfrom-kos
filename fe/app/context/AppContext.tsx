'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { AppContextType, Room, Booking, User, RoomStatus, BookingStatus, ExtendBookingRequest } from './types';

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial rooms data
const INITIAL_ROOMS: Room[] = [
  {
    id: '1',
    name: 'Deluxe Suite',
    type: 'Deluxe',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1668512624222-2e375314be39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBib2FyZGluZyUyMGhvdXNlJTIwYmVkcm9vbXxlbnwxfHx8fDE3Njg1NzcyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Downtown District',
    rating: 4.8,
    reviews: 124,
    facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker'],
    status: 'Available',
    capacity: 1,
    description: 'Spacious deluxe room with premium amenities'
  },
  {
    id: '2',
    name: 'Modern Studio',
    type: 'Standard',
    price: 800,
    image: 'https://images.unsplash.com/photo-1662454419736-de132ff75638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY4NTc3MjMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'University Area',
    rating: 4.6,
    reviews: 89,
    facilities: ['WiFi', 'AC', 'TV'],
    status: 'Available',
    capacity: 1,
    description: 'Modern and comfortable studio apartment'
  },
  {
    id: '3',
    name: 'Premium Apartment',
    type: 'Premium',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1507138451611-3001135909fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGlvJTIwYXBhcnRtZW50fGVufDF8fHx8MTc2ODUwNTcxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Business District',
    rating: 4.9,
    reviews: 156,
    facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker'],
    status: 'Occupied',
    capacity: 2,
    description: 'Luxury premium apartment with full facilities'
  },
  {
    id: '4',
    name: 'Executive Suite',
    type: 'Executive',
    price: 2000,
    image: 'https://images.unsplash.com/photo-1661258279966-cfeb51c98327?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwaG90ZWwlMjByb29tfGVufDF8fHx8MTc2ODUzMDkzMXww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Luxury Quarter',
    rating: 5.0,
    reviews: 203,
    facilities: ['WiFi', 'AC', 'TV', 'Coffee Maker'],
    status: 'Available',
    capacity: 2,
    description: 'Top-tier executive suite with premium services'
  }
];

const STORAGE_ROOMS_KEY = 'app_rooms';
const STORAGE_BOOKINGS_KEY = 'app_bookings';
const STORAGE_CURRENT_USER_KEY = 'app_current_user';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedRooms = localStorage.getItem(STORAGE_ROOMS_KEY);
    const storedBookings = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    const storedUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY);

    if (storedRooms) {
      try {
        setRooms(JSON.parse(storedRooms));
      } catch {
        setRooms(INITIAL_ROOMS);
      }
    } else {
      setRooms(INITIAL_ROOMS);
    }

    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings));
      } catch {
        setBookings([]);
      }
    }

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  // Persist rooms to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(rooms));
  }, [rooms]);

  // Persist bookings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);

  // Persist current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  }, [currentUser]);

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
    updateBooking(request.bookingId, {
      moveOutDate: request.newEndDate,
      totalPaid: bookings.find(b => b.id === request.bookingId)?.totalPaid! + request.additionalCost,
      status: 'Active'
    });
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
