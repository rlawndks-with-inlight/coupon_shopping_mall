import styled from 'styled-components';
// @mui
import { Card, Pagination } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { commarNumber, makeMaxPage } from 'src/utils/function';
import { PointTable } from 'src/components/elements/shop/common';
import { apiManager } from 'src/utils/api';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useLocales } from 'src/locales';
import { themeObj } from 'src/components/elements/styled-components';

const Wrappers = styled.div`
max-width: 1500px;
display: flex;
flex-direction: column;
margin: 0 auto;
width: 90%;
min-height: 90vh;
margin-bottom: 10vh;
padding-top: 1rem;
`
const PageHead = styled.div`
display: flex;
flex-direction: column;
align-items: center;
margin: 3rem auto 2.5rem auto;
`
const PageTitle = styled.div`
font-size: ${themeObj.font_size.size2};
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.12em;
color: ${themeObj.grey[800]};
text-align: center;
`
const TitleAccent = styled.div`
width: 48px;
height: 3px;
margin-top: 0.85rem;
border-radius: 2px;
background: ${props => props.color};
`
const BalanceCard = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
padding: 1.4rem 2rem;
border: 1px solid ${themeObj.grey[300]};
border-left: 3px solid ${props => props.color};
border-radius: 10px;
margin-bottom: 2rem;
@media (max-width:500px) {
  padding: 1.1rem 1.25rem;
}
`
const BalanceLabel = styled.div`
font-size: ${themeObj.font_size.size7};
color: ${themeObj.grey[600]};
letter-spacing: 0.02em;
`
const BalanceValue = styled.div`
font-size: ${themeObj.font_size.size2};
font-weight: 700;
color: ${props => props.color};
@media (max-width:500px) {
  font-size: ${themeObj.font_size.size4};
}
`
const PointDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate } = useLocales();
  const { user } = useAuthContext();
  const theme = useTheme();
  const mainColor = theme?.palette?.primary?.main;
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
        <PageHead>
          <PageTitle>{translate('포인트내역')}</PageTitle>
          <TitleAccent color={mainColor} />
        </PageHead>
        <BalanceCard color={mainColor}>
          <BalanceLabel>{translate('보유 포인트')}</BalanceLabel>
          <BalanceValue color={mainColor}>{commarNumber(user?.point)}P</BalanceValue>
        </BalanceCard>
        <Card sx={{ marginBottom: '2rem', borderRadius: '10px', border: `1px solid ${themeObj.grey[300]}`, boxShadow: 'none' }}>
          <PointTable historyContent={historyContent} onChangePage={onChangePage} searchObj={searchObj} />
        </Card>
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
export default PointDemo
