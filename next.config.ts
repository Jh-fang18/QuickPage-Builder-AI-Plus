/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // 严格模式
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
