import PropTypes from 'prop-types';
// @mui
import { Typography, Stack } from '@mui/material';
// components
import Logo from '../../components/logo';
import Image from '../../components/image';
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';
import { useSettingsContext } from 'src/components/settings';
import { useEffect, useState } from 'react';

// ----------------------------------------------------------------------

LoginLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  illustration: PropTypes.string,
};

export default function LoginLayout({ children, illustration, title }) {
  const { themeDnsData } = useSettingsContext();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (Object.keys(themeDnsData).length > 0) {
      setLoading(false);
    }
  }, [themeDnsData])
  return (
    <>
      {!loading &&
        <>
          <StyledRoot>
            {/* <Logo
        sx={{
          zIndex: 9,
          position: 'absolute',
          mt: { xs: 1.5, md: 5 },
          ml: { xs: 2, md: 5 },
        }}
      />

      <StyledSection>
        <Typography variant="h3" sx={{ mb: 10, maxWidth: 480, textAlign: 'center' }}>
          {title || 'Hi, Welcome back'}
        </Typography>

        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={illustration || '/assets/illustrations/illustration_manager.png'}
          sx={{ maxWidth: 720 }}
        />

        <StyledSectionBg />
      </StyledSection> */}

            <StyledContent>
              <Stack sx={{ width: 1 }}> {children} </Stack>
            </StyledContent>
          </StyledRoot>
        </>}
    </>
  );
}
