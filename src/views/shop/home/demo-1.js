import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import Slider from 'react-slick'
import { test_items } from 'src/data/test-data'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Item } from 'src/components/elements/shop/common'
import { Skeleton, Stack } from '@mui/material'
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
const Wrappers = styled.div`
width:90%;
max-width:1200px;
margin:0 auto;
`
const FullWrappers = styled.div`
width:100%;
`
const returnTypeObj = {

}
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
const returnHomeContent = (column, data, func) => {
  let { windowWidth } = data;
  const { router } = func;
  let type = column?.type;
  let content = undefined;

  if (type == 'banner') {
    let img_list = [...column?.list];
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
        centerPadding: (windowWidth > 1200 ? '10%' : 0), // 이미지 간격을 조절할 수 있는 값입니다.
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
      <FullWrappers>
        <Slider {...slide_setting[column?.item_type]}>
          {img_list.map((item, idx) => (
            <>
              <BannerImg src={item?.src} />
            </>
          ))}
        </Slider>
      </FullWrappers>
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
        marginTop: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: `${column?.title ? 'column' : 'row'}`,
      }}>
        {column?.title &&
          <>
            <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold' }}>{column?.title}</div>
            {column?.sub_title &&
              <>
                <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500] }}>{column?.sub_title}</div>
              </>}
          </>}
        <div style={{ marginTop: '1rem' }} />
        <Slider {...slide_setting[column?.item_type]} className='margin-slide'>
          {column?.list && column?.list.map((item, idx) => (
            <>
              <Item item={item} router={router} />
            </>
          ))}
        </Slider>
      </Wrappers>
    </>
  }
  return content
}
const Demo1 = (props) => {
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
          src: '/images/test/1.jpg',
          link: ''
        },
        {
          src: '/images/test/2.jpg',
          link: ''
        },
        {
          src: '/images/test/3.jpg',
          link: ''
        },
        {
          src: '/images/test/4.jpg',
          link: ''
        },
      ],
      item_type: 1,
    },
    {
      type: 'editor',
      content: `<h2><span class="ql-size-huge">What is a Good Interior?</span></h2><h2><span class="ql-size-huge">The Daily Guide to Architecture</span></h2><p><img style="width: 100%;" src="/images/test/3.jpg"></p><h2><span class="ql-size-huge">COMPANY INTRODUCTION</span></h2><p><span class="ql-size-large">원하는 디자인으로 쇼핑몰을 개발해 보세요 !</span></p>`,
    },
    {
      type: 'items',
      list: test_items,
      title: '핫한상품',
      sub_title: '가장 인기있는 상품을 만나 보세요 !',
      sort_type: '',
      side_img: '',
      item_slide_auto: true,
      item_type: 1
    },
    {
      type: 'items',
      list: test_items,
      title: '멋진상품',
      sub_title: '가장 멋있는 상품을 만나 보세요 !',
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
export default Demo1
