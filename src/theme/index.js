import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
// @mui
import { CssBaseline } from '@mui/material';
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider as MUIThemeProvider,
} from '@mui/material/styles';
// components
import { useSettingsContext } from '../components/settings';
//
import palette from './palette';
import typography from './typography';
import shadows from './shadows';
import customShadows from './customShadows';
import componentsOverride from './overrides';
import GlobalStyles from './globalStyles';

// ----------------------------------------------------------------------

ThemeProvider.propTypes = {
  children: PropTypes.node,
};

// bodyWithoutDns: 몰 정보(themeDnsData)를 기다리지 않고 본문을 바로 그린다 — 서버 HTML 에 본문이 실린다.
//   샵고 소개 페이지(랜딩·이용가이드·디자인·FAQ·신청)만 켠다(_app 의 서버본문). 이 페이지들은 몰 정보 없이도
//   그려지게 짜여 있다. 몰 화면은 상품·카테고리·결제수단을 몰 정보에서 읽으므로 아직 기다린다(검색 노출 2단계, 2026-11-17).
// fallback: 몰 정보를 기다리는 동안 대신 그릴 것 — 가맹점 몰의 검색엔진용 본문(숨김, src/components/seo/SearchBody.js).
export default function ThemeProvider({ children, bodyWithoutDns = false, fallback = null }) {
  const { themeMode, themeDirection, themeDnsData } = useSettingsContext();
  const [paletteObj, setPaletteObj] = useState(palette(themeMode))
  useEffect(() => {
    if (themeDnsData?.id) {
      let palette_obj = { ...paletteObj };
      // 폴백: main_color가 비어있으면(예: theme_css 미설정/초기화) 기본 테마색으로.
      //  없이 그대로 대입하면 primary가 undefined/흰색이 되어 저장버튼·강조가 안 보임.
      const mc = themeDnsData?.theme_css?.main_color || '#00ab55';
      palette_obj['primary']['main'] = mc;
      palette_obj['primary']['dark'] = mc;
      palette_obj['primary']['darker'] = mc;
      palette_obj['primary']['light'] = mc + '';
      palette_obj['primary']['lighter'] = mc + '29';
      palette_obj.is_dns_data = true;
      setPaletteObj(palette_obj);
    }
  }, [themeDnsData])
  const themeOptions = useMemo(
    () => ({
      palette: palette(themeMode),
      typography,
      shape: { borderRadius: 8 },
      direction: themeDirection,
      shadows: shadows(themeMode),
      customShadows: customShadows(themeMode),
    }),
    [themeDirection, themeMode]
  );

  const theme = createTheme(themeOptions);

  theme.components = componentsOverride(theme);

  // injectFirst 를 쓰지 않는다 — 그건 MUI 가 따로 만든 캐시로 바꿔 끼워서, 서버가 모으는 캐시(_document)를 건너뛴다.
  //   '페이지 CSS 보다 먼저' 는 _document 의 emotion-insertion-point 자리로 지킨다.
  return (
    <StyledEngineProvider>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {(paletteObj?.is_dns_data || bodyWithoutDns) ?
          <>
            {children}
          </> : fallback}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
