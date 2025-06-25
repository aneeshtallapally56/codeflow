import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { ProjectSidebar } from "@/components/molecules/ProjectSidebar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ProjectSidebar/>
       <SidebarTrigger />
      {children}
    </SidebarProvider>
  );
}