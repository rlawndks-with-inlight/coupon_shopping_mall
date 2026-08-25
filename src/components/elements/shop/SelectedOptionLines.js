import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { commarNumberWithUnit } from 'src/utils/function';
import { optionExtraPrice, purchaseUnits } from 'src/data/product-options';
import { 줄조작표 } from 'src/utils/shop-util';

// 고른 옵션을 '줄' 로 보여준다. 줄마다 수량을 바꾸고 뺄 수 있다.
//
// [왜]
// 가맹점 제보(2026-08-24): "따로고르기 — 다른 옵션으로 구매시 추가가 되어야 하는데
// 기존 옵션이 사라짐 / 추가옵션 — 1개만 구매가능".
// 예전에는 선택옵션이 드롭다운 하나뿐이라 다른 색을 고르면 앞의 색이 그냥 바뀌었다.
// 이제 다른 조합으로 바꾸는 순간 직전 조합이 이 목록에 한 줄로 쌓인다.
// 드롭다운은 늘 '지금 고른 조합' 을 그대로 보여주고, 그 조합도 이 목록의 마지막 줄로 함께 보인다.
// 줄 수량을 2로 올리면 그 줄에 붙인 추가상품도 함께 2개가 된다.
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
    // 쌓아 둔 줄 + 지금 드롭다운에 떠 있는 조합. 담기가 실제로 만들 목록과 같은 함수를 쓴다 —
    // 화면과 담기는 것이 갈리면 손님이 본 금액과 담긴 금액이 달라진다.
    const 줄들 = purchaseUnits(selected).filter((u) => (u.groups ?? []).length > 0 && u.쌓인줄);
    if (!줄들.length) return null;

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
    // 여기서 따로 더하면 화면과 청구가 갈린다.
    const 줄금액 = (줄) => Math.max(0, (기본가 + optionExtraPrice(product, { groups: 줄.groups })) * (Number(줄.count) || 1));
    const 합계 = 줄들.reduce((a, 줄) => a + 줄금액(줄), 0);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            padding: '0.75rem', borderRadius: '8px', border: '1px solid currentColor', ...style,
        }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{translate('선택한 옵션')}</div>

            {줄들.map((줄) => {
                const 이름들 = (줄.groups ?? []).flatMap((g) =>
                    (g?.options ?? []).map((o) =>
                        `${formatLang(g, 'group_name', currentLang) || g?.group_name || ''} · ${formatLang(o, 'option_name', currentLang) || o?.option_name || o?.value || ''}`));
                const 수량 = Math.max(1, Number(줄.count) || 1);
                return (
                    <div key={줄.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px' }}>
                        <span style={{ flexGrow: 1, wordBreak: 'keep-all', opacity: 0.9 }}>
                            {이름들.join(' / ')}
                        </span>
                        {/* 아직 안 쌓인 줄(= 지금 드롭다운에 떠 있는 조합)은 lines 에 없으므로
                            다른 통로로 보내야 한다. 안 그러면 그 줄만 수량·삭제가 안 먹는다. */}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <button type="button" style={버튼}
                                aria-label={translate('수량 줄이기')}
                                onClick={() => 수량바꾸기(줄, 수량 - 1)}>−</button>
                            <span style={{ minWidth: '20px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{수량}</span>
                            <button type="button" style={버튼}
                                aria-label={translate('수량 늘리기')}
                                onClick={() => 수량바꾸기(줄, 수량 + 1)}>+</button>
                        </span>
                        <span style={{ minWidth: '80px', textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                            {commarNumberWithUnit(줄금액(줄), currentLang)}
                        </span>
                        <button type="button" style={{ ...버튼, border: 'none' }}
                            aria-label={translate('빼기')}
                            onClick={() => 빼기(줄)}>✕</button>
                    </div>
                );
            })}

            <div style={{ borderTop: '1px solid currentColor', opacity: 0.25, margin: '0.15rem 0' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', fontSize: '15px', fontWeight: 700 }}>
                <span style={{ flexGrow: 1 }}>{translate('총 주문금액')}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{commarNumberWithUnit(합계, currentLang)}</span>
            </div>
        </div>
    );
};

export default SelectedOptionLines;
