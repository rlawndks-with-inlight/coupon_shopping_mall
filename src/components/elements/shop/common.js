import styled from 'styled-components'
import { commarNumber, getPointType } from 'src/utils/function'
import { itemThemeCssDefaultSetting } from 'src/views/manager/item-card/setting'
import { useEffect, useState } from 'react'
import { Button, IconButton } from '@mui/material'
import { Icon } from '@iconify/react'
import Slider from 'react-slick'
import { useSettingsContext } from 'src/components/settings'
import _ from 'lodash'
// @mui
import { Box, Card, Pagination, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material'
// components
import { TableHeadCustom, TableNoData } from 'src/components/table'
//
import Image from 'src/components/image/Image'
import { fCurrency } from 'src/utils/formatNumber'
import { getTrxStatusByNumber, makeMaxPage } from 'src/utils/function'
import toast from 'react-hot-toast'
import { apiManager } from 'src/utils/api'
import { useModal } from 'src/components/dialog/ModalProvider'
import { Item1, Seller1 } from './demo-1'
import { Item2, Seller2 } from './demo-2'
import { Item3, Seller3 } from './demo-3'
import { Item4, Seller4 } from './demo-4'
import { Item5, Seller5 } from './demo-5'
import { Item6, Seller6 } from './demo-6'
import { Item7, Seller7 } from './demo-7'
import EmptyContent from 'src/components/empty-content/EmptyContent'
import { Col, themeObj } from '../styled-components'
import { insertCartDataUtil, insertWishDataUtil } from 'src/utils/shop-util'
import { useRouter } from 'next/router'

const ItemsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 2%;
  row-gap: 2rem;
  width: 100%;
  @media (max-width: 650px) {
    column-gap: ${props => (props.theme_css?.container?.is_vertical == 1 ? '0' : '2%')};
  }
`
const ItemWrapper = styled.div`
  width: ${props => (props.theme_css?.container?.is_vertical == 1 ? '32%' : '18.4%')};
  @media (max-width: 1150px) {
    width: ${props => (props.theme_css?.container?.is_vertical == 1 ? '49%' : '32%')};
  }
  @media (max-width: 850px) {
    width: 49%;
  }
  @media (max-width: 650px) {
    width: ${props => (props.theme_css?.container?.is_vertical == 1 ? '100%' : '49%')};
  }
`

export const Seller = props => {
  const { themeDnsData } = useSettingsContext()
  const { shop_demo_num = 0 } = themeDnsData
  const returnSellerCard = () => {
    if (shop_demo_num == 1) return <Seller1 {...props} />
    else if (shop_demo_num == 2) return <Seller2 {...props} />
    else if (shop_demo_num == 3) return <Seller3 {...props} />
    else if (shop_demo_num == 4) return <Seller4 {...props} />
    else if (shop_demo_num == 5) return <Seller5 {...props} />
    else if (shop_demo_num == 6) return <Seller6 {...props} />
    else if (shop_demo_num == 7) return <Seller7 {...props} />
  }
  return <>{returnSellerCard()}</>
}

export const Sellers = props => {
  const { sellers = [], router } = props
  const item_list_setting = {
    infinite: true,
    speed: 500,
    autoplay: false,
    autoplaySpeed: 2500,
    slidesToShow: 2,
    slidesToScroll: 1,
    dots: false
  }
  return (
    <>
      <ItemsContainer>
        {sellers &&
          sellers.map((item, idx) => {
            return (
              <ItemWrapper>
                <Seller item={item} router={router} />
              </ItemWrapper>
            )
          })}
      </ItemsContainer>
    </>
  )
}

export const Item = props => {
  const { themeDnsData } = useSettingsContext()
  const { shop_demo_num = 0 } = themeDnsData
  const returnSellerCard = () => {
    if (shop_demo_num == 1) return <Item1 {...props} />
    else if (shop_demo_num == 2) return <Item2 {...props} />
    else if (shop_demo_num == 3) return <Item3 {...props} />
    else if (shop_demo_num == 4) return <Item4 {...props} />
    else if (shop_demo_num == 5) return <Item5 {...props} />
    else if (shop_demo_num == 6) return <Item6 {...props} />
    else if (shop_demo_num == 7) return <Item7 {...props} />
  }
  return <>{returnSellerCard()}</>
}
export const Items = props => {
  const { themeDnsData } = useSettingsContext()
  const { items, router, is_slide, slide_setting = {}, slide_ref, seller } = props;
  const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting)

  useEffect(() => {
    if (themeDnsData) {
      setItemThemeCss(Object.assign(itemThemeCss, themeDnsData?.theme_css?.shop_item_card_css))
    }
  }, [themeDnsData])
  const getSlideToShow = () => {
    if (window.innerWidth > 1150) {
      if (itemThemeCss?.container?.is_vertical == 1) {
        return 3
      } else {
        return 5
      }
    }
    if (window.innerWidth > 850) {
      if (itemThemeCss?.container?.is_vertical == 1) {
        return 2
      } else {
        return 3
      }
    }
    if (itemThemeCss?.container?.is_vertical == 1) {
      return 1
    } else {
      return 2
    }
  }
  const items_setting = {
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: getSlideToShow(),
    slidesToScroll: 1,
    dots: false,
    ...slide_setting
  }
  return (
    <>
      {is_slide ? (
        <>
          <Slider {...items_setting} className='margin-slide' ref={slide_ref}>
            {items &&
              items.map((item, idx) => {
                return (
                  <ItemWrapper theme_css={itemThemeCss}>
                    <Item item={item} router={router} theme_css={itemThemeCss} seller={seller} />
                  </ItemWrapper>
                )
              })}
          </Slider>
        </>
      ) : (
        <>
          <ItemsContainer theme_css={itemThemeCss}>
            {items &&
              items.map((item, idx) => {
                return (
                  <ItemWrapper theme_css={itemThemeCss}>
                    <Item item={item} router={router} theme_css={itemThemeCss} seller={seller} />
                  </ItemWrapper>
                )
              })}
          </ItemsContainer>
        </>
      )}
    </>
  )
}

export const HistoryTable = props => {
  const { historyContent, onChangePage, searchObj } = props
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
  const { setModal } = useModal()
  const onPayCancelRequest = async row => {
    let result = await apiManager(`transactions/${row?.id}/cancel-request`, 'create')
    if (result) {
      toast.success('취소요청이 완료되었습니다.')
      onChangePage(searchObj)
    }
  }
  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 720, overflowX: 'auto' }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />
          <TableBody>
            {historyContent?.content &&
              historyContent?.content.map(row => (
                <>
                  <TableRow>
                    <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                      <Image
                        alt='product image'
                        src={row?.orders.length > 0 && row?.orders[0]?.product_img}
                        sx={{ width: 64, height: 64, borderRadius: 1.5, mr: 2 }}
                      />
                      <Typography noWrap variant='subtitle2' sx={{ maxWidth: 240 }}>
                        {row.item_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.ord_num}</TableCell>
                    <TableCell>{fCurrency(row.amount)}원</TableCell>
                    <TableCell>{row?.buyer_name}</TableCell>
                    <TableCell>{getTrxStatusByNumber(row?.trx_status)}</TableCell>
                    <TableCell>
                      <Box sx={{ textAlign: 'right', color: 'text.secondary' }}>{row?.updated_at}</Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ textAlign: 'right', color: 'text.secondary' }}>
                        {row?.is_cancel == 1 || row?.trx_status == 1 ? (
                          <>---</>
                        ) : (
                          <>
                            <IconButton>
                              <Icon
                                icon='material-symbols:cancel-outline'
                                onClick={() => {
                                  setModal({
                                    func: () => {
                                      onPayCancelRequest(row)
                                    },
                                    icon: 'material-symbols:cancel-outline',
                                    title: '주문취소요청 하시겠습니까?'
                                  })
                                }}
                              />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                </>
              ))}
          </TableBody>
        </Table>
        {historyContent?.content && historyContent?.content.length == 0 &&
          <>
            <Col>
              <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
              <div style={{ margin: 'auto auto 8rem auto' }}>주문내역이 없습니다.</div>
            </Col>
          </>}
      </TableContainer>
    </>
  )
}
export const PointTable = props => {
  const { historyContent } = props
  const TABLE_HEAD = [
    { id: 'point', label: '포인트' },
    { id: 'created_at', label: '발생일' },
    { id: 'type', label: '비고' },
    { id: '' },
  ];
  const { setModal } = useModal()

  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 720, overflowX: 'auto' }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />
          <TableBody>
            {historyContent?.content &&
              historyContent?.content.map(row => (
                <>
                  <TableRow>
                    <TableCell>{`${row['point'] > 0 ? '+' : ''}` + commarNumber(row['point'])}</TableCell>
                    <TableCell>{row?.created_at}</TableCell>
                    <TableCell>{getPointType(row)}</TableCell>
                  </TableRow>
                </>
              ))}
          </TableBody>
        </Table>
        {historyContent?.content && historyContent?.content.length == 0 &&
          <>
            <Col>
              <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
              <div style={{ margin: 'auto auto 8rem auto' }}>포인트내역이 없습니다.</div>
            </Col>
          </>}
      </TableContainer>
    </>
  )
}

export const AddressTable = props => {
  const { addressContent, onDelete } = props
  const TABLE_HEAD = [
    { id: 'No.', label: 'No.' },
    { id: 'addr', label: '주소' },
    { id: 'detail_addr', label: '상세주소' },
    { id: '' },
  ];
  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 720, overflowX: 'auto' }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />
          <TableBody>
            {addressContent?.content &&
              addressContent?.content.map((row, idx) => (
                <>
                  <TableRow>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{row?.addr}</TableCell>
                    <TableCell>{row?.detail_addr}</TableCell>
                    <TableCell align='right'>
                      <IconButton onClick={() => onDelete(row?.id)}>
                        <Icon icon='eva:trash-2-outline' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </>
              ))}

          </TableBody>
        </Table>
        {addressContent?.content && addressContent?.content.length == 0 &&
          <>
            <Col>
              <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
              <div style={{ margin: 'auto auto 8rem auto' }}>배송지가 없습니다.</div>
            </Col>
          </>}
      </TableContainer>
    </>
  )
}
export const WishTable = props => {
  const { wishContent, onDelete } = props

  const { themeWishData, onChangeWishData, themeCartData, onChangeCartData } = useSettingsContext();
  const TABLE_HEAD = [
    { id: 'product_img', label: '상품' },
    { id: 'product_name', label: '상품명' },
    { id: 'product_sale_price', label: '상품금액' },
    { id: 'cart', label: '장바구니' },
    { id: 'delete', label: '' },
  ];
  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 720, overflowX: 'auto' }}>
          <TableHeadCustom headLabel={TABLE_HEAD} />
          <TableBody>
            {wishContent &&
              wishContent.map((row, idx) => (
                <>
                  <TableRow>
                    <TableCell>
                      <Image
                        alt="product image"
                        src={row?.product_img}
                        sx={{ width: 64, height: 64, borderRadius: 1.5, mr: 2 }}
                      />
                    </TableCell>
                    <TableCell>{row?.product_name}</TableCell>
                    <TableCell>
                      {row?.product_price > row?.product_sale_price && (
                        <Box
                          component="span"
                          sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
                        >
                          {commarNumber(row?.product_price)}
                        </Box>
                      )}
                      {commarNumber(row?.product_sale_price)}원
                    </TableCell>
                    <TableCell>
                      <Button variant='outlined' onClick={() => {
                        insertCartDataUtil(row, false, themeCartData, onChangeCartData)
                      }}>
                        장바구니담기
                      </Button>
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton onClick={() => insertWishDataUtil(row, themeWishData, onChangeWishData)}>
                        <Icon icon='eva:trash-2-outline' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </>
              ))}

          </TableBody>
        </Table>
        {wishContent && wishContent.length == 0 &&
          <>
            <Col>
              <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
              <div style={{ margin: 'auto auto 8rem auto' }}>위시상품이 없습니다.</div>
            </Col>
          </>}
      </TableContainer>
    </>
  )
}
