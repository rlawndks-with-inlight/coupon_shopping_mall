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
// 배송비 줄과 배송 안내가 함께 쓰는 톤. **여기 한 곳에서만 정한다.**
//
// [왜 묶었나] 둘은 화면에서 붙어 있는데 값이 따로 놀았다:
//     배송비 줄   #888 · 줄간격 기본
//     배송 안내   #333 · 줄간격 1.7
//   글자색과 줄간격이 달라 한 묶음이 아니라 서로 다른 것처럼 보였다(가맹점 지적 2026-08-28).
//   키 이름마저 color / textColor 로 달라서, 한쪽만 고치면 또 어긋난다.
//
// #666 은 둘의 가운데다. #888 은 배송 추가비용을 알리기엔 너무 흐리고,
// #333 은 본문만큼 진해서 가격보다 눈에 띈다.
export const 배송톤 = { fontSize: 13, color: '#666', gap: 6, lineHeight: 1.7 };

const 기본톤 = 배송톤;

// showLabel=false 는 표 형태 프레임용이다(shop-4). 왼쪽 칸이 이미 '배송비' 라서
// 여기서 또 붙이면 '배송비 | 배송비 5,000원' 이 된다. 금액과 무료기준 문구는 그대로 쓴다.
const ShippingLine = ({ item, tone = {}, sx = {}, style = {}, showLabel = true }) => {
    const { translate, currentLang } = useLocales();
    const t = { ...기본톤, ...tone };
    // 상품이 아직 안 왔으면 아무것도 그리지 않는다.
    //
    // [증상] 상세를 열면 배송비 줄이 잠깐 틀린 값으로 보였다가 바뀐다.
    //   배송비표시() 는 판매가로 무료 여부를 따지는데, 로딩 중에는 그 값이 0 이다.
    //   0 은 무료기준(3만원)에 못 미치므로 '배송비 5,000원 · 30,000원 이상 무료배송' 이 먼저 뜨고,
    //   상품이 도착하면 '무료배송' 으로 바뀐다 — 손님 눈에는 값이 튀는 것으로 보인다.
    //   (2026-08-28 mbc03 운영 화면에서 실제로 관찰했다)
    // 가격을 알기 전에는 말하지 않는 편이 낫다.
    // 가격이 0 인지로 재지 않는다 — 0원 상품이 정말 있을 수 있고, 그때 배송 안내가 사라진다.
    // '아직 안 왔다' 의 확실한 신호는 id 가 없다는 것이다.
    if (!item?.id) return null;

    const 배송 = 배송비표시(item);
    const 안내 = 무료배송안내(item, currentLang?.value);
    const 꾸밈 = { fontSize: `${t.fontSize}px`, color: t.color, lineHeight: t.lineHeight, marginTop: `${t.gap}px`, ...style, ...sx };

    if (배송.free) return <div style={꾸밈}>{translate('무료배송')}</div>;

    return (
        <div style={꾸밈}>
            {showLabel ? `${translate('배송비')} ` : ''}{commarNumberWithUnit(배송.fee, currentLang?.value)}
            {안내 ? <span> · {안내}</span> : null}
        </div>
    );
};

export default ShippingLine;
