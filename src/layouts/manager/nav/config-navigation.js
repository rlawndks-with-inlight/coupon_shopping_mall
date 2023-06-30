// routes
import { PATH_MANAGER } from '../../../data/manager-data';
// components
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: icon('ic_user'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  manager: icon('ic_manager'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    items: [
      { title: '대시보드', path: PATH_MANAGER.one, icon: ICONS.manager },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    items: [
      {
        title: '회원관리',
        path: PATH_MANAGER.user.root,
        icon: ICONS.user,
        children: [
          { title: 'Four', path: PATH_MANAGER.user.four },
          { title: 'Five', path: PATH_MANAGER.user.five },
          { title: 'Six', path: PATH_MANAGER.user.six },
        ],
      },
    ],
  },
];

export default navConfig;
