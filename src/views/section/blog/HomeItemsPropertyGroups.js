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
    const { themeDnsData } = useSettingsContext()
    //const [sliderSetting, setSliderSetting] = useState(defaultManagerObj.brands.slider_css)

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
                <Items items={column?.list} router={router} is_slide={column?.list.length >= 5 ? true : true} />
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