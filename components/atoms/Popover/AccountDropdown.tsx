'use client';

import Link from 'next/link';

export const AccountDropdown = () => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="px-4 py-2 text-sm font-semibold text-white">My Account</div>
      <div className="h-px bg-zinc-800 w-full my-1" />

      <Link href="/projects">
        <div className="px-4 py-3 text-sm rounded-md hover:bg-zinc-800 text-white cursor-pointer">
          Projects
        </div>
      </Link>

      <Link href="/signout">
        <div className="px-4 py-3 text-sm rounded-md hover:bg-zinc-800 text-red-300 hover:text-red-500 cursor-pointer">
          Signout
        </div>
      </Link>
    </div>
  );
};