import { commarNumber } from 'src/utils/function';


import { useEffect, useState } from "react";
import styled from "styled-components";

import { Button, IconButton, Pagination } from "@mui/material";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { themeObj } from './styled-components';
import { returnArticleCategory } from 'src/data/data';
import { useRouter } from 'next/router';
import { useSettingsContext } from '../settings';
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
const ContentTable = (props) => {
  const { data, schema, table, isPointer, maxPage, page, onChangePage } = props;
  const router = useRouter();
  const { themeMode } = useSettingsContext();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setColumns(returnArticleCategory[schema]?.columns);
  }, [])
  useEffect(() => {
    if (columns && columns.length > 0) {
      setLoading(false);
    }
  }, [columns])


  const goToLink = (data) => {
    if (table == 'request')
      router.push(`/request/${data?.pk}`);
    if (table == 'notice')
      router.push(`/post/notice/${data?.pk}`);
    if (table == 'faq')
      router.push(`/post/faq/${data?.pk}`);

  }

  return (
    <>
      {loading ?
        <>
        </>
        :
        <>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className='subtype-container' style={{ overflowX: 'auto', display: 'flex', width: '100%', margin: '0 auto', flexDirection: 'column' }} >
              <Table>
                <Tr style={{ fontWeight: `bold`, background: `${themeMode == 'dark' ? themeObj.grey[700] : themeObj.grey[200]}`, borderBottom: 'none' }}>
                  {columns && columns.map((item, idx) => (
                    <>
                      <Td style={{ width: item.width, borderBottom: 'none' }}>{item.name}</Td>
                    </>
                  ))}
                </Tr>
                {data && data.map((item, index) => (
                  <Tr style={{ color: `${themeMode == 'dark' ? '#fff' : themeObj.grey[700]}` }}>
                    {columns && columns.map((column, idx) => (
                      <>
                        <Td style={{ width: column.width, color: `${column.color ? column.color : ''}`, cursor: `${isPointer ? 'pointer' : ''}`, fontWeight: `${column.bold ? 'bold' : ''}` }}>
                          {column.type == 'img' &&
                            <>
                              {<img src={item[column.column]} alt="#" style={{ height: '36px' }} /> ?? "---"}
                            </>}
                          {column.type == 'title' &&
                            <>
                              <div style={{ textAlign: 'left', marginLeft: '0.25rem', cursor: 'pointer' }}
                                onClick={() => {
                                  router.push(`${schema}/${item?.id}`)
                                }}>
                                {item[column.column] ?? "---"}
                              </div>
                            </>}
                          {column.type == 'text' &&
                            <>
                              {item[column.column] ?? "---"}
                            </>}
                          {column.type == 'left_text' &&
                            <>
                              <div style={{ textAlign: 'left', marginLeft: '0.25rem' }}>
                                {item[column.column] ?? "---"}
                              </div>
                            </>}
                          {column.type == 'link' &&
                            <IconButton onClick={() => {
                              goToLink(item)
                            }}>
                              <Icon icon="ph:eye" />
                            </IconButton>
                          }
                          {column.type == 'date' &&
                            <>
                              {item[column.column].substring(0, 10)}
                            </>}
                          {column.type == 'number' &&
                            <>
                              {commarNumber(item[column.column]) ?? "---"}
                            </>}
                        </Td>
                      </>
                    ))}
                  </Tr>
                ))}
              </Table>
            </div>
            {data.length == 0 ?
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: '250px', alignItems: 'center' }}
                >
                  <div style={{ margin: 'auto auto 8px auto' }}>
                  </div>
                  <div style={{ margin: '8px auto auto auto' }}>
                    데이터가 없습니다.
                  </div>
                </motion.div>
              </>
              :
              <>
                <div style={{
                  margin: '1rem auto'
                }}>
                  <Pagination
                    size={window.innerWidth > 700 ? 'medium' : 'small'}
                    count={maxPage}
                    page={page}
                    variant='outlined' shape='rounded'
                    color='primary'
                    onChange={(_, num) => {
                      onChangePage(num)
                    }} />
                </div>
              </>}
          </div>
        </>}
    </>
  )
}
export default ContentTable;
