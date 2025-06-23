'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  return (
    <nav className="w-full relative">
      <div className="max-w-screen-2xl mx-auto px-8 py-6 flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <div className="flex gap-24 items-center">
          <a className="font-semibold text-lg text-white cursor-pointer">
            Code Flow
          </a>
        </div>

        {/* Right Side: Profile Picture */}


      <Avatar className='w-10 h-10'>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>


      </div>
    </nav>
  );
}