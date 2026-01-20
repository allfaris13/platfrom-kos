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
  const htmlElement = document.documentElement;
  
  if (theme === 'dark') {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(STORAGE_THEME_KEY) as Theme | null;
    
    if (storedTheme) {
      setThemeState(storedTheme);
      applyThemeToDom(storedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme: Theme = prefersDark ? 'dark' : 'light';
      setThemeState(initialTheme);
      applyThemeToDom(initialTheme);
    }
    
    setMounted(true);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (mounted) {
      applyThemeToDom(theme);
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
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
