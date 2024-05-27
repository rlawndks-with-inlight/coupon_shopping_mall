
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
import { getMainObjType } from 'src/utils/function'
import HomeItemsPropertyGroups from 'src/views/section/shop/HomeItemsPropertyGroups'
import HomeTextBanner from 'src/views/section/shop/HomeTextBanner'


const returnHomeContent = (column, data, func, demoType = 0) => {
  let type = getMainObjType(column?.type);


  if (type == 'banner') return <HomeBanner column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'editor') return <HomeEditor column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'items' || type == 'items-ids') {
    return <HomeItems column={column} data={data} func={func} demoType={demoType} />
  }
  else if (type == 'items-property-group-:num') return <HomeItemsPropertyGroups column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'button-banner') return <HomeButtonBanner column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'items-with-categories') return <HomeItemsWithCategories column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'video-slide') return <HomeVideoSlide column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'post') return <HomePost column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'sellers') return <HomeSellers column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'item-reviews') return <HomeProductReview column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'item-reviews-select') return <HomeProductReview column={column} data={data} func={func} demoType={demoType} />
  else if (type == 'text-banner') return <HomeTextBanner column={column} data={data} func={func} demoType={demoType} />
  else {
    return '';
  }
}

  const HomeDemo = (props) => {
    const {
      data: {

      },
      func: {
        router
      },
    } = props;
    const { type } = props;

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

    const returnHomeContentByColumn = (column, idx, type = 0) => {
      return returnHomeContent(
        column,
        {
          windowWidth: window.innerWidth,
          themeDnsData: themeDnsData,
          idx,
        },
        {
          router,
        },
        type,
      )
    }

    /*useEffect(() => {
      const handleRouteChangeStart = () => {
        const scrollPosition = document.documentElement.scrollTop;
        sessionStorage.setItem(`scrollPosition_${router.asPath}`, scrollPosition);
        console.log(sessionStorage)
      };
  
      const handleRouteChangeComplete = () => {
        const scrollPosition = sessionStorage.getItem(`scrollPosition_${router.asPath}`);
        if (scrollPosition) {
          window.scrollTo({top: scrollPosition})
        }
        console.log(scrollPosition)
        console.log(document.documentElement)
      };
  
      router.events.on('routeChangeStart', handleRouteChangeStart);
      router.events.on('routeChangeComplete', handleRouteChangeComplete);
  
      return () => {
        router.events.off('routeChangeStart', handleRouteChangeStart);
        router.events.off('routeChangeComplete', handleRouteChangeComplete);
      };
    }, []);*/

    useEffect(() => {
      const savedScrollPosition = sessionStorage.getItem('scrollPosition');
      if (savedScrollPosition && !loading) {  
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        sessionStorage.removeItem('scrollPosition');
      }
      const handleRouteChangeStart = () => {
        sessionStorage.setItem('scrollPosition', window.scrollY);
      };

      router.events.on('routeChangeStart', handleRouteChangeStart);
      return () => {
        router.events.off('routeChangeStart', handleRouteChangeStart);
      };
    }, [loading])
    
    return (
      <>
        {loading ?
          <>
            <Stack spacing={'1rem'} >
              {/*
            <Skeleton variant='rectangular' style={{
              height: '40vw'
            }} />
          */}
              <div style={{ display: 'flex', marginTop: '100px' }}>
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem 1rem 10rem auto'
                }} />
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem 1rem'
                }} />
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem 1rem'
                }} />
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem 1rem'
                }} />
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem auto 10rem 1rem'
                }} />
              </div>
              <div style={{ display: 'flex', }}>
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem 1rem 10rem auto'
                }} />
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem 1rem'
                }} />
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem 1rem'
                }} />
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem 1rem'
                }} />
                <Skeleton variant='rounded' style={{
                  height: '34vw',
                  maxWidth: '200px',
                  width: '90%',
                  maxHeight: '200px',
                  margin: '10rem auto 10rem 1rem'
                }} />
              </div>
              {/*
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '1200px',
              width: '90%',
              height: '70vh',
              margin: '1rem auto'
            }} />
            */}
            </Stack>
          </>
          :
          <>
            {contentList && contentList.map((column, idx) => (
              <>
                {returnHomeContentByColumn(column, idx, type)}
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