import styled from 'styled-components'
import { themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/shop/common'
import _ from 'lodash'

const Wrappers = styled.div`
  width:90%;
  max-width:1200px;
  margin:0 auto;
  `

const HomeItems = (props) => {
    const { column, data, func } = props;
    const { router } = func;

    return (
        <>
            <Wrappers style={{
                marginTop: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: `${column?.title ? 'column' : 'row'}`,
            }}>
                {column?.title &&
                    <>
                        <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold' }}>{column?.title}</div>
                        {column?.sub_title &&
                            <>
                                <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500] }}>{column?.sub_title}</div>
                            </>}
                    </>}
                <div style={{ marginTop: '1rem' }} />
                <Items items={column?.list} router={router} is_slide={column?.list.length >= 4 ? true : false} />
            </Wrappers>
        </>
    )
}
export default HomeItems;