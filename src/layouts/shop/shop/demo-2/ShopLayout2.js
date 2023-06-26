import styled from "styled-components";
import Footer from "./footer"
import Header from "./header"
import { useSettingsContext } from "src/components/settings";

const Wrappers = styled.div`
display:flex;
flex-direction:column;
min-height:100vh;
`
const ShopLayout2 = (props) => {
    const { themeMode, onToggleMode } = useSettingsContext();
    const {
        data: {

        },
        func: {
            router
        },
        children, scrollToTop,
    } = props;

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
export default ShopLayout2