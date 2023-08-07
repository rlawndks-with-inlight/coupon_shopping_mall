import Slider from 'react-slick'
import styled from 'styled-components'
import { Row } from 'src/components/elements/styled-components'
import _ from 'lodash'
import { LazyLoadImage } from 'react-lazy-load-image-component'

const Wrappers = styled.div`
  width:90%;
  max-width:1600px;
  margin:0 auto;
  `

const HomeButtonBanner = (props) => {
    const { column, data, func } = props;
    const getSlideToShow = () => {
        if (window.innerWidth > 1350) {
            return 7
        }
        if (window.innerWidth > 1000) {
            return 5
        }
        return 3
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
            <Wrappers style={{
                marginTop: '1rem',
                marginBottom: '1rem',
            }}>
                <Slider {...slide_setting} className='margin-slide'>
                    {column?.list && column?.list.map((item, idx) => (
                        <>
                            <Row style={{ flexDirection: 'column', width: `${getSlideToShow() == 7 ? `${parseInt(1350 / 7) - 8}px` : `${parseInt(window.innerWidth / getSlideToShow()) - 8}px`}`, }}>
                                <LazyLoadImage src={item?.src} style={{
                                    width: `${getSlideToShow() == 7 ? `${parseInt(1350 / 7) - 48}px` : `${parseInt(window.innerWidth / getSlideToShow()) - 48}px`}`,
                                    height: `auto`,
                                    borderRadius: '50%',
                                    margin: '0 auto',
                                    cursor: 'pointer'
                                }}
                                    onClick={() => {
                                        if (item?.link) {
                                            window.location.href = item?.link;
                                        }
                                    }}
                                />
                                <div style={{ margin: '1rem auto', fontWeight: 'bold' }}>{item.title}</div>
                            </Row>
                        </>
                    ))}
                </Slider>
            </Wrappers>
        </>
    )
}
export default HomeButtonBanner;