import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Get token from storage
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY) || Cookies.get(this.ACCESS_TOKEN_KEY) || null;
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || Cookies.get(this.REFRESH_TOKEN_KEY) || null;
  }

  // Store tokens
  static setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  // Clear tokens
  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
  }

  // Check if token is valid
  static isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Get valid access token
  static getValidAccessToken(): string | null {
    const token = this.getAccessToken();
    if (token && this.isTokenValid(token)) {
      return token;
    }
    return null;
  }

  // Decode token
  static decodeToken(token: string): DecodedToken | null {
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  // Get user info from token
  static getUserFromToken(token: string): { userId: string; email: string } | null {
    const decoded = this.decodeToken(token);
    if (decoded) {
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    }
    return null;
  }
}

// Authorization header helper
export const getAuthHeaders = (): Record<string, string> => {
  const token = TokenManager.getValidAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  // Since we're using HTTP-only cookies, we can't check the token directly
  // We'll rely on the user store state and API calls to determine authentication
  return true; // This will be overridden by the useAuth hook
}; 