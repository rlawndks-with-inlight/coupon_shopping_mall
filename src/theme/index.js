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

export default function ThemeProvider({ children }) {
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

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles />
        {paletteObj?.is_dns_data &&
          <>
            {children}
          </>}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
