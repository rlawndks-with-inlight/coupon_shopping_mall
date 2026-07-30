import styled from 'styled-components'
// @mui
import { Box, Pagination, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { makeMaxPage } from 'src/utils/function';
import { HistoryTable } from 'src/components/elements/shop/common';
import { apiManager } from 'src/utils/api';
import { useLocales } from 'src/locales';
import { themeObj } from 'src/components/elements/styled-components';

const Wrappers = styled.div`
max-width:1500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const HeaderArea = styled.div`
margin: 4rem 0 1.5rem 0;
`
const PageTitle = styled.div`
font-size:${themeObj.font_size.size3};
font-weight:bold;
text-transform:uppercase;
letter-spacing:0.04em;
`
const AccentBar = styled.div`
width: 48px;
height: 3px;
margin-top: 0.75rem;
border-radius: 2px;
`
const SubText = styled.div`
margin-top: 0.75rem;
font-size:${themeObj.font_size.size8};
color:${themeObj.grey[600]};
`
const TableCard = styled.div`
border: 1px solid ${themeObj.grey[300]};
border-radius: 8px;
overflow: hidden;
margin-bottom: 2rem;
`
const HistoryDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();
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
    <>
      <Wrappers>
        <HeaderArea>
          <PageTitle>{translate('주문조회')}</PageTitle>
          <AccentBar style={{ background: theme.palette.primary.main }} />
          <SubText>{translate('주문 내역과 배송 상태를 확인하실 수 있습니다.')}</SubText>
        </HeaderArea>
        <TableCard>
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
        </TableCard>
        <Pagination
          sx={{ margin: 'auto' }}
          size={window.innerWidth > 700 ? 'medium' : 'small'}
          count={makeMaxPage(historyContent?.total, historyContent?.page_size)}
          page={historyContent?.page}
          variant='outlined' shape='rounded'
          color='primary'
          onChange={(_, num) => {
            onChangePage({ ...searchObj, page: num })
          }} />
      </Wrappers>
    </>
  )
}
export default HistoryDemo
