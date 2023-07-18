import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import Slider from 'react-slick'
import { test_items } from 'src/data/test-data'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Item, Items } from 'src/components/elements/shop/common'
import { Skeleton, Stack } from '@mui/material'
import { SubTitle, Title } from 'src/components/elements/shop/demo-3'
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
const Wrappers = styled.div`
width:90%;
max-width:1500px;
margin:0 auto;
`
const BannerWrappers = styled.div`
width:1920px;
margin:0 auto;
@media (max-width:1920px) {
  width:100%;
}
`
const NoneShowMobile = styled.div`
@media (max-width:1000px) {
  display:none;
}
`
const ShowMobile = styled.div`
display:none;
@media (max-width:1000px) {
  display:block;
}
`
const NextArrowStyle = styled.div`
position: absolute;
  top: 350px;
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
  @media (max-width:1920px) {
    top: 18vw;
    font-size: 1rem;
    width: 1.5rem;
    height: 1.5rem;
  }
  @media (max-width:1000px) {
    display:none;
  }
`
const PrevArrowStyle = styled.div`
position: absolute;
top: 350px;
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
@media (max-width:1920px) {
  top: 18vw;
  font-size: 1rem;
  width: 1.5rem;
  height: 1.5rem;
}
@media (max-width:1000px) {
  display:none;
}
`
const BannerImg = styled.img`
    width: 1920px;
    height: 750px;
    @media (max-width:1920px) {
      width:100vw;
      height:39vw;
    }
`
const BannerDiv = styled.img`
width:100vw;
height:146.8vw;
`
const returnHomeContent = (column, data, func) => {
  let { windowWidth } = data;
  const { router } = func;
  let type = column?.type;
  let content = undefined;

  if (type == 'banner') {
    let img_list = [...column?.list];
    let mobile_img_list = [...column?.mobile_list];
    const NextArrow = ({ onClick }) => {
      return (
        <NextArrowStyle className="nextArrow" onClick={onClick}>
          <Icon style={{ color: '#fff', margin: 'auto' }} icon={'ooui:previous-rtl'} />
        </NextArrowStyle>
      );
    };

    const PrevArrow = ({ onClick }) => {
      return (
        <PrevArrowStyle className="prevArrow" onClick={onClick}>
          <Icon style={{ color: '#fff', margin: 'auto' }} icon={'ooui:previous-ltr'} />
        </PrevArrowStyle>
      );
    };
    let slide_setting = {
      1: {
        centerMode: true,
        centerPadding: 0, // 이미지 간격을 조절할 수 있는 값입니다.
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
    }
    content = <>
      <BannerWrappers>
        <NoneShowMobile>
          <Slider {...slide_setting[column?.item_type]}>
            {img_list.map((item, idx) => (
              <>
                <BannerImg src={item?.src} />
              </>
            ))}
          </Slider>
        </NoneShowMobile>
        <ShowMobile>
          <Slider {...slide_setting[column?.item_type]}>
            {mobile_img_list.map((item, idx) => (
              <>
                <BannerDiv style={{
                  backgroundImage: `url(${item?.src})`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }} />
              </>
            ))}
          </Slider>
        </ShowMobile>
      </BannerWrappers>
    </>
  }
  if (type == 'editor') {
    content = <>
      <Wrappers style={{
        marginTop: '1rem',
        marginBottom: '1rem',
      }}>
        <ReactQuill
          className='none-padding'
          value={column?.content ?? `<body></body>`}
          readOnly={true}
          theme={"bubble"}
          bounds={'.app'}
        />
      </Wrappers>
    </>
  }
  if (type == 'items') {
    let slide_setting = {
      1: {
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2500,
        slidesToShow: (windowWidth > 1350 ? 4 : windowWidth > 1000 ? 3 : windowWidth > 650 ? 2 : 1),
        slidesToScroll: 1,
        dots: false,
      }
    }
    content = <>
      <Wrappers style={{
        marginTop: '2rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: `${column?.title ? 'column' : 'row'}`,
      }}>
        {column?.title &&
          <>
            <Title>{column?.title}</Title>
            {column?.sub_title &&
              <>
                <SubTitle>{column?.sub_title}</SubTitle>
              </>}
          </>}
        <Items router={router} items={column?.list} is_slide={true} />
      </Wrappers>
    </>
  }
  return content
}
const Demo3 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    pageSetting();
  }, [])

  const pageSetting = () => {
    setWindowWidth(window.innerWidth)
    setTimeout(() => {
      setLoading(false);
    }, 500)
  }
  const home_content_list = [
    {
      type: 'banner',
      list: [
        {
          src: '/images/test/banner1.jpg',
          link: ''
        },
        {
          src: '/images/test/banner2.jpg',
          link: ''
        },
        {
          src: '/images/test/banner3.jpg',
          link: ''
        },
      ],
      mobile_list: [
        {
          src: '/images/test/mobile_banner1.jpg',
          link: ''
        },
        {
          src: '/images/test/mobile_banner2.jpg',
          link: ''
        },
        {
          src: '/images/test/mobile_banner3.jpg',
          link: ''
        },
      ],
      item_type: 1,
    },
    {
      type: 'items',
      list: test_items,
      title: 'TREND Pick',
      sub_title: '저스트원이 선택한 주목상품!',
      sort_type: '',
      side_img: '',
      item_slide_auto: true,
      item_type: 1
    },
    {
      type: 'items',
      list: test_items,
      title: 'COOL ITEM',
      sub_title: '다가오는 여름을 위한 선택!',
      sort_type: '',
      side_img: '',
      item_slide_auto: true,
      item_type: 1
    },
    {
      type: 'reviews'
    }
  ];
  const returnHomeContentByColumn = (column) => {
    return returnHomeContent(
      column,
      {
        windowWidth: window.innerWidth
      },
      {
        router
      })
  }
  return (
    <>
      {loading ?
        <>
          <Stack spacing={'1rem'}>
            <Skeleton variant='rectangular' style={{
              height: '40vw'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '1200px',
              width: '90%',
              height: '70vh',
              margin: '1rem auto'
            }} />
          </Stack>
        </>
        :
        <>
          {home_content_list.map((column, idx) => (
            <>
              {returnHomeContentByColumn(column)}
            </>
          ))}
          <div style={{
            marginTop: '5rem'
          }} />
        </>}
    </>
  )
}
export default Demo3
