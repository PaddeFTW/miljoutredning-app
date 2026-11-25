import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@kg/core", "@kg/data", "@kg/product"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
