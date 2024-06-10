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

const ShopLayout6 = (props) => {
    const { themeMode, onToggleMode } = useSettingsContext();
    const {
        data: {

        },
        func: {
            router
        },
        children, scrollToTop,
    } = props;

    const [scrollTop, setScrollTop] = useState(false)

    useEffect(() => {
      const handleScroll = () => {
          const scrollTop_ = document.documentElement.scrollTop;
          setScrollTop(scrollTop_ > 113)
      }
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [])

    return (
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
    )
}
export default ShopLayout6
