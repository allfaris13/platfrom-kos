"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/app/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-900/50 rounded-3xl border border-red-500/20 backdrop-blur-xl">
          <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="size-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Ops! Terjadi kesalahan</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Sesuatu tidak berjalan semestinya. Jangan khawatir, data Anda tetap aman. 
              Coba muat ulang halaman atau kembali ke beranda.
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Muat Ulang
            </Button>
            <Button 
                onClick={() => window.location.href = "/"}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
            >
              Kembali ke Beranda
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-black/40 rounded-xl text-left font-mono text-xs text-red-400 max-w-full overflow-auto border border-red-900/50">
                {this.state.error?.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
