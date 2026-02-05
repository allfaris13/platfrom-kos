// 1. Definisikan Interface & Error Class

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'penyewa' | 'calon_penyewa';
  token?: string;
  created_at?: string;
}

export interface Room {
  id: number;
  nomor_kamar: string;
  tipe_kamar: string;
  fasilitas: string;
  harga_per_bulan: number;
  status: 'Tersedia' | 'Penuh' | 'Maintenance';
  capacity: number;
  floor: number;
  size: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface Gallery {
  id: number;
  title: string;
  category: string;
  image_url: string;
  created_at?: string;
}

export interface Review {
  id: number;
  user_id: number;
  user?: User;
  kamar_id: number;
  rating: number;
  comment: string;
  created_at?: string;
}

export interface Tenant {
  id: number;
  user_id: number;
  user?: User;
  nama_lengkap: string;
  email: string;
  nik: string;
  nomor_hp: string;
  tanggal_lahir?: string;
  alamat_asal: string;
  jenis_kelamin: string;
  foto_profil: string;
  created_at?: string;
}

export interface Payment {
  id: number;
  pemesanan_id: number;
  jumlah_bayar: number;
  tanggal_bayar: string;
  bukti_transfer: string;
  status_pembayaran: 'Pending' | 'Confirmed' | 'Failed' | 'Settled';
  order_id: string;
  snap_token: string;
  metode_pembayaran: string;
  tipe_pembayaran: string;
  jumlah_dp: number;
  tanggal_jatuh_tempo?: string;
  created_at?: string;
}

export interface Booking {
  id: number;
  penyewa_id: number;
  penyewa?: Tenant;
  kamar_id: number;
  kamar?: Room; // Preloaded
  tanggal_mulai: string;
  durasi_sewa: number;
  status_pemesanan: 'Pending' | 'Confirmed' | 'Cancelled' | 'Active' | 'Completed';
  pembayaran?: Payment[];
  created_at?: string;
}

export interface DashboardStats {
  total_pemasukan: number;
  jumlah_penghuni_aktif: number;
  kamar_tersedia: number;
  kamar_terisi: number;
  occupancy_rate: number;
  recent_activities: any[];
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface MessageResponse {
    message: string;
}

interface ApiError extends Error {
  status: number;
  errors?: string[];
}

class ApiErrorClass extends Error implements ApiError {
  status: number;
  errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'ApiErrorClass';
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

// 2. Helper Functions
// 2. Helper Functions
const getHeaders = () => {
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token && typeof window !== 'undefined') {
    token = sessionStorage.getItem('token');
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const safeJson = async (res: Response) => {
  const text = await res.text();

  if (!res.ok) {
    let errorMessage = `Server error ${res.status}`;
    try {
      const errorData = JSON.parse(text);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      if (res.status === 404) errorMessage = "API Endpoint not found (404).";
    }
    throw new ApiErrorClass(errorMessage, res.status);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    // If empty response (e.g. 200 OK but no body), return empty object?
    // But safeJson usually expects JSON. If text is empty and status ok, maybe return null?
    if (!text) return {}; 
    throw new Error('Invalid server response format');
  }
};

const apiCall = async <T>(method: string, endpoint: string, body?: any): Promise<T> => {
  const headers = getHeaders();
  const config: RequestInit = { method, headers };

  if (body) {
    if (body instanceof FormData) {
      // Jika FormData, biarkan browser set boundary secara otomatis
      delete (config.headers as any)['Content-Type'];
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);
  return safeJson(res);
};

// 3. Objek API Utama (Satu fungsi untuk satu kegunaan)
export const api = {
  // --- AUTH ---
  login: async (credentials: { username: string; password: string }, rememberMe: boolean = true) => {
    const data = await apiCall<LoginResponse>('POST', '/auth/login', credentials);
    if (data.token) {
      if (rememberMe) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  googleLogin: async (code: string) => {
    // Mengirim code dari Google ke backend
    const data = await apiCall<LoginResponse>('GET', `/auth/google/callback?code=${code}`);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData: any) => {
    // userData already includes birthdate from UserRegister.tsx
    // Returns created User object or message? Typically user object.
    return apiCall<User>('POST', '/auth/register', userData);
  },
  
  forgotPassword: async (email: string) => {
    return apiCall<MessageResponse>('POST', '/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiCall<MessageResponse>('POST', '/auth/reset-password', { token, new_password: newPassword });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('app_view_mode');
    
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    // Consider calling a backend logout endpoint if dealing with server-side sessions/cookies blacklist
  },

  // --- PROFILE ---
  getProfile: async () => {
    // Likely returns { user: User, tenant: Tenant } or just User populated
    // Based on backend profile_handler.go usually returns JSON wrapping
    return apiCall<{ user: User; tenant?: Tenant }>('GET', '/profile');
  },

  updateProfile: async (data: Partial<Tenant>) => {
    return apiCall<Tenant>('PUT', '/profile', data);
  },

  changePassword: async (data: any) => {
    return apiCall<MessageResponse>('PUT', '/profile/change-password', data);
  },

  // --- KAMAR / ROOMS ---
  getRooms: async () => {
    // Backend returns raw array []Kamar
    return apiCall<Room[]>('GET', '/kamar');
  },

  getRoomById: async (id: string) => {
    // Backend returns Kamar object
    return apiCall<Room>('GET', `/kamar/${id}`);
  },

  createRoom: async (formData: FormData) => {
    return apiCall<Room>('POST', '/kamar', formData);
  },

  updateRoom: async (id: string, formData: FormData) => {
    return apiCall<Room>('PUT', `/kamar/${id}`, formData);
  },

  deleteRoom: async (id: string) => {
    return apiCall<MessageResponse>('DELETE', `/kamar/${id}`);
  },

  // --- BOOKINGS & REVIEWS ---
  getMyBookings: async () => {
    return apiCall<Booking[]>('GET', '/bookings');
  },

  createBooking: async (bookingData: Partial<Booking>) => {
    return apiCall<Booking>('POST', '/bookings', bookingData);
  },

  createSnapToken: async (paymentData: { pemesanan_id: number; payment_type: string; payment_method: string }) => {
    return apiCall<{ token: string; redirect_url: string }>('POST', '/payments/snap-token', paymentData);
  },

  createReview: async (review: Partial<Review>) => {
    return apiCall<Review>('POST', '/reviews', review);
  },

  // --- GALLERIES ---
  getGalleries: async () => {
    return apiCall<Gallery[]>('GET', '/galleries');
  },

  createGallery: async (formData: FormData) => {
    return apiCall<Gallery>('POST', '/galleries', formData);
  },

  deleteGallery: async (id: string) => {
    return apiCall<MessageResponse>('DELETE', `/galleries/${id}`);
  },

  getAllReviews: async () => {
    return apiCall<Review[]>('GET', '/reviews');
  },

  getReviews: async (roomId: string) => {
    return apiCall<Review[]>('GET', `/kamar/${roomId}/reviews`);
  },

  // --- ADMIN ---
  getAllTenants: async () => {
    return apiCall<Tenant[]>('GET', '/tenants');
  },

  getAllPayments: async () => {
    return apiCall<Payment[]>('GET', '/payments');
  },

  confirmPayment: async (paymentId: string) => {
    return apiCall<MessageResponse>('POST', `/payments/${paymentId}/confirm`);
  },
  
  verifyPayment: async (orderId: string) => {
    // Returns { message: "Payment verified successfully" }
    return apiCall<MessageResponse>('POST', '/payments/verify', { order_id: orderId });
  },

  // --- OTHERS ---
  sendContactForm: async (data: any) => {
    // Check contact_handler.go if needed, assume message
    return apiCall<MessageResponse>('POST', '/contact', data);
  },

  getDashboardStats: async () => {
    return apiCall<DashboardStats>('GET', '/dashboard');
  },

  healthCheck: async () => {
    return apiCall<{ status: string }>('GET', '/health');
  },
};

export type { ApiError };
export { ApiErrorClass };