import { Card, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ConsignmentTable } from "src/components/elements/shop/common";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, RowMobileColumn, RowMobileReverceColumn, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiShop } from "src/utils/api";
import { makeMaxPage } from "src/utils/function";
import styled from "styled-components";

const Wrappers = styled.div`
max-width:1400px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`

const ConsignmentDemo = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const [consignmentContent, setConsignmentContent] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
  })
  useEffect(() => {
    if (user) {
      onChangePage({ ...searchObj, page: 1 });
    } else {
      router.push(`/shop/auth/login`);
    }
  }, [router.query])

  const onChangePage = async (search_obj_) => {
    let search_obj = search_obj_;
    setSearchObj(search_obj);
    setConsignmentContent({
      ...consignmentContent,
      content: undefined,
    })
    let data = await apiShop('product', 'list', { ...search_obj, is_consignment: 1 });
    if (data) {
      setConsignmentContent(data);
    }
  }
  return (
    <>
      <Wrappers>
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{'위탁상품관리'}</TitleComponent>
            <Card sx={{ marginBottom: '2rem' }}>
              <ConsignmentTable consignmentContent={consignmentContent?.content} onChangePage={onChangePage} searchObj={searchObj} />
            </Card>
            <Pagination
              sx={{ margin: 'auto' }}
              size={window.innerWidth > 700 ? 'medium' : 'small'}
              count={makeMaxPage(consignmentContent?.total, consignmentContent?.page_size)}
              page={consignmentContent?.page}
              variant='outlined' shape='rounded'
              color='primary'
              siblingCount={4}
              boundaryCount={0}
              showFirstButton
              showLastButton
              onChange={(_, num) => {
                onChangePage(num)
              }} />
          </ContentWrappers>
        </RowMobileReverceColumn>
      </Wrappers>
    </>
  )
}
export default ConsignmentDemo