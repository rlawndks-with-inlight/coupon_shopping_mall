import styled from "styled-components";
import Footer from "./footer"
import Header from "./header"
import { useSettingsContext } from "src/components/settings";
import { useEffect, useState } from "react";

const Wrappers = styled.div`
display:flex;
flex-direction:column;
min-height:100vh;
`
const BlogLayout4 = (props) => {
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
        if (router.asPath == '/blog/auth/sign-up') {
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
export default BlogLayout4
