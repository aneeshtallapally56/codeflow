import { useEffect, useState } from 'react';
import { TokenManager } from '@/lib/utils/auth';
import { useUserStore } from '@/lib/store/userStore';
import { logout } from '@/lib/api/logout';
import { getCurrentUser } from '@/lib/api/getCurrentUser';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get current user from API (this will use cookies)
        const userData = await getCurrentUser();
        if (userData && !user) {
          setUser({
            userId: userData._id,
            username: userData.username,
            email: userData.email,
            avatarUrl: userData.avatarUrl,
          });
        }
      } catch (error) {
        // If API call fails, user is not authenticated
        if (user) {
          clearUser();
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, setUser, clearUser]);

  const logout = async () => {
    try {
      // Call the logout API to clear server-side session
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local tokens and user state
      TokenManager.clearTokens();
      clearUser();
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
  };
}; 