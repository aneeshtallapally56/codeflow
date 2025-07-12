'use client';

import ProjectsSection  from "@/components/molecules/ProjectsSection"
import { FullPageSpinner } from "@/components/ui/fullPageLoader";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Page() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <FullPageSpinner />;
  
  if (!isAuthenticated) return null;

  return (
    <main className="  w-full  bg-[#050505] h-screen">

       <SidebarTrigger />
      <ProjectsSection />

    </main>
  );
}