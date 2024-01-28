import { Button, Table, TableBody } from "@mui/material";
import styled from "styled-components";
import { useRouter } from "next/router";
import { logoSrc } from "src/data/data"
import { useSettingsContext } from "src/components/settings";
import { Col, Row } from "src/components/elements/styled-components";
import { CategorySorter, LANGCODE } from "src/views/shop/demo-4/header"
import { useEffect } from "react";

const Wrappers = styled.div`
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
`

const ConsignmentGuide = () => {
    const router = useRouter()
    const { themeCategoryList } = useSettingsContext()
    const { sort, categoryGroup } = CategorySorter(themeCategoryList)
    useEffect(() => {
        sort(LANGCODE.ENG)
    }, [])
    return (
        <>
        <Wrappers>
            <GuideTitle>
                위탁센터
            </GuideTitle>
            <img src="/grandparis/cons_info_1.jpg" style={{width:'1021px', margin:'0 auto'}} />
            <Button variant="outlined" onClick={() => {router.push('../auth/consignment')}}sx={{width:'200px', height:'50px', margin:'0 auto', marginTop:'50px'}}>
                위탁 현황 보기
            </Button>
            <img src={logoSrc()} style={{width:'300px', margin:'70px auto'}} />
            <GuideSubtitle>
                위탁 절차
            </GuideSubtitle>
            <GuideSubText>
                간편하고 편리한 위탁 절차 안내
            </GuideSubText>
            <img src="/grandparis/cons_info_2.jpg" style={{width:'948px', margin:'0 auto'}} />
            <GuideSubtitle>
                위탁 수수료
            </GuideSubtitle>
            <GuideSubText>
                합리적인 수준의 수수료 안내
            </GuideSubText>
            <img src="/grandparis/cons_info_3.png" style={{width:'1029px', margin:'0 auto'}} />
            <GuideSubtitle>
                위탁 송금기간
            </GuideSubtitle>
            <GuideSubText>
                위탁금 송금 기간 안내
            </GuideSubText>
            <img src="/grandparis/cons_info_4.jpg" style={{width:'948px', margin:'0 auto'}} />
            <GuideSubtitle>
                위탁기간 및 보관방법
            </GuideSubtitle>
            <GuideSubText>
                위탁기간 및 보관 방법 안내
            </GuideSubText>
            <img src="/grandparis/cons_info_5.jpg" style={{width:'951px', margin:'0 auto'}} />
            <GuideSubtitle>
                위탁 제한
            </GuideSubtitle>
            <GuideSubText>
                위탁 제한 안내
            </GuideSubText>
            <img src="/grandparis/cons_info_6.jpg" style={{width:'548px', margin:'0 auto'}} />
            <GuideSubtitle>
                위탁 브랜드
            </GuideSubtitle>
            <GuideSubText>
                위탁 가능 브랜드 안내
            </GuideSubText>
            {categoryGroup.map((group) => {
                return <>
                {group.childs.map((child) => {
                    return <>
                    <div>{child.category_name}</div>
                    </>
                })}
                </>
            })}
        </Wrappers>
        </>
    )
}

export default ConsignmentGuide