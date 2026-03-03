"use client";

import { GoogleLogin } from '@react-oauth/google';
import { api } from '@/app/services/api';
import { toast } from 'sonner';

interface GoogleButtonProps {
    onSuccess: (data: unknown) => void;
    isLoading?: boolean;
}

export function GoogleButton({ onSuccess, isLoading }: GoogleButtonProps) {
    return (
        <div className="w-full flex justify-center mt-6">
            <div className={`w-full max-w-sm transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {/* Divider */}
                <div className="relative flex items-center mb-6">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        Or continue with
                    </span>
                    <div className="flex-grow border-t border-slate-200" />
                </div>

                {/* Google Login — always light, matches form */}
                <div className="flex justify-center w-full">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            if (credentialResponse.credential) {
                                try {
                                    const response = await api.googleLogin(credentialResponse.credential);
                                    onSuccess(response);
                                    toast.success('Signed in with Google');
                                } catch (error) {
                                    toast.error('Google login failed');
                                    console.error(error);
                                }
                            }
                        }}
                        onError={() => {
                            toast.error('Google Sign In Error');
                        }}
                        theme="outline"
                        size="large"
                        width="100%"
                        text="signin_with"
                        shape="pill"
                    />
                </div>
            </div>
        </div>
    );
}
