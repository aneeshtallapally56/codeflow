'use client';

import ProjectsSection  from "@/components/molecules/ProjectsSection"
import { FullPageSpinner } from "@/components/ui/fullPageLoader";

import { SidebarTrigger } from "@/components/ui/sidebar";
import axiosInstance from "@/lib/config/axios-config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function Page() {
   const [loading, setLoading] = useState(true);
const router = useRouter();
  useEffect(() => {
    axiosInstance.get("/api/auth/me")
      .then((res) => {
        console.log("User:", res.data);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);
   if (loading) return <FullPageSpinner />;
  return (
    <main className="  w-full  bg-[#050505] h-screen">

       <SidebarTrigger />
      <ProjectsSection />

    </main>
  );
}