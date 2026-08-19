import { FRONT_ROOT } from './_roots.mjs';
import fs from 'fs';

// 블로그형 프레임(3·4)의 카테고리 이동.
//
// [배경] 이 프레임들은 헤더에 카테고리가 하나도 없었다. 고객이 상품을 둘러볼 수단이
//        검색뿐이라 '이름을 이미 아는 물건' 만 살 수 있었다.
//        헤더에 줄을 넣는 방법은 못 쓴다 — 헤더가 position:fixed 인데 본문 상단 여백을
//        각 화면이 하드코딩하고(홈 48px, 나머지 56px), 폰 390px 에서 남는 폭이 39px 뿐이다.
//        그래서 헤더의 기존 격자 아이콘(→ /shop/items)은 그대로 두고, 그 화면에 칩을 편다.
//
// [이 검사가 지키는 것]
//   1. 칩 고르는 규칙이 실제로 그렇게 도는가 (모듈을 못 부르므로 소스를 떼어 평가한다)
//   2. 화면이 칩을 실제로 그리는가 (state 만 만들고 JSX 에 안 쓰는 사고가 이 저장소에 있었다)
//   3. 주소의 category_id 가 조회와 의존성 배열에 둘 다 들어갔는가
//      — 하나라도 빠지면 칩은 눌리는데 목록이 그대로다(조용한 고장)

const CHIPS = FRONT_ROOT + 'src/components/elements/shop/CategoryChips.js';
const ITEMS = FRONT_ROOT + 'src/views/blog/search/demo-2.js';
const chips_src = fs.readFileSync(CHIPS, 'utf8');
const items_src = fs.readFileSync(ITEMS, 'utf8');

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// ── 규칙을 진짜로 돌려 본다 ────────────────────────────────────────────────
// utils/function.js 는 next 의존 때문에 import 가 안 된다. 필요한 함수만 떼어 온다.
const 떼기 = (src, 시작, 이름) => {
  const i = src.indexOf(시작);
  if (i < 0) throw new Error('not found: ' + 이름);
  const rest = src.slice(i);
  const m = rest.slice(1).match(/\n(?:export )?(?:const|function) [A-Za-z가-힣]/);
  return rest.slice(0, m ? m.index + 1 : rest.length);
};
const util_src = fs.readFileSync(FRONT_ROOT + 'src/utils/function.js', 'utf8');
const body = [
  떼기(util_src, 'export function getAllIdsWithParents', 'getAllIdsWithParents'),
  떼기(chips_src, 'export const 카테고리경로', '카테고리경로'),
  떼기(chips_src, 'export const 칩목록', '칩목록'),
].join('\n').replace(/\bexport (const|function) /g, '$1 ') + '\n';
const { 카테고리경로, 칩목록 } = new Function(body + 'return { 카테고리경로, 칩목록 };')();

//  상의 ─ 티셔츠
//      └ 니트
//  하의
const 나무 = [{
  product_categories: [
    { id: 10, category_name: '상의', children: [
      { id: 11, category_name: '티셔츠', children: [] },
      { id: 12, category_name: '니트', children: [] },
    ] },
    { id: 20, category_name: '하의', children: [] },
  ],
}];
const ids = (x) => x.map((c) => c?.id);

t('아무것도 안 골랐으면 최상위가 나온다', String(ids(칩목록(나무, undefined).칩들)) === '10,20');
t('아무것도 안 골랐으면 경로가 비어 있다', 칩목록(나무, undefined).경로.length === 0);
t('상의를 고르면 그 아래 단계가 나온다', String(ids(칩목록(나무, 10).칩들)) === '11,12');
// 잎에서 형제를 보여주지 않으면 칩이 통째로 사라져 옆 카테고리로 갈 길이 없어진다.
t('잎(티셔츠)에서는 형제가 나온다', String(ids(칩목록(나무, 11).칩들)) === '11,12');
t('자식 없는 최상위(하의)에서는 최상위 형제가 나온다', String(ids(칩목록(나무, 20).칩들)) === '10,20');
t('경로가 뿌리부터 쌓인다', String(ids(칩목록(나무, 11).경로)) === '10,11');
// 주소창에 남은 옛 id, 삭제된 카테고리 — 빈 화면이 아니라 전체 목록으로 떨어져야 한다.
t('없는 id 는 전체로 떨어진다', String(ids(칩목록(나무, 999).칩들)) === '10,20');
t('주소 값이 문자열이어도 맞춘다', String(ids(칩목록(나무, '10').칩들)) === '11,12');
t('카테고리가 없으면 빈 배열', 칩목록(undefined, undefined).칩들.length === 0);

