import { Avatar, Box, Button, Card, Grid, Pagination, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { AddressTable } from 'src/components/elements/shop/common';
import { Col, Row, themeObj } from 'src/components/elements/styled-components';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { commarNumber, makeMaxPage } from 'src/utils/function';
import styled from 'styled-components'
import { apiManager } from 'src/utils/api';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';
import { useLocales } from 'src/locales';

const Wrappers = styled.div`
max-width:1200px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:80vh;
margin-bottom:10vh;
`
const PageTitle = styled.div`
font-size:${themeObj.font_size.size2};
font-weight:bold;
text-transform:uppercase;
letter-spacing:1px;
margin: 4rem 0 0.75rem 0;
`
const TitleAccent = styled.div`
width:44px;
height:3px;
background:${props => props.main_color};
margin-bottom:2.5rem;
`
const TabNav = styled.div`
display:flex;
border-bottom:1px solid ${themeObj.grey[300]};
margin-bottom:3rem;
`
const TabItem = styled.div`
padding:0.85rem 1.75rem;
cursor:pointer;
text-transform:uppercase;
font-weight:bold;
letter-spacing:0.5px;
font-size:${themeObj.font_size.size7};
color:${props => props.active ? props.main_color : themeObj.grey[500]};
border-bottom:2px solid ${props => props.active ? props.main_color : 'transparent'};
margin-bottom:-1px;
transition:color 0.2s, border-color 0.2s;
`
const cleanCardSx = {
  border: '1px solid',
  borderColor: themeObj.grey[300],
  boxShadow: 'none',
  borderRadius: '4px',
};

const MyPageDemo3 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();
  const main_color = theme?.palette?.primary?.main;
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
  const { user } = useAuthContext();
  // 화면 폭은 훅으로 읽는다. 렌더 중 window 를 직접 읽으면 서버 렌더에서 죽고,
  // 창 크기를 바꿔도 다시 그려지지 않는다.
  const isWide = useMediaQuery('(min-width:700px)');
  const [myPageType, setMyPageType] = useState(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userObj, setUserObj] = useState({})
  const [addressContent, setAddressContent] = useState({});
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    search: '',
    user_id: user?.id,
  })
  useEffect(() => {
    onChangePage(searchObj)
  }, [])
  useEffect(() => {
    if (user) {
      setUserObj(user);
    }
  }, [user])
  useEffect(() => {
    setMyPageType(router.query?.type ?? 0)
    if (!router.query?.type) {
      router.push(`/shop/auth/my-page?type=0`)
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
  const onDeleteAddress = async (id) => {
    let result = await apiManager('user-addresses', 'delete', {
      id: id
    })
    if (result) {
      onChangePage(searchObj);
    }
  }
  return (
    <>
      <DialogAddAddress
        addAddressOpen={addAddressOpen}
        setAddAddressOpen={setAddAddressOpen}
        onAddAddress={onAddAddress}
      />
      <Wrappers>
        <PageTitle>{returnMyPageType[myPageType]?.title ?? translate('마이페이지')}</PageTitle>
        <TitleAccent main_color={main_color} />
        <TabNav>
          {Object.keys(returnMyPageType).map((key) => {
            return (
              <TabItem
                key={returnMyPageType[key].title}
                active={myPageType == key ? 1 : 0}
                main_color={main_color}
                onClick={() => router.push(`/shop/auth/my-page?type=${key}`)}
              >
                {returnMyPageType[key].title}
              </TabItem>
            )
          })}
        </TabNav>
        <Grid container spacing={3}>
          {myPageType == 0 &&
            <>
              <Grid item xs={12} md={4}>
                <Card sx={{ py: 6, px: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', ...cleanCardSx }}>
                  <Avatar
                    sx={{
                      width: '84px',
                      height: '84px',
                      marginBottom: '1.25rem',
                      bgcolor: `${main_color}22`,
                      color: main_color,
                    }}
                  />
                  <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>{userObj.nickname}</Typography>
                  <Typography variant='body2' sx={{ color: main_color, mt: 0.5, fontWeight: 'bold' }}>{commarNumber(userObj.point)} P</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 3, ...cleanCardSx }}>
                  <Typography variant='subtitle2' sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: themeObj.grey[600], mb: 2.5 }}>
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
                    <TextField name="displayName" label={translate("아이디")} defaultValue={userObj?.user_name} value={userObj?.user_name} disabled={true} />

                    <TextField name="email" label={translate("이름")} defaultValue={userObj?.nickname} value={userObj?.nickname} disabled={true} />

                    <TextField name="phone_num" label={translate("전화번호")} defaultValue={userObj?.phone_num} value={userObj?.phone_num} disabled={true} />
                  </Box>
                  <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>

                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      {translate('변경사항 저장')}
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            </>}
          {myPageType == 1 &&
            <>
              <Col style={{ width: '100%' }}>
                <Card sx={{ marginBottom: '2rem', ...cleanCardSx }}>
                  <AddressTable
                    addressContent={addressContent}
                    onDelete={onDeleteAddress}
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
                <Row style={{ marginTop: '1.5rem' }}>
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
export default MyPageDemo3
