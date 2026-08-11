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
  const kept = blocks.filter(([, text]) => {
    const names = [...String(text).matchAll(TOKEN)].map((m) => m[1]);
    return !names.some((n) => DROP_IF_EMPTY.includes(n) && !vars[n]);
  }).map(([kind, text]) => [kind, String(text).replace(TOKEN, (_, k) => vars[k] ?? '')]);

  // 안에 든 내용이 전부 빠진 제목은 남기지 않는다(제목만 덩그러니 남는 자리 방지).
  return kept.filter(([kind], i) => kind !== 'h' || (kept[i + 1] && kept[i + 1][0] !== 'h'));
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
