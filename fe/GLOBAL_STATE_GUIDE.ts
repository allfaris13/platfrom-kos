/**
 * PANDUAN GLOBAL STATE (React Context API)
 * 
 * File ini berisi contoh lengkap cara menggunakan Global State
 * di berbagai komponen User dan Admin
 */

/**
 * ============================================================================
 * 1. SETUP (Sudah dilakukan di layout.tsx)
 * ============================================================================
 * 
 * import { AppProvider } from './context';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AppProvider>
 *           {children}
 *         </AppProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */

/**
 * ============================================================================
 * 2. MENGGUNAKAN CONTEXT DI KOMPONEN
 * ============================================================================
 */

// Import useApp hook
// import { useApp } from '@/app/context';

/**
 * CONTOH 1: User Melakukan Booking
 * 
 * File: app/components/tenant/booking-flow.tsx
 */
// 'use client';
// import { useApp } from '@/app/context';
// import { Button } from '@/app/components/ui/button';
// 
// export function BookingFlow() {
//   const { addBooking, getRoomById } = useApp();
//   
//   const handleConfirmBooking = async (roomId: string, checkIn: string, checkOut: string) => {
//     const room = getRoomById(roomId);
//     
//     if (!room) {
//       console.error('Room not found');
//       return;
//     }
//     
//     // Hitung durasi
//     const startDate = new Date(checkIn);
//     const endDate = new Date(checkOut);
//     const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
//     const totalCost = months * room.price;
//     
//     // Buat booking baru
//     const newBooking = {
//       id: `booking-${Date.now()}`,
//       userId: 'user-123', // Dari session/auth Anda
//       roomId: room.id,
//       roomName: room.name,
//       roomImage: room.image,
//       moveInDate: checkIn,
//       moveOutDate: checkOut,
//       monthlyRent: room.price,
//       totalPaid: totalCost,
//       duration: `${months} months`,
//       status: 'Confirmed' as const,
//       createdAt: new Date().toISOString(),
//     };
//     
//     // Tambah ke global state
//     addBooking(newBooking);
//     
//     // Toast notification
//     toast.success('Booking berhasil!');
//   };
//   
//   return (
//     <Button onClick={() => handleConfirmBooking('1', '2026-02-01', '2026-08-01')}>
//       Konfirmasi Booking
//     </Button>
//   );
// }

/**
 * CONTOH 2: User Extend Stay
 * 
 * File: app/components/tenant/extend-booking.tsx
 */
// 'use client';
// import { useApp } from '@/app/context';
// 
// export function ExtendBooking({ bookingId, additionalMonths }: Props) {
//   const { extendBooking, bookings } = useApp();
//   
//   const handleExtendConfirm = () => {
//     const booking = bookings.find(b => b.id === bookingId);
//     if (!booking) return;
//     
//     const currentEndDate = new Date(booking.moveOutDate);
//     const newEndDate = new Date(currentEndDate);
//     newEndDate.setMonth(newEndDate.getMonth() + additionalMonths);
//     
//     const additionalCost = additionalMonths * booking.monthlyRent;
//     
//     // Extend booking di global state
//     extendBooking({
//       bookingId,
//       additionalMonths,
//       newEndDate: newEndDate.toISOString().split('T')[0],
//       additionalCost,
//     });
//     
//     toast.success('Sewa berhasil diperpanjang!');
//   };
//   
//   return <Button onClick={handleExtendConfirm}>Konfirmasi Perpanjangan</Button>;
// }

/**
 * CONTOH 3: Admin Melihat Semua Bookings
 * 
 * File: app/components/admin/AdminDashboard.tsx
 */
// 'use client';
// import { useApp } from '@/app/context';
// import { Table, TableBody, TableCell, TableRow } from '@/app/components/ui/table';
// 
// export function AdminDashboard() {
//   const { getAllBookings, getTotalRevenue, getActiveBookings } = useApp();
//   
//   const allBookings = getAllBookings();
//   const totalRevenue = getTotalRevenue();
//   const activeCount = getActiveBookings();
//   
//   return (
//     <div className="p-8">
//       <h1>Admin Dashboard</h1>
//       
//       {/* Stats Cards */}
//       <div className="grid grid-cols-3 gap-4 mb-8">
//         <StatCard label="Total Bookings" value={allBookings.length} />
//         <StatCard label="Active Bookings" value={activeCount} />
//         <StatCard label="Total Revenue" value={`$${totalRevenue}`} />
//       </div>
//       
//       {/* Bookings Table */}
//       <Table>
//         <TableBody>
//           {allBookings.map((booking) => (
//             <TableRow key={booking.id}>
//               <TableCell>{booking.roomName}</TableCell>
//               <TableCell>{booking.status}</TableCell>
//               <TableCell>${booking.totalPaid}</TableCell>
//               <TableCell>{booking.moveInDate}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }

