import { Box } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import { 상세톤, 내용들여쓰기 } from 'src/components/elements/shop/detail-tone';

// 상품상세 '배송 안내' — 가맹점이 관리자 '설정관리 › 배송비설정' 탭에서
// setting_obj.delivery_info(리치텍스트)로 넣는다.
//
// ⚠ SHOPGO 하위 전용이다. BenefitNotice·이용가이드 등과 같은 이유로(is-shopgo.js 주석),
//   다른 클라이언트(별도 포크) 몰에는 표시하지 않는다 — 그 몰이 값을 넣어도 렌더하지 않는다.
//
// 혜택(BenefitNotice) 바로 아래에 두는 것을 기본으로 하고, 혜택 UI 가 없는 프레임에선
// 단독으로 가격/배송 묶음 아래에 둔다. 톤(색·글자크기)은 프레임이 준 값을 그대로 따른다.
// 비어 있으면(<p><br></p>·&nbsp; 등) 아무것도 그리지 않는다.
// 톤은 배송비·혜택과 **같은 값**을 쓴다(detail-tone). 셋이 한 표처럼 붙어 있어서
// 글자색·줄간격·칸 폭이 다르면 따로 노는 것처럼 보인다.
// textColor 는 예전 이름이라 계속 받아 준다 — 넘어오면 그게 이긴다.
const 기본톤 = 상세톤;

const DeliveryNotice = ({ tone = {}, sx = {}, topGap = false, indent, inGrid = false }) => {
    const { themeDnsData } = useSettingsContext();
    const t = { ...기본톤, ...tone };
    const 들여 = indent === undefined ? 내용들여쓰기(t) : indent;
    const html = themeDnsData?.setting_obj?.delivery_info ?? '';
    const has = /<img/i.test(html)
        || html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim().length > 0;

    if (!isShopgoBrand(themeDnsData) || !has) return null;

    return (
        <Box
            sx={{
                // 그리드 모드에서는 값 칸(2열)에 놓인다 — 여백·들여쓰기는 그리드가 정한다.
                ...(inGrid
                    ? { gridColumn: 2 }
                    : { mt: topGap ? `${t.rowGap + 4}px` : `${t.rowGap}px`, ml: `${들여}px` }),
                fontSize: `${t.fontSize}px`,
                color: t.textColor,
                lineHeight: t.lineHeight,
                wordBreak: 'keep-all',
                '& img': { maxWidth: '100%', height: 'auto' },
                '& p': { margin: '0 0 4px' },
                '& table': { width: '100%', borderCollapse: 'collapse' },
                ...sx,
            }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

export default DeliveryNotice;
