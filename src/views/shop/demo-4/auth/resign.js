import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, RowMobileColumn, RowMobileReverceColumn, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import styled from "styled-components";
import { Row } from "src/components/elements/styled-components";
import { Button, FormControl, TextField, InputLabel, OutlinedInput } from '@mui/material'
import { apiManager } from "src/utils/api";
import toast from 'react-hot-toast'

const Wrappers = styled.div`
max-width:1400px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`

const ResignDemo = (props) => {

  const { user, logout } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const [password, setPassword] = useState('');

  const router = useRouter();
  useEffect(() => {
    if (user) {
    } else {
      router.push(`/shop/auth/login`);
    }
  }, [])

  const onResign = async () => {
    let obj = {password: password}
    let result = await apiManager('auth/resign', 'update', obj)
    if (result) {
      toast.success('회원탈퇴가 완료되었습니다.');
      setPassword('')
      router.push('/shop/auth/login');
    }
}

  return (
    <>
      <Wrappers>
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{'회원탈퇴'}</TitleComponent>
            <div style={{ fontFamily: 'Noto Sans KR' }}>
              회원 탈퇴를 하시면 포인트와 혜택을 더 이상 이용하실 수 없습니다.<br />
              정말 탈퇴하시려면 비밀번호를 입력하고 탈퇴하기 버튼을 눌러주세요.<br />
              <span style={{ fontSize: '32px' }}>;(</span>
            </div>
            <div style={{borderTop:'1px solid #ccc', width:'100%', display:'flex', marginTop:'1rem', paddingTop:'1rem'}}>
              <FormControl variant="outlined">
                <InputLabel>비밀번호</InputLabel>
                <OutlinedInput
                label='비밀번호'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
                />
              </FormControl>
            <Button
              style={{
                backgroundColor: 'black',
                color: 'white',
                width: '20%',
                height: '60px',
                borderRadius: '0',
                fontSize: '18px',
              }}
              onClick={() => {
                onResign()
              }}
            >
              탈퇴하기
            </Button>
            </div>
          </ContentWrappers>
        </RowMobileReverceColumn>
      </Wrappers>
    </>
  )
}
export default ResignDemo