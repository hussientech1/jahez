import { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (nationalNumber: string, password: string) => Promise<void>;
  register: (userData: {
    nationalNumber: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => void;
  updateUserSettings: (settings: {
    darkMode?: boolean;
    language?: string;
    phoneNumber?: string;
    email?: string;
  }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUserSettings: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's a token in localStorage
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      
      // Fetch user data using the token
      const fetchUser = async () => {
        try {
          const response = await apiRequest("GET", "/api/user");
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Token is invalid or expired, clear it
          localStorage.removeItem("auth_token");
          setToken(null);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (nationalNumber: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", {
        nationalNumber,
        password,
      });
      
      const data = await response.json();
      
      // Save token and user data
      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    nationalNumber: string;
    password: string;
    fullName: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/register", userData);
      
      const data = await response.json();
      
      // Save token and user data
      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  const updateUserSettings = async (settings: {
    darkMode?: boolean;
    language?: string;
    phoneNumber?: string;
    email?: string;
  }) => {
    try {
      if (!token) return;

      const response = await apiRequest("PUT", "/api/user/settings", settings);
      const updatedUser = await response.json();
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
    updateUserSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
