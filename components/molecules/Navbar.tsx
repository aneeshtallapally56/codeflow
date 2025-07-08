

import Link from "next/link";
import Image from "next/image";
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api/getCurrentUser';
import { Skeleton } from "../ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AccountDropdown } from "../atoms/Popover/AccountDropdown";

export const Navbar = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    retry: false, // Don't retry on auth failure
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <nav className="w-full relative">
      <div className="max-w-screen-2xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex gap-24 items-center">
          <Link href="/" className="font-bold">
            <span className="cursor-pointer">Code Flow</span>
          </Link>
        </div>

       
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-full skeleton " />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px] skeleton"  />
        <Skeleton className="h-4 w-[100px] skeleton" />
      </div>
    </div>
            ) : user ? (
              <div  className="flex items-center gap-3">
                <Popover>
              <PopoverTrigger className="cursor-pointer">

                <Image
                  src={user.avatarUrl || "https://api.dicebear.com/9.x/bottts-neutral/png?seed=Felix"}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                  />
                </PopoverTrigger >
                
  <PopoverContent className="bg-zinc-950 p-2 rounded-md w-[300px] mr-5 mt-2 border border-accent/30 shadow-md text-white">
    <AccountDropdown />
  </PopoverContent>
                  </Popover>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-zinc-400 rounded-lg font-bold tracking-tight hover:opacity-90 transition-colors relative inline-block">
                  <span className="px-6 py-3 inline-block">
                    <span className="w-12">Sign In</span>
                  </span>
                </Link>
                <Link href="/signup">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-lg shadow-[#003461] font-bold hover:opacity-80 transition-all ease-in duration-300 h-10 px-4 py-2 rounded-lg">
                    <span className="w-20 flex justify-center items-center lg:text-base text-sm">
                      Get Started
                    </span>
                  </button>
                </Link>
              </>
            )}
          </div>
     
      </div>
    </nav>
  );
};