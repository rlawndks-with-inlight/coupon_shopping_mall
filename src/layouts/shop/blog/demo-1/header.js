import styled from "styled-components"
import { 헤더배경 } from "src/utils/overlay-icon";
import { IconButton, Badge } from "@mui/material"
import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { useSettingsContext } from "src/components/settings"
import { useRouter } from "next/router"
import DialogSearch from "src/components/dialog/DialogSearch"
import { logoSrc } from "src/data/data"
import { isMyPagePath, isPath } from "src/utils/blog-shop-route"
// 헤더 로그아웃 아이콘용
import LanguagePopover from "src/layouts/manager/header/LanguagePopover"

const Wrappers = styled.header`
width: 100%;
position: fixed;
top: 0;
display: flex;
flex-direction: column;
z-index: 10;
transition: background 0.3s ease;
`
/* 로고를 '한 축'이 아니라 '상자'로 잡는다 — 이유는 shop/demo-1/header.js 의 LogoImg 주석 참고.
   이 프레임은 헤더가 position:fixed 인데 본문 상단 여백을 각 화면이 직접 하드코딩한다
   (홈 48px, 나머지 56px). 즉 헤더가 높아지면 그만큼 본문을 덮는다.
   그래서 헤더 높이를 정하는 IconButton(padding 6px + 아이콘 1.4rem ≈ 34.4px)을 넘지 않는
   34px 까지만 올린다 — 헤더 총높이가 1px 도 안 바뀌므로 어떤 화면의 오프셋도 건드릴 필요가 없다.
   더 키우려면 프레임4 전 화면의 상단 여백을 함께 손봐야 한다(그건 별도 작업). */
const LogoImg = styled.img`
height: calc(34px * var(--logo-scale, 1));
width: auto;
max-width: calc(180px * var(--logo-scale, 1));
object-fit: contain;
flex-shrink: 0;
cursor: pointer;
/* 좁은 화면은 변경 전(28px, 상한 없음 = 5:1 기준 140px)을 그대로 유지한다.
   34px 로 키우면 가로형 로고 폭이 140→170px 이 되어 359~391px 구간에서
   우측 아이콘 묶음이 컨테이너 밖으로 밀린다(is_use_lang 을 켠 가맹점은 더 빨리 밀린다). */
/* 높이를 못 박으면 로고가 자리를 다 못 쓴다.
   이 가맹점 로고는 8:1 가로형인데 상자가 91x18 이라 실제로 그려지는 건 91x11 이었다.
   높이 대신 상자로 가둬 어느 모양이든 알아서 상한에 닿게 한다. */
@media (max-width:480px) {
  height: auto;
  width: auto;
  max-height: calc(40px * var(--logo-scale, 1));
  max-width: calc(140px * var(--logo-scale, 1));
}
/* 361px 이상에서만 조금 더 넓힌다.
   320px 에서 180px 상한을 주면 우측 아이콘 묶음이 컨테이너 밖으로 11px 밀린다(실측).
   360·390px 에서는 밀림 0 이라 그 구간만 키운다 — 요즘 기기는 대부분 여기 있다.
   측정값(가로형 로고 기준): 91x11 → 117x14 */
@media (min-width:361px) and (max-width:480px) {
  max-width: calc(180px * var(--logo-scale, 1));
}
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
  // themeCartData: 장바구니 아이콘에 담긴 개수 배지를 붙이기 위해 함께 읽는다.
  const { themeMode, themeDnsData, themeCartData } = useSettingsContext();
  const [isDetailPage, setIsDetailPage] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const path = router.asPath.split('/')[2];
    // /blog/product/:id → /shop/item/:id 로 통일됐다. 'product' 만 보면 상품 상세에서
    // 헤더가 상세 모드로 안 바뀌어 대표 이미지를 덮고 뒤로가기 화살표가 사라진다.
    // 상품상세는 더 이상 '상세 모드'가 아니다 — 다른 화면과 같은 헤더(로고 + 불투명)를 쓴다.
    // 예전엔 로고 자리를 뒤로가기가 차지하고 헤더가 사진 위에 투명하게 얹혔다.
    // 셀러 페이지는 그대로 둔다(요청 범위가 상품상세다).
    setIsDetailPage(path == 'seller');
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

  return (
    <>
      <DialogSearch
        open={searchOpen}
        handleClose={() => setSearchOpen(false)}
        root_path={'/shop/search?keyword='}
      />
      <Wrappers style={{
        // 사진 위일 때는 어두운 그라데이션을 깐다 — 흰 아이콘이 흰 상품사진에 묻힌다.
        background: 헤더배경(isTransparent, isDark ? '#000' : '#fff'),
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
            <LogoImg src={logoSrc()} onClick={() => router.push('/shop')} />
          }
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px' }}>
            {/* 상품 목록 — 이 헤더에는 상품을 둘러볼 수단이 검색뿐이었다(홈·마이페이지·장바구니만 있었다).
                고객이 찾는 물건의 '이름을 이미 알고 있을 때'만 살 수 있었다는 뜻이다. */}
            <IconButton sx={{ padding: '6px' }} onClick={() => router.push('/shop/items')}>
              <Icon icon={'material-symbols:grid-view-outline'} fontSize={'1.3rem'} color={iconColor} />
            </IconButton>
            <IconButton sx={{ padding: '6px' }} onClick={() => setSearchOpen(true)}>
              <Icon icon={'tabler:search'} fontSize={'1.3rem'} color={iconColor} />
            </IconButton>
            <IconButton sx={{ padding: '6px' }} onClick={() => router.push('/shop/auth/my-page')}>
              <Icon icon={'basil:user-outline'} fontSize={'1.4rem'} color={iconColor} />
            </IconButton>
            {/* 로그아웃은 헤더가 아니라 푸터에 텍스트로 둔다.
                아이콘만으로는 무슨 버튼인지 알기 어렵고, 우측 아이콘이 늘수록 헤더가 빽빽해진다. */}
            <IconButton sx={{ padding: '6px' }} onClick={() => router.push('/shop/auth/cart')}>
              <Badge badgeContent={themeCartData?.length ?? 0} color="error">
                <Icon icon={'basil:shopping-bag-outline'} fontSize={'1.4rem'} color={iconColor} />
              </Badge>
            </IconButton>
            {/* 언어 선택 — 이 헤더엔 언어 UI 가 없어 설정을 켜도 고객이 언어를 바꿀 수 없었다.
                LanguagePopover 는 국기 이미지라 다크/투명 헤더에서도 색 보정이 필요 없다. */}
            {themeDnsData?.setting_obj?.is_use_lang == 1 && <LanguagePopover />}
          </div>
        </TopMenuContainer>
      </Wrappers>
    </>
  )
}
export default Header
