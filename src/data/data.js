import { Icon } from '@iconify/react';

export const backUrl = process.env.BACK_URL;

export const KAKAO_OBJ = {
  BACKGROUND: '#F9E000',
  FONT_COLOR: '#371C1D'
}
export const LOCALSTORAGE = {
  DNS_DATA: "dns_data",
  USER_DATA: "user_data",
  CUR_ZOOM: "cur_zoom",
  IS_FULL_SCREEN: "is_full_screen",
  NOT_SEARCH_OPTION: "not_search_option",
  USER_APP_MEMBERSHIP_OBJ: "user_app_membership_obj"
}
export const zBottomMenu = [
  { icon: 'mingcute:home-6-line', title: '홈', link: '/app/home/' },
  { icon: 'mdi:coupon-outline', title: '쿠폰', link: '/app/coupon/', option_column: 'is_use_coupon' },
  { icon: 'material-symbols:shopping-basket-outline', title: '주문', link: '/app/order/', option_column: 'is_use_order' },
  { icon: 'solar:gift-linear', title: '선물', link: '/app/gift/', option_column: 'is_use_gift' },
  { icon: 'noto:hamburger', title: '더보기', link: '/app/more/' },
]
export const zRedirectType = [
  { val: 0, name: '관리자', uri: '/manager/login' },
  { val: 1, name: '어플', uri: '/app/login' },
  { val: 2, name: '쇼핑몰', uri: '/shop' },
]
export const demoInfoByNum = {//데모 번호에 따라 블로그인지 일반인지 파악
  1: {
    category: 'shop'//일반 쇼핑몰
  },
  2: {
    category: 'blog'
  }
}