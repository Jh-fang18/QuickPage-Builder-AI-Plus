/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // 严格模式
  swcMinify: true, // 压缩
  experimental: {
    optimizeCss: true, // 压缩css
    legacyBrowsers: false, // 不兼容旧浏览器
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
