import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { FRONT_ROOT } from './_roots.mjs';

// 관리자 화면·안내(랜딩) 페이지 문구 — 이용가이드와 같은 기준(guide-plain-style.mjs, 2026-11-11 사장님 지적).
//   화면에 보이는 글(JSX 글자·문자열·템플릿)만 본다. 주석·console 은 보지 않는다.
//   CSS 를 담은 styled 템플릿 안의 /* 주석 */ 도 화면에 안 나오므로 뺀다.
const require = createRequire(import.meta.url);
const parser = require(FRONT_ROOT + 'node_modules/@babel/parser');
const traverse = require(FRONT_ROOT + 'node_modules/@babel/traverse').default;

let pass = 0, fail = 0;
const t = (name, cond, 보기 = '') => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (보기 ? '\n       ' + 보기 : '')); } };

const 버릇 = [
  [/—/, '줄표(—)'], [/[⚠✅❌👉✨💡]/u, '이모지'], [/가 아니라|이 아니라/, '「~가 아니라」 대비'],
  [/한눈에|자유롭게|안정적 운영|것이 좋습니다|공을 들|차이를 만듭니다|손쉽게|효과적으로/, '상투어'], [/시퀀스|전제입니다/, '번역투'],
];
// 일부러 둔 것 — 이유를 같이 적는다.
const 예외 = [
  /🔍 디자인 미리보기\(데모\) 화면입니다 — 로그인/, // 번역 사전의 키(외국어 화면용). 키를 바꾸면 5개 언어 사전을 같이 바꿔야 한다.
  /원활한 (서비스 )?제공을 위하여/,                // 약관(policyContent) — 법률 문서의 표준 문구
  /가장 빠르고 간편하게/,                          // 랜딩 첫 화면 큰 제목(광고 문구) — 그대로 두기로 함(사장님 2026-11-11)
];
const 폴더 = ['src/pages/manager', 'src/views/manager', 'src/components/manager', 'src/layouts/manager', 'src/components/main-site', 'src/pages/manual.js'];
const 파일들 = [];
const 걷기 = (p) => { const st = fs.statSync(p); if (st.isDirectory()) { for (const x of fs.readdirSync(p)) 걷기(path.join(p, x)); } else if (/\.jsx?$/.test(p)) 파일들.push(p); };
for (const d of 폴더) 걷기(FRONT_ROOT + d);

const 걸림 = [];
for (const f of 파일들) {
  let ast;
  try { ast = parser.parse(fs.readFileSync(f, 'utf8'), { sourceType: 'module', plugins: ['jsx'] }); } catch (e) { 걸림.push(`${f}: 읽기 실패 ${e.message}`); continue; }
  const 본 = (node, 글, p) => {
    let 화면글 = String(글 ?? '').replace(/\/\*[\s\S]*?\*\//g, '');
    if (!/[가-힣]/.test(화면글)) return;
    for (let q = p, i = 0; q && i < 6; q = q.parentPath, i++) if (q.node.type === 'CallExpression' && q.node.callee?.object?.name === 'console') return;
    if (예외.some((re) => re.test(화면글))) return;
    for (const [re, 이름] of 버릇) if (re.test(화면글)) 걸림.push(`${path.relative(FRONT_ROOT, f).replace(/\\/g, '/')}:${node.loc?.start?.line} ${이름}: ${화면글.replace(/\s+/g, ' ').trim().slice(0, 70)}`);
  };
  traverse(ast, {
    JSXText(p) { 본(p.node, p.node.value, p); },
    StringLiteral(p) { if (p.parent.type !== 'ImportDeclaration') 본(p.node, p.node.value, p); },
    TemplateElement(p) { 본(p.node, p.node.value.cooked, p); },
  });
}
t(`관리자·안내 화면 문구에 기계 문체 버릇이 없다(파일 ${파일들.length}개)`, 걸림.length === 0, 걸림.join('\n       '));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