// ── 화면이 실제로 그리는가 ────────────────────────────────────────────────
t('전체보기 화면이 CategoryChips 를 불러온다', items_src.includes("from 'src/components/elements/shop/CategoryChips'"));
t('전체보기 화면이 CategoryChips 를 JSX 로 그린다', /<CategoryChips\s/.test(items_src));
t('검색 화면에는 안 그린다(전체보기일 때만)',
  /칩쓴다 = 전체보기 && /.test(items_src) && /\{칩쓴다 &&[\s\S]{0,200}<CategoryChips/.test(items_src));
t('칩 컴포넌트가 칩을 JSX 로 그린다', /칩들\.map\(/.test(chips_src) && /<Chip\s/.test(chips_src));
t('칩을 누르면 category_id 를 달고 이동한다', chips_src.includes('/shop/items?category_id=${id}'));
t('전체 칩은 category_id 없이 이동한다', /:\s*'\/shop\/items'/.test(chips_src));
t('카테고리가 없는 가맹점에는 아무것도 안 그린다', /뿌리\.length < 1\) return null/.test(chips_src));

// ── 주소 → 목록 배선 ──────────────────────────────────────────────────────
// 조회에만 넣고 의존성에 빠뜨리면 주소만 바뀌고 목록은 그대로다. 눌러 봐야만 드러난다.
const 효과 = items_src.slice(items_src.indexOf('if (!router.isReady) return;'));
const 효과끝 = 효과.slice(0, 효과.indexOf('const settingPage'));
t('조회 조건에 category_id 를 넘긴다', /category_id:\s*router\.query\?\.category_id/.test(효과끝));
t('의존성 배열에 category_id 가 있다', /\}, \[router\.isReady[^\]]*router\.query\?\.category_id\]/.test(효과끝));
t('검색 화면에서는 category_id 를 안 넘긴다', /전체보기 &&[\s\S]{0,80}router\.query\?\.category_id/.test(효과끝));

// ── 프레임 제한 ───────────────────────────────────────────────────────────
// /shop/items 는 블로그형 브랜드가 전부 같은 화면을 쓴다. 막지 않으면 단일 상품용으로
// 만든 프레임5·6(blog:4·blog:9)까지 카테고리가 생긴다 — 요청 범위 밖이다.
const 프레임 = new Function(
  떼기(chips_src, 'export const 카테고리칩쓰는프레임', '카테고리칩쓰는프레임')
    .replace('export const ', 'const ') + 'return 카테고리칩쓰는프레임;')();
t('프레임3(blog:1)은 칩을 쓴다', 프레임({ shop_demo_num: 0, blog_demo_num: 1 }) === true);
t('프레임4(blog:2)는 칩을 쓴다', 프레임({ shop_demo_num: 0, blog_demo_num: 2 }) === true);
t('프레임5(blog:4)는 안 쓴다', 프레임({ shop_demo_num: 0, blog_demo_num: 4 }) === false);
t('프레임6(blog:9)은 안 쓴다', 프레임({ shop_demo_num: 0, blog_demo_num: 9 }) === false);
t('쇼핑몰형은 안 쓴다(헤더에 이미 카테고리가 있다)', 프레임({ shop_demo_num: 1, blog_demo_num: 0 }) === false);
t('값이 없으면 안 쓴다', 프레임(undefined) === false);
t('칩 컴포넌트가 프레임을 먼저 거른다', /카테고리칩쓰는프레임\(themeDnsData\)\) return null/.test(chips_src));

// 제목이 '전체상품' 으로 굳어 있으면 고객은 걸러진 줄 모르고 '상품 없는 가게' 로 읽는다.
t('카테고리를 고르면 제목이 그 이름으로 바뀐다',
  /선택카테고리\s*\?\s*formatLang\(선택카테고리, 'category_name'/.test(items_src));

// run-all 은 각 검사의 출력에서 "통과 N" 을 찾아 센다.
// 형식이 다르면 0건으로 집계돼, 검사가 20건 다 통과해도 '검사 없음' 처럼 보인다.
console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
