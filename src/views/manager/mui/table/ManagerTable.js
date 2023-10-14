// @mui
import { Table, TableRow, TableBody, TableCell, TableContainer, Pagination, Divider, Box, TextField, Button, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { TableHeadCustom, TableNoData } from 'src/components/table';
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
import { Icon } from '@iconify/react';
import { styled as muiStyled } from '@mui/material';
import { useTheme } from '@emotion/react';
import { returnMoment } from 'src/utils/function';
import { Spinner } from 'evergreen-ui';
import ManagerTr from './ManagerTr';
import { useCallback } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import update from 'immutability-helper'
import _ from 'lodash';
import { sortProductByManager } from 'src/utils/api-manager';

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
  const { columns, data, add_button_text, add_link, onChangePage, searchObj, want_move_card, table } = props;
  const { page, page_size } = props?.searchObj;

  const theme = useTheme();
  const router = useRouter();
  const [sDt, setSDt] = useState(undefined);
  const [eDt, setEDt] = useState(undefined);
  const [keyword, setKeyWord] = useState("");
  const [contentList, setContentList] = useState(undefined);
  useEffect(() => {
    setContentList(data?.content);
  }, [data?.content])

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

  const moveCard = useCallback((dragIndex, hoverIndex, itemPk) => {
    setContentList((prevCards) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      }),
    )
  }, [])
  const onChangeSequence = async (drag_id, hover_idx) => {
    let drag_item = _.find(data?.content, { id: parseInt(drag_id) });
    let drag_idx = _.findIndex(data?.content, { id: parseInt(drag_id) });
    let hover_item = data?.content[hover_idx];
    let upper_id = 0;
    let upper_sort_idx = 0;
    let lower_id = 0;
    let lower_sort_idx = 0;
    if (drag_idx == hover_idx) {
      return;
    } else if (drag_idx > hover_idx) {
      upper_id = hover_item?.id;
      upper_sort_idx = hover_item?.sort_idx;
      lower_id = drag_item?.id;
      lower_sort_idx = drag_item?.sort_idx;
    } else if (drag_idx < hover_idx) {
      upper_id = drag_item?.id;
      upper_sort_idx = drag_item?.sort_idx;
      lower_id = hover_item?.id;
      lower_sort_idx = hover_item?.sort_idx;
    }
    let obj = {
      upper_id,
      upper_sort_idx,
      lower_id,
      lower_sort_idx,
    }
    let result = await sortProductByManager(obj);
    if (result) {
      onChangePage(searchObj);
    }
  }
  const renderCard = useCallback((row, index, column, list) => {
    return <ManagerTr
      key={row?.id}
      index={index}
      columns={columns}
      row={row}
      moveCard={moveCard}
      onChangeSequence={onChangeSequence}
      want_move_card={want_move_card}
    />
  }, [contentList])

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
                    onChangePage({ ...searchObj, s_dt: returnMoment(false, new Date(newValue)).substring(0, 10) })
                  }}
                  renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                  sx={{ marginRight: '0.75rem', width: '180px', height: '32px' }}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DesktopDatePicker
                  label="종료일 선택"
                  value={eDt}
                  format='yyyy-MM-dd'
                  onChange={(newValue) => {
                    setEDt(newValue);
                    onChangePage({ ...searchObj, e_dt: returnMoment(false, new Date(newValue)).substring(0, 10) })
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
            <FormControl variant="outlined">
              <OutlinedInput
                size='small'
                label=''
                value={keyword}
                endAdornment={<>
                  <Tooltip title='해당 텍스트로 검색하시려면 엔터 또는 돋보기 버튼을 클릭해주세요.'>
                    <IconButton position="end" sx={{ transform: 'translateX(14px)' }} onClick={() => onChangePage({ ...searchObj, search: keyword })}>
                      <Icon icon='material-symbols:search' />
                    </IconButton>
                  </Tooltip>

                </>}
                onChange={(e) => {
                  setKeyWord(e.target.value)
                }}
                onKeyPress={(e) => {
                  if (e.key == 'Enter') {
                    onChangePage({ ...searchObj, search: keyword })
                  }
                }}
              />
            </FormControl>
            {add_button_text ?
              <>
                <Button variant='contained' sx={{ marginLeft: '0.75rem' }} onClick={() => {
                  let path = router.asPath;
                  if (router.asPath.includes('list')) {
                    path = path.replace('list', '');
                  }
                  router.push(add_link || `${path}add`)
                }}>
                  + {add_button_text}
                </Button>
              </>
              :
              <>
              </>}
          </Row>
        </TableHeaderContainer>
        <div style={{ width: '100%', overflow: 'auto' }}>
          {!data.content ?
            <>
              <Row style={{ height: '400px' }}>
                <CircularProgress sx={{ margin: 'auto' }} />
              </Row>
            </>
            :
            <>
              <Table sx={{ minWidth: 800, overflowX: 'auto' }}>
                <TableHeadCustom headLabel={columns} />
                <DndProvider backend={HTML5Backend}>
                  <TableBody>
                    {contentList && contentList.map((row, index) => {
                      return renderCard(row, index)
                    })}
                  </TableBody>
                </DndProvider>
                {data.content && data.content.length == 0 &&
                  <>
                    <TableNoData isNotFound={true} />
                  </>}
              </Table>
            </>}
        </div>
        <Divider />
        <Box sx={{ padding: '0.75rem', display: 'flex' }}>
          <Pagination
            sx={{ marginLeft: 'auto' }}
            size={'medium'}
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
        </Box>
      </TableContainer>
    </>
  );
}
