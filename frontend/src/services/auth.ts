import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { AuthUser } from '@/types';

const settings = {
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
  response_type: 'code',
  scope: import.meta.env.VITE_OIDC_SCOPE || 'openid profile email',
  post_logout_redirect_uri: window.location.origin,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
  silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
};

export class AuthService {
  private userManager: UserManager;

  constructor() {
    this.userManager = new UserManager(settings);
    
    // Setup event handlers
    this.userManager.events.addUserLoaded((user: User) => {
      console.log('User loaded:', user);
    });

    this.userManager.events.addUserUnloaded(() => {
      console.log('User unloaded');
    });

    this.userManager.events.addAccessTokenExpired(() => {
      console.log('Access token expired');
      this.signoutRedirect();
    });

    this.userManager.events.addSilentRenewError((error) => {
      console.error('Silent renew error:', error);
    });
  }

  public async getUser(): Promise<AuthUser | null> {
    try {
      const user = await this.userManager.getUser();
      if (!user || user.expired) {
        return null;
      }

      return {
        id: user.profile.sub!,
        email: user.profile.email!,
        firstName: user.profile.given_name!,
        lastName: user.profile.family_name!,
        roles: user.profile.role ? (Array.isArray(user.profile.role) ? user.profile.role : [user.profile.role]) : [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        token: user.access_token,
        refreshToken: user.refresh_token || '',
        expiresAt: user.expires_at || 0,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  public async signinRedirect(): Promise<void> {
    try {
      await this.userManager.signinRedirect();
    } catch (error) {
      console.error('Error during signin redirect:', error);
      throw error;
    }
  }

  public async signinCallback(): Promise<AuthUser | null> {
    try {
      const user = await this.userManager.signinRedirectCallback();
      if (!user) {
        return null;
      }

      return {
        id: user.profile.sub!,
        email: user.profile.email!,
        firstName: user.profile.given_name!,
        lastName: user.profile.family_name!,
        roles: user.profile.role ? (Array.isArray(user.profile.role) ? user.profile.role : [user.profile.role]) : [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        token: user.access_token,
        refreshToken: user.refresh_token || '',
        expiresAt: user.expires_at || 0,
      };
    } catch (error) {
      console.error('Error during signin callback:', error);
      throw error;
    }
  }

  public async signoutRedirect(): Promise<void> {
    try {
      await this.userManager.signoutRedirect();
    } catch (error) {
      console.error('Error during signout redirect:', error);
      throw error;
    }
  }

  public async signoutCallback(): Promise<void> {
    try {
      await this.userManager.signoutRedirectCallback();
    } catch (error) {
      console.error('Error during signout callback:', error);
      throw error;
    }
  }

  public async renewToken(): Promise<AuthUser | null> {
    try {
      const user = await this.userManager.signinSilent();
      if (!user) {
        return null;
      }

      return {
        id: user.profile.sub!,
        email: user.profile.email!,
        firstName: user.profile.given_name!,
        lastName: user.profile.family_name!,
        roles: user.profile.role ? (Array.isArray(user.profile.role) ? user.profile.role : [user.profile.role]) : [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        token: user.access_token,
        refreshToken: user.refresh_token || '',
        expiresAt: user.expires_at || 0,
      };
    } catch (error) {
      console.error('Error renewing token:', error);
      return null;
    }
  }

  public hasRole(user: AuthUser | null, role: string): boolean {
    return user?.roles.includes(role) ?? false;
  }

  public hasAnyRole(user: AuthUser | null, roles: string[]): boolean {
    return roles.some(role => user?.roles.includes(role)) ?? false;
  }
}

export const authService = new AuthService();