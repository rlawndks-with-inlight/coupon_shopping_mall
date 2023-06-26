import { useEffect } from 'react';
import { Row, RowMobileColumn, Title } from 'src/components/elements/styled-components';
import { returnArticleCategory } from 'src/data/data';
import styled from 'styled-components'

const Wrappers = styled.div`
max-width:1200px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
`
const ColumnMenu = styled.div`
display:flex;
flex-direction: column;
width:200px;
`
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  useEffect(() => {
    console.log(router)
  }, [router])
  return (
    <>
      <Wrappers>
        <Title>{returnArticleCategory[`${router.query?.article_category}`]?.title}</Title>
        <RowMobileColumn>
          <ColumnMenu>
            {Object.keys(returnArticleCategory).map((item, idx) => (
              <>
              <div>
              {returnArticleCategory[item].title}
              </div>
              </>
            ))}
          </ColumnMenu>
        </RowMobileColumn>
      </Wrappers>
    </>
  )
}
export default Demo1
