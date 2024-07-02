import PropTypes from 'prop-types';
import { Button, Card, Checkbox, Divider, FormControl, FormControlLabel, Grid, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack, Step, StepConnector, StepLabel, Stepper, TextField, Typography, stepConnectorClasses } from '@mui/material';
import { useEffect, useState } from 'react';
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import styled from 'styled-components'
import { styled as muiStyled } from '@mui/material/styles';
import Iconify from 'src/components/iconify/Iconify';
import { bgGradient } from 'src/utils/cssStyles';
import { useTheme } from '@emotion/react';
import Policy from 'src/pages/shop/auth/policy';
import { toast } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import { bankCodeList } from 'src/utils/format';

const Wrappers = styled.div`
max-width:1000px;
display:flex;
flex-direction:column;
margin: 0 auto 5rem auto;
width: 90%;
min-height:90vh;
`

const STEPS = ['약관동의', '정보입력', '가입완료'];
const ColorlibConnector = muiStyled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      ...bgGradient({
        startColor: theme.palette.primary.light,
        endColor: theme.palette.primary.main,
      }),
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      ...bgGradient({
        startColor: theme.palette.primary.light,
        endColor: theme.palette.primary.main,
      }),
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    borderRadius: 1,
    backgroundColor: theme.palette.divider,
  },
}));
const ColorlibStepIconRoot = muiStyled('div')(({ theme, ownerState }) => ({
  zIndex: 1,
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.disabled,
  backgroundColor:
    theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
  ...(ownerState.active && {
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    color: theme.palette.common.white,
    ...bgGradient({
      startColor: theme.palette.primary.light,
      endColor: theme.palette.primary.main,
    }),
  }),
  ...(ownerState.completed && {
    color: theme.palette.common.white,
    ...bgGradient({
      startColor: theme.palette.primary.light,
      endColor: theme.palette.primary.main,
    }),
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <Iconify icon="eva:settings-2-outline" width={24} />,
    2: <Iconify icon="eva:person-add-outline" width={24} />,
    3: <Iconify icon="fluent-mdl2:completed" width={24} />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}
ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  icon: PropTypes.number,
  completed: PropTypes.bool,
  className: PropTypes.string,
};

const SignUpDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeDnsData } = useSettingsContext();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [checkboxObj, setCheckboxObj] = useState({
    check_0: false,
    check_1: false,
    check_2: false,
    check_3: false,
    check_4: false,
    check_5: false,
  })
  const [user, setUser] = useState({
    user_name: '',
    user_pw: '',
    user_pw_check: '',
    name: '',
    nickname: '',
    phone_num: '',
    phoneCheck: '',
  })
  const [loading, setLoading] = useState(true);
  const [phoneCheckStep, setPhoneCheckStep] = useState(0);
  const onClickPrevButton = () => {
    if (activeStep == 0) {
      router.back();
      return;
    }
    if (activeStep == 1) {

    }
    if (activeStep == 2) {

    }
    setActiveStep(activeStep - 1);
    window.scrollTo(0, 0)
  }
  useEffect(() => {
    if (themeDnsData?.setting_obj?.is_use_seller != 1) {
      setUser({
        ...user,
        level: 0,
      })
    }
    setLoading(false);
  }, [])
  const onClickNextButton = async () => {
    if (activeStep == 0) {
      if (
        !checkboxObj.check_1 ||
        !checkboxObj.check_2
      ) {
        toast.error("필수 항목에 체크해 주세요.");
        return;
      }
    }
    if (activeStep == 1) {
      if (
        !user.user_name ||
        !user.user_pw ||
        !user.user_pw_check ||
        !user.nickname ||
        !user.phone_num
      ) {
        toast.error("필수 항목을 입력해 주세요.");
        return;
      } else if (
        user.user_pw != user.user_pw_check
      ) {
        toast.error("비밀번호 확인란을 똑같이 입력했는지 확인해주세요");
        return;
      }
      let result = await apiManager('auth/sign-up', 'create', { ...user, brand_id: themeDnsData?.id });
      if (!result) {
        return;
      }
    }
    if (activeStep == 2) {
      router.push('/shop/auth/login');
      return;
    }
    setActiveStep(activeStep + 1);
    window.scrollTo(0, 0)
  }
  const onClickSendPhoneVerifyCode = async () => {
    setPhoneCheckStep(1);
    let result = await apiManager('auth/code', 'create', {
      phone_num: user.phone_num
    })
  }
  if (loading) {
    return <>

    </>
  }
  if (!(user?.level >= 0)) {
    return <>
      <Wrappers>
        <Title>회원가입</Title>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: '100%', height: '300px', display: 'flex', cursor: 'pointer' }}
              onClick={() => {
                setUser({
                  ...user,
                  level: 0
                })
              }}>
              <Col style={{ alignItems: 'center', margin: 'auto', rowGap: '0.5rem' }}>
                <Icon icon={'material-symbols:person-outline'} style={{ fontSize: '4rem' }} />
                <Typography variant='subtitle1'>일반회원</Typography>
              </Col>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2, height: '100%', height: '300px', display: 'flex', cursor: 'pointer' }}
              onClick={() => {
                setUser({
                  ...user,
                  level: 10
                })
              }}>
              <Col style={{ alignItems: 'center', margin: 'auto', rowGap: '0.5rem' }}>
                <Icon icon={'icon-park-outline:shop'} style={{ fontSize: '4rem' }} />
                <Typography variant='subtitle1'>판매자회원</Typography>
              </Col>
            </Card>
          </Grid>
        </Grid>
      </Wrappers>
    </>
  }
  return (
    <>
      <Wrappers>
        <Title>회원가입</Title>
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div style={{ marginTop: '2rem' }} />
        {activeStep == 0 &&
          <>
            <FormControlLabel label={<Typography style={{ fontWeight: 'bold', fontSize: themeObj.font_size.size5 }}> 이용약관 및 개인정보수집 및 이용, 쇼핑정보 수신(선택)에 모두 동의합니다.</Typography>} control={<Checkbox checked={checkboxObj.check_0} />} onChange={(e) => {
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
            <div style={{ marginTop: '1rem' }} />
            <Divider />
            <div style={{ marginTop: '1rem' }} />
            <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>이용약관 동의 (필수)</Typography>} control={<Checkbox checked={checkboxObj.check_1} onChange={(e) => {
              setCheckboxObj({ ...checkboxObj, ['check_1']: e.target.checked })
            }} />} />
            <div style={{ marginTop: '0.5rem' }} />
            <div style={{
              height: '10rem',
              overflowY: 'auto',
              border: `1px solid ${themeObj.grey[300]}`
            }}>
              <Policy type={0} />
            </div>
            <div style={{ marginTop: '1rem' }} />
            <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>개인정보 수집 및 이용 동의 (필수)</Typography>} control={<Checkbox checked={checkboxObj.check_2} onChange={(e) => {
              setCheckboxObj({ ...checkboxObj, ['check_2']: e.target.checked })
            }} />} />
            <div style={{ marginTop: '0.5rem' }} />
            <div style={{
              height: '10rem',
              overflowY: 'auto',
              border: `1px solid ${themeObj.grey[300]}`
            }}>
              <Policy type={1} />
            </div>
            <div style={{ marginTop: '1rem' }} />
            <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>쇼핑정보 수신 동의 (선택)</Typography>} control={<Checkbox checked={checkboxObj.check_3} onChange={(e) => {

              setCheckboxObj({ ...checkboxObj, ['check_3']: e.target.checked, ['check_4']: e.target.checked, ['check_5']: e.target.checked, })
            }} />} />
            <div style={{ marginTop: '1rem' }} />
            <Divider />
            <div style={{ marginTop: '1rem' }} />
            <Row>
              <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size7 }}>SMS 수신 동의 (선택)</Typography>} control={<Checkbox checked={checkboxObj.check_4} onChange={(e) => {
                setCheckboxObj({ ...checkboxObj, ['check_4']: e.target.checked })
              }} />} />
              <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size7 }}>이메일 수신 동의 (선택)</Typography>} control={<Checkbox checked={checkboxObj.check_5} onChange={(e) => {
                setCheckboxObj({ ...checkboxObj, ['check_5']: e.target.checked })
              }} />} />
            </Row>
            <div style={{ marginTop: '0.5rem' }} />
            <div style={{
              height: '10rem',
              overflowY: 'auto',
              border: `1px solid ${themeObj.grey[300]}`,
              padding: '2rem',
              fontSize: themeObj.font_size.size7
            }}>
              할인쿠폰 및 혜택, 이벤트, 신상품 소식 등 쇼핑몰에서 제공하는 유익한 쇼핑정보를 SMS나 이메일로 받아보실 수 있습니다. 단, 주문/거래 정보 및 주요 정책과 관련된 내용은 수신동의 여부와 관계없이 발송됩니다.
              선택 약관에 동의하지 않으셔도 회원가입은 가능하며, 회원가입 후 회원정보수정 페이지에서 언제든지 수신여부를 변경하실 수 있습니다.
            </div>
          </>}
        {activeStep == 1 &&
          <>
            <TextField
              label='아이디'
              onChange={(e) => {
                setUser({ ...user, ['user_name']: e.target.value })
              }}
              value={user.user_name}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="eva:person-fill" width={24} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label='비밀번호'
              onChange={(e) => {
                setUser({ ...user, ['user_pw']: e.target.value })
              }}
              type='password'
              value={user.user_pw}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <TextField
              label='비밀번호 확인'
              onChange={(e) => {
                setUser({ ...user, ['user_pw_check']: e.target.value })
              }}
              type='password'
              value={user.user_pw_check}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <TextField
              label='이름'
              onChange={(e) => {
                setUser({ ...user, ['name']: e.target.value })
              }}
              value={user.name}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            {/*<TextField
              label='닉네임'
              onChange={(e) => {
                setUser({ ...user, ['nickname']: e.target.value })
              }}
              value={user.nickname}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />*/}
            <FormControl variant="outlined" style={{ width: '100%', marginTop: '1rem' }}>
              <InputLabel>휴대폰번호</InputLabel>
              <OutlinedInput
                label='휴대폰번호'
                type='number'
                placeholder="하이픈(-) 제외 입력"
                onChange={(e) => {
                  setUser({ ...user, ['phone_num']: e.target.value })
                }}
                value={user.phone_num}
              // endAdornment={<>
              //   <Button style={{ width: '144px', height: '56px', transform: 'translateX(14px)' }}
              //     variant="contained"
              //     onClick={() => {
              //       if (phoneCheckStep == 0) {
              //         onClickSendPhoneVerifyCode();
              //       }
              //     }}
              //   >인증번호발송</Button>
              // </>}
              />
            </FormControl>
            {/* <FormControl variant="outlined" style={{ width: '100%', marginTop: '1rem' }}>
              <InputLabel>휴대폰번호</InputLabel>
              <OutlinedInput
                label='휴대폰번호'
                placeholder="하이픈(-) 제외 입력"
                onChange={(e) => {
                  setUser({ ...user, ['phoneCheck']: e.target.value })
                }}
                value={user.phoneCheck}
                endAdornment={<>
                  <Button style={{ width: '144px', height: '56px', transform: 'translateX(14px)' }}
                    variant="contained"
                    onClick={() => {
                    }}
                  >인증번호확인</Button>
                </>}
              />
            </FormControl> */}
            {user?.level == 10 &&
              <>
                <Stack spacing={1}>
                  <FormControl variant="outlined" style={{ width: '100%', marginTop: '1rem' }}>
                    <InputLabel>은행선택</InputLabel>
                    <Select
                      label='은행선택'
                      value={user.acct_bank_code}
                      onChange={e => {
                        setUser({
                          ...user,
                          ['acct_bank_code']: e.target.value
                        })
                      }}
                    >
                      {bankCodeList.map((itm, idx) => {
                        return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                </Stack>

                <TextField
                  style={{ marginTop: '1rem' }}
                  label='계좌번호'
                  value={user.acct_num}
                  onChange={(e) => {
                    setUser(
                      {
                        ...user,
                        ['acct_num']: e.target.value
                      }
                    )
                  }} />
                <TextField
                  style={{ marginTop: '1rem' }}
                  label='예금주명'
                  value={user.acct_name}
                  onChange={(e) => {
                    setUser(
                      {
                        ...user,
                        ['acct_name']: e.target.value
                      }
                    )
                  }} />
              </>}
          </>}
        {activeStep == 2 &&
          <>
            <Col>
              <Icon icon={'fluent-mdl2:completed'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: theme.palette.primary.main }} />
              <div style={{ margin: 'auto auto 8rem auto' }}>회원가입이 완료되었습니다.</div>
            </Col>
          </>}
        <Row style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button variant="outlined" style={{
            height: '56px',
            marginTop: '1rem',
            width: '49%'
          }}
            onClick={onClickPrevButton}
          >이전</Button>
          <Button variant="contained" style={{
            height: '56px',
            marginTop: '1rem',
            width: '49%'
          }}
            onClick={onClickNextButton}
          >{activeStep == 2 ? '완료' : '다음'}</Button>
        </Row>
      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default SignUpDemo