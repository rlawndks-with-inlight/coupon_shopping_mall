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
    list: path(ROOTS_MANAGER, '/orders/list'),
    ready: path(ROOTS_MANAGER, '/orders/ready'),
    wait: path(ROOTS_MANAGER, '/orders/wait'),
    delivery: path(ROOTS_MANAGER, '/orders/delivery'),
    complete: path(ROOTS_MANAGER, '/orders/complete'),
    cancel: path(ROOTS_MANAGER, '/orders/cancel'),
  },
  products: {
    root: path(ROOTS_MANAGER, '/products'),
    list: path(ROOTS_MANAGER, '/products/list'),
    categories: path(ROOTS_MANAGER, '/products/categories'),
  },
  articles: {
    root: path(ROOTS_MANAGER, '/articles'),
    notices: path(ROOTS_MANAGER, '/articles/notices'),
    faqs: path(ROOTS_MANAGER, '/articles/faqs'),
    oneToOne: path(ROOTS_MANAGER, '/articles/one-to-one'),
    calendar: path(ROOTS_MANAGER, '/articles/calendar'),
  },
  designs: {
    root: path(ROOTS_MANAGER, '/designs'),
    main: path(ROOTS_MANAGER, '/designs/main'),
    popup: path(ROOTS_MANAGER, '/designs/popup'),
    sellerMain: path(ROOTS_MANAGER, '/designs/seller-main'),
    itemCard: path(ROOTS_MANAGER, '/designs/item-card'),
  },
  settings: {
    root: path(ROOTS_MANAGER, '/settings'),
    parcelOut: path(ROOTS_MANAGER, '/settings/parcel-out'),
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
