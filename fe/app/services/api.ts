const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const safeJson = async (res: Response) => {
  const contentType = res.headers.get("content-type");
  
  if (!res.ok) {
    // If not OK and not JSON, it might be a 404/500 HTML page
    if (!contentType || !contentType.includes("application/json")) {
        if (res.status === 404) throw new Error(`API Endpoint not found (404). Please ensure the backend is running and up to date.`);
        throw new Error(`Server returned error ${res.status}: ${res.statusText}`);
    }
  }

  const text = await res.text();
  try {
    const trimmed = text.trim();
    if (trimmed.includes('}{')) {
      console.warn("Detected multiple JSON objects in response, attempting to wrap in array");
      return JSON.parse(`[${trimmed.replace(/}{/g, '},{')}]`);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON response:", text, e);
    // If it's a 404 string like "404 page not found", handle it gracefully
    if (text.includes("404")) throw new Error("API Route not registered in backend (404)");
    throw new Error('Invalid server response format');
  }
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    // 'Content-Type': 'application/json' - Automatic for FormData, needed for JSON
  };
};

export const api = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await fetch(`${API_URL}/dashboard`, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return safeJson(res);
  },

  // Rooms
  getRooms: async () => {
    const res = await fetch(`${API_URL}/kamar`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return safeJson(res);
  },
  
  getRoomById: async (id: string) => {
    const res = await fetch(`${API_URL}/kamar/${id}`);
    if (!res.ok) throw new Error('Failed to fetch room detail');
    return safeJson(res);
  },

  createRoom: async (formData: FormData) => {
    const res = await fetch(`${API_URL}/kamar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, // No Content-Type for FormData
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to create room');
    return safeJson(res);
  },

  updateRoom: async (id: string, formData: FormData) => {
    const res = await fetch(`${API_URL}/kamar/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to update room');
    return safeJson(res);
  },

  deleteRoom: async (id: string) => {
    const res = await fetch(`${API_URL}/kamar/${id}`, {
      method: 'DELETE',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete room');
    return safeJson(res);
  },

  // Gallery
  getGalleries: async () => {
    const res = await fetch(`${API_URL}/galleries`);
    if (!res.ok) throw new Error('Failed to fetch galleries');
    return safeJson(res);
  },

  createGallery: async (formData: FormData) => {
    const res = await fetch(`${API_URL}/galleries`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to create gallery');
    return safeJson(res);
  },

  deleteGallery: async (id: number) => {
    const res = await fetch(`${API_URL}/galleries/${id}`, {
      method: 'DELETE',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete gallery');
    return safeJson(res);
  },

  // Reviews
  getReviews: async (roomId: string) => {
    const res = await fetch(`${API_URL}/kamar/${roomId}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return safeJson(res);
  },

  getAllReviews: async () => {
    const res = await fetch(`${API_URL}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch all reviews');
    return safeJson(res);
  },

  createReview: async (review: { kamar_id: number; rating: number; comment: string; user_id?: number }) => {
    const res = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) throw new Error('Failed to post review');
    return safeJson(res);
  },

  // Auth
  login: async (credentials: { username: string; password: string }) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData: { username: string; password: string; role?: string }) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Profile
  getProfile: async () => {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
    return data;
  },

  updateProfile: async (profileData: FormData | Record<string, unknown>) => {
    const isFormData = profileData instanceof FormData;
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: isFormData 
        ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        : { ...getHeaders(), 'Content-Type': 'application/json' },
      body: isFormData ? profileData : JSON.stringify(profileData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  changePassword: async (data: { old_password: string; new_password: string }) => {
    const res = await fetch(`${API_URL}/profile/change-password`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await safeJson(res);
    if (!res.ok) throw new Error(resData.error || 'Failed to change password');
    return resData;
  },

  getMyBookings: async () => {
    const res = await fetch(`${API_URL}/my-bookings`, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
        if (res.status === 401) {
            console.error("Auth failed for my-bookings. Token:", localStorage.getItem('token'));
        }
        throw new Error(`Failed to fetch user bookings (Status: ${res.status})`);
    }
    return safeJson(res);
  },

  // Admin
  getPayments: async () => {
    const res = await fetch(`${API_URL}/payments`, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch payments');
    return safeJson(res);
  },

  confirmPayment: async (id: number) => {
    const res = await fetch(`${API_URL}/payments/${id}/confirm`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to confirm payment');
    return safeJson(res);
  },

  getTenants: async () => {
    const res = await fetch(`${API_URL}/tenants`, {
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch tenants');
    return safeJson(res);
  }
};
