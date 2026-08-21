import { Icon } from "@iconify/react";
import { IconButton, Typography } from "@mui/material";
import Image from 'src/components/image/Image'
import { useRouter } from "next/router";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { Items } from "src/components/elements/shop/common";
import { AuthMenuSideComponent, ContentBorderContainer, ContentWrappers, SubTitleComponent, Title, TitleComponent } from "src/components/elements/shop/demo-4";
import MyPageGuestPanel from "src/components/elements/shop/MyPageGuestPanel";
import { Col, Row, RowMobileColumn, RowMobileReverceColumn, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiShop } from "src/utils/api";
import { commarNumber, getOrderStatusText, commarNumberWithUnit } from "src/utils/function";
import styled from "styled-components";
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import PointPanel from 'src/components/elements/shop/PointPanel';

const Wrappers = styled.div`
max-width:1400px;
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
padding:1rem 0.5rem;
/* 관리자 표와 같은 규칙(content-table.js 주석 참고). pre 는 줄을 안 바꿔서
   표가 옆으로 늘어나고 가로 스크롤이 생긴다. */
white-space:pre-line;
word-break:keep-all;
overflow-wrap:anywhere;
vertical-align:top;
`

const MypageTitle = styled.div`
display: flex;
column-gap: 0.5rem;
font-weight: bold;
margin: auto;
font-family:'Noto Sans KR';
position:relative;
width:100%;
justify-content:space-between;
& span {
  font-size: 32px;
}
@media (max-width:600px) {
  flex-direction: column;
  & span {
    font-size: 16px;
  }
}
`

const MyPageDemo = (props) => {
  const { translate } = useLocales();

  const { user, isInitialized } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({});
  const slideRef = useRef();
  // 비로그인을 로그인 화면으로 튕기던 리다이렉트를 없앴다(11개 프레임 중 여기만 그랬다).
  // 의존성도 []에서 [user]로 바꾼다 — 예전엔 user 로딩이 끝나기 전에 한 번만 돌아
  //   로그인 상태인데도 로그인 화면으로 보내지는 경우가 있었다.
  useEffect(() => {
    if (user) {
      getUserInfo();
    }
  }, [user])

  const getUserInfo = async () => {
    const response = await apiShop('user-info');
    setUserInfo(response);
  }

  // 비로그인이면 게스트 랜딩을 보여준다.
  // isInitialized 를 같이 보는 이유: user 는 로딩 중에도 null 이라 !user 만 보면
  //   로그인 사용자에게도 이 패널이 한 번 깜빡인다.
  // 위치는 훅(useState/useRef/useEffect)을 전부 호출한 뒤여야 훅 순서가 깨지지 않는다.
  if (isInitialized && !user) {
    return <MyPageGuestPanel />;
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
            {formatLang(row, 'product_name')}
          </Typography>
        </Row>
      }
    },
    {
      id: 'product_sale_price',
      label: '',
      action: (row) => {
        return commarNumberWithUnit(row['product_sale_price'])
      }
    },
    {
      id: 'created_at',
      label: '',
      action: (row) => {
        return row?.created_at ?? "---"
      },
    },
  ]
  const orderColumns = [
    {
      id: 'product',
      label: '',
      action: (row) => {
        return <>
          <Row style={{
            alignItems: 'center',
            columnGap: '0.5rem',
            cursor: `${row?.is_cancel == 1 ? '' : 'pointer'}`
          }}
            onClick={() => {
              if (row?.is_cancel != 1) {
                router.push(`/shop/item/${row?.orders[0]?.product_id}`)
                //console.log(row)
              }
            }}>
            <Image
              alt='product image'
              src={row?.orders.length > 0 && row?.orders[0]?.product_img}
              sx={{ width: 64, height: 64, borderRadius: 1.5, mr: 2 }}
            />
            <Col>
              <Typography noWrap variant='subtitle2' sx={{ maxWidth: 240, textDecoration: 'underline' }}>
                {row.item_name}
              </Typography>
              {/*row?.is_cancel != 1 &&
                <Typography noWrap variant='subtitle2' sx={{ maxWidth: 240 }}>
                  ({row?.orders[0]?.product_code})
                </Typography>
              */}
            </Col>
          </Row>
        </>
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
        return commarNumberWithUnit(row.amount)
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
        // is_cancel 만 보면 포스페이·페이레터·위루트 취소(is_cancel_trans)를 놓친다.
        return getOrderStatusText(row)
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
        return row?.updated_at ?? "---"
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
            <TitleComponent style={{ marginBottom: '0' }}>{'마이페이지'}</TitleComponent>
            <ContentBorderContainer style={{ display: 'flex', border: '0' }}>
              <MypageTitle>
                <div style={{ fontSize: '32px' }}>
                  {user?.name} 고객님<br />{translate('안녕하세요 :)')}</div>
                <Row>
                  {/* 내 포인트 — 안 쓰는 가맹점에는 패널이 스스로 아무것도 안 그린다.
                      예전엔 '사용분을 차감하는 코드가 없다'는 이유로 통째로 숨겨 뒀는데,
                      그 이유는 해소됐다(결제에서 원장에 음수 행을 남기고 잔액도 검증한다).
                      주석만 남아 고객이 자기 잔액을 볼 곳이 없었다. */}
                  <PointPanel card={false} />
                  {/* 위탁을 쓰지 않는 가맹점(setting_obj.is_use_consignment != 1)에는 숨긴다.
                      백엔드가 consignment_products 를 아예 안 내려줘 항상 '0개' 로만 보였다. */}
                  {themeDnsData?.setting_obj?.is_use_consignment == 1 &&
                    <div style={{ textAlign: 'right', marginRight: '2rem', fontSize: '1rem' }}>{translate('위탁상품관리')}<br /><br />
                      <span style={{ fontFamily: 'Playfair Display', }}>
                        {commarNumber(userInfo?.consignment_products?.length)}개
                      </span>
                    </div>}
                  <div style={{ textAlign: 'right', fontSize: '1rem' }}>{translate('최근주문목록')}<br /><br />
                    <span style={{ fontFamily: 'Playfair Display', }}>
                      {commarNumber(userInfo?.orders?.length)}개
                    </span>
                  </div>
                </Row>
              </MypageTitle>
            </ContentBorderContainer>

            {/* 위탁 섹션 전체를 게이트. 상단 요약(위)만 숨기고 이 표는 남아 있어
                위탁을 안 쓰는 가맹점에도 빈 '위탁상품관리' 표가 계속 보였다. */}
            {themeDnsData?.setting_obj?.is_use_consignment == 1 &&
            <ContentBorderContainer>
              <SubTitleComponent
                endComponent={<Icon
                  icon={'ph:plus-light'}
                  style={{ width: '25px', height: '25px', margin: 'auto 0', cursor: 'pointer' }}
                  onClick={() => {
                    router.push(`/shop/auth/consignment`)
                  }}
                />}
              >{translate('위탁상품관리')}</SubTitleComponent>
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
            </ContentBorderContainer>}

            <ContentBorderContainer>
              <SubTitleComponent
                endComponent={<Icon
                  icon={'ph:plus-light'}
                  style={{ width: '25px', height: '25px', margin: 'auto 0', cursor: 'pointer' }}
                  onClick={() => {
                    router.push(`/shop/auth/history`)
                  }}
                />}
              >{translate('최근 주문목록')}</SubTitleComponent>
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

            <ContentBorderContainer>
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
              >{translate('최근 본 상품')}</SubTitleComponent>
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
      </Wrappers>
    </>
  )
}
export default MyPageDemo