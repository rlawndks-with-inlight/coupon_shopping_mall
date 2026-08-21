import { commarNumber } from 'src/utils/function';


import { useEffect, useState } from "react";
import styled from "styled-components";

import { Button, CircularProgress, IconButton, Pagination, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Col, Row, themeObj } from './styled-components';
import { useRouter } from 'next/router';
import { useSettingsContext } from '../settings';
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useModal } from '../dialog/ModalProvider';
import { apiShop } from 'src/utils/api';
import { useLocales } from 'src/locales';
const Table = styled.table`
font-size:${themeObj.font_size.size8};
width:100%;
text-align:center;
border-collapse: collapse;
min-width:350px;
/* 줄바꿈으로도 다 못 담는 표가 남는다(칸이 열 개 넘는 주문관리 같은 것).
   그때 옆으로 밀면 어느 줄을 보고 있는지 놓치므로 첫 칸을 붙박이로 둔다. */
th:first-child, td:first-child{
  position:sticky;
  left:0;
  z-index:1;
  background:inherit;
}
`
const Tr = styled.tr`
width:100%;
height:26px;
`
const Td = styled.td`
border-bottom:1px solid ${themeObj.grey[300]};
padding:1rem 0.5rem;
/* 예전엔 white-space:pre 였다. 줄을 절대 바꾸지 않으니 글이 길수록 표가 옆으로 늘어났고,
   노트북에서는 가로 스크롤을 화면 맨 아래까지 내려가서 좌우로 끌어야 했다.
   게다가 pre 는 데이터에 든 개행을 그대로 살려서 엉뚱한 자리에서 끊겼다.
   pre-line = 원문 줄바꿈은 살리되, 칸을 넘치면 알아서 줄을 바꾼다.
   keep-all  = 한국어를 글자 단위로 쪼개지 않는다(단어째 내려간다).
   break-word= 그래도 안 들어가는 긴 토막(주문번호·URL)만 끊어 넘긴다.
               anywhere 를 쓰면 안 된다 — 그건 칸의 '최소 너비' 까지 글자 하나로 보게 만들어서,
               표가 칸을 극단으로 좁힌다(주소가 한 글자씩 세로로 쪼개졌다). */
white-space:pre-line;
word-break:keep-all;
overflow-wrap:break-word;
vertical-align:top;
/* 한 칸이 표 전체를 늘리지 못하게 막는다 — 주소·상품명이 길면 두세 줄로 접힌다. */
max-width:260px;
`
const GalleryCol = styled.div`
display:flex;
flex-direction:column;
width: 32%;
align-items: center;
row-gap: 0.5rem;
margin-bottom:1.5rem;
cursor:pointer;
@media (max-width:1000px){
  width: 49%;
}
@media (max-width:600px){
  width: 100%;
}
`
const ContentTable = (props) => {
  const { setModal } = useModal()
  const { translate } = useLocales();
  const { data, onChangePage, searchObj, columns, postCategory } = props;
  // postCategory 는 themePostCategoryList 에서 find 한 결과라 '못 찾으면 undefined' 다
  // (삭제된 게시판 id·하위 게시판 id·오래된 북마크로 들어오면 그렇게 된다).
  // 옵셔널 체이닝이 없어 여기서 TypeError 가 나고, 앱에 ErrorBoundary 가 없어
  // 게시판 화면이 통째로 백지가 됐다. 같은 파일의 다른 참조는 이미 postCategory?. 다.
  const { post_category_type } = postCategory ?? {};
  const { page, page_size } = props?.searchObj;
  const router = useRouter();
  const { themeMode } = useSettingsContext();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const getMaxPage = (total, page_size) => {
    if (total == 0) {
      return 1;
    }
    if (total % page_size == 0) {
      return parseInt(total / page_size);
    } else {
      return parseInt(total / page_size) + 1;
    }
  }
  const deletePost = async (id) => {
    let result = await apiShop('post', 'delete', { id });
    if (result) {
      onChangePage({ ...searchObj });
    }
  }
  // 제목뿐 아니라 행(칸) 전체를 눌러도 상세로 들어가게 한다.
  // '관리' 칸의 수정/삭제 아이콘까지 같이 눌리면 안 되므로, 버튼·링크·입력 위에서 시작된
  // 클릭은 무시한다(수정 버튼은 자기 라우팅, 삭제 버튼은 확인 모달을 각자 처리).
  const onRowClick = (e, row) => {
    if (e?.target?.closest?.('button, a, input, textarea, select, [role="button"]')) return;
    const categoryId = postCategory?.id ?? router.query?.article_category;
    if (categoryId === undefined || categoryId === null || !row?.id) return;
    router.push(`/shop/service/${categoryId}/${row?.id}/`);
  }
  return (
    <>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {!data.content ?
          <>
            <Row style={{ height: '400px' }}>
              <CircularProgress sx={{ margin: 'auto' }} />
            </Row>
          </>
          :
          <>
            {post_category_type == 0 &&
              <>
                {/* 가로 스크롤 막대가 표 맨 아래에만 있으면, 내용이 긴 표에서는 화면을 한참 내려가야
                    막대에 닿는다(가맹점 피드백 2026-08-21 — 노트북에서 특히 불편). 스크롤 영역의
                    높이를 화면 안에 묶어 두면 막대가 늘 화면 안에 남는다. */}
                <div className='subtype-container' style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '78vh', display: 'flex', width: '100%', margin: '0 auto', flexDirection: 'column' }} >
                  <Table>
                    <Tr style={{ fontWeight: `bold`, background: `${themeMode == 'dark' ? themeObj.grey[700] : themeObj.grey[200]}`, borderBottom: 'none' }}>
                      {columns && columns.map((col, idx) => (
                        <>
                          <Td align="left" sx={{ ...col.sx }}>{col.label}</Td>
                        </>
                      ))}
                    </Tr>
                    {data?.content && data?.content.map((row, index) => (
                      <Tr
                        style={{ color: `${themeMode == 'dark' ? '#fff' : themeObj.grey[700]}`, cursor: 'pointer' }}
                        onClick={(e) => onRowClick(e, row)}
                      >
                        {columns && columns.map((col, idx) => (
                          <>
                            <Td align="left" sx={{ ...col.sx }}>{col.action(row)}</Td>
                          </>
                        ))}
                      </Tr>
                    ))}
                  </Table>
                </div>
              </>}
            {post_category_type == 1 &&
              <>
                <Row style={{ flexWrap: 'wrap', columnGap: '2%' }}>
                  {data?.content && data?.content.map((row, index) => (
                    <GalleryCol>
                      <LazyLoadImage style={{ width: '100%', height: 'auto' }} src={row?.post_title_img} onClick={() => {
                        router.push(`/shop/service/${postCategory?.id}/${row?.id}/`)
                      }} />
                      <Typography variant='subtitle2' onClick={() => {
                        router.push(`/shop/service/${postCategory?.id}/${row?.id}/`)
                      }}>{row?.post_title}</Typography>
                      <Typography variant='body2' color={themeObj.grey[500]}>{row?.created_at ?? "---"}</Typography>
                      <Row>
                        {(postCategory?.is_able_user_add == 1 && user?.id && row?.user_id == user?.id) &&
                          <>
                            <IconButton onClick={() => {
                              router.push(`/shop/service/${postCategory?.id}/${row?.id}/`)
                            }}>
                              <Icon icon='material-symbols:edit-outline' />
                            </IconButton>
                            <IconButton onClick={() => {
                              setModal({
                                func: () => { deletePost(row?.id) },
                                icon: 'material-symbols:delete-outline',
                                title: translate('정말 삭제하시겠습니까?')
                              })
                            }}>
                              <Icon icon='material-symbols:delete-outline' />
                            </IconButton>
                          </>}
                      </Row>
                    </GalleryCol>
                  ))}
                </Row>
              </>}
            {data.content.length == 0 ?
              <>
                <Col>
                  <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
                  <div style={{ margin: 'auto auto 8rem auto' }}> {translate('데이터가 없습니다.')}</div>
                </Col>
              </>
              :
              <>
                {onChangePage &&
                  <>
                    <div style={{
                      margin: '1rem auto'
                    }}>
                      <Pagination
                        size={window.innerWidth > 700 ? 'medium' : 'small'}
                        count={getMaxPage(data?.total, data?.page_size)}
                        page={page}
                        variant='outlined' shape='rounded'
                        color='primary'
                        onChange={(_, num) => {
                          onChangePage({
                            ...searchObj,
                            page: num
                          })
                        }} />
                    </div>
                  </>}
              </>}
          </>}
      </div>
    </>
  )
}
export default ContentTable;
