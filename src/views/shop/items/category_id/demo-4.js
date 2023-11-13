import { Button } from '@mui/material'
import { useState } from 'react'
import { Items } from 'src/components/elements/shop/common'
import { Row } from 'src/components/elements/styled-components'
import { useSettingsContext } from 'src/components/settings'
import styled from 'styled-components'

const ContentWrapper = styled.div`
  max-width: 1600px;
  width: 90%;
  margin: 0 auto 5rem auto;
  display: flex;
  flex-direction: column;
`

const Demo4 = props => {
  const {
    data: {},
    func: { router }
  } = props
  const { themeCategoryList, themeMode, themeDnsData } = useSettingsContext()
  const [products, setProducts] = useState([])
  const [productContent, setProductContent] = useState({})
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 15
  })

  return (
    <>
      <ContentWrapper>
        {themeCategoryList.map((group, index) => (
          <>
            <Row style={{ flexWrap: 'wrap', marginBottom: '1rem', rowGap: '0.5rem', columnGap: '0.5rem' }}>
              {group?.product_categories &&
                group?.product_categories.map((category, idx) => (
                  <>
                    <Button variant='outlined' size='small'>
                      {category?.category_name}
                    </Button>
                  </>
                ))}
            </Row>
          </>
        ))}
        <Items items={products} router={router} />
      </ContentWrapper>
    </>
  )
}
export default Demo4
