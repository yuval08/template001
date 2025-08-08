import { AuthUser } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export class AuthService {
  public async getUser(): Promise<AuthUser | null> {
    try {
      // Check if user is authenticated using the /me endpoint
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else if (response.status === 401) {
        // User is not authenticated - this is normal
        return null;
      } else {
        // Other error
        console.warn(`Auth check returned status ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  }

  public async login(provider: 'google' | 'microsoft' = 'google'): Promise<void> {
    // Redirect to login endpoint which initiates OAuth flow
    const returnUrl = encodeURIComponent(window.location.href);
    const loginUrl = provider === 'microsoft' 
      ? `${API_BASE_URL}/api/auth/login/microsoft?returnUrl=${returnUrl}`
      : `${API_BASE_URL}/api/auth/login/google?returnUrl=${returnUrl}`;
    
    window.location.href = loginUrl;
  }

  public async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to home
      window.location.href = '/';
    }
  }

  public async getAuthConfig(): Promise<{ googleEnabled: boolean; microsoftEnabled: boolean; allowedDomain?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/config`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get auth config:', error);
    }
    
    // Fallback
    return { googleEnabled: true, microsoftEnabled: false };
  }

  public hasRole(user: AuthUser | null, role: string): boolean {
    return user?.role === role ?? false;
  }

  public hasAnyRole(user: AuthUser | null, roles: string[]): boolean {
    return roles.includes(user?.role ?? '') ?? false;
  }
}

export const authService = new AuthService();