// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`
}

const ROOTS_MANAGER = '/manager'

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/manager/login'
}

export const PATH_MANAGER = {
  root: ROOTS_MANAGER,
  dashboards: path(ROOTS_MANAGER, '/dashboards'),
  users: {
    root: path(ROOTS_MANAGER, '/users'),
    list: path(ROOTS_MANAGER, '/users/list'),
    sellers: path(ROOTS_MANAGER, '/users/sellers'),
    points: path(ROOTS_MANAGER, '/users/points'),
    sales: path(ROOTS_MANAGER, '/users/sales')
  },
  orders: {
    root: path(ROOTS_MANAGER, '/orders'),
    trx: path(ROOTS_MANAGER, '/orders/trx'),
    trxCancel: path(ROOTS_MANAGER, '/orders/trx-cancel'),
    invoice: path(ROOTS_MANAGER, '/orders/invoice'),
    cashBill: path(ROOTS_MANAGER, '/orders/cash-bill')
  },
  products: {
    root: path(ROOTS_MANAGER, '/products'),
    list: path(ROOTS_MANAGER, '/products/list'),
    categoryGroups: path(ROOTS_MANAGER, '/products/category-groups'),
    categories: path(ROOTS_MANAGER, '/products/categories')
  },
  articles: {
    root: path(ROOTS_MANAGER, '/articles'),
    categories: path(ROOTS_MANAGER, '/articles/categories'),
    notices: path(ROOTS_MANAGER, '/articles/notices'),
    faqs: path(ROOTS_MANAGER, '/articles/faqs'),
    calendar: path(ROOTS_MANAGER, '/articles/calendar')
  },
  designs: {
    root: path(ROOTS_MANAGER, '/designs'),
    main: path(ROOTS_MANAGER, '/designs/main'),
    blogMain: path(ROOTS_MANAGER, '/designs/blog-main'),
    popup: path(ROOTS_MANAGER, '/designs/popup'),
    itemCard: path(ROOTS_MANAGER, '/designs/item-card'),
    blogItemCard: path(ROOTS_MANAGER, '/designs/blog-item-card'),
    settings: path(ROOTS_MANAGER, '/designs/settings')
  },
  settings: {
    root: path(ROOTS_MANAGER, '/settings'),
    default: path(ROOTS_MANAGER, '/settings/default'),
    parcelOut: path(ROOTS_MANAGER, '/settings/parcel-out'),
    paymentModules: path(ROOTS_MANAGER, '/settings/payment-modules'),
    brands: path(ROOTS_MANAGER, '/settings/brands')
  }
}
export const pg_companies = [
  {
    id: 1,
    name: '페이투스',
    rep_name: '서동균',
    company_name: '(주)페이투스',
    business_num: '810-81-00347',
    phone_num: '02-465-8800',
    addr: '서울특별시 금천구 가산디지털1로 168, C동 7층 701B호(가산동, 우림라이온스밸리)'
  },
  {
    id: 2,
    name: '케이원피에스',
    rep_name: '강승구',
    company_name: '(주)케이원피에스',
    business_num: '419-88-00046',
    phone_num: '1855-1838',
    addr: '서울특별시 구로구 디지털로33길 27, 5층 513호, 514호(구로동, 삼성IT밸리)'
  },
  {
    id: 3,
    name: '에이닐',
    rep_name: '이승철',
    company_name: '(주)에이닐에프앤피',
    business_num: '788-87-00950',
    phone_num: '1544-6872',
    addr: '서울 송파구 법원로11길 7 (문정동) 문정현대지식산업센터C동 1404~1406호'
  },
  {
    id: 4,
    name: '웰컴페이먼츠',
    rep_name: '김기현',
    company_name: '웰컴페이먼츠(주)',
    business_num: '526-87-00842',
    phone_num: '02-838-2001',
    addr: '서울특별시 용산구 한강대로 148 웰컴금융타워 16층'
  },
  {
    id: 5,
    name: '헥토파이넨셜',
    rep_name: '최종원',
    company_name: '(주)헥토파이낸셜',
    business_num: '101-81-63383',
    phone_num: '1600-5220',
    addr: '서울특별시 강남구 테헤란로34길 6, 9~10층(역삼동, 태광타워)'
  },
  {
    id: 6,
    name: '루멘페이먼츠',
    rep_name: '김인환',
    company_name: '(주)루멘페이먼츠',
    business_num: '707-81-01787',
    phone_num: '02-1599-1873',
    addr: '서울특별시 동작구 상도로 13 4층 (프라임빌딩)'
  },
  {
    id: 7,
    name: '페이레터',
    rep_name: '이성우',
    company_name: '페이레터(주)',
    business_num: '114-86-05588',
    phone_num: '1599-7591',
    addr: '서울시 강남구 역삼로 223 (역삼동 733-23, 대사빌딩) 페이레터(주)'
  },
  {
    id: 8,
    name: '홀빅(페이스타)',
    rep_name: '김병규',
    company_name: '주식회사 홀빅',
    business_num: '136-81-35826',
    phone_num: '1877-5916',
    addr: '서울특별시 송파구 송파대로 167, B동 609호(문정동, 문정역테라타워)'
  },
  {
    id: 9,
    name: '코페이',
    rep_name: '채수철',
    company_name: '주식회사 코페이',
    business_num: '206-81-90716',
    phone_num: '1644-3475',
    addr: '서울 성동구 성수일로 77 서울숲IT밸리 608-611호'
  },
  {
    id: 10,
    name: '코리아결제시스템',
    rep_name: '박형석',
    company_name: '(주)코리아결제시스템',
    business_num: '117-81-85188',
    phone_num: '02-6953-6010',
    addr: '서울 강남구 도산대로1길 40 (신사동) 201호'
  },
  {
    id: 11,
    name: '더페이원',
    rep_name: '이일호',
    company_name: '(주)더페이원',
    business_num: '860-87-00645',
    phone_num: '1670-1915',
    addr: '서울 송파구 송파대로 201 B동 1621~2호 (문정동, 테라타워2)'
  },
  {
    id: 12,
    name: '이지피쥐',
    rep_name: '김도형',
    company_name: '주식회사 이지피쥐',
    business_num: '635-81-00256',
    phone_num: '02-1522-3434',
    addr: '서울 강남구 도산대로 157 (신사동) 신웅타워2 15층'
  },
  {
    id: 13,
    name: 'CM페이',
    rep_name: '',
    company_name: '씨엠컴퍼니 주식회사',
    business_num: '',
    phone_num: '',
    addr: ''
  },
  {
    id: 14,
    name: '키움페이',
    rep_name: '성백진',
    company_name: '(주)다우데이타',
    business_num: '220-81-01733',
    phone_num: '1588-5984',
    addr: '서울시 마포구 독막로 311 재화스퀘어 5층'
  },
  {
    id: 15,
    name: '위즈페이',
    rep_name: '이용재',
    company_name: '(주)유니윌 위즈페이',
    business_num: '220-85-36623',
    phone_num: '1544-3267',
    addr: '서울 강남구 테헤란로 124, 5층 (역삼동, 삼원타워) (주)유니윌 위즈페이'
  },
  {
    id: 16,
    name: '네스트페이',
    rep_name: '김찬수',
    company_name: '(주)페이네스트',
    business_num: '139-81-46088',
    phone_num: '02-431-8333',
    addr: '서울특별시 송파구 송파대로 201, 테라타워2 A동 905호 (문정동)'
  },
  {
    id: 17,
    name: 'E2U',
    rep_name: '이용원',
    company_name: '(주)이투유',
    business_num: '383-87-01545',
    phone_num: '1600-4191',
    addr: '경기도 성남시 수정구 위례광장로 19 아이페리온, 10층 1001호'
  },
  {
    id: 18,
    name: '에드원',
    rep_name: '김춘걸',
    company_name: '주식회사 에드원',
    business_num: '114-81-90678',
    phone_num: '554-4002',
    addr: '서울시 영등포구 당산로 41길 11, E동 1109호 (당산동 4가, 당산 SK V1센터)'
  },
  {
    id: 19,
    name: '삼인칭',
    rep_name: '윤건',
    company_name: '주식회사 삼인칭',
    business_num: '489-87-00733',
    phone_num: '1833-4854',
    addr: '서울특별시 마포구 큰우물로 76, 403호(도화동, 고려빌딩'
  },
  {
    id: 20,
    name: 'WGP',
    rep_name: '우강섭',
    company_name: '(주)윈글로벌페이',
    business_num: '648-86-00577',
    phone_num: '1877-7590',
    addr: '[12918] 경기도 하남시 조정대로 45, 미사센텀비즈 F348호'
  }
]
export const defaultManagerObj = {
  brands: {
    name: '',
    dns: '',
    og_description: '',
    company_name: '',
    pvcy_rep_name: '',
    ceo_name: '',
    addr: '',
    addr_detail: '',
    resident_num: '',
    business_num: '',
    phone_num: '',
    fax_num: '',
    note: '',
    logo_file: undefined,
    dark_logo_file: undefined,
    favicon_file: undefined,
    og_file: undefined,
    setting_obj: {
      max_use_point: 0, //주문시 최대포인트 사용금액
      point_rate: 0, //주문시 구매액 대비 포인트적립 비율
      use_point_min_price: 0, //포인트 한번에 사용할 수 있는 최대 금액
      tutorial_num: 0, //튜토리얼 진행시 순서
      shop_demo_num: 0, //쇼핑몰 데모넘버
      blog_demo_num: 0, //블로그쇼핑몰 데모넘버
      is_use_seller: 0, //셀러 사용여부
      is_use_consignment: 0, //위탁 사용여부
      is_use_item_card_style: 0,//상품카드 스타일 사용여부
    },
    seo_obj: {
      naver_token: '',
      google_token: '',
    },
    bonaeja_obj: {
      api_key: '',
      user_id: '',
      sender: '',
    },
    theme_css: {
      main_color: '#00ab55'
    },
    shop_obj: [
      {
        type: 'banner',
        list: [
          {
            src: '/images/test/1.jpg',
            link: ''
          }
        ]
      }
    ],
    blog_obj: [
      {
        type: 'banner',
        list: [
          {
            src: '/images/test/1.jpg',
            link: ''
          }
        ]
      }
    ]
  },
  articles: {
    category_id: 0,
    parent_id: -1,
    post_title: '',
    post_content: '',
    is_reply: 0
  }
}
