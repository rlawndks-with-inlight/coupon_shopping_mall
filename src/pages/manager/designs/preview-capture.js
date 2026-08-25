import { useRouter } from 'next/router';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import HomeItemHero from 'src/views/section/shop/HomeItemHero';
import { HERO_TYPES, 견본상품 } from 'src/data/section-preview';

// 관리자 화면에 넣을 '디자인 타입 미리보기' 이미지를 만들기 위한 캡처 전용 화면.
//
// [왜 이런 화면을 두나]
// 가맹점 요청(2026-08-24): "가맹점에서는 타입만 가지고 정확한 이미지를 알기 어렵습니다.
// 각 타입별로 이미지화 해서 보여줄 수 있게 요청 드립니다."
//
// 손으로 캡처하지 않는다. 타입이 늘거나 디자인이 바뀌면 스크립트만 다시 돌리면 되어야 한다
// (매니저 가이드 스크린샷 30장도 scripts/guide-pdf 가 같은 방식으로 만든다).
//
// [왜 실제 몰을 안 쓰나]
// 실제 가맹점 몰에 섹션을 넣었다 빼며 찍으면 그 몰 홈이 잠깐 바뀐다.
// 여기서 찍으면 아무 몰도 건드리지 않고, 타입이 늘어도 이 화면에 추가만 하면 된다.
//
// ⚠ ?type=N 이면 그 타입 **하나만** 그린다. 캡처 스크립트가 그렇게 부른다.
//   여덟 개를 한 화면에 쌓아 두고 찍었더니 아래쪽 타입의 사진이 비어 나왔다 —
//   섹션 렌더러들이 LazyLoadImage 를 써서 화면에 들어와야 사진을 불러오는데,
//   스크롤로 훑어도 마지막 타입은 끝내 안 실렸다.
//   하나씩 그리면 늘 화면 안에 있으므로 그 문제가 아예 없어진다.
//
// ⚠ 좌측 메뉴에 넣지 않는다(config-navigation 에 없다). 가맹점이 볼 화면이 아니다.
//
// 만드는 법: node scripts/section-preview/capture.cjs
const PreviewCapture = () => {
  const router = useRouter();
  const 고른타입 = String(router.query?.type ?? '');
  const 그릴것 = 고른타입 ? HERO_TYPES.filter((t) => String(t.value) === 고른타입) : HERO_TYPES;

  return (
    <div style={{ background: '#fff', padding: '24px' }}>
      {!고른타입 && (
        <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          캡처 전용 화면입니다. 관리자 메뉴에는 나오지 않습니다.
          (만들기: <code>node scripts/section-preview/capture.cjs</code>)
        </div>
      )}
      {그릴것.map((t) => (
        // data-capture 로 스크립트가 이 상자만 잘라 낸다.
        // 폭을 고정해야 찍을 때마다 같은 그림이 나온다 — 창 크기에 따라 달라지면
        // 관리자 화면의 미리보기가 매번 조금씩 달라 보인다.
        <div key={t.value} style={{ marginBottom: 40 }}>
          {!고른타입 && (
            <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{t.value}. {t.label}</div>
          )}
          <div data-capture={`item-hero-${t.value}`} style={{ width: 960, background: '#fff' }}>
            <HomeItemHero
              column={{ type: 'item-hero', title: '', list: [견본상품], style: { hero_type: String(t.value) } }}
              data={{}} func={{}} is_manager
              router={router}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

PreviewCapture.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PreviewCapture;
