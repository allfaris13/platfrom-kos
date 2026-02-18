// 1. Definisikan Interface & Error Class

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'penyewa' | 'calon_penyewa';
  email?: string;
  token?: string;
  created_at?: string;
  // For profile usage
  penyewa?: Tenant;
  is_google_user?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total_rows: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T;
  meta: Pagination;
}

export interface Room {
  id: number;
  nomor_kamar: string;
  tipe_kamar: string;
  fasilitas: string | string[]; // Supports both raw string or parsed array
  harga_per_bulan: number;
  status: 'Tersedia' | 'Terisi' | 'Perbaikan' | 'Booked';
  capacity: number;
  floor: number;
  size: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  image_url: string;
  created_at?: string;
  updated_at?: string;
  kategori_id?: number;
  Category?: {
    nama_kategori: string;
  };
  Gallery?: { image_url: string }[];
  // derived fields for UI
  rating?: number;
  reviews?: number;
}

export interface Gallery {
  id: number;
  title: string;
  category: string;
  image_url: string;
  created_at?: string;
  keti_id?: number;
  Room?: Room;
}

export interface Review {
  id: number;
  user_id: number;
  user?: User;
  kamar_id: number;
  rating: number;
  comment: string; // Backend uses 'comment' or 'komentar'? Standardize to comment based on this file.
  komentar?: string; // Alias if needed
  created_at?: string;
  Penyewa?: {
      nama_lengkap: string;
      foto_profil: string;
  };
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
  role?: 'guest' | 'tenant' | 'former_tenant';
  created_at?: string;
  status?: string; 
  kamar?: { nomor_kamar: string }; 
}

export interface Payment {
  id: number;
  pemesanan_id: number;
  pemesanan?: Booking;
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

export interface PaymentReminder {
  id: number;
  pembayaran_id: number;
  pembayaran?: Payment;
  jumlah_bayar: number;
  tanggal_reminder: string;
  status_reminder: 'Pending' | 'Paid' | 'Expired';
  is_sent: boolean;
  created_at?: string;
}

export interface Booking {
  id: number;
  penyewa_id: number;
  penyewa?: Tenant;
  kamar_id: number;
  kamar?: Room;
  tanggal_mulai: string;
  tanggal_keluar: string; // or moveOutDate
  durasi_sewa: number;
  status_pemesanan: 'Pending' | 'Confirmed' | 'Cancelled' | 'Active' | 'Completed';
  pembayaran?: Payment[]; // Standardize on lowercase
  payments?: Payment[]; // Alias if needed
  created_at?: string;
  // UI helpers
  moveInDate?: string;
  moveOutDate?: string;
  roomName?: string;
  roomImage?: string;
  monthlyRent?: number;
  status_bayar?: string; 
  total_bayar?: number; 
}

export interface DashboardStats {
  total_revenue: number;
  active_tenants: number;
  available_rooms: number;
  occupied_rooms: number;
  pending_payments: number;
  pending_revenue: number;
  rejected_payments: number;
  potential_revenue: number;
  monthly_trend: { month: string; revenue: number }[];
  type_breakdown: { type: string; revenue: number; count: number; occupied: number }[];
  demographics: { name: string; value: number; color: string }[];
  recent_checkouts: {
    room_name: string;
    tenant_name: string;
    checkout_date: string;
    reason: string;
  }[];
}

export interface LoginResponse {
    token?: string; // Token is now in HttpOnly cookie, but kept optional for compatibility
    user: User;
    penyewa?: Tenant;
    is_google_user?: boolean;
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
  } catch (_e) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // If empty response (e.g. 200 OK but no body), return empty object?
    // But safeJson usually expects JSON. If text is empty and status ok, maybe return null?
    if (!text) return {}; 
    throw new Error('Invalid server response format');
  }
};

// Auto-refresh token helper
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
};

