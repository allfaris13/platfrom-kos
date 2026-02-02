'use client';

import { useTheme } from '@/app/context/useTheme';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useEffect, useState } from 'react';

/**
 * Theme Toggle Button - Icon only
 * Displays Sun icon untuk light mode, Moon icon untuk dark mode
 * 
 * @example
 * <ThemeToggleButton />
 */
export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-slate-700" />
      ) : (
        <Sun className="w-5 h-5 text-slate-300" />
      )}
    </Button>
  );
}
