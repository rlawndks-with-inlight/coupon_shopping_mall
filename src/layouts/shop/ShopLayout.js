import { Fab, StyledEngineProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ShopLayout1 from "./shop/demo-1/ShopLayout1";
import BlogLayout1 from "./blog/demo-1/BlogLayout1";
import BlogLayout2 from "./blog/demo-2/BlogLayout2";
import ShopLayout2 from "./shop/demo-2/ShopLayout2";
import ScrollToTop from "src/components/scroll-to-top";
import { Icon } from "@iconify/react";
import { useSettingsContext } from "src/components/settings";
import ShopLayout3 from "./shop/demo-3/ShopLayout3";
import ShopLayout4 from "./shop/demo-4/ShopLayout4";
import ShopLayout5 from "./shop/demo-5/ShopLayout5";
import ShopLayout6 from "./shop/demo-6/ShopLayout6";
import ShopLayout7 from "./shop/demo-7/ShopLayout7";
import ShopLayout8 from "./shop/demo-8/ShopLayout8";
import ShopLayout9 from "./shop/demo-9/ShopLayout9";
//import ShopLayout10 from "./shop/demo-10/ShopLayout10";
import styled from "styled-components";
import { useLocales } from "src/locales";
import $ from 'jquery';
import { useAuthContext } from "../manager/auth/useAuthContext";
import BlogLayout3 from "./blog/demo-3/BlogLayout2";
import BlogLayout4 from "./blog/demo-4/BlogLayout2";
import BlogLayout5 from "./blog/demo-5/BlogLayout2";
import BlogLayout6 from "./blog/demo-6/BlogLayout6";
import SecurityQuestionBanner from "src/components/elements/shop/SecurityQuestionBanner";
import GuestSignupPrompt from "src/components/elements/shop/GuestSignupPrompt";
import { isBlogBrand } from "src/utils/blog-shop-route";

/* 손님 화면(스토어프론트) 전체를 감싼다.
   className 을 하나 달아 두는 이유: 헤더 아이콘의 터치 영역을 넓히는 규칙을
   손님 화면에만 걸기 위해서다(styles/globals.css 의 '.storefront header button' 참고).
   관리자 화면에도 <header> 가 있을 수 있어 태그만으로 고르면 거기까지 딸려간다. */
const Wrappers = styled.div`

`
const getDemo = (num, common) => {
  const {
    data: {
      category
    },
    children
  } = common;

  if (category == 'shop') {
    if (num == 1)
      return <ShopLayout1 {...common} />
    else if (num == 2)
      return <ShopLayout2 {...common} />
    else if (num == 3)
      return <ShopLayout3 {...common} />
    else if (num == 4)
      return <ShopLayout4 {...common} />
    else if (num == 5)
      return <ShopLayout5 {...common} />
    else if (num == 6)
      return <ShopLayout6 {...common} />
    else if (num == 7)
      return <ShopLayout7 {...common} />
    else if (num == 8)
      return <ShopLayout8 {...common} />
    else if (num == 9)
      return <ShopLayout9 {...common} />
    /*else if (num == 10)
      return <ShopLayout10 {...common} />*/
    else
      return <>{children}</>
  } else if (category == 'blog') {
    if (num == 1)
      return <BlogLayout1 {...common} />
    else if (num == 2)
      return <BlogLayout2 {...common} />
    else if (num == 3)
      return <BlogLayout3 {...common} />
    else if (num == 4)
      return <BlogLayout6 {...common} />
    else if (num == 5)
      return <BlogLayout6 {...common} />
    else if (num == 6)
      return <BlogLayout6 {...common} />
    else if (num == 7)
      return <BlogLayout6 {...common} />
    else if (num == 8)
      return <BlogLayout6 {...common} />
    else if (num == 9)
      return <BlogLayout6 {...common} />
    else
      return <>{children}</>
  } else {
    return <>{children}</>
  }
}

// ※ 예전에 있던 SHARED_SHOP_PATHS(주문서·결제결과 등 공용 경로 예외)는 없앴다.
//   URL 을 /shop 하나로 통일하면서 '이 경로만 예외' 라는 개념 자체가 사라졌다 —
//   이제 모든 경로에서 브랜드 유형이 레이아웃을 정한다.

const ShopLayout = ({ children, scrollToTop }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { themeDnsData, themeCategoryList } = useSettingsContext();
  const { user, isInitialized } = useAuthContext();
  const { currentLang } = useLocales();

  // 경로가 아니라 브랜드 유형이 레이아웃을 정한다.
  // 예전엔 URL 루트(/shop · /blog)로 골랐는데, 결제 복귀처럼 경로가 고정된 화면에서
  // 블로그형 브랜드가 쇼핑몰 레이아웃을 뒤집어쓰는 문제가 반복됐다.
  const isBlog = isBlogBrand(themeDnsData);
  const layoutFamily = isBlog ? 'blog' : 'shop';
  const layoutDemoNum = isBlog ? themeDnsData?.blog_demo_num : themeDnsData?.shop_demo_num;

  useEffect(() => {
    if (!(themeDnsData?.id > 0) || !themeCategoryList) return;
    // 쇼핑몰·블로그 어느 데모도 없는 브랜드는 보여줄 화면이 없다.
    if (!(themeDnsData?.shop_demo_num > 0) && !(themeDnsData?.blog_demo_num > 0)) {
      router.push('/404');
      return;
    }
    setLoading(false);
  }, [themeDnsData, themeCategoryList])

  // 폐쇄몰: 비로그인 방문자를 로그인으로 보낸다.
  // ⚠ isInitialized 를 함께 봐야 한다.
  //   useAuthContext 는 첫 렌더에서 user 가 null 이고, 저장된 토큰으로 세션을 복원한 뒤에야 채워진다.
  //   그 사이를 '비로그인' 으로 판정하면 **로그인한 고객도 새로고침할 때마다 로그인 화면으로 튕긴다.**
  //   (관리자 쪽 AuthGuard 는 원래 isInitialized 를 보고 기다린다 — 같은 규칙으로 맞춘다)
  if (themeDnsData?.is_closure == 1 && isInitialized && !user) {
    router.push(`/shop/auth/login`)
    return <></>
  }
  return (
    <>
      {!loading &&
        <>
          <Wrappers className="storefront" /*style={{fontFamily:'Noto Sans KR'}}*/>
            {getDemo(layoutDemoNum, {
              data: {
                category: layoutFamily
              },
              func: {
                router
              },
              // 보안질문 미설정 안내 배너. 자체 게이팅(로그인 + SHOPGO 본사·산하 가맹점 + has_security_question === 0)이라 조건 래핑 금지.
              // 모든 ShopLayoutN/BlogLayoutN 이 {children} 을 Header 와 Footer 사이에 렌더하므로 여기 한 줄이면 전 데모에 적용된다.
              children: (
                <>
                  <SecurityQuestionBanner />
                  {/* 비로그인 손님이 담기·바로구매를 누르면 회원가입을 한 번 권한다.
                      창 자체는 여기 한 번만 걸고, 부르는 곳은 shop-util 의 두 길목이다. */}
                  <GuestSignupPrompt />
                  {children}
                </>
              ),
              scrollToTop
            })}
            <ScrollToTop className='mui-fixed'>
              <Fab size='small' aria-label='scroll back to top'>
                <Icon icon='tabler:arrow-up' />
              </Fab>
            </ScrollToTop>
          </Wrappers>
        </>}

    </>
  )
}
export default ShopLayout;
