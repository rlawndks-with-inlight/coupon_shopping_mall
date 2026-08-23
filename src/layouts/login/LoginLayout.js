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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

LoginLayout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  illustration: PropTypes.string,
};
const TopLogoImg = styled.img`
height: 48px;
cursor:pointer;
@media (max-width:900px){
  height: 32px;
}
`
export default function LoginLayout({ children }) {

  const { themeDnsData } = useSettingsContext();
  // logoSrc() 는 안에서 useSettingsContext() 를 쓴다 — 즉 훅이다.
  // 아래 JSX 의 loading 분기 안에서 부르면 첫 렌더에는 안 불리고 그다음 렌더에만 불려
  // 훅 순서가 바뀐다(React: "change in the order of Hooks"). 여기서 한 번만 부른다.
  const 로고주소 = logoSrc();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (themeDnsData?.id) {
      setLoading(false);
    }
  }, [themeDnsData])
  return (
    <>
      {!loading &&
        <>
          {
            themeDnsData?.seller_id > 0 ?
              <>
                <StyledRoot style={{ flexDirection: 'column' }}>
                  <Row style={{
                    margin: '1rem auto 1rem 1rem',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    columnGap: '0.5rem'
                  }}>
                  </Row>
                  <Row style={{ minHeight: '90vh' }}>
                    {children}
                  </Row>
                </StyledRoot>
              </>
              :
              <>
                <>
                  <StyledRoot style={{ flexDirection: 'column' }}>
                    <Row style={{
                      margin: '1rem auto 1rem 1rem',
                      alignItems: 'center',
                      fontWeight: 'bold',
                      columnGap: '0.5rem'
                    }}>
                      <TopLogoImg src={로고주소} onClick={() => { router.push('/manager/login') }} />
                      <div>판매자 센터</div>
                    </Row>
                    <Row style={{ minHeight: '90vh' }}>
                      {children}
                    </Row>
                  </StyledRoot>
                </>
              </>
          }
        </>
      }
    </>
  );
}
