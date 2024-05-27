import PropTypes from 'prop-types';
import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';
//
import { defaultSettings } from './config-setting';
import { defaultPreset, getPresets, presetsOption } from './presets';
import { useTheme } from '@emotion/react';
import { deleteLocalStorage, getLocalStorage, setLocalStorage } from 'src/utils/local-storage';
import { apiShop } from 'src/utils/api';
import axios from 'axios';
import localStorageAvailable from 'src/utils/localStorageAvailable';
import { useRouter } from 'next/router';
import { apiManager } from 'src/utils/api';
// ----------------------------------------------------------------------

const initialState = {
  ...defaultSettings,
  settingPlatform: () => { },
  // Mode
  onToggleMode: () => { },
  onChangeMode: () => { },
  // Direction
  onToggleDirection: () => { },
  onChangeDirection: () => { },
  onChangeDirectionByLang: () => { },
  // Layout
  onToggleLayout: () => { },
  onChangeLayout: () => { },
  // Contrast
  onToggleContrast: () => { },
  onChangeContrast: () => { },
  // Color
  onChangeColorPresets: () => { },
  presetsColor: defaultPreset,
  presetsOption: [],
  // Stretch
  onToggleStretch: () => { },
  // Reset
  onResetSetting: () => { },
  // dns data
  onChangeDnsData: () => { },
  // cart data
  onChangeCartData: () => { },
  // wish data
  onChangeWishData: () => { },
  // current page
  onChangeCurrentPageObj: () => { },
  //auth
  onChangeAuth: () => { },
  //category-list
  onChangeCategoryList: () => { },
  onChangePropertyList: () => { },
  onChangePostCategoryList: () => { },
  onChangeSellerList: () => { },
  onChangePopupList: () => { },
  onChangeNoneTodayPopupList: () => { },
};

// ----------------------------------------------------------------------

export const SettingsContext = createContext(initialState);

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);

  if (!context) throw new Error('useSettingsContext must be use inside SettingsProvider');

  return context;
};

// ----------------------------------------------------------------------

SettingsProvider.propTypes = {
  children: PropTypes.node,
};

