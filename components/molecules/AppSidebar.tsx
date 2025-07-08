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

import { Computer } from "lucide-react"
import Link from "next/link"

export function AppSidebar() {
  return (
    <Sidebar 
      className="w-64 [&_[data-sidebar=sidebar]]:text-white [&_[data-sidebar=sidebar]]:border-0 [&_[data-sidebar=sidebar]]:border-none [&>div]:border-0 [&>div]:border-none"
      style={{
        "--sidebar-background": "#1A1919", // Custom dark color
        "--sidebar-foreground": "rgb(255 255 255)", // white
        "--sidebar-border": "#1A1919", // Same as background to hide borders
        "--sidebar-accent": "rgb(39 39 42)", // zinc-800
        "--sidebar-accent-foreground": "rgb(255 255 255)", // white
      } as React.CSSProperties}
    >
      <SidebarContent className="flex flex-col h-full !text-white" style={{backgroundColor: "#1A1919"}}>

        {/* HEADER */}
        <SidebarHeader className="p-4" style={{backgroundColor: "#1A1919"}}>
          <SidebarMenu>
            <div className="text-lg font-bold cursor-pointer text-white">
              Code Flow
            </div>
          </SidebarMenu>
        </SidebarHeader>

        {/* MAIN MENU */}
        <div className="flex-1 overflow-auto px-2">
          <SidebarGroup style={{backgroundColor: "#1A1919"}}>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <Link href="/projects" passHref>
                  <SidebarMenuButton
                    asChild
                    className="!flex !items-center !gap-2 !rounded-md !p-2 !text-sm !font-medium !text-zinc-300 hover:!bg-zinc-800 hover:!text-white !transition data-[active=true]:!bg-zinc-800 data-[active=true]:!text-white !w-full !justify-start"
                  >
                    <span className="truncate">Projects</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>

        {/* FOOTER */}
        <SidebarFooter className="p-4 border-t border-zinc-700" style={{backgroundColor: "#1A1919"}}>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/projects" passHref>
                <SidebarMenuButton
                  asChild
                  className="!flex !items-center !gap-2 !rounded-md !p-2 !text-sm !font-medium !text-zinc-300 hover:!bg-zinc-800 hover:!text-white !transition data-[active=true]:!bg-zinc-800 data-[active=true]:!text-white !w-full !justify-start"
                >
                  <div className="flex items-center gap-2">
                    <Computer className="h-4 w-4" />
                    <span className="truncate">Projects</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

      </SidebarContent>
    </Sidebar>
  )
}