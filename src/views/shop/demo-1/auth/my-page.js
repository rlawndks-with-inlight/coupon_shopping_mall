import { Avatar, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Pagination, Select, Stack, Switch, Tab, Tabs, TextField, Typography, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { AddressTable } from 'src/components/elements/shop/common';
import { Col, Row, Title, postCodeStyle } from 'src/components/elements/styled-components';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { fData } from 'src/utils/formatNumber';
import { commarNumber, makeMaxPage } from 'src/utils/function';
import styled from 'styled-components'
import { apiManager } from 'src/utils/api';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';
import MyPageGuestPanel from 'src/components/elements/shop/MyPageGuestPanel';
import { useLocales } from 'src/locales';
import PointPanel from 'src/components/elements/shop/PointPanel';

const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`


const MyPageDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate } = useLocales();
  const returnMyPageType = {
    0: {
      title: translate('마이페이지'),
      defaultObj: {

      }
    },
    1: {
      title: translate('주소지설정'),
      defaultObj: {

      }
    }
  }
  const { user, isInitialized } = useAuthContext();
  // 화면 폭은 훅으로 읽는다. 렌더 중 window 를 직접 읽으면 서버 렌더에서 죽고,
  // 창 크기를 바꿔도 다시 그려지지 않는다.
  const isWide = useMediaQuery('(min-width:700px)');
  // Tab 의 value 는 Object.keys 가 준 **문자열**('0'·'1')이다. 여기를 숫자·undefined 로 두면
  // 첫 렌더에서 어느 탭에도 안 걸려 선택 표시가 없다(쿼리가 들어와야 뒤늦게 잡힌다).
  const [myPageType, setMyPageType] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userObj, setUserObj] = useState({})
  const [addressContent, setAddressContent] = useState({});
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  // 배송지 수정 — 기능(DialogAddAddress type='update')은 이미 있는데 이 화면만 배선이 빠져
  //   AddressTable 의 '수정' 버튼이 undefined 를 호출해 크래시했다. 프레임3과 동일하게 연결한다.
  const [updateAddressOpen, setUpdatedAddressOpen] = useState(false);
  const [addressID, setAddressID] = useState();
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    search: '',
    user_id: user?.id,
  })
  // 비로그인 상태에서 user_id=undefined 로 주소 목록을 조회하던 호출을 막는다.
  //   (백엔드는 비로그인 요청을 거부하므로 어차피 실패만 하던 호출이다)
  // 겸사겸사 user.id 가 확정된 뒤에 부르도록 바꿨다 — 마운트 시점의 searchObj 는
  //   user 가 아직 안 들어와 user_id 가 undefined 인 채로 나갔다.
  useEffect(() => {
    if (!user?.id) return;
    onChangePage({ page: 1, page_size: 10, search: '', user_id: user?.id })
  }, [user?.id])
  useEffect(() => {
    if (user) {
      setUserObj(user);
    }
  }, [user])
  useEffect(() => {
    setMyPageType(String(router.query?.type ?? 0))
    if (!router.query?.type) {
      // replace 여야 한다. push 면 히스토리에 '쿼리 없는 URL -> ?type=0' 이 쌓여서
      // 뒤로가기를 눌러 쿼리 없는 URL 로 돌아오는 순간 이 effect 가 다시 push 한다
      // — 마이페이지에서 뒤로가기가 영영 먹지 않는다.
      router.replace(`/shop/auth/my-page?type=0`)
    }
  }, [router.query])
  const onChangePage = async (search_obj) => {
    setSearchObj(search_obj);
    setAddressContent({
      ...addressContent,
      content: undefined,
    })
    let data = await apiManager('user-addresses', 'list', search_obj);
    if (data) {
      setAddressContent(data);
    }
  }
  const onAddAddress = async (address_obj) => {
    let result = await apiManager('user-addresses', (address_obj?.id > 0 ? 'update' : 'create'), {
      ...address_obj,
      user_id: user?.id,
    })
    if (result) {
      onChangePage(searchObj);
    }
  }
  const onUpdateAddress = async (id) => {
    setAddressID(id);
    setUpdatedAddressOpen(true);
  }
  const onDeleteAddress = async (id) => {
    let result = await apiManager('user-addresses', 'delete', {
      id: id
    })
    if (result) {
      onChangePage(searchObj);
    }
  }

  // 비로그인이면 게스트 랜딩만 보여준다.
  // 예전엔 가드가 없어 빈 아바타 + 빈 입력칸 + '회원정보 수정' 버튼이 그대로 떴다.
  // isInitialized 를 같이 보는 이유: user 는 로딩 중에도 null 이라
  //   !user 만 보면 로그인 사용자에게도 이 패널이 한 번 깜빡인다.
  // 위치는 훅(useState/useEffect)을 전부 호출한 뒤여야 훅 순서가 깨지지 않는다.
  if (isInitialized && !user) {
    return <MyPageGuestPanel />;
  }

  return (
    <>
      <DialogAddAddress
        addAddressOpen={addAddressOpen}
        setAddAddressOpen={setAddAddressOpen}
        onAddAddress={onAddAddress}
      />
      <DialogAddAddress
        addAddressOpen={updateAddressOpen}
        setAddAddressOpen={setUpdatedAddressOpen}
        onAddAddress={onAddAddress}
        type={'update'}
        id={addressID}
        onDeleteAddress={onDeleteAddress}
      />
      <Wrappers>
        <Title style={{ width: '100%', marginBottom: '4rem' }}>
          <Tabs
            value={myPageType}
            onChange={(event, newValue) => router.push(`/shop/auth/my-page?type=${newValue}`)}
            sx={{ width: '100%' }}
          >
            {Object.keys(returnMyPageType).map((key) => {
              return <Tab key={returnMyPageType[key].title} value={key} label={returnMyPageType[key].title} style={{ width: '50%', margin: '0', maxWidth: '1000px' }} />
            })}
          </Tabs>
        </Title>
        <Grid container spacing={3}>
          {myPageType == 0 &&
            <>
              <Grid item xs={12} md={4}>
                <Card sx={{ py: 10, px: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: '84px',
                      height: '84px',
                      marginBottom: '1rem'
                    }}
                  />
                  <Typography variant='subtitle1'>{userObj.nickname}</Typography>
                  {/* 내 포인트 — 안 쓰는 가맹점에는 패널이 스스로 아무것도 안 그린다.
                      예전엔 '사용분을 차감하는 코드가 없다'는 이유로 통째로 숨겨 뒀는데,
                      그 이유는 해소됐다(결제에서 원장에 음수 행을 남기고 잔액도 검증한다).
                      주석만 남아 고객이 자기 잔액을 볼 곳이 없었다. */}
                  <PointPanel card={false} />
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 3 }}>
                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                    }}
                  >
                    <TextField name="displayName" label={translate("아이디")} defaultValue={userObj?.user_name} value={userObj?.user_name} disabled={true} />

                    <TextField name="email" label={translate("이름")} defaultValue={userObj?.nickname} value={userObj?.nickname} disabled={true} />

                    <TextField name="phone_num" label={translate("전화번호")} defaultValue={userObj?.phone_num} value={userObj?.phone_num} disabled={true} />
                  </Box>
                  {/* 여기 입력은 표시 전용이다(전부 disabled). 실제 수정은 공용 화면에서 한다.
                      예전엔 아무 동작도 없는 '변경사항 저장' 버튼만 있어서 눌러도 아무 일이 없었다. */}
                  <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                    <Button variant="contained" onClick={() => router.push('/shop/auth/change-info')}>
                      {translate('회원정보 수정')}
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            </>}
          {myPageType == 1 &&
            <>
              <Col style={{ width: '100%' }}>
                <Card sx={{ marginBottom: '2rem' }}>
                  <AddressTable
                    addressContent={addressContent}
                    onDelete={onDeleteAddress}
                    onUpdate={onUpdateAddress}
                  />
                </Card>
                <Pagination
                  sx={{ margin: 'auto' }}
                  size={isWide ? 'medium' : 'small'}
                  count={makeMaxPage(addressContent?.total, addressContent?.page_size)}
                  page={addressContent?.page}
                  variant='outlined' shape='rounded'
                  color='primary'
                  onChange={(_, num) => {
                    onChangePage({ ...searchObj, page: num })
                  }} />
                <Row>
                  <Button variant="contained" style={{ marginLeft: 'auto' }} onClick={() => setAddAddressOpen(true)}>
                    {translate('주소지 추가')}
                  </Button>
                </Row>
              </Col>

            </>}
        </Grid>
      </Wrappers>
    </>
  )
}
export default MyPageDemo

