import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/shop/common'
import _ from 'lodash'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSettingsContext } from 'src/components/settings'
import { defaultManagerObj } from 'src/data/manager-data'
import { Icon } from '@iconify/react'

const Wrappers = styled.div`
  width:90%;
  max-width:1400px;
  margin:0 auto;
  `

const CategoryTitle = styled.div`
font-size: ${themeObj.font_size.size3};
font-weight: ${props => props.type == 1 ? 'normal' : 'bold'};
text-align: center;
margin: 0 auto;
font-family: ${props => props.type == 1 ? 'Playfair Display' : ''};
color: ${props => props.type == 1 ? '#5F5F5F' : ''};
font-size: ${props => props.type == 1 ? '36px' : ''};
margin-left: ${props => props.type == 1 ? '0' : ''};
@media (max-width:800px){
    margin-left:0;
}
@media (max-width:500px){
    font-size: 1.2rem;
}
`

const Border = styled.div`
margin-top: 1rem;
height: 0.25rem; 
`

//이 소스에서 themeDnsData 불러올 때 잘못하면 메인페이지 렌더링 오류 생기는 듯

const HomeItemsPropertyGroups = (props) => {
    const { column, data, func, is_manager, demoType } = props;
    const { router } = func;
    const { style } = column;
    const rows = parseInt(style?.rows ?? 1);
    const { themeDnsData } = useSettingsContext()
    /*const [sliderSetting, setSliderSetting] = useState({})
    useEffect(() => {
        const slider_css = themeDnsData?.slider_css
        setSliderSetting(slider_css)
    }, [themeDnsData])*/

    return (
        <>
            <Wrappers style={{
                marginTop: `${style?.margin_top}px`,
                display: 'flex',
                flexDirection: `${column?.title ? 'column' : 'row'}`,
            }}>
                <Row style={{ display: 'flex', position: 'relative' }}>
                    {column?.title &&
                        <>
                            <CategoryTitle type={demoType}>
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
                            {
                                demoType == 0 ? 
                                <Button sx={{ position: 'absolute', right: '0' }} variant='outlined' onClick={() => {
                                    router.push(`/shop/items?not_show_select_menu=1&property_ids0=${parseInt(column?.type.split('items-property-group-')[1])}`)
                                }}>View More</Button>
                                :
                                <Icon icon={'ph:plus-light'} style={{width:'25px', height:'25px', margin:'auto 0', cursor:'pointer'}} />
                            }
                        </>}
                </Row>
                <Border style={{borderTop: `1px solid ${themeObj.grey[300]} `, }} />
                <Items items={column?.list} router={router} is_slide={column?.list.length >= 5 ? true : false} rows={rows} slide_setting={{
                    autoplay: style?.slider_speed > 0 ? true : false,
                    autoplaySpeed: parseInt(style?.slider_speed ?? 0) * 1000 //parseInt 안에 default값을 안 넣으면 0이 들어왔을 때 NaN으로 처리되어 오류 발생
                }} />
                <Border style={{borderTop: `1px solid ${themeObj.grey[300]} `, }} />
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