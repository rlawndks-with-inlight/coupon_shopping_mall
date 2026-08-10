import styled from "styled-components";
import Footer from "./footer"
import Header from "./header"
import { useSettingsContext } from "src/components/settings";
import { useEffect, useState } from "react";
import StorefrontPopups from "src/components/elements/shop/StorefrontPopups";
import { isPath } from 'src/utils/blog-shop-route';

const Wrappers = styled.div`
display:flex;
flex-direction:column;
min-height:100vh;
`
/* PC 에서 본문이 좌우로 퍼지지 않게 프레임 폭으로 잡아둔다.
   이 프레임(프레임4)은 헤더·푸터·홈·상품상세가 전부 840px 한 컬럼으로 짜여 있는데,
   블로그 전용 화면이 없는 경로(/shop/items, 주문서, 약관, 위시리스트 등)는
   쇼핑몰용 넓은 화면으로 떨어진다. 그래서 헤더·푸터만 가운데 840px 이고
   본문만 화면 끝까지 퍼져 서로 다른 사이트처럼 보였다.
   여기서 한 번 잡으면 그 경로들이 전부 프레임 폭을 따른다 —
   프레임 전용 화면들은 이미 840px 이라 이 래퍼가 있어도 달라지지 않는다. */
const Content = styled.div`
width:100%;
max-width:840px;
margin:0 auto;
`
const BlogLayout1 = (props) => {
  const { themeMode, onToggleMode } = useSettingsContext();
  const [useLayout, setUseLayout] = useState(true);
  const {
    data: {

    },
    func: {
      router
    },
    children, scrollToTop,
  } = props;
  useEffect(() => {
    let result = settingPage();
    setUseLayout(result);
  }, [router.asPath])
  const settingPage = () => {
    // 가입 화면에서 레이아웃(헤더+푸터)을 끄던 예외를 없앤다.
    // 가입 뷰가 본문에 헤더를 직접 그려서 겹치는 걸 피하려던 것인데,
    // 그 결과 이 프레임에서는 가입 화면에서 나갈 링크가 하나도 없었다.
    // 이제 가입 뷰가 헤더를 그리지 않으므로 예외가 필요 없다.
    return true;
  }
  return (
    <>
      {useLayout ?
        <>
          <Wrappers style={{
            background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
            color: `${themeMode == 'dark' ? '#fff' : '#000'}`,
          }}>
            <Header
              data={{
              }}
              func={{
                router
              }} />
            <StorefrontPopups />
            <Content>{children}</Content>
            <Footer
              data={{
              }}
              func={{
                router
              }} />
          </Wrappers>
        </>
        :
        <>
        {children}
        </>}
    </>
  )
}
export default BlogLayout1
