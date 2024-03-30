import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import styled from "styled-components";
import { HomeDemo1 } from "../demo-1";
import { Dialog } from "@mui/material";
import { useEffect, useState } from "react";
import { Row } from "src/components/elements/styled-components";


const BottomContent = styled.div`
max-width: 1400px;
margin:0 auto;
margin-top: -3rem;
`

const RowHome = styled(Row)`
margin-bottom: 120px;
@media (max-width:1200px) {
  flex-direction: column;
}
`


const HomeDemo = (props) => {

  const { themeDnsData } = useSettingsContext();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (themeDnsData?.id > 0) {
      setLoading(false);
    }
  }, [themeDnsData])
  return (
    <>
      <Dialog fullScreen open={loading}>
        <img src={'/images/gifs/grandpris-loading.gif'} style={{ width: '100px', margin: 'auto' }} />
      </Dialog>
      <HomeDemo1 {...props} type={1} />
      <div>
        <BottomContent>
          <Row style={{ width: '100%', marginBottom: '60px' }}>
            <img
              src='/grandparis/new-luxury-edition.png'
              style={{ margin: '0 auto' }}
            />
          </Row>
          <RowHome>
            <img src='/grandparis/luxury-edition-inside.png' />
            <div style={{ marginLeft: '3rem' }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: '36px', display: 'flex' }}>
                Luxury edition in <div style={{ color: "#EC1C24" }}>&nbsp;inspire</div>
              </div>
              <br />
              <div style={{ fontSize: '13px' }}>
                이제 영종도 인스파이어에서 모든 럭셔리 브랜드를 한 자리에서 만날 수 있습니다.<br />
                럭셔리 에디션에서 명품 브랜드의 제품 구매 | 판매 | 위탁 | 수리까지<br />
                non-stop service를 경험하세요.
              </div>
              <br />
              <div style={{ fontFamily: 'Playfair Display', fontSize: '16px', color: '#999999' }}>
                Hermes, CHANEL, Louis Vuitton, Patek Philippe, Rolex, Audemars<br />
                Piguet, IWC, etc
              </div>
              <br /><br />
              <div
                style={{ fontFamily: 'Playfair Display', fontSize: '16px', borderBottom: '1px solid #EC1C24', width: 'fit-content', cursor: 'pointer' }}
                onClick={() => {
                  window.open('https://luxuryedition.co.kr')
                }}
              >
                View more
              </div>
              <br /><br /><br /><br />
              <Row style={{ fontSize: '14px', fontWeight: 'bold' }}>
                인스파이어점
              </Row>
              <Row style={{ fontSize: '12px' }}>
                인천시 중구 공항문화로 127 (중구 용유로 542) 3층 R03, R04<br />
                Tel. 032-215-8887 / 032-215-8889
              </Row>
            </div>
          </RowHome>
        </BottomContent>
      </div>
    </>
  )
}
export default HomeDemo