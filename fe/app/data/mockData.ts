// Mock data for Kos-kosan Management System

export interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  status: 'Tersedia' | 'Penuh' | 'Maintenance';
  capacity: number;
  facilities: string[];
  floor: number;
  image: string;
  description: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  status: 'Active' | 'Expired' | 'Pending';
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  roomName: string;
  amount: number;
  date: string;
  method: string;
  status: 'Confirmed' | 'Pending' | 'Rejected';
  receiptUrl?: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  uploadDate: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  checkIn: string;
  duration: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  bookingDate: string;
}

export const rooms: Room[] = [
  {
    id: 'R001',
    name: 'Kamar A1',
    type: 'Single',
    price: 1500000,
    status: 'Tersedia',
    capacity: 1,
    facilities: ['AC', 'Wi-Fi', 'Kamar Mandi Dalam', 'Lemari', 'Meja Belajar'],
    floor: 1,
    image: 'https://images.unsplash.com/photo-1668089677938-b52086753f77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY4MzcxNzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Kamar single modern dengan fasilitas lengkap dan pemandangan taman'
  },
  {
    id: 'R002',
    name: 'Kamar A2',
    type: 'Single',
    price: 1200000,
    status: 'Penuh',
    capacity: 1,
    facilities: ['AC', 'Wi-Fi', 'Kamar Mandi Luar', 'Lemari'],
    floor: 1,
    image: 'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGVudCUyMHJvb218ZW58MXx8fHwxNzY4Mzk2NjYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Kamar single nyaman dengan harga terjangkau'
  },
  {
    id: 'R003',
    name: 'Kamar B1',
    type: 'Double',
    price: 2000000,
    status: 'Tersedia',
    capacity: 2,
    facilities: ['AC', 'Wi-Fi', 'Kamar Mandi Dalam', 'Lemari', 'Meja Belajar', 'Kulkas Mini'],
    floor: 2,
    image: 'https://images.unsplash.com/photo-1652882861012-95f3263cab63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXBhcnRtZW50JTIwcm9vbXxlbnwxfHx8fDE3Njg0ODI1NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Kamar double untuk 2 orang dengan fasilitas premium'
  },
  {
    id: 'R004',
    name: 'Kamar B2',
    type: 'Single',
    price: 1400000,
    status: 'Tersedia',
    capacity: 1,
    facilities: ['AC', 'Wi-Fi', 'Kamar Mandi Dalam', 'Lemari', 'Meja Belajar'],
    floor: 2,
    image: 'https://images.unsplash.com/photo-1668089677938-b52086753f77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY4MzcxNzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Kamar single di lantai 2 dengan suasana tenang'
  },
  {
    id: 'R005',
    name: 'Kamar C1',
    type: 'Single',
    price: 1300000,
    status: 'Maintenance',
    capacity: 1,
    facilities: ['AC', 'Wi-Fi', 'Kamar Mandi Luar', 'Lemari'],
    floor: 3,
    image: 'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGVudCUyMHJvb218ZW58MXx8fHwxNzY4Mzk2NjYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Kamar sedang dalam perbaikan, akan tersedia minggu depan'
  },
  {
    id: 'R006',
    name: 'Kamar C2',
    type: 'Double',
    price: 1800000,
    status: 'Penuh',
    capacity: 2,
    facilities: ['AC', 'Wi-Fi', 'Kamar Mandi Dalam', 'Lemari', 'Balkon'],
    floor: 3,
    image: 'https://images.unsplash.com/photo-1652882861012-95f3263cab63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXBhcnRtZW50JTIwcm9vbXxlbnwxfHx8fDE3Njg0ODI1NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Kamar double dengan balkon pribadi'
  }
];

