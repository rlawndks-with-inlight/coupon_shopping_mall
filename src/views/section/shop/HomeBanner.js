import { Icon } from '@iconify/react'
import Slider from 'react-slick'
import styled from 'styled-components'
import _ from 'lodash'
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
const BannerImg = styled.img`
  width: 80vw;
  height: 34vw;
  @media (max-width:1200px) {
      width: 100vw;
      height: 42.5vw;
  }
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

const HomeBanner = (props) => {
    const { column, data, func } = props;
    let { windowWidth } = data;
    let img_list = [...column?.list];
    let slide_setting = {
        centerMode: true,
        centerPadding: (img_list.length >= 3 ? (windowWidth > 1200 ? '10%' : 0) : 0), // 이미지 간격을 조절할 수 있는 값입니다.
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2500,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        nextArrow: <NextArrow onClick />,
        prevArrow: <PrevArrow onClick />,
    }
    return (
        <>
            <FullWrappers>
                <Slider {...slide_setting}>
                    {img_list.map((item, idx) => (
                        <>
                            <BannerImg src={item?.src} onClick={() => {
                                if (item?.link) {
                                    window.location.href = `${item?.link}`
                                }
                            }} style={{
                                width: `${img_list.length >= 3 ? '' : '100vw'}`
                            }} />
                        </>
                    ))}
                </Slider>
            </FullWrappers>
        </>
    )
}
export default HomeBanner;