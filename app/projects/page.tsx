

import ProjectsSection  from "@/components/molecules/ProjectsSection"
import { UserInitializer } from "@/components/templates/UserInitializer";
import { SidebarTrigger } from "@/components/ui/sidebar";


export default function Page() {
  return (
    <main className="  w-full  bg-[#050505] h-screen">
      <UserInitializer />
       <SidebarTrigger />
      <ProjectsSection />

    </main>
  );
}