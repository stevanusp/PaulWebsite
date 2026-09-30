import type { NextConfig } from "next";

// Static export: the whole site is plain files, served from a CDN.
// Security headers live in vercel.json; the script and style CSP is injected per page
// at build time by scripts/csp.mjs, with a SHA-256 hash for every inline block.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
