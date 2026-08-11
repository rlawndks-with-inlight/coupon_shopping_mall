import styled from 'styled-components';
import { themeObj } from 'src/components/elements/styled-components';

// 약관·개인정보처리방침·이용안내 본문을 그린다.
//
// 본문은 src/data/policy-content.js 에 블록 배열로 들어 있고(원본 문서에서 자동 생성),
// 여기서는 브랜드 값만 채워 그린다. 문구를 고치려면 scripts/policy/source/*.txt 를 고치고
// `node scripts/policy/build.mjs` 를 다시 돌린다 — 이 파일이나 데이터를 직접 고치지 않는다.

const Heading = styled.div`
font-weight:bold;
margin: 28px 0 12px 0;
font-size:${themeObj.font_size.size7};
&:first-child { margin-top: 0; }
`;
const Para = styled.div`
margin-bottom: 10px;
font-size:${themeObj.font_size.size7};
line-height:1.8;
word-break:keep-all;
`;
// 각 호 나열 — 항(①②) 아래에 한 단계 들여쓴다.
const Item = styled.div`
margin: 0 0 6px 14px;
padding-left: 10px;
position: relative;
font-size:${themeObj.font_size.size7};
line-height:1.8;
word-break:keep-all;
&:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.85em;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: ${themeObj.grey[500]};
}
`;

// 값이 없으면 그 줄을 통째로 감출 토큰.
// 예: 개인정보 보호책임자 전화번호를 아직 안 넣은 가맹점에서 '전화번호 : ' 만 찍히면 안 된다.
const DROP_IF_EMPTY = ['pvcyName', 'phone', 'date'];

const TOKEN = /\{\{(\w+)\}\}/g;

const resolve = (blocks, vars) => {
  const list = blocks ?? [];
  const 살림 = list.map(([, text]) => {
    const names = [...String(text).matchAll(TOKEN)].map((m) => m[1]);
    return !names.some((n) => DROP_IF_EMPTY.includes(n) && !vars[n]);
  });

  // 안에 든 내용이 전부 빠진 제목은 남기지 않는다(제목만 덩그러니 남는 자리 방지).
  //
  // ⚠ '바로 뒤가 또 제목이면 지운다' 로 판단하면 안 된다. 약관 끝의
  //      부칙 → 제1조(시행일) → 본문
  //    처럼 제목이 제목을 품는 자리가 있어서, 그 규칙은 멀쩡한 '부칙' 을 지운다.
  //    (실제로 모든 몰에서 부칙이 사라져 마지막 조항 뒤에 '제1조(시행일)' 만 덩그러니 남았다)
  // 그래서 '직속 내용이 전부 빠졌고, 품고 있는 제목도 없을 때' 만 지운다.
  // 뒤에서부터 도는 이유: 품긴 제목의 생사가 먼저 정해져야 품은 제목을 판단할 수 있다.
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i][0] !== 'h' || !살림[i]) continue;
    let j = i + 1;
    let 원래 = 0;   // 원문에서 이 제목 밑에 바로 붙어 있던 내용 수
    let 남음 = 0;   // 그중 살아남은 수
    while (j < list.length && list[j][0] !== 'h') { 원래++; if (살림[j]) 남음++; j++; }

    // 원래 직속 내용이 있던 제목 — 그게 다 빠졌으면 제목도 지운다.
    if (원래 > 0) { if (남음 === 0) 살림[i] = false; continue; }

    // 원래 직속 내용이 없던 제목(예: 부칙) — 아래 제목을 품는 자리다.
    // 품은 제목이 살아 있으면 남기고, 그것마저 빠졌으면 같이 지운다.
    if (!(j < list.length && list[j][0] === 'h' && 살림[j])) 살림[i] = false;
  }

  return list.filter((_, i) => 살림[i])
    .map(([kind, text]) => [kind, String(text).replace(TOKEN, (_, k) => vars[k] ?? '')]);
};

const PolicyBody = ({ blocks, vars }) => (
  <>
    {resolve(blocks ?? [], vars ?? {}).map(([kind, text], idx) => {
      if (kind === 'h') return <Heading key={idx}>{text}</Heading>;
      if (kind === 'li') return <Item key={idx}>{text}</Item>;
      return <Para key={idx}>{text}</Para>;
    })}
  </>
);

export default PolicyBody;
