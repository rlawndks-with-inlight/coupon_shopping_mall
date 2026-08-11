import { Tab, Tabs, TextField, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import FindInfoQuestion from 'src/components/elements/shop/FindInfoQuestion';
import { useLocales } from 'src/locales';

//아이디 찾기 및 비밀번호 찾기 김인욱
const Wrappers = styled.div`
max-width:720px;
display:flex;
flex-direction:column;
margin: 56px auto;
width: 90%;
`

const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
`

const TabsContainer = styled.div`
width:100%;
display:flex;
flex-direction:column;
margin: 0 auto;
`

const TextFieldBox = styled.div`
display:flex;
width:100%;
margin-top: 1.5rem;
`

const returnFindType = {
    0: {
        title: "아이디 찾기",
        defaultObj: {

        }
    },
    1: {
        title: "비밀번호 찾기",
        defaultObj: {

        }
    }
}
const Demo2 = (props) => {
  const { translate } = useLocales();
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeDnsData } = useSettingsContext();

    // Tab 의 value 는 Object.keys 가 준 **문자열**('0'·'1')이라 숫자 0 과는 안 맞는다.
    // 그래서 쿼리가 들어오기 전에는 어느 탭도 선택돼 보이지 않았다.
    const [findType, setFindType] = useState('0');
    const [phoneNum, setPhoneNum] = useState("");
    const [username, setUsername] = useState("")
    const [userid, setUserid] = useState("")
    const [buttonText, setButtonText] = useState("인증받기")
    const [certificationNum, setCertificationNum] = useState("")
    const [findIdObj, setFindIdObj] = useState({
        name: '',
        nameCheck: '',
        phone_num: '',
        phoneCheck: ''
    })
    const [findPasswordObj, setFindPasswordObj] = useState({
        id: '',
        idCheck: '',
        phone_num: '',
        phoneCheck: ''
    })
    useEffect(() => {
        if (router.query?.type >= 0) {
            setFindType(String(router.query?.type ?? 0))
        }
    }, [router.query])

    return (
        <>
            <Wrappers>
                <Title>{translate('아이디/비밀번호 찾기')}</Title>
                <TabsContainer>
                    <div>
                        <Tabs
                            value={findType}
                            scrollButtons='false'
                            variant='fullWidth'
                            onChange={(event, newValue) => router.push(`/shop/auth/find-info?type=${newValue}`, '/shop/auth/find-info')}
                            sx={{ width: '100%' }}
                        >
                            {Object.keys(returnFindType).map((key) => (
                                <Tab key={returnFindType[key].title} value={key} label={translate(returnFindType[key].title)} style={{ width: '50%', margin: '0' }} />
                            ))}
                        </Tabs>
                    </div>
                    {isShopgoBrand(themeDnsData) ?
                        <div style={{ marginTop: '1.5rem' }}>
                            <FindInfoQuestion tab={findType} router={router} loginPath="/shop/auth/login" />
                        </div>
                        :
                        findType == 0 ?
                        <>
                            <TextField
                                name='userId'
                                autoComplete='new-password'
                                label={translate('이름')}
                                sx={{ marginTop: '1.5rem' }}
                                onChange={(e) => {
                                    setUserId(e.target.value)
                                }}
                            />
                            <TextFieldBox>
                                <TextField
                                    name='phoneNum'
                                    autoComplete='new-password'
                                    label={translate('연락처')}
                                    sx={{
                                        width: '72%',
                                        marginRight: '1%',
                                    }}
                                    onChange={(e) => {
                                        setPhoneNum(e.target.value)
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
                                label={translate('인증번호 입력')}
                                sx={{
                                    marginTop: '1%'
                                }}
                            />
                            <Button
                                variant='contained'
                                color='primary'
                                style={{
                                    height: '56px',
                                    margin: '3rem 0',
                                    fontSize: 'large'
                                }}
                            >{translate('인증완료')}</Button>
                        </>
                        :
                        <>
                            <TextField
                                name='userName'
                                autoComplete='new-password'
                                label={translate('아이디')}
                                sx={{ marginTop: '1.5rem' }}
                                onChange={(e) => {
                                    setUserName(e.target.value)
                                }}
                            />
                            <TextFieldBox>
                                <TextField
                                    name='phoneNum'
                                    autoComplete='new-password'
                                    label={translate('연락처')}
                                    sx={{
                                        width: '72%',
                                        marginRight: '1%'
                                    }}
                                    onChange={(e) => {
                                        setPhoneNum(e.target.value)
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
                                placeholder={translate('인증번호 입력')}
                                sx={{
                                    marginTop: '1%'
                                }}
                            />
                            <Button
                                variant='contained'
                                color='primary'
                                style={{
                                    height: '56px',
                                    margin: '3rem 0',
                                    fontSize: 'large'
                                }}
                            >{translate('인증완료')}</Button>
                        </>}
                </TabsContainer>
            </Wrappers>
        </>
    )
}

export default Demo2
