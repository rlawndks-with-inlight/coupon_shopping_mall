import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import styled from "styled-components";
import React, { useEffect, useRef, useState } from 'react';
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { Col, Row } from "src/components/elements/styled-components";

const Wrappers = styled.div`
width: 100%;
margin-top: -60px;
word-break: keep-all;
`

const TopBanner = styled.div`
width: 100%;
height: 100vh;
overflow: hidden;
`

const Title = styled.div`
color: white;
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
text-align: center;
font-size: 4rem;
font-family: Archivo Black;
font-weight: bold;
@media (max-width:1240px) {
  font-size: 3rem;
}
@media (max-width:750px) {
  font-size: 2rem;
}
@media (max-width:600px) {
  font-size: 1.5rem;
}
`

const ContentBox = styled.div`
max-width: 1240px;
margin: 0 auto;
padding-top: 4rem;
text-align: center;
`

const ContentTitle = styled.div`
font-size: 4rem;
font-weight: bold;
font-family: Abhaya Libre ExtraBold;
@media (max-width:1240px) {
  font-size: 3rem;
}
@media (max-width:750px) {
  font-size: 2rem;
}
@media (max-width:600px) {
  font-size: 1.5rem;
}
`

const ContentSubTitle = styled.div`
font-size: 20px;
font-family: ABeeZee;
margin-bottom: 4rem;
@media (max-width:1240px) {
  font-size: 15px;
}
@media (max-width:750px) {
  font-size: 10px;
}
@media (max-width:600px) {
  font-size: 7.5px;
}
`

const Content = styled.div`
font-size: 28px;
font-weight: bold;
font-family: Abhaya Libre ExtraBold;
margin: 1rem auto;
@media (max-width:1240px) {
  font-size: 21px;
}
@media (max-width:750px) {
  font-size: 18px;
}
@media (max-width:600px) {
  font-size: 14px;
}
`

const ContentSub = styled.div`
font-size: 1rem;
font-family: ABeeZee;
margin-bottom: 4rem;
@media (max-width:1240px) {
  font-size: 0.9rem;
}
@media (max-width:750px) {
  font-size: 0.8rem;
}
@media (max-width:600px) {
  font-size: 0.75rem;
}
`

