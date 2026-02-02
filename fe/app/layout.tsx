import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context";
import { ThemeProvider } from "./context/ThemeContext";
import { SWRProvider } from "@/app/components/providers/swr-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kos-kosan Management System",
  description: "Sistem manajemen kos-kosan terpadu untuk pemilik dan penyewa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300`}
      >
        <ThemeProvider>
          <AppProvider>
            <SWRProvider>
              {children}
            </SWRProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

