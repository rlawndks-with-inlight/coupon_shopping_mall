import Slider from 'react-slick'
import styled from 'styled-components'
import { Col, Row } from 'src/components/elements/styled-components'
import _ from 'lodash'
import { LazyLoadImage } from 'react-lazy-load-image-component'

const Wrappers = styled.div`
  width:90%;
  max-width:1600px;
  margin:0 auto;
  `

const HomeButtonBanner = (props) => {
    const { column, data, func, is_manager } = props;
    const { style } = column;
    const getSlideToShow = () => {
        let list_length = column?.list?.length;
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
            <Wrappers style={{ marginTop: `${style?.margin_top}px` }}>
                <Slider {...slide_setting} className='margin-slide'>
                    {column?.list && column?.list.map((item, idx) => (
                        <>
                            <Row style={{ flexDirection: 'column' }}>
                                <Col style={{alignItems:'center'}}>
                                    <LazyLoadImage src={item?.src} style={{
                                        width: `${getBannerWidth()}px`,
                                        height: `auto`,
                                        borderRadius: '50%',
                                        cursor: 'pointer'
                                    }}
                                        onClick={() => {
                                            if (item?.link && !is_manager) {
                                                window.location.href = item?.link;
                                            }
                                        }}
                                    />
                                    <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                                </Col>

                            </Row>
                        </>
                    ))}
                </Slider>
            </Wrappers>
        </>
    )
}
export default HomeButtonBanner;