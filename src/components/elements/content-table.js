import { commarNumber } from 'src/utils/function';


import { useEffect, useState } from "react";
import styled from "styled-components";

import { Button, CircularProgress, IconButton, Pagination } from "@mui/material";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Row, themeObj } from './styled-components';
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
  const { data, onChangePage, searchObj, columns, } = props;
  const { page, page_size } = props?.searchObj;
  const router = useRouter();
  const { themeMode } = useSettingsContext();
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
      </div>
    </>
  )
}
export default ContentTable;
