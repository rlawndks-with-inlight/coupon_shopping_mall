import styled from "styled-components";
import { Row, Col } from "src/components/elements/styled-components";
import { Icon } from "@iconify/react";

const Wrappers = styled.div`
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;

  @media (max-width: 1000px) {
    width: 100%;
    padding: 0 1rem;
  }
`;

const Title = styled.div`
  margin-top: 5rem;
  font-family: 'Playfair Display';
  font-size: 90px;
  color: #FF5B0D;
  border-bottom: 1px solid lightgray;
  display:flex;
  @media (max-width: 1000px) {
    font-size: 48px;
  }
  @media (max-width: 450px) {
    font-size: 32px;
  }
`;

const SubTitle = styled.div`
  color: #5f5f5f;
`;

const ContentRow = styled(Row)`
  display: flex;
  margin-top: 3rem;
  justify-content: space-between;

  @media (max-width: 1400px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ContentSection = styled.div`
  margin-right: 2rem;
  margin-left: 2rem;
  @media (max-width: 1400px) {
    margin: 2rem 0;
    text-align: center;
  }
  font-family: 'Noto Sans KR';
  word-break: keep-all;
`;

const SinceText = styled.div`
  font-family: 'Playfair Display';
  font-size: 16px;
`;

const LuxuryText = styled.div`
  font-family: 'Playfair Display';
  font-size: 46px;
  margin-bottom: 0.5rem;
`;

const Underline = styled.div`
  border-bottom: 3px solid black;
  border-top: 1px solid black;
  height: 0.5rem;
`;

const BrandText = styled.div`
  font-size: 40px;
  span {
    color: #FF5B0D;
  }
`;

const Description = styled.div`
  font-size: 16px;
