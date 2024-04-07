import styled from 'styled-components'
import { themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/shop/common'
import _ from 'lodash'
import { formatLang } from 'src/utils/format'
import { useLocales } from 'src/locales'

const Wrappers = styled.div`
  width:90%;
  max-width:1600px;
  margin:0 auto;
  `

const HomeItems = (props) => {
    const { currentLang } = useLocales();
    const { column, data, func, is_manager } = props;
    const { router } = func;
    const { style } = column;
    const rows = parseInt(style?.rows ?? 1);

    return (
        <>
            <Wrappers style={{
                marginTop: `${style?.margin_top}px`,
                display: 'flex',
                flexDirection: `${column?.title ? 'column' : 'row'}`,
            }}>
                {column?.title &&
                    <>
                        <div style={{ fontSize: themeObj.font_size.size3, fontWeight: 'bold' }}>{formatLang(column, 'title', currentLang)}</div>
                        {column?.sub_title &&
                            <>
                                <div style={{ fontSize: themeObj.font_size.size5, color: themeObj.grey[500] }}>{column?.sub_title}</div>
                            </>}
                    </>}
                <div style={{ marginTop: '1rem' }} />
                <Items items={column?.list} router={router} is_slide={column?.list.length >= 5 ? true : false} rows={rows} text_align={style?.text_align} slide_setting={{
                    autoplay: style?.slider_speed > 0 ? true : false,
                    autoplaySpeed: parseInt(style?.slider_speed ?? 0) * 1000 //parseInt 안에 default값을 안 넣으면 0이 들어왔을 때 NaN으로 처리되어 오류 발생
                }} />
            </Wrappers>
        </>
    )
}
export default HomeItems;