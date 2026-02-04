// 1. Definisikan Interface & Error Class
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  token?: string; 
  user?: any;
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
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
  login: async (credentials: { username: string; password: string }) => {
    const data = await apiCall<ApiResponse>('POST', '/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  googleLogin: async (code: string) => {
    // Mengirim code dari Google ke backend
    const data = await apiCall<ApiResponse>('GET', `/auth/google/callback?code=${code}`);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData: any) => {
    return apiCall('POST', '/auth/register', userData);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('app_view_mode');
  },

  // --- PROFILE ---
  getProfile: async () => {
    return apiCall('GET', '/profile');
  },

  updateProfile: async (data: any) => {
    return apiCall('PUT', '/profile', data);
  },

  changePassword: async (data: any) => {
    return apiCall('PUT', '/profile/change-password', data);
  },

  // --- KAMAR / ROOMS ---
  getRooms: async () => {
    return apiCall('GET', '/kamar');
  },

  getRoomById: async (id: string) => {
    return apiCall('GET', `/kamar/${id}`);
  },

  createRoom: async (formData: FormData) => {
    return apiCall('POST', '/kamar', formData);
  },

  updateRoom: async (id: string, formData: FormData) => {
    return apiCall('PUT', `/kamar/${id}`, formData);
  },

  deleteRoom: async (id: string) => {
    return apiCall('DELETE', `/kamar/${id}`);
  },

  // --- BOOKINGS & REVIEWS ---
  getMyBookings: async () => {
    return apiCall('GET', '/my-bookings');
  },

  createBooking: async (bookingData: any) => {
    return apiCall('POST', '/bookings', bookingData);
  },

  createSnapToken: async (paymentData: any) => {
    return apiCall('POST', '/payments/snap-token', paymentData);
  },

  createReview: async (review: any) => {
    return apiCall('POST', '/reviews', review);
  },

  // --- GALLERIES ---
  getGalleries: async () => {
    return apiCall('GET', '/galleries');
  },

  createGallery: async (formData: FormData) => {
    return apiCall('POST', '/galleries', formData);
  },

  deleteGallery: async (id: string) => {
    return apiCall('DELETE', `/galleries/${id}`);
  },

  getAllReviews: async () => {
  return apiCall('GET', '/reviews');
  },

  getReviews: async (roomId: string) => {
    return apiCall('GET', `/rooms/${roomId}/reviews`);
  },

  // --- ADMIN (Menghilangkan error LuxuryPaymentConfirmation) ---
  getAllTenants: async () => {
    return apiCall('GET', '/tenants');
  },

  getAllPayments: async () => {
    return apiCall('GET', '/admin/payments');
  },

  confirmPayment: async (paymentId: string) => {
    return apiCall('POST', `/admin/payments/${paymentId}/confirm`);
  },

  // --- OTHERS ---
  sendContactForm: async (data: any) => {
    return apiCall('POST', '/contact', data);
  },

  healthCheck: async () => {
    return apiCall('GET', '/health');
  },
};

export type { ApiResponse, ApiError };
export { ApiErrorClass };