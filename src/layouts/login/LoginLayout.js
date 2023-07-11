import PropTypes from 'prop-types';
// @mui
import { Typography, Stack } from '@mui/material';
// components
import Logo from '../../components/logo';
import Image from '../../components/image';
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';
import { logoSrc } from 'src/data/data';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

LoginLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  illustration: PropTypes.string,
};

export default function LoginLayout({ children, illustration, title }) {

  const { themeDnsData } = useSettingsContext();
  return (
    <>
      {themeDnsData?.id &&
        <>
          <StyledRoot>
            <img src={logoSrc} style={{ height: '48px', margin: '1rem' }} />

            <StyledSection>
              <Typography variant="h3" sx={{ mb: 10, maxWidth: 520, textAlign: 'center' }}>
                컴어게인 쇼핑몰에 오신것을 환영합니다!
              </Typography>

              <Image
                disabledEffect
                visibleByDefault
                alt="auth"
                src={illustration || '/assets/illustrations/illustration_dashboard.png'}
                sx={{ maxWidth: 720 }}
              />

              <StyledSectionBg />
            </StyledSection>
            <StyledContent>
              <Stack sx={{ width: 1 }}> {children} </Stack>
            </StyledContent>
          </StyledRoot>
        </>}
    </>
  );
}
