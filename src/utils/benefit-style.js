// 혜택 안내 꾸밈(제목 색·크기, 요약 문구 색) — 관리자 미리보기와 손님 화면이 같은 기준을 쓴다.
//
// 값은 benefit_notices.style_obj(JSON 문자열)에 있다. 비어 있으면 예전 모양 그대로다.
// 서버가 저장할 때 색은 #rrggbb, 크기는 아래 세 가지만 받는다(손님 화면 style 에 그대로 들어가므로).

export const 혜택제목크기 = { normal: 18, large: 22, xlarge: 26 };

export const 혜택제목크기목록 = [
  { value: 'normal', label: '보통' },
  { value: 'large', label: '크게' },
  { value: 'xlarge', label: '아주 크게' },
];

export const 혜택꾸밈 = (n) => {
  const raw = n?.style_obj;
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
};
