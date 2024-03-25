import styled from "styled-components";
import { Row } from "src/components/elements/styled-components";

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
  color: #ec1c24;
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

  @media (max-width: 1000px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ContentSection = styled.div`
  margin-right: 1rem;

  @media (max-width: 1000px) {
    margin-right: 0;
    text-align: center;
  }
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
    color: #ec1c24;
  }
`;

const Description = styled.div`
  font-size: 16px;
`;

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
              저희 그랑파리는 2007년 이래 클래식한 명품 브랜드와 유행을 선도하는
              인기 브랜드 아이템을
              <br />
              중심으로 고객님들의 안목과 품격을 위해 노력하고 있습니다.
              <br />
              <br />
              압구정 로데오 거리를 중심으로 오프라인 매장을 운영하고 있으며
              고객님들의 편리한 이용과
              <br />
              정보 공유를 위해 온라인 쇼핑몰을 운영하고 있습니다.
              <br />
              <br />
              온·오프라인에서 손쉽고 위탁 및 매입 판매 서비스를 기본으로 고객님의
              기쁨과 행복을 위해,
              <br />
              항상 정성과 믿음으로 서비스를 제공하는 그랑파리가 되겠습니다.
            </Description>
          </ContentSection>
          <img src="/grandparis/about_banner.png"/>
        </ContentRow>
        </Wrappers>
        <div style={{marginTop:'3rem'}}>
        <img src="/grandparis/about_banner_02.png" style={{width:'1600px', margin: '0 auto'}}/>
        </div>
        <div>
            <img src='/grandparis/history.png' style={{width:'1600px', margin: '0 auto'}} />
        </div>
        <Wrappers>
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
              저희 그랑파리는 2007년 이래 클래식한 명품 브랜드와 유행을 선도하는
              인기 브랜드 아이템을
              <br />
              중심으로 고객님들의 안목과 품격을 위해 노력하고 있습니다.
              <br />
              <br />
              압구정 로데오 거리를 중심으로 오프라인 매장을 운영하고 있으며
              고객님들의 편리한 이용과
              <br />
              정보 공유를 위해 온라인 쇼핑몰을 운영하고 있습니다.
              <br />
              <br />
              온·오프라인에서 손쉽고 위탁 및 매입 판매 서비스를 기본으로 고객님의
              기쁨과 행복을 위해,
              <br />
              항상 정성과 믿음으로 서비스를 제공하는 그랑파리가 되겠습니다.
            </Description>
          </ContentSection>
          <img src="/grandparis/about_banner.png" alt="About Banner" />
        </ContentRow>
        <img
          src="/grandparis/company_info_3.png"
          style={{ width: "1018px", margin: "0 auto" }}
          alt="Company Info 3"
        />
      </Wrappers>
    </>
  );
};

export default BrandAbout;