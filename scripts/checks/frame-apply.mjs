import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 가맹점 신청 → 개설 경로가 프레임 축소로 꼬이지 않는지 고정.
//
// 실제 백엔드 소스에서 함수를 그대로 잘라 돌린다(구현이 바뀌면 같이 깨져야 한다).
// 회귀 방지 대상:
//   ① 판매중단 프레임으로 **이미 접수된 신청**이 승인될 때 원래 고른 몰로 개설되는가
//      (예전 구조였다면 조용히 shop:1 로 떨어졌다 — 운영 DB 에 shop:4 대기건이 실제로 있다)
//   ② 새 신청에서는 판매중단 프레임을 고를 수 없는가
//   ③ 메일·관리자 화면에 내부 키('blog:5')가 그대로 새어 나가지 않는가
//   ④ 프론트가 고를 수 있는 목록과 백엔드 허용 목록이 어긋나지 않는가
import { readFileSync } from 'fs';

const BACK = BACK_ROOT;
const FRONT = FRONT_ROOT;

const src = readFileSync(BACK + 'controllers/merchant_application.controller.js', 'utf8');
const cut = (start, end) => {
  const i = src.indexOf(start);
  if (i < 0) throw new Error(`못 찾음: ${start}`);
  const j = src.indexOf(end, i);
  if (j < 0) throw new Error(`끝을 못 찾음: ${end}`);
  return src.slice(i, j + end.length);
};

