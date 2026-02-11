"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950">
            <div className="relative flex flex-col items-center">
                {/* Animated Rings */}
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="w-24 h-24 border-t-2 border-r-2 border-amber-500 rounded-full"
                />

                <motion.div
                    animate={{
                        rotate: -360,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute inset-0 w-24 h-24 border-b-2 border-l-2 border-white/20 rounded-full scale-75"
                />

                {/* Center Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Home className="w-6 h-6 text-white" />
                    </div>
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent tracking-widest uppercase">
                        LuxStay
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase font-medium tracking-[0.3em] mt-2">
                        Preparing your premium stay
                    </p>

                    {/* Progress Bar */}
                    <div className="w-48 h-1 bg-white/5 rounded-full mt-6 overflow-hidden">
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export function SkeletonDetail() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 py-8 animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-[500px] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                        <div className="grid grid-cols-3 gap-3">
                            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>
                        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="h-[400px] bg-slate-200 dark:bg-slate-800 rounded-2xl sticky top-24" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                    <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="space-y-2">
                        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}
