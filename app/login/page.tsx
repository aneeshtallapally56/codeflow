// app/login/page.tsx

import {AuthCard}from "@/components/molecules/auth/AuthCard";


export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212]">
      <AuthCard type="login" />
    </div>
  );
}