`;

const FloorGuide = styled.div`
margin-left: -10rem;
margin-right: 10rem;
margin-top: 10rem;
`

const FloorRow = styled(Row)`
@media (max-width:1400px) {
  display:flex;
  flex-direction: column;
}
`

const BrandAbout = () => {
  return (
    <>
      <Wrappers>
        <Title>
          <SubTitle>About</SubTitle>&nbsp;Grand Paris
        </Title>
        <ContentRow>
          <ContentSection>
            <SinceText>Since 2007</SinceText>
            <br />
            <LuxuryText>Classic and Luxury</LuxuryText>
            <Underline />
            <br />
            <br />
            <BrandText>
              항상 믿음으로 서비스를 제공하는<br />
              <span>그랑파리</span>
            </BrandText>
            <br />
            <br />
            <Description>
              2007년부터 대한민국 명품의 중심지 압구정 로데오거리에서 한결같이 자리를 지키는 그랑파리는 에르메스와 샤넬, 루이뷔통 등 클래식한 명품을 전문으로 합니다.
              <br />
              물론 유행을 선도하는 하이엔드 명품 브랜드에서 제공하는 가방, 시계, 액세서리, 의류, 잡화 및 명품 브랜드에서 제공하는 모든 아이템을 만나실 수 있습니다.
              <br />
              항상 변하지 않고 신뢰할 수 있는 모습으로 서비스를 제공합니다.
            </Description>
          </ContentSection>
          <img src="/grandparis/about_banner.png" />
        </ContentRow>
        <ContentRow style={{marginTop:'0'}}>
        <img src="/grandparis/luxury_edition_4.png" />
          <ContentSection style={{marginRight:'1rem'}}>
            
            <br />
            <img src='/grandparis/new-luxury-edition2.png' style={{maxWidth:'227px', display:'inline-block'}} />
            <LuxuryText>Luxury edition in <span style={{color:'#FF5B0D'}}>inspire</span></LuxuryText>
            <Underline />
            <br />
            <br />
            <BrandText>
              모든 럭셔리 브랜드를 한 자리에서<br />
              <span>럭셔리에디션</span>
            </BrandText>
            <br />
            <br />
            <Description>
             새로운 경험과 감각, 환상적인 재미를 제공하는 인스파이어 리조트에 럭셔리 에디션이 함께합니다.
             하이엔드 명품 브랜드 제품들을 판매하고 매입하는 럭셔리 에디션은, 에르메스, 샤넬, 파텍 필립, 로렉스, 리차드밀 등 모두가 사랑하는 브랜드를 가방, 시계, 소품들로 선보입니다.
             인스파이어에서 만나는 다채로운 경험들에 럭셔리 에디션에서 멋진 아이템을 더한다면, 추억의 한 페이지가 완벽해질 것입니다.
             인천 영종도 인스파이어 럭셔리에디션에서 모든 럭셔리 브랜드를 한 자리에서 만날 수 있습니다.
              <br />
              <br />
              <span style={{color:'#D9D9D9', fontFamily:'Playfair Display'}}>
                Hermes, CHANEL, Louis Vuitton, Patek Philippe, Rolex, Audemars Piguet, IWC, etc
                </span>
                <br /><br />
                내가 아는 명품의 모든 것을 럭셔리 에디션에서 구매/판매/위탁/수리 non-stop service로 경험하세요.
                2007년부터 꾸준히 함께해주시는 고객님들의 마음에 최상의 서비스로 보답하겠습니다.
                <br /><br />
              <div
                style={{ 
                  fontFamily: 'Playfair Display', 
                  fontSize: '16px', 
                  borderBottom: '1px solid #FF5B0D', 
                  width: 'fit-content', 
                  cursor: 'pointer',
                  display:'inline-block'
                 }}
                onClick={() => {
                  window.open('https://luxuryedition.co.kr')
                }}
              >
                View more
              </div>
              <br /><br /><br />
              <Col>
              <Row style={{ fontSize: '14px', fontWeight: 'bold', fontFamily:'Noto Sans KR', display:'inline-block' }}>
                인스파이어점
              </Row>
              <Row style={{ fontSize: '12px', fontFamily:'Noto Sans KR', display:'inline-block' }}>
                인천시 중구 공항문화로 127 (중구 용유로 542) 3층 R03, R04<br />
                Tel. 032-215-8887 / 032-215-8889
              </Row>
              <br />
              <Row style={{ fontSize: '12px', fontFamily:'Noto Sans KR', display:'inline-block' }}>
                Open and Close<br />
                A.M. 10:30 ~ P.M. 8:30
              </Row>
              </Col>
            </Description>
          </ContentSection>
        </ContentRow>
      </Wrappers>
      <div style={{ marginTop: '3rem' }}>
        <img src="/grandparis/about_banner_02.png" style={{ width: '1600px', margin: '0 auto' }} />
      </div>
      <div>
        <img src='/grandparis/history.png' style={{ width: '1600px', margin: '0 auto' }} />
      </div>
      <Wrappers style={{ margin: '5rem auto' }}>
        <ContentRow style={{display:'flex', justifyContent:'space-between'}}>
          <ContentSection style={{  }}>
            <SinceText style={{display:'inline-block'}}>오시는 길</SinceText>
            <LuxuryText>Contact Us</LuxuryText>
            <br />
            <br />
            <Description style={{ fontSize: '16px' }}>
              <Row style={{ marginBottom: '1rem', textAlign:'left' }}>
                <Icon icon={'mdi:location'} style={{ color: '#FF5B0D', width: '34px', height: '34px', marginRight: '0.5rem' }} />
                서울특별시 강남구 선릉로 157길 8<br />
                (강남구 신사동 664-15번지)
              </Row>
              <Row style={{ marginBottom: '1rem', textAlign:'left' }}>
                <Icon icon={'mingcute:phone-fill'} style={{ color: '#FF5B0D', width: '34px', height: '34px', marginRight: '0.5rem' }} />
                02-517-2950<br />
                02-517-8950
              </Row>
              <Row style={{ marginBottom: '1rem', textAlign:'left' }}>
                <Icon icon={'mdi:clock'} style={{ color: '#FF5B0D', width: '34px', height: '34px', marginRight: '0.5rem' }} />
                평일 : 오전 10:00 ~ 오후 07:00<br />
                토요일 : 오전 10:30 ~ 오후 6:00<br />
                휴무 : 공휴일
              </Row>
            </Description>
          </ContentSection>
          <img src="/grandparis/map_demo.png" />
        </ContentRow>
      </Wrappers>
      <Row style={{ backgroundColor: '#EEEEEE', flexDirection: 'column', maxWidth: '1600px', margin: '0 auto' }}>
        {/*<ContentSection style={{ textAlign: 'center', margin: '0 auto', marginTop: '5rem' }}>
          <SinceText>층별안내</SinceText>
          <LuxuryText>Floor guide</LuxuryText>
              </ContentSection>*/}
        <div style={{ display: 'flex', margin:'5rem 0' }}>
            <img src="/grandparis/left.png" style={{height:'1200px'}} />
          <FloorGuide>
            
            <FloorRow style={{ marginBottom: '2rem' }}>
            <img src="/grandparis/F4-2.png" style={{ marginRight: '1rem' }} />
              <img src="/grandparis/F1-1.png" style={{ marginRight: '1rem' }} />
              <img src="/grandparis/F1-2.png" />
            </FloorRow>
            
            <FloorRow style={{ marginBottom: '2rem' }}>
              <img src="/grandparis/F2-1.png" style={{ marginRight: '1rem' }} />
              <img src="/grandparis/F2-2.png" style={{ marginRight: '1rem' }} />
              <img src="/grandparis/F1-3.png" />
            </FloorRow>
            
            <FloorRow style={{ marginBottom: '2rem' }}>
              <img src="/grandparis/F4-1.png" style={{ marginRight: '1rem' }} />
              <img src="/grandparis/F2-3.png" style={{ marginRight: '1rem' }} />
              <img src="/grandparis/F4-3.png" />
            </FloorRow>
            <FloorRow style={{ marginBottom: '2rem' }}>
              <img src="/grandparis/F5-1.png" style={{ marginRight: '1rem' }} />
              <img src="/grandparis/F5-2.png" style={{ marginRight: '1rem' }} />
              <img src="/grandparis/F5-3.png" />
            </FloorRow>
          </FloorGuide>
        </div>
      </Row>
    </>
  );
};

export default BrandAbout;