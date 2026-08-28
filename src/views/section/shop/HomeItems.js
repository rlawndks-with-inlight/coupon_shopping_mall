import styled from 'styled-components'
import { themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/shop/common'
import _ from 'lodash'
import { formatLang } from 'src/utils/format'
import { useLocales } from 'src/locales'
import { useSettingsContext } from 'src/components/settings'

const Wrappers = styled.div`
  width:90%;
  max-width:1600px;
  margin:0 auto;
  `

const HomeItems = (props) => {
    const { currentLang } = useLocales();
    const { themeMode } = useSettingsContext();
    const { column, data, func, is_manager } = props;
    const { router } = func;
    const { style } = column;
    const rows = parseInt(style?.rows ?? 1);

    return (
        <>
            <Wrappers style={{
                marginTop: `${style?.margin_top}px`,
                display: 'flex',
                // 제목이 없으면 'row'가 되어 스페이서 div 옆에 슬라이더가 가로로 붙고,
                // 슬라이더가 폭을 못 잡아 상품이 깨져 보였다. 자식은 [선택적 제목][스페이서][전폭 슬라이더]라
                // 제목 유무와 무관하게 항상 세로로 쌓는 게 맞다.
                flexDirection: 'column',
                // 메인페이지관리의 '배경색상'은 저장만 되고 어디서도 읽지 않았다.
                // 어두운 테마에서는 무시한다(HomeItemsPropertyGroups 와 같은 규칙).
                ...(themeMode != 'dark' && style?.back_color ? { backgroundColor: style.back_color } : {}),
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
                <Items items={column?.list} router={router} is_slide={column?.list.length > 5 ? true : false} rows={rows} text_align={style?.text_align} slide_setting={{
                    autoplay: style?.slider_speed > 0 ? true : false,
                    autoplaySpeed: parseInt(style?.slider_speed ?? 0) * 1000 //parseInt 안에 default값을 안 넣으면 0이 들어왔을 때 NaN으로 처리되어 오류 발생
                }} />
            </Wrappers>
        </>
    )
}
export default HomeItems;