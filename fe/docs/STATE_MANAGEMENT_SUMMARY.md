# State Management Summary

## Overview

Global state management menggunakan React Context API dengan LocalStorage persistence untuk aplikasi Kos-Kosan.

## Features Implemented

✅ React Context API untuk global state management  
✅ LocalStorage persistence (data tidak hilang saat refresh)  
✅ Real-time sync antara User dan Admin  
✅ Booking management (add, update, cancel, extend)  
✅ Room management (status update)  
✅ User management  
✅ Statistics dan analytics  
✅ Custom hook (`useApp`) untuk mudah akses  
✅ TypeScript types lengkap  
✅ Frontend-only (no backend needed)

## File Structure

### Context Files

- [`app/context/types.ts`](file:///home/arkan/coding/UPK_semester_2/fe/app/context/types.ts) - Type definitions untuk Room, Booking, User
- [`app/context/AppContext.tsx`](file:///home/arkan/coding/UPK_semester_2/fe/app/context/AppContext.tsx) - React Context dengan logic dan LocalStorage
- [`app/context/useApp.ts`](file:///home/arkan/coding/UPK_semester_2/fe/app/context/useApp.ts) - Custom hook untuk akses context
- [`app/context/index.ts`](file:///home/arkan/coding/UPK_semester_2/fe/app/context/index.ts) - Export module

### Implementation Examples

- `app/components/tenant/booking-flow.tsx` - User booking
- `app/components/tenant/extend-booking.tsx` - Extend stay
- `app/components/tenant/cancel-booking.tsx` - Cancel booking
- `app/components/admin/AdminDashboard.tsx` - View stats

## LocalStorage Keys

| Key                | Purpose                |
| ------------------ | ---------------------- |
| `app_rooms`        | Room data persistence  |
| `app_bookings`     | Booking history        |
| `app_current_user` | Current logged in user |

## Quick API Reference

### Room Functions

- `getRoomById(roomId)` → Get single room
- `getAllRooms()` → Get all rooms
- `updateRoomStatus(id, status)` → Update room status

### Booking Functions

- `addBooking(booking)` → Add new booking
- `updateBooking(id, updates)` → Update booking
- `getAllBookings()` → Get all bookings
- `getBookingsByUserId(userId)` → Get user's bookings
- `cancelBooking(id)` → Cancel booking
- `extendBooking(request)` → Extend booking

### Stats Functions

- `getTotalBookings()` → Total booking count
- `getTotalRevenue()` → Total revenue
- `getActiveBookings()` → Active bookings count
- `getOccupiedRooms()` → Occupied rooms count

## Data Flow

### User Booking Flow

1. User melihat available rooms
2. Klik "Book" → Input dates
3. Konfirmasi → `addBooking()` dipanggil
4. Tersimpan ke localStorage + global state
5. Room status auto jadi "Occupied"
6. Admin Dashboard instant tampil booking baru

### Admin Update Room

1. Admin klik "Set Maintenance"
2. `updateRoomStatus()` dipanggil
3. State + localStorage updated
4. User instant lihat perubahan status
5. Room tidak bisa di-book

## Testing Checklist

- [x] AppProvider wraps RootLayout
- [x] useApp hook works
- [ ] Data persists after refresh
- [ ] Real-time sync User ↔ Admin
- [ ] Booking flow complete
- [ ] Extend/Cancel working

## Documentation

📖 [Full State Management Guide](file:///home/arkan/coding/UPK_semester_2/fe/docs/STATE_MANAGEMENT_GUIDE.md)

## Future Enhancements

- Authentication context
- Data validation (Zod/Yup)
- Advanced search/filter
- Real-time notifications
- Backend API integration
- Multi-user support
