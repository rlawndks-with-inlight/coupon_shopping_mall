import { useRouter } from 'next/router';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import HomeItemHero from 'src/views/section/shop/HomeItemHero';
import HomeBanner from 'src/views/section/blog/HomeBanner';
import HomeItems from 'src/views/section/blog/HomeItems';
import HomeEditor from 'src/views/section/blog/HomeEditor';
import HomeButtonBanner from 'src/views/section/blog/HomeButtonBanner';
import HomeItemsWithCategories from 'src/views/section/blog/HomeItemsWithCategories';
import HomeVideoSlide from 'src/views/section/blog/HomeVideoSlide';
import HomePost from 'src/views/section/blog/HomePost';
import HomeTextBanner from 'src/views/section/shop/HomeTextBanner';
import { HERO_TYPES, SECTION_SAMPLES, 견본상품, 견본상품들, 홈문구표시값 } from 'src/data/section-preview';
import { HOME_TEXT_SCHEMA } from 'src/data/home-texts';
// SettingsContext 는 index.js 가 재export 하지 않는다 — 정의 파일에서 직접 가져온다.
import { SettingsContext } from 'src/components/settings/SettingsContext';
import { useSettingsContext } from 'src/components/settings';
import BlogHome4 from 'src/views/blog/home/demo-4';
import BlogHome5 from 'src/views/blog/home/demo-5';
import BlogHome6 from 'src/views/blog/home/demo-6';
import BlogHome7 from 'src/views/blog/home/demo-7';
import BlogHome8 from 'src/views/blog/home/demo-8';
import BlogHome9 from 'src/views/blog/home/demo-9';

const 홈데모 = { 4: BlogHome4, 5: BlogHome5, 6: BlogHome6, 7: BlogHome7, 8: BlogHome8, 9: BlogHome9 };

// 「홈 문구」가 화면 어디에 나오는지 보여주는 그림을 만든다.
//
// 문구 자리에 그 칸의 이름(① 에디션 표기 …)을 넣고 홈을 그대로 그린다 —
// 사진 속 글자가 곧 라벨이라 좌표를 손으로 적어 둘 필요가 없고,
// 디자인이 바뀌어 자리가 옮겨져도 다시 찍기만 하면 맞는다.
//
// ⚠ 전역 상태를 건드리지 않는다. onChangeDnsData 는 localStorage 까지 바꿔서,
//   사람이 이 화면을 자기 브라우저로 열면 그 몰 설정이 오염된다.
//   여기서만 통하는 Provider 로 감싼다.
const 홈문구미리보기 = ({ demoNum }) => {
  const 원본 = useSettingsContext();
  const 화면 = 홈데모[demoNum];
  const 스키마 = HOME_TEXT_SCHEMA[demoNum];
  if (!화면 || !스키마) return null;
  const 가짜 = {
    ...원본,
    themeDnsData: {
      ...원본.themeDnsData,
      // 찍는 몰의 이름과 상품을 지운다.
      //
      // 처음엔 그냥 찍었더니 mbc01 에서 찍은 그림이 저장소에 들어갔고,
      // **다른 몰 관리자 화면에 'MBC01' 과 그 몰의 상품(떡갈비)이 그대로 박혔다.**
      // 자기 몰에서 안내를 보는데 남의 상호가 떠 있으면 '이 그림이 내 것이 맞나' 부터 의심하게 된다.
      // 섹션 미리보기에서 견본 상품을 쓰는 이유와 같은 이유다(data/section-preview.js 주석).
      //
      // products 를 한 건 채워 두면 useFeaturedProduct 가 그걸 집어 API 조회를 안 한다.
      // 대표상품 지정(featured_product_ids)도 비워야 그 조회로 새지 않는다.
      name: '브랜드명',
      // 넷을 준다 — 데모 6·8 은 히어로 말고 하단 갤러리에도 상품을 깐다.
      // 한 건만 주면 useFeaturedProducts 가 빈 배열을 돌려줘 그 자리가 빈 칸으로 찍힌다.
      products: 견본상품들(4),
      setting_obj: {
        ...(원본.themeDnsData?.setting_obj ?? {}),
        shop_demo_num: 0,
        blog_demo_num: demoNum,
        featured_product_ids: [],
        featured_product_id: null,
        home_texts: { [`demo${demoNum}`]: 홈문구표시값(스키마.fields) },
      },
    },
  };
  const Home = 화면;
  return (
    <SettingsContext.Provider value={가짜}>
      <Home />
    </SettingsContext.Provider>
  );
};

