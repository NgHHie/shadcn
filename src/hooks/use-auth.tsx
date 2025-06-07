import { useState, useEffect } from "react";
import {
  QuestionListItem,
  QuestionDetail,
  useApi,
  UserProfile,
} from "@/lib/api";
import { toastError } from "@/lib/toast";

// src/hooks/use-auth.tsx
export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const api = useApi();

  useEffect(() => {
    const checkAuth = () => {
      const token = api.utils.getAuthToken();
      setIsAuthenticated(!!token);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Even if API call fails, clear local state
      api.utils.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    fullName: string;
    username: string;
  }) => {
    try {
      const response = await api.auth.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
  };
};
