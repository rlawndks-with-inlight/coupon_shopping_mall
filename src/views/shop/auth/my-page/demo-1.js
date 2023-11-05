import { Avatar, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Pagination, Select, Stack, Switch, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { AddressTable } from 'src/components/elements/shop/common';
import { Col, Row, Title, postCodeStyle } from 'src/components/elements/styled-components';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { fData } from 'src/utils/formatNumber';
import { makeMaxPage } from 'src/utils/function';
import styled from 'styled-components'
import DaumPostcode from 'react-daum-postcode';
import { apiManager } from 'src/utils/api';

const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const returnMyPageType = {
  0: {
    title: '마이페이지',
    defaultObj: {

    }
  },
  1: {
    title: '주소지설정',
    defaultObj: {

    }
  }
}
const TABLE_HEAD = [
  { id: 'No.', label: 'No.' },
  { id: 'addr', label: '주소' },
  { id: 'addr', label: '상세주소' },
  { id: '' },
];
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const { user } = useAuthContext();
  const [myPageType, setMyPageType] = useState(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userObj, setUserObj] = useState({})
  const [addressContent, setAddressContent] = useState({});
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [addAddressObj, setAddAddressObj] = useState({
    addr: '',
    detail_addr: '',
    is_open_daum_post: false,
  })
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    search: '',
    user_id: user?.id,
  })
  const [isSeePostCode, setIsSeePostCode] = useState(false);
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
    setAddressContent({
      ...addressContent,
      content: undefined,
    })
    let data = await apiManager('user-addresses', 'list', search_obj);
    setSearchObj(search_obj);
    if (data) {
      setAddressContent(data);
    }
  }
  const onSelectAddress = (data) => {
    setAddAddressObj({
      ...addAddressObj,
      addr: data?.address,
      detail_addr: '',
      is_open_daum_post: false,
    })
  }
  const onAddAddress = async () => {
    let result = await apiManager('user-addresses', 'create', {
      ...addAddressObj,
      user_id: user?.id,
    })
    if (result) {
      setAddAddressObj({
        addr: '',
        detail_addr: '',
        is_open_daum_post: false,
      })
      setAddAddressOpen(false);
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
      <Dialog
        open={addAddressOpen}
        onClose={() => {
          setAddAddressObj({
            addr: '',
            detail_addr: '',
            is_open_daum_post: false,
          })
          setAddAddressOpen(false);
        }}
        PaperProps={{
          style: {
            width: `${window.innerWidth >= 700 ? '500px' : '90vw'}`,
          }
        }}
      >
        {addAddressObj.is_open_daum_post ?
          <>
            <Row>
              <DaumPostcode style={postCodeStyle} onComplete={onSelectAddress} />
            </Row>
          </>
          :
          <>
            <DialogTitle>{`주소지 추가`}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                새 주소를 입력후 저장을 눌러주세요.
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                value={addAddressObj.addr}
                margin="dense"
                label="주소"
                aria-readonly='true'
                onClick={() => {
                  setAddAddressObj({
                    ...addAddressObj,
                    is_open_daum_post: true,
                  })
                }}
              />
              <TextField
                autoFocus
                fullWidth
                value={addAddressObj.detail_addr}
                margin="dense"
                label="상세주소"
                onChange={(e) => {
                  setAddAddressObj({
                    ...addAddressObj,
                    detail_addr: e.target.value
                  })
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={onAddAddress}>
                저장
              </Button>
              <Button color="inherit" onClick={() => {
                setAddAddressObj({
                  addr: '',
                  detail_addr: '',
                  is_open_daum_post: false,
                })
                setAddAddressOpen(false);
              }}>
                취소
              </Button>
            </DialogActions>
          </>}

      </Dialog>
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
                  <div>{userObj.nickname}</div>
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
                    <TextField name="displayName" label="아이디" defaultValue={userObj?.user_name} value={userObj?.user_name} disabled={true} />

                    <TextField name="email" label="이름" defaultValue={userObj?.nickname} value={userObj?.nickname} disabled={true} />

                    <TextField name="phone_num" label="전화번호" defaultValue={userObj?.phone_num} value={userObj?.phone_num} disabled={true} />

                    <TextField name="address" label="이메일" />
                  </Box>
                  <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>

                    <Button type="submit" variant="contained" loading={isSubmitting}>
                      변경사항 저장
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
                    headLabel={TABLE_HEAD}
                    onDelete={onDeleteAddress}
                  />
                </Card>
                <Pagination
                  sx={{ margin: 'auto' }}
                  size={window.innerWidth > 700 ? 'medium' : 'small'}
                  count={makeMaxPage(addressContent?.total, addressContent?.page_size)}
                  page={addressContent?.page}
                  variant='outlined' shape='rounded'
                  color='primary'
                  onChange={(_, num) => {
                    onChangePage({ ...searchObj, page: num })
                  }} />
                <Row>
                  <Button variant="contained" style={{ marginLeft: 'auto' }} onClick={() => setAddAddressOpen(true)}>
                    주소지 추가
                  </Button>
                </Row>
              </Col>

            </>}
        </Grid>
      </Wrappers>
    </>
  )
}
export default Demo1
