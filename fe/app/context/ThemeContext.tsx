'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEME_KEY = 'app_theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

// Helper function untuk apply theme ke DOM
const applyThemeToDom = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  const htmlElement = document.documentElement;
  
  if (theme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Use lazy initializer for theme to read from localStorage immediately
  const [theme, setThemeState] = useState<Theme>(() => {
    // If we're on the server, we can't check localStorage
    if (typeof window === 'undefined') return 'light';
    
    try {
      const storedTheme = localStorage.getItem(STORAGE_THEME_KEY) as Theme | null;
      if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
      
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [mounted, setMounted] = useState(false);

  // 1. Mark as mounted once (handles hydration mismatch)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Sync with DOM and LocalStorage when theme changes
  useEffect(() => {
    applyThemeToDom(theme);
    if (mounted) {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  // Prevent hydration mismatch by not rendering anything theme-specific until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
