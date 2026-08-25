import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// 검사들이 읽을 저장소 위치.
//
// 예전에는 검사 파일이 임시 폴더에만 있었고 경로도 'c:/Users/user/Desktop/...' 로
// 박혀 있었다. 그래서 (1) 임시 폴더가 정리되면서 14개가 통째로 날아갔고
// (2) 다른 사람 컴퓨터·서버에서는 아예 못 돌렸다.
// 이제 저장소 안에 있으니 자기 위치에서 거슬러 올라가 찾는다.

const 여기 = dirname(fileURLToPath(import.meta.url));           // <front>/scripts/checks
export const FRONT_ROOT = resolve(여기, '../../') + '/';        // <front>/

// 백엔드는 프론트와 형제 폴더로 두고 쓴다(개발 PC 기준).
// 없을 수도 있다 — 서버에는 프론트만 배포된다. 그때는 백엔드를 보는 검사를 건너뛴다.
export const BACK_ROOT = resolve(FRONT_ROOT, '../coupon_shopping_mall_back-master/') + '/';
export const 백엔드있음 = existsSync(BACK_ROOT + 'package.json');

// 소스에서 주석을 걷어낸다. '코드에 있는가' 를 볼 때 쓴다 —
// 왜 그렇게 했는지 남긴 주석에도 같은 단어가 나오므로, 주석을 세면 없는 것을 지적한다.
//
// ⚠ 반드시 \r 을 먼저 지운다.
//   이 저장소 파일 상당수가 CRLF 다. 자바스크립트에서 \r 은 줄바꿈 문자라 `.` 이 안 먹고,
//   `$`(m 플래그 없음)는 문자열 맨 끝에서만 맞는다. 그래서 `//.*$` 가 \r 앞에서 멈춰
//   **주석이 하나도 안 지워진다** — 검사는 통과한 듯 보이는데 실제로는 아무 것도 안 걸러진다.
//   (2026-08-25 에 실제로 그렇게 새고 있었다. LF 파일에서만 동작해 눈치채기 어려웠다.)
export const 주석제거 = (소스) =>
    String(소스 ?? '')
        .replace(/\r/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
        .join('\n');
