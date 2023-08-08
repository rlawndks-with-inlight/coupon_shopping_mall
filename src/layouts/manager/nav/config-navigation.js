// routes
import { getCookie } from 'src/utils/react-cookie';
import { PATH_MANAGER } from '../../../data/manager-data';
// components
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from '../auth/useAuthContext';
import { useEffect, useState } from 'react';
import { getPostCategoriesByManager } from 'src/utils/api-manager';

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


export const navConfig = () => {
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const [postCategoryList, setPostCategoryList] = useState([]);

  const [isSettingComplete, setIsSettingComplete] = useState(false);
  //dns_data와 user를 통해 계산하기

  useEffect(() => {
    getSidebarSetting();
  }, [])
  const getSidebarSetting = async () => {
    let category_list = await getPostCategoriesByManager({ page: 1, page_size: 100000 });
    category_list = category_list.content ?? [];
    for (var i = 0; i < category_list.length; i++) {
      category_list[i]['title'] = category_list[i]['post_category_title'];
      category_list[i]['path'] = `/manager/articles/${category_list[i]?.id}`;
      delete category_list[i]?.children;
    }
    setPostCategoryList(category_list);
    setIsSettingComplete(true);
  }
  const isUsePostCategory = () => {
    if (window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 50) {
      return true;
    }
    return false
  }
  const isUseMainCustom = () => {
    if (window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 50) {
      return true;
    }
    return false
  }
  const isUseItemCardCustom = () => {
    if (window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 50) {
      return true;
    }
    return false
  }
  const isDeveloper = () => {
    if (user?.level >= 50) {
      return true;
    }
    return false
  }
  if (!isSettingComplete) {
    return []
  }
  return [
    {
      items: [
        { title: '대시보드', path: PATH_MANAGER.dashboards, icon: ICONS.dashboard },
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
              title: '주문관리', path: PATH_MANAGER.orders.trx,
              children: [
                { title: '전체', path: PATH_MANAGER.orders.trx + '/all' },
                { title: '결제완료', path: PATH_MANAGER.orders.trx + '/0' },
                { title: '입고완료', path: PATH_MANAGER.orders.trx + '/5' },
                { title: '출고완료', path: PATH_MANAGER.orders.trx + '/10' },
                { title: '배송중', path: PATH_MANAGER.orders.trx + '/15' },
                { title: '배송완료', path: PATH_MANAGER.orders.trx + '/20' },
              ],
            },
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
            ...(themeDnsData?.blog_demo_num > 0 ? [{ title: '셀러관리', path: PATH_MANAGER.users.sellers }] : []),
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
            ...(isUsePostCategory() ? [{ title: '게시판 카테고리 관리', path: PATH_MANAGER.articles.categories }] : []),
            ...postCategoryList
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
            // { title: '기본설정', path: PATH_MANAGER.designs.settings },
            {
              title: '메인페이지관리', path: PATH_MANAGER.designs.main, children: [
                { title: '전체', path: PATH_MANAGER.designs.main + '/all' },
                { title: '배너슬라이드', path: PATH_MANAGER.designs.main + '/banner' },
                { title: '버튼형 배너슬라이드', path: PATH_MANAGER.designs.main + '/button-banner' },//
                { title: '상품슬라이드', path: PATH_MANAGER.designs.main + '/items' },
                { title: '카테고리탭별 상품리스트', path: PATH_MANAGER.designs.main + '/items-with-categories' },//
                { title: '에디터', path: PATH_MANAGER.designs.main + '/editor' },
                { title: '동영상 슬라이드', path: PATH_MANAGER.designs.main + '/video-slide' },//
                // { title: '게시판', path: PATH_MANAGER.designs.main + '/post' },//
                // { title: '상품후기', path: PATH_MANAGER.designs.main + '/product-review' },//
              ],
            },
            ...(isUsePostCategory() ? [{ title: '상품카드관리', path: PATH_MANAGER.designs.itemCard }] : []),
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
            ...(isDeveloper() ? [{ title: '브랜드설정', path: PATH_MANAGER.settings.brands }] : []),
            // { title: '분양관리', path: PATH_MANAGER.settings.parcelOut },
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
}