// === Internal Helper ===
const apiCall = async <T>(method: string, endpoint: string, body?: unknown): Promise<T> => {
  const config: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // IMPORTANT: Send HttpOnly cookies with requests
  };

  if (body) {
    if (body instanceof FormData) {
      // If FormData, let browser set boundary automatically
      delete (config.headers as Record<string, string>)['Content-Type'];
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);
  
  // Handle token refresh on 401
  if (res.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
    // Try to refresh token
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry original request
      return apiCall<T>(method, endpoint, body);
    }
    // Refresh failed, redirect to login
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
  
  return safeJson(res);
};

// 3. Objek API Utama (Satu fungsi untuk satu kegunaan)
export const api = {
  // --- AUTH ---
  login: async (credentials: { username: string; password: string }) => {
    const data = await apiCall<LoginResponse>('POST', '/auth/login', credentials);
    // Store user data only (token is in HttpOnly cookie)
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  googleLogin: async (code: string) => {
    // Mengirim code dari Google ke backend
    const data = await apiCall<LoginResponse>('GET', `/auth/google/callback?code=${code}`);
    // Store user data only (token is in HttpOnly cookie)
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData: Partial<Tenant> & { password?: string; username?: string }) => {
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

  logout: async () => {
    // Call backend to clear HttpOnly cookies
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage (user data only, no tokens)
    localStorage.clear();
    sessionStorage.clear();
  },

  // --- PROFILE ---
  getProfile: async () => {
    // Likely returns { user: User, tenant: Tenant } or just User populated
    // Based on backend profile_handler.go usually returns JSON wrapping
    return apiCall<{ user: User; tenant?: Tenant }>('GET', '/profile');
  },

  updateProfile: async (data: Partial<Tenant> | FormData) => {
    return apiCall<Tenant>('PUT', '/profile', data);
  },

  changePassword: async (data: { old_password?: string; new_password?: string }) => {
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

  createBookingWithProof: async (formData: FormData) => {
    return apiCall<Booking>('POST', '/bookings/with-proof', formData);
  },

  cancelBooking: async (id: string) => {
    return apiCall<MessageResponse>('POST', `/bookings/${id}/cancel`);
  },

  extendBooking: async (id: string, months: number) => {
    return apiCall<Payment>('POST', `/bookings/${id}/extend`, { months });
  },

  // --- PAYMENTS (Manual Transfer) ---
  createPayment: async (data: { pemesanan_id: number; payment_type: 'full' | 'dp' }) => {
    return apiCall<{ message: string; payment: Payment }>('POST', '/payments', data);
  },

  uploadPaymentProof: async (paymentId: number, file: File) => {
    const formData = new FormData();
    formData.append('proof', file);
    return apiCall<{ message: string; url: string }>('POST', `/payments/${paymentId}/proof`, formData);
  },

  getPaymentReminders: async () => {
    return apiCall<PaymentReminder[]>('GET', '/payments/reminders');
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
  getAllTenants: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.role) query.append('role', params.role);
    
    return apiCall<PaginatedResponse<Tenant[]>>('GET', `/tenants?${query.toString()}`);
  },

  deleteTenant: async (id: string | number) => {
    return apiCall<MessageResponse>('DELETE', `/tenants/${id}`);
  },

  getAllPayments: async () => {
    return apiCall<Payment[]>('GET', '/payments');
  },

  confirmPayment: async (paymentId: string) => {
    // Admin confirmation
    return apiCall<MessageResponse>('PUT', `/payments/${paymentId}/confirm`);
  },
  

  verifyPayment: async (orderId: string) => {
    // Returns { message: "Payment verified successfully" }
    return apiCall<MessageResponse>('POST', '/payments/verify', { order_id: orderId });
  },

  getReminders: async () => {
    return apiCall<PaymentReminder[]>('GET', '/payments/reminders');
  },

  // --- OTHERS ---
  sendContactForm: async (data: { name: string; email: string; message: string }) => {
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
