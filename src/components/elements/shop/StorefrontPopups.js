import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useSettingsContext } from "src/components/settings";
import { useLocales } from "src/locales";
import { returnMoment } from "src/utils/function";
import { isStorefrontHome } from "src/utils/blog-shop-route";

// 스토어프론트 홈 팝업.
//
// 원래는 shop demo-1(프레임1) 헤더 안에만 이 코드가 있었고, demo-4(프레임3)에 비슷한 사본이
// 하나 더 있었다. 나머지 9개 프레임에는 팝업을 그리는 코드가 아예 없어서
// 가맹점이 팝업관리에서 등록하고 '저장되었습니다' 를 봐도 고객화면엔 영영 안 떴다.
// 실패가 조용해서 가맹점은 자기 설정 실수로 오해했다.
//
// 레이아웃마다 복붙하면 '오늘 하루 보지않기' 같은 로직이 곧 어긋나므로 한 곳으로 모은다.
// 각 레이아웃은 <StorefrontPopups /> 한 줄만 넣으면 된다.
// (쇼핑몰 헤더 7개가 각자 복사본을 들고 있어서 여기 고친 것이 그 프레임엔 반영되지 않았다.
//  2026-08-21 에 전부 이 컴포넌트로 모았다 — 다시 복붙하지 말 것)
//
// ── 모양은 다른 쇼핑몰들이 쓰는 방식을 따랐다(2026-08-21) ──────────────────
// 예전에는 화면 왼쪽 위에 '내용 크기만큼' 붙는 상자였다. 그래서
//   · 글만 몇 줄 넣은 팝업이 손바닥만 하게 떠서 무슨 팝업인지 알아볼 수 없었고
//   · 헤더(로고·검색창·메뉴) 위에 얹혀 첫 화면을 가렸고
//   · '오늘 하루 보지않기' 와 닫기(X)가 모서리에 작게 흩어져 있어 누르기 어려웠다.
// 지금은 어두운 배경 + 가운데 카드 + 아래 버튼 두 개다(쿠팡·무신사·스마트스토어가 쓰는 모양).
//   · 배경을 누르면 닫힌다(그날 다시 뜬다). ESC 도 같다.
//   · 「오늘 하루 보지않기」 왼쪽, 「닫기」 오른쪽 — 둘 다 손가락으로 누를 만한 크기.
//   · 여러 개면 나란히 놓고, 좁은 화면에서는 세로로 쌓인다.

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <></>,
});

// 어두운 배경. 헤더보다 위에 있어야 닫기 버튼을 누를 수 있다
// (blog demo 4~9 공용 헤더가 position:sticky; z-index:100 이라 예전엔 팝업이 그 뒤로 숨었다).
const Dim = styled.div`
position:fixed;
inset:0;
background:rgba(0,0,0,0.55);
z-index:1300;
display:flex;
align-items:center;
justify-content:center;
padding:24px 16px;
overflow-y:auto;
`;

const CardRow = styled.div`
display:flex;
flex-wrap:wrap;
align-items:flex-start;
justify-content:center;
gap:16px;
margin:auto;
`;

const PopupCard = styled.div`
/* 카드 배경은 테마와 무관하게 항상 흰색이다.
   글자색을 지정하지 않으면 MUI 테마 글자색(다크모드=흰색)을 물려받아
   흰 배경에 흰 글자가 되어 팝업 내용이 통째로 안 보였다. */
color:#212121;
background:#fff;
border-radius:10px;
box-shadow:0 12px 32px rgba(0,0,0,0.28);
overflow:hidden;
display:flex;
flex-direction:column;
width:420px;
max-width:min(420px, 92vw);
max-height:86vh;
`;

const CardHead = styled.div`
display:flex;
align-items:center;
gap:8px;
padding:14px 16px;
border-bottom:1px solid #f0f0f0;
font-weight:700;
font-size:15px;
line-height:1.4;
word-break:keep-all;
`;

const CardBody = styled.div`
padding:4px 16px 12px 16px;
overflow-y:auto;
/* 팝업에 넣은 이미지가 원본 크기 그대로 나와 카드를 뚫고 나가던 것도 함께 막는다. */
img{max-width:100%;height:auto;display:block;margin:0 auto;}
.ql-editor{padding:8px 0;}
`;

const CardFoot = styled.div`
display:flex;
border-top:1px solid #f0f0f0;
background:#fafafa;
`;

