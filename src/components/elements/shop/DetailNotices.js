import ShippingLine from 'src/components/elements/shop/ShippingLine';
import DeliveryNotice from 'src/components/elements/shop/DeliveryNotice';
import BenefitNotice from 'src/components/elements/shop/BenefitNotice';
import CourierLine from 'src/components/elements/shop/CourierLine';
import { 상세톤 } from 'src/components/elements/shop/detail-tone';

// 상품 가격 아래의 안내 묶음 — 배송비 · 배송 안내 · 혜택을 **한 표로** 그린다.
//
// [왜 묶었나]
// 예전에는 세 줄이 각자 자기 행을 만들었다. 그래서 라벨 칸이 행마다 따로 늘어났고,
// 혜택 라벨이 길어지면 세로줄이 어긋났다(2026-08-28 실측):
//     혜택        (2글자)  라벨칸 52  → 배송비 값 298 / 혜택 값 298   맞음
//     무이자할부   (5글자)  라벨칸 61  → 배송비 값 298 / 혜택 값 307   9px 어긋남
//     카드사혜택안내(7글자)  라벨칸 85  → 배송비 값 298 / 혜택 값 331  33px 어긋남
// 라벨 폭을 숫자로 크게 잡는 건 미봉책이다 — 한 글자만 더 길어지면 다시 어긋나고,
// 그때는 아무도 모른다.
//
// [어떻게]
// 하나의 CSS 그리드에 모든 줄을 넣는다. 첫 칸은 `max-content` 라
// **가장 긴 라벨에 맞춰 모든 행이 함께 정해진다.** 몇 글자가 오든 세로줄이 맞는다.
// 각 컴포넌트는 inGrid 모드에서 자기 행 상자를 만들지 않고 칸만 내놓는다.
//
//     |<- 가장 긴 라벨 만큼 ->|<-간격->|
//     배송비                   5,000원 · 30,000원 이상 무료배송
//                              제주추가 10,000원, 그 외 도서지역 추가 20,000원
//     카드사혜택안내            2026년 07월 카드사 무이자 할부 안내  >
//
// 배송 안내는 라벨이 없으므로 값 칸(2열)에만 놓인다 — 들여쓰기를 따로 계산하지 않는다.
const DetailNotices = ({ item, tone = {}, sx = {}, style = {} }) => {
    const t = { ...상세톤, ...tone };
    return (
        <div
            style={{
                display: 'grid',
                // 최소 labelWidth 는 지키고, 라벨이 그보다 길면 그만큼 늘린다.
                // max-content 만 쓰면 '혜택'(2글자) 같은 짧은 라벨에서 칸이 바짝 붙어
                // 지금까지 보던 여백보다 좁아진다.
                gridTemplateColumns: `minmax(${t.labelWidth}px, max-content) 1fr`,
                columnGap: `${t.gap}px`,
                rowGap: `${t.rowGap}px`,
                alignItems: 'start',
                fontSize: `${t.fontSize}px`,
                lineHeight: t.lineHeight,
                ...style,
                ...sx,
            }}
        >
            <ShippingLine item={item} inGrid tone={tone} />
            <CourierLine inGrid tone={tone} />
            <DeliveryNotice inGrid tone={tone} />
            <BenefitNotice inGrid tone={tone} />
        </div>
    );
};

export default DetailNotices;
