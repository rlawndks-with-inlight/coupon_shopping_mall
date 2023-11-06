import styled from "styled-components";
import { Row, themeObj } from "../styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { commarNumber, getPointType } from "src/utils/function";
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting";
import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import Slider from "react-slick";
import { useSettingsContext } from "src/components/settings";
import _ from "lodash";
import { Title } from 'src/components/elements/styled-components';
import PropTypes from 'prop-types';
// @mui
import { Box, Card, Pagination, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from '@mui/material';
// components
import { TableHeadCustom } from 'src/components/table';
//
import { test_items } from 'src/data/test-data';
import Image from 'src/components/image/Image';
import { fCurrency } from 'src/utils/formatNumber';
import { getTrxStatusByNumber, makeMaxPage } from 'src/utils/function';
import { insertWishDataUtil } from "src/utils/shop-util";
import toast from "react-hot-toast";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiManager } from "src/utils/api";
import { useModal } from "src/components/dialog/ModalProvider";
const ItemName = styled.div`
font-weight: bold;
font-size:${themeObj.font_size.size7};
word-break: break-all;
`
const ItemSubName = styled.div`
margin-top:0.25rem;
color:${themeObj.grey[500]};
font-size:${themeObj.font_size.size8};
word-break: break-all;
`
const ItemPrice = styled.div`
margin-top:0.5rem;
font-size:${themeObj.font_size.size7};
display:flex;
align-items:end;
flex-wrap:wrap;
`
const ItemContainer = styled.div`
width:100%;
display:flex;
cursor:pointer;
transition: 0.5s;
position: relative;
&:hover{
  transform: translateY(-8px);
}
`
const ItemImg = styled.img`
`
const ItemTextContainer = styled.div`
display:flex;
flex-direction: column;
`

export const Item = (props) => {

  const { user } = useAuthContext();
  const { themeWishData, onChangeWishData } = useSettingsContext();
  const { item, router, theme_css } = props;
  const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);
  useEffect(() => {
    if (theme_css) {
      setItemThemeCss(theme_css)
    }
  }, [theme_css])
  const onClickHeart = () => {
    if (user) {
      insertWishDataUtil(item, themeWishData, onChangeWishData);
    } else {
      toast.error('로그인을 해주세요.')
    }
  }
  return (
    <>
      <ItemContainer style={{
        padding: `${itemThemeCss?.container?.padding}%`,
        columnGap: `0.5rem`,
        rowGap: `0.5rem`,
        flexDirection: `${itemThemeCss?.container.is_vertical == 0 ? 'column' : 'row'}`,
        border: `${itemThemeCss?.container.border_width}px solid ${itemThemeCss?.container.border_color}`,
        borderRadius: `${itemThemeCss?.container.border_radius}px`,
        boxShadow: `${itemThemeCss?.shadow.x}px ${itemThemeCss?.shadow.y * (-1)}px ${itemThemeCss?.shadow.width}px ${itemThemeCss?.shadow.color}${itemThemeCss?.shadow.darkness > 9 ? '' : '0'}${itemThemeCss?.shadow.darkness}`
      }}
      >
        <IconButton sx={{ position: 'absolute', right: '2px', top: '2px' }} onClick={onClickHeart}>
          <Icon icon={themeWishData.map(itm => { return itm?.product_id }).includes(item?.id) ? 'mdi:heart' : 'mdi:heart-outline'} fontSize={'2rem'} style={{
            color: `${themeWishData.map(itm => { return itm?.product_id }).includes(item?.id) ? 'red' : ''}`
          }} />
        </IconButton>
        <ItemImg src={item.product_img} style={{
          width: `${itemThemeCss?.container.is_vertical == 0 ? '100%' : '50%'}`,
          height: `auto`,
          borderRadius: `${itemThemeCss?.image.border_radius}px`,
        }}
          onClick={() => {
            if (item?.id) {
              router.push(`/shop/item/${item?.id}`)
            }
          }} >
        </ItemImg>
        <ItemTextContainer
          onClick={() => {
            if (item?.id) {
              router.push(`/shop/item/${item?.id}`)
            }
          }}>
          <ItemName>{item.product_name}</ItemName>
          <ItemSubName>{item.product_comment}</ItemSubName>
          <ItemPrice style={{
            marginTop: 'auto'
          }}>
            {item.product_sale_price < item.product_price &&
              <>
                <div style={{ color: 'red', marginRight: '0.25rem' }}>
                  {commarNumber((item.product_price - item.product_sale_price) * 100 / item.product_price) + '%'}
                </div>
              </>}
            <div>{commarNumber(item.product_sale_price)} 원</div>
            {item.product_sale_price < item.product_price &&
              <>
                <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                  {item.product_sale_price < item.product_price ? commarNumber(item.product_price) : ''}
                </div>
              </>}
          </ItemPrice>
        </ItemTextContainer>
      </ItemContainer>
    </>
  )
}

