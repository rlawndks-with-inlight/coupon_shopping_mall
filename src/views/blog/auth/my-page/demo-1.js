import styled from 'styled-components'
import { Button, Divider, IconButton, Drawer, Dialog, DialogContent, DialogActions, DialogTitle } from '@mui/material';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useSettingsContext } from 'src/components/settings';
import Policy from 'src/pages/blog/auth/policy';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useEffect } from 'react';
import { Title } from 'src/components/elements/blog/demo-1';
import { logoSrc } from 'src/data/data';

const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin: 56px auto;
width: 90%;
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
`

const MenuContainer = styled.div`
display:flex;
flex-direction:column;
max-width:798px;
`

const MenuBox = styled.div`
display:flex;
flex-direction:column;
margin-bottom:16px;
`

const MenuButton = styled.div`
display:flex;
background-color:${props => props.themeMode == 'dark' ? '#222222' : '#F6F6F6'};
color:${props => props.themeMode == 'dark' ? '#fff' : '#000'};
font-weight:normal;
justify-content:space-between;
height:56px;
margin:2.5% 0;
cursor:pointer;
&:hover{
    background-color:${props => props.themeMode == 'dark' ? '#444444' : '#F0F0F0'};
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
padding:0 2.5%;
`

const DialogBox = styled.div`
display:flex;
flex-direction:column;
margin: 0 auto;
width:100%;
`

const DrawerTitle = styled.div`
display:flex;
margin-left:auto;
width:95%;
padding-left:2.5%;
justify-content:space-between;
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

    const { themeDnsData, themeMode, themePostCategoryList } = useSettingsContext();
    const { user } = useAuthContext();
    const [openPolicy, setOpenPolicy] = useState(false)
    const [policyType, setPolicyType] = useState("")
    const [activeStep, setActiveStep] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogType, setDialogType] = useState("");

    useEffect(() => {
        console.log(themePostCategoryList)
    }, [])

    return (
        <>
            <Wrappers>

                <TitleContainer>
                    <Title>마이페이지</Title>
                    {user ?
                        <>
                            <MenuButton themeMode={themeMode} onClick={() => { router.push('/blog/auth/my-page/user-info') }}>
                                <MenuText>{user.nick_name}</MenuText>
                                <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                    <Icon icon='ep:arrow-right' color='black' />
                                </IconButton>
                            </MenuButton>
                        </>
                        :
                        <>
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
                        </>
                    }
                </TitleContainer>
                <Divider sx={{ margin: '5% 0', borderBottomWidth: '10px' }} />
                <MenuContainer style={{ color: `${themeDnsData?.theme_css?.main_color}`, fontWeight: 'bold' }}>
                    <MenuBox>
                        쇼핑
                        {user ?
                            <>
                                <MenuButton themeMode={themeMode} style={{ marginBottom: '0' }} onClick={() => { router.push('/blog/auth/my-page/point') }}>
                                    <MenuText>포인트 조회</MenuText>
                                    <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                        <Icon icon='ep:arrow-right' color='black' />
                                    </IconButton>
                                </MenuButton>
                            </>
                            : ""}
                        <MenuButton themeMode={themeMode} onClick={() => {
                            if (user) {
                                router.push('/blog/auth/my-page/order')
                            } else {
                                setDialogOpen(true)
                                setDialogType(0)
                            }
                        }}>
                            <MenuText>주문 / 배송 조회</MenuText>
                            <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                <Icon icon='ep:arrow-right' color='black' />
                            </IconButton>
                        </MenuButton>
                        {user ?
                            <>
                                <MenuButton themeMode={themeMode} style={{ marginTop: '0' }} onClick={() => { router.push('/blog/auth/my-page/address') }}>
                                    <MenuText>배송지 관리</MenuText>
                                    <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                        <Icon icon='ep:arrow-right' color='black' />
                                    </IconButton>
                                </MenuButton>
                            </>
                            : ""}
                    </MenuBox>
                    <MenuBox>
                        문의
                        <MenuButton themeMode={themeMode} onClick={() => {
                            if (user) {
                                router.push('/blog/auth/my-page/inquiry')
                            } else {
                                setDialogOpen(true)
                                setDialogType(1)
                            }
                        }}>
                            <MenuText>나의 문의 내역</MenuText>
                            <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                <Icon icon='ep:arrow-right' color='black' />
                            </IconButton>
                        </MenuButton>
                    </MenuBox>
                    <MenuBox>
                        안내
                        {themePostCategoryList.map(item => (
                            <>
                                <MenuButton themeMode={themeMode} onClick={() => { router.push(`/blog/service/${item?.id}`) }}>
                                    <MenuText>{item.post_category_title}</MenuText>
                                    <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                        <Icon icon='ep:arrow-right' color='black' />
                                    </IconButton>
                                </MenuButton>
                            </>
                        ))}
                    </MenuBox>
                    <PolicyBox>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
                            onClick={() => {
                                setOpenPolicy(true)
                                setPolicyType(1)
                            }}
                        >개인정보 처리방침</div>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
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
                    <DrawerTitle>
                        <img src={logoSrc()} style={{ height: '56px', width: 'auto' }} />
                        <IconButton
                            sx={{}}
                            onClick={() => {
                                setOpenPolicy(false)
                            }}
                        >
                            <Icon icon={'ic:round-close'} fontSize={'2.5rem'} />
                        </IconButton>
                    </DrawerTitle>
                    <PolicyContainer>
                        <Policy type={policyType} />
                    </PolicyContainer>
                </Drawer>
            </Wrappers>
            <Dialog
                open={dialogOpen}
                onClose={() => { setDialogOpen(false) }}
                fullWidth
                PaperProps={{
                    sx: {
                        maxWidth: '540px',
                        width: '90vw'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0 0 1.5rem 1.5rem'
                    }}
                >
                    <img src={logoSrc()} style={{ height: '56px', width: 'auto' }} />
                    <IconButton
                        onClick={() => {
                            setDialogOpen(false)
                        }}
                    >
                        <Icon icon={'ic:round-close'} fontSize={'2.5rem'} />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    style={{ textAlign: 'center', marginBottom: '4%' }}>
                    {dialogType == 0 ?
                        <>로그인하고 상품 상태별로<br />알림을 받아보시는 건 어떨까요?</>
                        :
                        <>회원가입 후 로그인하면<br />1:1 문의를 더 간편하게 할 수 있어요</>
                    }
                </DialogContent>
                <DialogActions>
                    <DialogBox>
                        <Button
                            variant='contained'
                            size='large'
                            sx={{ marginBottom: '2%' }}
                            onClick={() => { router.push('/blog/auth/login') }}>로그인하기</Button>
                        <Button
                            variant='outlined'
                            size='large'
                            onClick={() => { dialogType == 0 ? router.push('/blog/auth/my-page/order') : router.push('/blog/auth/my-page/inquiry') }}>
                            {dialogType == 0 ?
                                <>비회원으로 주문/배송조회 할게요</>
                                :
                                <>비회원으로 문의할게요</>
                            }</Button>
                    </DialogBox>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default Demo1
