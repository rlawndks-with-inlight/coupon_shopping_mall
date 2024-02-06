
import styled from "styled-components";
import { logoSrc } from "src/data/data";

const Wrappers = styled.div`
max-width:1100px;
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
`

const PurchaseGuide = () => {
    return (
        <>
        <Wrappers>
            <GuideTitle>
                매입센터
            </GuideTitle>
            <img src="/grandparis/purch_info_1.jpg" style={{width:'1021px', margin:'0 auto'}} />
            <GuideSubtitle>
                높은 가격 책정 팁
            </GuideSubtitle>
            <GuideSubText>
                높은 가격으로 책정받고 싶다면?
            </GuideSubText>
            <img src="/grandparis/purch_info_2.jpg" style={{width:'948px', margin:'0 auto'}} />
            <GuideSubtitle>
                매입절차
            </GuideSubtitle>
            <GuideSubText>
                매입 절차 안내
            </GuideSubText>
            <img src="/grandparis/purch_info_3.jpg" style={{width:'856px', margin:'0 auto'}} />
        </Wrappers>
        </>
    )
}

export default PurchaseGuide