import Slider from 'react-slick'
import styled from 'styled-components'
import { Col, Row } from 'src/components/elements/styled-components'
import _ from 'lodash'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useRouter } from 'next/router'

const Wrappers = styled.div`
  width:90%;
  max-width: ${props => props.type == 1 ? '1000px' : '1600px'};
  margin:0 auto;
  font-family: ${props => props.type == 1 ? 'Playfair Display' : ''};
  font-size: ${props => props.type == 1 ? '14px' : ''};
  @media (max-width:1200px) {
    font-size: ${props => props.type == 1 ? '10px' : ''};
  }
  `

const HomeButtonBanner = (props) => {
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
                <Slider {...slide_setting} className='margin-slide'>
                    {column?.list && (column?.list ?? []).map((item, idx) => (
                        <>
                            <Row style={{ flexDirection: 'column',  }}>
                                <div style={{ alignItems: 'center',  }}>
                                    <LazyLoadImage src={item?.src} style={{
                                        width:'100%',
                                        height:'auto',
                                        cursor: 'pointer',
                                    }}
                                        onClick={() => {
                                            if (item?.link && !is_manager) {
                                                window.location.href = item?.link;
                                            }
                                        }}
                                    />
                                    {/*<LazyLoadImage src={item?.src} style={{
                                        width: `${getBannerWidth()}px`,
                                        height: `auto`,
                                        cursor: 'pointer',
                                    }}
                                        onClick={() => {
                                            if (item?.link && !is_manager) {
                                                window.location.href = item?.link;
                                            }
                                        }}
                                    />*/}
                                    <div style={{ fontWeight: 'bold', marginTop: '1rem', textAlign: 'center' }}>{item.title}</div>
                                </div>

                            </Row>
                        </>
                    ))}
                </Slider>
            </Wrappers>
        </>
    )
}
export default HomeButtonBanner;