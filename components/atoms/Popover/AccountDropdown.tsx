'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/hooks/auth/mutations/useLogout';
import { useState } from 'react';
import { FullPageSpinner } from '@/components/ui/fullPageLoader';

export const AccountDropdown = () => {
  const router = useRouter();
  const { logoutMutation } = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoggingOut(true);
    
    try {
      await logoutMutation(undefined, {
        onSuccess: () => {
          router.push('/login');
        },
        onError: () => {
          setIsLoggingOut(false);
        }
      });
    } catch (error) {
      setIsLoggingOut(false);
      console.error('Signout failed:', error);
    }
  };

  if (isLoggingOut) return <FullPageSpinner />;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="px-4 py-2 text-sm font-semibold text-white">My Account</div>
      <div className="h-px bg-zinc-800 w-full my-1" />

      <Link href="/projects">
        <div className="px-4 py-3 text-sm rounded-md hover:bg-zinc-800 text-white cursor-pointer">
          Projects
        </div>
      </Link>

      <div 
        onClick={handleSignout}
        className="px-4 py-3 text-sm rounded-md hover:bg-zinc-800 text-red-300 hover:text-red-500 cursor-pointer"
      >
        Signout
      </div>
    </div>
  );
};