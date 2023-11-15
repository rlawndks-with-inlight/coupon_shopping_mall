
import { useEffect, useState } from 'react'
import { Button, Skeleton, Stack } from '@mui/material'
import { useSettingsContext } from 'src/components/settings'
import _ from 'lodash'
import HomeBanner from 'src/views/section/shop/HomeBanner'
import HomeEditor from 'src/views/section/shop/HomeEditor'
import HomeItems from 'src/views/section/shop/HomeItems'
import HomeButtonBanner from 'src/views/section/shop/HomeButtonBanner'
import HomeItemsWithCategories from 'src/views/section/shop/HomeItemsWithCategories'
import HomeVideoSlide from 'src/views/section/shop/HomeVideoSlide'
import HomePost from 'src/views/section/shop/HomePost'
import HomeProductReview from 'src/views/section/shop/HomeProductReview'
import HomeSellers from 'src/views/section/shop/HomeSellers'


const returnHomeContent = (column, data, func) => {
  let type = column?.type;
  if (type == 'banner') return <HomeBanner column={column} data={data} func={func} />
  else if (type == 'editor') return <HomeEditor column={column} data={data} func={func} />
  else if (type == 'items' || type == 'items-ids') {
    return <HomeItems column={column} data={data} func={func} />
  }
  else if (type == 'button-banner') return <HomeButtonBanner column={column} data={data} func={func} />
  else if (type == 'items-with-categories') return <HomeItemsWithCategories column={column} data={data} func={func} />
  else if (type == 'video-slide') return <HomeVideoSlide column={column} data={data} func={func} />
  else if (type == 'post') return <HomePost column={column} data={data} func={func} />
  else if (type == 'sellers') return <HomeSellers column={column} data={data} func={func} />
  else if (type == 'item-reviews') return <HomeProductReview column={column} data={data} func={func} />
  else if (type == 'item-reviews-select') return <HomeProductReview column={column} data={data} func={func} />
  return '';
}

const HomeDemo = (props) => {
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

  const [posts, setPosts] = useState({});

  useEffect(() => {
    if (themeDnsData?.id > 0) {
      mainPageSetting();
    }
  }, [themeDnsData])
  useEffect(() => {
    if (contentList.length > 0) {
      setLoading(false);
    }
  }, [contentList])
  const mainPageSetting = async () => {
    if (contentList.length > 0) {
      return;
    }

    let dns_data = themeDnsData;
    let content_list = (dns_data?.shop_obj) ?? [];
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
      },
      {
        router,
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
export default HomeDemo