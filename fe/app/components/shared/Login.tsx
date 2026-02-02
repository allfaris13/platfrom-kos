"use client";

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Home } from 'lucide-react';

interface LoginProps {
  onLoginAsAdmin: () => void;
  onLoginAsUser: () => void;
  onLoginAsGuest: () => void;
}

export function Login({ onLoginAsAdmin, onLoginAsUser, onLoginAsGuest }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginAsAdmin();
    }, 500);
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginAsUser();
    }, 500);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginAsUser();
    }, 500);
  };

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* Left Section - Branding with Image */}
      <div className="hidden md:flex md:w-[55%] flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        {/* Background Image with Scale Animation */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzIyNDZ8MHwxfHNlYXJjaHw3fHxsdXh1cnklMjBhcGFydG1lbnR8ZW58MHx8fHwxNzAwMDAwMDAwfDA&ixlib=rb-4.0.3&q=80&w=1000)',
          }}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-900/70" />
        
        {/* Content */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 text-center max-w-md"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-2xl shadow-xl">
              <Home className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl font-bold mb-4 text-white drop-shadow-lg">Koskosan</motion.h1>
          <motion.p variants={itemVariants} className="text-2xl text-amber-200 mb-6 drop-shadow-md font-semibold">
            Premium Boarding House Management
          </motion.p>
          <motion.p variants={itemVariants} className="text-lg text-slate-200 mb-8 drop-shadow-md">
            Find your perfect room, manage your bookings, and enjoy premium living spaces with ease.
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-4 mt-12">
            {[
              "Premium rooms with modern amenities",
              "Easy booking and payment system",
              "Transparent tenant management"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-200">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex w-full md:w-[45%] items-center justify-center p-6 bg-white md:bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-600">Sign in to your account to continue</p>
          </div>

          {/* Admin Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-5 mb-8 pb-8 border-b border-slate-200">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Label htmlFor="email" className="text-slate-700 font-medium mb-2 block">
                Admin Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@luxestay.com"
                className="border-slate-300"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Label htmlFor="password" className="text-slate-700 font-medium mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-slate-300"
              />
            </motion.div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean | "indeterminate") => setRememberMe(!!checked)}
                />
                <Label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Forgot Password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white h-11 font-semibold"
            >
              {isLoading ? 'Signing in...' : 'Login as Admin'}
            </Button>
          </form>

          {/* User Login */}
          <div className="space-y-4">
            <Button
              type="button"
              onClick={handleUserLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full border-amber-500 text-amber-600 hover:bg-amber-50 h-11 font-semibold"
            >
              Login as Tenant
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white md:bg-slate-50 text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 h-11 font-semibold"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            <Button
              type="button"
              onClick={onLoginAsGuest}
              variant="ghost"
              className="w-full text-slate-600 hover:text-slate-900 h-11"
            >
              Continue as Guest
            </Button>
          </div>

          {/* Demo Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Demo Mode:</span> Use any credentials or Google to sign in
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}