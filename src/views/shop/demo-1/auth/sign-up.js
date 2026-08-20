import PropTypes from 'prop-types';
import { Button, Checkbox, Divider, FormControl, FormControlLabel, InputAdornment, InputLabel, OutlinedInput, Step, StepConnector, StepLabel, Stepper, TextField, Typography, stepConnectorClasses } from '@mui/material';
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
import { useLocales } from 'src/locales';
import { generateRandomString, withSignUpName, validateSignUpInput, sanitizePhoneInput } from 'src/utils/function';
import SecurityQuestionFields from 'src/components/elements/shop/SecurityQuestionFields';
import { validateSecurityQuestion, securityQuestionPayload } from 'src/data/security-questions';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import PasswordField from 'src/components/elements/PasswordField';

const Wrappers = styled.div`
max-width:1000px;
display:flex;
flex-direction:column;
margin: 0 auto 5rem auto;
width: 90%;
min-height:90vh;
`

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
  const { translate } = useLocales();
  const STEPS = [translate('약관동의'), translate('정보입력'), translate('가입완료')];
  const { themeDnsData } = useSettingsContext();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [checkboxObj, setCheckboxObj] = useState({
    check_0: false,
    check_1: false,
    check_2: false,
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
  const [phoneCheckStep, setPhoneCheckStep] = useState(0);

  const [phoneToken, setPhoneToken] = useState('')
  const [phoneChecked, setPhoneChecked] = useState(false)

  useEffect(() => {
    settingPage();
  }, []);
  const settingPage = async () => {
    const response = await apiManager(`brands/otp`, 'create')
    setUser({
      ...user,
      otp_token: response?.base32,
    })
  }
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
  const onClickNextButton = async () => {
    if (activeStep == 0) {
      if (
        !checkboxObj.check_1 ||
        !checkboxObj.check_2
      ) {
        toast.error(translate("필수 항목에 체크해 주세요."));
        return;
      }
    }
    if (activeStep == 1) {
      if (themeDnsData?.id == 77) {
        if (
          !user.user_name ||
          !user.name ||
          !user.user_pw ||
          !user.user_pw_check ||
          !user.phone_num ||
          !user.phoneCheck
        ) {
          toast.error(translate("필수 항목을 입력해 주세요."));
          return;
        } else if (
          user.user_pw != user.user_pw_check
        ) {
          toast.error(translate("비밀번호 확인란을 똑같이 입력했는지 확인해주세요"));
          return;
        } else if (
          !phoneChecked
        ) {
          toast.error(translate("인증번호가 확인되지 않았습니다."));
          return;
        }
      } else if (
        !user.user_name ||
        !user.name ||
        !user.user_pw ||
        !user.user_pw_check ||
        !user.phone_num
      ) {
        toast.error(translate("필수 항목을 입력해 주세요."));
        return;
      } else if (
        user.user_pw != user.user_pw_check
      ) {
        toast.error(translate("비밀번호 확인란을 똑같이 입력했는지 확인해주세요"));
        return;
      }
      // SHOPGO 본사 및 산하 가맹점 전용 : 아이디 찾기(이름+휴대폰번호)에 쓰이므로 이름 필수. 다른 브랜드의 기존 검증 규칙은 그대로.
      if (isShopgoBrand(themeDnsData) && !user.name) {
        toast.error(translate("이름을 입력해 주세요."));
        return;
      }
      // 아이디·비밀번호·휴대폰 형식 검증. 예전엔 빈값만 봐서 한 글자 아이디·비밀번호가
      // 그대로 가입됐다(서버에도 검사가 없었다 — 백엔드 signUp 에도 같은 규칙을 넣었다).
      const formErr = validateSignUpInput(user);
      if (formErr) {
        toast.error(formErr);
        return;
      }

      // SHOPGO 본사 및 산하 가맹점 전용 : 비밀번호 재설정용 보안질문 필수 (그 외 브랜드는 '' 반환 → 무조건 통과)
      const secqErr = validateSecurityQuestion(user, themeDnsData);
      if (secqErr) {
        toast.error(secqErr);
        return;
      }
      let result = await apiManager('auth/sign-up', 'create', { ...withSignUpName(user), ...securityQuestionPayload(themeDnsData, user), brand_id: themeDnsData?.id });
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
    console.log(result)
    if (result?.phone_token) {
      alert('성공적으로 발송되었습니다.')
      setPhoneToken(result.phone_token)
    }
  }

  const onClickCheckPhoneVerifyCode = async () => {
    setPhoneCheckStep(2);
    let result = await apiManager('auth/code/check', 'create', {
      rand_num: user?.phoneCheck,
      phone_token: phoneToken
    })
    if (result) {
      alert(translate('인증 완료되었습니다'))
      setPhoneChecked(true)
    } else {
      alert(translate('새로고침하고 다시 시도해주세요.'))
    }
  }

  return (
    <>
      <Wrappers style={{ paddingBottom: '2rem' }}>
        <Title>{translate('회원가입')}</Title>
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
            <FormControlLabel label={<Typography style={{ fontWeight: 'bold', fontSize: themeObj.font_size.size5 }}> {translate('이용약관 및 개인정보 수집·이용에 모두 동의합니다.')}</Typography>} control={<Checkbox checked={checkboxObj.check_0} />} onChange={(e) => {
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
            <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>{translate('이용약관 동의 (필수)')}</Typography>} control={<Checkbox checked={checkboxObj.check_1} onChange={(e) => {
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
            <FormControlLabel label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>{translate('개인정보 수집 및 이용 동의 (필수)')}</Typography>} control={<Checkbox checked={checkboxObj.check_2} onChange={(e) => {
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
          </>}
        {activeStep == 1 &&
          <>
            <TextField
              label={translate('아이디')}
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
            <PasswordField
              label={translate('비밀번호')}
              onChange={(e) => {
                setUser({ ...user, ['user_pw']: e.target.value })
              }}

              value={user.user_pw}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <PasswordField
              label={translate('비밀번호확인')}
              onChange={(e) => {
                setUser({ ...user, ['user_pw_check']: e.target.value })
              }}

              value={user.user_pw_check}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <TextField
              label={translate('이름')}
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
            {/* 닉네임 입력 제거 — 이름 하나만 받기로 통일했다(전 프레임 공통).
                저장 시 nickname 에는 이름을 그대로 넣는다(utils/function.js withSignUpName).
                코드 전반이 nickname 을 표시용 이름으로 쓰고 있어 비우면 이름이 안 보인다.
            <TextField
              label={translate('닉네임')}
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
            />
            */}
            <FormControl variant="outlined" style={{ width: '100%', marginTop: '1rem' }}>
              <InputLabel>{translate('휴대폰번호')}</InputLabel>
              <OutlinedInput
                label={translate('휴대폰번호')}
                placeholder={translate("하이픈(-) 제외 입력")}
                onChange={(e) => {
                  setUser({ ...user, ['phone_num']: sanitizePhoneInput(e.target.value) }) // 숫자·하이픈만 (한글·영문이 그대로 저장되던 것)
                }}
                value={user.phone_num}
                endAdornment={
                  themeDnsData?.id == 77 ?
                    <>
                      <Button style={{ width: '144px', height: '56px', transform: 'translateX(14px)' }}
                        variant="contained"
                        onClick={() => {
                          if (phoneCheckStep == 0) {
                            onClickSendPhoneVerifyCode();
                          }
                        }}
                      >{translate('인증번호발송')}</Button>
                    </>
                    :
                    ''
                }
              />
            </FormControl>
            {
              themeDnsData?.id == 77 &&
              <>
                <FormControl variant="outlined" style={{ width: '100%', marginTop: '1rem' }}>
                  <InputLabel>{translate('인증번호')}</InputLabel>
                  <OutlinedInput
                    label={translate('인증번호')}
                    placeholder={translate('하이픈(-) 제외 입력')}
                    onChange={(e) => {
                      setUser({ ...user, ['phoneCheck']: e.target.value })
                    }}
                    value={user.phoneCheck}
                    endAdornment={<>
                      <Button style={{ width: '144px', height: '56px', transform: 'translateX(14px)' }}
                        variant="contained"
                        onClick={() => {
                          if (phoneCheckStep == 1) {
                            onClickCheckPhoneVerifyCode();
                          }
                        }}
                      >{translate('인증번호확인')}</Button>
                    </>}
                  />
                </FormControl>
              </>
            }
            <SecurityQuestionFields user={user} setUser={setUser} style={{ marginTop: '1rem', width: '100%' }} />
            {themeDnsData?.is_use_otp == 1 &&
              <>
                <TextField
                  label={translate('OTP TOKEN')}
                  disabled={true}
                  value={user.otp_token}
                  style={inputStyle}
                  autoComplete='new-password'
                  onKeyPress={(e) => {
                    if (e.key == 'Enter') {
                    }
                  }}
                />
              </>}
          </>}
        {activeStep == 2 &&
          <>
            <Col>
              <Icon icon={'fluent-mdl2:completed'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: theme.palette.primary.main }} />
              <div style={{ margin: 'auto auto 8rem auto' }}>{translate('회원가입이 완료되었습니다.')}</div>
            </Col>
          </>}
        <Row style={{ width: '100%', justifyContent: 'space-between' }}>
          {/* 가입완료(2단계)에서는 '이전'을 감춘다.
              이미 계정이 만들어진 뒤라, 이전으로 돌아가 '다음'을 다시 누르면
              가입 API 가 한 번 더 호출돼 '이미 사용 중인 아이디' 오류가 뜬다.
              가입에 성공했는데 실패한 것처럼 보인다. */}
          {activeStep != 2 &&
              <Button variant="outlined" style={{
                height: '56px',
                marginTop: '1rem',
                width: '49%'
              }}
                onClick={onClickPrevButton}
              >{translate('이전')}</Button>}
          <Button variant="contained" style={{
            height: '56px',
            marginTop: '1rem',
            width: '49%'
          }}
            onClick={onClickNextButton}
          >{activeStep == 2 ? translate('완료') : translate('다음')}</Button>
        </Row>
      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default SignUpDemo