// 관리자 화면에 넣을 미리보기 이미지를 만들기 위한 캡처 전용 화면.
//
// [왜 이런 화면을 두나]
// 가맹점 요청(2026-08-24):
//   "가맹점에서는 타입만 가지고 정확한 이미지를 알기 어렵습니다." (디자인 타입 8종)
//   "가맹점에서는 섹션 가지고 정확한 이미지를 알기 어렵습니다."   (섹션 10종)
//
// 손으로 캡처하지 않는다. 종류가 늘거나 디자인이 바뀌면 스크립트만 다시 돌리면 되어야 한다
// (매니저 가이드 스크린샷 30장도 scripts/guide-pdf 가 같은 방식으로 만든다).
//
// [왜 실제 몰을 안 쓰나]
// 실제 가맹점 몰에 섹션을 넣었다 빼며 찍으면 그 몰 홈이 잠깐 바뀐다.
// 여기서 찍으면 아무 몰도 건드리지 않고, 종류가 늘어도 이 화면에 추가만 하면 된다.
//
// ⚠ ?type=N (디자인 타입) 또는 ?section=TYPE (섹션) 이면 그것 **하나만** 그린다.
//   캡처 스크립트가 그렇게 부른다. 여러 개를 한 화면에 쌓아 두고 찍었더니 아래쪽 것의
//   사진이 빈 칸으로 나왔다 — 섹션 렌더러들이 LazyLoadImage 를 써서 화면에 들어와야
//   사진을 불러오는데, 스크롤로 훑어도 마지막 것은 끝내 안 실렸다.
//   하나씩 그리면 늘 화면 안에 있으므로 그 문제가 아예 없어진다.
//
// ⚠ 좌측 메뉴에 넣지 않는다(config-navigation 에 없다). 가맹점이 볼 화면이 아니다.
//
// 만드는 법: node scripts/section-preview/capture.cjs

// 섹션 종류 → 그리는 컴포넌트. 프레임들의 returnHomeContent 와 같은 짝이다.
const 섹션그리기 = (type, column, data, func) => {
  if (type === 'item-hero') return <HomeItemHero column={column} data={data} func={func} is_manager />;
  if (type === 'banner') return <HomeBanner column={column} data={data} func={func} is_manager />;
  if (type === 'editor') return <HomeEditor column={column} data={data} func={func} is_manager />;
  if (type === 'items' || type === 'items-ids') return <HomeItems column={column} data={data} func={func} is_manager />;
  if (type === 'button-banner') return <HomeButtonBanner column={column} data={data} func={func} is_manager />;
  if (type === 'items-with-categories') return <HomeItemsWithCategories column={column} data={data} func={func} is_manager />;
  if (type === 'text-banner') return <HomeTextBanner column={column} data={data} func={func} demoType={1} is_manager />;
  if (type === 'video-slide') return <HomeVideoSlide column={column} data={data} func={func} is_manager />;
  if (type === 'post') return <HomePost column={column} data={data} func={func} is_manager />;
  return null;
};

const PreviewCapture = () => {
  const router = useRouter();
  const 고른타입 = String(router.query?.type ?? '');
  const 고른섹션 = String(router.query?.section ?? '');
  // 섹션 렌더러 몇 개가 data.windowWidth 를 읽는다(배너 간격 계산 등). 안 주면 NaN 이 된다.
  const data = { windowWidth: 1100 };
  const func = {};

  const 홈문구모드 = !!router.query?.hometext;
  const 타입들 = (고른섹션 || 홈문구모드) ? [] : (고른타입 ? HERO_TYPES.filter((t) => String(t.value) === 고른타입) : HERO_TYPES);
  // skip 표시된 섹션은 견본으로 제대로 안 그려진다(이유는 section-preview.js 주석).
  const 쓸섹션 = SECTION_SAMPLES.filter((x) => !x.skip);
  const 섹션들 = (고른타입 || 홈문구모드) ? [] : (고른섹션 ? 쓸섹션.filter((s) => s.type === 고른섹션) : 쓸섹션);
  const 고른홈문구 = String(router.query?.hometext ?? '');
  const 하나만 = !!(고른타입 || 고른섹션 || 고른홈문구);

  return (
    <div style={{ background: '#fff', padding: '24px' }}>
      {!하나만 && (
        <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          캡처 전용 화면입니다. 관리자 메뉴에는 나오지 않습니다.
          (만들기: <code>node scripts/section-preview/capture.cjs</code>)
        </div>
      )}

      {타입들.map((t) => (
        // data-capture 로 스크립트가 이 상자만 잘라 낸다.
        // 폭을 고정해야 찍을 때마다 같은 그림이 나온다 — 창 크기에 따라 달라지면
        // 관리자 화면의 미리보기가 매번 조금씩 달라 보인다.
        <div key={`t${t.value}`} style={{ marginBottom: 40 }}>
          {!하나만 && <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>타입{t.value}. {t.label}</div>}
          <div data-capture={`item-hero-${t.value}`} style={{ width: 960, background: '#fff' }}>
            <HomeItemHero
              column={{ type: 'item-hero', title: '', list: [견본상품], style: { hero_type: String(t.value) } }}
              data={data} func={func} is_manager router={router}
            />
          </div>
        </div>
      ))}

      {!!고른홈문구 && (
        <div data-capture={`home-text-${고른홈문구}`} style={{ width: 1100, background: '#fff' }}>
          <홈문구미리보기 demoNum={Number(고른홈문구)} />
        </div>
      )}

      {섹션들.map((s) => (
        <div key={`s${s.type}`} style={{ marginBottom: 40 }}>
          {!하나만 && <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>{s.label} ({s.type})</div>}
          <div data-capture={`section-${s.type}`} style={{ width: 960, background: '#fff' }}>
            {섹션그리기(s.type, s.column, data, func)}
          </div>
        </div>
      ))}
    </div>
  );
};

PreviewCapture.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PreviewCapture;
