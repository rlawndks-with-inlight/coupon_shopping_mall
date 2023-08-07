import { Avatar, Box, Button, Card, Grid, Select, Stack, Switch, TextField, Typography } from '@mui/material';
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
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userObj, setUserObj] = useState({})
  useEffect(()=>{
    if(user){
      setUserObj(user);
    }
  },[user])

  const handleDrop = () => {

  }
  return (
    <>
      <Wrappers>
        <Title>마이페이지</Title>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ py: 10, px: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: '84px',
                  height: '84px',
                  marginBottom:'1rem'
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
                <TextField name="displayName" label="아이디" defaultValue={userObj?.user_name}  value={userObj?.user_name} disabled={true} />

                <TextField name="email" label="이름" defaultValue={userObj?.nick_name} value={userObj?.nick_name} disabled={true}/>

                <TextField name="phone_num" label="전화번호" defaultValue={userObj?.phone_num} value={userObj?.phone_num} disabled={true}/>

                <TextField name="address" label="이메일" />
              </Box>
              <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>

                <Button type="submit" variant="contained" loading={isSubmitting}>
                  변경사항 저장
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Wrappers>
    </>
  )
}
export default Demo1
