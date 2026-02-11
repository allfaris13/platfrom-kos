"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Shield, ArrowLeft } from 'lucide-react';
import { api } from '@/app/services/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = await api.login({ username, password });
      if (data.user.role !== 'admin') {
        api.logout();
        setError('Access denied. Admin privileges required.');
        return;
      }
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
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 overflow-auto md:overflow-hidden">
      {/* Left/Top Side: Visual Feature Section */}
      <div className="flex-shrink-0 md:w-1/2 lg:w-[55%] relative overflow-hidden bg-slate-950 min-h-[350px] md:min-h-0">
        {/* Background with animated zoom */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(245,158,11,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(245,158,11,0.15) 0%, transparent 50%)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-8 md:p-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-6 md:mb-10 rounded-2xl md:rounded-3xl bg-amber-500/15 backdrop-blur-md border border-amber-500/25 shadow-2xl shadow-amber-500/20">
              <Shield className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 leading-tight tracking-tight">
              Admin <span className="text-amber-500">Panel</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-lg mx-auto mb-6 md:mb-10 opacity-90">
              Secure access for system administrators only. Manage your property with ease.
            </p>

            <div className="flex items-center justify-center gap-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-white">24/7</p>
                <p className="text-slate-500 text-[10px] md:text-sm uppercase tracking-wider font-semibold">
                  Monitoring
                </p>
              </div>
              <div className="w-px h-8 md:h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-white">256-bit</p>
                <p className="text-slate-500 text-[10px] md:text-sm uppercase tracking-wider font-semibold">
                  Encryption
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Branding */}
        <div className="absolute top-6 left-6 md:top-12 md:left-12 z-20 flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-white text-lg md:text-xl">R</span>
          </div>
          <span className="text-white font-bold text-base md:text-lg tracking-tight">
            Rahmat ZAW
          </span>
        </div>
      </div>

      {/* Right/Bottom Side: Login Form */}
      <div className="flex w-full md:w-1/2 lg:w-[45%] items-center justify-center p-12 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-sm"
        >
          <Button variant="ghost" onClick={onBack} className="mb-10 p-0 hover:bg-transparent text-slate-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to selection
          </Button>

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-3">Login Admin</h2>
            <p className="text-slate-400 font-medium leading-relaxed">Verification required to proceed</p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-6 text-sm font-medium border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-slate-300">Admin Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="mt-1 bg-slate-900 border-slate-700 text-white focus:border-amber-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-slate-300">Security Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 bg-slate-900 border-slate-700 text-white focus:border-amber-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11 font-semibold mt-6 rounded-xl shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02]"
            >
              {isLoading ? 'Verifying...' : 'Authenticate'}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-sm">
              Protected by military-grade encryption.<br />
              All login attempts are logged.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
