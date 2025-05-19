"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Only run useEffect on the client
  useEffect(() => {
    setMounted(true);
    
    // Check for user preference in localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    
    // Check for system preference if no saved theme
    if (!savedTheme) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      return;
    }
    
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    // Skip the effect on server
    if (!mounted) return;
    
    // Update document class when theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // Use object to avoid re-renders
  const themeContext = React.useMemo(() => ({
    theme,
    toggleTheme: () => {
      setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    }
  }), [theme]);

  // Avoid hydration mismatch by rendering children only after mounting
  return (
    <ThemeContext.Provider value={themeContext}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} 