// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const defaultSettings = {
  themeMode: 'light',
  themeDirection: 'ltr',
  themeContrast: 'default',
  themeLayout: 'vertical',
  themeColorPresets: 'default',
  themeStretch: true,
  themeDnsData: {},// dns정보
  themeCartData: [],// 장바구니
  themeWishData: [],// 찜목록
  themeCurrentPageObj: {}, // 현재페이지 불러올 내용
  themeAuth: {},
  themeCategoryList: undefined, // 상품 카테고리
  themePropertyList: undefined, // 상품 특성
  themePopupList: [], // 팝업
  // 상품상세 혜택 안내. 가맹점이 만드는 것이 아니라 본사가 만든 것을 그대로 받는다
  // (탭은 benefit_notice_tabs 로 따로 내려와 notice_id 로 묶는다)
  themeBenefitNotices: [],
  themeBenefitNoticeTabs: [],
  themeNoneTodayPopupList: {}, // 팝업오늘안볼리스트
  themePostCategoryList: [], // 게시물 카테고리
  themeSellerList: [], // 셀러리스트
  themeProductList: [], // 메인페이지에 사용할 상품 리스트
};
