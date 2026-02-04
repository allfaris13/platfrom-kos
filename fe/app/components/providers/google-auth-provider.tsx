"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
    // Google OAuth Client ID from Google Cloud Console
    const clientId = "794235091181-rf8vr0e1hp9cse4h9m3pkoega2toji8g.apps.googleusercontent.com";

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
