"use client";

import { UserLogin } from "@/app/components/shared/UserLogin";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <UserLogin 
      onLoginSuccess={(user) => {
        // Handle role-based redirection
        const role = user?.user?.role;
        if (role === 'admin') {
           // Set local storage for app state persistence
           localStorage.setItem('app_user_role', 'admin');
           localStorage.setItem('app_view_mode', 'admin');
           // Redirect to admin dashboard (or home which redirects to admin)
           router.push('/'); 
        } else {
           // Tenant or Guest
           localStorage.setItem('app_user_role', 'tenant');
           localStorage.setItem('app_view_mode', 'tenant');
           router.push('/');
        }
      }}
      onBack={() => router.push('/')}
      onRegisterClick={() => router.push('/register')}
      onForgotPassword={() => router.push('/forgot-password')}
    />
  );
}
