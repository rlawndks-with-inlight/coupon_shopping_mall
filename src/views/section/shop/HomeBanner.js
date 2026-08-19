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
// 배너는 **비율로만** 그린다.
//
// 예전엔 높이를 vw 로 잡고 그 위에 최소높이(200px)·최대높이(750px)를 덧씌웠다.
// 그 두 값이 걸리는 순간 컨테이너 비율이 이미지 비율과 달라지고, background-size:cover 라
// 좌우가 잘린다. 특히 최소높이 200px 은 **폰에서 늘 걸렸다** —
//   360px 폭: 자연 높이 153px → 200px 로 늘어남 → 비율 1.80 (권장 2.35) → 좌우 약 25% 잘림
// 2000x850 을 정확히 지켜 올려도 폰에서 잘리는 이유가 이것이었다.
//
// 이제 aspect-ratio 로 비율을 고정한다. 높이는 폭을 따라가므로 어떤 화면에서도 안 깨진다.
// 초광폭에서 배너가 끝없이 커지는 것은 max-width 로 잡는다 — 높이를 자르지 않으므로 비율이 산다.
// (1765px 은 예전 최대높이 750px 이 걸리기 시작하던 폭이다. 보이는 크기를 그대로 유지한다)
const BannerImgContainer = styled.div`
/* 한 장짜리 배너는 꽉 차게 두는 것이 원래 의도였다(테두리 둥글리기도 이때만 끈다).
   예전에는 그걸 안쪽 상자에 width:100vw 로 넣었는데, 바깥은 묶여 있고 안쪽만 늘어나
   넘친 만큼이 잘렸다. 폭은 여기 한 곳에서만 정한다. */
width: ${props => (props.img_list_length < 2 || props.type == 1) ? '100%' : '78vw'};
max-width: ${props => props.type == 1 ? '2000px' : '1765px'};
aspect-ratio: ${props => props.type == 1 ? '2 / 1' : '2000 / 850'};
margin: 0 auto;
border-radius:${props => props.img_list_length >= 2 ? '1rem' : '0'};
overflow: hidden;
@media (max-width:1200px) {
    width: 100vw;
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
/* 여기에 max-width 를 두면 안 된다.
   바깥 상자(BannerImgContainer)가 비율을 정하는데, 안쪽이 그보다 좁아지면
   안쪽 상자의 비율만 달라진다. contain 은 '안쪽 상자' 기준으로 맞추므로
   이미지가 그 좁아진 상자에 맞춰 작아지고 남는 자리가 통째로 여백이 된다.
   실제로 type 1(데모 4·5·6·9)에서 1600px 이 남아 있어,
     바깥 2000x1000 · 안쪽 1600x1000(=1.6:1) · 이미지 2000x1000(=2:1)
   이 되어 이미지가 1600x800 으로 줄고 좌우 200px·아래 200px 이 비었다.
   폭이 1600 미만인 화면에서는 이 값이 안 걸려서 폰에서는 멀쩡해 보였다 —
   그래서 'PC 에서만' 이상한 것으로 나타났다.
   초광폭 제한은 바깥 상자의 max-width 하나로 충분하다. */
margin:0 auto;
/* 줌 브리딩(불안정)만 제거. 맞춤은 데모별 기존 방식 유지: demo-1·2·3=cover(꽉참), demo-4·5·6·9=contain */
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
    const { column, data, func, is_manager, demoType = 0 } = props;
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
    // react-slick(centerMode)은 마운트 시점의 폭으로 슬라이드 가로 위치를 잡는다.
    // 팝업(ReactQuill)·폰트·이미지 등으로 레이아웃이 늦게 확정되면 배너가 어긋난 위치로 고정될 수 있어,
    // 로드가 안정된 뒤 resize를 발생시켜 강제 재측정 → 팝업 유무와 무관하게 항상 올바른 위치로 정렬.
    useEffect(() => {
        const reflow = () => { try { window.dispatchEvent(new Event('resize')) } catch (e) { } }
        reflow()
        const t1 = setTimeout(reflow, 150)
        const t2 = setTimeout(reflow, 600)
        window.addEventListener('load', reflow)
        return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('load', reflow) }
    }, [])

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
                                        // ⚠ 예전에는 배너가 한 장이면 여기에 width:100vw 를 박았다.
                                        //    바깥 상자는 max-width 로 묶여 있는데 안쪽만 화면 폭까지
                                        //    늘어나니, 넘친 만큼이 overflow:hidden 에 잘려 나가고
                                        //    이미지가 한쪽으로 밀렸다. 폭은 바깥 상자가 정한다.
                                        backgroundImage: `url(${item.src})`,
                                        cursor: `${item?.link ? 'pointer' : ''}`,
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