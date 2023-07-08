import { themeObj } from "src/components/elements/styled-components"
import { useSettingsContext } from "src/components/settings"
import styled from "styled-components"

const Wrappers = styled.footer`
margin-top: auto;
background:${themeObj.grey[300]};
min-height:200px;
padding:1rem;
`
const Footer = () => {
  const {themeMode} = useSettingsContext();

  return (
    <>
      <Wrappers style={{
        background:`${themeMode=='dark'?'#222222':themeObj.grey[300]}`
      }}>
        footer입니다.
      </Wrappers>
    </>
  )
}
export default Footer