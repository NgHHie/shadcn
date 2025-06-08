// src/hooks/use-auth.tsx (Fixed version)
import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { TokenManager } from "@/lib/token-manager";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  fullName: string;
  userCode: string;
  role: string;
  isPremium: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const api = useApi();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const hasTokens = TokenManager.hasValidTokens();
      setIsAuthenticated(hasTokens);
      setLoading(false);

      // If has tokens, try to get user info
      if (hasTokens) {
        fetchUserInfo();
      }
    };

    checkAuth();
  }, []);

  // Fetch user info from API
  const fetchUserInfo = async () => {
    try {
      const userInfo = await api.user.getUserInfo();
      setUser(userInfo);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      // Don't clear auth state here, tokens might still be valid
    }
  };

  // Login function
  const login = async (credentials: {
    username: string;
    password: string;
    remember?: boolean;
  }) => {
    try {
      setLoading(true);

      // Call API login
      const response = await api.auth.login(credentials);

      if (response.status === 1) {
        // Tokens are already stored by the API call
        setIsAuthenticated(true);

        // Fetch user info after successful login
        try {
          const userInfo = await api.user.getUserInfo();
          setUser(userInfo);
        } catch (userError) {
          console.error("Failed to fetch user info after login:", userError);
          // Don't fail login if user info fetch fails
        }

        return response;
      } else {
        throw new Error("Login failed: Invalid response status");
      }
    } catch (error) {
      // Clear auth state on login failure
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);

      // Call API logout (will clear tokens)
      await api.auth.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local cleanup even if API fails
    } finally {
      // Always clear local state
      TokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  // Check if user is premium
  const isPremium = (): boolean => {
    return user?.isPremium || false;
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isPremium,
    refetchUser: fetchUserInfo,
  };
};