// 두 버튼은 같은 무게로 둔다 — '오늘 하루 보지않기' 만 크게 만들면
// 다시 볼 생각이던 손님까지 그날 못 보게 된다.
const FootBtn = styled.button`
flex:1;
appearance:none;
border:0;
background:transparent;
padding:14px 12px;
font-size:13.5px;
color:#555;
cursor:pointer;
display:flex;
align-items:center;
justify-content:center;
gap:6px;
&:hover{background:#f2f2f2;}
& + &{border-left:1px solid #f0f0f0;}
`;

// 내용이 진짜 있는지. 저장만 하고 내용을 안 넣은 팝업이 빈 흰 상자로 떠 있었다(mbc01).
// 빈 상자는 손님에게 고장으로 보인다 — 제목도 내용도 없으면 아예 안 그린다.
export const 팝업본문있음 = (item) => {
  const html = String(item?.popup_content ?? '');
  const 글 = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return 글.length > 0 || /<img|<video|<iframe/i.test(html);
};

export const 팝업내용있음 = (item) =>
  팝업본문있음(item) || String(item?.popup_title ?? '').trim().length > 0;

const StorefrontPopups = () => {
  const router = useRouter();
  const { translate } = useLocales();
  const {
    themePopupList,
    themeNoneTodayPopupList,
    onChangeNoneTodayPopupList,
  } = useSettingsContext();

  const [popups, setPopups] = useState([]);

  useEffect(() => {
    setPopups(themePopupList ?? []);
  }, [themePopupList]);

  // ESC 로 닫는다. 훅은 조건 없이 항상 부른다(아래 early return 보다 반드시 위에 있어야 한다).
  useEffect(() => {
    const 키 = (e) => { if (e.key === 'Escape') setPopups([]); };
    window.addEventListener('keydown', 키);
    return () => window.removeEventListener('keydown', 키);
  }, []);

  // 홈에서만 띄운다. 가맹점 도메인 루트는 rewrite 로 asPath 가 '/' 라
  // '/shop/' 만 보면 안 되므로 isStorefrontHome 을 쓴다.
  if (!(popups?.length > 0) || !isStorefrontHome(router)) return <></>;

  const today = returnMoment().substring(0, 10);
  const hiddenToday = themeNoneTodayPopupList?.[today] ?? [];
  const 보일것 = popups.filter((item) => !hiddenToday.includes(item?.id) && 팝업내용있음(item));
  if (보일것.length === 0) return <></>;

  const 닫기 = (id) => setPopups((prev) => prev.filter((p) => p?.id !== id));
  const 오늘안보기 = (id) => {
    const 목록 = { ...themeNoneTodayPopupList };
    if (!목록[today]) 목록[today] = [];
    목록[today].push(id);
    onChangeNoneTodayPopupList(목록);
  };

  return (
    <Dim onClick={() => setPopups([])}>
      {/* 카드 안을 누른 것이 배경 클릭으로 새어 나가면, 내용을 읽으려다 팝업이 닫힌다. */}
      <CardRow onClick={(e) => e.stopPropagation()}>
        {보일것.map((item, idx) => (
          <PopupCard key={item?.id ?? idx}>
            {/* 관리자에서 받아 두고 화면 어디에도 안 쓰던 값이다. 제목이 있으면 무슨 알림인지
                한 줄로 먼저 읽히고, 내용이 이미지 한 장뿐일 때도 맥락이 남는다. */}
            {String(item?.popup_title ?? '').trim() &&
              <CardHead>
                <Icon icon="mdi:bell-outline" width={18} height={18} style={{ flexShrink: 0, color: '#666' }} />
                <span style={{ flex: 1 }}>{item?.popup_title}</span>
              </CardHead>}
            {/* 본문이 비어 있으면 칸 자체를 없앤다 — 안 그러면 제목 아래에 흰 여백만 남는다
                (제목만 적고 내용은 비워 둔 팝업이 실제로 있다). */}
            {팝업본문있음(item) &&
            <CardBody>
              <ReactQuill
                className='none-padding'
                value={item?.popup_content ?? `<body></body>`}
                readOnly={true}
                theme={"bubble"}
                bounds={'.app'}
              />
            </CardBody>}
            <CardFoot>
              <FootBtn type="button" onClick={() => 오늘안보기(item?.id)}>
                <Icon icon="mdi:calendar-remove-outline" width={16} height={16} />
                {translate('오늘 하루 보지않기')}
              </FootBtn>
              <FootBtn type="button" onClick={() => 닫기(item?.id)}>
                <Icon icon="mdi:close" width={16} height={16} />
                {translate('닫기')}
              </FootBtn>
            </CardFoot>
          </PopupCard>
        ))}
      </CardRow>
    </Dim>
  );
};

export default StorefrontPopups;
