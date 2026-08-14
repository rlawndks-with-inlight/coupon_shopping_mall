import { useLocales } from 'src/locales';

// 줄바꿈 규칙 — 한 곳에서만 정한다.
//
// 왜 필요한가
//   한글은 CSS 기본값(word-break: normal)에서 '음절 사이 어디서나' 끊긴다.
//   그래서 폭이 모자라는 순간 어절 한가운데가 잘린다.
//     예)  … 화면 구성을 확인하실 수 있습니
//          다
//   keep-all 을 주면 띄어쓰기에서만 끊겨 이 현상이 사라진다.
//
// 왜 그냥 keep-all 을 박으면 안 되는가
//   일본어·중국어는 띄어쓰기가 없다. keep-all 을 주면 문장 하나가 통째로
//   '끊을 수 없는 한 덩어리'가 되어 화면 밖으로 삐져나간다.
//   구두점(、。，)에서만 끊기는데, 그 사이가 길면 그대로 넘친다.
//
//   영어·스페인어는 keep-all 이어도 normal 과 똑같이 동작한다.
//   라틴 문자는 원래 단어 중간에서 안 끊기기 때문이다. 그래서 굳이 나누지 않는다.
//
// 쓰는 법
//   word-break 는 '상속되는' 속성이다. 화면 최상단 한 군데에만 걸면
//   그 아래 글자 전부에 적용된다. 문단마다 붙일 필요가 없다.
//
//   ⚠ 예외 — Dialog·Drawer 등 포털(portal)로 그려지는 것은 DOM 상 body 바로 밑에
//     붙으므로 상속을 못 받는다. 그런 곳은 이 훅을 직접 불러서 따로 지정해야 한다.
export const 줄바꿈규칙 = (lang) => (lang === 'ja' || lang === 'cn' ? 'normal' : 'keep-all');

export const useWordBreak = () => {
  const { currentLang } = useLocales();
  return 줄바꿈규칙(currentLang?.value || 'ko');
};

export default useWordBreak;
