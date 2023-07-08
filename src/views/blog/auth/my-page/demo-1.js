import styled from 'styled-components'
import { Button, Divider, IconButton, Drawer } from '@mui/material';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useSettingsContext } from 'src/components/settings';
import Policy from 'src/pages/blog/auth/policy';

const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin: 56px auto 0 auto;
width: 90%;
@media (max-width:798px){
  width:100%;
}
`

const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
`

const SubTitle = styled.h3`
font-size:20px;
font-weight:normal;
line-height:1.38462;
padding:0.5rem 0 1rem 0;
`

const TitleContainer = styled.div`
display:flex;
flex-direction:column;
max-width:798px;
@media (max-width:798px){
    padding:5%;
}
`

const MenuContainer = styled.div`
display:flex;
flex-direction:column;
max-width:798px;
@media (max-width:798px){
    padding:5%;
}
`

const MenuBox = styled.div`
display:flex;
flex-direction:column;
margin-bottom:16px;
`

const MenuButton = styled.div`
display:flex;
background-color:#F6F6F6;
color:black;
font-weight:normal;
justify-content:space-between;
height:56px;
margin:2.5% 0;
&:hover{
    background-color:#F0F0F0;
}
`

const MenuText = styled.div`
margin:16px 0 16px 18px;
`

const PolicyBox = styled.div`
display:flex;
text-decoration:underline;
color:gray;
margin-top:16px;
`

const PolicyContainer = styled.div`
padding:4rem 2.5% 0 2.5%
`

//마이페이지 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeDnsData } = useSettingsContext();
    const [openPolicy, setOpenPolicy] = useState(false)
    const [policyType, setPolicyType] = useState("")

    return (
        <>
            <Wrappers>
                <TitleContainer>
                    <Title>마이페이지</Title>
                    <SubTitle>회원가입하고<br />셀러 별 포인트를 사용해보세요!</SubTitle>
                    <Button
                        variant='contained'
                        color='primary'
                        size='large'
                        sx={{
                            fontSize: 'large',
                            height: '56px'
                        }}
                        onClick={() => {
                            router.push('/blog/auth/login')
                        }}
                    >로그인/회원가입</Button>
                </TitleContainer>
                <Divider sx={{ margin: '5% 0', borderBottomWidth: '10px' }} />
                <MenuContainer style={{ color: `${themeDnsData?.theme_css?.main_color}`, fontWeight: 'bold' }}>
                    <MenuBox>
                        쇼핑
                        <MenuButton>
                            <MenuText>주문 / 배송조회</MenuText>
                            <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                <Icon icon='ep:arrow-right' color='black' onClick={() => {
                                    setOpenPolicy(true)
                                    setPolicyType(0)
                                }} />
                            </IconButton>
                        </MenuButton>
                    </MenuBox>
                    <MenuBox>
                        문의
                        <MenuButton>
                            <MenuText>나의 문의 내역</MenuText>
                            <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                <Icon icon='ep:arrow-right' color='black' onClick={() => {
                                    setOpenPolicy(true)
                                    setPolicyType(0)
                                }} />
                            </IconButton>
                        </MenuButton>
                    </MenuBox>
                    <MenuBox>
                        안내
                        <MenuButton>
                            <MenuText>자주 묻는 질문</MenuText>
                            <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                <Icon icon='ep:arrow-right' color='black' onClick={() => {
                                    setOpenPolicy(true)
                                    setPolicyType(0)
                                }} />
                            </IconButton>
                        </MenuButton>
                    </MenuBox>
                    <PolicyBox>
                        <div
                            style={{ marginRight: '5%' }}
                            onClick={() => {
                                setOpenPolicy(true)
                                setPolicyType(1)
                            }}
                        >개인정보 처리방침</div>
                        <div
                            style={{ marginRight: '5%' }}
                            onClick={() => {
                                setOpenPolicy(true)
                                setPolicyType(0)
                            }}
                        >이용약관</div>
                    </PolicyBox>
                </MenuContainer>
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
                        <Policy type={policyType} />
                    </PolicyContainer>
                </Drawer>
            </Wrappers>
        </>
    )
}
export default Demo1
