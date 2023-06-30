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
  dashboard: path(ROOTS_MANAGER, '/dashboard'),
  user: {
    root: path(ROOTS_MANAGER, '/user'),
    seller: path(ROOTS_MANAGER, '/user/seller'),
    sales: path(ROOTS_MANAGER, '/user/sales'),
  },
  order: {
    root: path(ROOTS_MANAGER, '/order'),
  },
  product: {
    root: path(ROOTS_MANAGER, '/product'),
  },
  article: {
    root: path(ROOTS_MANAGER, '/article'),
  },
  design: {
    root: path(ROOTS_MANAGER, '/design'),
  },
  setting: {
    root: path(ROOTS_MANAGER, '/setting'),
  },
  pay: {
    root: path(ROOTS_MANAGER, '/pay'),
  },
};