const ItemsContainer = styled.div`
display:flex;
flex-wrap:wrap;
column-gap: 2%;
row-gap: 2rem;
width:100%;
@media (max-width: 650px) {
  column-gap: ${props => props.theme_css?.container?.is_vertical == 1 ? '0' : '2%'};;
}
`
const ItemWrapper = styled.div`
width:${props => props.theme_css?.container?.is_vertical == 1 ? '32%' : '18.4%'};
@media (max-width: 1150px) {
  width:${props => props.theme_css?.container?.is_vertical == 1 ? '49%' : '32%'};
}
@media (max-width: 850px) {
  width:49%;
}
@media (max-width: 650px) {
  width:${props => props.theme_css?.container?.is_vertical == 1 ? '100%' : '49%'};
}
`
export const Items = (props) => {
  const { themeDnsData } = useSettingsContext();
  const { items, router, theme_css, is_slide } = props;
  const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);
  useEffect(() => {
    if (themeDnsData) {
      setItemThemeCss(Object.assign(itemThemeCss, themeDnsData?.theme_css?.shop_item_card_css));
    }
  }, [themeDnsData])
  const getSlideToShow = () => {
    if (window.innerWidth > 1350) {
      if (itemThemeCss?.container?.is_vertical == 1) {
        return 3
      } else {
        return 5
      }
    }
    if (window.innerWidth > 1000) {
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
  }
  return (
    <>
      {is_slide ?
        <>
          <Slider {...items_setting} className='margin-slide'>
            {items && items.map((item, idx) => {
              return <ItemWrapper theme_css={itemThemeCss}>
                <Item item={item} router={router} theme_css={itemThemeCss} />
              </ItemWrapper>
            })}
          </Slider>
        </>
        :
        <>
          <ItemsContainer theme_css={itemThemeCss}>
            {items && items.map((item, idx) => {
              return <ItemWrapper theme_css={itemThemeCss}>
                <Item item={item} router={router} theme_css={itemThemeCss} />
              </ItemWrapper>
            })}
          </ItemsContainer>
        </>}
    </>
  )
}

export const HistoryTable = (props) => {
  const { historyContent, headLabel, onChangePage, searchObj } = props;
  const { setModal } = useModal();
  const onPayCancelRequest = async (row) => {
    let result = await apiManager(`transactions/${row?.id}/cancel-request`, 'create');
    if (result) {
      toast.success('취소요청이 완료되었습니다.');
      onChangePage(searchObj);
    }
  }
  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 720, overflowX: 'auto' }}>
          <TableHeadCustom headLabel={headLabel} />
          <TableBody>
            {historyContent?.content && historyContent?.content.map((row) => (
              <>
                <TableRow>
                  <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                      alt="product image"
                      src={row?.orders.length > 0 && row?.orders[0]?.product_img}
                      sx={{ width: 64, height: 64, borderRadius: 1.5, mr: 2 }}
                    />
                    <Typography noWrap variant="subtitle2" sx={{ maxWidth: 240 }}>
                      {row.item_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.ord_num}
                  </TableCell>
                  <TableCell>
                    {fCurrency(row.amount)}원
                  </TableCell>
                  <TableCell>
                    {row?.buyer_name}
                  </TableCell>
                  <TableCell>
                    {getTrxStatusByNumber(row?.trx_status)}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ textAlign: 'right', color: 'text.secondary', }}
                    >
                      {row?.updated_at}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ textAlign: 'right', color: 'text.secondary', }}
                    >
                      {row?.is_cancel == 1 || row?.trx_status == 1 ?
                        <>
                          ---
                        </>
                        :
                        <>
                          <IconButton>
                            <Icon icon='material-symbols:cancel-outline' onClick={() => {
                              setModal({
                                func: () => { onPayCancelRequest(row) },
                                icon: 'material-symbols:cancel-outline',
                                title: '주문취소요청 하시겠습니까?'
                              })
                            }} />
                          </IconButton>
                        </>}

                    </Box>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
export const PointTable = (props) => {
  const { historyContent, headLabel, onChangePage, searchObj } = props;
  const { setModal } = useModal();
  const onPayCancelRequest = async (row) => {
    let result = await apiManager(`transactions/${row?.id}/cancel-request`, 'create');
    if (result) {
      toast.success('취소요청이 완료되었습니다.');
      onChangePage(searchObj);
    }
  }
  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 720, overflowX: 'auto' }}>
          <TableHeadCustom headLabel={headLabel} />
          <TableBody>
            {historyContent?.content && historyContent?.content.map((row) => (
              <>
                <TableRow>
                  <TableCell>
                    {`${row['point'] > 0 ? '+' : ''}` + commarNumber(row['point'])}
                  </TableCell>
                  <TableCell>
                    {row?.created_at}
                  </TableCell>
                  <TableCell>
                    {getPointType(row)}
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
export const AddressTable = (props) => {
  const { addressContent, headLabel, onDelete } = props;
  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 720, overflowX: 'auto' }}>
          <TableHeadCustom headLabel={headLabel} />
          <TableBody>
            {addressContent?.content && addressContent?.content.map((row, idx) => (
              <>
                <TableRow>
                  <TableCell>
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    {row?.addr}
                  </TableCell>
                  <TableCell>
                    {row?.detail_addr}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => onDelete(row?.id)}>
                      <Icon icon="eva:trash-2-outline" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}