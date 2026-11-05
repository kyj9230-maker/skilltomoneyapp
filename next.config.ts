import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 네트워크 주소(192.168.x.x)로 접속해도 개발 서버의 JS가 차단되지 않도록 허용
  allowedDevOrigins: ["192.168.45.215"],
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