/**
 * CONTOH 4: Admin Update Room Status (Maintenance)
 * 
 * File: app/components/admin/RoomManagement.tsx
 */
// 'use client';
// import { useApp } from '@/app/context';
// import { Button } from '@/app/components/ui/button';
// 
// export function RoomManagement() {
//   const { rooms, updateRoomStatus } = useApp();
//   
//   const handleSetMaintenance = (roomId: string) => {
//     updateRoomStatus(roomId, 'Maintenance');
//     toast.info('Kamar diatur ke maintenance mode');
//     // User akan langsung lihat status berubah di Homepage
//   };
//   
//   return (
//     <div className="space-y-4">
//       {rooms.map((room) => (
//         <div key={room.id} className="p-4 border rounded">
//           <h3>{room.name}</h3>
//           <p>Status: {room.status}</p>
//           <Button 
//             onClick={() => handleSetMaintenance(room.id)}
//             variant={room.status === 'Maintenance' ? 'outline' : 'default'}
//           >
//             {room.status === 'Maintenance' ? 'Dalam Maintenance' : 'Set Maintenance'}
//           </Button>
//         </div>
//       ))}
//     </div>
//   );
// }

/**
 * CONTOH 5: User Homepage Melihat Status Kamar
 * 
 * File: app/components/tenant/homepage.tsx
 */
// 'use client';
// import { useApp } from '@/app/context';
// 
// export function Homepage() {
//   const { rooms } = useApp();
//   
//   // Rooms otomatis update ketika Admin ubah status
//   // Karena rooms adalah state dari context
//   
//   const filteredRooms = rooms.filter(
//     room => room.status === 'Available' || room.status === 'Reserved'
//   );
//   
//   return (
//     <div className="grid grid-cols-4 gap-6">
//       {filteredRooms.map((room) => (
//         <div key={room.id} className="card">
//           <h3>{room.name}</h3>
//           <p className={`status ${room.status.toLowerCase()}`}>
//             {room.status}
//           </p>
//           <p>${room.price}/bulan</p>
//           {room.status === 'Available' && (
//             <Button>Book Now</Button>
//           )}
//           {room.status === 'Maintenance' && (
//             <span className="text-red-500">Sedang Maintenance</span>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

/**
 * CONTOH 6: User Lihat Booking History
 * 
 * File: app/components/tenant/booking-history.tsx
 */
// 'use client';
// import { useApp } from '@/app/context';
// 
// export function BookingHistory() {
//   const { currentUser, getBookingsByUserId } = useApp();
//   
//   if (!currentUser) return <div>Silakan login</div>;
//   
//   const userBookings = getBookingsByUserId(currentUser.id);
//   
//   return (
//     <div className="space-y-4">
//       {userBookings.map((booking) => (
//         <div key={booking.id} className="border rounded p-4">
//           <h3>{booking.roomName}</h3>
//           <p>Status: {booking.status}</p>
//           <p>Check-in: {booking.moveInDate}</p>
//           <p>Check-out: {booking.moveOutDate}</p>
//           <p>Total: ${booking.totalPaid}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

/**
 * CONTOH 7: Cancel Booking dengan Refund Logic
 * 
 * File: app/components/tenant/cancel-booking.tsx
 */
// 'use client';
// import { useApp } from '@/app/context';
// 
// export function CancelBooking({ bookingId }: Props) {
//   const { cancelBooking, bookings } = useApp();
//   
//   const handleCancelConfirm = () => {
//     const booking = bookings.find(b => b.id === bookingId);
//     if (!booking) return;
//     
//     // Hitung refund (15% potongan)
//     const refundAmount = Math.floor(booking.totalPaid * 0.85);
//     
//     // Cancel di global state
//     cancelBooking(bookingId);
//     
//     toast.success(
//       `Booking dibatalkan. Refund: $${refundAmount} (potongan 15%)`
//     );
//   };
//   
//   return <Button onClick={handleCancelConfirm}>Batalkan Booking</Button>;
// }

