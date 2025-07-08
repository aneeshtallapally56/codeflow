'use client';
import { useEffect } from "react";
import { getCurrentUser } from "@/lib/api/getCurrentUser";
import { useUserStore } from "@/lib/store/userStore";

export const AuthHydrator = () => {
  useEffect(() => {
    const syncUser = async () => {
      try {
        const user = await getCurrentUser();
        useUserStore.getState().setUser({
          userId: user._id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
        });
      } catch (err) {
        // not logged in 
      }
    };

    syncUser();
  }, []);

  return null;
};