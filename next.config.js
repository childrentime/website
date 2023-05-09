const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Enable experimental topLevelAwait support
    config.experiments = { topLevelAwait: true };
    return config;
  },
});
