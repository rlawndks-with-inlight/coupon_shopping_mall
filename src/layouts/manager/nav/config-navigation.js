// routes
import { PATH_MANAGER } from '../../../data/manager-data';
// components
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name, path) => (
  <SvgColor src={`/assets/icons/${path ?? "navbar"}/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  blog: icon('ic_blog'),
  cart: icon('ic_cart'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  setting: icon('ic_setting','setting'),
};


const navConfig = [
  {
    items: [
      { title: '대시보드', path: PATH_MANAGER.dashboard, icon: ICONS.dashboard },
    ],
  },
  {
    items: [
      {
        title: '주문관리',
        path: PATH_MANAGER.order.root,
        icon: ICONS.ecommerce,
        children: [
          { title: '주문내역', path: PATH_MANAGER.order.root },
          { title: '배송준비중관리', path: PATH_MANAGER.order.root },
          { title: '배송대기관리', path: PATH_MANAGER.order.root },
          { title: '배송중관리', path: PATH_MANAGER.order.root },
          { title: '배송완료관리', path: PATH_MANAGER.order.root },
          { title: '취소관리', path: PATH_MANAGER.order.root },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '상품관리',
        path: PATH_MANAGER.product.root,
        icon: ICONS.cart,
        children: [
          { title: '카테고리관리', path: PATH_MANAGER.product.root },
          { title: '상품관리', path: PATH_MANAGER.product.root },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '회원관리',
        path: PATH_MANAGER.user.root,
        icon: ICONS.user,
        children: [
          { title: '회원관리', path: PATH_MANAGER.user.root },
          { title: '셀러관리', path: PATH_MANAGER.user.seller },
          { title: '매출관리', path: PATH_MANAGER.user.sales },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '게시판관리',
        path: PATH_MANAGER.article.root,
        icon: ICONS.calendar,
        children: [
          { title: '공지사항', path: PATH_MANAGER.article.root },
          { title: '자주묻는질문', path: PATH_MANAGER.article.root },
          { title: '1:1문의', path: PATH_MANAGER.article.root },
          { title: '관리자켈린더', path: PATH_MANAGER.article.root },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '디자인관리',
        path: PATH_MANAGER.design.root,
        icon: ICONS.label,
        children: [
          { title: '메인페이지관리', path: PATH_MANAGER.design.root },
          { title: '셀러페이지관리', path: PATH_MANAGER.design.root },
          { title: '팝업관리', path: PATH_MANAGER.design.root },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '설정관리',
        path: PATH_MANAGER.setting.root,
        icon: ICONS.setting,
        children: [
          { title: '분양관리', path: PATH_MANAGER.setting.root },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '결제관리',
        path: PATH_MANAGER.pay.root,
        icon: ICONS.invoice,
        children: [
          { title: '결제관리', path: PATH_MANAGER.pay.root },
        ],
      },
    ],
  },
];

export default navConfig;
