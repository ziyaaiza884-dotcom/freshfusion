import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // package-lock.json also exists further up the tree (C:\Users\USER); pin the
  // workspace root to this project so Turbopack stops warning about it.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
