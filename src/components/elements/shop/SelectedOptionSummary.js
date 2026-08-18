import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { commarNumber, commarNumberWithUnit } from 'src/utils/function';
import {
    addonGroups, findCombination, isComboMode, isSameGroup, optionExtraPrice, requiredGroups,
} from 'src/data/product-options';

// 고른 옵션과 '실제로 낼 금액' 을 한자리에 모아 보여준다.
//
// 왜 필요한가:
//   상세화면에는 상품가(50,000)와 '조합 추가금 +100,000' 이 따로 떨어져 있었다.
//   둘을 더해 150,000 이라는 걸 손님이 머릿속으로 맞춰야 했고, 그 사이에 옵션칸·입력칸이
//   끼어 있어 눈으로 잇기도 어려웠다. 담기를 누르고 장바구니에 가서야 금액을 알았다.
//
// ⚠ 금액은 반드시 optionExtraPrice 로 구한다. 장바구니·주문서·백엔드(recalcOrderAmount)가
//   전부 같은 규칙을 쓰므로, 여기서 따로 더하면 화면과 청구가 갈린다.
//
// ⚠ 색을 스스로 정하지 않는다. 프레임 11개는 배경이 제각각이라(어두운 파스텔, 흑백 미니멀…)
//   고정색을 쓰면 어느 프레임에선 글자가 배경에 묻는다. currentColor 로 그 프레임 글자색을 따라간다.
// 고른 것을 줄로 편다.
//
// 조합형의 선택옵션은 값이 '조합 추가금' 으로 한 번에 붙으므로 줄에는 이름만 적고
// 금액은 조합 추가금 한 줄로 모은다 — 양쪽에 적으면 두 번 세는 것처럼 보인다.
// 특성처럼 금액과 무관한 그룹은 아예 세지 않는다.
export const 옵션줄 = (product, selected, currentLang) => {
    const 조합형 = isComboMode(product);
    const 필수 = requiredGroups(product);
    const 추가 = addonGroups(product);
    const 줄 = [];
    for (const g of (selected?.groups ?? [])) {
        const 필수그룹 = 필수.some((r) => isSameGroup(r, g));
        const 추가그룹 = 추가.some((r) => isSameGroup(r, g));
        if (!필수그룹 && !추가그룹) continue;
        for (const o of (g?.options ?? [])) {
            const 이름 = formatLang(o, 'option_name', currentLang) || o?.option_name || o?.value;
            if (!이름) continue;
            줄.push({
                그룹: formatLang(g, 'group_name', currentLang) || g?.group_name || '',
                이름,
                금액: (조합형 && 필수그룹) ? null : (Number(o?.option_price) || 0),
                조합: false,
            });
        }
    }
    const 고른조합 = 조합형 ? findCombination(product, selected) : null;
    if (조합형 && 고른조합 && Number(고른조합.add_price) !== 0) {
        줄.push({ 그룹: '', 이름: '', 금액: Number(고른조합.add_price) || 0, 조합: true });
    }
    return 줄;
};

// 요약을 그릴 것이 있는지. 부르는 쪽(ProductAddons)이 빈 상자를 만들지 않도록 같은 계산을 쓴다 —
// 따로 판정하면 '요약은 없는데 여백만 생기는' 어긋남이 난다.
export const hasOptionSummary = (product, selected) => 옵션줄(product, selected).length > 0;

const SelectedOptionSummary = ({ product, selected, style = {} }) => {
    const { translate, currentLang } = useLocales();

    const 줄 = 옵션줄(product, selected, currentLang);
    if (!줄.length) return null;

    const 기본가 = Number(product?.product_sale_price) || Number(product?.product_price) || 0;
    const 옵션가 = optionExtraPrice(product, selected);
    const 수량 = Math.max(1, Number(selected?.count) || 1);
    const 합계 = Math.max(0, (기본가 + 옵션가) * 수량);

    // 단위를 '원' 으로 박지 않는다 — 다른 언어 화면에서 가격만 한국어로 남는다.
    const 금액글 = (n) => `${n > 0 ? '+' : ''}${commarNumberWithUnit(n, currentLang)}`;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.35rem',
            padding: '0.75rem', borderRadius: '8px',
            border: '1px solid currentColor', ...style,
        }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{translate('선택한 옵션')}</div>

            {줄.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '12px', opacity: 0.85 }}>
                    <span style={{ flexGrow: 1, wordBreak: 'keep-all' }}>
                        {r.조합 ? translate('조합 추가금') : `${r.그룹 ? `${r.그룹} · ` : ''}${r.이름}`}
                    </span>
                    {/* 금액이 null 인 줄(조합형 선택옵션)은 칸을 비운다 — 0원으로 적으면 공짜로 읽힌다 */}
                    <span style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        {r.금액 === null ? '' : r.금액 === 0 ? '' : 금액글(r.금액)}
                    </span>
                </div>
            ))}

            <div style={{ borderTop: '1px solid currentColor', opacity: 0.25, margin: '0.15rem 0' }} />

            <div style={{ display: 'flex', fontSize: '12px', opacity: 0.85 }}>
                <span style={{ flexGrow: 1 }}>{translate('상품금액')}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {commarNumberWithUnit(기본가, currentLang)}
                </span>
            </div>
            {옵션가 !== 0 &&
                <div style={{ display: 'flex', fontSize: '12px', opacity: 0.85 }}>
                    <span style={{ flexGrow: 1 }}>{translate('옵션 금액')}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{금액글(옵션가)}</span>
                </div>}
            <div style={{ display: 'flex', alignItems: 'baseline', fontSize: '15px', fontWeight: 700 }}>
                <span style={{ flexGrow: 1 }}>
                    {translate('총 주문금액')}
                    {수량 > 1 &&
                        <span style={{ fontSize: '12px', fontWeight: 400, opacity: 0.7 }}>
                            {` × ${수량}`}
                        </span>}
                </span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {commarNumberWithUnit(합계, currentLang)}
                </span>
            </div>
        </div>
    );
};

export default SelectedOptionSummary;
