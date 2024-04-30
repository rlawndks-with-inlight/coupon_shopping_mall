
import styled from "styled-components";
import { logoSrc } from "src/data/data";
import { Row, Col } from "src/components/elements/styled-components";
import { Button, Chip } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSettingsContext } from "src/components/settings";
import { CategorySorter, LANGCODE } from "src/views/shop/demo-4/header"

/*const Wrappers = styled.div`
max-width:1400px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
text-align: center;
`

const GuideTitle = styled.div`
font-size: 30px;
font-weight: 600;
padding-bottom: 15px;
border-bottom: 4px solid #af0404;
margin-bottom: 10px;
`

const GuideSubtitle = styled.div`
font-size: 25px;
font-weight:600;
margin-top: 50px;
margin-bottom: 10px;
`

const GuideSubText = styled.div`
font-size:15px;
font-weight:600;
margin-bottom:20px;
color: #777777;
`*/
const Wrappers = styled.div`
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;

  @media (max-width: 1400px) {
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
  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const SubTitle = styled.span`
  color: #5f5f5f;
  margin-right: 1.5rem;
`;

const ContentRow = styled(Row)`
  display: flex;
  margin-top: 3rem;
  //justify-content: space-between;

  @media (max-width: 1400px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ContentSection = styled.div`
  margin-right: 2rem;
  margin-left: 2rem;
  font-family: 'Noto Sans KR';
  word-break: keep-all;
  @media (max-width: 1400px) {
    margin:2rem 0;
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
    color: #FF5B0D;
  }
`;

const Description = styled.div`
  font-size: 16px;
`;

const RedDesc = styled.div`
font-size: 22px;
color:#FF5B0D;
font-weight: bold;
`

const Desc = styled.div`
font-size: 22px;
font-weight: bold;
`
const BrandContent = styled.div`
font-size: 44px;
width:100%;
margin:0 auto;
white-space: wrap;
@media (max-width:1000px) {
    font-size:22px;
}
`

const PurchaseGuide = () => {
    const [tab, setTab] = useState('purchase')
    const router = useRouter()
    const { themeCategoryList, themeDnsData, themeMode } = useSettingsContext()
    const { sort, categoryGroup } = CategorySorter(themeCategoryList)
    const [langChipSelected, setLangChipSelected] = useState(0)
    const [textChipSelected, setTextChipSelected] = useState('A')

    useEffect(() => {
        sort(LANGCODE.ENG)
    }, [])

    const alphabetList = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'
    ]

    const hangeulList = [
        '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하', '#'
    ]

    return (
        <>
            <Wrappers>
                <Title>
                    <SubTitle>Start selling.</SubTitle><span>It's easy.</span>
                </Title>
                <ContentRow>
                    <ContentSection>
                        <SinceText>매입/위탁센터</SinceText>
                        <br />
                        <LuxuryText>
                            Sell what you have — so you<br />
                            can buy what you want.
                        </LuxuryText>
                        <br />
                        <BrandText style={{ color: '#999999' }}>
                            지금, 오래된 옷장을 비우고<br />
                            새로움으로 채우세요
                        </BrandText>
                        <br />
                        <Description>
                            그랑파리는 여러분의 소중한 상품을 귀하게 매입하고 보다 좋은 조건으로 위탁판매 해 드리기
                            
                            위해 노력합니다. 이는 그 상품이 여러분들에게 얼마나 소중했던, 설레게 했던 상품인지를 잘
                            
                            알기 때문입니다.
                            <br />
                            <br />
                            소중한 애장품을 판매하시는 고객분들의 마음을 소중히 담아
                            <br />
                            보다 높은 매입, 빠른 판매가 될 수 있도록 노력하겠습니다.
                            <br />
                            <br />
                            <Button
                                style={{
                                    backgroundColor: 'black',
                                    color: 'white',
                                    width: '100%',
                                    height: '60px',
                                    borderRadius: '0',
                                    fontSize: '18px',
                                    marginBottom: '1rem'
                                }}
                                onClick={() => {
                                    setTab('purchase')
                                }}
                            >
                                매입센터
                            </Button>
                            <Button
                                style={{
                                    backgroundColor: 'black',
                                    color: 'white',
                                    width: '100%',
                                    height: '60px',
                                    borderRadius: '0',
                                    fontSize: '18px'
                                }}
                                onClick={() => {
                                    setTab('consignment')
                                }}
                            >
                                위탁판매
                            </Button>
                        </Description>
                    </ContentSection>
                    <img src="/grandparis/purchase_banner.png" />
                </ContentRow>
                <Row style={{ margin: '0 auto', marginTop: '10rem' }}>
                    <div
                        style={{
                            color: `${tab == 'purchase' ? 'black' : '#999999'}`,
                            textDecoration: `${tab == 'purchase' ? 'underline' : ''}`,
                            cursor: 'pointer',
                            marginRight: '5rem'
                        }}
                        onClick={() => {
                            setTab('purchase')
                        }}
                    >
                        매입센터
                    </div>
                    <div
                        style={{
                            color: `${tab == 'consignment' ? 'black' : '#999999'}`,
                            textDecoration: `${tab == 'consignment' ? 'underline' : ''}`,
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            setTab('consignment')
                        }}
                    >
                        위탁판매
                    </div>
                </Row>
                <ContentRow style={{ marginTop: '5rem' }}>
                    {
                        tab == 'purchase' ?
                            <>
                                <img src="/grandparis/purchase_banner_4.png" />
                                <ContentSection>
                                    <SinceText>매입센터</SinceText>
                                    <br />
                                    <LuxuryText>
                                        Purchase Sale
                                    </LuxuryText>
                                    <br />
                                    <BrandText style={{ color: '#999999' }}>
                                        그랑파리의 매입센터 특징
                                    </BrandText>
                                    <br />
                                    <br />
                                    <RedDesc>
                                        1. 고가 매입 가능
                                    </RedDesc>
                                    <Description style={{ marginLeft: '25px', marginBottom: '1rem' }}>
                                        그랑파리에서는 직접 소매판매가 가능하므로 고가 매입이 가능합니다.
                                    </Description>
                                    <RedDesc>
                                        2. 다양한 아이템 매입
                                    </RedDesc>
                                    <Description style={{ marginLeft: '25px', marginBottom: '1rem' }}>
                                        시계는 물론 가방, 지갑 및 악세사리 등 다양한 아이템 매입이 가능합니다.
                                    </Description>
                                    <RedDesc>
                                        3. 합리적인 가격 책정
                                    </RedDesc>
                                    <Description style={{ marginLeft: '25px', marginBottom: '1rem' }}>
                                        그랑파리에서는 합리적인 가격 책정이 이루어집니다.
                                    </Description>
                                    <RedDesc>
                                        4. 빠른 회전 가능
                                    </RedDesc>
                                    <Description style={{ marginLeft: '25px', marginBottom: '1rem' }}>
                                        매입이 안되더라도 위탁판매가 가능하므로 빠른 회전을 보장합니다.
                                    </Description>
                                    <br />
                                    <Description>
                                        <Description style={{ paddingLeft: '25px', color: '#999999', borderLeft: '2px solid #999999' }}>
                                            제품 실물 확인 전에는 가격 책정이 어렵습니다.<br />
                                            지금 바로 매입 가능 여부를 상담하세요.
                                        </Description>
                                        <br />
                                        <Button
                                            style={{
                                                backgroundColor: 'black',
                                                color: 'white',
                                                width: '100%',
                                                height: '60px',
                                                borderRadius: '0',
                                                fontSize: '18px',
                                                cursor: 'default'
                                            }}>
                                            매입 문의전화 <div style={{ fontFamily: 'Playfair Display' }}>&nbsp;02-517-2950/8950</div>
                                        </Button>
                                    </Description>
                                </ContentSection>
                            </>
                            :
                            <>
                                <img src="/grandparis/purchase_banner_5.png" />
                                <ContentSection>
                                    <SinceText>위탁판매</SinceText>
                                    <br />
                                    <LuxuryText>
                                        Grand Paris Dropshipping
                                    </LuxuryText>
                                    <br />
                                    <BrandText style={{ color: '#999999' }}>
                                        그랑파리의 위탁판매
                                    </BrandText>
                                    <br />
                                    <br />
                                    <Desc>
                                        1. 명품 판매점
                                    </Desc>
                                    <Description style={{ marginLeft: '25px', marginBottom: '1rem' }}>
                                        그랑파리는 명품 판매점으로 온라인/오프라인 동시 판매를 진행합니다.
                                    </Description>
                                    <Desc>
                                        2. 신뢰가 가능한 판매/보관
                                    </Desc>
                                    <Description style={{ marginLeft: '25px', marginBottom: '1rem' }}>
                                        위탁제품을 청결, 안전하게 보관하고 믿을 수 있는 판매를 진행합니다.
                                    </Description>
                                    <Desc>
                                        3. 친절한 설명
                                    </Desc>
                                    <Description style={{ marginLeft: '25px', marginBottom: '1rem' }}>
                                        전화문의를 주시면 친절하게 설명드립니다. 또한 과정이 쉽고 간편합니다.
                                    </Description>
                                    <Desc>
                                        4. 100% 정품
                                    </Desc>
                                    <Description style={{ marginLeft: '25px', marginBottom: '1rem' }}>
                                        그랑파리로 위탁주시는 제품은 반드시 100% 정품이어야 합니다.
                                    </Description>
                                    <br />
                                    <Description>
                                        <Description style={{ paddingLeft: '25px', color: '#FF5B0D', borderLeft: '2px solid #999999' }}>
                                            그랑파리 기준 B등급 이하의 상태로 오염 및 얼룩이 있거나 수선한 제품은<br />
                                            위탁이 불가하며, 브랜드와 디자인을 선별하여 위탁이 진행됩니다.
                                        </Description>
                                        <br />
                                        <Row>
                                            <Button
                                                style={{
                                                    backgroundColor: 'black',
                                                    color: 'white',
                                                    width: '50%',
                                                    height: '60px',
                                                    borderRadius: '0',
                                                    fontSize: '18px',
                                                    cursor: 'default',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    marginRight: '1rem'
                                                }}>
                                                위탁 문의전화<div style={{ fontFamily: 'Playfair Display' }}>02-517-2950/8950</div>
                                            </Button>
                                            <Button
                                                style={{
                                                    backgroundColor: 'white',
                                                    color: 'black',
                                                    width: '50%',
                                                    height: '60px',
                                                    borderRadius: '0',
                                                    fontSize: '18px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    border: '1px solid black'
                                                }}>
                                                위탁현황보기
                                            </Button>
                                        </Row>
                                    </Description>
                                </ContentSection>
                            </>
                    }
                </ContentRow>
                <ContentRow style={{ margin: '10rem auto' }}>
                    <img
                        src={tab == 'purchase' ? "/grandparis/infograph_3.png" : "/grandparis/infograph_4.png"}
                    />
                </ContentRow>
            </Wrappers>
            {tab == 'consignment' ?
                <>
                <Col style={{maxWidth:'1600px', margin:'0 auto', marginBottom:'3rem', backgroundColor:'#FEF8F4',  fontFamily:'Noto Sans KR', padding:'3rem'}}>
                    <Row style={{maxWidth:'1400px', flexDirection:'column'}}>
                    <Row style={{width:'100%', flexDirection:'column', textAlign:'center', marginBottom:'2rem'}}>
                        <span>합리적인 수준의 수수료 안내</span>
                        <br />
                        <span style={{fontSize:'44px'}}>위탁수수료</span>
                    </Row>
                    <img src='/grandparis/consignment_pay_3.png' />
                    </Row>
                </Col>
                <Row style={{maxWidth:'1400px', margin:'0 auto'}}>
                    <BrandContent>
                        <Row style={{marginBottom:'3rem'}}>
                            <div style={{margin:'0 auto', fontFamily:'Noto Sans KR'}}>위탁 가능 브랜드</div>
                        </Row>
                        <Row>
                        <Chip label={`ABC`} sx={{
                            margin: '0.5rem auto',
                            marginRight:'0',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            cursor: 'pointer',
                            height: '40px',
                            background: 'transparent',
                            borderRadius: '0',
                            fontFamily:'Playfair Display',
                            width:'100px',
                            color: `${langChipSelected == 0 ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                            '&:hover': {
                                textDecoration: 'underline',
                                background: 'transparent',
                            }
                        }}
                            onClick={() => { setLangChipSelected(0); sort(LANGCODE.ENG); setTextChipSelected('A'); }}
                        />
                        <Chip label={`가나다`} sx={{
                            margin: '0.5rem auto',
                            marginLeft:'0',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            cursor: 'pointer',
                            height: '40px',
                            background: 'transparent',
                            borderRadius: '0',
                            fontFamily:'Noto Sans KR',
                            width:'100px',
                            color: `${langChipSelected == 1 ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                            '&:hover': {
                                textDecoration: 'underline',
                                background: 'transparent',
                            }
                        }}
                            onClick={() => { setLangChipSelected(1); sort(LANGCODE.KOR); setTextChipSelected('가'); }}
                        />
                    </Row>
                    <Row style={{flexWrap:'wrap'}}>
                        {langChipSelected == 0 ?
                            <>
                                {alphabetList.map((alphabet) => {
                                    return <>
                                        <Chip
                                            label={alphabet}
                                            sx={{
                                                margin: '0.5rem 0rem 0.5rem 0',
                                                fontSize: '16px',
                                                cursor: 'pointer',
                                                color: `${textChipSelected == alphabet ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                                                background: 'transparent',
                                                fontFamily:'Playfair Display',
                                                '&:hover': {
                                                    color: `${textChipSelected == alphabet ? 'white' : ''}`,
                                                    //background: `${textChipSelected == alphabet ? 'black' : ''}`,
                                                },
                                                borderRadius: '0',
                                                borderBottom: `${textChipSelected == alphabet ? '2px solid black' : ''}`
                                            }}
                                            onClick={() => { setTextChipSelected(alphabet); }}
                                        />
                                    </>
                                })}
                            </>
                            :
                            <>
                                {hangeulList.map((hangeul) => {
                                    return <>
                                        <Chip
                                            label={hangeul}
                                            variant="soft"
                                            sx={{
                                                margin: '0.5rem 0rem 0.5rem 0',
                                                fontSize: '16px',
                                                cursor: 'pointer',
                                                color: `${textChipSelected == hangeul ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                                                background: 'transparent',
                                                fontFamily:'Noto Sans KR',
                                                '&:hover': {
                                                    color: `${textChipSelected == hangeul ? 'white' : ''}`,
                                                    //background: `${textChipSelected == hangeul ? 'black' : ''}`,
                                                },
                                                borderRadius: '0',
                                                borderBottom: `${textChipSelected == hangeul ? '2px solid black' : ''}`
                                            }}
                                            onClick={() => { setTextChipSelected(hangeul); }}
                                        />
                                    </>
                                })}
                            </>
                        }
                    </Row>
                    <Col style={{ minWidth: '100px', flexWrap: 'wrap', alignItems: 'flex-start', rowGap: '0.2rem', marginBottom: '1rem' }}>

                        {categoryGroup.map((group) => {
                            if (textChipSelected == '') {
                                return <>
                                    <Row style={{flexWrap:'wrap'}}>
                                        {
                                            group.childs.map((child) => {
                                                return <Chip
                                                    label={langChipSelected == 0 ? child?.category_en_name : child?.category_name}
                                                    sx={{
                                                        margin: '0.5rem 0rem 0.5rem 0',
                                                        fontSize: '16px',
                                                        background: 'transparent',
                                                        fontFamily:`${langChipSelected == 0 ? 'Playfair Display' : 'Noto Sans KR'}`,
                                                        '&:hover': {
                                                            background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                                                        },
                                                    }}
                                                    />
                                            })

                                        }
                                    </Row>
                                </>
                            }
                            else if (textChipSelected == group?.label) {
                                return <>
                                    <Row style={{flexWrap:'wrap'}}>
                                        {
                                            group.childs.map((child) => {
                                                return <Chip
                                                    label={langChipSelected == 0 ? child?.category_en_name : child?.category_name}
                                                    sx={{
                                                        margin: '0.5rem 0rem 0.5rem 0',
                                                        fontSize: '16px',
                                                        background: 'transparent',
                                                        fontFamily:`${langChipSelected == 0 ? 'Playfair Display' : 'Noto Sans KR'}`,
                                                        '&:hover': {
                                                            background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                                                        },
                                                    }}/>
                                            })

                                        }
                                    </Row>
                                </>
                            }
                        })}

                    </Col>
                    </BrandContent>
                    </Row>
                </>
                :
                <>
                </>
            }
            <div style={{ marginTop: '3rem' }}>
                <img
                    src="/grandparis/about_banner4.png"
                    style={{ width: '1600px', margin: '0 auto', cursor: 'pointer' }}
                    onClick={() => {
                        router.push('/shop/guide/brand-about')
                    }}
                />
            </div>
        </>
    )
}

export default PurchaseGuide