const B = new Function(
  cut('const FRAME_LABELS = {', '};') + '\n' +
  cut('const RETIRED_FRAME_LABELS = {', '};') + '\n' +
  cut('const SELECTABLE_FRAMES =', '\n') + '\n' +
  cut('const KNOWN_FRAMES =', '\n') + '\n' +
  cut('const isSelectableFrame =', '\n') + '\n' +
  cut('const isKnownFrame =', '\n') + '\n' +
  cut('const frameLabel = (frame) =>', ';') + '\n' +
  cut('const frameToDemo = (frame) => {', '\n};') + '\n' +
  'return { FRAME_LABELS, RETIRED_FRAME_LABELS, SELECTABLE_FRAMES, KNOWN_FRAMES, isSelectableFrame, isKnownFrame, frameLabel, frameToDemo };'
)();

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${g}\n  want: ${w}`); }
};

// ── ① 이미 접수된 신청은 원래 고른 몰로 개설된다 ────────────────────────
// 운영 DB 에 실제로 있는 상태: shop:4 pending 1건, blog:5~8 approved 다수
eq('shop:4 → 데모4 (프레임1 아님)', B.frameToDemo('shop:4'), { shop_demo_num: '4', blog_demo_num: '0' });
eq('blog:5 → 블로그5', B.frameToDemo('blog:5'), { shop_demo_num: '0', blog_demo_num: '5' });
eq('blog:6 → 블로그6', B.frameToDemo('blog:6'), { shop_demo_num: '0', blog_demo_num: '6' });
eq('blog:7 → 블로그7', B.frameToDemo('blog:7'), { shop_demo_num: '0', blog_demo_num: '7' });
eq('blog:8 → 블로그8', B.frameToDemo('blog:8'), { shop_demo_num: '0', blog_demo_num: '8' });

// 판매 중인 6개도 그대로
eq('shop:1 → 데모1', B.frameToDemo('shop:1'), { shop_demo_num: '1', blog_demo_num: '0' });
eq('shop:2 → 데모2', B.frameToDemo('shop:2'), { shop_demo_num: '2', blog_demo_num: '0' });
eq('blog:1 → 블로그1', B.frameToDemo('blog:1'), { shop_demo_num: '0', blog_demo_num: '1' });
eq('blog:2 → 블로그2', B.frameToDemo('blog:2'), { shop_demo_num: '0', blog_demo_num: '2' });
eq('blog:4 → 블로그4', B.frameToDemo('blog:4'), { shop_demo_num: '0', blog_demo_num: '4' });
eq('blog:9 → 블로그9', B.frameToDemo('blog:9'), { shop_demo_num: '0', blog_demo_num: '9' });

// 정말 모르는 값만 shop:1 로 떨어진다(0/0 이면 404 나는 브랜드가 생긴다)
eq('모르는 값은 프레임1', B.frameToDemo('blog:99'), { shop_demo_num: '1', blog_demo_num: '0' });
eq('빈 값도 프레임1', B.frameToDemo(''), { shop_demo_num: '1', blog_demo_num: '0' });
eq('null 도 프레임1', B.frameToDemo(null), { shop_demo_num: '1', blog_demo_num: '0' });

// ── ② 새 신청에서는 판매중단 프레임을 고를 수 없다 ──────────────────────
eq('선택 가능 6개', B.SELECTABLE_FRAMES,
  ['shop:1', 'shop:2', 'blog:1', 'blog:2', 'blog:4', 'blog:9']);
for (const k of ['shop:4', 'blog:5', 'blog:6', 'blog:7', 'blog:8']) {
  eq(`새 신청 거부 — ${k}`, B.isSelectableFrame(k), false);
  eq(`값은 인정 — ${k}`, B.isKnownFrame(k), true);
}
for (const k of B.SELECTABLE_FRAMES) eq(`새 신청 허용 — ${k}`, B.isSelectableFrame(k), true);
eq('모르는 값은 둘 다 거부', [B.isSelectableFrame('blog:99'), B.isKnownFrame('blog:99')], [false, false]);

// ── ③ 내부 키가 새어 나가지 않는다 ─────────────────────────────────────
eq('판매중 라벨', B.frameLabel('blog:1'), '03 매거진형');
eq('판매중단 라벨', B.frameLabel('blog:5'), '(판매중단) 다크 럭셔리');
eq('판매중단 라벨 2', B.frameLabel('shop:4'), '(판매중단) 다카테고리 잡화몰');
// 라벨 번호가 1~6 으로 다시 매겨졌는지
eq('라벨 번호', Object.values(B.FRAME_LABELS).map((v) => v.slice(0, 2)),
  ['01', '02', '03', '04', '05', '06']);
// 판매중단 라벨에는 번호를 주지 않는다(판매중과 헷갈린다)
eq('판매중단엔 번호 없음',
  Object.values(B.RETIRED_FRAME_LABELS).every((v) => /^\(판매중단\)/.test(v)), true);

// ── ④ 프론트와 백엔드 목록이 같은가 ────────────────────────────────────
// 어긋나면 신청 화면엔 뜨는데 서버가 거부하는(또는 그 반대) 프레임이 생긴다.
const fsrc = readFileSync(FRONT + 'src/components/main-site/frameList.js', 'utf8');
const arrayOf = (name) => {
  const i = fsrc.indexOf(`export const ${name} = [`);
  const start = fsrc.indexOf('[', i);
  let depth = 0, end = start;
  for (let k = start; k < fsrc.length; k++) {
    if (fsrc[k] === '[') depth++;
    else if (fsrc[k] === ']') { depth--; if (depth === 0) { end = k; break; } }
  }
  return new Function(`return ${fsrc.slice(start, end + 1)}`)();
};
eq('프론트 선택목록 = 백엔드 선택목록',
  arrayOf('FRAMES').map((f) => f.key), B.SELECTABLE_FRAMES);
eq('프론트 판매중단 = 백엔드 판매중단',
  arrayOf('LEGACY_FRAMES').map((f) => f.key), Object.keys(B.RETIRED_FRAME_LABELS));

// 이름도 같아야 한다 — 신청 화면과 접수 메일에 다른 이름이 찍히면 안 된다
for (const f of arrayOf('FRAMES')) {
  const label = B.FRAME_LABELS[f.key];
  eq(`이름 일치 — ${f.key}`, label.replace(/^\d\d\s/, ''), f.title);
  eq(`번호 일치 — ${f.key}`, Number(label.slice(0, 2)), f.no);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
