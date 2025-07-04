// @mui
import { Table, TableRow, TableBody, TableCell, TableContainer, Pagination, Divider, Box, TextField, Button, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, CircularProgress, Tooltip, Select, MenuItem, Menu, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
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
import { apiManager, apiUtil } from 'src/utils/api';
import { useSettingsContext } from 'src/components/settings';
import useTable from 'src/components/table';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import toast from 'react-hot-toast';

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
  const { columns, data, add_button_text, add_link, onClickSeller, onChangePage, searchObj, want_move_card, table, detail_search, onToggle, minimal = false, type } = props;
  const { page, page_size } = props?.searchObj;
  const { themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();

  useEffect(() => {
    settingSeller()
  }, [])

  const router = useRouter();

  const { settingPlatform } = useSettingsContext();
  const [sDt, setSDt] = useState(undefined);
  const [eDt, setEDt] = useState(undefined);
  const [keyword, setKeyWord] = useState("");
  const [contentList, setContentList] = useState(undefined);
  const [anchor, setAnchor] = useState(null)
  const [checked, setChecked] = useState('id')
  const [order, setOrder] = useState('desc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState()
  const [sellerData, setSellerData] = useState([]);
  const [sellerID, setSellerID] = useState();

  const handleClose = () => {
    setAnchor(null)
  }

  const tableOption = Boolean(anchor)

  /*
    const [
      dense,
      order,
      //page,
      orderBy,
      rowsPerPage,
      //
      selected,
      onSelectRow,
      onSelectAllRows,
      //
      onSort,
      //onChangePage,
      onChangeDense,
      onChangeRowsPerPage,
      //
      setPage,
      setDense,
      setOrder,
      setOrderBy,
      setSelected,
      setRowsPerPage,
    ] = useTable()*/

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
    let source_id = drag_item?.id;
    let source_sort_idx = drag_item?.sort_idx;
    let dest_id = hover_item?.id;
    let dest_sort_idx = hover_item?.sort_idx;
    if (drag_idx == hover_idx) {
      return;
    }
    let obj = {
      source_id,
      source_sort_idx,
      dest_id,
      dest_sort_idx,
    }
    let result = await apiUtil(`${table}/sort`, 'update', obj);
    if (result) {
      onChangePage(searchObj);
      settingPlatform();
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

  const onSort = (e, prop) => {
    const isDesc = checked === prop && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc')
    setChecked(prop)
  }

  const onRegistration = async () => {
    let result = await apiManager('phone-registration', 'create', { brand_id: themeDnsData?.id, seller_id: user?.level == 10 ? user?.id : sellerID, phone_number: phoneNumber, registrar: user?.id });
    if (!result) {
      toast.error('등록 중 오류가 발생했습니다.')
    } else {
      toast.success('등록되었습니다')
      router.reload()
    }
  }

  const settingSeller = async () => {
    let seller_data = await apiManager('sellers', 'list', {
      page: 1,
      page_size: 10,
      s_dt: '',
      e_dt: '',
      search: '',
      category_id: null,
      is_seller: 1,
    })
    if (seller_data) {
      setSellerData(seller_data.content)
    }
  }

  const onChangeQuery = (query = {}, search_obj = {}) => {
    let query_ = query;
    let searchObj = search_obj;
    let base_query = router.asPath.split('?')



    let query_str = new URLSearchParams(query_).toString();
    //console.log(searchObj)
    //console.log(query_str)
    //console.log(base_query)
    router.push(`${base_query[0]}?${query_str}`)
  }

  return (
    <>
      <TableContainer sx={{ overflow: 'unset' }}>
        <TableHeaderContainer style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex' }}>
            {
              type != 'adjustment' ?
                <>
                  <Row style={{ flexGrow: 1, rowGap: '0.75rem', flexWrap: 'wrap', margin: '0.35rem 0' }} >
                    <FormControl variant="outlined" sx={{ flexGrow: 1, minWidth: '100px', marginRight: '0.75rem' }}>
                      <OutlinedInput
                        size='small'
                        label=''
                        autoFocus
                        placeholder='검색어 입력'
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
                    {detail_search &&
                      <>
                        <Button variant='outlined' sx={{ marginRight: '0.75rem' }} onClick={onToggle}>
                          {detail_search}
                        </Button>
                      </>}
                  </Row>
                  {
                    minimal != true &&
                    <>
                      <Row style={{ rowGap: '1rem', flexWrap: 'wrap', margin: '0.35rem 0' }}>
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
                              sx={{ width: '180px', marginRight: '0.75rem' }}
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
                              sx={{ flexGrow: 1, marginRight: '0.75rem' }}
                              slotProps={{ textField: { size: 'small' } }}
                            />
                          </>}
                      </Row>
                    </>
                  }
                </>
                :
                <>

                </>
            }
            <Row style={{ columnGap: '0.75rem', flexWrap: 'wrap', rowGap: '0.75rem', margin: '0.35rem 0', marginLeft: `${type == 'adjustment' ? 'auto' : ''}` }}>
              {/*
            <Button variant='outlined' onClick={handleClick}>
              테이블 설정
            </Button>
                */}
              <Menu open={tableOption} onClose={handleClose} anchorEl={anchor}>

                <MenuItem>
                  <FormControlLabel control={<Switch />} label='h' />
                </MenuItem>

              </Menu>
              <FormControl variant='outlined' size='small' sx={{ width: '100px', flexGrow: 1 }}>
                <InputLabel>페이지사이즈</InputLabel>
                <Select label='페이지사이즈' value={page_size}
                  onChange={(e) => {
                    onChangePage({ ...searchObj, page_size: e.target.value })
                  }}>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
              {add_button_text ?
                <>
                  <Button variant='contained' sx={{ flexGrow: 1, minWidth: '200px' }} onClick={() => {
                    let path = router.asPath;
                    if (type == 'product' && user?.level == 10) {
                      onClickSeller()
                    } else if (router.asPath.includes('list')) {
                      path = path.replace('list', '');
                    }
                    type != 'dialog' ?
                      user?.level != 10 ?
                        router.push(add_link || `${path.slice(0, path.indexOf('?'))}/add`)
                        :
                        type == 'article' ?
                          router.push(add_link || `${path.slice(0, path.indexOf('?'))}/add`)
                          :
                          ''
                      :
                      setDialogOpen(true)
                  }}>
                    + {add_button_text}
                  </Button>
                </>
                :
                <>
                </>}
            </Row>
            <Dialog
              open={dialogOpen}
            >
              <DialogTitle>{`전화번호 등록`}</DialogTitle>

              <DialogContent>
                <DialogContentText>
                  회원가입을 허용할 전화번호 및 적용할 셀러몰을 입력 후 확인을 눌러주세요.
                </DialogContentText>
                <TextField
                  autoFocus
                  fullWidth
                  value={phoneNumber}
                  type='number'
                  margin="dense"
                  label="전화번호(하이픈(-) 제외 입력)"
                  onChange={(e) => {
                    setPhoneNumber(e.target.value)
                  }}
                />
                <FormControl sx={{ width: '100%', marginTop: '1rem' }}>
                  <InputLabel>
                    {user?.level >= 20 ? '셀러선택' : `셀러 : ${user?.name}`}
                  </InputLabel>
                  <Select
                    label='셀러선택'
                    value={sellerID}
                    disabled={user?.level >= 20 ? false : true}
                    onChange={e => {
                      setSellerID(e.target.value)
                    }}
                  >
                    {sellerData.map((seller, idx) => {
                      return <MenuItem value={seller.id}>{seller.name}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button variant="contained" onClick={() => {
                  onRegistration()
                }}>
                  등록
                </Button>
                <Button color="inherit" onClick={() => {
                  setDialogOpen(false);
                  setPhoneNumber();
                }}>
                  취소
                </Button>
              </DialogActions>
            </Dialog>
          </div>
          {
            type != 'adjustment' &&
            <>
              <Row>
                검색된 총 항목 수 : {data?.total}
              </Row>
            </>
          }
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
                <TableHeadCustom
                  headLabel={columns}
                  sx={{ wordBreak: 'keep-all' }}
                  onChangePage={onChangePage}
                  searchObj={searchObj}
                  onSort={onSort}
                  orderBy={checked}
                  order={order}
                />
                <DndProvider backend={HTML5Backend}>
                  <TableBody sx={{ wordBreak: 'keep-all' }}>
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
            page={parseInt(page)}
            variant='outlined' shape='rounded'
            color='primary'
            siblingCount={4}
            boundaryCount={0}
            showFirstButton
            showLastButton
            onChange={(_, num) => {
              if (router.asPath.split('?')[0] == 'manager/products/list/' || router.asPath.split('?')[0] == 'manager/users/list/') {
                onChangePage({ ...router.query, page: num }, {
                  ...searchObj,
                  page: num
                });
              } else {
                onChangePage({
                  ...searchObj,
                  page: num
                });
              }
            }} />
        </Box>

      </TableContainer>
    </>
  );
}
