// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_MANAGER = '/manager';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/manager/login',
};

export const PATH_MANAGER = {
  root: ROOTS_MANAGER,
  dashboards: path(ROOTS_MANAGER, '/dashboards'),
  users: {
    root: path(ROOTS_MANAGER, '/users'),
    list: path(ROOTS_MANAGER, '/users/list'),
    sellers: path(ROOTS_MANAGER, '/users/sellers'),
    sales: path(ROOTS_MANAGER, '/users/sales'),
  },
  orders: {
    root: path(ROOTS_MANAGER, '/orders'),
    trx: path(ROOTS_MANAGER, '/orders/trx'),
    invoice: path(ROOTS_MANAGER, '/orders/invoice'),
    cashBill: path(ROOTS_MANAGER, '/orders/cash-bill'),
  },
  products: {
    root: path(ROOTS_MANAGER, '/products'),
    list: path(ROOTS_MANAGER, '/products/list'),
    categories: path(ROOTS_MANAGER, '/products/categories'),
  },
  articles: {
    root: path(ROOTS_MANAGER, '/articles'),
    categories: path(ROOTS_MANAGER, '/articles/categories'),
    notices: path(ROOTS_MANAGER, '/articles/notices'),
    faqs: path(ROOTS_MANAGER, '/articles/faqs'),
    oneToOne: path(ROOTS_MANAGER, '/articles/one-to-one'),
    calendar: path(ROOTS_MANAGER, '/articles/calendar'),
  },
  designs: {
    root: path(ROOTS_MANAGER, '/designs'),
    main: path(ROOTS_MANAGER, '/designs/main'),
    blogMain: path(ROOTS_MANAGER, '/designs/blog-main'),
    popup: path(ROOTS_MANAGER, '/designs/popup'),
    itemCard: path(ROOTS_MANAGER, '/designs/item-card'),
    blogItemCard: path(ROOTS_MANAGER, '/designs/blog-item-card'),
    settings: path(ROOTS_MANAGER, '/designs/settings'),
  },
  settings: {
    root: path(ROOTS_MANAGER, '/settings'),
    default: path(ROOTS_MANAGER, '/settings/default'),
    parcelOut: path(ROOTS_MANAGER, '/settings/parcel-out'),
    brands: path(ROOTS_MANAGER, '/settings/brands'),
  },
  pays: {
    root: path(ROOTS_MANAGER, '/pays'),
    list: path(ROOTS_MANAGER, '/pays/list'),
  },
};

export const react_quill_data = {
  modules: {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['link', 'image', 'video'],
      ['clean'],
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  },
  formats: [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'color'
  ]
}

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
      tutorial_num: 0,
      shop_demo_num:0,
      blog_demo_num:0,
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
          },
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
          },
        ]
      }
    ]
  },
  articles: {
    category_id: null,
    parent_id: null,
    post_title: '',
    post_content: '',
    is_reply: true,
  },
}
