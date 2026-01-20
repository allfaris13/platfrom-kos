import { useContext } from 'react';
import { ThemeContext, ThemeContextType } from './ThemeContext';

/**
 * Custom hook untuk mengakses theme context
 * Gunakan di komponen untuk toggle dark/light mode
 * 
 * @example
 * const { theme, toggleTheme } = useTheme();
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    // Return default context for SSR/build time
    return {
      theme: 'light',
      toggleTheme: () => {},
      setTheme: () => {}
    };
  }

  return context;
}
