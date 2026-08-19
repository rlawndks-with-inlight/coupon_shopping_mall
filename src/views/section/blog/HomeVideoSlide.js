import { Icon } from '@iconify/react'
import Slider from 'react-slick'
import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import _ from 'lodash'
import { youtubeEmbedId } from 'src/utils/function'

const FullWrappers = styled.div`
  width:100%;
  `

const NextArrowStyle = styled.div`
  position: absolute;
    top: 15vw;
    right: 12px;
    z-index: 2;
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    font-size: 28px;
    border-radius: 50%;
    background: #aaaaaa55;
    color: #fff !important;
    display: flex;
    @media (max-width:1200px) {
      top: 18vw;
      font-size: 1rem;
      width: 1.5rem;
      height: 1.5rem;
    }
  `
const PrevArrowStyle = styled.div`
  position: absolute;
  top: 15vw;
  left: 12px;
  z-index: 2;
  cursor: pointer;
  font-size: 28px;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #aaaaaa55;
  color: #fff !important;
  display: flex;
  @media (max-width:1200px) {
    top: 18vw;
    font-size: 1rem;
    width: 1.5rem;
    height: 1.5rem;
  }
  `

const Iframe = styled.iframe`
  /* 폭을 굳혀 두면 담긴 자리가 그보다 좁을 때 그대로 삐져나온다.
     블로그형 홈은 컬럼이 840px 인데 이 값은 1016px 였고, 줄여 주는 조건이
     @media(화면 1200px)라 1400px 모니터에서는 걸리지도 않았다 — 176px 이 넘쳤다.
     자리에 맞추되 1016px 은 넘지 않는다(넓은 화면에서는 전과 같은 크기다).
     높이는 비율로 따라오게 해서 화면 크기를 볼 일을 없앤다. */
  width: 100%;
  max-width: 1016px;
  aspect-ratio: 1016 / 542;
  height: auto;
  margin: 1rem auto;
  `
const NextArrow = ({ onClick, sx }) => {
    return (
        <NextArrowStyle onClick={onClick} style={{ ...sx }}>
            <Icon style={{ color: '#fff', margin: 'auto' }} icon={'ooui:previous-rtl'} />
        </NextArrowStyle>
    );
};

const PrevArrow = ({ onClick, sx }) => {
    return (
        <PrevArrowStyle onClick={onClick} style={{ ...sx }}>
            <Icon style={{ color: '#fff', margin: 'auto' }} icon={'ooui:previous-ltr'} />
        </PrevArrowStyle>
    );
};
const HomeVideoSlide = (props) => {
    const { column, data, func, is_manager } = props;
    const { style } = column;

    let slide_setting = {
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2500,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        nextArrow: <NextArrow onClick sx={{ top: window.innerWidth > 1200 ? '200px' : '15vw' }} />,
        prevArrow: <PrevArrow onClick sx={{ top: window.innerWidth > 1200 ? '200px' : '15vw' }} />,
    }
    return (
        <>
            <FullWrappers style={{
                height: window.innerWidth > 1200 ? '600px' : '50vw',
                backgroundImage: `url(${column?.src})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'fixed',
                display: 'flex',
                flexDirection: 'column',
                margin: `0 auto`,
                backgroundAttachment: 'fixed',
                marginTop:`${style?.margin_top}px`
            }}>

                <Row style={{ flexDirection: 'column', margin: '1rem auto 0 auto', alignItems: 'center' }}>
                    {column?.title &&
                        <>
                            <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold', color: '#fff' }}>{column?.title}</div>
                            {column?.sub_title &&
                                <>
                                    <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[300] }}>{column?.sub_title}</div>
                                </>}
                        </>}
                </Row>
                <Slider {...slide_setting}>
                    {(column?.list ?? []).map((item, idx) => {
                        // 못 알아보는 주소(빈 값·youtu.be 단축·오타)는 그 항목만 건너뛴다.
                        // 예전엔 여기서 그대로 잘라 쓰다 터졌고, 섹션 하나가 터지면 홈 전체가 백지였다.
                        const link = youtubeEmbedId(item?.link);
                        if (!link) return null;
                        return <>
                            <Row style={{ flexDirection: 'column', }}>
                                <Iframe src={`https://www.youtube.com/embed/${link}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen>
                                </Iframe>
                            </Row>
                        </>
                    })}
                </Slider>
            </FullWrappers>
        </>
    )
}
export default HomeVideoSlide;