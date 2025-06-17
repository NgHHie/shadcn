// Authentication types for the app

// Base login request for username/password
export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

// QLDT/PTIT login credentials
export interface QLDTCredentials {
  username: string;
  password: string;
}

// Google login request
export interface GoogleLoginRequest {
  idToken: string;
  serviceTypes?: string[];
}

// Standard auth response from server
export interface AuthResponse {
  status: number;
  accessToken: string;
  refreshToken: string;
}

// QLDT specific auth response (same as AuthResponse but typed specifically)
export interface QLDTAuthResponse extends AuthResponse {}

// Google specific auth response (same as AuthResponse but typed specifically)
export interface GoogleAuthResponse extends AuthResponse {}

// User profile information
export interface UserProfile {
  id: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string | null;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string | null;
  email: string;
  phone: string;
  birthDay: string;
  role: string;
  userCode: string;
  userPrefix: string;
  fullName: string;
  isPremium: boolean;
}

// Auth context interface
export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  loginWithGoogle: (idToken: string) => Promise<GoogleAuthResponse>;
  loginWithQLDT: (credentials: QLDTCredentials) => Promise<QLDTAuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
