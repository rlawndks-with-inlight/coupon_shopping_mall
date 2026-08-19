// 관리자 화면에서 '본사에게만 보여줄 것' 을 가르는 기준.
//
// 왜 따로 빼는가:
//   같은 판정이 메뉴(config-navigation.js)와 메인페이지관리(main_obj/setting.js)
//   두 군데에 필요하다. 한쪽에만 걸면 메뉴에서는 사라졌는데 다른 화면에서는 그대로
//   보이는 어긋남이 생긴다 — 실제로 '특성 그룹 관리' 를 감췄을 때 그룹 이름 메뉴는
//   그대로 보였던 적이 있다. 기준을 한 곳에 두고 양쪽이 같은 것을 부른다.
//
// ⚠ 권한을 막는 장치가 아니다. 화면에서 감추기만 한다 — level 50 유저의 권한은
//    그대로다(의도된 부분이다). 서버 판정은 여기와 무관하다.
export const 본사화면 = (user) => {
    // 본사 도메인에서는 로그인 등급과 무관하게 본사 화면으로 본다.
    if (typeof window !== 'undefined'
        && window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL) return true;
    return Number(user?.level) >= 50;
};
