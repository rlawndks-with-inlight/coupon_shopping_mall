import { useRouter } from 'next/router';
import { useLocales } from 'src/locales';

// 없는 상품 주소로 들어왔을 때 보여 줄 화면.
//
// [왜 필요한가 — 2026-08-30 판매 중인 6개 프레임 전부 확인]
// 지운 상품 주소나 오래된 링크(카톡으로 받은 주소 등)로 들어오면 프레임마다 이랬다.
//   · 프레임1·2 : 화면이 통째로 죽고 **「Application error: a client-side exception has occurred」**
//                 영어 한 줄만 떴다. 빠져나갈 버튼도 없어 뒤로가기 말고는 방법이 없었다.
//   · 프레임5·6 : **「Loading...」 에서 영원히 멈췄다**(영어).
//   · 프레임3·4 : 값이 하나도 없는 빈 상세 껍데기가 그려졌다.
// 셋 다 손님은 무슨 일이 났는지 알 수 없고, 특히 앞의 둘은 몰이 고장난 것처럼 보인다.
//
// 그래서 여섯 프레임이 같은 안내를 쓰게 한다 — 무슨 일인지 한국어로 말하고,
// **돌아갈 길을 반드시 준다.** 프레임마다 색·글꼴이 다르므로 테두리 없이 글과 버튼만 둔다.
const ProductNotFound = ({ sx = {}, style = {} }) => {
    const router = useRouter();
    const { translate } = useLocales();

    return (
        <div
            style={{
                minHeight: '46vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '48px 24px',
                textAlign: 'center',
                ...style,
                ...sx,
            }}
        >
            <div style={{ fontSize: '17px', fontWeight: 600 }}>
                {translate('상품을 찾을 수 없습니다.')}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.7, lineHeight: 1.7 }}>
                {translate('판매가 끝났거나 주소가 잘못되었습니다.')}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                    type="button"
                    onClick={() => router.push('/shop/items')}
                    style={{
                        padding: '11px 20px', fontSize: '14px', cursor: 'pointer',
                        border: '1px solid currentColor', borderRadius: '4px',
                        background: 'transparent', color: 'inherit', fontFamily: 'inherit',
                    }}
                >
                    {translate('다른 상품 보기')}
                </button>
                {/* ⚠ '/' 가 아니라 '/shop' 이다.
                    루트로 보내면 **본사 ShopGo 랜딩**이 뜬다. 브랜드 주소의 루트를 몰 홈으로
                    돌리는 장치는 두 개인데(next.config 의 rewrite, _app 의 302) **둘 다 서버 쪽**이라
                    router.push 같은 화면 안 이동에는 걸리지 않는다.
                    그래서 주소창에 직접 치면 몰 홈이 뜨는데 이 버튼만 랜딩으로 샜다(2026-09-03 제보).
                    프레임 로고도 전부 '/shop' 을 쓴다 — 같은 곳으로 맞춘다. */}
                <button
                    type="button"
                    onClick={() => router.push('/shop')}
                    style={{
                        padding: '11px 20px', fontSize: '14px', cursor: 'pointer',
                        border: '1px solid currentColor', borderRadius: '4px',
                        background: 'transparent', color: 'inherit', fontFamily: 'inherit',
                    }}
                >
                    {translate('홈으로')}
                </button>
            </div>
        </div>
    );
};

export default ProductNotFound;
