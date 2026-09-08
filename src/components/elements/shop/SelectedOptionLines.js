import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { commarNumberWithUnit } from 'src/utils/function';
import { optionExtraPrice, purchaseUnits, requiredGroups } from 'src/data/product-options';
import { 줄조작표 } from 'src/utils/shop-util';

// 고른 옵션을 '줄' 로 보여준다. 줄마다 수량을 바꾸고 뺄 수 있다.
//
// [왜]
// 가맹점 제보(2026-08-24): "따로고르기 — 다른 옵션으로 구매시 추가가 되어야 하는데
// 기존 옵션이 사라짐 / 추가옵션 — 1개만 구매가능".
// 예전에는 선택옵션이 드롭다운 하나뿐이라 다른 색을 고르면 앞의 색이 그냥 바뀌었다.
// 이제 다른 조합으로 바꾸는 순간 직전 조합이 이 목록에 한 줄로 쌓인다.
//
// [추가상품 — 2026-09-09]
// 추가상품은 **제 줄, 제 수량**이다(네이버·카페24 방식). 예전엔 필수 조합 줄 안에 붙어
// 줄 수량에 묶였다 — 갈비 1개에 소스 3개가 불가능했고 "추가옵션 1개만 구매가능" 제보가 그것이었다.
// 줄 순서: 본상품 줄들 → 추가상품 줄들. 추가상품 줄 금액은 추가상품 가격 × 수량뿐이다.
// 필수 옵션이 없는 상품(옵션 없음·추가상품만)은 본상품 줄이 따로 없다(아래 수량칸이 본상품 수량이다) —
// 그때는 본상품을 읽기 전용 한 줄로 보여 준다. 안 그러면 총 주문금액이 추가상품 값만 되어 틀려 보인다.
//
// ⚠ 색·글자크기를 스스로 정하지 않는다. 프레임 11개는 배경이 제각각이라(어두운 파스텔,
//   흑백 미니멀…) 고정색을 쓰면 어느 프레임에선 글자가 배경에 묻는다.
//   currentColor 로 그 프레임 글자색을 따라간다(ProductAddons 와 같은 원칙).
//
// ⚠ 수량·삭제는 onSelect 를 통해 보낸다. 프레임 19곳이 각자 상태를 들고 있어서
//   새 콜백을 배선하면 한 곳만 빠뜨려도 그 화면에서만 안 먹는다.
//   자세한 이유는 utils/shop-util.js 의 selectItemOptionUtil 주석 참고.

const 버튼 = {
    font: 'inherit', color: 'inherit', background: 'none',
    border: '1px solid currentColor', borderRadius: '4px',
    width: '24px', height: '24px', lineHeight: 1, cursor: 'pointer', padding: 0,
};

