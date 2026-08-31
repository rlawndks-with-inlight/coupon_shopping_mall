import { useLocales } from 'src/locales';
import { getLocalStorage } from 'src/utils/local-storage';
import { 기본택배사 } from 'src/data/couriers';
import { 상세톤 } from 'src/components/elements/shop/detail-tone';

// 상품 상세에 「택배사」 한 줄을 더한다.
//
// [왜]
// 가맹점이 설정관리 › 배송비설정에서 「기본 택배사」를 정해 두면, 지금까지는 그 값이
// **주문관리에서 송장을 넣을 때만** 쓰였다. 정작 손님은 무엇으로 오는지 알 수 없었다.
// 늘 같은 택배사를 쓰는 몰이라면 손님이 미리 아는 편이 낫다 —
// 부재 시 어디에 맡겨지는지, 집하지역인지 같은 판단이 택배사에 따라 달라진다.
//
// [보이는 조건] 기본 택배사를 정해 둔 몰에서만 나온다. 정하지 않았으면 줄 자체가 없다.
//   (COURIER_LIST 에 없는 값이 저장돼 있으면 기본택배사() 가 빈 문자열을 준다)
//
// ⚠ 주문마다 택배사를 바꿀 수 있으므로 '늘 이 택배사' 라고 단정하지 않는다.
//   그래서 라벨은 「택배사」이고 값만 적는다.
const CourierLine = ({ tone = {}, sx = {}, style = {}, inGrid = false }) => {
    const { translate } = useLocales();
    const t = { ...상세톤, ...tone };

    let dns = null;
    try {
        dns = JSON.parse(getLocalStorage('themeDnsData') || '{}');
    } catch (e) {
        dns = null;
    }
    const 택배사 = 기본택배사(dns);
    if (!택배사) return null;

    const 라벨칸 = (
        <div style={{ color: t.labelColor, whiteSpace: 'nowrap' }}>{translate('택배사')}</div>
    );
    const 값칸 = <div style={{ color: t.textColor }}>{택배사}</div>;

    if (inGrid) return <>{라벨칸}{값칸}</>;

    return (
        <div
            style={{
                display: 'flex',
                gap: `${t.gap}px`,
                fontSize: `${t.fontSize}px`,
                lineHeight: t.lineHeight,
                ...style,
                ...sx,
            }}
        >
            <div style={{ flex: `0 0 ${t.labelWidth}px` }}>{라벨칸}</div>
            {값칸}
        </div>
    );
};

export default CourierLine;