export function SettingsProvider({ children }) {

  const router = useRouter();

  const [themeMode, setThemeMode] = useState(defaultSettings.themeMode);
  const [themeLayout, setThemeLayout] = useState(defaultSettings.themeLayout);
  const [themeStretch, setThemeStretch] = useState(defaultSettings.themeStretch);
  const [themeContrast, setThemeContrast] = useState(defaultSettings.themeContrast);
  const [themeDirection, setThemeDirection] = useState(defaultSettings.themeDirection);
  const [themeColorPresets, setThemeColorPresets] = useState(defaultSettings.themeColorPresets);
  const [themeDnsData, setThemeDnsData] = useState(defaultSettings.themeDnsData);
  const [themeCartData, setThemeCartData] = useState(defaultSettings.themeCartData);
  const [themeWishData, setThemeWishData] = useState(defaultSettings.themeWishData);
  const [themeCurrentPageObj, setThemeCurrentPageObj] = useState(defaultSettings.themeCurrentPageObj);
  const [themeAuth, setThemeAuth] = useState(defaultSettings.themeAuth);
  const [themeCategoryList, setThemeCategoryList] = useState(defaultSettings.themeCategoryList);
  const [themePropertyList, setThemePropertyList] = useState(defaultSettings.themePropertyList);
  const [themePopupList, setThemePopupList] = useState(defaultSettings.themePopupList);
  const [themeNoneTodayPopupList, setThemeNoneTodayPopupList] = useState(defaultSettings.themeNoneTodayPopupList);
  const [themePostCategoryList, setThemePostCategoryList] = useState(defaultSettings.themePostCategoryList);
  const [themeSellerList, setThemeSellerList] = useState(defaultSettings.themeSellerList);

  const storageAvailable = localStorageAvailable();

  const langStorage = storageAvailable ? localStorage.getItem('i18nextLng') : '';

  const isArabic = langStorage === 'ar';

  useEffect(() => {
    if (isArabic) {
      onChangeDirectionByLang('ar');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isArabic]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mode = getCookie('themeMode') || defaultSettings.themeMode;
      const layout = getCookie('themeLayout') || defaultSettings.themeLayout;
      const stretch = getCookie('themeStretch') || defaultSettings.themeStretch;
      const contrast = getCookie('themeContrast') || defaultSettings.themeContrast;
      const direction = getCookie('themeDirection') || defaultSettings.themeDirection;
      const colorPresets = getCookie('themeColorPresets') || defaultSettings.themeColorPresets;
      const currentPageObj = getCookie('themeCurrentPageObj') || defaultSettings.themeCurrentPageObj;
      const cartData = JSON.parse(getLocalStorage('themeCartData') ?? '[]') || defaultSettings.themeCartData;
      const wishData = JSON.parse(getLocalStorage('themeWishData') ?? '[]') || defaultSettings.themeWishData;
      const noneTodayPopupData = JSON.parse(getLocalStorage('themeNoneTodayPopupList') ?? '{}') || defaultSettings.themeNoneTodayPopupList;
      //const auth = getCookie('themeAuth') || defaultSettings.themeAuth;
      //const categoryList = getCookie('themeCategoryList') || defaultSettings.themeCategoryList;
      setThemeMode(mode);
      setThemeLayout(layout);
      setThemeStretch(stretch);
      setThemeContrast(contrast);
      setThemeDirection(direction);
      setThemeColorPresets(colorPresets);
      setThemeCurrentPageObj(currentPageObj);
      setThemeCartData(cartData);
      setThemeWishData(wishData);
      setThemeNoneTodayPopupList(noneTodayPopupData);
      settingPlatform();
    }
  }, []);
  const settingPlatform = async () => {
    try {
      const { data: response } = await axios.get(`/api/domain?dns=${process.env.IS_TEST == 1 ? 'localhost' : window.location.host.split(':')[0]}`);
      let dns_data = response?.data;
      console.log(response)
      dns_data['blog_demo_num'] = dns_data?.setting_obj?.blog_demo_num || process.env.TEST_BLOG_DEMO || 0;
      dns_data['shop_demo_num'] = dns_data?.setting_obj?.shop_demo_num || process.env.TEST_SHOP_DEMO || 0;
      dns_data['is_use_seller'] = dns_data?.setting_obj?.is_use_seller || process.env?.IS_USE_SELLER || 0;
      let root_id = 1;
      dns_data['root_id'] = root_id;
      let path_split_list = router.asPath.split('/');
      let data = await apiShop('', 'get', {
        is_manager: (path_split_list[1] == 'manager' ? 1 : 0)
      });
      dns_data['shop_obj'] = data?.shop_obj ?? [];
      dns_data['blog_obj'] = data?.blog_obj ?? [];
      dns_data['payment_modules'] = data?.payment_modules ?? [];
      dns_data['products'] = data?.products ?? [];
      dns_data['basic_info'] = data?.basic_info ?? "";

      
      onChangeWishData(data?.user_wishs ?? []);
      onChangeCategoryList(data?.product_category_groups ?? []);
      onChangePropertyList(data?.product_property_groups ?? []);
      onChangePopupList(data?.popups ?? []);
      onChangePostCategoryList(data?.post_categories ?? []);
      onChangeSellerList(data?.sellers ?? []);
      onChangeDnsData(dns_data);
    } catch (err) {
      console.log(err)
    }
  }
  // Mode
  const onToggleMode = useCallback(() => {
    const value = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(value);
    setCookie('themeMode', value);
  }, [themeMode]);

  const onChangeMode = useCallback((event) => {
    const { value } = event.target;
    setThemeMode(value);
    setCookie('themeMode', value);
  }, []);

  // Direction
  const onToggleDirection = useCallback(() => {
    const value = themeDirection === 'rtl' ? 'ltr' : 'rtl';
    setThemeDirection(value);
    setCookie('themeDirection', value);
  }, [themeDirection]);

  const onChangeDirection = useCallback((event) => {
    const { value } = event.target;
    setThemeDirection(value);
    setCookie('themeDirection', value);
  }, []);

  const onChangeDirectionByLang = useCallback((lang) => {
    const value = lang === 'ar' ? 'rtl' : 'ltr';
    setThemeDirection(value);
    setCookie('themeDirection', value);
  }, []);

  // Layout
  const onToggleLayout = useCallback(() => {
    const value = themeLayout === 'vertical' ? 'mini' : 'vertical';
    setThemeLayout(value);
    setCookie('themeLayout', value);
  }, [themeLayout]);

  const onChangeLayout = useCallback((event) => {
    const { value } = event.target;
    setThemeLayout(value);
    setCookie('themeLayout', value);
  }, []);

  // Contrast
  const onToggleContrast = useCallback(() => {
    const value = themeContrast === 'default' ? 'bold' : 'default';
    setThemeContrast(value);
    setCookie('themeContrast', value);
  }, [themeContrast]);

  const onChangeContrast = useCallback((event) => {
    const { value } = event.target;
    setThemeContrast(value);
    setCookie('themeContrast', value);
  }, []);

  // Color
  const onChangeColorPresets = useCallback((event) => {
    const { value } = event.target;
    setThemeColorPresets(value);
    setCookie('themeColorPresets', value);
  }, []);

  // Stretch
  const onToggleStretch = useCallback(() => {
    const value = !themeStretch;
    setThemeStretch(value);
    setCookie('themeStretch', JSON.stringify(value));
  }, [themeStretch]);
  // dns data
  const onChangeDnsData = useCallback((dns_data) => {
    setThemeDnsData(dns_data);
    setLocalStorage('themeDnsData', JSON.stringify(dns_data));
  }, [])
  // cart data
  const onChangeCartData = useCallback((cart_data) => {
    setThemeCartData(cart_data);
    setLocalStorage('themeCartData', JSON.stringify(cart_data));
  }, [])
  // wish data
  const onChangeWishData = useCallback(async (wish_data) => {

    setThemeWishData(wish_data);

    setLocalStorage('themeWishData', JSON.stringify(wish_data));
  }, [])
  // current page
  const onChangeCurrentPageObj = useCallback((data) => {
    setThemeCurrentPageObj(data);
    setCookie('themeCurrentPageObj', JSON.stringify(data));
  }, [])
  // auth
  const onChangeAuth = useCallback((data) => {
    setThemeAuth(data);
    setCookie('themeAuth', JSON.stringify(data));
  }, [])
  // categoryList
  const onChangeCategoryList = useCallback((data) => {
    setThemeCategoryList(data);
    setLocalStorage('themeCategoryList', JSON.stringify(data));
  }, [])
  // propertyList
  const onChangePropertyList = useCallback((data) => {
    setThemePropertyList(data);
    setLocalStorage('themePropertyList', JSON.stringify(data));
  }, [])
  // popupList
  const onChangePopupList = useCallback((data) => {
    setThemePopupList(data);
    setLocalStorage('themePopupList', JSON.stringify(data));
  }, [])
  // themeNoneTodayPopupList
  const onChangeNoneTodayPopupList = useCallback((data) => {
    setThemeNoneTodayPopupList(data);
    setLocalStorage('themeNoneTodayPopupList', JSON.stringify(data));
  }, [])
  // postcategoryList
  const onChangePostCategoryList = useCallback((data) => {
    setThemePostCategoryList(data);
    setLocalStorage('themePostCategoryList', JSON.stringify(data));
  }, [])
  // sellerList
  const onChangeSellerList = useCallback((data) => {
    setThemeSellerList(data);
    setLocalStorage('themeSellerList', JSON.stringify(data));
  }, [])
  // Reset
  const onResetSetting = useCallback(() => {
    setThemeMode(defaultSettings.themeMode);
    setThemeLayout(defaultSettings.themeLayout);
    setThemeStretch(defaultSettings.themeStretch);
    setThemeContrast(defaultSettings.themeContrast);
    setThemeDirection(defaultSettings.themeDirection);
    setThemeColorPresets(defaultSettings.themeColorPresets);
    setThemeDnsData(defaultSettings.themeDnsData);
    setThemeCartData(defaultSettings.themeCartData);
    setThemeWishData(defaultSettings.themeWishData);
    setThemeCurrentPageObj(defaultSettings.themeCurrentPageObj);
    setThemeAuth(defaultSettings.themeAuth);
    setThemeCategoryList(defaultSettings.themeCategoryList);
    setThemePropertyList(defaultSettings.themePropertyList);
    setThemePopupList(defaultSettings.themePopupList);
    setThemeNoneTodayPopupList(defaultSettings.themeNoneTodayPopupList);
    setThemePostCategoryList(defaultSettings.themePostCategoryList);
    setThemeSellerList(defaultSettings.themeSellerList);
    removeCookie('themeMode');
    removeCookie('themeLayout');
    removeCookie('themeStretch');
    removeCookie('themeContrast');
    removeCookie('themeDirection');
    removeCookie('themeColorPresets');
    removeCookie('themeCurrentPageObj');
    removeCookie('themeAuth');
    deleteLocalStorage('themeDnsData')
    deleteLocalStorage('themeCartData')
    deleteLocalStorage('themeWishData')
    deleteLocalStorage('themeCategoryList')
    deleteLocalStorage('themePropertyList')
    deleteLocalStorage('themePopupList')
    deleteLocalStorage('themeNoneTodayPopupList')
    deleteLocalStorage('themePostCategoryList')
    deleteLocalStorage('themeSellerList')
  }, []);

  const memoizedValue = useMemo(
    () => ({
      settingPlatform,
      // Mode
      themeMode,
      onToggleMode,
      onChangeMode,
      // Direction
      themeDirection,
      onToggleDirection,
      onChangeDirection,
      onChangeDirectionByLang,
      // Layout
      themeLayout,
      onToggleLayout,
      onChangeLayout,
      // Contrast
      themeContrast,
      onChangeContrast,
      onToggleContrast,
      // Stretch
      themeStretch,
      onToggleStretch,
      // Color
      themeColorPresets,
      onChangeColorPresets,
      presetsOption,
      presetsColor: getPresets(themeColorPresets),
      // Reset
      onResetSetting,
      // dns data
      themeDnsData,
      onChangeDnsData,
      // cart data
      themeCartData,
      onChangeCartData,
      // cart data
      themeWishData,
      onChangeWishData,
      //current page
      themeCurrentPageObj,
      onChangeCurrentPageObj,
      themeAuth,
      onChangeAuth,
      themeCategoryList,
      onChangeCategoryList,
      themePropertyList,
      onChangePropertyList,
      themePopupList,
      onChangePopupList,
      themeNoneTodayPopupList,
      onChangeNoneTodayPopupList,
      themePostCategoryList,
      onChangePostCategoryList,
      themeSellerList,
      onChangeSellerList,
    }),
    [
      settingPlatform,
      // Mode
      themeMode,
      onChangeMode,
      onToggleMode,
      // Color
      themeColorPresets,
      onChangeColorPresets,
      onChangeContrast,
      // Direction
      themeDirection,
      onToggleDirection,
      onChangeDirection,
      onChangeDirectionByLang,
      // Layout
      themeLayout,
      onToggleLayout,
      onChangeLayout,
      // Contrast
      themeContrast,
      onToggleContrast,
      // Stretch
      themeStretch,
      onToggleStretch,
      // Reset
      onResetSetting,
      // dns data
      themeDnsData,
      onChangeDnsData,
      // cart data
      themeCartData,
      onChangeCartData,
      // wish data
      themeWishData,
      onChangeWishData,
      //current page
      themeCurrentPageObj,
      onChangeCurrentPageObj,
      themeAuth,
      onChangeAuth,
      themeCategoryList,
      onChangeCategoryList,
      themePropertyList,
      onChangePropertyList,
      themePopupList,
      onChangePopupList,
      themeNoneTodayPopupList,
      onChangeNoneTodayPopupList,
      themePostCategoryList,
      onChangePostCategoryList,
      themeSellerList,
      onChangeSellerList,
    ]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}

// ----------------------------------------------------------------------

function getCookie(name) {
  if (typeof document === 'undefined') {
    throw new Error(
      'getCookie() is not supported on the server. Fallback to a different value when rendering on the server.'
    );
  }

  const value = `; ${document.cookie}`;

  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts[1].split(';').shift();
  }

  return undefined;
}

function setCookie(name, value, exdays = 3) {
  const date = new Date();
  date.setTime(date.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

function removeCookie(name) {
  document.cookie = `${name}=;path=/;max-age=0`;
}
