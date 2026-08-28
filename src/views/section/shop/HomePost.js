import { Icon } from '@iconify/react'
import Slider from 'react-slick'
import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import _ from 'lodash'
import { useState } from 'react'
import { IconButton } from '@mui/material'
import { formatLang } from 'src/utils/format';

const FullWrappers = styled.div`
  width:100%;
  display:flex;
  flex-wrap: wrap;
  /* 예전 min-height 600/800px 은 배경 이미지·글이 적을 때 거대한 검은 빈 띠가 됐다. 필요한 만큼만 차지하도록 줄인다. */
  min-height: 360px;
  padding: 2rem 0;
  /* 스톡 사진(검은 배경에 주황색 물음표)이 모든 가맹점 게시판 배경으로 깔려 있었다.
     경로부터 /images/test/ 인 테스트 자산이고, 공지·이벤트 배경으로 뜻도 안 맞았다.
     이 섹션에는 이미 배경 이미지 업로드 칸이 있다(메인페이지관리 → 게시판).
     안 올렸을 때의 기본값만 걷어낸다.
  background-image: url('/images/test/notice-banner.jpg'); */
  /* 배경을 통째로 비우면 안 된다 — 이 섹션의 글자와 테두리가 전부 흰색이라
     흰 바닥에 흰 글씨가 된다. 사진을 안 올린 동안은 어두운 바닥을 깔아 둔다. */
  background-color: #2b2b2b;
  background-size: cover;
  background-repeat: no-repeat;
  /* 'fixed' 는 background-position 의 유효값이 아니다(무효). 가운데 정렬이 의도였다. */
  background-position: center;
  margin: 0 auto;
  background-attachment: fixed;
  @media (max-width:1200px){
    flex-direction:column;
    min-height: 460px;
  }
`
const ContentWrappers = styled.div`
/* 화면 폭이 아니라 담긴 자리를 따른다.
   블로그형 홈은 컬럼이 840px 로 묶여 있어서 1400px 모니터에서도 이 칸은 420px 다.
   그런데 접히는 조건이 @media(화면 1200px)라 넓은 화면 가지에 그대로 남았고,
   안의 600px 상자가 420px 칸을 180px 삐져나왔다. flex 에 맡기면 자리가 좁을 때
   알아서 아래로 내려간다 — 화면 크기를 몰라도 된다. */
flex: 1 1 320px;
min-width: 0;
display:flex;
flex-direction:column;
align-items:center;
@media (max-width:1200px){
  width:100%;
  margin:4rem auto 0 auto;
}
`
const Content = styled.div`
margin: auto;
display:flex;
flex-direction:column;
align-items:center;
width:100%;

`
const PostBox = styled.div`
padding:1rem;
display:flex;
flex-direction:column;
border:1px solid #fff;
width:100%;
max-width:600px;
background:#00000099;
@media (max-width:1200px){
  width:80%;
}
`
const PostCategoryTabContainer = styled.div`
display:flex;
overflow-x: auto;
white-space: nowrap;
margin: 0 auto;
width:100%;
max-width:600px;
@media (max-width:1200px){
  width:80%;
}
`
const PostCategoryTab = styled.div`
padding:0.5rem;
cursor:pointer;
font-size:${themeObj.font_size.size5};
`
const PostCategoryTitle = styled.div`
width:100%;
font-size:${themeObj.font_size.size3};
font-weight:bold;
padding:0 0 0.5rem 0;
border-bottom:1px solid #fff;
justify-content:space-between;
display:flex;

`
const PostTitle = styled.div`
margin: 0.2rem 0;
cursor:pointer;
`
const HomePost = (props) => {
  const { column, data, func, is_manager } = props;
  const { themeDnsData } = data;
  const { router } = func;
  const { style } = column;
  const [categoryId, setCategoryId] = useState(0);
  return (
    <>
      <FullWrappers style={{ marginTop: `${style?.margin_top}px`, backgroundImage: `${column?.src ? `url(${column?.src})` : ''}` }}>
        <ContentWrappers>
          <Content style={{ color: '#fff' }}>
            <div style={{ fontSize: themeObj.font_size.size5 }}>CALL CENTER</div>
            {themeDnsData?.phone_num && <div style={{ fontSize: themeObj.font_size.size3 }}>PHONE: {themeDnsData?.phone_num}</div>}
            {themeDnsData?.fax_num && <div style={{ fontSize: themeObj.font_size.size3 }}>FAX: {themeDnsData?.fax_num}</div>}
          </Content>
        </ContentWrappers>
        <ContentWrappers>
          <Content style={{ color: '#fff', margin: '4rem auto' }}>
            <PostCategoryTabContainer>
              {column?.list && column?.list.map((cate, idx) => (
                <>
                  <PostCategoryTab
                    style={{ fontWeight: `${idx == categoryId ? 'bold' : ''}` }}
                    onClick={() => {
                      setCategoryId(idx)
                    }}>{formatLang(cate, 'post_category_title')}</PostCategoryTab>
                </>
              ))}
            </PostCategoryTabContainer>
            <PostBox>
              <PostCategoryTitle>
                <div>
                  {formatLang(column?.list?.[categoryId], 'post_category_title')}
                </div>
                <IconButton onClick={() => router.push(`/shop/service/${column?.list?.[categoryId]?.id}`)}>
                  <Icon icon={'ic:baseline-plus'} style={{ color: '#fff' }} />
                </IconButton>
              </PostCategoryTitle>
              
              {column?.list?.[categoryId]?.recent_posts && column?.list?.[categoryId]?.recent_posts.map((item, idx) => (
                <>
                  <PostTitle onClick={() => router.push(`/shop/service/${column?.list?.[categoryId]?.id}/${item?.id}/`)}>{item?.post_title}</PostTitle>
                </>
              ))}
            </PostBox>
          </Content>
        </ContentWrappers>
      </FullWrappers>
    </>
  )
}
export default HomePost;