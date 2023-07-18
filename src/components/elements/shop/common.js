import styled from "styled-components";
import { Row, themeObj } from "../styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { commarNumber } from "src/utils/function";
import { itemThemeCssDefaultSetting } from "src/pages/manager/designs/item-card";
import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { Icon } from "@iconify/react";
import Slider from "react-slick";

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

  const { item, router, style, theme_css } = props;
  const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);
  useEffect(() => {
    if (theme_css) {
      setItemThemeCss(theme_css)
    }
  }, [theme_css])
  return (
    <>
      <ItemContainer style={{
        padding: `${itemThemeCss.container.padding}%`,
        columnGap: `0.5rem`,
        rowGap: `0.5rem`,
        flexDirection: `${itemThemeCss.container.is_vertical == 1 ? 'row' : 'column'}`,
        border: `${itemThemeCss.container.border_width}px solid ${itemThemeCss.container.border_color}`,
        borderRadius: `${itemThemeCss.container.border_radius}px`,
        boxShadow: `${itemThemeCss.shadow.x}px ${itemThemeCss.shadow.y * (-1)}px ${itemThemeCss.shadow.width}px ${itemThemeCss.shadow.color}${itemThemeCss.shadow.darkness > 9 ? '' : '0'}${itemThemeCss.shadow.darkness}`
      }}

      >
        <IconButton sx={{ position: 'absolute', right: '2px', top: '2px' }}>
          <Icon icon={'basil:heart-outline'} fontSize={'2rem'} />
        </IconButton>
        <ItemImg src={item.product_img} style={{
          width: `${itemThemeCss.container.is_vertical == 1 ? '50%' : '100%'}`,
          height: `${itemThemeCss.container.is_vertical == 1 ? `50%` : `100%`}`,
          borderRadius: `${itemThemeCss.image.border_radius}px`,
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
          <ItemName>{item.name}</ItemName>
          <ItemSubName>{item.sub_name}</ItemSubName>
          <ItemPrice style={{
            marginTop: 'auto'
          }}>
            {item.item_pr < item.mkt_pr &&
              <>
                <div style={{ color: 'red', marginRight: '0.25rem' }}>
                  {commarNumber((item.mkt_pr - item.item_pr) * 100 / item.mkt_pr) + '%'}
                </div>
              </>}
            <div>{commarNumber(item.item_pr)} 원</div>
            {item.item_pr < item.mkt_pr &&
              <>
                <div style={{ textDecoration: 'line-through', marginLeft: '0.25rem', fontSize: themeObj.font_size.size7, color: themeObj.grey[500] }}>
                  {item.item_pr < item.mkt_pr ? commarNumber(item.mkt_pr) : ''}
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
width:${props => props.theme_css?.container?.is_vertical == 1 ? '32%' : '23.5%'};
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
  const { items, router, theme_css, is_slide } = props;
  const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);
  useEffect(() => {
    if (theme_css) {
      setItemThemeCss(Object.assign(itemThemeCss, theme_css));
    }
  }, [theme_css])
  const items_setting = {
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: (window.innerWidth > 1350 ? 4 : window.innerWidth > 1000 ? 3 : theme_css?.container?.is_vertical == 1 ? 1 : 2),
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
