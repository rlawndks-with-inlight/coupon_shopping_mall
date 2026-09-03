import { useRouter } from 'next/router';
import { useLocales } from 'src/locales';

// 찾는 것이 없을 때 보여 줄 안내.
//
// [왜 만들었나 — 2026-08-31]
// 「검색결과가 없습니다.」 라는 문구 자체는 이미 6개 프레임 전부에 있었다. 그런데
// **다음에 무엇을 하면 되는지가 없었다.** 특히 블로그 계열(프레임3~6)은 검색창이
// 서랍(헤더 돋보기) 안에 있어 이 화면에는 안 보인다 — 손님은 빈 화면과 문구 한 줄만 보고
// 어디로 가야 할지 알 수 없다. 인터넷을 잘 모르는 손님에게는 그대로 막다른 길이다.
//
// 그래서 문구는 그대로 두고 **돌아갈 길만 얹는다.** 상품이 아예 없는 몰(등록 전)과
// 검색이 안 걸린 경우는 할 말이 다르므로 문구를 나눈다.
//
// 프레임마다 색·글꼴이 달라 테두리 색을 currentColor 로 두고 배경을 비운다
// (ProductNotFound 와 같은 방식).
const EmptyResult = ({ 전체보기 = false, sx = {}, style = {} }) => {
    const router = useRouter();
    const { translate } = useLocales();

    const 버튼모양 = {
        padding: '11px 20px', fontSize: '14px', cursor: 'pointer',
        border: '1px solid currentColor', borderRadius: '4px',
        background: 'transparent', color: 'inherit', fontFamily: 'inherit',
    };

    return (
        <div
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '8px', textAlign: 'center', ...style, ...sx,
            }}
        >
            <div style={{ fontSize: '15px' }}>
                {전체보기 ? translate('등록된 상품이 없습니다.') : translate('검색결과가 없습니다.')}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.7, lineHeight: 1.7 }}>
                {전체보기
                    ? translate('상품이 준비되는 대로 보여 드릴게요.')
                    : translate('다른 말로 찾아보시거나 전체 상품을 둘러보세요.')}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {!전체보기 && (
                    <button type="button" style={버튼모양} onClick={() => router.push('/shop/items')}>
                        {translate('전체 상품 보기')}
                    </button>
                )}
                {/* ⚠ '/' 가 아니라 '/shop' 이다.
                    루트로 보내면 **본사 ShopGo 랜딩**이 뜬다. 브랜드 주소의 루트를 몰 홈으로
                    돌리는 장치는 두 개인데(next.config 의 rewrite, _app 의 302) **둘 다 서버 쪽**이라
                    router.push 같은 화면 안 이동에는 걸리지 않는다.
                    그래서 주소창에 직접 치면 몰 홈이 뜨는데 이 버튼만 랜딩으로 샜다(2026-09-03 제보).
                    프레임 로고도 전부 '/shop' 을 쓴다 — 같은 곳으로 맞춘다. */}
                <button type="button" style={버튼모양} onClick={() => router.push('/shop')}>
                    {translate('홈으로')}
                </button>
            </div>
        </div>
    );
};

export default EmptyResult;
