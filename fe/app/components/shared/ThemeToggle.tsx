"use client";

import { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeContext } from "@/app/context/ThemeContext";
import { motion } from "framer-motion";

export function ThemeToggle({ className = '' }: { className?: string }) {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("ThemeToggle must be used within a ThemeProvider");
  }

  const { theme, toggleTheme } = context;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 
        bg-slate-100 dark:bg-slate-900/80 text-amber-600 dark:text-amber-500 
        hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400 
        border border-slate-200 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-500/50 ${className}`}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
    </motion.button>
  );
}
