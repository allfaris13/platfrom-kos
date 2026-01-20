/**
 * Global State Types untuk aplikasi Kos-Kosan
 * Frontend-only dengan LocalStorage persistence
 */

export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';

export interface Room {
  id: string;
  name: string;
  type: 'Standard' | 'Deluxe' | 'Premium' | 'Executive';
  price: number;
  image: string;
  location: string;
  rating: number;
  reviews: number;
  facilities: string[];
  status: RoomStatus;
  capacity: number;
  description?: string;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  moveInDate: string;
  moveOutDate: string;
  monthlyRent: number;
  totalPaid: number;
  duration: string; // e.g "6 months"
  status: BookingStatus;
  createdAt: string;
  notes?: string;
}

export interface ExtendBookingRequest {
  bookingId: string;
  additionalMonths: number;
  newEndDate: string;
  additionalCost: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  role: 'tenant' | 'admin';
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

export interface AppContextType {
  // Room Management
  rooms: Room[];
  getRoomById: (roomId: string) => Room | undefined;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  getAllRooms: () => Room[];

  // Booking Management
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  getBookingsByUserId: (userId: string) => Booking[];
  getBookingsByStatus: (status: BookingStatus) => Booking[];
  getAllBookings: () => Booking[];
  cancelBooking: (bookingId: string) => void;
  extendBooking: (request: ExtendBookingRequest) => void;

  // User Management
  currentUser: User | null;
  setCurrentUser: (user: User) => void;

  // Stats
  getTotalBookings: () => number;
  getTotalRevenue: () => number;
  getActiveBookings: () => number;
  getOccupiedRooms: () => number;
}
