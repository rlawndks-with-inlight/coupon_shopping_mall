import styled from 'styled-components'
import { themeObj } from 'src/components/elements/styled-components'
import { Items } from 'src/components/elements/blog/common'
import _ from 'lodash'
import { formatLang } from 'src/utils/format'
import { useLocales } from 'src/locales'
import { useSettingsContext } from 'src/components/settings'

const Wrappers = styled.div`
  width:100%;
  margin:0 auto;
  `

const HomeItems = (props) => {
    const { currentLang } = useLocales();
    const { themeMode } = useSettingsContext();
    const { column, data, func, is_manager, } = props;
    const { idx } = data;
    const { router } = func;
    const { style } = column;

    return (
        <>
            <Wrappers style={{
                marginTop: `${style?.margin_top}px`,
                display: 'flex',
                // 제목이 없으면 'row'가 되어 스페이서 div 옆에 슬라이더가 가로로 붙고,
                // 슬라이더가 폭을 못 잡아 상품이 깨져 보였다. 자식은 [선택적 제목][스페이서][전폭 슬라이더]라
                // 제목 유무와 무관하게 항상 세로로 쌓는 게 맞다.
                flexDirection: 'column',
                letterSpacing: '-1px',
                // 메인페이지관리의 '배경색상'은 저장만 되고 어디서도 읽지 않았다.
                // 어두운 테마에서는 무시한다(HomeItemsPropertyGroups 와 같은 규칙).
                ...(themeMode != 'dark' && style?.back_color ? { backgroundColor: style.back_color } : {}),
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
                {/* 메인페이지관리의 '컨텐츠 개수·상품 설명 배치·슬라이더 속도' 세 입력은
                    쇼핑몰형(section/shop/HomeItems)에만 전달되고 있어서, blog demo 1·2 에서는
                    아무리 바꿔도 화면이 그대로였다. 쇼핑몰형과 같은 규칙으로 넘긴다. */}
                <Items items={(column?.list ?? [])} router={router} is_slide={column?.list.length >= 5 ? true : false} type={1} length={column?.list?.length} idx={idx}
                    rows={parseInt(style?.rows ?? 1)}
                    text_align={style?.text_align}
                    slide_setting={{
                        autoplay: style?.slider_speed > 0 ? true : false,
                        autoplaySpeed: parseInt(style?.slider_speed ?? 0) * 1000
                    }} />
            </Wrappers>
        </>
    )
}
export default HomeItems;