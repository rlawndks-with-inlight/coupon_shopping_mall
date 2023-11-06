import { Row, SideTitle, Title } from 'src/components/elements/styled-components';
import styled from 'styled-components'
// @mui
import { Card, Pagination } from '@mui/material';
import { useEffect, useState } from 'react';
import { commarNumber, makeMaxPage } from 'src/utils/function';
import { PointTable } from 'src/components/elements/shop/common';
import { apiManager } from 'src/utils/api';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
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
  { id: 'point', label: '포인트' },
  { id: 'created_at', label: '발생일' },
  { id: 'type', label: '비고' },
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
  const { user } = useAuthContext();
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
    let data = await apiManager('points', 'list', search_obj);
    if (data) {
      setHistoryContent(data);
    }
  }
  return (
    <>
      <Wrappers>
        <Title>포인트내역</Title>
        <Row>보유 포인트: {commarNumber(user?.point)}P</Row>
        <Card sx={{ marginBottom: '2rem' }}>
          <PointTable historyContent={historyContent} headLabel={TABLE_HEAD} onChangePage={onChangePage} searchObj={searchObj} />
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
