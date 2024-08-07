import styled from 'styled-components'
import { themeObj } from 'src/components/elements/styled-components'
import { Items, Sellers } from 'src/components/elements/shop/common'
import _ from 'lodash'

const Wrappers = styled.div`
  width:100%;
  margin:0 auto;
  `

const HomeSellers = (props) => {
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
                        <div style={{ fontWeight: 'bold' }}>{column?.title}</div>
                        {column?.sub_title &&
                            <>
                                <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500] }}>{column?.sub_title}</div>
                            </>}
                    </>}
                <div style={{ marginTop: '1rem' }} />
                <Sellers sellers={[...column?.list ?? [],...column?.list ?? [],...column?.list ?? []]} router={router} />
            </Wrappers>
        </>
    )
}
export default HomeSellers;