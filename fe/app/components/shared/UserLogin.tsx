"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Home, ArrowLeft } from 'lucide-react';
import { api } from '@/app/services/api';
import { ImageWithFallback } from './ImageWithFallback';
import { GoogleButton } from '../tenant/GoogleButton';

interface UserLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onRegisterClick: () => void;
}

export function UserLogin({ onLoginSuccess, onBack, onRegisterClick }: UserLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.login({ username, password });
      onLoginSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 overflow-auto md:overflow-hidden">
      <div className="flex-shrink-0 md:w-1/2 bg-stone-900 border-b md:border-b-0 md:border-r border-slate-200/10 flex items-center justify-center relative overflow-hidden min-h-[300px] md:min-h-0">
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000"
            alt="Premium Interior"
            className="w-full h-full object-cover opacity-60"
            priority
          />
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-900/30" />
        </div>

        <div className="relative z-10 text-center max-w-md p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Home className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-4 md:mb-8 text-amber-500 shadow-sm" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black mb-2 md:mb-4 text-white tracking-tight">Welcome <span className="text-amber-500">Tenant</span></h1>
          <p className="text-sm md:text-xl text-stone-200 font-medium leading-relaxed">
            Log in to manage your bookings and experience world-class comfort.
          </p>
        </div>
      </div>

      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Button variant="ghost" onClick={onBack} className="mb-8 p-0 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Tenant Login</h2>
          <p className="text-slate-600 mb-8">Enter your credentials to access your portal</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white h-11 font-semibold mt-4"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <GoogleButton
            isLoading={isLoading}
            onSuccess={(data) => {
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              onLoginSuccess();
            }}
          />

          <p className="mt-8 text-center text-slate-600">
            Don&apos;t have an account?{' '}
            <button
              onClick={onRegisterClick}
              className="text-amber-600 font-semibold hover:underline"
            >
              Register here
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
