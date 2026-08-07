
const path = require('path')

// 가맹점 도메인의 루트(/)를 '주소를 바꾸지 않고' 스토어프론트로 연결한다.
//
// 예전엔 _app.js 에서 302 로 /shop/ 에 보냈다 → 주소창에 /shop/ 이 그대로 남았다.
// rewrite 는 내부 경로만 갈아끼우므로 고객이 보는 주소는 '가맹점도메인.co.kr' 이다.
// (방문의 대부분이 홈이라, 이것만으로 /shop 은 체감상 사라진다.
//  경로 자체는 살려둔다 — /shop 은 이제 '쇼핑몰형'이 아니라 가맹점 스토어프론트
//  영역 전체를 예약하는 네임스페이스다. 루트에는 본사 랜딩이 이미 살고 있다.)
//
// 본사 랜딩(MAIN_FRONT_URL)과 로컬은 제외 — 그쪽 루트는 계속 랜딩 페이지여야 한다.
// demo-N.shopgo.co.kr(프레임 미리보기)는 제외 대상이 아니므로 스토어프론트로 간다(의도한 동작).
//
// 함정 1: 정규식 alternation 은 반드시 괄호로 묶는다. Next 가 ^...$ 로 감싸기 때문에
//         묶지 않으면 ^A|B|C$ 가 (^A)|(B)|(C$) 로 읽혀 엉뚱한 호스트까지 제외된다.
// 함정 2: MAIN_FRONT_URL 이 비어 있으면 rewrite 를 아예 걸지 않는다.
//         잘못 걸리면 본사 랜딩이 통째로 가려지므로, 확신이 없으면 안 거는 쪽이 안전하다.
//         (이 경우 _app.js 의 302 폴백이 예전처럼 동작한다)
// 함정 3: source 는 '/' 하나뿐이다. 나머지 경로는 손대지 않는다.
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const MAIN_HOST = (process.env.MAIN_FRONT_URL || '').replace(/^www\./, '')
const LANDING_HOSTS = MAIN_HOST
  ? `((www\\.)?${escapeRe(MAIN_HOST)}|localhost|127\\.0\\.0\\.1)(:\\d+)?`
  : null
const storefrontRootRewrite = LANDING_HOSTS
  ? [
    {
      source: '/',
      missing: [{ type: 'host', value: LANDING_HOSTS }],
      destination: '/shop/',
    },
  ]
  : []

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features

module.exports = {
  trailingSlash: true,
  reactStrictMode: true,
  // env block은 아래에 통합됨
  async rewrites() {
    return {
      // '/' 는 실제 페이지(src/pages/index.js)가 있으므로 파일시스템 라우팅보다
      // 먼저 가로채야 한다. afterFiles 에 두면 랜딩이 이겨서 영영 안 걸린다.
      beforeFiles: storefrontRootRewrite,
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${process.env.BACK_URL}/api/:path*`,
        },
      ],
    }
  },
  async headers() {
    return [
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
