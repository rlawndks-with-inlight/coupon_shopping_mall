// routes
import { getCookie } from 'src/utils/react-cookie';
import { PATH_MANAGER } from '../../../data/manager-data';
// components
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from '../auth/useAuthContext';
import { useEffect, useState } from 'react';
import { apiManager } from 'src/utils/api';
import { mainObjSchemaList } from 'src/utils/format';

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
  //adjustments: icon('ic_cash'),
  setting: icon('ic_setting', 'setting'),
};


export const navConfig = () => {
  const { user } = useAuthContext();
  const { themeDnsData, themePropertyList, themeCategoryList, themePostCategoryList } = useSettingsContext();
  const [postCategoryList, setPostCategoryList] = useState([]);
  const [categoryGroupList, setCategoryGroupList] = useState([]);
  const [propertyGroupList, setPropertyGroupList] = useState([]);

  const [isSettingComplete, setIsSettingComplete] = useState(false);
  //dns_data와 user를 통해 계산하기

  useEffect(() => {
    if (themeDnsData?.id > 0) {
      getSidebarSetting();
    }
  }, [themeDnsData])
  const getSidebarSetting = async () => {
    let post_category_list = themePostCategoryList;
    for (var i = 0; i < post_category_list.length; i++) {
      post_category_list[i]['title'] = post_category_list[i]['post_category_title'];
      post_category_list[i]['path'] = `/manager/articles/${post_category_list[i]?.id}`;
      delete post_category_list[i]?.children;
    }
    let category_group_list = themeCategoryList;
    for (var i = 0; i < category_group_list.length; i++) {
      category_group_list[i]['title'] = category_group_list[i]['category_group_name'] + ' 관리';
      category_group_list[i]['path'] = `/manager/products/categories/${category_group_list[i]?.id}`;
      delete category_group_list[i]?.children;
    }
    let property_group_list = themePropertyList;
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
    if (window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 40) {
      return true;
    }
    return false
  }
  const isUseProductPropertyGroup = () => {
    if (window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 40) {
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
    ...(themeDnsData?.setting_obj?.is_use_seller > 0 ? [
      {
        items: [
          { title: '정산관리', path: PATH_MANAGER.adjustments, icon: ICONS.invoice },
        ]
      }
    ] : []),

    {
      items: [
        {
          title: '주문관리',
          path: PATH_MANAGER.orders.trx + '/all',//PATH_MANAGER.orders.root,
          icon: ICONS.ecommerce,
          children: [
            {
              title: '주문관리', path: PATH_MANAGER.orders.trx + '/all',
              children: [
                { title: '전체', path: PATH_MANAGER.orders.trx + '/all' },
                { title: '결제대기', path: PATH_MANAGER.orders.trx + '/0' },
                { title: '결제완료', path: PATH_MANAGER.orders.trx + '/5' },
                ...(themeDnsData?.id != 5 ?
                  [{ title: '입고완료', path: PATH_MANAGER.orders.trx + '/10' },
                  { title: '출고완료', path: PATH_MANAGER.orders.trx + '/15' }]
                  : []
                ),
                { title: '배송중', path: PATH_MANAGER.orders.trx + '/20' },
                { title: '배송완료', path: PATH_MANAGER.orders.trx + '/25' },
              ],
            },
            {
              title: '주문취소관리', path: PATH_MANAGER.orders.trxCancel + '/1',
              children: [
                { title: '취소요청', path: PATH_MANAGER.orders.trxCancel + '/1' },
                { title: '취소완료', path: PATH_MANAGER.orders.trxCancel + '/2' },
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
            { title: '상품관리', path: PATH_MANAGER.products.list },
            ...(isUseProductCategoryGroup() ? [{ title: '카테고리 그룹 관리', path: PATH_MANAGER.products.categoryGroups }] : []),
            ...(isManager() ? [...categoryGroupList] : []),
            ...(isUseProductPropertyGroup() ? [{ title: '특성 그룹 관리', path: PATH_MANAGER.products.propertyGroups }] : []),
            ...(isManager() ? [...propertyGroupList] : []),
            //{ title: '상품관리', path: PATH_MANAGER.products.list },
            //{ title: '상품문의', path: PATH_MANAGER.products.faq },
            ...(themeDnsData?.setting_obj?.is_use_consignment == 1 ? [
              { title: '위탁 변경 요청', path: PATH_MANAGER.products.consignments + '/list/0' },
              { title: '위탁 수거 요청', path: PATH_MANAGER.products.consignments + '/list/5' },
            ] : []),
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
            ...(themeDnsData?.is_use_seller > 0 && user.level >= 40 ? [{ title: '총판관리', path: PATH_MANAGER.users.distributors }] : []),
            ...(themeDnsData?.is_use_seller > 0 && user.level >= 20 ? [{ title: '영업자관리', path: PATH_MANAGER.users.agents }] : []),
            ...(themeDnsData?.is_use_seller > 0 && user.level >= 15 ? [{ title: '셀러관리', path: PATH_MANAGER.users.sellers }] : []),
            ...(isManager() ? [
              { title: '회원관리', path: PATH_MANAGER.users.list },
              //{ title: '포인트관리', path: PATH_MANAGER.users.points },
              //{ title: '찜관리', path: PATH_MANAGER.users.wishs },
            ] : []),
            ...(themeDnsData?.is_use_seller > 0 && user.level >= 10 ? [{ title: '회원가입번호관리', path: PATH_MANAGER.users.phoneRegistration }] : []),
            // { title: '매출관리', path: PATH_MANAGER.users.sales },
          ],
        },
      ],
    },
    ...(user?.level >= 10 ? [
      {
        items: [
          {
            title: '게시판관리',
            path: PATH_MANAGER.articles.categories,
            icon: ICONS.calendar,
            children: [
              ...(isUsePostCategory() ? [{ title: '게시판 카테고리 관리', path: PATH_MANAGER.articles.categories }] : []),
              ...(user?.level >= 10 && user?.level <= 20
                ? postCategoryList.filter((item) => item.id === 91)
                : postCategoryList)
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
                  ...mainObjSchemaList.filter(el => themeDnsData?.shop_obj?.map(itm => { return itm?.type })?.indexOf(el.type) >= 0).map((itm => {
                    return {
                      title: itm.label,
                      path: `${PATH_MANAGER.designs.main}/${itm.type}`
                    }
                  }))
                ],
              }] : []),
              ...((themeDnsData?.blog_demo_num > 0 && themeDnsData?.setting_obj?.is_use_blog_obj_style == 1) ? [{
                title: `${themeDnsData?.shop_demo_num > 0 && themeDnsData?.blog_demo_num > 0 ? '블로그 ' : ''}메인페이지관리`, path: PATH_MANAGER.designs.blogMain, children: [
                  { title: '전체', path: PATH_MANAGER.designs.blogMain + '/all' },
                  ...mainObjSchemaList.filter(el => themeDnsData?.blog_obj?.map(itm => { return itm?.type })?.indexOf(el.type) >= 0).map((itm => {
                    return {
                      title: itm.label,
                      path: `${PATH_MANAGER.designs.blogMain}/${itm.type}`
                    }
                  }))
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
            path: PATH_MANAGER.settings.default + `/${themeDnsData?.id}`,
            icon: ICONS.setting,
            children: [
              { title: '기본설정', path: PATH_MANAGER.settings.default + `/${themeDnsData?.id}` },
              ...(isDeveloper() ? [{ title: '브랜드설정', path: PATH_MANAGER.settings.brands }] : []),
              ...(isDeveloper() ? [{ title: '컬럼관리', path: PATH_MANAGER.settings.columns }] : []),
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
