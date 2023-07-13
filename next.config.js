
const path = require('path')

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
  async redirects() {
    return [
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.BACK_URL}/api/v1/:path*`,
      },
      {
        source: "/api/v2/comagain/:path*",
        destination: `${process.env.NOTI_URL}/api/v2/comagain/:path*`,
      }
    ]
  },
  transpilePackages: [
    '@fullcalendar/common',
    '@fullcalendar/core',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/list',
    '@fullcalendar/timegrid'
  ],
  experimental: {
    esmExternals: false
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  },
  env: {
    BACK_URL: process.env.BACK_URL,
    NOTI_URL: process.env.NOTI_URL,
    IS_TEST: process.env.IS_TEST,
    TEST_SHOP_DEMO: process.env.TEST_SHOP_DEMO,
    TEST_BLOG_DEMO: process.env.TEST_BLOG_DEMO,
  }
}
