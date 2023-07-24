import PropTypes from 'prop-types';
import { forwardRef, useEffect } from 'react';
// next
import NextLink from 'next/link';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Link } from '@mui/material';
import { useSettingsContext } from '../settings';
import { LazyLoadImage } from 'react-lazy-load-image-component';

// ----------------------------------------------------------------------

const Logo = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {
  const theme = useTheme();
  const { themeDnsData, themeLayout, themeMode } = useSettingsContext();
  // OR using local (public folder)
  // -------------------------------------------------------
  // const logo = (
  //   <Box
  //     component="img"
  //     src="/logo/logo_single.svg" => your path
  //     sx={{ width: 40, height: 40, cursor: 'pointer', ...sx }}
  //   />
  // );
  useEffect(() => {
    console.log(themeLayout)
  }, [themeLayout])
  const returnLogoImg = () => {
    if (themeLayout == 'mini') {
      return themeDnsData.favicon_img
    } else {
      return themeDnsData[`${themeMode == 'dark' ? 'dark_' : ''}logo_img`]
    }
  }
  const returnMargin = () => {
    if (themeLayout == 'mini') {
      return '1rem auto'
    } else {
      return 'auto'
    }
  }
  const returnLogoSize = () => {
    if (themeLayout == 'mini') {
      return {
        width: '48px',
        height: 'auto'
      }
    } else {
      return {
        height: '48px',
        width: 'auto',
      }
    }
  }
  const logo = (
    <LazyLoadImage src={returnLogoImg()} style={{
      ...{
        ...returnLogoSize(),
        maxWidth: 'none',
        margin: returnMargin()
      }, ...other.style
    }} />
  );
  if (disabledLink) {
    return logo;
  }

  return (
    <>
      {logo}
    </>
  );
});

Logo.propTypes = {
  sx: PropTypes.object,
  disabledLink: PropTypes.bool,
};

export default Logo;
