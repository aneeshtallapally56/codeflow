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
       await axios.post(endpoint, payload, {
        withCredentials: true,
      });
      router.push("/projects");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Authentication failed";
      alert(message);
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
              <Button variant="link">Sign In</Button>
            </Link>
          ) : (
            <Link href="/signup">
              <Button variant="link">Sign Up</Button>
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
                  placeholder="John Doe"
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
                placeholder="m@example.com"
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
            className="w-full text-black"
            disabled={loading}
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </Button>
          <Button
            variant="outline"
            className="w-full bg-[#212121] hover:bg-blue-200 transition-colors"
          >
            Login with Google
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
