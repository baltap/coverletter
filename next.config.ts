import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'test-page-azl3x.ondigitalocean.app',
          },
        ],
        destination: 'https://scribe.cv/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
