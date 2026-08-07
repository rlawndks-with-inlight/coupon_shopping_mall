import styled from "styled-components"
import { IconButton } from "@mui/material"
import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { useSettingsContext } from "src/components/settings"
import { useRouter } from "next/router"
import DialogSearch from "src/components/dialog/DialogSearch"
import { logoSrc } from "src/data/data"
import { isMyPagePath, isPath } from "src/utils/blog-shop-route"
// 헤더 로그아웃 아이콘용
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"

const Wrappers = styled.header`
width: 100%;
position: fixed;
top: 0;
display: flex;
flex-direction: column;
z-index: 10;
transition: background 0.3s ease;
`
const TopMenuContainer = styled.div`
display:flex;
padding: 10px 0;
max-width: 840px;
width:90%;
margin: 0 auto;
align-items:center;
`

const Header = (props) => {
  const { activeStep, setActiveStep, is_use_step } = props;
  const router = useRouter();
  const { themeMode, themeDnsData } = useSettingsContext();
  const { user, logout } = useAuthContext();
  const [isDetailPage, setIsDetailPage] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const path = router.asPath.split('/')[2];
    // /blog/product/:id → /shop/item/:id 로 통일됐다. 'product' 만 보면 상품 상세에서
    // 헤더가 상세 모드로 안 바뀌어 대표 이미지를 덮고 뒤로가기 화살표가 사라진다.
    setIsDetailPage(path == 'item' || path == 'seller');
  }, [router.asPath])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = isDetailPage && scrollY < 350;
  const isDark = themeMode == 'dark';
  const iconColor = isDark || isTransparent ? '#fff' : '#111';
  // 마이페이지 하위가 평탄해져 'my-page' 조각 판정이 전부 거짓이 됐다(뒤로가기 화살표 소실).
  const showBackArrow = isDetailPage || isMyPagePath(router) || isPath(router, '/shop/auth/cart');

  // 로그아웃 진입점이 없어 로그인 후 계정을 바꿀 수 없었다. 마이페이지 화면과 동일한 처리.
  const onLogout = async () => {
    await logout();
    window.location.reload();
  }

  return (
    <>
      <DialogSearch
        open={searchOpen}
        handleClose={() => setSearchOpen(false)}
        root_path={'/shop/search?keyword='}
      />
      <Wrappers style={{
        background: isTransparent ? 'transparent' : (isDark ? '#000' : '#fff'),
        borderBottom: isTransparent ? 'none' : `1px solid ${isDark ? '#333' : '#eee'}`,
      }}>
        <TopMenuContainer>
          {showBackArrow || is_use_step ?
            <IconButton
              sx={{ padding: '6px', marginLeft: '-6px' }}
              onClick={() => {
                if (is_use_step && activeStep > 0) {
                  setActiveStep(activeStep - 1);
                  return;
                }
                router.back()
              }}
            >
              <Icon icon={'ic:round-arrow-back'} fontSize={'1.4rem'} color={iconColor} />
            </IconButton>
            :
            <img src={logoSrc()} style={{ height: '28px', width: 'auto', cursor: 'pointer' }} onClick={() => router.push('/shop')} />
          }
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <IconButton sx={{ padding: '6px' }} onClick={() => setSearchOpen(true)}>
              <Icon icon={'tabler:search'} fontSize={'1.3rem'} color={iconColor} />
            </IconButton>
            <IconButton sx={{ padding: '6px' }} onClick={() => router.push('/shop/auth/my-page')}>
              <Icon icon={'basil:user-outline'} fontSize={'1.4rem'} color={iconColor} />
            </IconButton>
            {/* 로그인 상태에서만 노출되는 로그아웃 버튼 */}
            {user &&
              <IconButton sx={{ padding: '6px' }} onClick={onLogout}>
                <Icon icon={'ri:logout-circle-r-line'} fontSize={'1.4rem'} color={iconColor} />
              </IconButton>}
            <IconButton sx={{ padding: '6px' }} onClick={() => router.push('/shop/auth/cart')}>
              <Icon icon={'basil:shopping-bag-outline'} fontSize={'1.4rem'} color={iconColor} />
            </IconButton>
          </div>
        </TopMenuContainer>
      </Wrappers>
    </>
  )
}
export default Header
