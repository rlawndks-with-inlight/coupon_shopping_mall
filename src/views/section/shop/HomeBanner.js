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
width: ${props => props.type == 1 ? '100%' : '78vw'};
height: ${props => props.type == 1 ? '50vw' : '33.15vw'};
margin: 0 auto;
border-radius:${props => props.img_list_length >= 2 ? '1rem' : '0'};
overflow: hidden;
@media (max-width:1200px) {
    width: 100vw;
    height: 42.5vw;
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
background-size: contain;
background-repeat: no-repeat;
background-position: center center;
max-width: ${props => props.type == 1 ? '1600px' : ''};
margin:0 auto;
animation: ${props => props.type == 1 ? '' : props => props.iscurrentSlideIndex ? 'zoom-in-out' : ''} 10s ease-in-out infinite;
@keyframes zoom-in-out {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.02);
    }
    100% {
        transform: scale(1);
    }
}

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
    const { column, data, func, is_manager, demoType } = props;
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
                                style={{ minHeight: `${style?.min_height ?? 200}px`, maxHeight: `${style?.max_height ?? 750}px` }}
                                img_list_length={img_list.length}
                                type={demoType}
                            >

                                <BannerImgContent
                                    iscurrentSlideIndex={currentSlideIndex == idx}
                                    type={demoType}
                                    onClick={() => {
                                        if (!is_manager && item?.link) {
                                            window.location.href = item?.link;
                                        }
                                    }}
                                    style={{
                                        width: `${img_list.length >= 2 ? '' : '100vw'}`,
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
                                                        variants={demoType == 0 ? fadeInUpVariants : ''}
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
                                                        variants={demoType == 0 ? fadeInUpVariants : ''}>
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