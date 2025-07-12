'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/hooks/auth/mutations/useLogout';
import { Button } from '@/components/ui/button';
import { LogOut, LoaderCircle } from 'lucide-react';

interface SignoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export const SignoutButton = ({ 
  variant = 'ghost', 
  size = 'default', 
  className = '',
  children 
}: SignoutButtonProps) => {
  const router = useRouter();
  const { logoutMutation } = useLogout();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignout = async () => {
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

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          {children || 'Sign out'}
        </>
      )}
    </Button>
  );
}; 