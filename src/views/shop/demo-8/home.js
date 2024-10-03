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
import Slider from "react-slick";

const Wrappers = styled.div`
width: 100%;
margin-top: -60px;
word-break: keep-all;
`

const TopBanner = styled.div`
width: 100%;
height: 720px;
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

const Header = styled.div`
width: 100%;
margin: 0 auto;
position: fixed;
top: 0;
height: 120px;
z-index: 10;
background-color: white;
@media (max-width:1200px){
  height: 80px;
}
`

const Main = styled.div`
display: flex;
@media (max-width:1200px){
  display: none;
}
`

const MobileMain = styled.div`
display: none;
@media (max-width:1200px) {
  display: flex;
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

  const [currentIndex, setCurrentIndex] = useState(0);

  const [tab, setTab] = useState(0)
  const [menu, setMenu] = useState(false)

  const [scrollTop, setScrollTop] = useState()
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop_ = document.documentElement.scrollTop;
      setScrollTop(scrollTop_ > 0)
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [])

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
  const item_list_setting = {
    infinite: true,
    speed: 500,
    autoplay: false,
    autoplaySpeed: 2500,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
  }

  const banner = [
    '/asapmall-demo/bg_adv02.jpg',
    '/asapmall-demo/bg_adv03.jpg',
    '/asapmall-demo/bg_adv04.jpg',
  ]

  const image = [
    '/logos/asapmall_full.png'
  ]


  const handleClick = () => {
    const anchor = document.querySelector('body')
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <Wrappers>
        <Header>
          <div style={{ display: 'flex', margin: '0 auto', maxWidth: '1200px', width: '100%', alignItems: 'center', flexDirection: 'column' }} >
            <div style={{ display: 'flex', cursor: 'pointer' }} onClick={() => { setTab(0); handleClick(); }}>
              <img src={image[0]} style={{ height: '70px' }} />
            </div>
            <Main style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(1); handleClick(); }}>
                에이삽몰이란
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(2); handleClick(); }}>
                주요기능
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(3); handleClick(); }}>
                가입안내
              </div>
            </Main>
          </div>
        </Header>
        {
          tab == 0 &&
          <>
            <MobileMain style={{ marginTop: '150px', }}>
              <Row style={{ justifyContent: 'center', width: '100%' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(1); handleClick(); }}>
                  에이삽몰이란
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(2); handleClick(); }}>
                  주요기능
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(3); handleClick(); }}>
                  가입안내
                </div>
              </Row>
            </MobileMain>
            <Main style={{ width: '100%', margin: '0 auto', marginTop: '120px', padding: '120px', flexDirection: 'column', justifyContent: 'center', background: '#CED9EA' }}>
              <img src="/asapmall-demo/s1.png" style={{ maxWidth: '400px', margin: '0 auto' }} />
            </Main>
            <Main style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '40px', color: '#515B66', letterSpacing: '-5px', wordSpacing: '5px', margin: '0 auto' }}>
                회원가입 후 즉시 <span style={{ fontWeight: '900' }}>판매가능</span>
              </span>
              <span style={{ margin: '1rem auto 5rem auto', fontSize: '18px', marginBottom: '5rem' }}>
                빠른 판매를 원하시는 판매자님은 회원가입만 하시면 계약서 작성 전에도 판매가 가능합니다.
              </span>
              <img src="/asapmall-demo/img_join_p.png" style={{ maxWidth: '673px', margin: '0 auto' }} />
              {/*<div style={{ width: '350px', height: '70px', background: '#515B66', color: 'white', margin: '5rem auto', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                가입안내 자세히보기
              </div>*/}
            </Main>
            <Main style={{ width: '100%', margin: '0 auto', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: '100%', background: '#EEE', padding: '120px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
                  <span style={{ fontSize: '40px', color: '#515B66', letterSpacing: '-5px', wordSpacing: '5px', margin: '0 auto' }}>
                    에이삽몰 <span style={{ fontWeight: '900' }}>장점</span>
                  </span>
                  <span style={{ margin: '1rem auto 5rem auto', fontSize: '18px', marginBottom: '5rem' }}>
                    다양하고 스마트한 장점으로 시간과 매출을 동시에 잡아보세요.
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', backgroundImage: `url(${banner[0]})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: '', textAlign: 'right' }}>
                  <div style={{ width: '60%', background: 'rgba(238, 238, 238, 0.8)', padding: '120px' }}>
                    <span style={{ fontSize: '40px', color: '#515B66', letterSpacing: '-5px', wordSpacing: '5px', margin: '0 auto' }}>
                      타사와 같은 기능이지만<br />
                      <span style={{ fontWeight: '900' }}>더욱 똑똑한 서비스</span><br />
                    </span>
                    <span style={{ margin: '1rem auto 5rem auto', fontSize: '18px', marginBottom: '5rem' }}>
                      돌발 상황에 대처할 수 있는 스마트한 서비스를 제공하고<br />
                      다양한 기능과 편리성으로 판매관리를 쉽게 사용하실 수 있습니다.
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', backgroundImage: `url(${banner[1]})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: '', textAlign: 'left' }}>
                  <div style={{ width: '60%', background: 'rgba(238, 238, 238, 0.8)', padding: '120px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '40px', color: '#515B66', letterSpacing: '-5px', wordSpacing: '5px', margin: '0 auto' }}>
                      다수의 판매채널 관리를<br />
                      <span style={{ fontWeight: '900' }}>마스터 아이디로 한 번에 관리</span><br />
                    </span>
                    <span style={{ margin: '1rem auto 5rem auto', fontSize: '18px', marginBottom: '5rem' }}>
                      다수의 판매채널에 상품을 복사해서 등록하실 수 있으며<br />
                      주문, 발주, 정산에 대한 내용을 통합해서 관리하실 수 있습니다.
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', backgroundImage: `url(${banner[2]})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: '', textAlign: 'right' }}>
                  <div style={{ width: '60%', background: 'rgba(238, 238, 238, 0.8)', padding: '120px' }}>
                    <span style={{ fontSize: '40px', color: '#515B66', letterSpacing: '-5px', wordSpacing: '5px', margin: '0 auto' }}>
                      언제 어디서나 자동으로<br />
                      <span style={{ fontWeight: '900' }}>입금확인과 발주서 메일 발송</span><br />
                    </span>
                    <span style={{ margin: '1rem auto 5rem auto', fontSize: '18px', marginBottom: '5rem' }}>
                      무통장입금 알림과 자동발주를 이용하시면<br />
                      시간이 오래 걸리던 업무를 자동으로 처리해 일손을 절약할 수 있습니다.
                    </span>
                  </div>
                </div>
              </div>
            </Main>
            <Main style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '40px', color: '#515B66', letterSpacing: '-5px', wordSpacing: '5px', margin: '0 auto' }}>
                최저 <span style={{ fontWeight: '900' }}>수수료 프로모션</span>
              </span>
              <span style={{ margin: '1rem auto 5rem auto', fontSize: '18px', marginBottom: '5rem' }}>
                에이삽몰은 판매 비용을 줄여드리기 위해<br />
                수수료 인하 프로모션을 수시로 진행합니다.
              </span>
              <img src="/asapmall-demo/main2.png" style={{ maxWidth: '673px', margin: '0 auto' }} />
            </Main>


            <MobileMain style={{ width: '100%', margin: '0 auto', marginTop: '20px', padding: '10px', flexDirection: 'column', justifyContent: 'center', background: '#CED9EA' }}>
              <img src="/asapmall-demo/s1.png" style={{ maxWidth: '200px', margin: '0 auto' }} />
            </MobileMain>
            <MobileMain style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '26px', color: '#515B66', wordSpacing: '5px', margin: '0 auto' }}>
                회원가입 후 즉시 <span style={{ fontWeight: '900' }}>판매가능</span>
              </span>
              <span style={{ margin: '1rem auto 5rem auto', fontSize: '15px', marginBottom: '5rem' }}>
                빠른 판매를 원하시는 판매자님은 회원가입만 하시면 계약서 작성 전에도 판매가 가능합니다.
              </span>
              <img src="/asapmall-demo/img_join_m.png" style={{ maxWidth: '335px', margin: '0 auto' }} />

            </MobileMain>
            <MobileMain style={{ width: '100%', margin: '0 auto', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: '100%', background: '#EEE', padding: '10px', paddingTop: '3rem', textAlign: 'center' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', }}>
                  <span style={{ fontSize: '26px', color: '#515B66', wordSpacing: '5px', margin: '0 auto' }}>
                    에이삽몰 <span style={{ fontWeight: '900' }}>장점</span>
                  </span>
                  <span style={{ margin: '1rem auto 5rem auto', fontSize: '15px', marginBottom: '5rem' }}>
                    다양하고 스마트한 장점으로 시간과 매출을 동시에 잡아보세요.
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', backgroundImage: `url(${banner[0]})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: '', textAlign: 'right' }}>
                  <div style={{ width: '90%', background: 'rgba(238, 238, 238, 0.8)', padding: '10px' }}>
                    <span style={{ fontSize: '20px', color: '#515B66', wordSpacing: '5px', margin: '0 auto' }}>
                      타사와 같은 기능이지만<br />
                      <span style={{ fontWeight: '900' }}>더욱 똑똑한 서비스</span><br />
                    </span>
                    <span style={{ margin: '1rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                      돌발 상황에 대처할 수 있는 스마트한 서비스를<br /> 제공하고
                      다양한 기능과 편리성으로 판매관리를 쉽게 사용하실 수 있습니다.
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', backgroundImage: `url(${banner[1]})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: '', textAlign: 'left' }}>
                  <div style={{ width: '90%', background: 'rgba(238, 238, 238, 0.8)', padding: '10px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '20px', color: '#515B66', wordSpacing: '5px', margin: '0 auto' }}>
                      다수의 판매채널 관리를<br />
                      <span style={{ fontWeight: '900' }}>마스터 아이디로 한 번에 관리</span><br />
                    </span>
                    <span style={{ margin: '1rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                      다수의 판매채널에 상품을 복사해서 등록하실 수<br /> 있으며
                      주문, 발주, 정산에 대한 내용을 통합해서 관리하실 수 있습니다.
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', backgroundImage: `url(${banner[2]})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
                <div style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: '', textAlign: 'right' }}>
                  <div style={{ width: '90%', background: 'rgba(238, 238, 238, 0.8)', padding: '10px' }}>
                    <span style={{ fontSize: '20px', color: '#515B66', wordSpacing: '5px', margin: '0 auto' }}>
                      언제 어디서나 자동으로<br />
                      <span style={{ fontWeight: '900' }}>입금확인과 발주서 메일 발송</span><br />
                    </span>
                    <span style={{ margin: '1rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                      무통장입금 알림과 자동발주를 이용하시면<br />
                      시간이 오래 걸리던 업무를 자동으로 처리해 일손을 절약할 수 있습니다.
                    </span>
                  </div>
                </div>
              </div>
            </MobileMain>
            <MobileMain style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px', paddingTop: '3rem', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '26px', color: '#515B66', wordSpacing: '5px', margin: '0 auto' }}>
                최저 <span style={{ fontWeight: '900' }}>수수료 프로모션</span>
              </span>
              <span style={{ margin: '1rem auto 5rem auto', fontSize: '15px', marginBottom: '5rem' }}>
                에이삽몰은 판매 비용을 줄여드리기 위해<br />
                수수료 인하 프로모션을 수시로 진행합니다.
              </span>
              <img src="/asapmall-demo/main2.png" style={{ maxWidth: '335px', margin: '0 auto' }} />
            </MobileMain>
          </>
        }
        {
          tab == 1 &&
          <>
            <MobileMain style={{ marginTop: '150px', }}>
              <Row style={{ justifyContent: 'center', width: '100%' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(1); handleClick(); }}>
                  에이삽몰이란
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(2); handleClick(); }}>
                  주요기능
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(3); handleClick(); }}>
                  가입안내
                </div>
              </Row>
            </MobileMain>
            <Main style={{ width: '100%', margin: '0 auto', marginTop: '120px', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: '100%', padding: '120px', textAlign: 'center' }}>
                <img src="/asapmall-demo/s2.png" style={{ maxWidth: '400px', margin: '0 auto', marginBottom: '3rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '5rem' }}>
                  다양한 SNS에서 별도의 쇼핑몰을 만들지 않아도<br />
                  주문서와 배송관리를 사용할 수 있는 특별한 결제 서비스입니다.
                </span>
                <Row style={{ margin: '2rem auto', justifyContent: 'center' }}>
                  <img src="/asapmall-demo/img_partner01.gif" style={{ margin: '1rem', }} />
                  <img src="/asapmall-demo/img_partner02.gif" style={{ margin: '1rem', }} />
                  <img src="/asapmall-demo/img_partner03.gif" style={{ margin: '1rem', }} />
                  <img src="/asapmall-demo/img_partner04.gif" style={{ margin: '1rem', }} />
                  <img src="/asapmall-demo/img_partner05.gif" style={{ margin: '1rem', }} />
                  <img src="/asapmall-demo/img_partner06.gif" style={{ margin: '1rem', }} />
                  <img src="/asapmall-demo/img_partner07.gif" style={{ margin: '1rem', }} />
                </Row>
                <img src="/asapmall-demo/s3.png" style={{ maxWidth: '500px', margin: '0 auto', marginBottom: '3rem' }} />
              </div>
              <div style={{ width: '100%', padding: '120px', textAlign: 'center', background: '#EEE' }}>
                <img src="/asapmall-demo/img_tit04.png" style={{ maxWidth: '400px', margin: '0 auto', marginBottom: '3rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '5rem' }}>
                  쇼핑몰도 만들어 주시나요? 미니쇼핑몰이 무엇인가요?<br />
                </span>
                <Row style={{ margin: '2rem auto', justifyContent: 'center' }}>
                  <img src="/asapmall-demo/s4.png" style={{ margin: '1rem', }} />
                  <img src="/asapmall-demo/s5.png" style={{ margin: '1rem', }} />
                </Row>
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '5rem' }}>
                  인스타그램, 카카오스토리 등 SNS와 비슷한 디자인으로<br />
                  나만의 판매공간을 제공합니다.
                </span>
              </div>
              <div style={{ width: '100%', padding: '120px', textAlign: 'center', }}>
                <img src="/asapmall-demo/img_tit05.png" style={{ maxWidth: '400px', margin: '0 auto', marginBottom: '3rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '5rem' }}>
                  이렇게 좋은 서비스이면 비싸지 않은 가요?
                </span>
                <Row style={{ margin: '2rem auto', justifyContent: 'center' }}>
                  <img src="/asapmall-demo/s6.png" style={{ margin: '1rem', }} />
                </Row>
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '5rem' }}>
                  그렇지 않습니다! 저희는 항상 판매자님들의 고충을 생각합니다!<br />
                  가입비 면제, 타업체 대비 낮은 판매수수료로 SNS판매에 대한 부담을 덜어드리고 있습니다.
                </span>
              </div>
            </Main>



            <MobileMain style={{ width: '100%', margin: '0 auto', marginTop: '80px', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: '100%', padding: '10px', textAlign: 'center' }}>
                <img src="/asapmall-demo/s2.png" style={{ maxWidth: '200px', margin: '2rem auto', marginBottom: '3rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  다양한 SNS에서 별도의 쇼핑몰을 만들지 않아도<br />
                  주문서와 배송관리를 사용할 수 있는 특별한 결제 서비스입니다.
                </span>
                <img src="/asapmall-demo/s3.png" style={{ maxWidth: '300px', margin: '2rem auto', marginBottom: '3rem' }} />
              </div>
              <div style={{ width: '100%', padding: '10px', textAlign: 'center', background: '#EEE' }}>
                <img src="/asapmall-demo/img_tit04.png" style={{ maxWidth: '200px', margin: '2rem auto', marginBottom: '3rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  쇼핑몰도 만들어 주시나요? 미니쇼핑몰이 무엇인가요?<br />
                </span>
                <Row style={{ margin: '2rem auto', justifyContent: 'center' }}>
                  <img src="/asapmall-demo/s4.png" style={{ margin: '1rem', width: '40%' }} />
                  <img src="/asapmall-demo/s5.png" style={{ margin: '1rem', width: '40%' }} />
                </Row>
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  인스타그램, 카카오스토리 등 SNS와 비슷한 디자인으로<br />
                  나만의 판매공간을 제공합니다.
                </span>
              </div>
              <div style={{ width: '100%', padding: '10px', textAlign: 'center', }}>
                <img src="/asapmall-demo/img_tit05.png" style={{ maxWidth: '200px', margin: '2rem auto', marginBottom: '3rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  이렇게 좋은 서비스이면 비싸지 않은 가요?
                </span>
                <Row style={{ margin: '2rem auto', justifyContent: 'center' }}>
                  <img src="/asapmall-demo/s6.png" style={{ margin: '1rem', }} />
                </Row>
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  그렇지 않습니다! 저희는 항상 판매자님들의 고충을 생각합니다!<br />
                  가입비 면제, 타업체 대비 낮은 판매수수료로 SNS판매에 대한 부담을 덜어드리고 있습니다.
                </span>
              </div>
            </MobileMain>
          </>
        }
        {
          tab == 2 &&
          <>
            <MobileMain style={{ marginTop: '150px', }}>
              <Row style={{ justifyContent: 'center', width: '100%' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(1); handleClick(); }}>
                  에이삽몰이란
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(2); handleClick(); }}>
                  주요기능
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(3); handleClick(); }}>
                  가입안내
                </div>
              </Row>
            </MobileMain>
            <Main style={{ width: '100%', margin: '0 auto', paddingTop: '180px', flexDirection: 'column', justifyContent: 'center', }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                {'< 매출 / 통계 >'}
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                차원이 다른 업계 최초 3일 정산, 에이삽몰
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                구매확정 기간 없이 고객 결제일 +3일이면 정산 완료!
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                ※ 정산일은 영업일 기준이며 정산일이 비영업일이면, 다음 영업일에 정산됩니다.
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                에이삽몰 정산 프로세스
              </span>
              <img src="/asapmall-demo/adjustment_01.png" style={{ maxWidth: '600px', margin: '0 auto' }} />
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                안전한 지급대행 서비스로 정해진 일자에 입금완료!
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                차원이 다른 업계 최초 3일 정산, 에이삽몰
              </span>
              <img src="/asapmall-demo/adjustment_03.png" style={{ maxWidth: '1200px', margin: '2rem auto' }} />
              <img src="/asapmall-demo/adjustment_04.png" style={{ maxWidth: '1200px', margin: '2rem auto' }} />
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_account_f01.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  매출 리스트<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    판매상품의 결제수단별/기간별 매출을 리스트로 확인가능하고 검색 또한 가능합니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_account_f02.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  일별/월별 통계<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    주문 데이터를 수집 후 일별/월별로 구분해 통계자료를 확인하실 수 있습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_account_f03.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  상품별 통계<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    판매기간을 기준으로 상품의 최대/최소 판매 여부를 확인해 향후 상품 판매계획에 활용할 수 있습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_account_f04.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  판매처 별 통계<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    어떤 계정의 매출이 가장 높은지 확인 가능하며, 분석된 데이터를 토대로 향후 판매계획을 세울 수 있습니다.
                  </span>
                </span>
              </Row>
            </Main>
            <Main style={{ width: '100%', margin: '0 auto', marginTop: '80px', padding: '120px', flexDirection: 'column', justifyContent: 'center', }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                {'< 주문관리 >'}
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                구매자의 주문상품 내역, 세부정보, 주문상태, 송장번호 등을 효율적으로 관리합니다.
              </span>

              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_feature01.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  주문상품 항목별 확인 및 현황파악<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    전체, 입금확인 중, 신규주문 등 항목별로 정리된 리스트로 확인 가능하여 다음 프로세스로 진행하기 쉽습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_feature02.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  쉽고 빠르게 상품명 검색하기<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    에이삽몰만의 기술인 자연어 검색과 코드번호 검색을 통해 초고속 검색이 가능합니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_feature03.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  주문상태 변경하기<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    입금내역이나 결제완료 확인 후 주문상태를 변경하여 구매자가 처리상태를 확인할 수 있습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_feature04.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  옵션 설정하여 엑셀 다운받기<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    환경설정에서 원하는 엑셀옵션을 설정하면 주문관리에서 설정옵션으로 다운로드가 가능합니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_feature05.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  상품별로 송장번호 일괄등록<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    다운받은 엑셀에 송장번호를 입력하고 송장일괄등록을 통해 파일을 업로드하면 선택한 리스트의 송장등록이 완료됩니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_feature06.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  은행거래내역 기반 무통장입금확인<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    은행거래내역 정보로 무통장 입금된 내역을 리스트 업 해주어 관리가 쉬워집니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_feature07.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  현금영수증 발행 및 관리<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    발행버튼 하나로 현금영수증을 발행하고 관리 상태에 따라 리스트를 확인할 수 있습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_feature08.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                  세금계산서 발행 및 관리<br />
                  <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                    상태변경을 통해 세금계산서를 신청하고 처리상태에 따라 리스트를 확인할 수 있습니다
                  </span>
                </span>
              </Row>
            </Main>

            <Main style={{ width: '100%', margin: '0 auto', marginTop: '80px', padding: '120px', flexDirection: 'column', justifyContent: 'center', }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                {'< 자동메시지 관리 >'}
              </span>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_list_auto01.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>

                  1. SMS발신번호
                  지정 및 충전

                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_list_auto02.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>

                  2. 배송상태 별
                  SMS/알림톡 입력

                </span>
              </Row>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_list_auto03.gif" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>

                  3. 주문상품 배송상태
                  변경 시 SMS/알림톡
                  자동발송

                </span>
              </Row>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                알림톡 알림서비스
              </span>
              <Row style={{ margin: '2rem auto', }}>
                <img src="/asapmall-demo/img_info_message01.jpg" style={{ margin: '0 auto', marginRight: '1rem' }} />
                <img src="/asapmall-demo/img_message_tb.gif" style={{ margin: 'auto', marginRight: '1rem', maxHeight: '200px' }} />
              </Row>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                단문/장문 메시지 어떤 종류든 저렴한 비용<br />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  무통장입금, 주문완료, 입금확인, 상품배송, 주문취소에 대한
                  내용을 카카오톡 알림톡을 이용하여 손쉽게 발송 가능합니다.<br />
                  카카오톡 알림톡을 이용할 경우 장문메시지(1000자 이내)에도
                  추가차감 없이 보유충전건수에서 1건만 차감됩니다.
                </span>
              </span>
            </Main>
            <Main style={{ width: '100%', margin: '0 auto', marginTop: '80px', padding: '120px', flexDirection: 'column', justifyContent: 'center', }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                {'< 무통장입금 확인 >'}
              </span>
              <Row style={{ margin: '2rem auto', }}>
                <img src="/asapmall-demo/s02.png" style={{ margin: '0 auto', }} />
              </Row>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', textAlign: 'center' }}>
                1. 무통장입금 결제<br />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  구매자가 무통장입금을 통해 구매 시 입금계좌로 주문금액을 입금합니다.
                </span>
              </span>
              <Row style={{ margin: '2rem auto', }}>
                <img src="/asapmall-demo/s03.png" style={{ margin: '0 auto', }} />
              </Row>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', textAlign: 'center' }}>
                2. 입금문자 매칭
                <br />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  입금된 계좌의 해당 은행으로부터 전달받은 입금정보와 주문정보를 자동으로 매칭합니다.
                </span>
              </span>
              <Row style={{ margin: '2rem auto', }}>
                <img src="/asapmall-demo/s03.png" style={{ margin: '0 auto', }} />
              </Row>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', textAlign: 'center' }}>
                3. 무통장입금 확인<br />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  매칭된 주문건의 주문상태를 입금확인 처리합니다.
                </span>
              </span>
              <span style={{ margin: '5rem auto', fontSize: '25px', marginBottom: '1rem', textAlign: 'center' }}>
                지원 가능 은행
              </span>
              <Row style={{ margin: '2rem auto', flexWrap: 'wrap', maxWidth: '700px', justifyContent: 'center', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_bank_kb.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_ibk.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_nh.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_hana.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_sh.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_woo.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc01.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc02.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc03.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc04.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc06.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc07.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc08.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc09.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc10.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc11.gif" style={{ margin: '2rem', height: 'fit-content' }} />
              </Row>
            </Main>


            <MobileMain style={{ width: '100%', margin: '0 auto', marginTop: '80px', padding: '10px', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                {'< 매출 / 통계 >'}
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                차원이 다른 업계 최초 3일 정산, 에이삽몰
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '1rem' }}>
                구매확정 기간 없이 고객 결제일 +3일이면 정산 완료!
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '10px', marginBottom: '5rem' }}>
                ※ 정산일은 영업일 기준이며 정산일이 비영업일이면, 다음 영업일에 정산됩니다.
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                에이삽몰 정산 프로세스
              </span>
              <img src="/asapmall-demo/adjustment_01.png" style={{ maxWidth: '300px', margin: '0 auto' }} />
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '1rem' }}>
                안전한 지급대행 서비스로 정해진 일자에 입금완료!
              </span>
              <img src="/asapmall-demo/adjustment_03_m.png" style={{ maxWidth: '300px', margin: '2rem auto' }} />
              <img src="/asapmall-demo/adjustment_04_m.png" style={{ maxWidth: '300px', margin: '2rem auto' }} />
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_account_f01.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  매출 리스트<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    판매상품의 결제수단별/기간별 매출을 리스트로 확인가능하고 검색 또한 가능합니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_account_f02.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  일별/월별 통계<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    주문 데이터를 수집 후 일별/월별로 구분해 통계자료를 확인하실 수 있습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_account_f03.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  상품별 통계<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    판매기간을 기준으로 상품의 최대/최소 판매 여부를 확인해 향후 상품 판매계획에 활용할 수 있습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_account_f04.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  판매처 별 통계<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    어떤 계정의 매출이 가장 높은지 확인 가능하며, 분석된 데이터를 토대로 향후 판매계획을 세울 수 있습니다.
                  </span>
                </span>
              </Row>
            </MobileMain>
            <MobileMain style={{ width: '100%', margin: '0 auto', marginTop: '80px', padding: '10px', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                {'< 주문관리 >'}
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '18px', marginBottom: '1rem' }}>
                구매자의 주문상품 내역, 세부정보, 주문상태, 송장번호 등을 효율적으로 관리합니다.
              </span>

              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_feature01.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  주문상품 항목별 확인 및 현황파악<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    전체, 입금확인 중, 신규주문 등 항목별로 정리된 리스트로 확인 가능하여 다음 프로세스로 진행하기 쉽습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_feature02.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  쉽고 빠르게 상품명 검색하기<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    에이삽몰만의 기술인 자연어 검색과 코드번호 검색을 통해 초고속 검색이 가능합니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_feature03.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  주문상태 변경하기<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    입금내역이나 결제완료 확인 후 주문상태를 변경하여 구매자가 처리상태를 확인할 수 있습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_feature04.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  옵션 설정하여 엑셀 다운받기<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    환경설정에서 원하는 엑셀옵션을 설정하면 주문관리에서 설정옵션으로 다운로드가 가능합니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_feature05.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  상품별로 송장번호 일괄등록<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    다운받은 엑셀에 송장번호를 입력하고 송장일괄등록을 통해 파일을 업로드하면 선택한 리스트의 송장등록이 완료됩니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_feature06.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  은행거래내역 기반 무통장입금확인<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    은행거래내역 정보로 무통장 입금된 내역을 리스트 업 해주어 관리가 쉬워집니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_feature07.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  현금영수증 발행 및 관리<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    발행버튼 하나로 현금영수증을 발행하고 관리 상태에 따라 리스트를 확인할 수 있습니다.
                  </span>
                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_feature08.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>
                  세금계산서 발행 및 관리<br />
                  <span style={{ fontSize: '14px', marginBottom: '5rem' }}>
                    상태변경을 통해 세금계산서를 신청하고 처리상태에 따라 리스트를 확인할 수 있습니다
                  </span>
                </span>
              </Row>
            </MobileMain>

            <MobileMain style={{ width: '100%', margin: '0 auto', marginTop: '80px', padding: '10px', flexDirection: 'column', justifyContent: 'center', }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                {'< 자동메시지 관리 >'}
              </span>
              <Row style={{ margin: '2rem auto', alignItems: 'center', marginLeft: '0' }}>
                <img src="/asapmall-demo/img_list_auto01.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>

                  1. SMS발신번호
                  지정 및 충전

                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center', marginLeft: '0' }}>
                <img src="/asapmall-demo/img_list_auto02.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '18px', marginBottom: '1rem' }}>

                  2. 배송상태 별
                  SMS/알림톡 입력

                </span>
              </Row>
              <Row style={{ margin: '2rem auto', alignItems: 'center', marginLeft: '0' }}>
                <img src="/asapmall-demo/img_list_auto03.gif" style={{ margin: '0 auto', marginRight: '1rem', maxHeight: '100px' }} />
                <span style={{ fontSize: '18px', marginBottom: '1rem' }}>

                  3. 주문상품 배송상태
                  변경 시 SMS/알림톡
                  자동발송

                </span>
              </Row>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                알림톡 알림서비스
              </span>
              <Row style={{ margin: '2rem auto', marginLeft: '20%' }}>
                <img src="/asapmall-demo/img_info_message01.jpg" style={{ margin: '0 auto', marginRight: '1rem' }} />

              </Row>
              <img src="/asapmall-demo/img_message_tb.gif" style={{ margin: 'auto', marginRight: '1rem', maxHeight: '200px' }} />
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '18px', marginBottom: '1rem' }}>
                단문/장문 메시지 어떤 종류든 저렴한 비용<br />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  무통장입금, 주문완료, 입금확인, 상품배송, 주문취소에 대한
                  내용을 카카오톡 알림톡을 이용하여 손쉽게 발송 가능합니다.<br />
                  카카오톡 알림톡을 이용할 경우 장문메시지(1000자 이내)에도
                  추가차감 없이 보유충전건수에서 1건만 차감됩니다.
                </span>
              </span>
            </MobileMain>

            <MobileMain style={{ width: '100%', margin: '0 auto', marginTop: '80px', padding: '10px', flexDirection: 'column', justifyContent: 'center', }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                {'< 무통장입금 확인 >'}
              </span>
              <Row style={{ margin: '2rem auto', }}>
                <img src="/asapmall-demo/s02.png" style={{ margin: '0 auto', }} />
              </Row>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '18px', marginBottom: '1rem', textAlign: 'center' }}>
                1. 무통장입금 결제<br />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  구매자가 무통장입금을 통해 구매 시 입금계좌로 주문금액을 입금합니다.
                </span>
              </span>
              <Row style={{ margin: '2rem auto', }}>
                <img src="/asapmall-demo/s03.png" style={{ margin: '0 auto', }} />
              </Row>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '18px', marginBottom: '1rem', textAlign: 'center' }}>
                2. 입금문자 매칭
                <br />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  입금된 계좌의 해당 은행으로부터 전달받은 입금정보와 주문정보를 자동으로 매칭합니다.
                </span>
              </span>
              <Row style={{ margin: '2rem auto', }}>
                <img src="/asapmall-demo/s03.png" style={{ margin: '0 auto', }} />
              </Row>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '18px', marginBottom: '1rem', textAlign: 'center' }}>
                3. 무통장입금 확인<br />
                <span style={{ margin: '2rem auto 5rem auto', fontSize: '14px', marginBottom: '5rem' }}>
                  매칭된 주문건의 주문상태를 입금확인 처리합니다.
                </span>
              </span>
              <span style={{ margin: '5rem auto', fontSize: '25px', marginBottom: '1rem', textAlign: 'center' }}>
                지원 가능 은행
              </span>
              <Row style={{ margin: '2rem auto', flexWrap: 'wrap', maxWidth: '700px', justifyContent: 'center', alignItems: 'center' }}>
                <img src="/asapmall-demo/img_bank_kb.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_ibk.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_nh.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_hana.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_sh.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_woo.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc01.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc02.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc03.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc04.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc06.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc07.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc08.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc09.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc10.gif" style={{ margin: '2rem', height: 'fit-content' }} />
                <img src="/asapmall-demo/img_bank_etc11.gif" style={{ margin: '2rem', height: 'fit-content' }} />
              </Row>
            </MobileMain>
          </>
        }
        {
          tab == 3 &&
          <>
            <MobileMain style={{ marginTop: '150px', }}>
              <Row style={{ justifyContent: 'center', width: '100%' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(1); handleClick(); }}>
                  에이삽몰이란
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(2); handleClick(); }}>
                  주요기능
                </div>
                <div style={{ fontSize: '15px', fontWeight: '600', margin: 'auto 1rem', cursor: 'pointer' }} onClick={() => { setTab(3); handleClick(); }}>
                  가입안내
                </div>
              </Row>
            </MobileMain>
            <Main style={{ width: '100%', margin: '0 auto', padding: '120px', flexDirection: 'column', justifyContent: 'center', }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                {'< 에이삽몰 가입절차 및 서류안내 >'}
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                개인사업자 필요서류
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                1. 사업자등록증 사본 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                2. 대표자 명의 통장 사본(정산계좌용) 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                3. (외국인 대표일 경우)외국인등록증 사본 1부
              </span>

              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                법인사업자 필요서류
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                1. 법인 등기부등본 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                2. 법인 인감 증명서 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                3. 사업자등록증 사본 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem' }}>
                4. 법인 통장 사본 1부
              </span>

              <span style={{ margin: '2rem auto 5rem auto', fontSize: '40px', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '-5px', wordSpacing: '7px' }}>
                가입절차
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', textAlign: 'center' }}>
                1. 기본정보 전달<br />
                {'사업자등록증 사본 전달 -> 대표자 명의 통장 사본 / 법인 통장 사본 전달'}
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', textAlign: 'center' }}>
                2. 계약서 작성<br />
                계약서 작성 후 대표자 명의 휴대폰/이메일로 전자계약서 발송
              </span>

            </Main>


            <MobileMain style={{ width: '100%', margin: '0 auto', marginTop: '80px', padding: '10px', flexDirection: 'column', justifyContent: 'center', }}>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '20px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                {'< 에이삽몰 가입절차 및 서류안내 >'}
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                개인사업자 필요서류
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '16px', marginBottom: '1rem' }}>
                1. 사업자등록증 사본 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '16px', marginBottom: '1rem' }}>
                2. 대표자 명의 통장 사본(정산계좌용) 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '16px', marginBottom: '1rem' }}>
                3. (외국인 대표일 경우)외국인등록증 사본 1부
              </span>

              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                법인사업자 필요서류
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '16px', marginBottom: '1rem' }}>
                1. 법인 등기부등본 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '16px', marginBottom: '1rem' }}>
                2. 법인 인감 증명서 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '16px', marginBottom: '1rem' }}>
                3. 사업자등록증 사본 1부
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '16px', marginBottom: '1rem' }}>
                4. 법인 통장 사본 1부
              </span>

              <span style={{ margin: '2rem auto 5rem auto', fontSize: '25px', marginBottom: '1rem', fontWeight: 'bold', wordSpacing: '7px' }}>
                가입절차
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '16px', marginBottom: '1rem', textAlign: 'center' }}>
                1. 기본정보 전달<br />
                {'사업자등록증 사본 전달 -> 대표자 명의 통장 사본 / 법인 통장 사본 전달'}
              </span>
              <span style={{ margin: '2rem auto 5rem auto', fontSize: '16px', marginBottom: '1rem', textAlign: 'center' }}>
                2. 계약서 작성<br />
                계약서 작성 후 대표자 명의 휴대폰/이메일로 전자계약서 발송
              </span>

            </MobileMain>
          </>
        }
      </Wrappers>
    </>
  )
}
export default HomeDemo