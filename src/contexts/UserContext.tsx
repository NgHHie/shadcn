import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TokenManager } from '@/lib/token-manager';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  userId: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = TokenManager.getAccessToken();
        if (token) {
          const tokenInfo = TokenManager.decodeToken(token);
          if (tokenInfo?.sub) {
            // Create user object from token info
            const userFromToken: User = {
              id: tokenInfo.sub,
              username: tokenInfo.name || 'user',
              email: tokenInfo.email || '',
              fullName: tokenInfo.name || 'User',
              role: tokenInfo.role || 'STUDENT'
            };
            setUser(userFromToken);
            console.log('✅ User initialized from token:', userFromToken);
          }
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const logout = () => {
    TokenManager.clearTokens();
    setUser(null);
  };

  const value: UserContextType = {
    user,
    userId: user?.id || null,
    loading,
    setUser,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
