import { useState } from "react";
import { Items } from "src/components/elements/shop/common";
import { useSettingsContext } from "src/components/settings";
import styled from "styled-components";

const ContentWrapper = styled.div`
max-width:1600px;
width:90%;
margin: 0 auto 5rem auto;
display:flex;
flex-direction:column;
`

const Demo4 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeCategoryList, themeMode, themeDnsData } = useSettingsContext();
  const [products, setProducts] = useState([]);
  const [productContent, setProductContent] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 15,
  })


  return (
    <>
      <ContentWrapper>
        <Items items={products} router={router} />
      </ContentWrapper>
    </>
  )
}
export default Demo4