export const tenants: Tenant[] = [
  {
    id: 'T001',
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    phone: '081234567890',
    roomId: 'R002',
    roomName: 'Kamar A2',
    checkIn: '2024-01-15',
    checkOut: '2024-07-15',
    status: 'Active'
  },
  {
    id: 'T002',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@email.com',
    phone: '082345678901',
    roomId: 'R006',
    roomName: 'Kamar C2',
    checkIn: '2024-02-01',
    checkOut: '2024-08-01',
    status: 'Active'
  },
  {
    id: 'T003',
    name: 'Ahmad Fauzi',
    email: 'ahmad.f@email.com',
    phone: '083456789012',
    roomId: 'R001',
    roomName: 'Kamar A1',
    checkIn: '2023-10-15',
    checkOut: '2024-04-15',
    status: 'Expired'
  },
  {
    id: 'T004',
    name: 'Dewi Kusuma',
    email: 'dewi.kusuma@email.com',
    phone: '084567890123',
    roomId: 'R004',
    roomName: 'Kamar B2',
    checkIn: '2024-03-01',
    checkOut: '2024-09-01',
    status: 'Active'
  }
];

export const payments: Payment[] = [
  {
    id: 'P001',
    tenantId: 'T001',
    tenantName: 'Budi Santoso',
    roomName: 'Kamar A2',
    amount: 1200000,
    date: '2024-12-25',
    method: 'Transfer Bank',
    status: 'Confirmed',
    receiptUrl: '/receipts/receipt001.jpg'
  },
  {
    id: 'P002',
    tenantId: 'T002',
    tenantName: 'Siti Nurhaliza',
    roomName: 'Kamar C2',
    amount: 1800000,
    date: '2025-01-05',
    method: 'Transfer Bank',
    status: 'Pending',
    receiptUrl: '/receipts/receipt002.jpg'
  },
  {
    id: 'P003',
    tenantId: 'T004',
    tenantName: 'Dewi Kusuma',
    roomName: 'Kamar B2',
    amount: 1400000,
    date: '2025-01-10',
    method: 'E-Wallet',
    status: 'Confirmed',
    receiptUrl: '/receipts/receipt003.jpg'
  },
  {
    id: 'P004',
    tenantId: 'T001',
    tenantName: 'Budi Santoso',
    roomName: 'Kamar A2',
    amount: 1200000,
    date: '2025-01-15',
    method: 'Transfer Bank',
    status: 'Pending',
    receiptUrl: '/receipts/receipt004.jpg'
  }
];

export const galleryImages: GalleryImage[] = [
  {
    id: 'G001',
    title: 'Kamar Tipe A',
    category: 'Rooms',
    imageUrl: 'https://images.unsplash.com/photo-1668089677938-b52086753f77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzY4MzcxNzQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    uploadDate: '2024-01-10'
  },
  {
    id: 'G002',
    title: 'Kamar Tipe B',
    category: 'Rooms',
    imageUrl: 'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGVudCUyMHJvb218ZW58MXx8fHwxNzY4Mzk2NjYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    uploadDate: '2024-01-12'
  },
  {
    id: 'G003',
    title: 'Kamar Tipe C',
    category: 'Rooms',
    imageUrl: 'https://images.unsplash.com/photo-1652882861012-95f3263cab63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXBhcnRtZW50JTIwcm9vbXxlbnwxfHx8fDE3Njg0ODI1NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    uploadDate: '2024-01-15'
  },
  {
    id: 'G004',
    title: 'Dapur Bersama',
    category: 'Facilities',
    imageUrl: 'https://images.unsplash.com/photo-1722649957265-372809976610?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib2FyZGluZyUyMGhvdXNlJTIwa2l0Y2hlbnxlbnwxfHx8fDE3Njg0ODI1NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    uploadDate: '2024-01-18'
  }
];

export const bookings: Booking[] = [
  {
    id: 'B001',
    roomId: 'R001',
    roomName: 'Kamar A1',
    userName: 'Rani Pratiwi',
    userEmail: 'rani.p@email.com',
    userPhone: '085678901234',
    checkIn: '2025-02-01',
    duration: 6,
    totalPrice: 9000000,
    status: 'Pending',
    bookingDate: '2025-01-12'
  },
  {
    id: 'B002',
    roomId: 'R003',
    roomName: 'Kamar B1',
    userName: 'Joko Susilo',
    userEmail: 'joko.s@email.com',
    userPhone: '086789012345',
    checkIn: '2025-02-15',
    duration: 12,
    totalPrice: 24000000,
    status: 'Confirmed',
    bookingDate: '2025-01-10'
  }
];
