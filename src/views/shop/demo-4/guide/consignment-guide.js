import { Button, Table, TableBody, TableContainer, TableRow, TableCell, Chip, Typography } from "@mui/material";
import styled from "styled-components";
import { useRouter } from "next/router";
import { logoSrc } from "src/data/data"
import { useSettingsContext } from "src/components/settings";
import { Col, Row } from "src/components/elements/styled-components";
import { CategorySorter, LANGCODE } from "src/views/shop/demo-4/header"
import { useEffect, useState } from "react";

const Wrappers = styled.div`
max-width:1360px;
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
margin-bottom: 20px;
`

const GuideSubText = styled.div`
font-size:15px;
font-weight:600;
margin-bottom:20px;
color: #777777;
`

const GuideVariable = styled.div`
margin:0 auto;
max-width: 100%;
background-size: contain;
background-repeat: no-repeat;
`

const ChargeTable = styled(TableCell)`
padding:0;
text-align: center;
font-weight: 800;
font-size: 1rem;
border-left: ${(props) => props.themeMode == 'dark' ? '1px solid red' : ""};
@media screen and (max-width:1000px) {
    font-size: 0.8rem;
}
@media screen and (max-width:700px) {
    font-size: 0.5rem;
}
@media screen and (max-width:500px) {
    font-size: 0.4rem;
}
`

const MethodTable = styled(TableCell)`
padding:0;
text-align:center;
font-size:0.9rem;
width:25%;
padding-top:5%;
@media screen and (max-width:1000px) {
    font-size: 0.7rem;
}
@media screen and (max-width:700px) {
    font-size: 0.5rem;
}
@media screen and (max-width:500px) {
    font-size: 0.4rem;
}
`


