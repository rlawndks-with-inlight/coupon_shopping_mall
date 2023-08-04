import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import Slider from 'react-slick'
import { test_items } from 'src/data/test-data'
import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Item, Items } from 'src/components/elements/shop/common'
import { Button, Skeleton, Stack } from '@mui/material'
import { useSettingsContext } from 'src/components/settings'
import { getProductsByUser } from 'src/utils/api-shop'
import _ from 'lodash'
import { getLocalStorage } from 'src/utils/local-storage'
import dynamic from 'next/dynamic'
import { LazyLoadImage } from 'react-lazy-load-image-component'
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
  let { windowWidth, themeDnsData, idx, itemsCategory } = data;
  const { router, onClickItemsCategory } = func;
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
      centerMode: true,
      centerPadding: (img_list.length >= 3 ? (windowWidth > 1200 ? '10%' : 0) : 0), // 이미지 간격을 조절할 수 있는 값입니다.
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
    content = <>
      <FullWrappers>
        <Slider {...slide_setting}>
          {img_list.map((item, idx) => (
            <>
              <BannerImg src={item?.src} onClick={() => {
                if (item?.link) {
                  window.location.href = `${item?.link}`
                }
              }} style={{
                width: `${img_list.length >= 3 ? '' : '100vw'}`
              }} />
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
    const getSlideToShow = () => {
      if (window.innerWidth > 1350) {
        if (themeDnsData?.theme_css?.shop_item_card_css?.container?.is_vertical == 1) {
          return 3
        } else {
          return 4
        }
      }
      if (window.innerWidth > 1000) {
        if (themeDnsData?.theme_css?.shop_item_card_css?.container?.is_vertical == 1) {
          return 2
        } else {
          return 3
        }
      }
      if (themeDnsData?.theme_css?.shop_item_card_css?.container?.is_vertical == 1) {
        return 1
      } else {
        return 2
      }
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
        <Slider {...slide_setting} className='margin-slide'>
          {column?.list && column?.list.map((item, idx) => (
            <>
              <Item item={item} router={router} theme_css={themeDnsData?.theme_css?.shop_item_card_css} />
            </>
          ))}
        </Slider>
      </Wrappers>
    </>
  }
  if (type == 'button-banner') {
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
    content = <>
      <Wrappers style={{
        marginTop: '1rem',
        marginBottom: '1rem',
      }}>
        <Slider {...slide_setting} className='margin-slide'>
          {column?.list && column?.list.map((item, idx) => (
            <>
              <Row style={{flexDirection:'column', width:`${getSlideToShow()==7?`${parseInt(1350/7)-8}px`:`${parseInt(window.innerWidth/getSlideToShow())-8}px`}`, }}>
                <LazyLoadImage src={item?.src} style={{
                  width:`${getSlideToShow()==7?`${parseInt(1350/7)-48}px`:`${parseInt(window.innerWidth/getSlideToShow())-48}px`}`,
                  height:`${getSlideToShow()==7?`${parseInt(1350/7)-48}px`:`${parseInt(window.innerWidth/getSlideToShow())-48}px`}`,
                  borderRadius:'50%',
                  margin:'0 auto'
                }} />
                <div style={{margin:'1rem auto'}}>{item.title}</div>
              </Row>
            </>
          ))}
        </Slider>
      </Wrappers>
    </>
  }
  if (type == 'items-with-categories') {
    content = <>
      <Wrappers style={{
        marginTop: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: `${column?.title ? 'column' : 'row'}`,
      }}>
        <Row style={{alignItems:'center'}}>
          <Row style={{flexDirection:'column'}}>
          {column?.title &&
          <>
            <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold' }}>{column?.title}</div>
            {column?.sub_title &&
              <>
                <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500] }}>{column?.sub_title}</div>
              </>}
          </>}
          </Row>
          <Row style={{marginLeft:'auto', columnGap:'0.5rem'}}>
          {column?.list && column?.list.map((item, index) => (
            <>
              <Button variant={itemsCategory[idx] == index?`contained`:`outlined`} sx={{height:'36px'}} onClick={()=>{
                onClickItemsCategory(idx, index);
              }}>
                {item?.category_name}
              </Button>
            </>
          ))}
          </Row>
        </Row>
        <div style={{ marginTop: '1rem' }} />
          {column?.list && column?.list.map((item, index) => (
            <>
            {itemsCategory[idx] == index &&
            <>
              <Items items={item?.list} router={router} />
            </>}
            </>
          ))}
      </Wrappers>
    </>
  }
  if (type == 'video-slide') {
    content = <>

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
  const { themeDnsData } = useSettingsContext();
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const [contentList, setContentList] = useState([]);
  const [itemsCategory, setItemsCategory] = useState({

  })
  useEffect(() => {
    pageSetting();
  }, [])
  useEffect(() => {
    if (contentList.length > 0) {
      setLoading(false);
    }
  }, [contentList])
  const pageSetting = async () => {
    let dns_data = getLocalStorage('dns_data') || themeDnsData;
    if (typeof dns_data == 'string') {
      dns_data = JSON.parse(dns_data);
    }
    let content_list = (dns_data?.main_obj) ?? [];
    let items_category = {};
    let products = await getProductsByUser({
      page: 1,
      page_size: 100000,
    })
    products = products?.content ?? [];
    for (var i = 0; i < content_list.length; i++) {
      if (content_list[i]?.type == 'items') {
        let item_list = content_list[i]?.list ?? [];
        item_list = item_list.map(item_id => {
          return { ..._.find(products, { id: parseInt(item_id) }) }
        })
        content_list[i].list = item_list
      }
      if (content_list[i]?.type == 'items-with-categories') {
        for(var j = 0;j<content_list[i]?.list.length;j++){
          let item_list = content_list[i]?.list[j]?.list;
          item_list = item_list.map(item_id => {
            return { ..._.find(products, { id: parseInt(item_id) }) }
          })
          content_list[i].list[j].list = item_list;
        }
        items_category = ({
            ...items_category,
            [`${i}`]:0          
        })
      }
    }
    console.log(content_list)
    setItemsCategory(items_category)
    setWindowWidth(window.innerWidth)
    setContentList(content_list)
  }

  const returnHomeContentByColumn = (column, idx) => {
    return returnHomeContent(
      column,
      {
        windowWidth: window.innerWidth,
        themeDnsData: themeDnsData,
        idx,
        itemsCategory
      },
      {
        router,
        onClickItemsCategory
      })
  }
  const onClickItemsCategory = (i, j) =>{
    setItemsCategory({
      ...itemsCategory,
      [`${i}`]:j
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
          {contentList && contentList.map((column, idx) => (
            <>
              {returnHomeContentByColumn(column, idx)}
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
