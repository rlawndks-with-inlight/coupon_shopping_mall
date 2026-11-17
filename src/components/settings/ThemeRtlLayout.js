import PropTypes from 'prop-types';
import { useEffect } from 'react';
// rtl
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
// emotion
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
// @mui
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

ThemeRtlLayout.propTypes = {
  children: PropTypes.node,
};

export default function ThemeRtlLayout({ children }) {
  const theme = useTheme();

  useEffect(() => {
    document.dir = theme.direction;
  }, [theme.direction]);

  // 왼쪽→오른쪽 언어는 바깥(_app)의 emotion 캐시를 그대로 쓴다. 여기서 새 캐시를 만들어 끼우면
  //   ① 화면을 그릴 때마다 캐시가 새로 생기고 ② 서버가 스타일을 모으는 캐시(_document)를 건너뛴다(검색 노출 2단계).
  //   예전엔 ThemeProvider 의 injectFirst 가 그 안쪽을 다시 덮어서 드러나지 않았다.
  if (theme.direction !== 'rtl') return <>{children}</>;

  const cacheRtl = createCache({
    key: theme.direction === 'rtl' ? 'rtl' : 'css',
    stylisPlugins: theme.direction === 'rtl' ? [prefixer, rtlPlugin] : [],
  });

  return <CacheProvider value={cacheRtl}>{children}</CacheProvider>;
}
