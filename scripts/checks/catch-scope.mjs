import { BACK_ROOT, FRONT_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync, readdirSync } from 'fs';
import { createRequire } from 'module';

// catch 블록이 try 안에서 선언된 변수를 읽는지 본다.
//
// 무슨 일이 있었나(2026-08-21):
//   포스페이 실패 원인을 남기려고 catch 에 진단 로그를 넣었는데, 그 로그가 try 안의
//   const(order_no·fsMethod·creds…)를 읽었다. const 는 블록 스코프라 catch 에서는 안 보인다.
//
//     try { const order_no = ...; await 호출(); }
//     catch (e) { logger.error(`ord_num=${order_no}`) }   ← ReferenceError
//
//   그래서 PG 가 990 을 돌려줄 때마다 catch 자체가 다시 터졌고, 정작 PG 메시지는 사라지고
//   바깥 catch 의 "서버 에러 발생" 만 남았다. **진단을 넣으려다 진단을 덮었다.**
//   문법 오류가 아니라 실행해야만 드러나고, 그것도 '실패했을 때만' 드러나는 종류다.
//
// 잡는 방법: try 블록에서 선언된 이름을 모아, 같은 문의 catch 본문에서 그 이름을 읽는지 본다.

if (!백엔드있음) {
    console.log('  (백엔드 저장소가 없어 건너뜀)');
    console.log('\n통과 0 / 실패 0');
    process.exit(0);
}

const require = createRequire(import.meta.url);
const { parse } = require(FRONT_ROOT + 'node_modules/@babel/parser');

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// 선언 이름 모으기(구조분해도 훑는다)
const 이름들 = (node, out = []) => {
    if (!node) return out;
    if (node.type === 'Identifier') out.push(node.name);
    else if (node.type === 'ObjectPattern') node.properties.forEach((p) => 이름들(p.value ?? p.argument, out));
    else if (node.type === 'ArrayPattern') node.elements.forEach((e) => 이름들(e, out));
    else if (node.type === 'AssignmentPattern') 이름들(node.left, out);
    else if (node.type === 'RestElement') 이름들(node.argument, out);
    return out;
};

const 훑기 = (node, fn) => {
    if (!node || typeof node.type !== 'string') return;
    fn(node);
    for (const k of Object.keys(node)) {
        const v = node[k];
        if (Array.isArray(v)) v.forEach((c) => 훑기(c, fn));
        else if (v && typeof v.type === 'string') 훑기(v, fn);
    }
};

const 대상 = readdirSync(BACK_ROOT + 'controllers')
    .filter((f) => f.endsWith('.js'))
    .map((f) => 'controllers/' + f);

const 문제 = [];
for (const f of 대상) {
    const src = readFileSync(BACK_ROOT + f, 'utf8');
    let ast;
    try { ast = parse(src, { sourceType: 'module' }); }
    catch (e) { 문제.push(`${f} 파싱 실패: ${e.message}`); continue; }

    훑기(ast.program, (node) => {
        if (node.type !== 'TryStatement' || !node.handler) return;
        // try 블록 '바로 아래' 에서 선언된 const/let (중첩 블록은 어차피 더 좁다)
        const 선언 = new Set();
        for (const st of node.block.body ?? []) {
            if (st.type === 'VariableDeclaration' && st.kind !== 'var') {
                st.declarations.forEach((d) => 이름들(d.id).forEach((n) => 선언.add(n)));
            }
        }
        if (선언.size === 0) return;
        // catch 본문에서 그 이름을 읽는가 (자기 매개변수·자기 선언은 뺀다)
        const 제외 = new Set(이름들(node.handler.param));
        for (const st of node.handler.body.body ?? []) {
            훑기(st, (n) => {
                if (n.type === 'VariableDeclaration') n.declarations.forEach((d) => 이름들(d.id).forEach((x) => 제외.add(x)));
            });
        }
        // '읽는 자리' 만 센다. err.data 의 data 나 { data: 1 } 의 키는 변수 참조가 아니다 —
        // 그걸 세면 멀쩡한 catch 가 전부 걸려서(실제로 그랬다) 검사가 소음이 된다.
        const 참조아님 = new Set();
        훑기(node.handler.body, (n) => {
            // ?. 는 OptionalMemberExpression 이라 타입이 다르다 — 이걸 빼먹어서 한 번 헛돌았다.
            if ((n.type === 'MemberExpression' || n.type === 'OptionalMemberExpression')
                && !n.computed && n.property?.type === 'Identifier') 참조아님.add(n.property);
            if ((n.type === 'ObjectProperty' || n.type === 'Property') && !n.computed && n.key?.type === 'Identifier') 참조아님.add(n.key);
            if (n.type === 'ObjectMethod' && !n.computed && n.key?.type === 'Identifier') 참조아님.add(n.key);
        });
        훑기(node.handler.body, (n) => {
            if (n.type !== 'Identifier' || 참조아님.has(n)) return;
            if (제외.has(n.name) || !선언.has(n.name)) return;
            const 줄 = src.slice(0, n.start).split('\n').length;
            문제.push(`${f}:${줄} catch 가 try 안의 '${n.name}' 을 읽는다`);
        });
    });
}

t('catch 가 try 안 변수를 읽는 곳이 없다', 문제.length === 0, 문제.slice(0, 8).join('\n        '));

// 이 사고가 났던 자리 — 진단 값을 try 바깥 상자에 담아 두는지 확인한다.
const pay = readFileSync(BACK_ROOT + 'controllers/pay.controller.js', 'utf8');
t('포스페이 진단값을 try 바깥에 둔다', /const 진단 = \{ ord_num:/.test(pay));
t('catch 는 그 상자만 읽는다', /ord_num=\$\{진단\.ord_num\}/.test(pay) && !/ord_num=\$\{order_no\}/.test(pay));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
