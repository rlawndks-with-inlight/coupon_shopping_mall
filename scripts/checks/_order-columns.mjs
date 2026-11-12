import { readFileSync } from 'fs';
import { FRONT_ROOT } from './_roots.mjs';

// 주문관리·주문취소관리 표는 칸 정의를 src/components/manager/OrderColumns.js 에서 가져다 쓴다(2026-11-12).
// 화면 파일에는 `구매자칸,` 처럼 이름만 남으므로, 예전처럼 화면 소스에서 칸 내용을 찾던 검사가 빗나간다.
// 칸펼치기(화면 소스) 는 그 이름 자리에 공용 파일의 칸 정의를 그대로 끼워 넣은 소스를 돌려준다 —
// 검사는 예전처럼 '화면에 그 칸이 그 순서로 있는가'를 볼 수 있다.
const 공용 = readFileSync(FRONT_ROOT + 'src/components/manager/OrderColumns.js', 'utf8').replace(/\r/g, '');
const 정의 = {};
for (const m of 공용.matchAll(/^export const (\S+칸) = (\{[\s\S]*?\n\});/gm)) 정의[m[1]] = m[2];

export const 공용칸이름 = Object.keys(정의);

export const 칸펼치기 = (src) => {
  // import 줄(`import { 구매자칸, … }`)은 건드리지 않는다 — 거기 펼치면 칸이 파일 맨 위에 있는 것처럼 보인다
  return String(src ?? '').replace(/\r/g, '').split('\n').map((줄) => {
    if (/^\s*import\s/.test(줄)) return 줄;
    for (const [이름, 본문] of Object.entries(정의)) {
      줄 = 줄.replace(new RegExp(`(^|[\\s\\[(])${이름},`, 'g'), (_, 앞) => `${앞}${본문},`);
    }
    return 줄;
  }).join('\n');
};
