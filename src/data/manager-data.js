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
  one: path(ROOTS_MANAGER, '/one'),
  two: path(ROOTS_MANAGER, '/two'),
  three: path(ROOTS_MANAGER, '/three'),
  user: {
    root: path(ROOTS_MANAGER, '/user'),
    four: path(ROOTS_MANAGER, '/user/four'),
    five: path(ROOTS_MANAGER, '/user/five'),
    six: path(ROOTS_MANAGER, '/user/six'),
  },
};
