// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
// import { TDP_MAPPING } from "@constants/roles"; // Sẽ dùng getTDPInfo thay thế
import { AuthUser, getUserRole, getUserPermissions, getTDPInfo } from '../utils/auth';

interface AuthContextType {
  user: AuthUser | null;
  zaloId: string | null;
  isLoading: boolean;
  login: (zaloId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [zaloId, setZaloId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      // TODO: Tích hợp với Zalo SDK để lấy user info
      // Tạm thời sử dụng localStorage
      const savedZaloId = localStorage.getItem('zaloId');
      
      if (savedZaloId) {
        await login(savedZaloId);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userZaloId: string) => {
    try {
      const role = getUserRole(userZaloId);
      const permissions = getUserPermissions(role);
      let tdpName: string | undefined;

      // Lấy tên TDP nếu là tổ trưởng
      if (role === 'leader') {
        tdpName = await getTDPInfo(userZaloId) || undefined;
      }

      const newUser: AuthUser = {
        zaloId: userZaloId,
        role,
        permissions,
        tdpName
      };

      setUser(newUser);
      setZaloId(userZaloId);
      localStorage.setItem('zaloId', userZaloId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setZaloId(null);
    localStorage.removeItem('zaloId');
  };

  const contextValue = useMemo(() => ({
    user,
    zaloId,
    isLoading,
    login,
    logout
  }), [user, zaloId, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};