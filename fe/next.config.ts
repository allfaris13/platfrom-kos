import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8081",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
      },
      // TODO: Tambahkan domain production Anda di sini sebelum deploy
      // {
      //   protocol: "https",
      //   hostname: "yourdomain.com",
      // }
    ],
    // Hanya unoptimized di development, di production akan dioptimasi
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