/**
 * CONTOH 8: Admin Dashboard dengan Filter
 * 
 * File: app/components/admin/FinancialReports.tsx
 */
// 'use client';
// import { useApp } from '@/app/context';
// 
// export function FinancialReports() {
//   const { getBookingsByStatus, getTotalRevenue } = useApp();
//   
//   const confirmedBookings = getBookingsByStatus('Confirmed');
//   const activeBookings = getBookingsByStatus('Active');
//   const completedBookings = getBookingsByStatus('Completed');
//   const totalRevenue = getTotalRevenue();
//   
//   return (
//     <div className="p-8">
//       <h2>Financial Reports</h2>
//       
//       <div className="grid grid-cols-4 gap-4">
//         <Card>
//           <h3>Confirmed</h3>
//           <p className="text-2xl font-bold">{confirmedBookings.length}</p>
//         </Card>
//         <Card>
//           <h3>Active</h3>
//           <p className="text-2xl font-bold">{activeBookings.length}</p>
//         </Card>
//         <Card>
//           <h3>Completed</h3>
//           <p className="text-2xl font-bold">{completedBookings.length}</p>
//         </Card>
//         <Card>
//           <h3>Total Revenue</h3>
//           <p className="text-2xl font-bold">${totalRevenue}</p>
//         </Card>
//       </div>
//     </div>
//   );
// }

/**
 * ============================================================================
 * 3. FLOW DATA
 * ============================================================================
 * 
 * USER BOOKING FLOW:
 * 1. User di Homepage melihat available rooms dari global state
 * 2. User klik "Book" → Booking Flow
 * 3. User input check-in/out dates → Preview total cost
 * 4. User klik "Confirm Booking" → addBooking() dipanggil
 * 5. Booking tersimpan di localStorage + global state
 * 6. Room status otomatis jadi "Occupied"
 * 7. Admin Dashboard langsung tampil booking baru (karena getAllBookings())
 * 
 * ADMIN UPDATE ROOM STATUS FLOW:
 * 1. Admin di Room Management klik "Set Maintenance"
 * 2. updateRoomStatus(roomId, 'Maintenance') dipanggil
 * 3. Rooms state diupdate + localStorage
 * 4. User di Homepage instant melihat room jadi "Maintenance"
 * 5. Room tidak bisa di-book sampai status berubah lagi
 * 
 * EXTEND BOOKING FLOW:
 * 1. User di Booking History klik "Extend"
 * 2. User input bulan tambahan
 * 3. User klik "Confirm" → extendBooking() dipanggil
 * 4. moveOutDate + totalPaid diupdate di global state
 * 5. Admin Dashboard instant lihat updated booking
 */

/**
 * ============================================================================
 * 4. LOCALSTORAGE PERSISTENCE
 * ============================================================================
 * 
 * Data disimpan ke localStorage dengan keys:
 * - 'app_rooms' → untuk room data
 * - 'app_bookings' → untuk booking history
 * - 'app_current_user' → untuk current user
 * 
 * Data tidak hilang saat page refresh/close browser
 * Bisa ditest di DevTools → Application → Local Storage
 */

/**
 * ============================================================================
 * 5. AVAILABLE FUNCTIONS
 * ============================================================================
 * 
 * ROOM FUNCTIONS:
 * - getRoomById(roomId)          // Get single room
 * - getAllRooms()                // Get all rooms
 * - updateRoomStatus(id, status) // Update room status
 * 
 * BOOKING FUNCTIONS:
 * - addBooking(booking)          // Add new booking
 * - updateBooking(id, updates)   // Update booking details
 * - getAllBookings()             // Get all bookings
 * - getBookingsByUserId(userId)  // Get user's bookings
 * - getBookingsByStatus(status)  // Get bookings by status
 * - cancelBooking(bookingId)     // Cancel booking
 * - extendBooking(request)       // Extend booking
 * 
 * USER FUNCTIONS:
 * - setCurrentUser(user)         // Set current logged in user
 * 
 * STATS FUNCTIONS:
 * - getTotalBookings()           // Total booking count
 * - getTotalRevenue()            // Total revenue from all bookings
 * - getActiveBookings()          // Count of active bookings
 * - getOccupiedRooms()           // Count of occupied rooms
 * 
 * PROPERTIES:
 * - rooms                        // Array of Room objects
 * - bookings                     // Array of Booking objects
 * - currentUser                  // User object or null
 */

export {};
