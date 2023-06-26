import PropTypes from 'prop-types';
import { useMemo, useState, useEffect, useContext, useCallback, createContext } from 'react';
//
import { defaultSettings } from './config-setting';

// ----------------------------------------------------------------------

const initialState = {
  ...defaultSettings,
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
  // Stretch
  onToggleStretch: () => { },
  // Reset
  onResetSetting: () => { },
  // dns data
  onChangeDnsData: () => { },
  // current page
  onChangeCurrentPageObj: () => { },
  //auth
  onChangeAuth: () => { },
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
  const [themeMode, setThemeMode] = useState(defaultSettings.themeMode);
  const [themeLayout, setThemeLayout] = useState(defaultSettings.themeLayout);
  const [themeStretch, setThemeStretch] = useState(defaultSettings.themeStretch);
  const [themeContrast, setThemeContrast] = useState(defaultSettings.themeContrast);
  const [themeDirection, setThemeDirection] = useState(defaultSettings.themeDirection);
  const [themeDnsData, setThemeDnsData] = useState(defaultSettings.themeDnsData);
  const [themeCurrentPageObj, setThemeCurrentPageObj] = useState(defaultSettings.themeCurrentPageObj);
  const [themeAuth, setThemeAuth] = useState(defaultSettings.themeAuth);




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
      const dnsData = getCookie('themeDnsData') || defaultSettings.themeDnsData;
      const currentPageObj = getCookie('themeCurrentPageObj') || defaultSettings.themeCurrentPageObj;
      const auth = getCookie('themeAuth') || defaultSettings.themeAuth;

      setThemeMode(mode);
      setThemeLayout(layout);
      setThemeStretch(stretch);
      setThemeContrast(contrast);
      setThemeDirection(direction);
      setThemeDnsData(dnsData);
      setThemeCurrentPageObj(currentPageObj);
      setThemeAuth(auth);
    }
  }, []);

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


  // Stretch
  const onToggleStretch = useCallback(() => {
    const value = !themeStretch;
    setThemeStretch(value);
    setCookie('themeStretch', JSON.stringify(value));
  }, [themeStretch]);
  // dns data
  const onChangeDnsData = useCallback((dns_data) => {
    setThemeDnsData(dns_data);
    setCookie('themeDnsData', JSON.stringify(dns_data));
  })
  // current page
  const onChangeCurrentPageObj = useCallback((data) => {
    setThemeCurrentPageObj(data);
    setCookie('themeCurrentPageObj', JSON.stringify(data));
  })
  // auth
  const onChangeAuth = useCallback((data) => {
    setThemeAuth(data);
    setCookie('auth', JSON.stringify(data));
  })
  // Reset
  const onResetSetting = useCallback(() => {
    setThemeMode(defaultSettings.themeMode);
    setThemeLayout(defaultSettings.themeLayout);
    setThemeStretch(defaultSettings.themeStretch);
    setThemeContrast(defaultSettings.themeContrast);
    setThemeDirection(defaultSettings.themeDirection);
    setThemeDnsData(defaultSettings.themeDnsData);
    setThemeCurrentPageObj(defaultSettings.themeCurrentPageObj);
    setThemeAuth(defaultSettings.themeAuth);
    removeCookie('themeMode');
    removeCookie('themeLayout');
    removeCookie('themeStretch');
    removeCookie('themeContrast');
    removeCookie('themeDirection');
    removeCookie('themeDnsData');
    removeCookie('themeCurrentPageObj');
    removeCookie('themeAuth');
  }, []);

  const memoizedValue = useMemo(
    () => ({
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
      // Reset
      onResetSetting,
      // dns data
      themeDnsData,
      onChangeDnsData,
      //current page
      themeCurrentPageObj,
      onChangeCurrentPageObj,
      onChangeAuth,
    }),
    [
      // Mode
      themeMode,
      onChangeMode,
      onToggleMode,
      // Color
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
      //current page
      themeCurrentPageObj,
      onChangeCurrentPageObj,
      themeAuth,
      onChangeAuth,
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
