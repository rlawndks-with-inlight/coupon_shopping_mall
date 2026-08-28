import styled from 'styled-components'
import { themeObj } from 'src/components/elements/styled-components'
import { Sellers } from 'src/components/elements/shop/common'
import _ from 'lodash'

const Wrappers = styled.div`
  width:90%;
  max-width:1600px;
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
                // 제목이 없으면 'row'가 되어 스페이서 div 옆에 슬라이더가 가로로 붙어 깨졌다.
                // 제목 유무와 무관하게 세로로 쌓는 게 맞다('column' 고정).
                flexDirection: 'column',
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
                {/* 예전엔 리스트를 3배 복제해 넘겼다(죽은 슬라이더를 채우려던 잔재).
                    같은 판매자가 3번 반복 노출됐다 — 원본 그대로 한 번만 넘긴다. */}
                <Sellers sellers={column?.list ?? []} router={router} />
            </Wrappers>
        </>
    )
}
export default HomeSellers;