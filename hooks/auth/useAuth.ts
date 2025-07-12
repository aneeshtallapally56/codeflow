import { useEffect, useState } from 'react';
import { TokenManager, isAuthenticated } from '@/lib/utils/auth';
import { useUserStore } from '@/lib/store/userStore';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const checkAuth = () => {
      const token = TokenManager.getValidAccessToken();
      
      if (token) {
        const userInfo = TokenManager.getUserFromToken(token);
        if (userInfo && !user) {
          // Set user from token if not already set
          setUser({
            userId: userInfo.userId,
            email: userInfo.email,
          });
        }
      } else {
        // Clear user if no valid token
        if (user) {
          clearUser();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [user, setUser, clearUser]);

  const logout = () => {
    TokenManager.clearTokens();
    clearUser();
  };

  return {
    user,
    isAuthenticated: isAuthenticated(),
    isLoading,
    logout,
  };
}; 