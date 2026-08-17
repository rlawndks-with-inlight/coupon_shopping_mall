import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 약관·방침 본문 조립 규칙 고정.
//
// 붙잡아 두는 사고:
//   ① 약관 끝 '부칙 → 제1조(시행일) → 본문' 에서 부칙 제목이 사라져,
//      마지막 조항 뒤에 '제1조(시행일)' 만 덩그러니 나오던 것(모든 몰 공통)
//   ② 값이 없는 가맹점에서 '전화번호 : ' 처럼 빈 줄이 남는 것
//   ③ 내용이 전부 빠졌는데 제목만 남는 것
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const src = readFileSync(FRONT + 'src/components/elements/shop/PolicyBody.js', 'utf8');
const cut = (start, end) => {
  const i = src.indexOf(start);
  if (i < 0) throw new Error(`못 찾음: ${start}`);
  const j = src.indexOf(end, i);
  return src.slice(i, j + end.length);
};
const { resolve } = new Function(
  cut("const DROP_IF_EMPTY =", ';') + '\n' +
  cut('const TOKEN =', ';') + '\n' +
  cut('const resolve = (blocks, vars) => {', '\n};') + '\n' +
  'return { resolve };'
)();

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${g}\n  want: ${w}`); }
};
const heads = (blocks, vars) => resolve(blocks, vars).filter(([k]) => k === 'h').map(([, t]) => t);

// ── ① 부칙: 제목이 제목을 품는 자리 ──────────────────────────────────────
const 약관끝 = [
  ['h', '제20조(관할법원)'],
  ['p', '관계 법령이 정하는 관할법원에 제기합니다.'],
  ['h', '부칙'],
  ['h', '제1조(시행일)'],
  ['p', '본 약관은 {{date}}부터 시행합니다.'],
];
eq('부칙이 남는다', heads(약관끝, { date: '2026년 8월 11일' }),
  ['제20조(관할법원)', '부칙', '제1조(시행일)']);
eq('시행일이 채워진다',
  resolve(약관끝, { date: '2026년 8월 11일' }).at(-1)[1],
  '본 약관은 2026년 8월 11일부터 시행합니다.');

// 시행일이 없으면 부칙 묶음이 통째로 빠진다(제목만 남으면 안 된다)
eq('시행일 없으면 부칙 묶음 전체가 빠진다', heads(약관끝, {}), ['제20조(관할법원)']);
eq('빈 줄이 남지 않는다', resolve(약관끝, {}).length, 2);

// ── ② 값이 빈 항목은 그 줄만 감춘다 ──────────────────────────────────────
const 보호책임자 = [
  ['h', '개인정보 보호책임자'],
  ['p', '성명 : {{pvcyName}}'],
  ['p', '연락처 : {{phone}}'],
  ['p', '문의하신 내용에 신속히 답변드리겠습니다.'],
];
eq('값이 다 있으면 그대로', resolve(보호책임자, { pvcyName: '홍길동', phone: '010-0000-0000' }).length, 4);
eq('이름만 없으면 그 줄만 빠진다',
  resolve(보호책임자, { phone: '010-0000-0000' }).map(([, t]) => t),
  ['개인정보 보호책임자', '연락처 : 010-0000-0000', '문의하신 내용에 신속히 답변드리겠습니다.']);

// ── ③ 내용이 전부 빠지면 제목도 빠진다 ───────────────────────────────────
const 전멸 = [
  ['h', '개인정보 보호책임자'],
  ['p', '성명 : {{pvcyName}}'],
  ['p', '연락처 : {{phone}}'],
  ['h', '다음 조'],
  ['p', '이 줄은 남는다.'],
];
eq('내용이 다 빠진 제목은 사라진다', heads(전멸, {}), ['다음 조']);
eq('뒤 조항은 멀쩡하다', resolve(전멸, {}).map(([, t]) => t), ['다음 조', '이 줄은 남는다.']);

// ── 실제 문서로 확인 ─────────────────────────────────────────────────────
const dataSrc = readFileSync(FRONT + 'src/data/policy-content.js', 'utf8');
const arrayOf = (name) => {
  const i = dataSrc.indexOf(`export const ${name} = [`);
  const start = dataSrc.indexOf('[', i);
  let depth = 0, end = start;
  for (let k = start; k < dataSrc.length; k++) {
    if (dataSrc[k] === '[') depth++;
    else if (dataSrc[k] === ']') { depth--; if (depth === 0) { end = k; break; } }
  }
  return new Function(`return ${dataSrc.slice(start, end + 1)}`)();
};
const 값 = { company: '주식회사 예시', shop: '예시몰', date: '2026년 8월 11일', pvcyName: '홍길동', phone: '010-0000-0000' };
for (const name of ['TERMS', 'PRIVACY']) {
  const out = resolve(arrayOf(name), 값);
  eq(`${name} — 부칙 있음`, out.some(([k, t]) => k === 'h' && t === '부칙'), true);
  eq(`${name} — 빠진 블록 없음`, out.length, arrayOf(name).length);
  eq(`${name} — 안 채워진 토큰 없음`, /\{\{\w+\}\}/.test(out.map(([, t]) => t).join('')), false);
}
// 이용안내는 토큰이 없어 값과 무관하게 전부 나와야 한다
eq('GUIDE — 값이 없어도 전부 나온다', resolve(arrayOf('GUIDE'), {}).length, arrayOf('GUIDE').length);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
