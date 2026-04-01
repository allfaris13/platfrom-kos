import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "sonner";
import { AppProvider } from "./context";
import { ThemeProvider } from "./context/ThemeContext";
import { SWRProvider } from "@/app/components/providers/swr-provider";
import { GoogleAuthProvider } from "@/app/components/providers/google-auth-provider";
import { NotificationProvider } from "@/app/components/providers/notification-provider";
import { ErrorBoundary } from "@/app/components/shared/ErrorBoundary";
import { LanguageProvider } from "./context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rahmat ZAW Prime Stay | Luxury Guest House Malang",
  description: "Exclusive and comfortable living spaces in Malang. Managed with excellence by Rahmat ZAW.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500 ease-in-out`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <AppProvider>
              <SWRProvider>
                <GoogleAuthProvider>
                  <NotificationProvider>
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                  </NotificationProvider>
                </GoogleAuthProvider>
              </SWRProvider>
              <Toaster position="top-center" richColors />
            </AppProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          strategy="beforeInteractive"
        />

      </body>
    </html>
  );
}

