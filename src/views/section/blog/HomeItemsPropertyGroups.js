import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/blog/common'
import _ from 'lodash'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSettingsContext } from 'src/components/settings'
import { defaultManagerObj } from 'src/data/manager-data'

const Wrappers = styled.div`
  width:100%;
  margin:0 auto;
  `

const CategoryTitle = styled.div`
font-weight: bold;
margin-left:0;
@media (max-width:500px){
    font-size: 1.2rem;
}
`

const HomeItemsPropertyGroups = (props) => {
    const { column, data, func, is_manager } = props;
    const { router } = func;
    const { style } = column;
    const { themeDnsData, themeMode } = useSettingsContext()
    //const [sliderSetting, setSliderSetting] = useState(defaultManagerObj.brands.slider_css)

    return (
        <>
            <Wrappers style={{
                marginTop: `${style?.margin_top}px`,
                display: 'flex',
                // 제목이 없으면 'row'가 되어 Row·Border·Items 가 전부 가로로 붙어 깨졌다.
                // 자식은 세로로 쌓이는 게 맞으므로 제목 유무와 무관하게 'column' 고정.
                flexDirection: 'column',
                /* 메인페이지관리의 배경색상·컨텐츠 개수·상품 설명 배치·슬라이더 속도 네 칸은
                   쇼핑몰형(section/shop/HomeItemsPropertyGroups)에만 전달되고 있었다.
                   블로그형에서는 아무리 바꿔도 화면이 그대로라 가맹점은 자기가 잘못한 줄 안다.
                   상품슬라이드(blog/HomeItems)에서 이미 같은 사고를 고쳤다 — 같은 규칙으로 맞춘다.
                   어두운 테마에서는 배경색을 무시한다(쇼핑몰형과 같다). */
                ...(themeMode != 'dark' && style?.back_color ? { backgroundColor: style.back_color } : {}),
            }}>
                <Row style={{ display: 'flex', position: 'relative' }}>
                    {column?.title &&
                        <>
                            <CategoryTitle>
                                {column?.title}
                            </CategoryTitle>
                            {column?.sub_title &&
                                <>
                                    <div style={{
                                        fontSize: themeObj.font_size.size5,
                                        color: themeObj.grey[500],
                                        textAlign: 'center'
                                    }}>
                                        {column?.sub_title}
                                    </div>
                                </>}
                            <Button sx={{ position: 'absolute', right: '0' }} variant='outlined' onClick={() => {
                                router.push(`/shop/items?not_show_select_menu=1&property_ids0=${parseInt(column?.type.split('items-property-group-')[1])}`)
                            }}>View More</Button>
                        </>}
                </Row>
                <div style={{ marginTop: '1rem', height: '0.25rem', borderTop: `1px solid ${themeDnsData?.theme_css?.main_color} `, borderBottom: `1px solid ${themeDnsData?.theme_css?.main_color} `, }} />
                <Items items={column?.list} router={router} rail
                    rows={parseInt(style?.rows ?? 1)}
                    text_align={style?.text_align}
                    slide_setting={{
                        autoplay: style?.slider_speed > 0 ? true : false,
                        autoplaySpeed: parseInt(style?.slider_speed ?? 0) * 1000
                    }} />
                <div style={{ marginTop: '1rem', height: '0.25rem', borderTop: `1px solid ${themeObj.grey[300]} `, }} />
                {/*<Row>
                    <Button sx={{ margin: '1rem auto' }} variant='outlined' onClick={() => {
                        router.push(`/shop/items?not_show_select_menu=1&property_ids0=${parseInt(column?.type.split('items-property-group-')[1])}`)
                    }}>View More</Button>
                </Row>*/}
            </Wrappers>
        </>
    )
}
export default HomeItemsPropertyGroups;