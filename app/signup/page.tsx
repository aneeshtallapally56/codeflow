// app/signup/page.tsx

import {AuthCard} from "@/components/molecules/auth/AuthCard";


export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212]">
      <AuthCard type="signup" />
    </div>
  );
}