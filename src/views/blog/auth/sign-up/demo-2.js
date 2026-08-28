import PropTypes from 'prop-types';
import { Checkbox, FormControlLabel, TextField, Typography, IconButton, Button, Select, MenuItem, InputLabel, InputAdornment } from '@mui/material';
import { useState } from 'react';
import { Row, themeObj } from 'src/components/elements/styled-components';
import styled from 'styled-components'
import Iconify from 'src/components/iconify/Iconify';
import { useTheme } from '@emotion/react';
import DialogPolicy from 'src/components/dialog/DialogPolicy';
import { Icon } from '@iconify/react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiManager } from 'src/utils/api';
import { useSettingsContext } from 'src/components/settings';
import SecurityQuestionFields from 'src/components/elements/shop/SecurityQuestionFields';
import { validateSecurityQuestion, securityQuestionPayload } from 'src/data/security-questions';
import { sanitizePhoneInput, withSignUpName, validateSignUpInput } from 'src/utils/function';
import { useLocales } from 'src/locales';

const Wrappers = styled.div`
max-width:720px;
display:flex;
flex-direction:column;
margin:56px auto;
width:90%;
`

const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
word-spacing: 0.2rem;
@media (max-width:720px){
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

`

const TextFieldBox = styled.div`
display:flex;
width:100%;
margin: 0 auto;
`

const SelectContainer = styled.div`
display:flex;
width:100%;
margin:0 auto;
justify-content:space-between;
column-gap:0.5rem;
`

const SelectBox = styled.div`
display:flex;
flex-direction:column;
flex-grow:1;
`

// 약관 type ↔ 동의 체크박스 대응표.
// 화살표(>) 를 눌러 약관을 끝까지 읽고 '동의하고 닫기' 를 누르면 여기 대응하는 체크박스가 켜진다.
// 0=서비스 이용약관(check_2), 1=개인정보 수집 이용 동의(check_3)
const POLICY_CHECK_KEY = { 0: 'check_2', 1: 'check_3' };

// 회원가입 김인욱
const Demo2 = (props) => {
  const { translate } = useLocales();
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeDnsData } = useSettingsContext()

    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [checkboxObj, setCheckboxObj] = useState({
        check_0: false,
        check_2: false,
        check_3: false,
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
    const [openPolicy, setOpenPolicy] = useState(false)
    const [policyType, setPolicyType] = useState("")
    const [buttonText, setButtonText] = useState("인증받기")
    const [watchable_1, setWatchable_1] = useState(false)
    const [watchable_2, setWatchable_2] = useState(false)
    const [birthDate, setBirthDate] = useState({
        year: "",
        month: "",
        day: ""
    })

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

    const onClickNextButton = async () => {
        /*if (activeStep == 0) {
            if (
                !checkboxObj.check_2
            ) {
                toast.error("필수 항목에 체크해 주세요.");
                return;
            }
        }*/
        if (activeStep == 1) {
            if (
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
            // 아이디·비밀번호·휴대폰 형식 검증. 예전엔 빈값만 봐서 한 글자 아이디·비밀번호가
            // 그대로 가입됐다(서버에도 검사가 없었다 — 백엔드 signUp 에도 같은 규칙을 넣었다).
            const formErr = validateSignUpInput(user);
            if (formErr) {
              toast.error(formErr);
              return;
            }

            // 보안질문 — shopgo 가 아니면 '' 를 반환해 무조건 통과한다.
            const secqErr = validateSecurityQuestion(user, themeDnsData);
            if (secqErr) {
                toast.error(secqErr);
                return;
            }
            let result = await apiManager('auth/sign-up', 'create', {
                ...withSignUpName(user),
                ...securityQuestionPayload(themeDnsData, user),
                brand_id: themeDnsData?.id,
            });
            if (!result) {
                return;
            }
        }
        setActiveStep(activeStep + 1);
        window.scrollTo(0, 0)
    }

    return (
        <>
            {/* 헤더를 여기서 직접 그리지 않는다.
                이 뷰는 블로그형 8개 프레임이 공유하는데, blog demo-2 의 헤더를 본문에 박아 넣고 있었다.
                그래서 레이아웃이 헤더를 그리는 blog demo 4~9 에서는 헤더가 두 개 겹쳐 보였고,
                blog demo 1·2 는 그걸 피하려고 레이아웃(헤더+푸터)을 통째로 꺼서
                가입 화면에서 나갈 링크가 하나도 없는 막다른 길이 됐다.
                레이아웃 헤더 하나만 쓰도록 통일한다(아래 BlogLayout1·2 의 예외도 함께 제거). */}
            <Wrappers>
                {activeStep == 0 &&
                    <>
                        <TextFieldContainer>
                            <Title>{translate('회원가입')}<br />{translate('서비스 이용약관 동의')}</Title>
                            <div style={{ marginTop: '2rem' }} />
                            <CheckBoxes>
                                {/* 선택 항목(마케팅 수신)을 감췄으므로 '선택 항목 포함' 문구도 뺀다 */}
                                <FormControlLabel label={<Typography>{translate('전체 동의')}</Typography>} control={<Checkbox checked={checkboxObj.check_0} />} onChange={(e) => {
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
                                    <DetailedCheckbox>
                                        <FormControlLabel label={<Typography>{translate('서비스 이용약관')}<span style={{ color: 'red' }}>{translate('(필수)')}</span></Typography>} control={<Checkbox checked={checkboxObj.check_2} onChange={(e) => {
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
                                        <FormControlLabel label={<Typography>{translate('개인정보 수집 이용 동의')}<span style={{ color: 'red' }}>{translate('(필수)')}</span></Typography>} control={<Checkbox checked={checkboxObj.check_3} onChange={(e) => {
                                            setCheckboxObj({ ...checkboxObj, ['check_3']: e.target.checked })
                                        }} />} />
                                        <IconButton style={{ width: '24px', height: '40px', padding: '0' }} >
                                            <Icon icon='ep:arrow-right' color='black' onClick={() => {
                                                setOpenPolicy(true)
                                                setPolicyType(1)
                                            }} />
                                        </IconButton>
                                    </DetailedCheckbox>
                                    {/* 마케팅 정보 수신 동의 비노출.
                                        동의를 받아도 저장할 곳이 없다 — users 에 수신동의 컬럼이 없고
                                        signUp 도 그 값을 받지 않는다(체크가 그냥 버려진다).
                                        발송 수단도 없다: 이메일은 아예 수집하지 않고, 문자 게이트웨이도 쓰지 않기로 했다.
                                        나중에 실제로 보낼 수 있게 되면 컬럼 추가 + 저장 + 발송 연동까지 함께 붙일 것.
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
                                    */}
                                </ChildCheckboxes>
                            </CheckBoxes>
                            <Button
                                disabled={checkboxObj.check_2 && checkboxObj.check_3 ? false : true}
                                variant='contained'
                                color='primary'
                                size='large'
                                style={{
                                    margin: '3rem 0 0 0',
                                    fontSize: 'large',
                                    height: '56px'
                                }}
                                onClick={() => { setActiveStep(activeStep + 1); }}
                            >{translate('다음으로')}</Button>
                            {/* 바텀시트(Drawer) → Dialog scroll="paper" 로 교체.
                                기존에는 Paper 전체가 스크롤돼 로고와 닫기(X)가 같이 사라졌고,
                                약관을 끝까지 읽으면 닫을 방법이 없어 맨 위로 되돌아가야 했다.
                                ※ policyType 2(마케팅 수신 안내문) 분기는 제거했다 —
                                  마케팅 체크박스 자체가 비노출이라 2 를 세팅하는 곳이 없다(도달 불가 코드였다). */}
                            <DialogPolicy
                                open={openPolicy}
                                type={policyType}
                                onClose={() => {
                                    setOpenPolicy(false)
                                }}
                                onAgree={() => {
                                    // 읽고 나면 해당 약관 체크박스를 켜준다.
                                    // 개별 체크와 동일하게 동작하므로 '전체 동의'(check_0) 는 건드리지 않는다.
                                    const key = POLICY_CHECK_KEY[policyType];
                                    if (key) {
                                        setCheckboxObj((prev) => ({ ...prev, [key]: true }))
                                    }
                                }}
                            />
                        </TextFieldContainer>
                    </>
                }
                {/*activeStep == 1 &&
                    <>
                        <TextFieldContainer>
                            <Title>휴대폰 번호 인증</Title>
                            <TextFieldBox style={{ marginTop: '2.5rem' }}>
                                <TextField
                                    name='phoneNum'
                                    autoComplete='new-password'
                                    label='연락처'
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
                                        height: '56px'
                                    }}
                                    onClick={() => {
                                        setButtonText("재전송")
                                    }}
                                >{buttonText}</Button>
                            </TextFieldBox>
                            <TextField
                                name='certificationNum'
                                autoComplete='new-password'
                                label='인증번호 입력'
                                sx={{
                                    marginTop: '1%'
                                }}
                            />
                            <Button
                                variant='contained'
                                color='primary'
                                style={{
                                    height: '56px',
                                    marginTop: '3rem',
                                    fontSize: 'large'
                                }}
                                onClick={() => { setActiveStep(activeStep + 1) }}
                            >인증완료</Button>
                        </TextFieldContainer>
                    </>
                */}
                {activeStep == 1 &&
                    <>
                        <TextFieldContainer>
                            <Title>{translate('회원가입')}</Title>
                            <TextFieldTitle>{translate('아이디')}</TextFieldTitle>
                            <TextField
                                name='username'
                                placeholder={translate('아이디를 입력해주세요.')}
                                helperText={translate('영문 소문자·숫자·밑줄(_) / 4~20자')}
                                sx={{
                                    marginBottom: '1%'
                                }}
                                onChange={(e) => {
                                    setUser({ ...user, ['user_name']: e.target.value })
                                }}
                                value={user.user_name}
                            />
                            <TextFieldTitle>{translate('비밀번호')}</TextFieldTitle>
                            <TextField
                                name='password'
                                type={watchable_1 ? '' : 'password'}
                                placeholder={translate('비밀번호를 입력해주세요')}
                                helperText={translate('8~20자로 입력해 주세요. (아이디와 다르게)')}
                                sx={{
                                    marginBottom: '1%'
                                }}
                                onChange={(e) => {
                                    setUser({ ...user, ['user_pw']: e.target.value })
                                }}
                                value={user.user_pw}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <Icon icon='ri:eye-line' color='black' cursor='pointer' style={{ height: '20px', width: '20px' }} onClick={() => { setWatchable_1(true) }} onMouseLeave={() => { setWatchable_1(false) }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextFieldTitle>{translate('비밀번호 확인')}</TextFieldTitle>
                            <TextField
                                name='passwordCheck'
                                type={watchable_2 ? '' : 'password'}
                                placeholder={translate('비밀번호를 다시 입력해주세요')}
                                sx={{
                                    marginBottom: '1%'
                                }}
                                onChange={(e) => {
                                    setUser({ ...user, ['user_pw_check']: e.target.value })
                                }}
                                value={user.user_pw_check}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <Icon icon='ri:eye-line' color='black' cursor='pointer' style={{ height: '20px', width: '20px' }} onClick={() => { setWatchable_2(true) }} onMouseLeave={() => { setWatchable_2(false) }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                            {/* 이름 — 블로그형 가입폼에만 빠져 있었다.
                                shop 데모 9개는 모두 받고 있고, 안 받으면 마이페이지 '이름' 이 영영 빈칸이다. */}
                            <TextFieldTitle>{translate('이름')}</TextFieldTitle>
                            <TextField
                                placeholder={translate('이름을 입력해주세요.')}
                                helperText={translate('주문·배송에 사용됩니다')}
                                sx={{
                                    marginBottom: '1%'
                                }}
                                onChange={(e) => {
                                    setUser({ ...user, ['name']: e.target.value })
                                }}
                                value={user.name}
                            />
                            {/* 닉네임 입력 제거 — 이름 하나만 받기로 통일했다(전 프레임 공통).
                                저장 시 nickname 에는 이름을 그대로 넣는다(utils/function.js withSignUpName).
                            <TextFieldTitle>닉네임</TextFieldTitle>
                            <TextField
                                sx={{
                                    marginBottom: '1%'
                                }}
                                onChange={(e) => {
                                    setUser({ ...user, ['nickname']: e.target.value })
                                }}
                                value={user.nickname}
                            />
                            */}
                            <TextFieldTitle>{translate('휴대폰번호')}</TextFieldTitle>
                            <TextField
                                placeholder={translate('휴대폰번호를 입력해주세요.')}
                                helperText={translate('숫자와 하이픈(-)만 입력')}
                                sx={{
                                    marginBottom: '1%'
                                }}
                                onChange={(e) => {
                                    setUser({ ...user, ['phone_num']: sanitizePhoneInput(e.target.value) })
                                }}
                                value={user.phone_num}
                            />
                            {/* 보안질문 — SHOPGO 본사·산하 가맹점에서만 렌더된다(컴포넌트가 자체 게이팅).
                                백엔드 signUp 이 shopgo 브랜드면 security_question_id·answer 를 '필수' 로 검사하는데
                                블로그형 가입폼에만 이 입력이 없어서 프레임4~11 은 가입이 통째로 실패하고 있었다.
                                ("보안질문을 선택해 주세요.") 비밀번호 재설정의 유일한 수단이기도 하다. */}
                            <SecurityQuestionFields user={user} setUser={setUser} />
                            <Button
                                variant='contained'
                                color='primary'
                                style={{
                                    height: '56px',
                                    marginTop: '3rem',
                                    fontSize: 'large'
                                }}
                                onClick={onClickNextButton}
                            >{translate('완료')}</Button>
                        </TextFieldContainer>
                    </>
                }
                {activeStep == 2 &&
                    <>
                        <TextFieldContainer>
                            <Title>{translate('축하합니다!')}<br />{translate('회원가입이 완료되었습니다!')}<br /></Title>
                            <Button
                                variant='contained'
                                color='primary'
                                style={{
                                    height: '56px',
                                    marginTop: '3rem',
                                    fontSize: 'large'
                                }}
                                onClick={() => {
                                    router.push('/shop/auth/login')
                                }}
                            >{translate('로그인하러 가기')}</Button>
                        </TextFieldContainer>
                    </>
                }
            </Wrappers>
        </>
    )
}

export default Demo2
