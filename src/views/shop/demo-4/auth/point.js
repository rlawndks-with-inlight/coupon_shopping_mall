import { Card, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import { PointTable } from "src/components/elements/shop/common";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, RowMobileColumn, RowMobileReverceColumn, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiManager } from "src/utils/api";
import { makeMaxPage } from "src/utils/function";
import styled from "styled-components";

const Wrappers = styled.div`
max-width:1250px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`

const PointDemo = (props) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [historyContent, setHistoryContent] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
  })

  useEffect(() => {
    if (user) {
      onChangePage(searchObj);
    } else {
      router.push(`/shop/auth/login`);
    }
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
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{'포인트'}</TitleComponent>
            <Card sx={{ marginBottom: '2rem' }}>
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
                onChangePage(num)
              }} />
          </ContentWrappers>
        </RowMobileReverceColumn>
      </Wrappers>
    </>
  )
}
export default PointDemo