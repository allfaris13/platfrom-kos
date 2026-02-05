import { motion } from 'framer-motion';
import { Loader2, Home } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ message = 'Loading...', fullScreen = true }: LoadingScreenProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-stone-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'
    : 'flex items-center justify-center py-20';

  return (
    <div className={containerClass}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo Animation */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="w-16 h-16 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 rounded-2xl flex items-center justify-center shadow-2xl"
        >
          <Home className="w-8 h-8 text-white" />
        </motion.div>

        {/* Loading Spinner */}
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-stone-700 dark:text-stone-300 animate-spin" />
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            {message}
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-stone-700 dark:bg-stone-300 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Skeleton Loader Components
export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white dark:bg-slate-900 rounded-xl p-6 shadow border border-slate-200 dark:border-slate-800"
        >
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
