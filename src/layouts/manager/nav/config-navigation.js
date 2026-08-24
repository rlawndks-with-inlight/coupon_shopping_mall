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
import { isShopgoBrand, isShopgoMerchant } from 'src/utils/is-shopgo';
import { HOME_TEXT_SCHEMA } from 'src/data/home-texts';
import { 본사화면 } from 'src/utils/manager-visibility';

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
    // ⚠ 아래 세 배열은 SettingsContext 가 전 앱에 내보내는 '공유 상태'다.
    //    예전엔 참조만 받아 title/path 를 덧쓰고 children 을 delete 해서 원본을 훼손했다.
    //    그러면 같은 SPA 세션에서 고객 게시판·카테고리 화면으로 이동했을 때
    //    children 이 사라진 트리를 그리게 된다(새로고침하면 localStorage 로 복구돼
    //    재현이 들쭉날쭉했다). 사본을 만들어 쓴다.
    let post_category_list = (themePostCategoryList ?? []).map((item) => ({ ...item }));
    for (var i = 0; i < post_category_list.length; i++) {
      post_category_list[i]['title'] = post_category_list[i]['post_category_title'];
      post_category_list[i]['path'] = `/manager/articles/${post_category_list[i]?.id}`;
      delete post_category_list[i]?.children;
    }
    let category_group_list = (themeCategoryList ?? []).map((item) => ({ ...item }));
    for (var i = 0; i < category_group_list.length; i++) {
      category_group_list[i]['title'] = category_group_list[i]['category_group_name'] + ' 관리';
      category_group_list[i]['path'] = `/manager/products/categories/${category_group_list[i]?.id}`;
      delete category_group_list[i]?.children;
    }
    let property_group_list = (themePropertyList ?? []).map((item) => ({ ...item }));
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
  // 단계 이행: 마이그레이션(단일트리) 브랜드 감지 — shop.controller 가 합성 그룹(id=0) 하나로 응답.
  //   마이그레이션된 브랜드에선 '카테고리 그룹 관리'를 숨기고 '카테고리 관리' 하나만 노출.
  const isCategoryMigrated = (themeCategoryList?.length === 1) && (Number(themeCategoryList[0]?.id) === 0);
  const isUseProductCategoryGroup = () => {
    if (isCategoryMigrated) return false;
    if (window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL || user?.level >= 40) {
      return true;
    }
    return false
  }
  // 특성 그룹 관리 — 가맹점에게는 감춘다.
  //
  // 특성(characters)은 '보여주기 전용 상품정보'로 정리됐다. 고르는 것도, 값이 가격에
  // 붙는 것도 아니다. 그런데 이름이 '특성'이라 가맹점은 옵션인 줄 알고 들어와서
  // 키·값을 뒤집어 넣거나 특성값에 가격을 적었다(넣은 6건 중 5건이 오용이었다).
  // 잘못 넣으면 고객 화면에 그대로 나가므로, 아예 안 보이게 하는 편이 낫다.
  // 본사(level 50)와 본사 도메인에서는 그대로 쓴다 — 기존 데이터를 손볼 곳이 필요하다.
  // 판정은 utils/manager-visibility.js 한 곳에 둔다 — 메인페이지관리의 섹션 목록도
  // 같은 기준을 써야 한다(메뉴에서만 감추면 거기서는 그대로 골라진다).
  const isUseProductPropertyGroup = () => 본사화면(user);
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
  // 현재 로드된 브랜드가 마스터(메인)인지로 판단. 가맹점 신청 관리 등 마스터 전용 메뉴용.
  // 터널 환경에선 모든 데모가 같은 host라, host가 아니라 브랜드의 is_main_dns로 구분.
  const isMasterSite = () => {
    return themeDnsData?.is_main_dns == 1;
  }
  // 홈을 shop_obj/blog_obj 섹션 배열로 그리는 데모(=메인페이지관리로 편집 가능한 데모).
  // shop 4·5·6·9는 자체 파일이 HomeDemo1을 감싸는 구조라 shop_obj를 그대로 쓴다(= 섹션빌더).
  // shop 7·8은 자체 고정 레이아웃, shop 10은 빈 컴포넌트, blog 4~9는 고정 레이아웃 → 편집 대상 없음.
  // (구 조건은 blog가 is_use_blog_obj_style==1을 요구했는데 브랜드 생성 시 항상 '0'이라 메뉴가 영영 안 떴음)
  const SECTION_BUILDER_SHOP_DEMOS = [1, 2, 3, 4, 5, 6, 9];
  const SECTION_BUILDER_BLOG_DEMOS = [1, 2, 3];
  const isShopSectionBuilder = SECTION_BUILDER_SHOP_DEMOS.includes(Number(themeDnsData?.shop_demo_num))
    || themeDnsData?.setting_obj?.is_use_shop_obj_style == 1;
  const isBlogSectionBuilder = SECTION_BUILDER_BLOG_DEMOS.includes(Number(themeDnsData?.blog_demo_num))
    || themeDnsData?.setting_obj?.is_use_blog_obj_style == 1;
  const isManager = () => {
    if (user?.level >= 40) {
      return true;
    }
    return false
  }
  if (!isSettingComplete) {
    return []
  }
  // 마스터(shopgo) 전용 메뉴: 가맹점 관리에 집중.
  // 상품/회원/주문/디자인/게시판/설정 등 판매용 메뉴는 마스터에서 숨긴다.
  if (isMasterSite()) {
    return [
      {
        items: [
          { title: '대시보드', path: PATH_MANAGER.dashboards, icon: ICONS.dashboard },
        ],
      },
      {
        items: [
          {
            title: '가맹점 관리',
            path: PATH_MANAGER.merchantApplications,
            icon: ICONS.user,
            children: [
              { title: '가맹점 신청 관리', path: PATH_MANAGER.merchantApplications },
              { title: '가맹점 현황', path: PATH_MANAGER.merchants },
            ],
          },
        ],
      },
      // 전 가맹점 공통 고지: 상품상세 '혜택 안내'.
      //
      // ⚠ 이 메뉴는 반드시 이 블록(마스터 전용 목록) 안에 있어야 한다.
      //   마스터는 여기서 return 으로 빠져나가므로, 아래쪽 '디자인관리' 하위에 넣으면
      //   조건이 아무리 맞아도 본사 화면에는 영영 안 뜬다(실제로 그렇게 넣었다가 못 찾았다).
      //
      // 레벨 조건을 걸지 않는다. 본사 관리자로 들어왔으면 그냥 보여야 한다 —
      // 조건을 하나 더 걸면 '메뉴가 왜 안 보이지'로 또 헤매게 된다.
      // 권한은 화면(본사 아니면 경고)과 API(레벨50 미만 403)에서 이미 막는다.
      {
        items: [
          { title: '혜택 안내(전 가맹점)', path: PATH_MANAGER.designs.benefitNotice, icon: ICONS.label },
          // '입력항목 서식'(마스터가 만드는 템플릿)은 메뉴에서 내렸다.
          //
          // 왜: 손님 입력항목(행사날짜 등)은 가맹점이 **상품마다** 직접 건다.
          // 템플릿은 '같은 업종 가맹점이 여럿일 때 한 번 만들어 돌려쓰는' 물건인데,
          // 지금 예약형 가맹점은 첫돌공방 하나뿐이라 돌려쓸 상대가 없다.
          // 빈 화면을 메뉴에 두면 '이건 뭐지'가 매번 반복된다.
          //
          // ⚠ 지운 게 아니다. 페이지·테이블·API(/order-forms/templates)는 그대로 살아 있고
          //   상품등록의 '서식 불러오기' 도 계속 동작한다(템플릿이 있으면 버튼이 뜬다).
          //   돌잔치·출장 업체가 둘 이상 되면 **아래 한 줄의 주석만 풀면** 된다.
          // { title: '입력항목 서식', path: PATH_MANAGER.designs.orderForm, icon: ICONS.file },
        ],
      },
      // 유저관리: 최상위(개발사, 레벨50)만 노출 — shopgo 운영자 계정 추가/관리용
      ...(isDeveloper() ? [
        {
          items: [
            { title: '유저관리', path: PATH_MANAGER.users.list, icon: ICONS.user },
          ],
        },
      ] : []),
    ];
  }
  return [
    {
      items: [
        { title: '대시보드', path: PATH_MANAGER.dashboards, icon: ICONS.dashboard },
      ],
    },
    ...(isShopgoBrand(themeDnsData) ? [{
      items: [
        { title: '이용가이드', path: '/manager/guide', icon: ICONS.file },
      ],
    }] : []),
    ...(isMasterSite() ? [
      {
        items: [
          { title: '가맹점 신청 관리', path: PATH_MANAGER.merchantApplications, icon: ICONS.user },
        ],
      },
    ] : []),
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
                  [
                    // shopgo 하위 가맹점은 창고 입고 단계를 쓰지 않아 '입고완료' 메뉴를 숨긴다.
                    ...(isShopgoMerchant(themeDnsData) ? [] : [{ title: '입고완료', path: PATH_MANAGER.orders.trx + '/10' }]),
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
            // 개별 특성 그룹 메뉴('원산지 관리' 같은 것)도 같은 조건으로 묶는다.
            // 지난번에 '특성 그룹 관리' 만 50 으로 올렸더니, 정작 그룹 이름들은 40 에게 그대로 보였다.
            // 들어갈 입구를 하나만 막으면 옆문이 열려 있는 셈이다.
            ...(isUseProductPropertyGroup() ? [...propertyGroupList] : []),
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
              // 포인트관리 메뉴가 주석이라, 고객은 주문서에서 포인트를 쓸 수 있는데
              // 가맹점은 포인트를 지급·조정할 방법이 아예 없었다(페이지 자체는 정상 동작한다 —
              // 주소창에 직접 넣으면 목록·지급 모두 된다). 메뉴만 되살린다.
              // shopgo(본사·산하)는 기존 포인트관리 메뉴 미노출 — 새 포인트 정책으로 대체 예정. 타 클라이언트는 유지.
              ...(!isShopgoBrand(themeDnsData) ? [{ title: '포인트관리', path: PATH_MANAGER.users.points }] : []),
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
                : postCategoryList),
              // 팝업관리는 원래 디자인관리 아래 있었다. 가맹점 의견으로 여기로 옮겼다 —
              // 공지·문의처럼 '손님에게 알리는 것'이라 한자리에 모이는 편이 찾기 쉽다.
              //
              // ⚠ 주소는 /manager/designs/popup 그대로 둔다. 파일을 articles 아래로 옮기면
              //   가맹점 북마크와 매니저 가이드의 링크가 통째로 깨진다. 메뉴 위치만 옮긴 것이다.
              //
              // 권한도 이 그룹(레벨 10 이상)에 맞춘다. 예전 디자인관리는 40 이상이었으므로
              // 레벨 10~20 계정에도 새로 보이게 된다 — 의도한 변경이다.
              { title: '팝업관리', path: PATH_MANAGER.designs.popup },
            ],
          },
        ],
      },
    ] : []),
    // 디자인관리 — 하위 항목이 하나도 없으면 그룹 자체를 내린다.
    //
    // 여기 하위는 전부 조건부다(데모 번호·레벨50·설정값). 팝업관리를 게시판관리로 옮기면서
    // '모든 조건이 안 맞는 조합'에서는 하위가 통째로 빌 수 있게 됐다.
    // 빈 채로 두면 눌렀을 때 /manager/designs 로 갔다가 메인페이지관리로 튕긴다 —
    // 그 몰에는 메인페이지관리가 없는데도. 그래서 비면 아예 안 그린다.
    ...((() => {
      const 디자인_하위 = [
              // { title: '기본설정', path: PATH_MANAGER.designs.settings },
              ...(themeDnsData?.shop_demo_num > 0 && isShopSectionBuilder ? [{
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
              ...((themeDnsData?.blog_demo_num > 0 && isBlogSectionBuilder) ? [{
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
              ...([4, 5, 6, 7, 8, 9].includes(Number(themeDnsData?.blog_demo_num)) ? [{ title: '대표 상품', path: '/manager/designs/featured' }] : []),
              ...(Object.keys(HOME_TEXT_SCHEMA).map(Number).includes(Number(themeDnsData?.blog_demo_num)) ? [{ title: '홈 문구', path: '/manager/designs/home-texts' }] : []),
              // ※ '팝업관리'는 게시판관리 아래로 옮겼다(가맹점 의견). 주소는 그대로다.
              // ※ '혜택 안내(전 가맹점)'는 여기가 아니라 위쪽 마스터 전용 목록에 있다.
              //   마스터는 이 아래로 내려오지 않고, 가맹점에는 보이면 안 되는 메뉴다.
      ];
      if (!isManager() || 디자인_하위.length === 0) return [];
      return [{
        items: [
          {
            title: '디자인관리',
            path: PATH_MANAGER.designs.root,
            icon: ICONS.label,
            children: 디자인_하위,
          },
        ],
      }];
    })()),
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
