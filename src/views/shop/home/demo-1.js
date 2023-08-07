import { Icon } from '@iconify/react'
import { useEffect, useState } from 'react'
import Slider from 'react-slick'
import { test_items, test_product_reviews } from 'src/data/test-data'
import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Item, Items } from 'src/components/elements/shop/common'
import { Button, Skeleton, Stack } from '@mui/material'
import { useSettingsContext } from 'src/components/settings'
import { getPostsByUser, getProductReviewsByUser, getProductsByUser } from 'src/utils/api-shop'
import _ from 'lodash'
import { getLocalStorage } from 'src/utils/local-storage'
import dynamic from 'next/dynamic'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import HomeBanner from 'src/views/section/shop/HomeBanner'
import HomeEditor from 'src/views/section/shop/HomeEditor'
import HomeItems from 'src/views/section/shop/HomeItems'
import HomeButtonBanner from 'src/views/section/shop/HomeButtonBanner'
import HomeItemsWithCategories from 'src/views/section/shop/HomeItemsWithCategories'
import HomeVideoSlide from 'src/views/section/shop/HomeVideoSlide'
import HomePost from 'src/views/section/shop/HomePost'
import HomeProductReview from 'src/views/section/shop/HomeProductReview'
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
const Iframe = styled.iframe`
width:1016px;
height:542px;
margin: 1rem auto;
@media (max-width:1200px) {
  width: 85vw;
  height: 45.3vw;
}
`
const returnHomeContent = (column, data, func) => {
  let type = column?.type;
  if (type == 'banner') return <HomeBanner column={column} data={data} func={func} />
  if (type == 'editor') return <HomeEditor column={column} data={data} func={func} />
  if (type == 'items') return <HomeItems column={column} data={data} func={func} />
  if (type == 'button-banner') return <HomeButtonBanner column={column} data={data} func={func} />
  if (type == 'items-with-categories') return <HomeItemsWithCategories column={column} data={data} func={func} />
  if (type == 'video-slide') return <HomeVideoSlide column={column} data={data} func={func} />
  if (type == 'post') return <HomePost column={column} data={data} func={func} />
  if (type == 'product-review') return <HomeProductReview column={column} data={data} func={func} />
  return '';
}
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeDnsData, themePostCategoryList } = useSettingsContext();
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const [contentList, setContentList] = useState([]);
  const [itemsCategory, setItemsCategory] = useState({

  })
  const [posts, setPosts] = useState({});

  useEffect(() => {
    if (themePostCategoryList.length > 0) {
      pageSetting();
    }
  }, [themePostCategoryList])
  useEffect(() => {
    if (contentList.length > 0) {
      setLoading(false);
    }
  }, [contentList])
  const pageSetting = async () => {
    if (contentList.length > 0) {
      return;
    }
    let dns_data = getLocalStorage('dns_data') || themeDnsData;
    if (typeof dns_data == 'string') {
      dns_data = JSON.parse(dns_data);
    }
    let content_list = (dns_data?.main_obj) ?? [];
    // 게시글 불러오기
    let post_list = await getPostsByUser({
      page: 1,
      page_size: 100000,
    })
    post_list = post_list?.content ?? [];
    let post_obj = {};
    for (var i = 0; i < post_list.length; i++) {
      if (!post_obj[post_list[i]?.category_id]) {
        post_obj[post_list[i]?.category_id] = [];
      }
      post_obj[post_list[i]?.category_id].push(post_list[i]);
    }
    setPosts(post_obj);
    // 상품 불러오기
    let items_category = {};
    let products = await getProductsByUser({
      page: 1,
      page_size: 100000,
    })
    products = products?.content ?? [];
    for (var i = 0; i < content_list.length; i++) {
      if (content_list[i]?.type == 'items' && products.length > 0) {
        let item_list = content_list[i]?.list ?? [];
        item_list = item_list.map(item_id => {
          return { ...item_id, ..._.find(products, { id: parseInt(item_id) }) }
        })
        content_list[i].list = item_list
      }
      if (content_list[i]?.type == 'items-with-categories' && products.length > 0) {
        for (var j = 0; j < content_list[i]?.list.length; j++) {
          let item_list = content_list[i]?.list[j]?.list;
          item_list = item_list.map(item_id => {
            return { ...item_id, ..._.find(products, { id: parseInt(item_id) }) }
          })
          content_list[i].list[j].list = item_list;
        }
        items_category = ({
          ...items_category,
          [`${i}`]: 0
        })
      }
    }
    if (!content_list.map(item => { return item?.type }).includes('post')) {
      // 상품리뷰 불러오기
      content_list.push({
        type: 'post',
        posts: post_obj,
        categories: themePostCategoryList,
      })
      let review_list = [...test_product_reviews];
      for (var i = 0; i < review_list.length; i++) {
        review_list[i].product = _.find(products, { id: review_list[i]?.product_id });
      }
      content_list.push({
        type: 'product-review',
        title: '상품후기',
        sub_title: 'REVIEW',
        list: review_list,
      })
    }

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
  const onClickItemsCategory = (i, j) => {
    setItemsCategory({
      ...itemsCategory,
      [`${i}`]: j
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
