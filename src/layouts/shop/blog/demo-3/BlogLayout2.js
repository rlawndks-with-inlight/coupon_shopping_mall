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
/* PC 에서 본문이 좌우로 퍼지지 않게 프레임 폭으로 잡아둔다 — 이유는 BlogLayout1 주석 참고.
   이 프레임의 기준 폭은 798px 이다(헤더 TopMenuContainer 기준). */
const Content = styled.div`
width:100%;
max-width:798px;
margin:0 auto;
`
const BlogLayout3 = (props) => {
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
        if (isPath(router, '/shop/auth/sign-up')) {
            return false;
        }
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
export default BlogLayout3
