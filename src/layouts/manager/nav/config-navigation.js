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
  setting: icon('ic_setting', 'setting'),
};


const navConfig = [
  {
    items: [
      { title: '대시보드', path: PATH_MANAGER.manager, icon: ICONS.dashboard },
    ],
  },
  {
    items: [
      {
        title: '주문관리',
        path: PATH_MANAGER.orders.root,
        icon: ICONS.ecommerce,
        children: [
          {
            title: '배송관리', path: PATH_MANAGER.orders.delivery,
            children: [
              { title: '전체', path: PATH_MANAGER.orders.list },
              { title: '배송준비중관리', path: PATH_MANAGER.orders.ready },
              { title: '배송대기관리', path: PATH_MANAGER.orders.wait },
              { title: '배송중관리', path: PATH_MANAGER.orders.deliveryIng },
              { title: '배송완료관리', path: PATH_MANAGER.orders.complete },
              { title: '취소관리', path: PATH_MANAGER.orders.cancel },
            ],
          },
          { title: '송장관리', path: PATH_MANAGER.orders.invoice},
          { title: '현금영수증관리', path: PATH_MANAGER.orders.cashBill},
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '상품관리',
        path: PATH_MANAGER.products.root,
        icon: ICONS.cart,
        children: [
          { title: '카테고리관리', path: PATH_MANAGER.products.categories },
          { title: '상품관리', path: PATH_MANAGER.products.list },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '회원관리',
        path: PATH_MANAGER.users.root,
        icon: ICONS.user,
        children: [
          { title: '회원관리', path: PATH_MANAGER.users.list },
          { title: '셀러관리', path: PATH_MANAGER.users.sellers },
          { title: '매출관리', path: PATH_MANAGER.users.sales },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '게시판관리',
        path: PATH_MANAGER.articles.root,
        icon: ICONS.calendar,
        children: [
          { title: '공지사항', path: PATH_MANAGER.articles.notices },
          { title: '자주묻는질문', path: PATH_MANAGER.articles.faqs },
          { title: '1:1문의', path: PATH_MANAGER.articles.oneToOne },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '디자인관리',
        path: PATH_MANAGER.designs.root,
        icon: ICONS.label,
        children: [
          { title: '기본설정', path: PATH_MANAGER.designs.settings },
          {
            title: '메인페이지관리', path: PATH_MANAGER.designs.main, children: [
              { title: '전체', path: PATH_MANAGER.designs.main + '/all' },
              { title: '배너슬라이드', path: PATH_MANAGER.designs.main + '/banner' },
              { title: '상품슬라이드', path: PATH_MANAGER.designs.main + '/items' },
              { title: '에디터', path: PATH_MANAGER.designs.main + '/editor' },
            ],
          },
          { title: '상품카드관리', path: PATH_MANAGER.designs.itemCard },
          { title: '팝업관리', path: PATH_MANAGER.designs.popup },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '설정관리',
        path: PATH_MANAGER.settings.root,
        icon: ICONS.setting,
        children: [
          { title: '기본설정', path: PATH_MANAGER.settings.default },
          { title: '분양관리', path: PATH_MANAGER.settings.parcelOut },
        ],
      },
    ],
  },
  {
    items: [
      {
        title: '결제관리',
        path: PATH_MANAGER.pays.root,
        icon: ICONS.invoice,
        children: [
          { title: '결제관리', path: PATH_MANAGER.pays.list },
        ],
      },
    ],
  },
];

export default navConfig;
