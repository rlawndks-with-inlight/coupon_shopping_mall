
const path = require('path')

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features

module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  // env block은 아래에 통합됨
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACK_URL}/api/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=120" },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
  compress: true,
  transpilePackages: [
    '@fullcalendar/common',
    '@fullcalendar/core',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/list',
    '@fullcalendar/timegrid'
  ],
  experimental: {
    esmExternals: false,
    //scrollRestoration: true
    //scrollRestoration: true
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  },
  env: {
    HOST_API_KEY: `${process.env.BACK_URL}`,
    BACK_URL: process.env.BACK_URL,
    NOTI_URL: process.env.NOTI_URL,
    SETTING_SITEMAP_URL: process.env.SETTING_SITEMAP_URL,
    IS_TEST: process.env.IS_TEST,
    TEST_SHOP_DEMO: process.env.TEST_SHOP_DEMO,
    TEST_BLOG_DEMO: process.env.TEST_BLOG_DEMO,
    MAIN_FRONT_URL: process.env.MAIN_FRONT_URL,
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
    CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
    CLOUDINARY_PRESET: process.env.CLOUDINARY_PRESET,
  }
}
