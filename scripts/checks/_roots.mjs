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
