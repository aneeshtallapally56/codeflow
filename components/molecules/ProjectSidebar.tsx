// components/layout/app-sidebar.tsx
'use client'
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
import { useTreeStructureStore } from "@/lib/store/treeStructureStore";
import { TreeNode } from "./TreeNode/TreeNode";
import TreeStructure from "../organisms/TreeStructure/TreeStructure";





export function ProjectSidebar() {
    const { treeStructure } = useTreeStructureStore();
  return (
    <Sidebar className="bg-[--sidebar] text-[--sidebar-foreground] border-r border-[--sidebar-border]">
      <SidebarContent>

       

        {/* MENU CONTENT */}
        <div className="flex-1 overflow-auto">
          <SidebarGroup>
            <SidebarMenu>
             <SidebarMenuItem>
             <TreeStructure />
            </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>

      </SidebarContent>
    </Sidebar>
  )
}