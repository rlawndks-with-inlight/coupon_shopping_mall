import { Title } from 'src/components/elements/styled-components';
import styled from 'styled-components'
// @mui
import { Card, Pagination } from '@mui/material';
import { useEffect, useState } from 'react';
import { makeMaxPage } from 'src/utils/function';
import { HistoryTable } from 'src/components/elements/shop/common';
import { apiManager } from 'src/utils/api';
const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`

const TABLE_HEAD = [
  { id: 'product', label: '상품' },
  { id: 'amount', label: '총액' },
  { id: 'buyer_name', label: '구매자명' },
  { id: 'trx_status', label: '배송상태' },
  { id: 'date', label: '업데이트일', align: 'right' },
  { id: 'cancel', label: '결제취소요청', align: 'right' },
  { id: '' },
];
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
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
        <Title>주문조회</Title>
        <Card sx={{ marginBottom: '2rem' }}>
          <HistoryTable historyContent={historyContent} headLabel={TABLE_HEAD} onChangePage={onChangePage} searchObj={searchObj}/>
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
export default Demo1
