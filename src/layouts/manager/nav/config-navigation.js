// routes
import { getCookie } from 'src/utils/react-cookie';
import { PATH_MANAGER } from '../../../data/manager-data';
// components
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from '../auth/useAuthContext';
import { useEffect, useState } from 'react';
import { apiManager } from 'src/utils/api';

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
  const [categoryGroupList, setCategoryGroupList] = useState([]);
  const [propertyGroupList, setPropertyGroupList] = useState([]);

  const [isSettingComplete, setIsSettingComplete] = useState(false);
  //dns_data와 user를 통해 계산하기

  useEffect(() => {
    getSidebarSetting();
  }, [])
  const getSidebarSetting = async () => {
    let post_category_list = await apiManager('post-categories', 'list', { page: 1, page_size: 100000 });
    post_category_list = post_category_list.content ?? [];
    for (var i = 0; i < post_category_list.length; i++) {
      post_category_list[i]['title'] = post_category_list[i]['post_category_title'];
      post_category_list[i]['path'] = `/manager/articles/${post_category_list[i]?.id}`;
      delete post_category_list[i]?.children;
    }
    let category_group_list = await apiManager('product-category-groups', 'list', { page: 1, page_size: 100000 });
    category_group_list = category_group_list.content ?? [];
    for (var i = 0; i < category_group_list.length; i++) {
      category_group_list[i]['title'] = category_group_list[i]['category_group_name'] + ' 관리';
      category_group_list[i]['path'] = `/manager/products/categories/${category_group_list[i]?.id}`;
      delete category_group_list[i]?.children;
    }
    let property_group_list = await apiManager('product-property-groups', 'list', { page: 1, page_size: 100000 });
    property_group_list = property_group_list.content ?? [];
    for (var i = 0; i < property_group_list.length; i++) {
      property_group_list[i]['title'] = property_group_list[i]['property_group_name'] + ' 관리';
      property_group_list[i]['path'] = `/manager/products/properties/${property_group_list[i]?.id}`;
      delete property_group_list[i]?.children;
    }
    setPostCategoryList(post_category_list);
    setCategoryGroupList(category_group_list);
    setPropertyGroupList(property_group_list);
    setIsSettingComplete(true);
  }
  const isUseProductCategoryGroup = () => {
    if (window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 50) {
      return true;
    }
    return false
  }
  const isUseProductPropertyGroup = () => {
    if (window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 50) {
      return true;
    }
    return false
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
  const isManager = () => {
    if (user?.level >= 40) {
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
                { title: '결제대기', path: PATH_MANAGER.orders.trx + '/0' },
                { title: '결제완료', path: PATH_MANAGER.orders.trx + '/5' },
                { title: '입고완료', path: PATH_MANAGER.orders.trx + '/10' },
                { title: '출고완료', path: PATH_MANAGER.orders.trx + '/15' },
                { title: '배송중', path: PATH_MANAGER.orders.trx + '/20' },
                { title: '배송완료', path: PATH_MANAGER.orders.trx + '/25' },
              ],
            },
            {
              title: '주문취소관리', path: PATH_MANAGER.orders.trxCancel,
              children: [
                { title: '취소요청', path: PATH_MANAGER.orders.trxCancel + '/1' },
                { title: '취소완료', path: PATH_MANAGER.orders.trxCancel + '/5' },
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
            ...(isUseProductCategoryGroup() ? [{ title: '카테고리 그룹 관리', path: PATH_MANAGER.products.categoryGroups }] : []),
            ...(isManager() ? [...categoryGroupList] : []),
            ...(isUseProductPropertyGroup() ? [{ title: '특성 그룹 관리', path: PATH_MANAGER.products.propertyGroups }] : []),
            ...(isManager() ? [...propertyGroupList] : []),
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
            ...(isManager() ? [
              { title: '회원관리', path: PATH_MANAGER.users.list },
              { title: '포인트관리', path: PATH_MANAGER.users.points },
              { title: '찜관리', path: PATH_MANAGER.users.wishs },
            ] : []),
            ...(themeDnsData?.is_use_seller > 0 ? [{ title: '셀러관리', path: PATH_MANAGER.users.sellers }] : []),
            // { title: '매출관리', path: PATH_MANAGER.users.sales },
          ],
        },
      ],
    },
    ...(isManager() ? [
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
    ] : []),
    ...(isManager() ? [
      {
        items: [
          {
            title: '디자인관리',
            path: PATH_MANAGER.designs.root,
            icon: ICONS.label,
            children: [
              // { title: '기본설정', path: PATH_MANAGER.designs.settings },
              ...(themeDnsData?.shop_demo_num > 0 ? [{
                title: `${themeDnsData?.shop_demo_num > 0 && themeDnsData?.blog_demo_num > 0 ? '쇼핑몰 ' : ''}메인페이지관리`, path: PATH_MANAGER.designs.main, children: [
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
              }] : []),
              ...(themeDnsData?.blog_demo_num > 0 ? [{
                title: `${themeDnsData?.shop_demo_num > 0 && themeDnsData?.blog_demo_num > 0 ? '블로그 ' : ''}메인페이지관리`, path: PATH_MANAGER.designs.blogMain, children: [
                  { title: '전체', path: PATH_MANAGER.designs.blogMain + '/all' },
                  { title: '배너슬라이드', path: PATH_MANAGER.designs.blogMain + '/banner' },
                  { title: '버튼형 배너슬라이드', path: PATH_MANAGER.designs.blogMain + '/button-banner' },//
                  { title: '상품슬라이드', path: PATH_MANAGER.designs.blogMain + '/items' },
                  { title: '카테고리탭별 상품리스트', path: PATH_MANAGER.designs.blogMain + '/items-with-categories' },//
                  { title: '에디터', path: PATH_MANAGER.designs.blogMain + '/editor' },
                  { title: '동영상 슬라이드', path: PATH_MANAGER.designs.blogMain + '/video-slide' },//
                  // { title: '게시판', path: PATH_MANAGER.designs.main + '/post' },//
                  // { title: '상품후기', path: PATH_MANAGER.designs.main + '/product-review' },//
                ],
              }] : []),
              ...((isDeveloper() && themeDnsData?.shop_demo_num > 0 && themeDnsData?.setting_obj?.is_use_item_card_style == 1) ? [{ title: `${themeDnsData?.shop_demo_num > 0 && themeDnsData?.blog_demo_num > 0 ? '쇼핑몰 ' : ''}상품카드관리`, path: PATH_MANAGER.designs.itemCard }] : []),
              ...((isDeveloper() && themeDnsData?.blog_demo_num > 0 && themeDnsData?.setting_obj?.is_use_item_card_style == 1) ? [{ title: `${themeDnsData?.shop_demo_num > 0 && themeDnsData?.blog_demo_num > 0 ? '블로그 ' : ''}상품카드관리`, path: PATH_MANAGER.designs.blogItemCard }] : []),
              { title: '팝업관리', path: PATH_MANAGER.designs.popup },
            ],
          },
        ],
      },
    ] : []),
    ...(isManager() ? [
      {
        items: [
          {
            title: '설정관리',
            path: PATH_MANAGER.settings.root,
            icon: ICONS.setting,
            children: [
              { title: '기본설정', path: PATH_MANAGER.settings.default + `/${themeDnsData?.id}` },
              ...(isDeveloper() ? [{ title: '브랜드설정', path: PATH_MANAGER.settings.brands }] : []),
              ...(isDeveloper() ? [{ title: '결제모듈관리', path: PATH_MANAGER.settings.paymentModules }] : []),
              // { title: '분양관리', path: PATH_MANAGER.settings.parcelOut },
            ],
          },
        ],
      },
    ] :
      []),
  ];
}
