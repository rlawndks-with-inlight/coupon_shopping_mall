import { Button, Checkbox, Divider, FormControl, FormControlLabel, InputLabel, OutlinedInput, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { themeObj } from 'src/components/elements/styled-components';
import styled from 'styled-components';
import { useTheme } from '@emotion/react';
import Policy from 'src/pages/shop/auth/policy';
import { toast } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import { useLocales } from 'src/locales';
import SecurityQuestionFields from 'src/components/elements/shop/SecurityQuestionFields';
import { validateSecurityQuestion, securityQuestionPayload } from 'src/data/security-questions';
import { isShopgoMerchant } from 'src/utils/is-shopgo';

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:760px;
width:90%;
margin: 2.5rem auto 5rem auto;
`
const PolicyBox = styled.div`
height: 11rem;
overflow-y: auto;
border: 1px solid ${themeObj.grey[300]};
border-radius: 8px;
padding: 1rem;
font-size: ${themeObj.font_size.size7};
`

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
          !user.user_pw ||
          !user.user_pw_check ||
          !user.nickname ||
          !user.phone_num ||
          !user.phoneCheck
        ) {
          toast.error(translate("필수 항목을 입력해 주세요."));
          return;
        } else if (
          user.user_pw != user.user_pw_check
        ) {
          toast.error("비밀번호 확인란을 똑같이 입력했는지 확인해주세요");
          return;
        } else if (
          !phoneChecked
        ) {
          toast.error("인증번호가 확인되지 않았습니다.");
          return;
        }
      } else if (
        !user.user_name ||
        !user.user_pw ||
        !user.user_pw_check ||
        !user.nickname ||
        !user.phone_num
      ) {
        toast.error(translate("필수 항목을 입력해 주세요."));
        return;
      } else if (
        user.user_pw != user.user_pw_check
      ) {
        toast.error("비밀번호 확인란을 똑같이 입력했는지 확인해주세요");
        return;
      }
      // SHOPGO 산하 가맹점 전용 : 아이디 찾기(이름+휴대폰번호)에 쓰이므로 이름 필수. 다른 브랜드의 기존 검증 규칙은 그대로.
      if (isShopgoMerchant(themeDnsData) && !user.name) {
        toast.error(translate("이름을 입력해 주세요."));
        return;
      }
      // SHOPGO 산하 가맹점 전용 : 비밀번호 재설정용 보안질문 필수 (그 외 브랜드는 '' 반환 → 무조건 통과)
      const secqErr = validateSecurityQuestion(user, themeDnsData);
      if (secqErr) {
        toast.error(secqErr);
        return;
      }
      let result = await apiManager('auth/sign-up', 'create', { ...user, ...securityQuestionPayload(themeDnsData, user), brand_id: themeDnsData?.id });
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
      alert('인증 완료되었습니다')
      setPhoneChecked(true)
    } else {
      alert('새로고침하고 다시 시도해주세요.')
    }
  }

  return (
    <Wrapper>
      <ContentWrapper>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
          {translate('회원가입')}
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Stepper
          alternativeLabel
          activeStep={activeStep}
          sx={{ mb: 4 }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep == 0 &&
          <Stack spacing={2}>
            <FormControlLabel
              label={<Typography sx={{ fontWeight: 700, fontSize: themeObj.font_size.size5 }}>{translate('이용약관 및 개인정보수집 및 이용, 쇼핑정보 수신(선택)에 모두 동의합니다.')}</Typography>}
              control={<Checkbox checked={checkboxObj.check_0} />}
              onChange={(e) => {
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
              }}
            />
            <Divider />
            <FormControlLabel
              label={<Typography sx={{ fontSize: themeObj.font_size.size6 }}>{translate('이용약관 동의 (필수)')}</Typography>}
              control={<Checkbox checked={checkboxObj.check_1} onChange={(e) => {
                setCheckboxObj({ ...checkboxObj, ['check_1']: e.target.checked })
              }} />}
            />
            <PolicyBox>
              <Policy type={0} />
            </PolicyBox>
            <FormControlLabel
              label={<Typography sx={{ fontSize: themeObj.font_size.size6 }}>{translate('개인정보 수집 및 이용 동의 (필수)')}</Typography>}
              control={<Checkbox checked={checkboxObj.check_2} onChange={(e) => {
                setCheckboxObj({ ...checkboxObj, ['check_2']: e.target.checked })
              }} />}
            />
            <PolicyBox>
              <Policy type={1} />
            </PolicyBox>
            <FormControlLabel
              label={<Typography sx={{ fontSize: themeObj.font_size.size6 }}>{translate('쇼핑정보 수신 동의 (선택)')}</Typography>}
              control={<Checkbox checked={checkboxObj.check_3} onChange={(e) => {
                setCheckboxObj({ ...checkboxObj, ['check_3']: e.target.checked, ['check_4']: e.target.checked, ['check_5']: e.target.checked, })
              }} />}
            />
            <Divider />
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <FormControlLabel
                label={<Typography sx={{ fontSize: themeObj.font_size.size7 }}>{translate('SMS 수신 동의 (선택)')}</Typography>}
                control={<Checkbox checked={checkboxObj.check_4} onChange={(e) => {
                  setCheckboxObj({ ...checkboxObj, ['check_4']: e.target.checked })
                }} />}
              />
              <FormControlLabel
                label={<Typography sx={{ fontSize: themeObj.font_size.size7 }}>{translate('이메일 수신 동의 (선택)')}</Typography>}
                control={<Checkbox checked={checkboxObj.check_5} onChange={(e) => {
                  setCheckboxObj({ ...checkboxObj, ['check_5']: e.target.checked })
                }} />}
              />
            </Stack>
            <PolicyBox as="div" style={{ color: theme.palette.text.secondary }}>
              {translate('할인쿠폰 및 혜택, 이벤트, 신상품 소식 등 쇼핑몰에서 제공하는 유익한 쇼핑정보를 SMS나 이메일로 받아보실 수 있습니다. 단, 주문/거래 정보 및 주요 정책과 관련된 내용은 수신동의 여부와 관계없이 발송됩니다. 선택 약관에 동의하지 않으셔도 회원가입은 가능하며, 회원가입 후 회원정보수정 페이지에서 언제든지 수신여부를 변경하실 수 있습니다.')}
            </PolicyBox>
          </Stack>}

        {activeStep == 1 &&
          <Stack spacing={2.5}>
            <TextField
              label={translate('아이디')}
              fullWidth
              onChange={(e) => {
                setUser({ ...user, ['user_name']: e.target.value })
              }}
              value={user.user_name}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <TextField
              label={translate('비밀번호')}
              fullWidth
              onChange={(e) => {
                setUser({ ...user, ['user_pw']: e.target.value })
              }}
              type='password'
              value={user.user_pw}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <TextField
              label={translate('비밀번호확인')}
              fullWidth
              onChange={(e) => {
                setUser({ ...user, ['user_pw_check']: e.target.value })
              }}
              type='password'
              value={user.user_pw_check}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <TextField
              label={translate('이름')}
              fullWidth
              onChange={(e) => {
                setUser({ ...user, ['name']: e.target.value })
              }}
              value={user.name}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <TextField
              label={translate('닉네임')}
              fullWidth
              onChange={(e) => {
                setUser({ ...user, ['nickname']: e.target.value })
              }}
              value={user.nickname}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel>{translate('휴대폰번호')}</InputLabel>
              <OutlinedInput
                label={translate('휴대폰번호')}
                placeholder={translate("하이픈(-) 제외 입력")}
                onChange={(e) => {
                  setUser({ ...user, ['phone_num']: e.target.value })
                }}
                value={user.phone_num}
                endAdornment={
                  themeDnsData?.id == 77 ?
                    <Button style={{ minWidth: '128px', height: '48px', transform: 'translateX(12px)' }}
                      variant="contained"
                      color="inherit"
                      onClick={() => {
                        if (phoneCheckStep == 0) {
                          onClickSendPhoneVerifyCode();
                        }
                      }}
                    >인증번호발송</Button>
                    :
                    ''
                }
              />
            </FormControl>
            {
              themeDnsData?.id == 77 &&
              <FormControl variant="outlined" fullWidth>
                <InputLabel>인증번호</InputLabel>
                <OutlinedInput
                  label='인증번호'
                  placeholder="하이픈(-) 제외 입력"
                  onChange={(e) => {
                    setUser({ ...user, ['phoneCheck']: e.target.value })
                  }}
                  value={user.phoneCheck}
                  endAdornment={
                    <Button style={{ minWidth: '128px', height: '48px', transform: 'translateX(12px)' }}
                      variant="contained"
                      color="inherit"
                      onClick={() => {
                        if (phoneCheckStep == 1) {
                          onClickCheckPhoneVerifyCode();
                        }
                      }}
                    >인증번호확인</Button>
                  }
                />
              </FormControl>
            }
            <SecurityQuestionFields user={user} setUser={setUser} style={{ marginTop: '1rem', width: '100%' }} />
            {themeDnsData?.is_use_otp == 1 &&
              <TextField
                label={translate('OTP TOKEN')}
                fullWidth
                disabled={true}
                value={user.otp_token}
                autoComplete='new-password'
                onKeyPress={(e) => {
                  if (e.key == 'Enter') {
                  }
                }}
              />}
          </Stack>}

        {activeStep == 2 &&
          <Stack alignItems="center" sx={{ py: 8 }}>
            <Icon icon={'fluent-mdl2:completed'} style={{ fontSize: '5rem', color: theme.palette.primary.main }} />
            <Typography sx={{ mt: 2, fontSize: themeObj.font_size.size5 }}>
              {translate('회원가입이 완료되었습니다.')}
            </Typography>
          </Stack>}

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            sx={{ height: '52px' }}
            onClick={onClickPrevButton}
          >{translate('이전')}</Button>
          <Button
            variant="contained"
            color="inherit"
            fullWidth
            sx={{ height: '52px', fontWeight: 600 }}
            onClick={onClickNextButton}
          >{activeStep == 2 ? translate('완료') : translate('다음')}</Button>
        </Stack>
      </ContentWrapper>
    </Wrapper>
  )
}
export default SignUpDemo
