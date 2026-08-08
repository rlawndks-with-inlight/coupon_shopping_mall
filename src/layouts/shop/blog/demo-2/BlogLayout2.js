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
const BlogLayout2 = (props) => {
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
                        {children}
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
export default BlogLayout2
