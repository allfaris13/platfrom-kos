# 🌐 Global State Management - React Context API

Dokumentasi lengkap untuk Global State Management di aplikasi Kos-Kosan menggunakan React Context API + LocalStorage.

---

## 📁 Struktur File

```
app/
├── context/
│   ├── index.ts                 # Export semua context
│   ├── types.ts                 # Type definitions
│   ├── AppContext.tsx           # Context + Provider + Logic
│   └── useApp.ts                # Custom Hook
├── layout.tsx                   # Wrap dengan AppProvider
└── components/
    ├── tenant/
    │   ├── booking-flow.tsx     # Contoh: User booking
    │   ├── extend-booking.tsx   # Contoh: Extend stay
    │   └── cancel-booking.tsx   # Contoh: Cancel + refund
    └── admin/
        ├── AdminDashboard.tsx   # Contoh: View bookings
        ├── RoomManagement.tsx   # Contoh: Update room status
        └── FinancialReports.tsx # Contoh: View stats
```

---

## 🚀 Quick Start

### 1. Setup di Layout

```tsx
// app/layout.tsx
import { AppProvider } from './context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
```

### 2. Gunakan di Komponen

```tsx
'use client';
import { useApp } from '@/app/context';

export function MyComponent() {
  const { rooms, bookings, addBooking, getRoomById } = useApp();
  
  // Komponen Anda di sini
}
```

---

## 📚 API Reference

### Room Management

#### `getRoomById(roomId: string): Room | undefined`
Dapatkan data room berdasarkan ID.
```tsx
const room = getRoomById('1');
console.log(room?.name); // "Deluxe Suite"
```

#### `getAllRooms(): Room[]`
Dapatkan semua room.
```tsx
const rooms = getAllRooms();
rooms.forEach(room => console.log(room.name));
```

#### `updateRoomStatus(roomId: string, status: RoomStatus): void`
Update status room (Available, Occupied, Maintenance, Reserved).
```tsx
updateRoomStatus('1', 'Maintenance');
// User langsung melihat status berubah di Homepage
```

---

### Booking Management

#### `addBooking(booking: Booking): void`
Tambah booking baru (User melakukan booking).
```tsx
const booking = {
  id: 'booking-1',
  userId: 'user-123',
  roomId: '1',
  roomName: 'Deluxe Suite',
  roomImage: 'https://...',
  moveInDate: '2026-02-01',
  moveOutDate: '2026-08-01',
  monthlyRent: 1200,
  totalPaid: 7200,
  duration: '6 months',
  status: 'Confirmed' as const,
  createdAt: new Date().toISOString(),
};

addBooking(booking);
// Admin langsung melihat booking di dashboard
```

#### `updateBooking(bookingId: string, updates: Partial<Booking>): void`
Update data booking.
```tsx
updateBooking('booking-1', {
  status: 'Active',
  notes: 'Sudah bayar'
});
```

#### `getAllBookings(): Booking[]`
Dapatkan semua bookings (untuk Admin Dashboard).
```tsx
const allBookings = getAllBookings();
console.log(`Total: ${allBookings.length} bookings`);
```

#### `getBookingsByUserId(userId: string): Booking[]`
Dapatkan bookings user tertentu.
```tsx
const myBookings = getBookingsByUserId('user-123');
```

#### `getBookingsByStatus(status: BookingStatus): Booking[]`
Dapatkan bookings dengan status tertentu.
```tsx
const activeBookings = getBookingsByStatus('Active');
const pendingBookings = getBookingsByStatus('Pending');
```

#### `extendBooking(request: ExtendBookingRequest): void`
Perpanjang booking (User extend stay).
```tsx
extendBooking({
  bookingId: 'booking-1',
  additionalMonths: 3,
  newEndDate: '2026-11-01',
  additionalCost: 3600,
});
// moveOutDate dan totalPaid otomatis terupdate
```

#### `cancelBooking(bookingId: string): void`
Batalkan booking (dengan refund 15%).
```tsx
cancelBooking('booking-1');
// Status jadi 'Cancelled' dan room jadi 'Available'
```

---

### User Management

#### `setCurrentUser(user: User): void`
Set current logged in user.
```tsx
const user = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+62812345678',
  address: 'Jl. Kemang',
  joinDate: '2026-01-18',
  role: 'tenant' as const,
};

setCurrentUser(user);
```

---

### Stats & Analytics

#### `getTotalBookings(): number`
Total jumlah bookings.
```tsx
const total = getTotalBookings(); // 25
```

#### `getTotalRevenue(): number`
Total revenue dari semua bookings.
```tsx
const revenue = getTotalRevenue(); // 45000
```

#### `getActiveBookings(): number`
Jumlah booking yang aktif/confirmed.
```tsx
const active = getActiveBookings(); // 12
```

#### `getOccupiedRooms(): number`
Jumlah kamar yang occupied.
```tsx
const occupied = getOccupiedRooms(); // 3
```

---

## 💾 LocalStorage Persistence

Data otomatis tersimpan ke LocalStorage dengan keys:
- `app_rooms` - Room data
- `app_bookings` - Booking history
- `app_current_user` - Current logged in user

**Data tidak hilang saat:**
- Page refresh
- Browser close
- Page navigation

**Debug di DevTools:**
```
Application → Local Storage → [Your Domain]
```

---

## 🔄 Real-time Data Sync

