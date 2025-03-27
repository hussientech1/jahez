import { createContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user, updateUserSettings, isAuthenticated } = useAuth();
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for user preference first
    if (user?.darkMode) return "dark";
    
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme as Theme;
    
    // Check for system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    // Update theme when user changes
    if (user) {
      setTheme(user.darkMode ? "dark" : "light");
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Update user preference if authenticated
    if (isAuthenticated) {
      updateUserSettings({ darkMode: newTheme === "dark" });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
