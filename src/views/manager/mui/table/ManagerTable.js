// @mui
import { Table, TableRow, TableBody, TableCell, TableContainer, Pagination, Divider, Box, TextField, Button } from '@mui/material';
import { TableHeadCustom, TableNoData } from '../../../../components/table';
import {
  DatePicker,
  StaticDatePicker,
  MobileDatePicker,
  DesktopDatePicker,
} from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import { Row } from 'src/components/elements/styled-components';
import styled from 'styled-components';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useRouter } from 'next/router';
// ----------------------------------------------------------------------
const TableHeaderContainer = styled.div`
padding: 0.75rem;
display: flex;
flex-wrap: wrap;
justify-content:space-between;
@media (max-width:1000px){
  flex-direction:column;
  row-gap:0.75rem;
}
`
export default function ManagerTable(props) {
  const { columns, data, page, maxPage, onChangePage,  } = props;
  const router = useRouter();
  const [sDt, setSDt] = useState(undefined);
  const [eDt, setEDt] = useState(undefined);
  const [keyword, setKeyWord] = useState("");

  return (
    <>
      <TableContainer sx={{ overflow: 'unset' }}>
        <TableHeaderContainer>
          <Row>
            {window.innerWidth > 1000 ?
              <>
                <DesktopDatePicker
                  label="시작일 선택"
                  value={sDt}
                  format='yyyy-MM-dd'
                  onChange={(newValue) => {
                    setSDt(newValue);
                  }}
                  renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                  sx={{ marginRight: '0.75rem', width: '180px', height:'32px' }}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DesktopDatePicker
                  label="종료일 선택"
                  value={eDt}
                  format='yyyy-MM-dd'
                  onChange={(newValue) => {
                    setEDt(newValue);
                  }}
                  renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                  sx={{ width: '180px' }}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </>
              :
              <>
                <MobileDatePicker
                  label="시작일 선택"
                  value={sDt}
                  format='yyyy-MM-dd'
                  onChange={(newValue) => {
                    setSDt(newValue);
                  }}
                  renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                  sx={{ marginRight: '0.75rem', flexGrow: 1 }}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <MobileDatePicker
                  label="종료일 선택"
                  value={eDt}
                  format='yyyy-MM-dd'
                  onChange={(newValue) => {
                    setEDt(newValue);
                  }}
                  renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                  sx={{ flexGrow: 1 }}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </>}
          </Row>
          <Row>
            <TextField sx={{ flexGrow: 1 }} value={keyword} onChange={(e)=>{setKeyWord(e.target.value)}} size='small' />
            <Button variant='contained' sx={{ marginLeft: '0.75rem' }} onClick={()=>router.push(`add`)}>
              + 회원 추가
            </Button>
          </Row>
        </TableHeaderContainer>
        <Scrollbar sx={{ maxHeight: 400 }}>
          <Table sx={{ minWidth: 800, overflowX: 'auto' }}>
            <TableHeadCustom headLabel={columns} />
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {columns && columns.map((col, idx) => (
                    <>
                      <TableCell align="left">{col.action(row)}</TableCell>
                    </>
                  ))}
                </TableRow>
              ))}
            </TableBody>
            <TableNoData isNotFound={data.length == 0} />
          </Table>
        </Scrollbar>

        <Divider />
        <Box sx={{ padding: '0.75rem', display: 'flex' }}>
          <Pagination
            sx={{ marginLeft: 'auto' }}
            size={'medium'}
            count={maxPage}
            page={page}
            variant='outlined' shape='rounded'
            color='primary'
            onChange={(_, num) => {
              onChangePage(num)
            }} />
        </Box>
      </TableContainer>
    </>

  );
}