const ConsignmentGuide = () => {
    const router = useRouter()
    const { themeCategoryList, themeDnsData, themeMode } = useSettingsContext()
    const { sort, categoryGroup } = CategorySorter(themeCategoryList)
    const nullBrandList = []
    const pushBrands = (category) => {
        category?.map((group) => {
            group.childs.map((child) => (
                nullBrandList.push(child.category_name)
            ))
        })
        return nullBrandList
    }
    const [langChipSelected, setLangChipSelected] = useState(0)
    const [textChipSelected, setTextChipSelected] = useState('')

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
                <GuideTitle>
                    위탁센터
                </GuideTitle>
                <img src="/grandparis/cons_info_1.jpg" style={{ width: '1021px', margin: '0 auto' }} />
                <Button variant="outlined" onClick={() => { router.push('../auth/consignment') }} sx={{ width: '200px', height: '50px', margin: '0 auto', marginTop: '50px' }}>
                    위탁 현황 보기
                </Button>
                <img src={logoSrc()} style={{ width: '300px', margin: '70px auto', marginBottom: '0' }} />
                <GuideSubtitle>
                    위탁 절차
                </GuideSubtitle>
                <GuideSubText>
                    간편하고 편리한 위탁 절차 안내
                </GuideSubText>
                <img src="/grandparis/cons_info_2.jpg" style={{ width: '948px', margin: '0 auto' }} />
                <GuideSubtitle>
                    위탁 수수료
                </GuideSubtitle>
                <GuideSubText>
                    합리적인 수준의 수수료 안내
                </GuideSubText>
                <GuideVariable
                    style={{ backgroundImage: `${themeMode == 'dark' ? "" : `url('/grandparis/cons_info_3.png')`}`, width: '1029px', aspectRatio: '1029/367' }}
                >
                    <TableContainer>
                        <Table sx={{ width: '1029px', aspectRatio: '1029/367', maxWidth: '100%' }}>
                            <TableRow sx={{ height: '13%', borderBottom: `${themeMode == 'dark' ? '1px solid red' : ""}` }}>
                                <TableCell sx={{ padding: '0', width: '18%', }} />
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13%',
                                        color: 'white'
                                    }}>20만원 이하</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13%',
                                        color: 'white'
                                    }}>20~300만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '15%',
                                        color: 'white'
                                    }}>300~500만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13.5%',
                                        color: 'white'
                                    }}>500~700만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13.5%',
                                        color: 'white'
                                    }}>700~1000만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '14%',
                                        color: 'white'
                                    }}>1000~4000만원</ChargeTable>
                            </TableRow>
                            <TableRow sx={{ height: '32.5%', borderBottom: `${themeMode == 'dark' ? '1px solid red' : ""}` }}>
                                <ChargeTable
                                    sx={{
                                        width: '18%',
                                    }}>시계/주얼리<br />가방/기타</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13%',
                                    }}>4만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13%',
                                    }}>18%</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '15%',
                                    }}>15%</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13.5%',
                                    }}>13%</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13.5%',
                                    }}>10%</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '14%',
                                    }}>8%</ChargeTable>
                            </TableRow>
                            <TableRow sx={{ height: '9%' }} />
                            <TableRow sx={{ height: '13%', borderBottom: `${themeMode == 'dark' ? '1px solid red' : ""}` }}>
                                <TableCell sx={{ padding: '0', width: '18%', }} />
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13%',
                                        color: 'white'
                                    }}>15만원 이하</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13%',
                                        color: 'white'
                                    }}>15~200만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '15%',
                                        color: 'white'
                                    }}>200~400만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13.5%',
                                        color: 'white'
                                    }}>400~600만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13.5%',
                                        color: 'white'
                                    }}>600~800만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '14%',
                                        color: 'white'
                                    }}>800만원 이상</ChargeTable>
                            </TableRow>
                            <TableRow sx={{ height: '32.5%', borderBottom: `${themeMode == 'dark' ? '1px solid red' : ""}` }}>
                                <ChargeTable
                                    sx={{
                                        width: '18%',
                                    }}>의류/신발</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13%',
                                    }}>4만원</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13%',
                                    }}>20%</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '15%',
                                    }}>18%</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13.5%',
                                    }}>15%</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '13.5%',
                                    }}>13%</ChargeTable>
                                <ChargeTable
                                    themeMode={themeMode}
                                    sx={{
                                        width: '14%',
                                    }}>10%</ChargeTable>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </GuideVariable>
                <div style={{ color: '#F26A1B', fontWeight: 'bold', marginTop: '20px' }}>
                    * 2024년 2월 5일 위탁 건부터 적용
                </div>
                <div>
                    * 고가 제품 위탁 시 수수료 별도 협의
                </div>
                <div>
                    * VIP 위탁자는 특별 할인 수수료 적용
                </div>
                <div>
                    * 신발/의류는 3개월 의무 위탁 기간이 지난 뒤 원활한 판매를 위하여 10%씩 자동 인하를 판매 시까지 진행
                </div>
                <div>
                    (단, 인하된 제품은 상향 조정 불가)
                </div>
                <GuideSubtitle>
                    위탁 송금기간
                </GuideSubtitle>
                <GuideSubText>
                    위탁금 송금 기간 안내
                </GuideSubText>
                <GuideVariable
                    style={{ backgroundImage: `url('/grandparis/cons_info_4.jpg')`, width: '948px', aspectRatio: '948/131' }}
                >
                    {/* */}
                </GuideVariable>
                <GuideSubtitle>
                    위탁기간 및 보관방법
                </GuideSubtitle>
                <GuideSubText>
                    위탁기간 및 보관 방법 안내
                </GuideSubText>
                <GuideVariable
                    style={{ backgroundImage: `url('/grandparis/cons_info_5.jpg')`, width: '951px', aspectRatio: '951/161' }}
                >
                    <TableContainer>
                        <Table sx={{ width: '951px', aspectRatio: '951/161', maxWidth: '100%' }}>
                            <TableRow sx={{ color: `${themeMode == 'dark' ? 'black' : ""}` }}>
                                <MethodTable>
                                    위탁 후<br />최소 3개월 이상
                                </MethodTable>
                                <MethodTable>
                                    위탁 기간 1년 경과 후에도<br />미 판매시, 그랑파리에서<br />적정 가격으로 조정 가능
                                </MethodTable>
                                <MethodTable>
                                    위탁 후 1개월 이내 회수 시에는<br />4만원, 1개월 초과 3개월 이내<br />회수 시에는 2만원의 위약금 부과
                                </MethodTable>
                                <MethodTable>
                                    위탁 후 3개월 이후<br />언제든지 회수 가능
                                </MethodTable>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </GuideVariable>
                <GuideSubtitle>
                    위탁 제한
                </GuideSubtitle>
                <GuideSubText>
                    위탁 제한 안내
                </GuideSubText>
                그랑파리 기준 B등급 이하의 상태로 오염 및 얼룩이 있거나<br />
                브랜드 택/소재 택이 없거나 수선한 제품은 위탁이 불가하며,<br />
                브랜드와 디자인을 선별하여 위탁이 진행됩니다.
                <GuideSubtitle>
                    위탁 브랜드
                </GuideSubtitle>
                <GuideSubText>
                    위탁 가능 브랜드 안내
                </GuideSubText>
                <div style={{ backgroundColor: `${themeMode == 'dark' ? '#222' : '#FAFAFA'}`, padding: '0.5rem' }}>
                    <Row style={{ marginBottom: '1rem' }}>
                        <div style={{ borderRight: `2px solid gray`, marginRight: '0.5rem', flexWrap: 'nowrap' }}>
                            <Chip label={`알파벳순`} variant="soft" sx={{
                                margin: '0.5rem 0.5rem 0.5rem 0',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                color: `${langChipSelected == 0 ? 'white' : ''}`,
                                background: `${langChipSelected == 0 ? 'black' : ''}`,
                                '&:hover': {
                                    color: `${langChipSelected == 0 ? 'white' : ''}`,
                                    background: `${langChipSelected == 0 ? 'black' : ''}`,
                                }
                            }}
                                onClick={() => { setLangChipSelected(0); sort(LANGCODE.ENG); setTextChipSelected(''); }}
                            />
                            <Chip label={`가나다순`} variant="soft" sx={{
                                margin: '0.5rem 0.5rem 0.5rem 0',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                color: `${langChipSelected == 1 ? 'white' : ''}`,
                                background: `${langChipSelected == 1 ? 'black' : ''}`,
                                '&:hover': {
                                    color: `${langChipSelected == 1 ? 'white' : ''}`,
                                    background: `${langChipSelected == 1 ? 'black' : ''}`,
                                }
                            }}
                                onClick={() => { setLangChipSelected(1); sort(LANGCODE.KOR); setTextChipSelected(''); }}
                            />
                        </div>
                        <div style={{ flexWrap: 'wrap' }}>
                            {langChipSelected == 0 ?
                                <>
                                    {alphabetList.map((alphabet) => {
                                        return <>
                                            <Chip
                                                label={alphabet}
                                                variant="soft"
                                                sx={{
                                                    margin: '0.5rem 0.5rem 0.5rem 0',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.7rem',
                                                    cursor: 'pointer',
                                                    color: `${textChipSelected == alphabet ? 'white' : ''}`,
                                                    background: `${textChipSelected == alphabet ? 'black' : ''}`,
                                                    '&:hover': {
                                                        color: `${textChipSelected == alphabet ? 'white' : ''}`,
                                                        background: `${textChipSelected == alphabet ? 'black' : ''}`,
                                                    }
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
                                                    margin: '0.5rem 0.5rem 0.5rem 0',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    color: `${textChipSelected == hangeul ? 'white' : ''}`,
                                                    background: `${textChipSelected == hangeul ? 'black' : ''}`,
                                                    '&:hover': {
                                                        color: `${textChipSelected == hangeul ? 'white' : ''}`,
                                                        background: `${textChipSelected == hangeul ? 'black' : ''}`,
                                                    }
                                                }}
                                                onClick={() => { setTextChipSelected(hangeul); }}
                                            />
                                        </>
                                    })}
                                </>
                            }
                        </div>
                    </Row>
                    <Col style={{
                        minWidth: '100px',
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                        maxHeight: '700px',
                        rowGap: '0.2rem',
                    }}>


                        {categoryGroup.map((group) => {
                            if (textChipSelected == '') {
                                return <>
                                    <Chip label={`[${group.label ? group.label : "#"}]`} variant="soft" sx={{
                                        marginTop: '0.5rem',
                                        cursor: 'pointer', fontWeight: 'bold', background: `${themeDnsData?.theme_css?.main_color}29`, color: `${themeDnsData?.theme_css?.main_color}`, '&:hover': {
                                            color: '#fff',
                                            background: `${themeDnsData?.theme_css?.main_color}`,
                                        }
                                    }} />
                                    <div style={{ borderBottom: `3px solid ${themeDnsData?.theme_css?.main_color}`, width: '150px', marginBottom: '0.5rem' }} />
                                    {
                                        group.childs.map((child) => {
                                            return <Typography variant="body2" style={{ cursor: 'pointer' }} onClick={() => {
                                                router.push(`/shop/items?category_id${index}=${child?.id}&depth=0`)
                                                setOpenAllCategory("")
                                            }}>{langChipSelected == 0 ? child?.category_en_name : child?.category_name}</Typography>
                                        })

                                    }
                                </>
                            }
                            else if (textChipSelected == group?.label) {
                                return <>
                                    <Chip label={`[${group.label ? group.label : "#"}]`} variant="soft" sx={{
                                        marginTop: '0.5rem',
                                        cursor: 'pointer', fontWeight: 'bold', background: `${themeDnsData?.theme_css?.main_color}29`, color: `${themeDnsData?.theme_css?.main_color}`, '&:hover': {
                                            color: '#fff',
                                            background: `${themeDnsData?.theme_css?.main_color}`,
                                        }
                                    }} />
                                    <div style={{ borderBottom: `3px solid ${themeDnsData?.theme_css?.main_color}`, width: '150px', marginBottom: '0.5rem' }} />
                                    {
                                        group.childs.map((child) => {
                                            return <Typography variant="body2" style={{ cursor: 'pointer' }} onClick={() => {
                                                router.push(`/shop/items?category_id${index}=${child?.id}&depth=0`)
                                                setOpenAllCategory("")
                                            }}>{langChipSelected == 0 ? child?.category_en_name : child?.category_name}</Typography>
                                        })
                                    }
                                </>
                            }
                        })}
                    </Col>
                </div>
            </Wrappers>
        </>
    )
}

export default ConsignmentGuide