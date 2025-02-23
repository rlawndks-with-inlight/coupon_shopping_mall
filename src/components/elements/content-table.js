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
  const { post_category_type } = postCategory;
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
                <div className='subtype-container' style={{ overflowX: 'auto', display: 'flex', width: '100%', margin: '0 auto', flexDirection: 'column' }} >
                  <Table>
                    <Tr style={{ fontWeight: `bold`, background: `${themeMode == 'dark' ? themeObj.grey[700] : themeObj.grey[200]}`, borderBottom: 'none' }}>
                      {columns && columns.map((col, idx) => (
                        <>
                          <Td align="left" sx={{ ...col.sx }}>{col.label}</Td>
                        </>
                      ))}
                    </Tr>
                    {data?.content && data?.content.map((row, index) => (
                      <Tr style={{ color: `${themeMode == 'dark' ? '#fff' : themeObj.grey[700]}` }}>
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
                      <Typography variant='body2' color={themeObj.grey[500]}>{row?.created_at?.split("T").join(" ").replace("Z", "").split(".")[0] ?? "---"}</Typography>
                      <Row>
                        {row?.user_id == user?.id &&
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
