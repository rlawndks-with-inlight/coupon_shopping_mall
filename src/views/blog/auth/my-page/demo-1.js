import styled from 'styled-components'
import { Button, Divider, IconButton, Dialog, DialogContent, DialogActions, DialogTitle } from '@mui/material';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useSettingsContext } from 'src/components/settings';
import DialogPolicy from 'src/components/dialog/DialogPolicy';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useEffect } from 'react';
import { Title } from 'src/components/elements/blog/demo-1';
import { logoSrc } from 'src/data/data';
// 로그아웃 링크용. demo-2 와 동일하게 Row 를 쓴다.
import { Row } from 'src/components/elements/styled-components';
import { formatLang } from 'src/utils/format';
import { useLocales } from 'src/locales';

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

const DialogBox = styled.div`
display:flex;
flex-direction:column;
margin: 0 auto;
width:100%;
`

//마이페이지 김인욱
const Demo1 = (props) => {
  const { translate } = useLocales();
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeDnsData, themeMode, themePostCategoryList } = useSettingsContext();
    const { user, logout } = useAuthContext();
    const [openPolicy, setOpenPolicy] = useState(false)
    const [policyType, setPolicyType] = useState("")
    const [activeStep, setActiveStep] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogType, setDialogType] = useState("");

    // 로그인 후 로그아웃할 방법이 UI 에 전혀 없었다. demo-2 의 구현을 그대로 가져왔다.
    const onLogout = async () => {
        let result = await logout();
        //router.reload();
        window.location.reload();
    }

    return (
        <>
            <Wrappers>

                <TitleContainer>
                    <Title>{translate('마이페이지')}</Title>
                    {user ?
                        <>
                            <MenuButton themeMode={themeMode} onClick={() => { router.
                                
                                
                                push('/shop/auth/change-info') }}>
                                <MenuText>{user.nickname}</MenuText>
                                <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                    <Icon icon='ep:arrow-right' color='black' />
                                </IconButton>
                            </MenuButton>
                        </>
                        :
                        <>
                            <SubTitle>{translate('회원가입하고')}<br />{translate('주문내역을 간편하게 확인해보세요!')}</SubTitle>
                            <Button
                                variant='contained'
                                color='primary'
                                size='large'
                                sx={{
                                    fontSize: 'large',
                                    height: '56px'
                                }}
                                onClick={() => {
                                    router.push('/shop/auth/login')
                                }}
                            >{translate('로그인/회원가입')}</Button>
                        </>
                    }
                </TitleContainer>
                <Divider sx={{ margin: '5% 0', borderBottomWidth: '10px' }} />
                <MenuContainer style={{ color: `${themeDnsData?.theme_css?.main_color}`, fontWeight: 'bold' }}>
                    <MenuBox>
                        {translate('쇼핑')}
                        {(user && (themeDnsData?.seller_point > 0 || themeDnsData?.point_rate > 0)) ?
                            <>
                                <MenuButton themeMode={themeMode} style={{ marginBottom: '0' }} onClick={() => { router.push('/shop/auth/point') }}>
                                    <MenuText>{translate('포인트 조회')}</MenuText>
                                    <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                        <Icon icon='ep:arrow-right' color='black' />
                                    </IconButton>
                                </MenuButton>
                            </>
                            : ""}
                        <MenuButton themeMode={themeMode} onClick={() => {
                            if (user) {
                                router.push('/shop/auth/history')
                            } else {
                                setDialogOpen(true)
                                setDialogType(0)
                            }
                        }}>
                            <MenuText>{translate('주문 / 배송 조회')}</MenuText>
                            <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                <Icon icon='ep:arrow-right' color='black' />
                            </IconButton>
                        </MenuButton>
                        {user ?
                            <>
                                <MenuButton themeMode={themeMode} style={{ marginTop: '0' }} onClick={() => { router.push('/shop/auth/delivery-address') }}>
                                    <MenuText>{translate('배송지 관리')}</MenuText>
                                    <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                        <Icon icon='ep:arrow-right' color='black' />
                                    </IconButton>
                                </MenuButton>
                            </>
                            : ""}
                    </MenuBox>
                    {/* 기존에는 하드코딩 라벨 '문의'(나의 문의 내역)와 '안내'(DB 게시판 목록)가 따로 렌더돼
                        자동 시드된 1:1문의 게시판이 '안내' 밑에 들어갔다. 두 그룹을 '고객센터' 하나로 합쳤다.
                        themePostCategoryList 는 localStorage 캐시라 배포 직후 비어 있을 수 있어,
                        비었으면 빈 껍데기가 보이지 않도록 그룹 자체를 렌더하지 않는다. */}
                    {themePostCategoryList?.length > 0 &&
                        <MenuBox>
                            {translate('고객센터')}
                            {/* 읽기 전용 게시판(공지사항 등): 비회원 포함 누구나 */}
                            {themePostCategoryList
                                .filter(item => item?.is_able_user_add != 1)
                                .map(item => (
                                    <MenuButton key={item?.id} themeMode={themeMode} style={{ marginBottom: '0' }}
                                        onClick={() => { router.push(`/shop/service/${item?.id}`) }}>
                                        <MenuText>{formatLang(item, 'post_category_title')}</MenuText>
                                        <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                            <Icon icon='ep:arrow-right' color='black' />
                                        </IconButton>
                                    </MenuButton>
                                ))}
                            {/* 회원 글쓰기 게시판(1:1문의): 로그인 필요 */}
                            {themePostCategoryList
                                .filter(item => item?.is_able_user_add == 1)
                                .map(item => (
                                    <MenuButton key={item?.id} themeMode={themeMode} style={{ marginBottom: '0' }}
                                        onClick={() => {
                                            // 곧장 글쓰기(/add)로 보내고 있어서 회원이 자기 문의·답변을 볼 입구가 마이페이지에 없었다.
                                            // 아래 주석은 '게시판으로 들어가면 자기 글 목록이 보인다'는 전제였는데 정작 링크가 /add 였다.
                                            // 게시판 목록(/shop/service/{id})으로 보낸다 — 목록에 답변완료/답변대기 뱃지와
                                            // '서비스 문의'(글쓰기) 버튼이 이미 있어서 작성 경로도 그대로 살아 있다.
                                            if (user) { router.push(`/shop/service/${item?.id}`) }
                                            else { setDialogOpen(true); setDialogType(1) }
                                        }}>
                                        <MenuText>{formatLang(item, 'post_category_title')}</MenuText>
                                        <IconButton style={{ width: '24px', height: '56px', padding: '0', marginRight: '18px' }}>
                                            <Icon icon='ep:arrow-right' color='black' />
                                        </IconButton>
                                    </MenuButton>
                                ))}
                            {/* '나의 문의 내역' 은 뺐다. 1:1문의 게시판으로 들어가면 자기 글 목록이
                                그대로 보여서 같은 기능이 두 줄로 보였다. */}
                        </MenuBox>}
                    <PolicyBox>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
                            onClick={() => {
                                setOpenPolicy(true)
                                setPolicyType(1)
                            }}
                        >{translate('개인정보 처리방침')}</div>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
                            onClick={() => {
                                setOpenPolicy(true)
                                setPolicyType(0)
                            }}
                        >{translate('이용약관')}</div>
                    </PolicyBox>
                    {/* 로그아웃 진입점이 없어 로그인 후 계정을 바꿀 수 없었다. demo-2 와 동일한 형태로 추가. */}
                    {
                        user &&
                        <>
                            <Row style={{ marginTop: '2rem', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { onLogout() }}>{translate('로그아웃')}</Row>
                        </>
                    }
                </MenuContainer>
                {/* 바텀시트(Drawer) → Dialog scroll="paper" 로 교체.
                    기존에는 Paper 전체가 스크롤돼 제목/닫기(X)가 본문과 함께 사라졌고,
                    로고 미등록 가맹점은 헤더가 통째로 빈 줄이 됐다. 이제 약관 제목이 상단에 고정된다. */}
                <DialogPolicy
                    open={openPolicy}
                    type={policyType}
                    onClose={() => {
                        setOpenPolicy(false)
                    }}
                />
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
                        <>{translate('로그인하고 상품 상태별로')}<br />{translate('알림을 받아보시는 건 어떨까요?')}</>
                        :
                        // 비회원은 1:1문의를 쓸 수 없으므로, 대신 공지사항은 열려 있다는 걸 알려준다.
                        <>{translate('1:1문의는 로그인 후 이용하실 수 있습니다.')}<br />{translate('공지사항은 로그인 없이 확인하실 수 있어요.')}</>
                    }
                </DialogContent>
                <DialogActions>
                    <DialogBox>
                        <Button
                            variant='contained'
                            size='large'
                            sx={{ marginBottom: '2%' }}
                            onClick={() => { router.push('/shop/auth/login') }}>{translate('로그인하기')}</Button>
                        {/* '비회원으로 문의할게요' 는 눌러도 항상 비어 있는 문의 목록으로 보내
                            "비회원 1:1문의 불가" 정책과 충돌해 없앴다.
                            주문/배송조회(dialogType 0)는 비회원 조회 경로라 그대로 둔다. */}
                        {dialogType == 0 && (
                            <Button
                                variant='outlined'
                                size='large'
                                onClick={() => { router.push('/shop/auth/order-check') }}>{translate('비회원으로 주문/배송조회 할게요')}</Button>
                        )}
                    </DialogBox>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default Demo1