const HomeDemo = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const [keyword, setKeyword] = useState("");

  const onSearch = () => {
    router.push(`/shop/search?keyword=${keyword}`)
  }

  /*useEffect(() => {
    const handleVideo1Ended = () => {
      videoRef2.current.play();
    };

    const handleVideo2Ended = () => {
      videoRef1.current.play();
    };

    videoRef1.current.addEventListener('ended', handleVideo1Ended);
    videoRef2.current.addEventListener('ended', handleVideo2Ended);

    return () => {
      videoRef1.current.removeEventListener('ended', handleVideo1Ended);
      videoRef2.current.removeEventListener('ended', handleVideo2Ended);
    };
  }, []);*/

  return (
    <>
      <Wrappers>
        <TopBanner>
          {/*<video ref={videoRef1} autoPlay muted loop style={{ margin: '0 auto' }}>
            <source src='/qietu/video1.mp4' type="video/mp4" />
          </video>*/}
          <video
            ref={videoRef2}
            autoPlay
            muted
            loop
            playsInline
            style={{
              minWidth: '100%',
              minHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'cover'
            }}
          >
            <source src='/qietu/main_video.mp4' type="video/mp4" />
          </video>
          <Title>
            Proposal of B2B Shopping<br />
            'THE PLUS'<br />
            <TextField
              id='size-small'
              size='big'
              onChange={(e) => {
                setKeyword(e.target.value)
              }}
              value={keyword}
              sx={{
                margin: '3rem auto 0 auto',
                width: '100%',
                backgroundColor: 'white'
              }}
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                  onSearch();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => onSearch()}
                      aria-label='toggle password visibility'
                    >
                      <img src="/qietu/Vector.png" style={{ width: '24px' }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Title>
          <img src="/qietu/arrow.png"
            style={{
              width: '46px',
              position: 'absolute',
              bottom: '5%',
              left: '50%',
              transform: 'translate(-50%, -5%)'
            }}
          />
        </TopBanner>
        <div style={{ width: '100%' }}>
          <ContentBox>
            <ContentTitle>
              사업자를 위한 특화서비스
            </ContentTitle>
            <ContentSubTitle>
              해외상품을 간편하게 담아 나만의 상품 보관함에서 언제든 편리하게 관리 주문 가능합니다.
            </ContentSubTitle>
            <Row style={{ justifyContent: 'space-between' }}>
              <Col style={{ marginRight: '0.25rem' }}>
                <img src="/qietu/Mask group-2.png" style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }} />
                <Content>
                  파트너사가 무엇을 원하는지
                </Content>
                <ContentSub>
                  상품구매정보 언어<br />
                  상품설명 이미지
                </ContentSub>
              </Col>
              <Col style={{ marginRight: '0.25rem', marginLeft: '0.25rem' }}>
                <img src="/qietu/Mask group-1.png" style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }} />
                <Content>
                  한국시장에서의 유행제품 소싱
                </Content>
                <ContentSub>
                  엄선된 제품을 골라<br />
                  가격 배송 결제를 편리하게
                </ContentSub>
              </Col>
              <Col style={{ marginLeft: '0.25rem' }}>
                <img src="/qietu/Mask group.png" style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }} />
                <Content>
                  안전한 거래
                </Content>
                <ContentSub>
                  모바일 / PC<br />
                  공간에 관계없이 주문가능
                </ContentSub>
              </Col>
            </Row>
          </ContentBox>
        </div>
        <div style={{ width: '100%', backgroundColor: '#F7F7F7' }}>
          <ContentBox>
            <ContentTitle>
              B2B 구매가 쉬워집니다
            </ContentTitle>
            <ContentSubTitle>
              '더플러스'에서는 B2B쇼핑을 보다 빠르고 간편하며<br />
              모두의 불안한 배송에 대한 안전한 물류를 자랑으로 합니다.
            </ContentSubTitle>
            <Row style={{ justifyContent: 'space-between' }}>
              <Col style={{ marginRight: '0.25rem', maxWidth: '300px' }}>
                <img src="/qietu/Group 7.png" style={{ maxHeight: '100px', height: '25%', margin: '0 auto' }} />
                <Content>
                  한글검색 지원
                </Content>
                <ContentSub>
                  언어장벽 없는 상품정보 검색
                </ContentSub>
              </Col>
              <Col style={{ marginRight: '0.25rem', marginLeft: '0.25rem', maxWidth: '300px' }}>
                <img src="/qietu/Group 8.png" style={{ maxHeight: '100px', height: '25%', margin: '0 auto' }} />
                <Content>
                  초고속 주문가능
                </Content>
                <ContentSub>
                  상품재고 / 가격 빠르게 선택주문가능
                </ContentSub>
              </Col>
              <Col style={{ marginRight: '0.25rem', marginLeft: '0.25rem', maxWidth: '300px' }}>
                <img src="/qietu/Group 9.png" style={{ maxHeight: '100px', height: '25%', margin: '0 auto' }} />
                <Content>
                  원화결제 가능
                </Content>
                <ContentSub>
                  국내 결제대행사 연동지원 안전거래가능
                </ContentSub>
              </Col>
              <Col style={{ marginLeft: '0.25rem', maxWidth: '300px' }}>
                <img src="/qietu/Group 10.png" style={{ maxHeight: '100px', height: '25%', margin: '0 auto' }} />
                <Content>
                  배송위치확인
                </Content>
                <ContentSub>
                  알 길 없던 중국내 배송현황 확인
                </ContentSub>
              </Col>
            </Row>
          </ContentBox>
        </div>
      </Wrappers >
    </>
  )
}
export default HomeDemo