import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
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
        hostname: "res.cloudinary.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "rahmatzaw.elarisnoir.my.id",
        port: "",
      }
    ],
    // Hanya unoptimized di development, di production akan dioptimasi
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
