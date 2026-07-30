import styled from 'styled-components'
// @mui
import { Box, Divider, Pagination, Typography, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { makeMaxPage } from 'src/utils/function';
import { HistoryTable } from 'src/components/elements/shop/common';
import { apiManager } from 'src/utils/api';
import { useLocales } from 'src/locales';

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 1rem auto;
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

  const isLoading = historyContent?.content === undefined;
  const isEmpty = Array.isArray(historyContent?.content) && historyContent?.content.length === 0;

  return (
    <Wrapper>
      <ContentWrapper>
        <div style={{ margin: '2.5rem 0 1rem' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {translate('주문조회')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            {translate('주문 내역과 배송 상태를 확인하실 수 있습니다.')}
          </Typography>
        </div>
        <Divider sx={{ mb: 3 }} />
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 4,
          }}
        >
          <HistoryTable historyContent={historyContent} onChangePage={onChangePage} searchObj={searchObj} />
          {isLoading &&
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
              <CircularProgress size={28} color="primary" />
            </Box>
          }
          {isEmpty &&
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {translate('주문 내역이 없습니다.')}
              </Typography>
            </Box>
          }
        </Box>
        <Pagination
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 'auto',
            mb: 6,
          }}
          size={window.innerWidth > 700 ? 'medium' : 'small'}
          count={makeMaxPage(historyContent?.total, historyContent?.page_size)}
          page={historyContent?.page}
          variant='outlined' shape='rounded'
          color='primary'
          onChange={(_, num) => {
            onChangePage({ ...searchObj, page: num })
          }} />
      </ContentWrapper>
    </Wrapper>
  )
}
export default HistoryDemo
