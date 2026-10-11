import { FRONT_ROOT } from './_roots.mjs';
// thegrazia(74) 개인정보처리방침 보정(src/data/policy-grazia.js)이 실제로 걸리는지 고정.
//
// 보정은 공용 방침(policy-content.js, 법무 원본에서 자동 생성)의 문장을 찾아 그 뒤에 넣거나 뺀다.
// 원본이 다시 생성되며 문장이 바뀌면 보정이 '조용히' 빠진다 — 통관부호 수집·관세청 제공 고지가
// 사라져도 화면은 멀쩡해 보인다. 여기서 결과를 직접 확인한다.
import { pathToFileURL } from 'url';

const { PRIVACY } = await import(pathToFileURL(`${FRONT_ROOT}src/data/policy-content.js`).href);
const { graziaPrivacy, isGraziaPolicy } = await import(pathToFileURL(`${FRONT_ROOT}src/data/policy-grazia.js`).href);

let pass = 0, fail = 0;
const t = (name, ok) => { if (ok) { pass++; console.log(`  ok  ${name}`); } else { fail++; console.log(`  FAIL ${name}`); } };
const 글 = (blocks) => blocks.map((b) => b[1]);

const g = graziaPrivacy(PRIVACY);
t('통관부호를 처리 항목에 적는다', 글(g).includes('개인통관고유부호(해외직구 상품의 수입통관)'));
t('처리 목적에 수입통관이 있다', 글(g).includes('해외직구 상품의 수입통관'));
t('관세청 제공을 고지한다', 글(g).some((x) => x.startsWith('제공받는 자 : 관세청')));
t('제3자 미제공 예시 문구는 뺀다', !글(g).some((x) => x.includes('제3자에게 제공하고 있지 않습니다')));
t('닉네임·보안질문은 뺀다', !글(g).includes('닉네임') && !글(g).includes('비밀번호 재설정용 보안질문 및 답변'));
t('다른 몰의 방침은 그대로', 글(PRIVACY).includes('닉네임') && !글(PRIVACY).some((x) => x.includes('통관')));
t('74 만 보정 대상', isGraziaPolicy({ id: 74 }) && !isGraziaPolicy({ id: 98 }) && !isGraziaPolicy({}));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
if (fail) process.exit(1);
