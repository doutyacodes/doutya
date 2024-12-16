import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./app/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "wowfy.in", // Added this line to allow images from wowfy.in
        pathname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude ssh2 from the server-side Webpack bundle
      config.externals.push("ssh2");
    }

    // Add rule for `.node` files
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
