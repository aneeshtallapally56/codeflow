
import CreateProjectTest from "@/components/atoms/CreateProjectTest";
import ProjectsSection  from "@/components/molecules/ProjectsSection"
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function SidebarLayout() {
  return (
    <main className="  w-full  bg-[#050505] h-screen">
         <SidebarTrigger />
      <ProjectsSection />

    </main>
  );
}