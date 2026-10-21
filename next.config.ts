import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // package-lock.json also exists further up the tree (C:\Users\USER); pin the
  // workspace root to this project so Turbopack stops warning about it.
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // product pages moved from /product/<slug> to /products/<slug>;
      // permanent (308) so search engines carry rankings across
      {
        source: "/product/:slug",
        destination: "/products/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
