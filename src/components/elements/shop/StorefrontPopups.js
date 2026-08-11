import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Row, themeObj } from "src/components/elements/styled-components";
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

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <></>,
});

const PopupContainer = styled.div`
position:fixed;
top:16px;
left:0px;
display:flex;
flex-wrap:wrap;
/* blog demo 4~9 공용 헤더(BlogLayout6)가 position:sticky; z-index:100 이라
   z-index:20 이던 팝업이 헤더 뒤로 들어갔다 — 팝업 윗부분과 닫기(X) 버튼이 가려져
   닫을 수가 없었다. 팝업은 헤더보다 위에 있어야 한다(MUI modal 과 같은 층). */
z-index:1300;
`;
const PopupContent = styled.div`
/* 카드 배경은 테마와 무관하게 항상 흰색이다.
   글자색을 지정하지 않으면 MUI 테마 글자색(다크모드=흰색)을 물려받아
   흰 배경에 흰 글자가 되어 팝업 내용이 통째로 안 보였다. */
color:#212121;
background:#fff;
margin-right:16px;
margin-bottom:16px;
padding:24px 24px 48px 24px;
box-shadow:0px 4px 4px #00000029;
border-radius:8px;
width:auto;
min-height:200px;
position:relative;
opacity:0.95;
z-index:10;
@media screen and (max-width:400px) {
width:78vw;
}
`;

const StorefrontPopups = () => {
  const router = useRouter();
  const { translate } = useLocales();
  const {
    themeMode,
    themePopupList,
    themeNoneTodayPopupList,
    onChangeNoneTodayPopupList,
  } = useSettingsContext();

  const [popups, setPopups] = useState([]);

  useEffect(() => {
    setPopups(themePopupList ?? []);
  }, [themePopupList]);

  // 홈에서만 띄운다. 가맹점 도메인 루트는 rewrite 로 asPath 가 '/' 라
  // '/shop/' 만 보면 안 되므로 isStorefrontHome 을 쓴다.
  if (!(popups?.length > 0) || !isStorefrontHome(router)) return <></>;

  const today = returnMoment().substring(0, 10);
  const hiddenToday = themeNoneTodayPopupList?.[today] ?? [];
  const closeColor = themeMode == 'dark' ? '#fff' : '#222';

  return (
    <PopupContainer>
      {popups.map((item, idx) => {
        if (hiddenToday.includes(item?.id)) return <></>;
        return (
          <PopupContent key={item?.id ?? idx}>
            <Icon
              icon='ion:close'
              style={{ color: closeColor, position: 'absolute', right: '8px', top: '8px', fontSize: themeObj.font_size.size8, cursor: 'pointer' }}
              onClick={() => {
                let popup_list = [...popups];
                popup_list.splice(idx, 1);
                setPopups(popup_list);
              }}
            />
            <ReactQuill
              className='none-padding'
              value={item?.popup_content ?? `<body></body>`}
              readOnly={true}
              theme={"bubble"}
              bounds={'.app'}
            />
            <Row
              style={{ alignItems: 'center', position: 'absolute', left: '8px', bottom: '8px', cursor: 'pointer' }}
              onClick={() => {
                let none_today_popup_list = { ...themeNoneTodayPopupList };
                if (!none_today_popup_list[today]) {
                  none_today_popup_list[today] = [];
                }
                none_today_popup_list[today].push(item?.id);
                onChangeNoneTodayPopupList(none_today_popup_list);
              }}
            >
              <Icon icon='ion:close' style={{ color: closeColor, fontSize: themeObj.font_size.size8, marginRight: '4px' }} />
              <div style={{ fontSize: themeObj.font_size.size8 }}>{translate('오늘 하루 보지않기')}</div>
            </Row>
          </PopupContent>
        );
      })}
    </PopupContainer>
  );
};

export default StorefrontPopups;
