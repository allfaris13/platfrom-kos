import { jwtDecode } from 'jwt-decode';


export interface GoogleUser {
    email: string;
    name: string;
    picture: string;
    sub: string;
}

export const decodeGoogleToken = (credential: string): GoogleUser | null => {
    try {
        const decoded = jwtDecode<GoogleUser & { sub: string }>(credential);
        return {
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
            sub: decoded.sub,
        };
    } catch (error) {
        console.error('Failed to decode Google token:', error);
        return null;
    }
};

// Remove client-side decoding - let backend verify the token
export const handleGoogleLogin = async (credential: string) =>{
    // Send raw ID token to backend for server-side verification
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';
        // Remove trailing slash if present
        const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        
        // Handle if apiUrl already includes /api
        const endpoint = baseUrl.endsWith('/api') 
            ? `${baseUrl}/auth/google-login` 
            : `${baseUrl}/api/auth/google-login`;

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Send cookies with request
            body: JSON.stringify({
                id_token: credential, // Send raw ID token, not decoded data
            }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Backend Google login failed');
        }

        const data = await res.json();
        
        // Save user data only (token is in HttpOnly cookie)
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        return data;
    } catch (error) {
        console.error('Google login network/server error:', error);
        throw error;
    }
};
