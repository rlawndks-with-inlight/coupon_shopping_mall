import { useLocales } from 'src/locales';
import { commarNumberWithUnit } from 'src/utils/function';
import { 배송비표시, 무료배송안내 } from 'src/utils/shop-util';

// 상품상세의 '배송비' 한 줄. **모든 프레임이 이걸 쓴다.**
//
// [왜 컴포넌트로 뺐나]
// 프레임마다 각자 그리다 보니 같은 값이 다른 문구로 나왔다(2026-08-28 운영 화면 실측):
//     shop-1   배송비: 무료배송
//     shop-2   배송비 2,000원· 100,000원 이상 무료배송     ← 가운뎃점 앞 공백이 없다
//     blog-2   배송비 :무료배송                            ← 콜론 앞에 공백, 뒤에 없다
//     blog-4   배송비 5,000원 · 30,000원 이상 무료배송
//     blog-1   (아무것도 없음)  ← 가맹점이 배송비를 설정해도 손님이 상세에서 볼 수 없었다
// 열 곳에 같은 JSX 를 복붙해 두면 또 갈라진다. 문구는 여기 한 곳에서만 만든다.
//
// [무엇을 보여주나]
//   무료면            무료배송
//   아니면            배송비 5,000원 · 30,000원 이상 무료배송
// 이미 무료인데 '3만원 이상 무료배송' 을 덧붙이지 않는다 — 군더더기다.
// (무료배송안내() 가 그 판단을 이미 하고 있어서 빈 문자열을 준다)
//
// ⚠ 배송비는 상품 테이블의 delivery_fee 가 아니라 **몰 정책**(설정관리 › 배송비설정)을 따른다.
//   정책을 쓰는 몰은 상품별 값이 0 이라, 예전엔 상세에 '배송비 0원' 으로 보이고
//   장바구니에서만 금액이 튀어나왔다. 판정은 shop-util 의 배송비표시() 가 한다.
const 기본톤 = { fontSize: 13, color: '#888', gap: 6 };

// showLabel=false 는 표 형태 프레임용이다(shop-4). 왼쪽 칸이 이미 '배송비' 라서
// 여기서 또 붙이면 '배송비 | 배송비 5,000원' 이 된다. 금액과 무료기준 문구는 그대로 쓴다.
const ShippingLine = ({ item, tone = {}, sx = {}, style = {}, showLabel = true }) => {
    const { translate, currentLang } = useLocales();
    const t = { ...기본톤, ...tone };
    if (!item) return null;

    const 배송 = 배송비표시(item);
    const 안내 = 무료배송안내(item, currentLang?.value);
    const 꾸밈 = { fontSize: `${t.fontSize}px`, color: t.color, marginTop: `${t.gap}px`, ...style, ...sx };

    if (배송.free) return <div style={꾸밈}>{translate('무료배송')}</div>;

    return (
        <div style={꾸밈}>
            {showLabel ? `${translate('배송비')} ` : ''}{commarNumberWithUnit(배송.fee, currentLang?.value)}
            {안내 ? <span> · {안내}</span> : null}
        </div>
    );
};

export default ShippingLine;
