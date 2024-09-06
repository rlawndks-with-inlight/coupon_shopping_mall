import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import styled from "styled-components";
import React, { useEffect, useRef, useState } from 'react';
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import { Col, Row } from "src/components/elements/styled-components";
import { useLocales } from "src/locales";
import { logoSrc } from "src/data/data";

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
font-size: 48px;
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
  const { themeDnsData, themeMode } = useSettingsContext();
  const router = useRouter();
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const [keyword, setKeyword] = useState("");
  const { translate } = useLocales()

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
        {
          themeDnsData?.id != 63 ?
            <>
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
                  {
                    themeDnsData.id == 34 ?
                      'THE PLUS'
                      :
                      themeDnsData.id == 59 ?
                        'TJMALL'
                        :
                        themeDnsData.id == 61 ?
                          'DEONI'
                          :
                          themeDnsData.id == 63 ?
                            'OURSHOP'
                            :
                            ''
                  }<br />
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
                    {translate("사업자를 위한 특화서비스")}
                  </ContentTitle>
                  <ContentSubTitle>
                    {translate("해외상품을 간편하게 담아 나만의 상품 보관함에서 언제든 편리하게 관리 주문 가능합니다.")}
                  </ContentSubTitle>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Col style={{ marginRight: '0.25rem' }}>
                      <img src="/qietu/Mask group-2.png" style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }} />
                      <Content>
                        {translate("파트너사가 무엇을 원하는지")}
                      </Content>
                      <ContentSub>
                        {translate("상품구매정보 언어")}<br />
                        {translate("상품설명 이미지")}
                      </ContentSub>
                    </Col>
                    <Col style={{ marginRight: '0.25rem', marginLeft: '0.25rem' }}>
                      <img src="/qietu/Mask group-1.png" style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }} />
                      <Content>
                        {translate("한국시장에서의 유행제품 소싱")}
                      </Content>
                      <ContentSub>
                        {translate("엄선된 제품을 골라")}<br />
                        {translate("가격 배송 결제를 편리하게")}
                      </ContentSub>
                    </Col>
                    <Col style={{ marginLeft: '0.25rem' }}>
                      <img src="/qietu/Mask group.png" style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }} />
                      <Content>
                        {translate("안전한 거래")}
                      </Content>
                      <ContentSub>
                        {translate("모바일 / PC")}<br />
                        {translate("공간에 관계없이 주문가능")}
                      </ContentSub>
                    </Col>
                  </Row>
                </ContentBox>
              </div>
              <div style={{ width: '100%', backgroundColor: '#F7F7F7' }}>
                <ContentBox>
                  <ContentTitle>
                    {translate("B2B 구매가 쉬워집니다")}
                  </ContentTitle>
                  <ContentSubTitle>
                    {
                      themeDnsData.id == 34 ?
                        translate("'더플러스'에서는 B2B쇼핑을 보다 빠르고 간편하며")
                        :
                        themeDnsData.id == 59 ?
                          translate("'티제이몰'에서는 B2B쇼핑을 보다 빠르고 간편하며")
                          :
                          themeDnsData.id == 61 ?
                            translate("'다오니'에서는 B2B쇼핑을 보다 빠르고 간편하며")
                            :
                            themeDnsData.id == 63 ?
                              translate("'아워샵'에서는 B2B쇼핑을 보다 빠르고 간편하며")
                              :
                              ''
                    }<br />
                    {translate("모두의 불안한 배송에 대한 안전한 물류를 자랑으로 합니다.")}
                  </ContentSubTitle>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Col style={{ marginRight: '0.25rem', maxWidth: '300px' }}>
                      <img src="/qietu/Group 7.png" style={{ maxHeight: '100px', height: '25%', margin: '0 auto' }} />
                      <Content>
                        {translate("한글검색 지원")}
                      </Content>
                      <ContentSub>
                        {translate("언어장벽 없는 상품정보 검색")}
                      </ContentSub>
                    </Col>
                    <Col style={{ marginRight: '0.25rem', marginLeft: '0.25rem', maxWidth: '300px' }}>
                      <img src="/qietu/Group 8.png" style={{ maxHeight: '100px', height: '25%', margin: '0 auto' }} />
                      <Content>
                        {translate("초고속 주문가능")}
                      </Content>
                      <ContentSub>
                        {translate("상품재고 / 가격 빠르게 선택주문가능")}
                      </ContentSub>
                    </Col>
                    <Col style={{ marginRight: '0.25rem', marginLeft: '0.25rem', maxWidth: '300px' }}>
                      <img src="/qietu/Group 9.png" style={{ maxHeight: '100px', height: '25%', margin: '0 auto' }} />
                      <Content>
                        {translate("원화결제 가능")}
                      </Content>
                      <ContentSub>
                        {translate("국내 결제대행사 연동지원 안전거래가능")}
                      </ContentSub>
                    </Col>
                    <Col style={{ marginLeft: '0.25rem', maxWidth: '300px' }}>
                      <img src="/qietu/Group 10.png" style={{ maxHeight: '100px', height: '25%', margin: '0 auto' }} />
                      <Content>
                        {translate("배송위치확인")}
                      </Content>
                      <ContentSub>
                        {translate("알 길 없던 중국내 배송현황 확인")}
                      </ContentSub>
                    </Col>
                  </Row>
                </ContentBox>
              </div>
            </>
            :
            <>
              <TopBanner>
                {/*<video ref={videoRef1} autoPlay muted loop style={{ margin: '0 auto' }}>
            <source src='/qietu/video1.mp4' type="video/mp4" />
          </video>*/}

                <Title>
                  {
                    themeMode != 'dark' ?
                      <>
                        <img src={logoSrc()} />
                      </>
                      :
                      <>
                        <img src='/logos/ourshop2.png' />
                      </>
                  }
                  <br />
                  {
                    themeDnsData?.id != 63 &&
                    <>
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
                    </>
                  }
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
              <div style={{ width: '100%', marginBottom: '5rem' }}>
                <ContentBox>
                  <ContentTitle style={{ fontWeight: '600', marginBottom: '2rem' }}>
                    맞춤 무역대행 서비스
                  </ContentTitle>
                  <ContentSubTitle>
                    온라인 구매대행, 배송(물류)대행, 시장사입 뿐 아니라<br />
                    해외무역과 관련된 모든 컨설팅이 가능합니다.
                  </ContentSubTitle>
                  <Row style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <img src='/china/10.png' style={{ width: '80%' }} />
                    <div style={{ background: '#34619D', textAlign: 'left', padding: '30px', color: 'white', width: '80%', marginLeft: '20%', display: 'flex', flexDirection: 'column' }}>
                      <span className="c" style={{ marginBottom: '2rem' }}>
                        물류대행 서비스 (포워딩 면허소유)
                      </span>
                      <span className="b" style={{}}>
                        제품의 특징, 수량에 따라<br />
                        맞춤형으로 전 세계 모든 곳으로<br />
                        물류를 대행해 드리며<br />
                        최저가 물류비용을 보장합니다.<br /><br />
                        식품, 전자제품, 위험물품 등<br />
                        통관 가능한 제품은 모두<br />
                        진행 가능합니다.<br />
                      </span>
                      <style>
                        {`
                        .c {
                        font-size:30px;
                        @media (max-width:600px) {
                        font-size:20px;
                        }
                        }
                        .b {
                        font-size: 18px;
                        @media (max-width:600px) {
                        font-size: 12px;
                        }
                        }
                        `}
                      </style>
                    </div>
                  </Row>
                </ContentBox>
              </div>
              <div style={{ width: '100%', backgroundColor: '#F7F7F7', }}>
                <ContentBox>
                  <ContentTitle style={{ fontWeight: '600', marginBottom: '2rem' }}>
                    무역부터 물류까지 원스톱 서비스
                  </ContentTitle>
                  <ContentSubTitle>
                    아워샵에서는 회사 전부 직영으로<br />
                    일관된 서비스가 가능하고 또한 원하는 서비스를 골라서 이용할 수 있습니다
                  </ContentSubTitle>
                  <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Col style={{ marginRight: '0.25rem', maxWidth: '300px' }}>
                      <img src="/china/icon-1.png" style={{ maxHeight: '100px', height: '50%', margin: '0 auto' }} />
                      <Content style={{ fontSize: '20px' }}>
                        해외무역
                      </Content>
                    </Col>
                    <Col style={{ marginRight: '0.25rem', maxWidth: '300px' }}>
                      <img src="/china/icon-2.png" style={{ maxHeight: '100px', height: '50%', margin: '0 auto' }} />
                      <Content style={{ fontSize: '20px' }}>
                        시장사입
                      </Content>
                    </Col>
                    <Col style={{ marginRight: '0.25rem', maxWidth: '300px' }}>
                      <img src="/china/icon-3.png" style={{ maxHeight: '100px', height: '50%', margin: '0 auto' }} />
                      <Content style={{ fontSize: '20px' }}>
                        물류(포워딩)
                      </Content>
                    </Col>
                    <Col style={{ marginRight: '0.25rem', maxWidth: '300px' }}>
                      <img src="/china/icon-4.png" style={{ maxHeight: '100px', height: '50%', margin: '0 auto' }} />
                      <Content style={{ fontSize: '20px' }}>
                        구매대행
                      </Content>
                    </Col>
                    <Col style={{ marginRight: '0.25rem', maxWidth: '300px' }}>
                      <img src="/china/icon-5.png" style={{ maxHeight: '100px', height: '50%', margin: '0 auto' }} />
                      <Content style={{ fontSize: '20px' }}>
                        각종 KC인증
                      </Content>
                    </Col>
                    <Col style={{ marginRight: '0.25rem', maxWidth: '300px' }}>
                      <img src="/china/icon-6.png" style={{ maxHeight: '100px', height: '50%', margin: '0 auto' }} />
                      <Content style={{ fontSize: '20px' }}>
                        OEM/ODM
                      </Content>
                    </Col>
                  </Row>
                </ContentBox>
              </div>
              <div style={{ width: '100%', marginBottom: '5rem' }}>
                <ContentBox>
                  <ContentTitle style={{ fontWeight: '600', marginBottom: '2rem' }}>
                    아워샵의 시스템
                  </ContentTitle>
                  <ContentSubTitle>
                    수입시 어려웠던 부분, 고민이 있던 부분들을<br />
                    모두 속시원하게 해결해드립니다.
                  </ContentSubTitle>
                  <Row style={{ display: 'flex', position: 'relative' }}>
                    <style>
                      {`
                      .div1 {
                      padding: 40px;
                      @media (max-width: 800px) {
                      padding: 30px;
                      }
                      @media (max-width: 600px) {
                      padding: 20px;
                      }
                      @media (max-width: 500px) {
                      padding: 10px;
                      }
                      }
                      .span1 {
                      font-size: 24px;
                      margin-bottom: 5rem;
                      @media (max-width:800px) {
                      font-size: 20px;
                      margin-bottom: 4rem;
                      }
                      @media (max-width:600px) {
                      margin-bottom: 3rem;
                      font-size: 16px;
                      }
                      @media (max-width:500px) {
                      font-size: 14px;
                      }
                      }
                      .span2 {
                      font-size: 18px;
                      @media (max-width:800px) {
                      font-size: 15px;
                      }
                      @media (max-width: 600px) {
                      font-size: 12px;
                      }
                      @media (max-width: 500px) {
                      font-size: 10px;
                      }
                      }
                      `}
                    </style>
                    <div className="div1" style={{ width: '33.3%', background: '#44A9DB', color: 'white', display: 'flex', flexDirection: 'column', border: '1px solid #CBD2DC' }}>
                      <span className="span1" style={{ textShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)' }}>
                        해외 플랫폼 API 연동
                      </span>
                      <span className="span2" style={{}}>
                        해외 플랫폼의 API를 연동하여<br />
                        국내 쇼핑몰을 사용할 때처럼<br />
                        손쉽게 열람 및 주문이 가능합니다
                      </span>
                    </div>
                    <div className="div1" style={{ width: '33.3%', background: 'white', color: 'black', display: 'flex', flexDirection: 'column', border: '1px solid #CBD2DC' }}>
                      <span className="span1" style={{ textShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)' }}>
                        주문 제품 실시간 확인
                      </span>
                      <span className="span2" style={{}}>
                        주문 뒤 매일 납기 체크 관리를 하여<br />
                        마이페이지에서 실시간으로<br />
                        주문 상태 확인이 가능합니다
                      </span>
                    </div>
                    <div className="div1" style={{ width: '33.3%', background: '#34619D', color: 'white', display: 'flex', flexDirection: 'column', border: '1px solid #CBD2DC' }}>
                      <span className="span1" style={{ textShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)' }}>
                        20여년 경력 빠른 피드백
                      </span>
                      <span className="span2" style={{}}>
                        5분 이내 빠른 답변을 원칙으로 하여<br />
                        국내 대기업보다 빠르게<br />
                        확인 및 피드백을 약속합니다
                      </span>
                    </div>
                  </Row>
                  <Row style={{ display: 'flex', position: 'relative' }}>
                    <div className="div1" style={{ width: '33.3%', background: 'white', color: 'black', display: 'flex', flexDirection: 'column', border: '1px solid #CBD2DC', borderTop: '0px' }}>
                      <span className="span1" style={{ textShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)' }}>
                        VIP 회원 5% 할인혜택
                      </span>
                      <span className="span2" style={{}}>
                        VIP 회원으로 선정되실 경우<br />
                        5% 할인 가격을 적용해<br />
                        최저가로 모십니다
                      </span>
                    </div>
                    <div className="div1" style={{ width: '33.3%', background: '#5E6570', color: 'white', display: 'flex', flexDirection: 'column', border: '1px solid #CBD2DC', borderTop: '0px' }}>
                      <span className="span1" style={{ textShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)' }}>
                        차별화된 검수로 불량 최소화
                      </span>
                      <span className="span2" style={{}}>
                        차별화된 검수 시스템으로<br />
                        불량을 최소화합니다<br />
                        입고 시 먼저 확인드리고 제품을 보내드립니다
                      </span>
                    </div>
                    <div className="div1" style={{ width: '33.3%', background: 'white', color: 'black', display: 'flex', flexDirection: 'column', border: '1px solid #CBD2DC', borderTop: '0px' }}>
                      <span className="span1" style={{ textShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)' }}>
                        신용과 신뢰 100%
                      </span>
                      <span className="span2" style={{}}>
                        무역은 신뢰가 전부임에<br />
                        신뢰를 바탕으로 한<br />
                        업무 진행 및 시스템을 약속드립니다
                      </span>
                    </div>
                  </Row>
                </ContentBox>
              </div>
            </>
        }
      </Wrappers >
    </>
  )
}
export default HomeDemo