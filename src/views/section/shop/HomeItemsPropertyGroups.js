import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/shop/common'
import _ from 'lodash'
import { Button } from '@mui/material'
import { useEffect, useState } from 'react'

const Wrappers = styled.div`
  width:90%;
  max-width:1600px;
  margin:0 auto;
  `

const HomeItemsPropertyGroups = (props) => {
    const { column, data, func, is_manager } = props;
    const { router } = func;
    const { style } = column;

    return (
        <>
            <Wrappers style={{
                marginTop: `${style?.margin_top}px`,
                display: 'flex',
                flexDirection: `${column?.title ? 'column' : 'row'}`,
            }}>
                {column?.title &&
                    <>
                        <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold', textAlign: 'center' }}>{column?.title}</div>
                        {column?.sub_title &&
                            <>
                                <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500], textAlign: 'center' }}>{column?.sub_title}</div>
                            </>}
                    </>}
                <div style={{ marginTop: '1rem' }} />
                <Items items={column?.list} router={router} is_slide={column?.list.length >= 5 ? true : false} rows={5} />
                <Row>
                    <Button sx={{ margin: '1rem auto' }} variant='outlined' onClick={() => {
                        router.push(`/shop/items?not_show_select_menu=1&property_id=${parseInt(column?.type.split('items-property-group-')[1])}`)
                    }}>View More</Button>
                </Row>
            </Wrappers>
        </>
    )
}
export default HomeItemsPropertyGroups;