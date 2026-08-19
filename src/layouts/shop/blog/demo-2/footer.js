import { themeObj } from "src/components/elements/styled-components"
import { useSettingsContext } from "src/components/settings"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import styled from "styled-components"
import { useLocales } from "src/locales"
import { useState } from "react"
import { Icon } from "@iconify/react"
import DialogPolicy from 'src/components/dialog/DialogPolicy'
import { useRouter } from "next/router"
import { Badge } from "@mui/material"

const Wrappers = styled.footer`
margin-top: auto;
min-height:250px;
padding:24px 16px 40px;
max-width:720px;
margin:0 auto;
width:100%;
`
const ContentWrapper = styled.div`
display:flex;
flex-direction:column;
width:100%;
max-width:720px;
margin: 0 auto;
row-gap: 0.25rem;
`
const Row = styled.div`
display:flex;
`
const Bold = styled.div`
font-weight:bold;
margin-right:1rem;
font-size: 12px;
`
const MarginRight = styled.div`
margin-right:0.5rem;
`
const FixedFooter = styled.div`
height: 60px;
max-width: 720px;
width: 100%;
position: fixed;
bottom: 0;
background-color: white;
left: 50%;
transform: translate(-50%);
z-index: 10;
box-shadow: rgba(0, 0, 0, 0.14) 0px 8px 10px, rgba(0, 0, 0, 0.12) 0px 3px 14px, rgba(0, 0, 0, 0.2) 0px 5px 5px;
display: flex;
align-items: center;
justify-content: space-around;
`

const Footer = () => {
  // themeCartData: 하단 고정바 장바구니에 담긴 개수 배지를 붙이기 위해 함께 읽는다.
  const { themeMode, themeCartData } = useSettingsContext();
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();

  const [policyType, setPolicyType] = useState(0);
  const { user, logout } = useAuthContext();
  const onLogout = async () => {
    await logout();
    window.location.reload();
  };

  const router = useRouter();

  // 아래에서 각 값을 `xxx.length > 1` 로 검사하는데, 브랜드 정보는 DB 에서 NULL 로 내려온다.
  // 신규 개설 몰은 이 값들이 전부 비어 있어 null.length 로 푸터가 터지고,
  // 푸터는 레이아웃에 포함되므로 그 브랜드의 '모든 페이지'가 하얗게 됐다.
  //
  // ※ 구조분해 기본값(= '')은 undefined 에만 적용되고 null 에는 적용되지 않는다.
  //   DB NULL 은 JSON null 로 그대로 오므로 아래처럼 명시적으로 문자열화해야 한다.
  const s = (v) => (v == null ? '' : String(v));
  const d = themeDnsData ?? {};
  const company_name = s(d.company_name);
  const addr = s(d.addr);
  const business_num = s(d.business_num);
  const ceo_name = s(d.ceo_name);
  const phone_num = s(d.phone_num);
  const fax_num = s(d.fax_num);
  const mail_order_num = s(d.mail_order_num);
  const pvcy_rep_name = s(d.pvcy_rep_name);
  return (
    <>
      <Wrappers style={{
        background: `${themeMode == 'dark' ? '#222222' : '#F6F6F6'}`
      }}>
        <ContentWrapper>
          <Row>
            <Bold style={{ cursor: 'pointer' }} onClick={() => { setPolicyType(1) }}>{translate('이용약관')}</Bold>
            <Bold style={{ cursor: 'pointer' }} onClick={() => { setPolicyType(2) }}>{translate('개인정보정책')}</Bold>
            <Bold style={{ cursor: 'pointer' }} onClick={() => { setPolicyType(4) }}>{translate('쇼핑몰 이용안내')}</Bold>
            {/* 로그아웃은 하단정보에 두지 않는다 — 마이페이지에 있다. */}
          </Row>

          <Row style={{ fontSize: '10px' }}>
            {company_name.length > 1 &&
              <>
                <MarginRight>{company_name}</MarginRight>
                <MarginRight>|</MarginRight>
              </>
            }
            {ceo_name.length > 1 &&
              <>
                <MarginRight>{translate('대표')} {ceo_name}</MarginRight>
                <MarginRight>|</MarginRight>
              </>
            }
            {business_num.length > 1 &&
              <>
                <MarginRight>{translate('사업자번호')}</MarginRight>
                <MarginRight>{business_num}</MarginRight>
              </>
            }
          </Row>
          <Row style={{ fontSize: '10px' }}>
            {mail_order_num.length > 1 &&
              <>
                <MarginRight>{translate('통신판매업신고')} {mail_order_num}</MarginRight>
              </>
            }
          </Row>
          <Row style={{ fontSize: '10px' }}>
            {addr.length > 1 &&
              <>
                <MarginRight>{addr}</MarginRight>
              </>
            }
          </Row>
          <Row style={{ fontSize: '10px' }}>
            {phone_num.length > 1 &&
              <>
                <MarginRight>{translate('고객센터')} {phone_num}</MarginRight>
                <MarginRight>|</MarginRight>
              </>
            }
            {fax_num.length > 1 &&
              <>
                <MarginRight>{translate('팩스')} {fax_num}</MarginRight>
              </>
            }
          </Row>
          <Row style={{ fontSize: '10px' }}>
            {pvcy_rep_name.length > 1 &&
              <>
                <MarginRight>{translate('개인정보 보호책임자')} {pvcy_rep_name}</MarginRight>
              </>
            }
          </Row>

          {/* '본 사이트는 위탁판매자이며 ... 책임은 공급사에게 있습니다' 고지를 제거했다.
              ① 판매중 11개 프레임 중 이 파일 하나에만 있던 문구다 → 공통 정책이 아니라 특정 클라이언트 유물
              ② 위탁 기능 자체가 꺼져 있다(setting_obj.is_use_consignment 기본 0, 백엔드가 consignment_products 를 내려주지 않음)
              ③ 가맹점이 직접 파는 구조에서 "책임은 공급사에게 있다"는 고지는 사실과 다르다 */}

        </ContentWrapper>
        {/* 바텀시트(Drawer) → Dialog scroll="paper" 로 교체.
            ※ 이 파일만 policyType 이 1-base 다(0=닫힘 / 1=이용약관 / 2=개인정보정책).
              열림 여부는 policyType > 0, 약관 종류는 policyType - 1 로 0-base 로 되돌려 넘긴다.
              오프셋을 빼먹으면 '이용약관' 자리에 개인정보처리방침이 뜬다. */}
        <DialogPolicy
          open={policyType > 0}
          type={policyType - 1}
          onClose={() => {
            setPolicyType(0)
          }}
        />
      </Wrappers>
      <FixedFooter>
        <Icon icon='bi:handbag' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => { router.push('/shop') }} />

        <Badge badgeContent={themeCartData?.length ?? 0} color="error">
          <Icon icon={'fluent:cart-20-regular'} style={{ fontSize: '32px', cursor: 'pointer' }} onClick={() => router.push('/shop/auth/cart')} />
        </Badge>
        {
          /*
          <Icon icon='radix-icons:hamburger-menu' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => { }} />
          <Icon icon={'iconoir:search'} style={{ fontSize: '24px', cursor: 'pointer' }} />
                <Icon icon='ph:bell' style={{ fontSize: '24px', cursor: 'pointer' }} onClick={() => { }} />
          */
        }
        <Icon icon='basil:user-outline' style={{ fontSize: '32px', cursor: 'pointer' }} onClick={() => { router.push('/shop/auth/my-page') }} />
      </FixedFooter>
    </>
  )
}
export default Footer
