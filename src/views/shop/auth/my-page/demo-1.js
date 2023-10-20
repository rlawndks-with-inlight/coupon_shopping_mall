import { Avatar, Box, Button, Card, Grid, Select, Stack, Switch, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Title } from 'src/components/elements/styled-components';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { fData } from 'src/utils/formatNumber';
import styled from 'styled-components'
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

  useEffect(() => {
    console.log(myPageType)
  }, [myPageType])
  return (
    <>
      <Wrappers>
        <Title style={{ width: '100%', marginBottom: '2rem' }}>
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
                  <div>{userObj.nick_name}</div>
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

                    <TextField name="email" label="이름" defaultValue={userObj?.nick_name} value={userObj?.nick_name} disabled={true} />

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

        </Grid>
      </Wrappers>
    </>
  )
}
export default Demo1
