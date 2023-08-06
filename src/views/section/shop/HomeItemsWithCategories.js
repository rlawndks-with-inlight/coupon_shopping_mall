import styled from 'styled-components'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/shop/common'
import { Button } from '@mui/material'
import _ from 'lodash'
const Wrappers = styled.div`
  width:90%;
  max-width:1200px;
  margin:0 auto;
  `

const HomeItemsWithCategories = (props) => {
    const { column, data, func } = props;
    let { idx, itemsCategory } = data;
    const { router, onClickItemsCategory } = func;
    return (
        <>
            <Wrappers style={{
                marginTop: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: `${column?.title ? 'column' : 'row'}`,
            }}>
                <Row style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Row style={{ flexDirection: 'column' }}>
                        {column?.title &&
                            <>
                                <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold' }}>{column?.title}</div>
                                {column?.sub_title &&
                                    <>
                                        <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500] }}>{column?.sub_title}</div>
                                    </>}
                            </>}
                    </Row>
                    <Row style={{ marginLeft: 'auto', columnGap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {column?.list && column?.list.map((item, index) => (
                            <>
                                <Button variant={itemsCategory[idx] == index ? `contained` : `outlined`} sx={{ height: '36px' }} onClick={() => {
                                    onClickItemsCategory(idx, index);
                                }}>
                                    {item?.category_name}
                                </Button>
                            </>
                        ))}
                    </Row>
                </Row>
                <div style={{ marginTop: '1rem' }} />
                {column?.list && column?.list.map((item, index) => (
                    <>
                        {itemsCategory[idx] == index &&
                            <>
                                <Items items={item?.list} router={router} />
                            </>}
                    </>
                ))}
            </Wrappers>
        </>
    )
}
export default HomeItemsWithCategories;