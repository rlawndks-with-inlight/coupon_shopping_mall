import PropTypes from 'prop-types';
import { Checkbox, FormControlLabel, TextField, Typography, IconButton, Drawer, Button, Select, MenuItem } from '@mui/material';
import { useState } from 'react';
import { Row, themeObj } from 'src/components/elements/styled-components';
import styled from 'styled-components'
import Iconify from 'src/components/iconify/Iconify';
import { useTheme } from '@emotion/react';
import Policy from 'src/pages/blog/auth/policy';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';

const Wrappers = styled.div`
max-width:840px;
display:flex;
flex-direction:column;
margin:56px auto 0 auto;
width:100%;
`

const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
word-spacing: 0.2rem;
@media (max-width:840px){
    padding: 0 5% 0 5%;
}
`

const CheckBoxes = styled.div`
display:flex;
flex-direction:column;
@media (max-width:840px){
  padding:5%;
}
`

const ChildCheckboxes = styled.div`
display:flex;
flex-direction:column;
padding: 0 0 0 2.5%;
`

const DetailedCheckbox = styled.div`
display:flex;
`

const TextFieldTitle = styled.label`
font-size:1rem;
font-weight:regular;
margin:1.5rem 0 1rem 0;
`

const TextFieldBox = styled.div`
display:flex;
width:100%;
margin: 0 auto;
`

const SelectBox = styled.div`
display:flex;
justify-content:'space-between'
`

// 회원가입 김인욱
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [checkboxObj, setCheckboxObj] = useState({
    check_0: false,
    check_1: false,
    check_2: false,
    check_3: false,
    check_4: false,
  })
  const [user, setUser] = useState({
    id: '',
    password: '',
    passwordCheck: '',
    name: '',
    phone: '',
    email: '',
  })
  const [openPolicy, setOpenPolicy] = useState(false)

  const onClickPrevButton = () => {
    setActiveStep(activeStep - 1)
  }

  const onClickNextButton = () => {
    if (activeStep == 0) {
    
    }
    if (activeStep == 1) {

    }
    if (activeStep == 2) {

    }
    setActiveStep(activeStep + 1)
  }

  return (
    <>
      <Wrappers>
        {activeStep == 0 &&
          <>
            <Title>Comagain 회원가입<br />서비스 이용약관 동의</Title>
            <div style={{ marginTop: '2rem' }} />
            <CheckBoxes>
              <FormControlLabel label={<Typography>전체 동의(선택 항목 포함)</Typography>} control={<Checkbox checked={checkboxObj.check_0} />} onChange={(e) => {
                let check_obj = {}
                if (e.target.checked) {
                  for (let key in checkboxObj) {
                    check_obj[key] = true;
                  }
                } else {
                  for (let key in checkboxObj) {
                    check_obj[key] = false;
                  }
                }
                setCheckboxObj(check_obj)
              }} />
              <ChildCheckboxes>
                <FormControlLabel label={<Typography>만 14세 이상입니다<span style={{ color: 'red' }}>(필수)</span></Typography>} control={<Checkbox checked={checkboxObj.check_1} onChange={(e) => {
                  setCheckboxObj({ ...checkboxObj, ['check_1']: e.target.checked })
                }} />} />
                <DetailedCheckbox>
                  <FormControlLabel label={<Typography>서비스 이용약관<span style={{ color: 'red' }}>(필수)</span></Typography>} control={<Checkbox checked={checkboxObj.check_2} onChange={(e) => {
                    setCheckboxObj({ ...checkboxObj, ['check_2']: e.target.checked })
                  }} />} />
                  <IconButton style={{ width: '24px', height: '40px', padding: '0' }} >
                    <Icon icon='ep:arrow-right' color='black' />
                  </IconButton>
                </DetailedCheckbox>
                <DetailedCheckbox>
                  <FormControlLabel label={<Typography>개인정보 수집 이용 동의<span style={{ color: 'red' }}>(필수)</span></Typography>} control={<Checkbox checked={checkboxObj.check_3} onChange={(e) => {
                    setCheckboxObj({ ...checkboxObj, ['check_3']: e.target.checked })
                  }} />} />
                  <IconButton style={{ width: '24px', height: '40px', padding: '0' }} >
                    <Icon icon='ep:arrow-right' color='black' />
                  </IconButton>
                </DetailedCheckbox>
                <DetailedCheckbox>
                  <FormControlLabel label={<Typography>마케팅 정보 수신 동의<span style={{ color: 'gray' }}>(선택)</span></Typography>} control={<Checkbox checked={checkboxObj.check_4} onChange={(e) => {
                    setCheckboxObj({ ...checkboxObj, ['check_4']: e.target.checked })
                  }} />} />
                  <IconButton style={{ width: '24px', height: '40px', padding: '0' }} >
                    <Icon icon='ep:arrow-right' color='black' />
                  </IconButton>
                </DetailedCheckbox>
              </ChildCheckboxes>
            </CheckBoxes>
            <Button
              disabled={checkboxObj.check_1 && checkboxObj.check_2 && checkboxObj.check_3 ? false : true}
              variant='contained'
              color='primary'
              size='large'
              style={{
                margin: '3rem 2.5% 0 2.5%',
                fontSize: 'large'
              }}
              onClick={() => {setActiveStep(activeStep+1)}}
            >다음으로</Button>
          </>
        }
        {activeStep == 1 &&
          <>
            <Title>휴대폰 번호 인증</Title>
            <TextFieldTitle>휴대폰 번호</TextFieldTitle>
            <TextFieldBox>
              <TextField
                name='phoneNum'
                autoComplete='new-password'
                placeholder='휴대폰 번호 입력'
                sx={{
                  width: '84%',
                  marginRight: '1%'
                }}
              />
              <Button
                variant='outlined'
                color='primary'
                style={{
                  width: '15%'
                }}
              >인증받기</Button>
            </TextFieldBox>
            <TextField
              name='certificationNum'
              autoComplete='new-password'
              placeholder='인증번호 입력'
              sx={{
                marginTop: '1%'
              }}
            />
            <Button
              variant='contained'
              color='primary'
              style={{
                height: '56px',
                marginTop: '10%',
                fontSize: 'large'
              }}
              onClick={() => {setActiveStep(activeStep+1)}}
            >인증완료</Button>
          </>
        }
        {activeStep == 2 &&
          <>
            <Title>회원가입</Title>
            <TextFieldTitle>아이디</TextFieldTitle>
              <TextField
                name='id'
                placeholder='영문 소문자, 숫자, 특수문자 가능 / 4~20자'
                sx={{
                  marginBottom: '1%'
                }}
              />
            <TextFieldTitle>비밀번호</TextFieldTitle>
              <TextField
                name='password'
                placeholder='영문 소문자, 숫자 조합 / 8~20자'
                sx={{
                  marginBottom: '1%'
                }}
              />
              <TextFieldTitle>비밀번호 확인</TextFieldTitle>
              <TextField
                name='passwordCheck'
                placeholder='비밀번호를 다시 입력해주세요'
                sx={{
                  marginBottom: '1%'
                }}
              />
              <TextFieldTitle>생년월일</TextFieldTitle>
              <Select
              placeholder='년'
              >
              </Select>
              <Select
              placeholder='월'
              >
              </Select>
              <Select
              placeholder='일'
              >
              </Select>
            <Button
              variant='contained'
              color='primary'
              style={{
                height: '56px',
                marginTop: '10%',
                fontSize: '15px'
              }}
              onClick={() => {setActiveStep(activeStep+1)}}
            >완료</Button>
          </>
        }
      </Wrappers>
      <Drawer></Drawer>
    </>
  )
}

export default Demo1
