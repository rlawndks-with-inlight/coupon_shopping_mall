import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import Slider from 'react-slick'
import { test_items } from 'src/data/test-data'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css';
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Item } from 'src/components/elements/shop/common'
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
const returnHomeContent = (column, data, func) => {
  let { windowWidth } = data;
  const { router } = func;
  let type = column?.type;
  let content = undefined;

  if (type == 'banner') {
    let img_list = [...column?.list];
    const NextArrow = ({ onClick }) => {
      return (
        <div className="nextArrow" onClick={onClick}>
          <Icon style={{ color: '#fff' }} icon={'ooui:previous-rtl'} />
        </div>
      );
    };

    const PrevArrow = ({ onClick }) => {
      return (
        <div className="prevArrow" onClick={onClick}>
          <Icon style={{ color: '#fff' }} icon={'ooui:previous-ltr'} />
        </div>
      );
    };
    let slide_setting = {
      1: {
        centerMode: true,
        centerPadding: (windowWidth > 1200 ? '10%' : 0), // 이미지 간격을 조절할 수 있는 값입니다.
        infinite: true,
        speed: 500,
        autoplay: false,
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
              <img src={item?.src} className={`home-banner-img-type-${column?.item_type}`} />
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
        <Slider {...slide_setting[column?.item_type]}>
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
          src: 'https://purplevery19.cafe24.com:8443/image/content1/1680157858237-content1.png',
          link: ''
        },
        {
          src: 'https://purplevery19.cafe24.com:8443/image/content2/1680157858272-content2.png',
          link: ''
        },
        {
          src: 'https://purplevery19.cafe24.com:8443/image/content3/1680157858300-content3.png',
          link: ''
        },
        {
          src: 'https://purplevery19.cafe24.com:8443/image/content4/1680157858315-content4.png',
          link: ''
        },
      ],
      item_type: 1,
    },
    {
      type: 'editor',
      content: "<p><img src=\"https://purplevery6.cafe24.com:8443/image/note/1672217758271-note.jpeg\"></p><p><br></p><p><br></p><p><strong>KOSDAQ</strong></p><p><strong>종목명: 하나기술 (299030)</strong></p><p><br></p><p><strong>공시 내용: 단일판매·공급계약 체결</strong></p><p><strong>﻿</strong><img src=\"https://purplevery6.cafe24.com:8443/image/note/1687855566011-note.png\"></p><p><strong>계약금액: 172,364,921,680원</strong></p><p><strong>최근 매출액: 113,857,990,967원</strong></p><p><strong>매출액 대비: 151.39%</strong></p><p><strong>계약기간: 2023.06.26 ~ 2024.06.26</strong></p>",
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
        </>
        :
        <>
          {home_content_list.map((column, idx) => (
            <>
              {returnHomeContentByColumn(column)}
            </>
          ))}
        </>}
    </>
  )
}
export default Demo1
