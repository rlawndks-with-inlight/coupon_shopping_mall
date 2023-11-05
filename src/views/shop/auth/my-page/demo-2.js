import { Box, TextField, Avatar, Button, Card, Grid, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { Title } from 'src/components/elements/styled-components';
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import styled from "styled-components";

const Wrappers = styled.div`
max-width: 1200px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height: 90vh;
margin-bottom: 10vh;
`
//마이페이지 박이규
const Demo2 = (props) => {
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
  useEffect(() => {
    if (user) {
      setUserObj(user);
    }
  }, [user])

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
                  height: '84px'
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

                <TextField name="email" label="이름" />

                <TextField name="phone_num" label="닉네임" />

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
export default Demo2
