import { useEffect, useState } from 'react'
import { Skeleton, Stack } from '@mui/material'
import { useSettingsContext } from 'src/components/settings'
import { getDefaultHomeContent } from 'src/data/default-banners'
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
import HomeItemHero from 'src/views/section/shop/HomeItemHero'
import styled from 'styled-components'

const ContentWrapper = styled.div`
max-width:1200px;
width:92%;
margin:0 auto;
`

const returnHomeContent = (column, data, func) => {
  let type = getMainObjType(column?.type);
  if (type == 'item-hero') return <HomeItemHero column={column} data={data} func={func} />
  else if (type == 'banner') return <HomeBanner column={column} data={data} func={func} />
  else if (type == 'editor') return <HomeEditor column={column} data={data} func={func} />
  else if (type == 'items' || type == 'items-ids') return <HomeItems column={column} data={data} func={func} />
  else if (type == 'items-property-group-:num') return <HomeItemsPropertyGroups column={column} data={data} func={func} />
  else if (type == 'button-banner') return <HomeButtonBanner column={column} data={data} func={func} />
  else if (type == 'items-with-categories') return <HomeItemsWithCategories column={column} data={data} func={func} />
  else if (type == 'video-slide') return <HomeVideoSlide column={column} data={data} func={func} />
  else if (type == 'post') return <HomePost column={column} data={data} func={func} />
  else if (type == 'sellers') return <HomeSellers column={column} data={data} func={func} />
  else if (type == 'item-reviews') return <HomeProductReview column={column} data={data} func={func} />
  else if (type == 'item-reviews-select') return <HomeProductReview column={column} data={data} func={func} />
  else if (type == 'text-banner') return <HomeTextBanner column={column} data={data} func={func} />
  else return '';
}

const HomeDemo = (props) => {
  const {
    data: {},
    func: { router },
  } = props;
  const { themeDnsData } = useSettingsContext();
  const [loading, setLoading] = useState(true);
  const [contentList, setContentList] = useState([]);

  useEffect(() => {
    if (themeDnsData?.id > 0) {
      mainPageSetting();
    }
  }, [themeDnsData])

  const mainPageSetting = async () => {
    if (contentList.length > 0) return;
    let content_list = themeDnsData?.shop_obj ?? [];
    // 섹션이 하나도 없으면(신규 개설 직후) 기본 배너 구성으로 대체해 백지 홈을 막는다.
    if (content_list.length <= 0) {
      content_list = getDefaultHomeContent(themeDnsData?.shop_demo_num);
    }
    setContentList(content_list);
    // 스켈레톤은 '데이터 도착 전'에만. (기존엔 섹션 0개면 영구 표시됐음)
    setLoading(false);
  }

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

  const returnHomeContentByColumn = (column, idx) => {
    return returnHomeContent(column, {
      windowWidth: window.innerWidth,
      themeDnsData,
      idx,
    }, { router })
  }

  return (
    <>
      {loading ?
        <Stack spacing={'1rem'}>
          <Skeleton variant='rectangular' style={{ height: '50vh' }} />
          <div style={{ display: 'flex', gap: '1rem', padding: '2rem 4%' }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant='rounded' style={{ width: '25%', height: '200px' }} />
            ))}
          </div>
        </Stack>
        :
        <>
          {contentList && contentList.map((column, idx) => (
            <div key={idx}>
              {returnHomeContentByColumn(column, idx)}
            </div>
          ))}
          <div style={{ marginTop: '3rem' }} />
        </>
      }
    </>
  )
}
export default HomeDemo
