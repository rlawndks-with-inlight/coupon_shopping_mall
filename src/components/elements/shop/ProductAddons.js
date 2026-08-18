import { useRouter } from 'next/router';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { commarNumber } from 'src/utils/function';
import { addonGroups, isOptionSoldOut, isSameGroup } from 'src/data/product-options';
import SelectedOptionSummary, { hasOptionSummary } from './SelectedOptionSummary';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';

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
    const router = useRouter();
    // 한정 상품은 회원만 살 수 있다. 그런데 '회원만 구매할 수 있습니다' 만 적혀 있어서
    // 비회원에게는 막다른 길이었다 — 어디로 가야 하는지 알려주지 않았다.
    // 로그인 뒤 보던 상품으로 돌아오도록 redirect 를 붙인다(login.js 가 safeRedirectPath 로 받는다).
    // isInitialized 를 함께 본다. 초기화 전에는 user 가 비어 있어서, 그것만 보면
    // 로그인한 손님에게도 '로그인하기' 가 잠깐 깜빡인다.
    const { user, isInitialized } = useAuthContext();
    const 로그인안함 = isInitialized && !user?.id;
    const 추가 = addonGroups(product);
    // 한정판 안내도 여기서 그린다. 이 컴포넌트가 **프레임 11개 전부**에 들어가 있어서,
    // 따로 만들면 프레임마다 또 배선해야 하고 한 곳만 빠뜨리면 그 프레임에서만 안 뜬다.
    const 한정 = Number(product?.purchase_limit) > 0 ? Number(product.purchase_limit) : 0;
    // 고른 옵션·최종금액 요약도 여기서 그린다.
    // 이 컴포넌트가 **프레임 11개 전부**에 들어가 있어서, 요약을 따로 배선하면
    // 프레임마다 또 붙여야 하고 한 곳만 빠뜨리면 그 프레임에서만 금액이 안 보인다.
    // (추가상품 취소가 프레임 7개에서 안 되던 것과 같은 부류의 사고를 미리 막는다)
    const 요약있음 = hasOptionSummary(product, selected);
    if (!추가.length && !한정 && !요약있음) return null;

    const 골랐나 = (group, option) =>
        ((selected?.groups ?? []).find((g) => isSameGroup(g, group))?.options ?? [])
            .some((o) => String(o?.id) === String(option?.id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', ...style }}>
            {/* 한정판 — 담기 전에 알려야 한다. 담아 놓고 결제 직전에 막히면 그게 더 나쁘다. */}
            {한정 > 0 &&
                <div style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.6 }}>
                    <b>{translate('한정 상품')}</b>{' · '}
                    {translate('1인 {{n}}개까지 구매할 수 있습니다.', { n: 한정 })}<br />
                    {/* 안내 문장은 늘 보여 준다 — 로그인 여부와 상관없이 이 상품의 사실이고,
                        조건에 따라 문장이 생겼다 사라지면 화면이 깜빡인다.
                        비회원에게만 갈 곳을 덧붙인다. */}
                    {translate('회원만 구매할 수 있습니다.')}
                    {로그인안함 && <>
                        {' '}
                        {/* 색을 정하지 않는다. 프레임 11개의 배경이 제각각이라 고정색은 어딘가에서 묻는다.
                            밑줄과 굵기로만 링크임을 밝힌다(추가상품 버튼과 같은 원칙). */}
                        <button
                            type="button"
                            onClick={() => router.push(`/shop/auth/login?redirect=${encodeURIComponent(router.asPath)}`)}
                            style={{
                                font: 'inherit', fontSize: '12px', color: 'inherit',
                                background: 'none', border: 'none', padding: 0,
                                fontWeight: 700, textDecoration: 'underline', cursor: 'pointer',
                            }}
                        >
                            {translate('로그인하기')}
                        </button>
                    </>}
                </div>}
            {추가.length > 0 && <>
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
            </>}

            {/* 고른 옵션과 실제로 낼 금액. 상품가와 '조합 추가금' 이 따로 떨어져 있어
                손님이 머릿속으로 더해야 했다(50,000 + 100,000 = 얼마?). */}
            {요약있음 && <SelectedOptionSummary product={product} selected={selected} />}
        </div>
    );
};

export default ProductAddons;
