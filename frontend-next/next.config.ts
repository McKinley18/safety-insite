import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Verification builds and audit servers must never write into the `.next/`
  // directory a running `next dev` is using: a `next build` that lands there
  // while the dev server is live corrupts its output and the dev server then
  // answers 500 on every route (recorded as the local-dev cache fault in
  // blueprint 71.12). Setting NEXT_DIST_DIR gives an isolated build directory,
  // so an audit or a production-build check can run alongside `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
