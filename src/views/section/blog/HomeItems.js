import styled from 'styled-components'
import { themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/blog/common'
import _ from 'lodash'
import { formatLang } from 'src/utils/format'
import { useLocales } from 'src/locales'

const Wrappers = styled.div`
  width:100%;
  margin:0 auto;
  `

const HomeItems = (props) => {
    const { currentLang } = useLocales();
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
                        <div style={{ fontWeight: 'bold' }}>{formatLang(column, 'title', currentLang)}</div>
                        {column?.sub_title &&
                            <>
                                <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500] }}>{column?.sub_title}</div>
                            </>}
                    </>}
                <div style={{ marginTop: '1rem' }} />
                <Items items={(column?.list ?? [])} router={router} is_slide={column?.list.length >= 5 ? true : false} />
            </Wrappers>
        </>
    )
}
export default HomeItems;