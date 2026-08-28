import { useLocales } from 'src/locales';
import { commarNumberWithUnit } from 'src/utils/function';
import { 배송비표시, 무료배송안내 } from 'src/utils/shop-util';
import { 상세톤 } from 'src/components/elements/shop/detail-tone';

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
//   무료면            무료
//   아니면            5,000원 · 30,000원 이상 무료배송
// 이미 무료인데 '3만원 이상 무료배송' 을 덧붙이지 않는다 — 군더더기다.
// (무료배송안내() 가 그 판단을 이미 하고 있어서 빈 문자열을 준다)
//
// [배치]
// 라벨(배송비)과 내용을 혜택과 **같은 칸 폭**으로 그린다(detail-tone). 그래야 세로줄이 맞는다.
// showLabel=false 는 왼쪽 칸을 프레임이 이미 그리는 표 형태용이다(shop-4·5·9, blog-2).
// 거기서 또 라벨을 붙이면 '배송비 | 배송비 5,000원' 이 된다.
//
// ⚠ 배송비는 상품 테이블의 delivery_fee 가 아니라 **몰 정책**(설정관리 › 배송비설정)을 따른다.
//   정책을 쓰는 몰은 상품별 값이 0 이라, 예전엔 상세에 '배송비 0원' 으로 보이고
//   장바구니에서만 금액이 튀어나왔다. 판정은 shop-util 의 배송비표시() 가 한다.
const ShippingLine = ({ item, tone = {}, sx = {}, style = {}, showLabel = true }) => {
    const { translate, currentLang } = useLocales();
    const t = { ...상세톤, ...tone };

    // 상품이 아직 안 왔으면 아무것도 그리지 않는다.
    //
    // [증상] 상세를 열면 배송비 줄이 잠깐 틀린 값으로 보였다가 바뀐다.
    //   배송비표시() 는 판매가로 무료 여부를 따지는데, 로딩 중에는 그 값이 0 이다.
    //   0 은 무료기준(3만원)에 못 미치므로 '배송비 5,000원 · 30,000원 이상 무료배송' 이 먼저 뜨고,
    //   상품이 도착하면 '무료배송' 으로 바뀐다 — 손님 눈에는 값이 튀는 것으로 보인다.
    //   (2026-08-28 mbc03 운영 화면에서 실제로 관찰했다)
    // 가격이 0 인지로 재지 않는다 — 0원 상품이 정말 있을 수 있고, 그때 배송 안내가 사라진다.
    // '아직 안 왔다' 의 확실한 신호는 id 가 없다는 것이다.
    if (!item?.id) return null;

    const 배송 = 배송비표시(item);
    const 안내 = 무료배송안내(item, currentLang?.value);
    const 값 = 배송.free
        ? translate('무료')
        : <>{commarNumberWithUnit(배송.fee, currentLang?.value)}{안내 ? <span> · {안내}</span> : null}</>;

    // 표 형태 프레임: 값만 넘긴다. 칸 맞추기는 그 프레임이 한다.
    if (!showLabel) return <span style={{ ...style, ...sx }}>{값}</span>;

    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', columnGap: `${t.gap}px`,
            fontSize: `${t.fontSize}px`, lineHeight: t.lineHeight,
            marginTop: `${t.rowGap}px`, ...style, ...sx,
        }}>
            <div style={{ color: t.labelColor, flex: `0 0 ${t.labelWidth}px`, whiteSpace: 'nowrap' }}>
                {translate('배송비')}
            </div>
            <div style={{ color: t.textColor }}>{값}</div>
        </div>
    );
};

export default ShippingLine;
