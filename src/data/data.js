import { useSettingsContext } from 'src/components/settings';

export const logoSrc = () => {
  const { themeDnsData, themeMode } = useSettingsContext();
  let default_img = 'https://backend.comagain.kr/storage/images/logos/IFFUcyTPtgF887r0RPOGXZyLLPvp016Je17MENFT.svg';

  return themeDnsData[`${themeMode == 'dark' ? 'dark_' : ''}logo_img`]
};
export const KAKAO_OBJ = {
  BACKGROUND: '#F9E000',
  FONT_COLOR: '#371C1D'
}

export const SHOP_DEMO_DATA = [
  { value: 1, title: '데모 1 (일반 쇼핑몰에 적합)' },
  { value: 2, title: '데모 2' },
  { value: 3, title: '데모 3' },
  { value: 4, title: '데모 4 (위탁 쇼핑몰에 적합)' },
  { value: 5, title: '데모 5' },
  { value: 6, title: '데모 6' },
  { value: 7, title: '데모 7' },
];
export const BLOG_DEMO_DATA = [
  { value: 1, title: '데모 1' },
  { value: 2, title: '데모 2' },
  { value: 3, title: '데모 3' },
];