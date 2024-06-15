import { Title } from 'src/components/elements/styled-components';
import styled from 'styled-components'
// @mui
import { Card, Pagination } from '@mui/material';
import { useEffect, useState } from 'react';
import { makeMaxPage } from 'src/utils/function';
import { HistoryTable } from 'src/components/elements/shop/common';
import { apiManager } from 'src/utils/api';
import { useLocales } from 'src/locales';
const Wrappers = styled.div`
max-width:1240px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const HistoryDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate } = useLocales();
  const [historyContent, setHistoryContent] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
  })
  useEffect(() => {
    onChangePage(searchObj);
  }, [])

  const onChangePage = async (search_obj) => {
    setSearchObj(search_obj);
    setHistoryContent({
      ...historyContent,
      content: undefined,
    })
    let data = await apiManager('transactions', 'list', search_obj);
    if (data) {
      setHistoryContent(data);
    }
  }
  return (
    <>
      <Wrappers>
        <Title>{translate('주문조회')}</Title>
        <Card sx={{ marginBottom: '2rem' }}>
          <HistoryTable historyContent={historyContent} onChangePage={onChangePage} searchObj={searchObj} />
        </Card>
        <Pagination
          sx={{ margin: 'auto' }}
          size={window.innerWidth > 700 ? 'medium' : 'small'}
          count={makeMaxPage(historyContent?.total, historyContent?.page_size)}
          page={historyContent?.page}
          variant='outlined' shape='rounded'
          color='primary'
          onChange={(_, num) => {
            onChangePage(num)
          }} />
      </Wrappers>
    </>
  )
}
export default HistoryDemo
