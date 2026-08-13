import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { commarNumber } from 'src/utils/function';
import { addonGroups, isOptionSoldOut, isSameGroup } from 'src/data/product-options';

// 추가상품 — 안 골라도 살 수 있는 것. 여러 개 고를 수 있고 다시 누르면 빠진다.
//
// 왜 필요한가:
//   지금까지 옵션그룹은 '그룹마다 반드시 1개'가 강제였다. 그래서
//   '한복 +10,000 / 성장영상 +45,000 / 작가스냅 +300,000' 을 각각 선택지 1개짜리
//   그룹으로 만든 가맹점의 상품은 355,000원을 붙이지 않으면 아예 살 수 없었다.
//   가맹점이 원한 건 옵션이 아니라 추가상품이었다.
//
// ⚠ 색을 스스로 정하지 않는다. 프레임 11개는 배경이 제각각이라(어두운 파스텔, 흑백 미니멀…)
//   고정색을 쓰면 어느 프레임에선 글자가 배경에 묻는다. currentColor 로 그 프레임 글자색을 따라간다.
const ProductAddons = ({ product, selected, onSelect, style = {} }) => {
    const { translate, currentLang } = useLocales();
    const 추가 = addonGroups(product);
    if (!추가.length) return null;

    const 골랐나 = (group, option) =>
        ((selected?.groups ?? []).find((g) => isSameGroup(g, group))?.options ?? [])
            .some((o) => String(o?.id) === String(option?.id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', ...style }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>
                {translate('추가 상품')}
                {/* 안 골라도 된다는 것을 반드시 알려야 한다 — 예전 구조에선 전부 필수였다 */}
                <span style={{ fontSize: '11px', fontWeight: 400, marginLeft: '6px', opacity: 0.7 }}>
                    {translate('필요한 것만 고르세요')}
                </span>
            </div>
            {추가.map((group) => (
                <div key={group?.id ?? group?.group_name}>
                    <div style={{ fontSize: '12px', opacity: 0.75, marginBottom: '4px' }}>
                        {formatLang(group, 'group_name', currentLang)}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(group?.options ?? []).map((option) => {
                            const 품절 = isOptionSoldOut(option);
                            const 켜짐 = 골랐나(group, option);
                            return (
                                <button
                                    key={option?.id}
                                    type="button"
                                    disabled={품절}
                                    onClick={() => onSelect?.(group, option, true)}
                                    style={{
                                        font: 'inherit',
                                        fontSize: '12px',
                                        color: 'inherit',
                                        padding: '5px 10px',
                                        borderRadius: '999px',
                                        cursor: 품절 ? 'not-allowed' : 'pointer',
                                        opacity: 품절 ? 0.4 : 1,
                                        border: '1px solid currentColor',
                                        // 선택은 테두리 굵기와 옅은 배경으로만 나타낸다.
                                        // 배경을 진하게 칠하면 프레임마다 글자가 안 보이는 곳이 생긴다.
                                        borderWidth: 켜짐 ? '2px' : '1px',
                                        background: 켜짐 ? 'rgba(127,127,127,0.18)' : 'transparent',
                                        fontWeight: 켜짐 ? 700 : 400,
                                    }}
                                >
                                    {formatLang(option, 'option_name', currentLang)}
                                    {Number(option?.option_price)
                                        ? ` ${Number(option.option_price) > 0 ? '+' : ''}${commarNumber(option.option_price)}` : ''}
                                    {품절 ? ` (${translate('품절')})` : ''}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductAddons;
