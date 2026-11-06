// @mui
import { Table, TableRow, TableBody, TableCell, TableContainer, Pagination, Divider, Box, TextField, Button, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, CircularProgress, Tooltip, Select, MenuItem, Menu, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import {
  DatePicker,
  StaticDatePicker,
  MobileDatePicker,
  DesktopDatePicker,
} from '@mui/x-date-pickers';
import { useEffect, useRef, useState } from 'react';
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

// 옆으로 밀어도 '어느 줄인지' 를 놓치지 않게 앞 칸을 붙박이로 둔다.
// 기본은 첫 칸 하나. 주문 목록처럼 앞에 좁은 칸(체크칸·번호)이 있으면 sticky_lead=[폭px, …] 로 넘긴다 —
// 그 칸들을 정해진 폭으로 붙이고, 바로 다음 칸(주문번호)까지 붙인다(2026-11-06: 체크칸만 붙고 주문번호가 밀려 사라졌다).
// 배경을 inherit 로 두면 투명이라, 옆으로 밀 때 뒤 칸 글자가 이 칸을 뚫고 비친다 — 불투명한 색을 직접 준다.
// 머리줄의 붙박이 칸은 세로·가로 양쪽으로 고정되므로 z-index 가 더 높아야 한다.
const 붙박이칸 = (앞칸 = []) => {
  const 폭들 = Array.isArray(앞칸) ? 앞칸.map(Number).filter((n) => n > 0) : [];
  const 바탕 = (theme) => theme.palette.background.paper;
  const 규칙 = {};
  let 왼쪽 = 0;
  폭들.forEach((폭, i) => {
    규칙[`& tbody td:nth-of-type(${i + 1}), & thead th:nth-of-type(${i + 1})`] = {
      position: 'sticky', left: 왼쪽, zIndex: 2, background: 바탕,
      width: 폭, minWidth: 폭, maxWidth: 폭, paddingLeft: '6px', paddingRight: '6px',
    };
    규칙[`& thead th:nth-of-type(${i + 1})`] = { zIndex: 3 };
    왼쪽 += 폭;
  });
  const n = 폭들.length + 1;
  규칙[`& tbody td:nth-of-type(${n}), & thead th:nth-of-type(${n})`] = {
    position: 'sticky', left: 왼쪽, zIndex: 2, background: 바탕,
    // 붙박이 칸 오른쪽에 옅은 경계 — 밀린 칸이 그 밑으로 들어가는 게 보이게
    boxShadow: (theme) => (폭들.length ? `inset -1px 0 0 ${theme.palette.divider}` : 'none'),
  };
  규칙[`& thead th:nth-of-type(${n})`] = { zIndex: 3 };
  return 규칙;
};

export default function ManagerTable(props) {
  const { columns, data, add_button_text, add_link, onClickSeller, onChangePage, searchObj, want_move_card, table, detail_search, onToggle, minimal = false, type, date_presets = false, sticky_lead = [] } = props;
  const { page, page_size } = props?.searchObj;
  const { themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();

  useEffect(() => {
    settingSeller()
  }, [])

  const router = useRouter();

  const { settingPlatform } = useSettingsContext();
  // 가로 스크롤 막대가 늘 화면 안에 있게 — 표 영역 높이를 '남은 화면 높이'에 맞춘다(2026-11-06 재발).
  // 예전엔 76vh 로 묶었는데, 표 위(검색·날짜 버튼·일괄 막대)가 높아지면 76vh 가 화면 밖까지 내려가
  // 낮은 해상도(1366×768)에서 막대를 보려면 맨 아래까지 내려가야 했다. 표 위가 다시 높아져도 이 계산이 따라간다.
  const 스크롤칸 = useRef(null);
  const [표높이, set표높이] = useState('76vh');
  useEffect(() => {
    const 맞추기 = () => {
      const el = 스크롤칸.current;
      if (!el) return;
      const 위 = el.getBoundingClientRect().top + window.scrollY; // 페이지 맨 위 기준
      const 아래여백 = 76; // 표 밑 쪽 넘김 줄(Pagination)
      set표높이(`${Math.max(320, Math.round(window.innerHeight - 위 - 아래여백))}px`);
    };
    맞추기();
    window.addEventListener('resize', 맞추기);
    // 표 위 영역 높이는 데이터·버튼이 그려지며 바뀐다 — 문서 크기가 바뀔 때마다 다시 잰다(같은 값이면 다시 그리지 않는다)
    const 관찰 = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(맞추기) : null;
    관찰?.observe(document.body);
    return () => { window.removeEventListener('resize', 맞추기); 관찰?.disconnect(); };
  }, []);
  const [sDt, setSDt] = useState(undefined);
  const [eDt, setEDt] = useState(undefined);
  // 기간 바로 고르기(오늘·어제·7일…) — 주문 목록에서만 켠다(date_presets). 가맹점 요청 2026-11-06.
  const [기간, set기간] = useState('');
  const 기간고르기 = (key) => {
    const 날 = (뒤로) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 뒤로); return d; };
    const 달전 = (n) => { const d = 날(0); d.setMonth(d.getMonth() - n); return d; };
    const 범위 = {
      today: [날(0), 날(0)],
      yesterday: [날(1), 날(1)],
      week: [날(6), 날(0)],
      month: [달전(1), 날(0)],
      quarter: [달전(3), 날(0)],
      all: [null, null],
    }[key];
    if (!범위) return;
    const [시작, 끝] = 범위;
    set기간(key);
    setSDt(시작 ?? null);
    setEDt(끝 ?? null);
    const 글 = (d) => (d ? returnMoment(false, d).substring(0, 10) : '');
    onChangePage({ ...searchObj, s_dt: 글(시작), e_dt: 글(끝), page: 1 });
  };
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
    // columns 도 본다 — 예전엔 contentList 만 봐서, 목록을 다시 읽기 전까지 처음 그린 열 정의(그때의 상태값)를 붙들었다.
    // 그래서 주문 목록 체크칸이 눌러도 체크 표시가 안 바뀌었다(2026-11-06). 줄은 row.id 로 묶여 있어 칸 안의 입력값은 그대로다.
  }, [contentList, columns])

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
                                set기간('');
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
                                set기간('');
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
                        {date_presets &&
                          <Row style={{ columnGap: '0.35rem', flexWrap: 'wrap', alignItems: 'center', marginRight: '1.5rem' }}>
                            {[['today', '오늘'], ['yesterday', '어제'], ['week', '7일'], ['month', '1개월'], ['quarter', '3개월'], ['all', '전체 기간']].map(([key, 이름]) => (
                              <Button key={key} size='small' variant={기간 === key ? 'contained' : 'outlined'}
                                sx={{ minWidth: 0, px: 1.25, whiteSpace: 'nowrap' }}
                                onClick={() => 기간고르기(key)}>{이름}</Button>
                            ))}
                          </Row>}
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
                    // 예전엔 path.slice(0, path.indexOf('?')) 로 쿼리를 잘랐는데,
                    // asPath 에 '?' 가 없으면 indexOf 가 -1 이라 slice(0,-1) 이 되어
                    // 경로 마지막 글자가 잘렸다. (/manager/users/sellers → /manager/users/seller/add)
                    // …/list 경로만 위 replace 가 남긴 끝 슬래시가 대신 잘려 우연히 맞아떨어졌던 탓에
                    // '상품 추가'는 되고 '셀러/영업자/총판/포인트/결제모듈 추가'만 깨져 보였다.
                    const base = path.split('?')[0].replace(/\/+$/, '');
                    type != 'dialog' ?
                      user?.level != 10 ?
                        router.push(add_link || `${base}/add`)
                        :
                        type == 'article' ?
                          router.push(add_link || `${base}/add`)
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
        {/* 가로 스크롤 막대가 표 맨 아래에만 있으면, 줄이 많은 표에서는 화면을 한참 내려가야
            막대에 닿는다(가맹점 피드백 — 노트북에서 특히 불편). 스크롤 영역을 화면 높이 안에
            묶어 두면 막대가 늘 화면 안에 남는다. 머리줄·첫 칸은 아래 sx 에서 붙박이로 만든다. */}
        <div ref={스크롤칸} style={{ width: '100%', overflow: 'auto', maxHeight: 표높이 }}>
          {!data.content ?
            <>
              <Row style={{ height: '400px' }}>
                <CircularProgress sx={{ margin: 'auto' }} />
              </Row>
            </>
            :
            <>
              <Table stickyHeader sx={{
                minWidth: 800,
                overflowX: 'auto',
                /* 옆으로 밀어도 '어느 줄인지' 를 놓치지 않게 첫 칸을 붙박이로 둔다.
                   머리줄의 첫 칸은 세로·가로 양쪽으로 고정되므로 z-index 가 더 높아야 한다. */
                ...붙박이칸(sticky_lead),
                '& thead th': { background: (theme) => theme.palette.background.paper },
                /* 글은 줄을 바꿔 접되(한국어는 단어째), 버튼·선택 같은 조작 요소는 접지 않는다 —
                   접히면 버튼 상자 밖으로 글씨가 삐져나온다. */
                '& td': { wordBreak: 'keep-all', overflowWrap: 'break-word', verticalAlign: 'top' },
                '& td .MuiButton-root, & td .MuiChip-root, & td .MuiInputBase-root': { whiteSpace: 'nowrap' },
              }}>
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
