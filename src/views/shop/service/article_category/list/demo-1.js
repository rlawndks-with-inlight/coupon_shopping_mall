import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import ContentTable from 'src/components/elements/content-table';
import { Row, RowMobileColumn, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { returnArticleCategory } from 'src/data/data';
import { test_articles } from 'src/data/test-data';
import styled from 'styled-components'

const Wrappers = styled.div`
max-width:1500px;
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
margin-right:1rem;
@media (max-width:1000px){
  flex-direction: row;
  margin-bottom:1rem;
}
`
const ArticleCategory = styled.div`
border-bottom:1px solid ${themeObj.grey[300]};
padding:0.5rem 0;
cursor:pointer;
transition:0.3s;
color:${props => props.isSelect ? props => props.selectColor : themeObj.grey[300]};
font-weight:${props => props.isSelect ? 'bold' : ''};
&:hover{
  color: ${props => props.isSelect ? '' : props => props.theme.palette.primary.main};
}
@media (max-width:1000px){
  padding:0.25rem 0;
  border-bottom:2px solid ${props => props.isSelect ? props => props.selectColor : 'transparent'};
  margin-right:0.5rem;
}
`
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const { themeMode } = useSettingsContext();
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(20)
  useEffect(() => {
  }, [router.query?.article_category])

  const onChangePage = (num) => {
    setPage(num);
  }
  return (
    <>
      <Wrappers>
        <Title style={{
          marginBottom: '2rem'
        }}>{returnArticleCategory[`${router.query?.article_category}`]?.title}</Title>
        <RowMobileColumn>
          <ColumnMenu>
            {Object.keys(returnArticleCategory).map((item, idx) => (
              <>
                <ArticleCategory theme={theme}
                  isSelect={item == router.query?.article_category}
                  selectColor={themeMode == 'dark' ? '#fff' : '#000'}
                  onClick={() => {
                    router.push(`/shop/service/${item}`)
                  }}
                >
                  {returnArticleCategory[item].title}
                </ArticleCategory >
              </>
            ))}
          </ColumnMenu>
          {router.query?.article_category &&
            <>
              <ContentTable
                data={test_articles}
                schema={router.query?.article_category}
                onChangePage={onChangePage}
                page={page}
                maxPage={maxPage}
              />
            </>}
        </RowMobileColumn>
      </Wrappers >
    </>
  )
}
export default Demo1
