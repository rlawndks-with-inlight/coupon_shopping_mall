import { Avatar, Box, Button, Card, Divider, Grid, Pagination, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { AddressTable } from 'src/components/elements/shop/common';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { commarNumber, makeMaxPage } from 'src/utils/function';
import styled from 'styled-components'
import { apiManager } from 'src/utils/api';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';
import MyPageGuestPanel from 'src/components/elements/shop/MyPageGuestPanel';
import { useLocales } from 'src/locales';
import { useSettingsContext } from 'src/components/settings';

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 2rem auto 6rem auto;
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
  const { themeDnsData } = useSettingsContext();
  const mainColor = themeDnsData?.theme_css?.main_color;
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
  const [myPageType, setMyPageType] = useState(undefined);
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
    setMyPageType(router.query?.type ?? 0)
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
      <Wrapper>
        <ContentWrapper>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            {translate('마이페이지')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {translate('회원 정보와 배송지를 관리하세요.')}
          </Typography>
          <Tabs
            value={myPageType}
            onChange={(event, newValue) => router.push(`/shop/auth/my-page?type=${newValue}`)}
            sx={{ borderBottom: '1px solid #eee', mb: 4 }}
          >
            {Object.keys(returnMyPageType).map((key) => {
              return <Tab key={returnMyPageType[key].title} value={key} label={returnMyPageType[key].title} />
            })}
          </Tabs>
          <Grid container spacing={4}>
            {myPageType == 0 &&
              <>
                <Grid item xs={12} md={4}>
                  <Card sx={{ py: 6, px: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 'none', border: '1px solid #eee' }}>
                    <Avatar
                      sx={{
                        width: '84px',
                        height: '84px',
                        marginBottom: '1.25rem'
                      }}
                    />
                    <Typography variant='h6' sx={{ fontWeight: 700 }}>{userObj.nickname}</Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', mb: 2 }}>{userObj.user_name}</Typography>
                  {/* 포인트 비노출 — 적립률 기본값 0, 가맹점은 설정을 켤 수 없고,
                      사용분을 차감하는 코드가 없어 켜면 무한 재사용이 가능하다.
                      기능 완성 전까지 숨긴다. */}
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Card sx={{ p: 4, boxShadow: 'none', border: '1px solid #eee' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
                      {translate('회원정보')}
                    </Typography>
                    <Box
                      rowGap={3}
                      columnGap={2}
                      display="grid"
                      gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                      }}
                    >
                      <TextField name="displayName" label={translate("아이디")} defaultValue={userObj?.user_name} value={userObj?.user_name} disabled={true} fullWidth />

                      <TextField name="email" label={translate("이름")} defaultValue={userObj?.nickname} value={userObj?.nickname} disabled={true} fullWidth />

                      <TextField name="phone_num" label={translate("전화번호")} defaultValue={userObj?.phone_num} value={userObj?.phone_num} disabled={true} fullWidth />
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
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                    {translate('주소지설정')}
                  </Typography>
                  <Card sx={{ mb: 3, boxShadow: 'none', border: '1px solid #eee' }}>
                    <AddressTable
                      addressContent={addressContent}
                      onDelete={onDeleteAddress}
                      onUpdate={onUpdateAddress}
                    />
                  </Card>
                  <Pagination
                    sx={{ display: 'flex', justifyContent: 'center', my: 3 }}
                    size={window.innerWidth > 700 ? 'medium' : 'small'}
                    count={makeMaxPage(addressContent?.total, addressContent?.page_size)}
                    page={addressContent?.page}
                    variant='outlined' shape='rounded'
                    color='primary'
                    onChange={(_, num) => {
                      onChangePage({ ...searchObj, page: num })
                    }} />
                  <Stack direction="row" justifyContent="flex-end">
                    <Button variant="contained" color="inherit" sx={{ fontWeight: 600, px: 4 }} onClick={() => setAddAddressOpen(true)}>
                      {translate('주소지 추가')}
                    </Button>
                  </Stack>
                </Grid>
              </>}
          </Grid>
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default MyPageDemo
