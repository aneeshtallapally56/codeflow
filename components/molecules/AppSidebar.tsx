// components/layout/app-sidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,

  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Computer, ChevronUp } from "lucide-react"

import Link from "next/link"

export function AppSidebar() {
  return (
    <Sidebar className="bg-[--sidebar] text-[--sidebar-foreground] border-r border-[--sidebar-border]">
      <SidebarContent>

        {/* HEADER */}
        <SidebarHeader>
          <SidebarMenu>
            <div className="p-3 font-bold cursor-pointer text-white ">Code Flow</div>
          </SidebarMenu>
        </SidebarHeader>

        {/* MENU CONTENT */}
        <div className="flex-1 overflow-auto">
          <SidebarGroup>
            <SidebarMenu>
             <SidebarMenuItem>
              <Link href="/projects" passHref>
                <SidebarMenuButton asChild isActive    className="data-[active=true]:bg-[#27272A]">
                  <span className="font-semibold text-white capitalize">
                    Projects
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>

        {/* FOOTER */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/projects" passHref>
                <SidebarMenuButton asChild isActive icon={<Computer />}   className="data-[active=true]:bg-[#27272A]">
                  <span className="font-semibold text-white capitalize">
                    Projects
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

      </SidebarContent>
    </Sidebar>
  )
}