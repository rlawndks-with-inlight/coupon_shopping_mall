import { Icon } from '@iconify/react'
import Slider from 'react-slick'
import styled from 'styled-components'
import _ from 'lodash'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { Button } from '@mui/material'
import { varFade } from 'src/components/animate'
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
const BannerImgContainer = styled.div`
width: 100%;
/* 배너는 비율로만 그린다 — 쇼핑몰 쪽 HomeBanner 의 주석 참고.
   예전엔 42.5vw 높이에 min-height:220px · max-height:640px 를 덧씌웠는데,
   그 둘이 걸리면 컨테이너 비율이 이미지와 달라져 cover 가 좌우를 잘라냈다.
   220px 은 폰에서 늘 걸렸다(390px 폭의 자연 높이는 166px 다).
   상한은 높이가 아니라 폭으로 잡는다 — 잘라내지 않으므로 비율이 산다. */
max-width: 1506px;
aspect-ratio: 2000 / 850;
margin: 0 auto;
border-radius:${props => props.img_list_length >= 2 ? '1rem' : '0'};
overflow: hidden;
@media (max-width:840px) {
    border-radius:0;
}
`
const BannerImgContent = styled.div`
width: 100%;
height: 100%;
position: absolute;
top: 0;
left: 0;
display:flex;
position: relative;
/* 배너는 **절대 자르지 않는다**(contain).
   cover 는 컨테이너와 비율이 다른 이미지의 넘치는 만큼을 잘라낸다. 권장 규격(2000x850)을
   지키면 잘림이 없지만, 안 지킨 이미지는 소리 없이 잘려 나갔다 — 문구·로고가 든 배너라면
   그게 그대로 사라진다. 잘린 것은 화면만 봐서는 알 수도 없다.
   비율이 다르면 남는 자리는 여백으로 둔다. 여백은 보기에 아쉬울 뿐이지만 잘림은 손실이다. */
background-size: contain;
background-repeat: no-repeat;
background-position: center center;
/* 줌 브리딩(불안정) 제거 — shop 배너와 동일하게 정적으로. */
animation: none;
`

const TextContainer = styled.div`
display:flex;
flex-direction:column;
position:absolute;
${props => props.textStyle?.pc_style};
top:${props => props.clientHeight / 2 - 58}px;
z-index:10;
row-gap:1rem;
@media (max-width:1200px) {
    top:${props => props.clientHeight / 2 - 28}px;
    ${props => props.textStyle?.mobile_style};
    row-gap:0rem;
}
`
const SlideTitle = styled.div`
font-size:${themeObj.font_size.size1};
font-weight:bold;
color:#fff;
@media (max-width:1200px) {
font-size:${themeObj.font_size.size3};
}
@media (max-width:600px) {
font-size:${themeObj.font_size.size5};
}
`
const SlideSubTitle = styled.div`
font-size:${themeObj.font_size.size3};
color:#fff;
@media (max-width:1200px) {
font-size:${themeObj.font_size.size4};
}
@media (max-width:600px) {
    font-size:${themeObj.font_size.size6};
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
    const { column, data, func, is_manager } = props;
    let { windowWidth } = data;
    const { style } = column;
    let img_list = [...(column?.list ?? [])];
    const [arrowHeight, setArrowHeight] = useState('15vw')
    const imageContainerRef = useRef();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const afterChangeHandler = (currentSlide) => {
        setCurrentSlideIndex(currentSlide);
    };

    let slide_setting = {
        centerMode: true,
        centerPadding: (img_list.length >= 2 ? (windowWidth > 1200 ? '10%' : 0) : 0), // 이미지 간격을 조절할 수 있는 값입니다.
        infinite: true,
        speed: 500,
        autoplay: false,
        autoplaySpeed: 2500,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        nextArrow: <NextArrow onClick sx={{ top: arrowHeight }} />,
        prevArrow: <PrevArrow onClick sx={{ top: arrowHeight }} />,
        afterChange: afterChangeHandler,
    }
    const fadeInUpVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };
    useEffect(() => {
        if (imageContainerRef.current?.clientHeight) {
            setArrowHeight(`${imageContainerRef.current?.clientHeight / 2 - 16}px`)
        }
    }, [imageContainerRef.current])

    const getTextAlign = (item) => {
        let pc_style = `
        left: 8rem;
        align-items:flex-start;
        `;
        let mobile_style = `
        left: 4rem;
        align-items:flex-start;
        transform: translate(0, 0) !important;
        `;
        if (item?.pc_text_align == 'right') {
            pc_style = `
            right: 8rem;
            align-items:end;
            `
        } else if (item?.pc_text_align == 'center') {
            pc_style = `
            left: 50%;
            transform: translate(-50%, 0);
            align-items:center;
            `
        }
        if (item?.mobile_text_align == 'right') {
            mobile_style = `
            right: 4rem !important;
            align-items:end;
            transform: translate(0, 0) !important;
            `
        } else if (item?.mobile_text_align == 'center') {
            mobile_style = `
            left: 50% !important;
            transform: translate(-50%, 0);
            align-items:center;
            `
        }
        return {
            pc_style,
            mobile_style,
        }
    }
    return (
        <>
            <FullWrappers style={{ marginTop: `${style?.margin_top}px` }}
                ref={imageContainerRef}
            >
                <Slider {...slide_setting}>
                    {img_list.map((item, idx) => (
                        <>
                            <BannerImgContainer
                                img_list_length={img_list.length}
                            >

                                <BannerImgContent
                                    iscurrentSlideIndex={currentSlideIndex == idx}
                                    onClick={() => {
                                        if (!is_manager && item?.link) {
                                            window.location.href = item?.link;
                                        }
                                    }}
                                    style={{
                                        
                                        backgroundImage: `url(${item.src})`,
                                        cursor: `${item?.link ? 'pointer' : ''}`
                                    }}
                                >
                                    {currentSlideIndex == idx &&
                                        <>
                                            <TextContainer
                                                textStyle={getTextAlign(item)}
                                                clientHeight={imageContainerRef.current?.clientHeight ?? 0}
                                            >
                                                {item?.title &&

                                                    <m.div
                                                        initial="hidden"
                                                        animate="visible"
                                                        variants={fadeInUpVariants}
                                                    >
                                                        <SlideTitle style={{ color: `${item?.title_color ?? ""}` }}>
                                                            {item?.title}
                                                        </SlideTitle>
                                                    </m.div>
                                                }
                                                {item?.sub_title &&
                                                    <m.div
                                                        initial="hidden"
                                                        animate="visible"
                                                        variants={fadeInUpVariants}>
                                                        <SlideSubTitle style={{ color: `${item?.sub_title_color ?? ""}` }}>
                                                            {item?.sub_title}
                                                        </SlideSubTitle>
                                                    </m.div>
                                                }
                                            </TextContainer>
                                        </>}
                                </BannerImgContent>
                            </BannerImgContainer>

                        </>
                    ))}
                </Slider>
            </FullWrappers>
        </>
    )
}
export default HomeBanner;