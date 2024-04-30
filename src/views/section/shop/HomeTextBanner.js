import Slider from 'react-slick'
import styled from 'styled-components'
import { Col, Row } from 'src/components/elements/styled-components'
import _ from 'lodash'
import { useRouter } from 'next/router'

const Wrappers = styled.div`
  width:90%;
  max-width: ${props => props.type == 1 ? '1140px' : '1400px'};
  margin:0 auto;
  font-family: ${props => props.type == 1 ? 'Playfair Display' : ''};
  font-size: ${props => props.type == 1 ? '14px' : ''};
  @media (max-width:1200px) {
    font-size: ${props => props.type == 1 ? '10px' : ''};
  }
  
  `

const TextCover = styled.div`
display:flex;
margin:0 auto;
align-items: center;

`

const Texts = styled.div`
align-items: center;
white-space: nowrap;
width:fit-content;
cursor:pointer;
font-size:170%;
@media screen and (max-width:650px) {
    font-size:130%;
}
@media screen and (max-width:500px) {
    font-size:120%;
}
@media screen and (max-width:450px) {
    font-size:100%;
}
@media screen and (max-width:450px) {
    font-size:80%;
}

`

const HomeTextBanner = (props) => {
    const { column, data, func, is_manager, demoType } = props;
    const { style } = column;
    const router = useRouter()
    const getSlideToShow = () => {
        let list_length = (column?.list ?? [])?.length;
        if (demoType != 1) {
            if (window.innerWidth > 1350) {
                if (list_length >= 7) {
                    return 7
                } else {
                    return list_length
                }
            }
            if (window.innerWidth > 1000) {
                if (list_length >= 5) {
                    return 5
                } else {
                    return list_length
                }
    
            }
            if (list_length >= 3) {
                return 3
            } else {
                return list_length
            }
        } else if (demoType == 1) {
            return list_length
        } 
    }
    const getBannerWidth = () => {
        if (window.innerWidth > 1350) {
            return parseInt(1350 / getSlideToShow()) - 48
        }
        return parseInt(window.innerWidth / getSlideToShow()) - 48
    }
    let slide_setting = {
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2500,
        slidesToShow: getSlideToShow(),
        slidesToScroll: 1,
        dots: false,
    }
    return (
        <>
            <Wrappers style={{ marginTop: `${style?.margin_top}px`, maxWidth: `${router}` }} type={demoType}>
            <Row>
                    {column?.list && (column?.list ?? []).map((item, idx) => (
                        <>
                                <TextCover>
                                    <Texts 
                                    onClick={() => {
                                        if (item?.link && !is_manager) {
                                            window.location.href = item?.link;
                                        }
                                    }}
                                    >
                                        {item.title}
                                        </Texts>
                                </TextCover>
                        </>
                    ))}
                    </Row>
            </Wrappers>
        </>
    )
}
export default HomeTextBanner;