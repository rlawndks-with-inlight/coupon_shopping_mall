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
    const { column, data, func, is_manager, } = props;
    const { idx } = data;
    const { router } = func;
    const { style } = column;

    return (
        <>
            <Wrappers style={{
                marginTop: `${style?.margin_top}px`,
                display: 'flex',
                flexDirection: `${column?.title ? 'column' : 'row'}`,
                letterSpacing: '-1px'
            }}>
                {column?.title &&
                    <>
                        <div style={{ fontWeight: 'bold', fontSize: '22px' }}>{formatLang(column, 'title', currentLang)}</div>
                        {column?.sub_title &&
                            <>
                                <div style={{ fontSize: '14px', color: '#666666' }}>{column?.sub_title}</div>
                            </>}
                    </>}
                <div style={{ marginTop: '1rem' }} />
                <Items items={(column?.list ?? [])} router={router} is_slide={column?.list.length >= 5 ? true : false} type={1} length={column?.list?.length} idx={idx} />
            </Wrappers>
        </>
    )
}
export default HomeItems;