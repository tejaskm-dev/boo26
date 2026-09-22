import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // `next dev` only: a phone on the same Wi-Fi, opening the laptop's address
  // (to scan a team's QR, say), gets a working page instead of one whose
  // scripts the dev server refuses to serve.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  images: {
    formats: ["image/webp"],
  },
};

export default nextConfig;
