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
  dashboard: icon('ic_dashboard'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'general v4.2.0',
    items: [
      { title: 'One', path: PATH_MANAGER.one, icon: ICONS.dashboard },
      { title: 'Two', path: PATH_MANAGER.two, icon: ICONS.ecommerce },
      { title: 'Three', path: PATH_MANAGER.three, icon: ICONS.analytics },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'management',
    items: [
      {
        title: 'user',
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
