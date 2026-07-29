import styled from 'styled-components'
// @mui
import { Box, Card, Divider, Pagination, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { commarNumber, makeMaxPage } from 'src/utils/function';
import { PointTable } from 'src/components/elements/shop/common';
import { apiManager } from 'src/utils/api';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useLocales } from 'src/locales';

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
margin-bottom:8vh;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 1rem auto;
`

const PointDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();
  const { translate } = useLocales();
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
      <Wrapper>
        <ContentWrapper>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 4, mb: 1 }}>
            {translate('포인트내역')}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1,
              p: 3,
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {translate('보유 포인트')}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {commarNumber(user?.point)}P
            </Typography>
          </Box>
          <Card
            sx={{
              mb: 4,
              boxShadow: 'none',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <PointTable historyContent={historyContent} onChangePage={onChangePage} searchObj={searchObj} />
          </Card>
          <Stack alignItems="center">
            <Pagination
              size={window.innerWidth > 700 ? 'medium' : 'small'}
              count={makeMaxPage(historyContent?.total, historyContent?.page_size)}
              page={historyContent?.page}
              variant='outlined' shape='rounded'
              color='primary'
              onChange={(_, num) => {
                onChangePage({ ...searchObj, page: num })
              }} />
          </Stack>
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default PointDemo
