import { Icon } from "@iconify/react";
import { IconButton, Typography } from "@mui/material";
import Image from 'src/components/image/Image'
import { useRouter } from "next/router";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { Items } from "src/components/elements/shop/common";
import { AuthMenuSideComponent, ContentBorderContainer, ContentWrappers, SubTitleComponent, Title, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, Row, RowMobileColumn, RowMobileReverceColumn, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiShop } from "src/utils/api";
import { commarNumber, getTrxStatusByNumber } from "src/utils/function";
import styled from "styled-components";

const Wrappers = styled.div`
max-width:1360px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`
const MoreText = styled.div`
font-size: ${themeObj.font_size.size8};
font-weight: normal;
cursor: pointer;
&:hover{
  color: ${props => props.themeDnsData?.theme_css?.main_color};
}
`
const Table = styled.table`
font-size:${themeObj.font_size.size8};
width:100%;
text-align:center;
border-collapse: collapse;
min-width:350px;
`
const Tr = styled.tr`
width:100%;
height:26px;
`
const Td = styled.td`
border-bottom:1px solid ${themeObj.grey[300]};
padding:1rem 0;
white-space:pre;
`
const MyPageDemo = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({});
  const slideRef = useRef();
  useEffect(() => {
    if (user) {
      getUserInfo();
    } else {
      router.push(`/shop/auth/login`);
    }
  }, [])

  const getUserInfo = async () => {
    const response = await apiShop('user-info');
    setUserInfo(response);
  }
  const consignmentColumns = [
    {
      id: 'product_img',
      label: '',
      action: (row) => {
        return <Row style={{ alignItems: 'center', columnGap: '0.5rem' }}>
          <img
            alt='product image'
            src={row?.product_img}
            style={{ width: 64, height: 64, borderRadius: 1.5, mr: 2 }}
          />
          <Typography noWrap variant='subtitle2' sx={{ maxWidth: 240 }}>
            {row.product_name}
          </Typography>
        </Row>
      }
    },
    {
      id: 'product_sale_price',
      label: '',
      action: (row) => {
        return commarNumber(row['product_sale_price']) + '원'
      }
    },
    {
      id: 'created_at',
      label: '',
      action: (row) => {
        return row?.created_at
      },
    },
  ]
  const orderColumns = [
    {
      id: 'product',
      label: '',
      action: (row) => {
        return <Row style={{ alignItems: 'center', columnGap: '0.5rem' }}>
          <Image
            alt='product image'
            src={row?.orders.length > 0 && row?.orders[0]?.product_img}
            sx={{ width: 64, height: 64, borderRadius: 1.5, mr: 2 }}
          />
          <Typography noWrap variant='subtitle2' sx={{ maxWidth: 240 }}>
            {row.item_name}
          </Typography>
        </Row>
      },
      sx: (row) => {
        if (row?.is_cancel == 1) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'ord_num',
      label: '',
      action: (row) => {
        return row.ord_num
      },
      sx: (row) => {
        if (row?.is_cancel == 1) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'amount',
      label: '',
      action: (row) => {
        return commarNumber(row.amount) + '원'
      },
      sx: (row) => {
        if (row?.is_cancel == 1) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'buyer_name',
      label: '',
      action: (row) => {
        return row.buyer_name
      },
      sx: (row) => {
        if (row?.is_cancel == 1) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'trx_status',
      label: '',
      action: (row) => {
        return getTrxStatusByNumber(row?.trx_status)
      },
      sx: (row) => {
        if (row?.is_cancel == 1) {
          return {
            color: 'red'
          }
        }
      },
    },
    {
      id: 'updated_at',
      label: '',
      action: (row) => {
        return row?.updated_at
      },
      sx: (row) => {
        if (row?.is_cancel == 1) {
          return {
            color: 'red'
          }
        } else {
          return {
            color: '#aaa'
          }
        }
      },
    },
  ]
  return (
    <>
      <Wrappers>
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{'My 그랑파리'}</TitleComponent>
            <ContentBorderContainer style={{ display: 'flex' }}>
              <Row style={{ columnGap: '0.5rem', fontWeight: 'bold', margin: 'auto' }}>
                <div>고객님의 포인트는</div>
                <div style={{ color: themeDnsData?.theme_css?.main_color }}>
                  {commarNumber(user?.point)}
                </div>
                <div>입니다.</div>
              </Row>
            </ContentBorderContainer>
            <SubTitleComponent
              endComponent={<MoreText themeDnsData={themeDnsData}
                onClick={() => {
                  router.push(`/shop/auth/consignment`)
                }}>
                더보기
              </MoreText>}
            >위탁상품관리</SubTitleComponent>
            <ContentBorderContainer>
              <Table>
                {userInfo?.consignment_products && userInfo?.consignment_products.map((product, idx) => (
                  <>
                    <Tr>
                      {consignmentColumns.map((itm) => (
                        <>
                          <Td>{itm.action(product)}</Td>
                        </>
                      ))}
                    </Tr>
                  </>
                ))}
              </Table>
            </ContentBorderContainer>
            <SubTitleComponent
              endComponent={<MoreText themeDnsData={themeDnsData} onClick={() => {
                router.push(`/shop/auth/history`)
              }}>
                더보기
              </MoreText>}
            >최근 주문목록</SubTitleComponent>
            <ContentBorderContainer>
              <Table>
                {userInfo?.orders && userInfo?.orders.map((order, idx) => (
                  <>
                    <Tr>
                      {orderColumns.map((itm) => (
                        <>
                          <Td style={{ ...itm.sx(order) }}>{itm.action(order)}</Td>
                        </>
                      ))}
                    </Tr>
                  </>
                ))}
              </Table>
            </ContentBorderContainer>
            <SubTitleComponent
              endComponent={<Row style={{ alignItems: 'center' }}>
                <IconButton onClick={() => {
                  slideRef.current.slickPrev();
                }}>
                  <Icon icon='carbon:previous-filled' style={{ color: themeDnsData?.theme_css?.main_color }} />
                </IconButton>
                <IconButton onClick={() => {
                  slideRef.current.slickNext();
                }}>
                  <Icon icon='carbon:next-filled' style={{ color: themeDnsData?.theme_css?.main_color }} />
                </IconButton>
              </Row>}
            >최근 본 상품</SubTitleComponent>
            <ContentBorderContainer>
              <Items
                items={(userInfo?.product_views ?? []).map(item => {
                  return {
                    ...item,
                    id: item?.product_id
                  }
                })}
                router={router}
                is_slide={(userInfo?.product_views && userInfo?.product_views.length >= 5) ? true : false}
                slide_setting={{
                  autoplay: false,
                  infinite: false,
                }}
                slide_ref={slideRef}
              />
            </ContentBorderContainer>
          </ContentWrappers>
        </RowMobileReverceColumn>
        {/* 미완 */}
      </Wrappers>
    </>
  )
}
export default MyPageDemo