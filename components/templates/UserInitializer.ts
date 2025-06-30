"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/lib/api/getCurrentUser";
import { useUserStore } from "@/lib/store/userStore";

export const UserInitializer = () => {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUser(user._id, user.username);
        console.log("✅ User initialized:", user);
      } else {
        console.warn("⚠️ No user returned from /api/me");
      }
    };

    init();
  }, [setUser]);

  return null;
};