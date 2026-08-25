import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { commarNumber } from 'src/utils/function';
import { addonGroups, isOptionSoldOut, isSameGroup } from 'src/data/product-options';
import { 줄조작표 } from 'src/utils/shop-util';
import SelectedOptionSummary, { hasOptionSummary } from './SelectedOptionSummary';
import SelectedOptionLines from './SelectedOptionLines';
import { isRequiredComplete, purchaseUnits, requiredGroups } from 'src/data/product-options';
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
    // ── 골라야 할 것을 다 고르면 한 줄로 확정하고, 드롭다운을 비운다 ────
    //
    // [왜 여기인가]
    // 프레임마다 옵션 UI 를 따로 그린다. 공용 ProductOptions 를 쓰는 화면은 둘뿐이고
    // (프레임1·2) 블로그 계열은 각자 <select> 를 그려 onSelectOption 을 부른다.
    // 그 19곳에 인자를 하나 더 넘기게 하면 한 곳만 빠뜨려도 그 화면에서만 안 먹는다 —
    // 예전에 추가상품 인자를 그렇게 놓쳐 7개 프레임에서 추가상품을 못 뺐다.
    // 이 컴포넌트는 **프레임 11개 전부**에 들어가 있고 product 와 selected 를 둘 다 받는다.
    //
    // [왜 '완성되는 순간' 인가]
    // '다른 조합으로 바뀔 때 직전 것을 쌓는' 방식도 만들어 봤는데 버렸다.
    // 드롭다운을 하나씩 바꾸면 중간 조합(크기만 바꾼 상태)이 **손님이 원한 적 없는 줄**로
    // 쌓인다. 장바구니에 없던 물건이 늘어나는 것이라 화면이 지저분한 것보다 훨씬 나쁘다.
    //
    // [드롭다운 비우기]
    // 프레임들의 <select> 는 defaultValue 로 그린 **비제어 요소**라 상태를 비워도
    // 화면에는 방금 고른 값이 남는다. 값은 비었는데 골라진 것처럼 보이고,
    // 같은 것을 다시 고르면 onChange 가 안 나서 되담을 수도 없다.
    // 프레임 19곳을 고치는 대신 여기서 한 번에 되돌린다 —
    // **이 상품의 필수 옵션 이름을 가진 select 만** 골라서 건드린다(다른 select 는 그대로).
    const 완성됨 = isRequiredComplete(product, selected?.groups);
    useEffect(() => {
        if (!완성됨) return;
        onSelect?.({ [줄조작표]: { type: 'close' } }, null);
        try {
            const 필수이름 = new Set(
                requiredGroups(product).flatMap((g) => (g?.options ?? [])
                    .map((o) => String(o?.option_name ?? '').trim()).filter(Boolean)));
            if (!필수이름.size) return;
            for (const sel of document.querySelectorAll('select')) {
                const 이상품것 = [...sel.options].some((o) => {
                    // 화면은 '중 (+1,000원)' 처럼 금액을 덧붙여 그린다 — 앞부분으로 맞춘다.
                    const t = String(o.textContent ?? '').trim();
                    for (const 이름 of 필수이름) if (t === 이름 || t.startsWith(이름 + ' ')) return true;
                    return false;
                });
                if (이상품것) sel.selectedIndex = 0;
            }
        } catch (e) { /* 화면 되돌리기 실패가 구매를 막으면 안 된다 */ }
    }, [완성됨]);

    const 요약있음 = hasOptionSummary(product, selected);
    // 확정된 줄이 있으면 줄 목록을 그린다(요약 대신).
    // 요약은 '지금 고르는 중인 조합 하나'를 보여주는 것이라, 줄이 쌓인 뒤에도 같이 띄우면
    // 같은 금액이 두 번 적힌 것처럼 보인다.
    const 줄있음 = purchaseUnits(selected).some((u) => u.쌓인줄);
    if (!추가.length && !한정 && !요약있음 && !줄있음) return null;

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
            {줄있음
                ? <SelectedOptionLines product={product} selected={selected} onSelect={onSelect} />
                : (요약있음 && <SelectedOptionSummary product={product} selected={selected} />)}
        </div>
    );
};

export default ProductAddons;
