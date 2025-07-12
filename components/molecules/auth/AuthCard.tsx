"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

import { useUserStore } from "@/lib/store/userStore";
import { TokenManager } from "@/lib/utils/auth";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
interface AuthCardProps {
  type: "login" | "signup";
}

export function AuthCard({ type }: AuthCardProps) {
  const isSignup = type === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = isSignup
      ? { name, email, password, confirmPassword }
      : { email, password };
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const endpoint = isSignup
      ? `${BASE_URL}/api/v1/auth/register`
      : `${BASE_URL}/api/v1/auth/login`;

    try {
       const res = await axios.post(endpoint, payload, {
        withCredentials: true,
      });
   const user = res.data?.data?.user;
   const tokens = res.data?.data?.tokens;

if (!user?._id) {
  alert("Login/Signup succeeded, but no user returned.");
  return;
}

      // Store tokens if provided
      if (tokens?.accessToken) {
        TokenManager.setTokens(tokens.accessToken, tokens.refreshToken);
      }

      useUserStore.getState().setUser({
  userId: user._id,
  username: user.username,
  email: user.email,
  avatarUrl: user.avatarUrl,
});

      console.log("Login successful, user set:", user);
      console.log("Tokens stored:", !!tokens?.accessToken);
      
      router.push("/projects");
       toast("  Signed in successfully!",{
   className:"toast",
    unstyled: true,
  icon: <CheckCircle className="text-green-500 w-5 h-5" />,
});
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        error.response?.data?.message || error.message || "Authentication failed";
       toast(` ${message} `,{
        
        style:{
          backgroundColor: "#171717",
          color: "#fff",
          border: "1px solid #3A3937",
          
        },
 
  icon: <XCircle className="text-red-500 w-5 h-5" />,
});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-[#171717] border-1 border-amber-50/15 text-white">
      <CardHeader>
        <CardTitle>
          {isSignup ? "Create an account" : "Login to your account"}
        </CardTitle>
        <CardDescription className="text-[#8B8B8B]">
          {isSignup
            ? "Enter your details to get started"
            : "Enter your email below to login to your account"}
        </CardDescription>
        <CardAction>
          {isSignup ? (
            <Link href="/login">
              <Button className="text-zinc-400" variant="link">Sign In</Button>
            </Link>
          ) : (
            <Link href="/signup">
              <Button className="text-zinc-400" variant="link">Sign Up</Button>
            </Link>
          )}
        </CardAction>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="flex flex-col gap-6">
            {isSignup && (
              <div className="grid gap-2">
                <Label htmlFor="name">Username</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  className="bg-[#212121] border-0 "
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aneesh Tallapally"
                  required
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                className="bg-[#212121] border-0"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="at@gmail.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                className="bg-[#212121] border-0"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isSignup && (
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Confirm Password</Label>
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  className="bg-[#212121] border-0"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2 mt-6 mb-4">
          <Button
            type="submit"
            className="w-full bg-zinc-300 text-black  hover:bg-zinc-200 transition-colors duration-200 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </Button>
        
        </CardFooter>
      </form>
    </Card>
  );
}
