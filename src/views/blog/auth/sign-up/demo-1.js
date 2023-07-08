import PropTypes from 'prop-types';
import { Checkbox, FormControlLabel, TextField, Typography, IconButton, Drawer, Button, Select, MenuItem, InputLabel } from '@mui/material';
import { useState } from 'react';
import { Row, themeObj } from 'src/components/elements/styled-components';
import styled from 'styled-components'
import Iconify from 'src/components/iconify/Iconify';
import { useTheme } from '@emotion/react';
import Policy from 'src/pages/blog/auth/policy';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import Header from 'src/layouts/shop/blog/demo-1/header';

const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin:56px auto 0 auto;
width:90%;
@media (max-width:798px){
  width:100%;
}
`

const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
word-spacing: 0.2rem;
@media (max-width:798px){
  padding: 0 auto;
}
`

const CheckBoxes = styled.div`
display:flex;
flex-direction:column;
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

const TextFieldContainer = styled.div`
display:flex;
flex-direction:column;
@media (max-width:798px){
  padding:5%;
}
`

const TextFieldBox = styled.div`
display:flex;
width:100%;
margin: 0 auto;
`

const PolicyContainer = styled.div`
padding:4rem 2.5% 0 2.5%
`

const SelectContainer = styled.div`
display:flex;
width:100%;
margin:0 auto;
`

const SelectBox = styled.div`
display:flex;
flex-direction:column;
margin-right:1%;
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
  const [policyType, setPolicyType] = useState("")
  const [buttonText, setButtonText] = useState("인증받기")
  const [birthDate, setBirthDate] = useState({
    year: "",
    month: "",
    day: ""
  })

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

  const now = new Date();

  let years = [];
  for (let y = now.getFullYear(); y >= 1900; y -= 1) {
    years.push(y);
  }

  let months = [];
  for (let m = 1; m <= 12; m += 1) {
    months.push(m.toString());
  }

  let days = [];
  let date = new Date(birthDate.year, birthDate.month, 0).getDate();
  for (let d = 1; d <= date; d += 1) {
    days.push(d.toString());
  }

  return (
    <>
      <Header
        data={{
        }}
        func={{
          router
        }}
        is_use_step={true}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />
      <Wrappers>
        {activeStep == 0 &&
          <>
            <TextFieldContainer>
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
                    <IconButton style={{ width: '24px', height: '40px', padding: '0' }}>
                      <Icon icon='ep:arrow-right' color='black' onClick={() => {
                        setOpenPolicy(true)
                        setPolicyType(0)
                      }} />
                    </IconButton>
                  </DetailedCheckbox>
                  <DetailedCheckbox>
                    <FormControlLabel label={<Typography>개인정보 수집 이용 동의<span style={{ color: 'red' }}>(필수)</span></Typography>} control={<Checkbox checked={checkboxObj.check_3} onChange={(e) => {
                      setCheckboxObj({ ...checkboxObj, ['check_3']: e.target.checked })
                    }} />} />
                    <IconButton style={{ width: '24px', height: '40px', padding: '0' }} >
                      <Icon icon='ep:arrow-right' color='black' onClick={() => {
                        setOpenPolicy(true)
                        setPolicyType(1)
                      }} />
                    </IconButton>
                  </DetailedCheckbox>
                  <DetailedCheckbox>
                    <FormControlLabel label={<Typography>마케팅 정보 수신 동의<span style={{ color: 'gray' }}>(선택)</span></Typography>} control={<Checkbox checked={checkboxObj.check_4} onChange={(e) => {
                      setCheckboxObj({ ...checkboxObj, ['check_4']: e.target.checked })
                    }} />} />
                    <IconButton style={{ width: '24px', height: '40px', padding: '0' }} >
                      <Icon icon='ep:arrow-right' color='black' onClick={() => {
                        setOpenPolicy(true)
                        setPolicyType(2)
                      }} />
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
                  margin: '3rem 0 0 0',
                  fontSize: 'large',
                  height:'56px'
                }}
                onClick={() => { setActiveStep(activeStep + 1) }}
              >다음으로</Button>
              <Drawer
                anchor='bottom'
                open={openPolicy}
                onClose={() => {
                  setOpenPolicy(false)

                }}
                PaperProps={{
                  sx: {
                    maxWidth: '790px',
                    width: '90%',
                    maxHeight: '500px',
                    margin: '0 auto',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    paddingBottom: '2rem',
                    position: 'fixed'
                  }
                }}
              >
                <PolicyContainer>
                  {policyType != 2 ? <Policy type={policyType} /> : " 할인쿠폰 및 혜택, 이벤트, 신상품 소식 등 쇼핑몰에서 제공하는 유익한 쇼핑정보를 SMS나 이메일로 받아보실 수 있습니다. 단, 주문/거래 정보 및 주요 정책과 관련된 내용은 수신동의 여부와 관계없이 발송됩니다. 선택 약관에 동의하지 않으셔도 회원가입은 가능하며, 회원가입 후 회원정보수정 페이지에서 언제든지 수신여부를 변경하실 수 있습니다."}
                </PolicyContainer>
              </Drawer>
            </TextFieldContainer>
          </>
        }
        {activeStep == 1 &&
          <>
            <TextFieldContainer>
              <Title>휴대폰 번호 인증</Title>
              <TextFieldTitle>휴대폰 번호</TextFieldTitle>
              <TextFieldBox>
                <TextField
                  name='phoneNum'
                  autoComplete='new-password'
                  placeholder='휴대폰 번호 입력'
                  sx={{
                    width: '72%',
                    marginRight: '1%'
                  }}
                />
                <Button
                  variant='outlined'
                  color='primary'
                  style={{
                    width: '27%',
                    height:'56px'
                  }}
                  onClick={() => {
                    setButtonText("재전송")
                  }}
                >{buttonText}</Button>
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
                onClick={() => { setActiveStep(activeStep + 1) }}
              >인증완료</Button>
            </TextFieldContainer>
          </>
        }
        {activeStep == 2 &&
          <>
            <TextFieldContainer>
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
              <SelectContainer>
                <SelectBox>
                  <InputLabel>년</InputLabel>
                  <Select
                    value={birthDate.year}
                    label='년'
                    style={{
                      width: '100px'
                    }}
                    onChange={(e) => {
                      setBirthDate({ ...birthDate, year: e.target.value })
                    }}
                  >
                    {years.map(item => (
                      <MenuItem value={item} key={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </SelectBox>
                <SelectBox>
                  <InputLabel>월</InputLabel>
                  <Select
                    value={birthDate.month}
                    label='월'
                    style={{
                      width: '80px'
                    }}
                    onChange={(e) => {
                      setBirthDate({ ...birthDate, month: e.target.value })
                    }}
                  >
                    {months.map(item => (
                      <MenuItem value={item} key={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </SelectBox>
                <SelectBox>
                  <InputLabel>일</InputLabel>
                  <Select
                    value={birthDate.day}
                    label='일'
                    style={{
                      width: '80px'
                    }}
                    onChange={(e) => {
                      setBirthDate({ ...birthDate, day: e.target.value })
                    }}
                  >
                    {days.map(item => (
                      <MenuItem value={item} key={item}>{item}</MenuItem>
                    ))}
                  </Select>
                </SelectBox>
              </SelectContainer>
              <Button
                variant='contained'
                color='primary'
                style={{
                  height: '56px',
                  marginTop: '10%',
                  fontSize: 'large'
                }}
                onClick={() => { setActiveStep(activeStep + 1) }}
              >완료</Button>
            </TextFieldContainer>
          </>
        }
        {activeStep == 3 &&
          <>
            <TextFieldContainer>
              <Title>축하합니다!<br />회원가입이 완료되었습니다!<br />이제 Comagain의 서비스를 즐겨보세요!</Title>
              <Button
                variant='contained'
                color='primary'
                style={{
                  height: '56px',
                  marginTop: '10%',
                  fontSize: 'large'
                }}
                onClick={() => {
                  router.push('/blog/auth/login')
                }}
              >로그인하러 가기</Button>
            </TextFieldContainer>
          </>
        }
      </Wrappers>
    </>
  )
}

export default Demo1
