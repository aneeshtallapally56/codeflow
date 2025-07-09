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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,

  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';
import { useUserStore } from "@/lib/store/userStore"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { ChevronUp, Computer } from "lucide-react"
import Link from "next/link"
import { useLogout } from "@/hooks/auth/mutations/useLogout";
import { FullPageSpinner } from "../ui/fullPageLoader";
import { useState } from "react";

export function AppSidebar() {
  const { user } = useUserStore();
  const { logoutMutation  } = useLogout();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
    if (isLoggingOut) return <FullPageSpinner />;
  return (
   
    <Sidebar 
      className="w-64 border-r border-zinc-300/20"
    >
      <SidebarContent className="flex flex-col h-full !text-white" style={{backgroundColor: "#1A1919"}}>

        {/* HEADER */}
        <SidebarHeader className="p-4" style={{backgroundColor: "#1A1919"}}>
          <SidebarMenu>
            <div className="text-md font-bold cursor-pointer text-white">
              Code Flow
            </div>
          </SidebarMenu>
        </SidebarHeader>

        {/* MAIN MENU */}
        <div className="flex-1 overflow-auto ">
          <SidebarGroup style={{backgroundColor: "#1A1919"}}>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <Link href="/projects" passHref>
                  <SidebarMenuButton
                    asChild
                   className=" hover:bg-[#27272A] hover:text-inherit bg-[#27272A] py-5
                   "
                  >
                <div className="flex items-center gap-2 ">
    <Computer className="size-4 shrink-0" />
    <span className="truncate font-semibold text-zinc-400 capitalize  ">
      Projects
    </span>
  </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>

        {/* FOOTER */}
       <SidebarFooter className="flex flex-col gap-2 p-2 py-4">
  <SidebarMenu className="flex w-full flex-col gap-1">
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            asChild
            className="hover:bg-[#27272A] hover:text-white py-5 w-full"
          >
            <div className="flex items-center gap-2 w-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.avatarUrl||"https://api.dicebear.com/9.x/bottts-neutral/png?seed=Felix"}
                  className="rounded-full"
                />
              </Avatar>
              <span className="whitespace-nowrap text-sm truncate ml-2 font-semibold">
                {user?.username || "Guest User"}
              </span>
              <ChevronUp className="ml-auto h-4 w-4 opacity-70" />
            </div>
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="center" className="w-[250px] bg-zinc-950 p-2 rounded-md border border-zinc-800 ">
         <DropdownMenuItem asChild className="!bg-transparent hover:!bg-inherit hover:!text-red-600 p-0">
          <Link
           href="#"
  onClick={(e) => {
    e.preventDefault();
    setIsLoggingOut(true);
    logoutMutation(undefined, {
      onSuccess: () => {
        router.push('/'); 
      },
      onError: () => {
        setIsLoggingOut(false); 
      }
    });
  }}
         className="font-semibold cursor-pointer text-red-600 py-1 px-2 w-full rounded-sm "
          >
            Sign out
          </Link>
        </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarFooter>

      </SidebarContent>
    </Sidebar>
  )
}