### User Booking Flow
1. User di Homepage → klik "Book Room"
2. BookingFlow component
3. Klik "Confirm Booking" → `addBooking()` called
4. Booking tersimpan ke global state + localStorage
5. **Room status otomatis jadi "Occupied"**
6. Admin Dashboard langsung tampil booking baru

### Admin Update Room Status
1. Admin di Room Management
2. Klik "Set Maintenance"
3. `updateRoomStatus(roomId, 'Maintenance')` called
4. Room status terupdate di global state + localStorage
5. **User di Homepage instant melihat room status jadi "Maintenance"**
6. Room tidak bisa di-book sampai status berubah

---

## 📋 Data Types

### Room
```tsx
interface Room {
  id: string;
  name: string;
  type: 'Standard' | 'Deluxe' | 'Premium' | 'Executive';
  price: number;
  image: string;
  location: string;
  rating: number;
  reviews: number;
  facilities: string[];
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  capacity: number;
  description?: string;
}
```

### Booking
```tsx
interface Booking {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  moveInDate: string;           // YYYY-MM-DD
  moveOutDate: string;          // YYYY-MM-DD
  monthlyRent: number;
  totalPaid: number;
  duration: string;             // "6 months"
  status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
  notes?: string;
}
```

### User
```tsx
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  role: 'tenant' | 'admin';
}
```

---

## 🎯 Common Patterns

### Pattern 1: User Booking
```tsx
const { addBooking, getRoomById } = useApp();

const confirmBooking = (roomId, checkIn, checkOut) => {
  const room = getRoomById(roomId);
  const months = calculateMonths(checkIn, checkOut);
  
  addBooking({
    id: `booking-${Date.now()}`,
    userId: 'user-123',
    roomId: room.id,
    roomName: room.name,
    roomImage: room.image,
    moveInDate: checkIn,
    moveOutDate: checkOut,
    monthlyRent: room.price,
    totalPaid: months * room.price,
    duration: `${months} months`,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  });
};
```

### Pattern 2: Admin View Bookings
```tsx
const { getAllBookings, getTotalRevenue } = useApp();

const dashboard = () => {
  const bookings = getAllBookings();
  const revenue = getTotalRevenue();
  
  return (
    <div>
      <h2>Total Bookings: {bookings.length}</h2>
      <h2>Revenue: ${revenue}</h2>
      <Table data={bookings} />
    </div>
  );
};
```

### Pattern 3: Room Status Update
```tsx
const { updateRoomStatus } = useApp();

const setMaintenance = (roomId) => {
  updateRoomStatus(roomId, 'Maintenance');
  // User instantly sees room as unavailable
};
```

### Pattern 4: Extend Stay
```tsx
const { extendBooking, bookings } = useApp();

const handleExtend = (bookingId, months) => {
  const booking = bookings.find(b => b.id === bookingId);
  const newDate = new Date(booking.moveOutDate);
  newDate.setMonth(newDate.getMonth() + months);
  
  extendBooking({
    bookingId,
    additionalMonths: months,
    newEndDate: newDate.toISOString().split('T')[0],
    additionalCost: months * booking.monthlyRent,
  });
};
```

### Pattern 5: Cancel with Refund
```tsx
const { cancelBooking, bookings } = useApp();

const handleCancel = (bookingId) => {
  const booking = bookings.find(b => b.id === bookingId);
  const refund = Math.floor(booking.totalPaid * 0.85); // 15% penalty
  
  cancelBooking(bookingId);
  // Show refund info to user
};
```

---

## ⚠️ Important Notes

1. **'use client' directive**: Selalu tambah `'use client'` di komponen yang menggunakan `useApp()`
2. **Error handling**: Hook akan throw error jika tidak di-wrap dengan AppProvider
3. **localStorage**: Data disimpan otomatis, tidak perlu manual save
4. **Real-time**: Semua state updates adalah real-time untuk semua komponen
5. **Initial data**: 4 rooms disediakan sebagai initial data

---

## 🐛 Debugging

### Check LocalStorage
```tsx
const { rooms, bookings } = useApp();
console.log('Rooms:', rooms);
console.log('Bookings:', bookings);
```

### View Raw LocalStorage
```javascript
// Di browser console
console.log(JSON.parse(localStorage.getItem('app_bookings')));
console.log(JSON.parse(localStorage.getItem('app_rooms')));
```

### Clear LocalStorage
```javascript
// Di browser console
localStorage.removeItem('app_rooms');
localStorage.removeItem('app_bookings');
localStorage.removeItem('app_current_user');
// Atau clear semua
localStorage.clear();
```

---

## 📝 File References

- **Types**: [app/context/types.ts](../context/types.ts)
- **Context**: [app/context/AppContext.tsx](../context/AppContext.tsx)
- **Hook**: [app/context/useApp.ts](../context/useApp.ts)
- **Guide**: [GLOBAL_STATE_GUIDE.ts](../GLOBAL_STATE_GUIDE.ts)

---

## ✅ Checklist

- [x] Setup AppProvider di layout
- [x] Create types.ts dengan interfaces
- [x] Create AppContext dengan logic
- [x] Create useApp hook
- [x] Integrate dengan booking-flow
- [x] Integrate dengan extend-booking
- [x] Integrate dengan cancel-booking
- [x] LocalStorage persistence
- [x] Real-time sync antar komponen
- [x] Documentation lengkap

---

**Last Updated**: January 18, 2026  
**Version**: 1.0
