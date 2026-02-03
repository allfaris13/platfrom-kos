"use client";

import { UserLogin } from "@/app/components/shared/UserLogin";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <UserLogin 
      onLoginSuccess={() => router.push('/')}
      onBack={() => router.push('/')}
      onRegisterClick={() => router.push('/register')}
    />
  );
}
