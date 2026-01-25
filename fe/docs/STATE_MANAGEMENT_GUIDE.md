# Panduan Global State (React Context API)

Dokumentasi lengkap cara menggunakan Global State di berbagai komponen User dan Admin.

## 1. Setup

Setup sudah dilakukan di [`layout.tsx`](file:///home/arkan/coding/UPK_semester_2/fe/app/layout.tsx):

```tsx
import { AppProvider } from "./context";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
```

## 2. Menggunakan Context di Komponen

### Import useApp Hook

```tsx
import { useApp } from "@/app/context";
```

### Contoh Implementasi

#### User Melakukan Booking

File: [`app/components/tenant/booking-flow.tsx`](file:///home/arkan/coding/UPK_semester_2/fe/app/components/tenant/booking-flow.tsx)

```tsx
"use client";
import { useApp } from "@/app/context";
import { Button } from "@/app/components/ui/button";

export function BookingFlow() {
  const { addBooking, getRoomById } = useApp();

  const handleConfirmBooking = async (
    roomId: string,
    checkIn: string,
    checkOut: string
  ) => {
    const room = getRoomById(roomId);

    if (!room) {
      console.error("Room not found");
      return;
    }

    // Hitung durasi
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const months = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const totalCost = months * room.price;

    // Buat booking baru
    const newBooking = {
      id: `booking-${Date.now()}`,
      userId: "user-123",
      roomId: room.id,
      roomName: room.name,
      roomImage: room.image,
      moveInDate: checkIn,
      moveOutDate: checkOut,
      monthlyRent: room.price,
      totalPaid: totalCost,
      duration: `${months} months`,
      status: "Confirmed" as const,
      createdAt: new Date().toISOString(),
    };

    addBooking(newBooking);
    toast.success("Booking berhasil!");
  };

  return (
    <Button
      onClick={() => handleConfirmBooking("1", "2026-02-01", "2026-08-01")}
    >
      Konfirmasi Booking
    </Button>
  );
}
```

#### User Extend Stay

File: [`app/components/tenant/extend-booking.tsx`](file:///home/arkan/coding/UPK_semester_2/fe/app/components/tenant/extend-booking.tsx)

```tsx
"use client";
import { useApp } from "@/app/context";

export function ExtendBooking({ bookingId, additionalMonths }: Props) {
  const { extendBooking, bookings } = useApp();

  const handleExtendConfirm = () => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const currentEndDate = new Date(booking.moveOutDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setMonth(newEndDate.getMonth() + additionalMonths);

    const additionalCost = additionalMonths * booking.monthlyRent;

    extendBooking({
      bookingId,
      additionalMonths,
      newEndDate: newEndDate.toISOString().split("T")[0],
      additionalCost,
    });

    toast.success("Sewa berhasil diperpanjang!");
  };

  return <Button onClick={handleExtendConfirm}>Konfirmasi Perpanjangan</Button>;
}
```

## 3. Flow Data

### User Booking Flow

1. User di Homepage melihat available rooms dari global state
2. User klik "Book" → Booking Flow
3. User input check-in/out dates → Preview total cost
4. User klik "Confirm Booking" → `addBooking()` dipanggil
5. Booking tersimpan di localStorage + global state
6. Room status otomatis jadi "Occupied"
7. Admin Dashboard langsung tampil booking baru (karena `getAllBookings()`)

### Admin Update Room Status Flow

1. Admin di Room Management klik "Set Maintenance"
2. `updateRoomStatus(roomId, 'Maintenance')` dipanggil
3. Rooms state diupdate + localStorage
4. User di Homepage instant melihat room jadi "Maintenance"
5. Room tidak bisa di-book sampai status berubah lagi

### Extend Booking Flow

1. User di Booking History klik "Extend"
2. User input bulan tambahan
3. User klik "Confirm" → `extendBooking()` dipanggil
4. `moveOutDate` + `totalPaid` diupdate di global state
5. Admin Dashboard instant lihat updated booking

## 4. LocalStorage Persistence

Data disimpan ke localStorage dengan keys:

- `app_rooms` → untuk room data
- `app_bookings` → untuk booking history
- `app_current_user` → untuk current user

Data tidak hilang saat page refresh/close browser. Bisa ditest di DevTools → Application → Local Storage

## 5. Available Functions

### Room Functions

- `getRoomById(roomId)` - Get single room
- `getAllRooms()` - Get all rooms
- `updateRoomStatus(id, status)` - Update room status

### Booking Functions

- `addBooking(booking)` - Add new booking
- `updateBooking(id, updates)` - Update booking details
- `getAllBookings()` - Get all bookings
- `getBookingsByUserId(userId)` - Get user's bookings
- `getBookingsByStatus(status)` - Get bookings by status
- `cancelBooking(bookingId)` - Cancel booking
- `extendBooking(request)` - Extend booking

### User Functions

- `setCurrentUser(user)` - Set current logged in user

### Stats Functions

- `getTotalBookings()` - Total booking count
- `getTotalRevenue()` - Total revenue from all bookings
- `getActiveBookings()` - Count of active bookings
- `getOccupiedRooms()` - Count of occupied rooms

### Properties

- `rooms` - Array of Room objects
- `bookings` - Array of Booking objects
- `currentUser` - User object or null
