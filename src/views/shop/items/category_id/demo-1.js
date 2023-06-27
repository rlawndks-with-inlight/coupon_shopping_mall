import { useEffect } from 'react';
import { test_items } from 'src/data/test-data';
import styled from 'styled-components'
import { useTheme } from "@emotion/react";
import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { commarNumber } from 'src/utils/function';
import { Row, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { Item, Items } from 'src/components/elements/shop/common';

const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 1rem auto;
`
const CategoryContainer = styled.div`

`
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeCategoryList } = useSettingsContext();

  useEffect(() => {
    if (themeCategoryList.length > 0) {
      let result = returnCategoryRoot(router.query?.category_id);
    }
  }, [themeCategoryList])
  const returnCategoryRoot = (id, categories) => {
    
  }
  return (
    <>
      <ContentWrapper>
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
          <Title>asd</Title>
          <CategoryContainer>

          </CategoryContainer>
        </div>
        <Row>

        </Row>
        <Items items={test_items} router={router} />
      </ContentWrapper>
    </>
  )
}
export default Demo1
