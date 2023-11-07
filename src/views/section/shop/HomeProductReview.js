import { Icon } from '@iconify/react'
import Slider from 'react-slick'
import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import _ from 'lodash'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { Rating, Typography } from '@mui/material'
import { useRouter } from 'next/router'

const Wrappers = styled.div`
  width:90%;
  max-width:1600px;
  margin:0 auto;
  display:flex;
  flex-direction:column;
  `
const ReviewsContainer = styled.div`
display:flex;
flex-wrap:wrap;
column-gap: 2%;
row-gap: 2rem;
width:100%;
@media (max-width: 650px) {
  column-gap: 2%;
}
`
const ReviewWrapper = styled.div`
width:18.4%;
@media (max-width: 1150px) {
  width:32%
}
@media (max-width: 850px) {
  width:49%;
}
`
const ReviewContainer = styled.div`
width:100%;
display:flex;
flex-direction: column;
cursor:pointer;
transition: 0.5s;
position: relative;
box-shadow: 0 4px 4px #00000029;
&:hover{
  transform: translateY(-8px);
}
`

const Review = (props) => {
  const router = useRouter();
  const { item } = props;
  return (
    <>
      <ReviewContainer onClick={() => {
        router.push(`/shop/item/${item?.product_id}`)
      }}>
        <LazyLoadImage src={item?.profile_img} style={{ width: '100%', height: 'auto' }} />
        <Row style={{ flexDirection: 'column', padding: '0.5rem', rowGap: '0.25rem' }}>
          <div style={{ color: themeObj.grey[500] }}>{item?.nickname}</div>
          <Rating value={item?.scope / 2} readOnly={true} precision={0.5} />
          <Typography variant='subtitle2'>
            {item?.title}
          </Typography>
          <Typography variant='body2'>
            {item?.content}
          </Typography>
        </Row>
      </ReviewContainer>
    </>
  )
}
const HomeProductReview = (props) => {
  const { column, data, func, is_manager } = props;
  const { style } = column;

  return (
    <>
      <Wrappers style={{ marginTop: `${style?.margin_top}px` }}>
        {column?.title &&
          <>
            <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold', margin: '0 auto' }}>{column?.title}</div>
            {column?.sub_title &&
              <>
                <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500], margin: '0 auto' }}>{column?.sub_title}</div>
              </>}
          </>}
        <div style={{ marginTop: '1rem' }} />
        <ReviewsContainer>
          {column?.list && column?.list.map((item, index) => (
            <>
              <ReviewWrapper>
                <Review item={item} />
              </ReviewWrapper>
            </>
          ))}
        </ReviewsContainer>
      </Wrappers>
    </>
  )
}
export default HomeProductReview;