import { Card, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import { HistoryTable } from "src/components/elements/shop/common";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, RowMobileColumn, RowMobileReverceColumn, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiManager } from "src/utils/api";
import { makeMaxPage } from "src/utils/function";
import styled from "styled-components";

const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`
const TABLE_HEAD = [
  { id: 'product', label: '상품' },
  { id: 'ord_num', label: '주문번호' },
  { id: 'amount', label: '총액' },
  { id: 'buyer_name', label: '구매자명' },
  { id: 'trx_status', label: '배송상태' },
  { id: 'date', label: '업데이트일', align: 'right' },
  { id: 'cancel', label: '주문취소요청', align: 'right' },
  { id: '' },
];
const HistoryDemo = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
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
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{router.query?.is_cancel == 1 ? '반품/환불조회' : '주문/배송조회'}</TitleComponent>
            <Card sx={{ marginBottom: '2rem' }}>
              <HistoryTable historyContent={historyContent} headLabel={TABLE_HEAD} onChangePage={onChangePage} searchObj={searchObj} />
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
          </ContentWrappers>
        </RowMobileReverceColumn>
      </Wrappers>
    </>
  )
}
export default HistoryDemo