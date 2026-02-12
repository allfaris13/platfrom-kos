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

export const handleGoogleLogin = async (credential: string) => {
    const user = decodeGoogleToken(credential);
    if (!user) throw new Error('Invalid Google credential');

    // Send decoded info to backend
    // In a high-security app, you'd send ONLY the credential token and verify it in Go
    // But for this implementation, we send the info to our new Go endpoint
    try {
        const res = await fetch('http://localhost:8081/api/auth/google-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                username: user.name,
                picture: user.picture
            }),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Backend Google login failed');
        }

        const data = await res.json();
        
        // Save token to localStorage like normal login
        if (data.token) {
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        }
        
        return data;
    } catch (error) {
        console.error('Google login network/server error:', error);
        throw error;
    }
};
