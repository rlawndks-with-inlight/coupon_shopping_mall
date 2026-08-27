import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { parse } from '@babel/parser';

// 상품상세의 배송비 표기 (2026-08-28).
//
// [사연]
// 가맹점이 「설정관리 › 배송비설정」에 기본배송비·무료기준을 넣어도 프레임마다 표기가 달랐다.
// 운영 화면에서 직접 확인한 실제 모습:
//     shop-1   배송비: 무료배송
//     shop-2   배송비 2,000원· 100,000원 이상 무료배송     ← 가운뎃점 앞 공백 없음
//     blog-2   배송비 :무료배송                            ← 콜론 앞 공백, 뒤 없음
//     blog-4   배송비 5,000원 · 30,000원 이상 무료배송
//     blog-1   (아무것도 없음)  ← 설정해도 손님이 상세에서 볼 수 없었다. mbc03 에서 발견
// 계산은 다 맞는데 보여주는 말만 갈렸다. 같은 JSX 를 열 곳에 복붙해 둔 결과다.
// → 문구는 ShippingLine 한 곳에서만 만들고, 프레임은 그걸 가져다 쓴다.
//
// [왜 파서로 보나]
// shop-9 은 파일의 절반이 블록주석이다(상품코드·속성·특성 행이 전부 주석 안). 눈으로도,
// 정규식으로도 '있다' 로 보이지만 실제로는 죽은 코드다. AST 에 있는지만이 확실한 신호다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 컴포넌트 = 'src/components/elements/shop/ShippingLine.js';
t('공용 컴포넌트가 있다', existsSync(FRONT_ROOT + 컴포넌트),
    '프레임마다 따로 그리면 문구가 또 갈라진다');

if (existsSync(FRONT_ROOT + 컴포넌트)) {
    const src = readFileSync(FRONT_ROOT + 컴포넌트, 'utf8').replace(/\r/g, '');
    t('몰 정책으로 판정한다', /배송비표시\(item\)/.test(src),
        '상품 테이블의 delivery_fee 를 그대로 쓰면 정책을 쓰는 몰이 0원으로 보인다');
    t('무료면 무료배송만 보여준다', /배송\.free/.test(src) && /무료배송/.test(src));
    t('무료기준을 함께 알린다', /무료배송안내\(/.test(src),
        '3만원 이상 무료인 걸 알아야 손님이 담기를 더 한다');
    t('표 프레임을 위해 라벨을 뺄 수 있다', /showLabel/.test(src),
        'shop-4·shop-9·blog-2 는 왼쪽 칸이 이미 배송비라 라벨이 겹친다');
}

// 상품상세 프레임 전부가 이 컴포넌트를 **살아 있는 코드로** 쓰는지 본다.
const 프레임 = [];
for (const d of readdirSync(FRONT_ROOT + 'src/views/shop')) {
    const p = `src/views/shop/${d}/item/[id].js`;
    if (existsSync(FRONT_ROOT + p)) 프레임.push(['shop/' + d, p]);
}
for (const f of readdirSync(FRONT_ROOT + 'src/views/blog/product/id'))
    if (f.endsWith('.js')) 프레임.push(['blog/' + f.replace('.js', ''), 'src/views/blog/product/id/' + f]);
프레임.push(['공용요약(shop-1,3,5,6,7,8)', 'src/views/@dashboard/e-commerce/details/ProductDetailsSummary.js']);

// 공용 요약을 쓰는 프레임은 자기 파일에 없어도 된다 — 그 컴포넌트가 대신 그린다.
//
// ⚠ 이 판정도 **파서로** 해야 한다. 글자로 세면 주석 안의 <ProductDetailsSummary ... /> 까지
//   위임으로 읽는다. shop-5 가 정확히 그랬다 — import 는 있고 렌더는 주석 안이라 배송비가
//   아무 데도 안 나오는데 검사는 초록불이었다(2026-08-28).
const 위임 = new Set();

// 이 파일이 화면을 그리기는 하는가 — JSX 요소를 하나도 안 만들면 빈 껍데기다.
const 세어보기 = (p) => {
    const ast = parse(readFileSync(FRONT_ROOT + p, 'utf8'), {
        sourceType: 'module', errorRecovery: true,
        plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'],
    });
    let n = 0;
    const 돌기 = (x) => {
        if (!x || typeof x !== 'object') return;
        if (Array.isArray(x)) return x.forEach(돌기);
        if (x.type === 'JSXOpeningElement') n++;
        for (const k of Object.keys(x)) if (k !== 'loc' && !k.endsWith('Comments')) 돌기(x[k]);
    };
    돌기(ast.program);
    return n;
};

const 살아있나 = (p, 이름) => {
    const ast = parse(readFileSync(FRONT_ROOT + p, 'utf8'), {
        sourceType: 'module', errorRecovery: true,
        plugins: ['jsx', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator'],
    });
    let n = 0;
    const 돌기 = (x) => {
        if (!x || typeof x !== 'object') return;
        if (Array.isArray(x)) return x.forEach(돌기);
        if (x.type === 'JSXOpeningElement' && x.name?.name === 이름) n++;
        for (const k of Object.keys(x)) if (k !== 'loc' && !k.endsWith('Comments')) 돌기(x[k]);
    };
    돌기(ast.program);
    return n;
};

// 아직 만들지 않은 껍데기는 건너뛴다.
// shop-10 과 demo-format 은 17줄짜리 빈 파일이다(<></> 만 돌려준다). 라우터에도 shop-10 은
// 주석 처리돼 있어 아무도 못 본다. 여기에 배송비를 요구하면 '영원히 빨간불' 이 되고,
// 그러면 사람이 검사를 꺼 버린다 — 그게 진짜 위험이다.
const 껍데기 = (p) => 세어보기(p) === 0;

for (const [이름, p] of 프레임) {
    if (껍데기(p)) { pass++; console.log(`  ok  ${이름} — 아직 안 만든 껍데기(건너뜀)`); continue; }
    if (p.includes('/shop/') && 살아있나(p, 'ProductDetailsSummary') > 0) 위임.add(이름);
    if (위임.has(이름)) { pass++; console.log(`  ok  ${이름} — 공용 요약에 위임`); continue; }
    const n = 살아있나(p, 'ShippingLine');
    t(`${이름} 이 배송비를 보여준다`, n > 0,
        '주석 안에 넣으면 AST 에 안 잡힌다 — shop-9 은 파일 절반이 블록주석이다');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
