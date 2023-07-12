import PropTypes from 'prop-types';
// @mui
import { Typography, Stack } from '@mui/material';
// components
import Logo from '../../components/logo';
import Image from '../../components/image';
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';
import { logoSrc } from 'src/data/data';
import { Row } from 'src/components/elements/styled-components';
import styled from 'styled-components';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

LoginLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  illustration: PropTypes.string,
};
const TopLogoImg = styled.img`
height: 48px;
margin: 1rem auto 1rem 1rem;
@media (max-width:900px){
  display:none;
}
`
export default function LoginLayout({ children }) {

  const { themeDnsData } = useSettingsContext();
  return (
    <>
      {themeDnsData?.id &&
        <>
          <StyledRoot style={{ flexDirection: 'column' }}>
            <TopLogoImg src={logoSrc} />
            <Row>
              {children}
            </Row>
          </StyledRoot>
        </>}
    </>
  );
}
