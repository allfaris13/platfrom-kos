import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  hidden?: boolean;
}

export interface ProfileData {
  user: {
    username: string;
    email: string;
    created_at: string;
  };
  penyewa?: {
    nama_lengkap: string;
    nomor_hp: string;
    alamat_asal: string;
    nik: string;
    jenis_kelamin: string;
    foto_profil: string;
  };
  is_google_user: boolean;
}

export interface BookingItem {
  total_bayar: number;
  status_pemesanan: string;
  kamar?: {
    nomor_kamar: string;
  };
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
  address: string;
  nik: string;
  jenisKelamin: string;
  joinDate: string;
  status: string;
  totalBookings: number;
  totalSpent: number;
  roomNumber: string;
  isGoogleUser: boolean;
  profileImage: string;
}