const SelectedOptionLines = ({ product, selected, onSelect, style = {} }) => {
    const { translate, currentLang } = useLocales();
    // 쌓아 둔 줄 + 추가상품 줄. 담기가 실제로 만들 목록과 같은 함수를 쓴다 —
    // 화면과 담기는 것이 갈리면 손님이 본 금액과 담긴 금액이 달라진다.
    const 단위들 = purchaseUnits(selected);
    const 본줄 = 단위들.filter((u) => !u.addon && (u.groups ?? []).length > 0 && u.쌓인줄);
    const 추가줄 = 단위들.filter((u) => u.addon);
    const 필수없음 = requiredGroups(product).length === 0;
    // 필수 옵션이 없는 상품은 본상품 줄이 안 쌓인다 — 추가상품이 있을 때만 읽기 전용으로 한 줄 보여 준다.
    const 암묵본상품 = (필수없음 && 추가줄.length && !본줄.length)
        ? 단위들.find((u) => !u.addon && !(u.groups ?? []).length) : null;
    if (!본줄.length && !추가줄.length) return null;

    const 보내기 = (op) => onSelect?.({ [줄조작표]: op }, null);
    const 수량바꾸기 = (줄, n) => 보내기(줄.쌓인줄
        ? { type: 'count', key: 줄.key, count: n }
        : { type: 'currentCount', count: n });
    const 빼기 = (줄) => 보내기(줄.쌓인줄
        ? { type: 'remove', key: 줄.key }
        : { type: 'clearCurrent' });
    const 기본가 = Number(product?.product_sale_price) || Number(product?.product_price) || 0;

    // 줄 하나가 실제로 얼마인지. optionExtraPrice 로 구한다 —
    // 장바구니·주문서·백엔드(recalcOrderAmount)가 전부 같은 규칙을 쓰므로
    // 여기서 따로 더하면 화면과 청구가 갈린다. 추가상품 줄은 상품가 없이 추가상품 가격뿐이다.
    const 줄금액 = (줄) => Math.max(0, ((줄.addon ? 0 : 기본가) + optionExtraPrice(product, { groups: 줄.groups })) * (Number(줄.count) || 1));
    const 합계 = [...본줄, ...추가줄, ...(암묵본상품 ? [암묵본상품] : [])].reduce((a, 줄) => a + 줄금액(줄), 0);

    const 옵션이름 = (줄) => (줄.groups ?? []).flatMap((g) =>
        (g?.options ?? []).map((o) =>
            `${formatLang(g, 'group_name', currentLang) || g?.group_name || ''} · ${formatLang(o, 'option_name', currentLang) || o?.option_name || o?.value || ''}`)).join(' / ');

    const 줄그리기 = (줄, { 라벨, 조작 = true }) => {
        const 수량 = Math.max(1, Number(줄.count) || 1);
        return (
            <div key={줄.key ?? 라벨} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px' }}>
                <span style={{ flexGrow: 1, wordBreak: 'keep-all', opacity: 0.9 }}>{라벨}</span>
                {조작 ? (
                    /* 아직 안 쌓인 줄(= 지금 드롭다운에 떠 있는 조합)은 lines 에 없으므로
                       다른 통로로 보내야 한다. 안 그러면 그 줄만 수량·삭제가 안 먹는다. */
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button type="button" style={버튼}
                            aria-label={translate('수량 줄이기')}
                            onClick={() => 수량바꾸기(줄, 수량 - 1)}>−</button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{수량}</span>
                        <button type="button" style={버튼}
                            aria-label={translate('수량 늘리기')}
                            onClick={() => 수량바꾸기(줄, 수량 + 1)}>+</button>
                    </span>
                ) : (
                    <span style={{ minWidth: '20px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>× {수량}</span>
                )}
                <span style={{ minWidth: '80px', textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {commarNumberWithUnit(줄금액(줄), currentLang)}
                </span>
                {조작
                    ? <button type="button" style={{ ...버튼, border: 'none' }} aria-label={translate('빼기')} onClick={() => 빼기(줄)}>✕</button>
                    : <span style={{ width: '24px' }} />}
            </div>
        );
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            padding: '0.75rem', borderRadius: '8px', border: '1px solid currentColor', ...style,
        }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{translate('선택한 옵션')}</div>

            {/* 본상품(필수 옵션이 없는 상품) — 수량은 아래 수량칸이 정하므로 여기서는 읽기만 */}
            {암묵본상품 && 줄그리기(암묵본상품, {
                라벨: formatLang(product, 'product_name', currentLang) || product?.product_name || '', 조작: false,
            })}
            {본줄.map((줄) => 줄그리기(줄, { 라벨: 옵션이름(줄) }))}
            {/* 필수 옵션이 있는데 아직 안 고른 채 추가상품만 있다 — 담기는 막힌다. 왜인지 여기서 알린다 */}
            {!필수없음 && !본줄.length && 추가줄.length > 0 && (
                <div style={{ fontSize: '12px', opacity: 0.75 }}>{translate('옵션을 먼저 골라 주세요.')}</div>
            )}
            {추가줄.map((줄) => 줄그리기(줄, { 라벨: `${translate('추가 상품')} · ${옵션이름(줄)}` }))}

            <div style={{ borderTop: '1px solid currentColor', opacity: 0.25, margin: '0.15rem 0' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', fontSize: '15px', fontWeight: 700 }}>
                <span style={{ flexGrow: 1 }}>{translate('총 주문금액')}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{commarNumberWithUnit(합계, currentLang)}</span>
            </div>
        </div>
    );
};

export default SelectedOptionLines;
