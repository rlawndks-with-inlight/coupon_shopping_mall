import { Card } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import { WishTable } from "src/components/elements/shop/common";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, RowMobileColumn, RowMobileReverceColumn, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { getWishDataUtil } from "src/utils/shop-util";
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

const WishDemo = (props) => {

  const { themeWishData } = useSettingsContext();
  const { user } = useAuthContext();
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const [wishList, setWishList] = useState([]);

  useEffect(() => {
    if (themeDnsData?.id == 74 && !user) {
      router.push('/shop/auth/login')
    }
  }, [themeDnsData])

  useEffect(() => {
    if (user) {
      pageSetting();
    } else {
      router.push(`/shop/auth/login`);
    }
  }, [])
  const pageSetting = async () => {
    let wish_list = await getWishDataUtil(themeWishData);
    setWishList(wish_list);
  }
  return (
    <>
      <Wrappers>
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{'위시리스트'}</TitleComponent>
            <Card sx={{ marginBottom: '2rem' }}>
              <WishTable wishContent={wishList} />
            </Card>
          </ContentWrappers>
        </RowMobileReverceColumn>
      </Wrappers>
    </>
  )
}
export default WishDemo