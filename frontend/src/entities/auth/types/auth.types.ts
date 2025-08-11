export interface AuthUser {
  email: string;
  name: string;
  isAuthenticated: boolean;
  // Additional user details from database
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department?: string;
  jobTitle?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContext {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}