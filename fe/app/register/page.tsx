"use client";

import { UserRegister } from "@/app/components/shared/UserRegister";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <UserRegister 
      onRegisterSuccess={() => router.push('/login')}
      onBackToLogin={() => router.push('/login')}
    />
  );
}
