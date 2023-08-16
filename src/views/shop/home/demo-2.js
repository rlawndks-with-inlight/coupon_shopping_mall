import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import Slider from 'react-slick'
import { test_items } from 'src/data/test-data'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { themeObj } from 'src/components/elements/styled-components'
import { Item } from 'src/components/elements/shop/common'
import { Skeleton, Stack } from '@mui/material'
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const FullWrappers = styled.div`//배너슬라이드 부분에 사용됨
width:100%;
`
const Wrappers = styled.div` //배너슬라이드 이후 아래 회사 소개와 아이템 부분에 사용됨
width:90%;
max-width:1200px;
margin:0 auto;
`
const returnTypeObj = {

}

const NextArrowStyle = styled.div`//배너슬라이드의 다음 화살표 스타일
display: flex;
position:absolute;
cursor: pointer;//
font-size: 2vw;
background: #99999980; //뒤의 80이 opacity(투명도) 값임
border-radius: 50%;
top: 16vw; //위에서 떨어진 거리 vw는 viewwidth을 기반으로 16%이다
right: 2vw;
width: 3vw;
height: 3vw;
@media (max-width:1200px){//1200px밑으로는 아래의 크기로 고정시킨다
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
}
`

const PrevArrowStyle = styled.div`//배너슬라이드의 이전 화살표 스타일
display: flex;
position:absolute;
cursor: pointer;
z-index: 1;
font-size: 2vw;
background: #99999980; //뒤의 80이 opacity(투명도) 값임
border-radius: 50%;
top: 16vw;
left: 2vw;
width: 3vw;
height: 3vw;
@media (max-width:1200px){//1200px밑으로는 아래의 크기로 고정시킨다
  font-size: 1.5rem;
  top: 13rem;
  left: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
}
`

//메인페이지 박이규
const returnHomeContent = (column, data, func) => {
  let { windowWidth } = data;
  const { router } = func;
  let type = column?.type;
  let content = undefined;

  if (type == 'banner') { //메인페이지 배너 슬라이드
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
    let slide_setting = { //배너 슬라이드 세팅
      1: {
        centerMode: true,
        centerPadding: '10%', // 이미지 간격을 조절할 수 있는 값입니다.
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2500,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true, //슬라이드 가운데 아래에 점 4개 보이게하는거
        nextArrow: <NextArrow onClick />,//질문 onClick 왜 있는거지? 없어도 작동이 되던데
        prevArrow: <PrevArrow />,
      }
    }
    content = <>
      <FullWrappers style={{
        minWidth: '1200px'//화면이 1200이하로 작아져도 글자나 상품이미지가 작아지지 않음
      }}>
        <Slider {...slide_setting[column?.item_type]}>
          {img_list.map((item, idx) => (
            <>
              <img src={item?.src} className={`home-banner-img-type-${column?.item_type}`} />
            </>//메인 배너 슬라이드 이미지를 column에서 가져와서 보여줌?
          ))}
        </Slider>
      </FullWrappers>
    </>
  }
  if (type == 'editor') {//배너 슬라이드 아래 회사 소개 글 부분
    content = <>
      <Wrappers style={{
        width: '1200px',//화면이 1200이하로 작아져도 글자나 상품이미지가 작아지지 않음
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
    let slide_setting = {//아이템 슬라이드 세팅
      1: {
        infinite: true,
        speed: 500,
        autoplay: true,
        autoplaySpeed: 2500,
        slidesToShow: 5,
        slidesToScroll: 1,
        dots: false,
      }
    }
    content = <>
      <Wrappers style={{
        width: '1160px',//화면이 1160이하로 작아져도 글자나 상품이미지가 작아지지 않음
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: `${column?.title ? 'column' : 'row'}`,
      }}>
        {column?.title &&//핫한상품, 멋진상품 스타일 common의 product_name,product_comment을 name,sub_name로 바꿔야 상품 이름과 설명이 나옴
          <>
            <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold' }}>{column?.title}</div>
            {column?.sub_title &&//부제목 스타일
              <>
                <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500] }}>{column?.sub_title}</div>
              </>}
          </>}
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
const Demo2 = (props) => {
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
  const home_content_list = [//메인화면에 출력되는 것들
    {
      type: 'banner', //메인 배너 슬라이드
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
      content: `<h2><span class="ql-size-huge">Company Introduction</span></h2><p><span class="ql-size-large">원하는 디자인으로 쇼핑몰을 개발해 보세요 !</span></p>`,
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
  return (// 스켈레톤은 로딩중인 화면을 보는 사용자 측을 위한 UI
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
        :// 로딩이 끝나면 홈 화면 컨텐츠 리스트에서 가져오기
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
export default Demo2
