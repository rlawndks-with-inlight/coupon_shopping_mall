import { useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';

// 가맹점이 정한 로고 크기를 화면 전체에 내려 준다.
//
// [왜 이렇게 하나]
// 로고를 그리는 자리가 프레임 11개에 걸쳐 25곳이 넘고, 기준 높이도 제각각이다(28~88px).
// '한 값으로 통일'하면 프레임 디자인이 무너지므로, 각자의 기준에 배율만 곱한다.
//   header.js:  height: calc(40px * var(--logo-scale, 1));
//
// 값을 CSS 변수로 내리는 이유는 두 가지다.
//   · 자리마다 훅을 하나씩 더 부르면 훅 순서가 깨질 수 있다. 실제로 demo-7 헤더는
//     logoSrc() 를 삼항 안에서 조건부로 부른다 — 이 저장소에서 화면이 백지가 됐던 원인이다.
//   · 변수 하나만 바꾸면 헤더·푸터·모바일 변형까지 한꺼번에 따라온다.
//
// documentElement 에 건다. Dialog·Drawer 는 포털이라 body 밑에 붙는데,
// html 에 걸어 두면 거기까지 상속된다.
export const LOGO_SCALE_기본 = 100;   // %
export const LOGO_SCALE_최소 = 60;
export const LOGO_SCALE_최대 = 200;

// 설정값을 안전한 배율로 바꾼다. 이상한 값이 들어와도 화면이 깨지면 안 된다.
export const logoScaleOf = (setting_obj) => {
    const v = Number(setting_obj?.logo_scale);
    if (!v || isNaN(v)) return 1;
    return Math.min(LOGO_SCALE_최대, Math.max(LOGO_SCALE_최소, v)) / 100;
};

const LogoScaleStyle = () => {
    const { themeDnsData } = useSettingsContext();
    // setting_obj 는 문자열로 올 때가 있다(백엔드가 JSON 컬럼을 그대로 넘기는 경로).
    const 설정 = typeof themeDnsData?.setting_obj === 'string'
        ? (() => { try { return JSON.parse(themeDnsData.setting_obj); } catch { return {}; } })()
        : themeDnsData?.setting_obj;
    const 배율 = logoScaleOf(설정);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.style.setProperty('--logo-scale', String(배율));
    }, [배율]);

    return null;
};

export default LogoScaleStyle;
