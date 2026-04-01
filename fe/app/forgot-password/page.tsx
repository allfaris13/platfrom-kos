"use client";

import { ForgotPassword } from "@/app/components/shared/ForgotPassword";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <ForgotPassword 
      onBack={() => {
        // Redirect back to login screen
        router.push('/login');
      }}
    />
  );
}
