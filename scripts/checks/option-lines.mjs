import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 선택한 옵션을 '줄' 로 쌓기 (포스페이 요청서 20260824 · 9번).
//
// [제보] "따로고르기 — 다른 옵션으로 구매시 추가가 되어야 하는데 기존 옵션이 사라짐 /
//        추가옵션 — 1개만 구매가능, 추가로 살 수 없음"
//
// 재현해 보니 **장바구니는 이미 옵션별로 따로 담긴다**(크기=소·색상=소 와 크기=중·색상=중
// 이 두 줄로 들어간다). 사라지는 것은 상품상세의 드롭다운이었다 — 값이 하나뿐이라
// 다른 것을 고르면 앞의 것이 바뀐다. 기대한 것은 한국 쇼핑몰 표준인
// '고른 옵션이 목록으로 쌓이고 줄마다 수량을 조절하는' 방식이었다.
//
// [설계] selectProductGroups 에 lines 를 더한다. 줄 하나 = 하나의 구매 단위.
//   장바구니 한 줄이 이미 { groups, order_count } 라 모양이 같아서
//   금액·재고·조합형 계산을 **하나도 바꾸지 않는다**. 담을 때 줄마다 부르기만 한다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// ── 줄 다루는 함수들을 실제로 돌린다 ─────────────────────────────────────
const 소스 = 읽기('src/data/product-options.js');
const mod = await import('data:text/javascript;base64,' + Buffer.from(소스).toString('base64'));
const { optionLineKey, isRequiredComplete, closeOptionLine, removeOptionLine, setOptionLineCount, purchaseUnits } = mod;

const 그룹 = (id, name, opt) => ({ id, group_name: name, group_type: 0, options: [opt] });
const 옵션 = (id, name, price = 0) => ({ id, option_name: name, option_price: price });
const 상품 = {
    id: 1, product_sale_price: 5000000, option_mode: 0,
    groups: [
        { id: 10, group_name: '크기', group_type: 0, options: [옵션(101, '소'), 옵션(102, '중', 1000)] },
        { id: 20, group_name: '색상', group_type: 0, options: [옵션(201, '빨강'), 옵션(202, '파랑')] },
        { id: 30, group_name: '추가상품', group_type: 1, options: [옵션(301, '장판', 30000)] },
    ],
};
const 조합 = (크기, 색상) => [그룹(10, '크기', 크기), 그룹(20, '색상', 색상)];

// 같은 조합이면 순서가 달라도 같은 열쇠여야 한다 — 아니면 화면에서 합친 줄이 장바구니에서 갈린다.
t('조합 열쇠는 순서에 무관하다',
    optionLineKey(조합(옵션(101, '소'), 옵션(201, '빨강')))
    === optionLineKey([그룹(20, '색상', 옵션(201, '빨강')), 그룹(10, '크기', 옵션(101, '소'))]));
t('다른 조합은 다른 열쇠', optionLineKey(조합(옵션(101, '소'), 옵션(201, '빨강')))
    !== optionLineKey(조합(옵션(102, '중'), 옵션(201, '빨강'))));

// 완성 판정 — 추가상품은 필수가 아니다(이 개편의 핵심).
t('필수를 다 골라야 완성', isRequiredComplete(상품, 조합(옵션(101, '소'), 옵션(201, '빨강'))));
t('하나만 고르면 미완성', !isRequiredComplete(상품, [그룹(10, '크기', 옵션(101, '소'))]));
t('추가상품만 골라서는 완성이 아니다',
    !isRequiredComplete(상품, [{ id: 30, group_name: '추가상품', group_type: 1, options: [옵션(301, '장판', 30000)] }]),
    '추가상품은 안 골라도 살 수 있다 — 필수로 세면 옛 구조로 되돌아간다');
t('필수 그룹이 없는 상품은 줄로 쌓지 않는다', !isRequiredComplete({ groups: [] }, []),
    '옵션 없는 상품은 예전처럼 한 단위로 담겨야 한다');

// 줄 쌓기
{
    let s = { count: 1, groups: 조합(옵션(101, '소'), 옵션(201, '빨강')) };
    s = closeOptionLine(s);
    t('확정하면 줄이 생긴다', s.lines?.length === 1);
    t('확정하면 고르는 중이 비워진다', (s.groups ?? []).length === 0,
        '안 비우면 담을 때 같은 조합이 두 번 들어간다');
    s = { ...s, groups: 조합(옵션(102, '중', 1000), 옵션(202, '파랑')) };
    s = closeOptionLine(s);
    t('두 번째 조합이 줄로 쌓인다', s.lines.length === 2);
    t('앞 줄이 그대로 남는다', s.lines[0].groups.length === 2, '← 제보의 핵심');

    // 같은 조합을 또 고르면 줄이 갈리지 않고 수량이 는다(장바구니에서 어차피 합쳐진다).
    s = { ...s, groups: 조합(옵션(101, '소'), 옵션(201, '빨강')), count: 2 };
    s = closeOptionLine(s);
    t('같은 조합은 수량만 는다', s.lines.length === 2 && s.lines[0].count === 3);

    // 수량·삭제
    const key = s.lines[1].key;
    let s2 = setOptionLineCount(s, key, 5);
    t('줄 수량을 바꾼다', s2.lines[1].count === 5);
    t('다른 줄은 안 건드린다', s2.lines[0].count === 3);
    t('0 이하로 내리면 줄이 빠진다', setOptionLineCount(s, key, 0).lines.length === 1,
        '− 를 계속 누르면 빠지는 것이 자연스럽다');
    t('빼기', removeOptionLine(s, key).lines.length === 1);
}

// 담을 단위
{
    let s = { count: 1, groups: 조합(옵션(101, '소'), 옵션(201, '빨강')) };
    s = closeOptionLine(s);
    s = { ...s, groups: 조합(옵션(102, '중', 1000), 옵션(202, '파랑')) };
    s = closeOptionLine(s);
    const u = purchaseUnits(s);
    t('담을 단위가 줄 수와 같다', u.length === 2);
    t('단위마다 조합과 수량을 갖는다', u.every((x) => x.groups.length === 2 && x.count >= 1));
    t('쌓인 줄임을 표시한다', u.every((x) => x.쌓인줄 === true),
        '화면이 수량·삭제를 어느 통로로 보낼지 이걸로 가른다');

    // 줄이 있으면 고르다 만 것은 담지 않는다(담기 직전 assertOptionsSelected 가 막는다).
    const s3 = { ...s, groups: [그룹(10, '크기', 옵션(101, '소'))] };
    t('줄이 있을 때 고르다 만 것은 단위에 안 들어간다', purchaseUnits(s3).length === 2,
        '반쪽 조합이 장바구니에 들어가면 안 된다');
}
// 옵션이 없는 상품 — 예전 그대로 한 단위
{
    const u = purchaseUnits({ count: 3, groups: [] });
    t('옵션 없는 상품은 한 단위', u.length === 1 && u[0].count === 3);
}

// ── 배선 ─────────────────────────────────────────────────────────────────
const addons = 주석제거(읽기('src/components/elements/shop/ProductAddons.js'));
const util = 주석제거(읽기('src/utils/shop-util.js'));
const lines = 주석제거(읽기('src/components/elements/shop/SelectedOptionLines.js'));

// 확정은 프레임 11개 전부가 쓰는 ProductAddons 에서 한다.
// 프레임마다 옵션 UI 가 달라서(공용 ProductOptions 를 쓰는 화면은 둘뿐이다)
// 호출부 19곳에 인자를 넘기게 하면 한 곳만 빠뜨려도 그 화면에서만 안 먹는다.
t('확정을 ProductAddons 에서 한다', /isRequiredComplete\(product, selected\?\.groups\)/.test(addons));
t('완성되면 close 를 보낸다', /type: 'close'/.test(addons));
t('훅이 조기 반환보다 앞에 있다',
    addons.indexOf('useEffect(') < addons.indexOf('return null;'),
    '뒤에 두면 렌더마다 훅 개수가 달라져 화면이 통째로 백지가 된다(이 저장소에서 겪은 사고다)');
t('확정 뒤 드롭다운을 비운다', /sel\.selectedIndex = 0;/.test(addons),
    '프레임들의 select 는 비제어라 상태만 비우면 화면에 옛 값이 남는다');
t('이 상품의 옵션 이름을 가진 select 만 건드린다', /requiredGroups\(product\)/.test(addons)
    && /t === 이름 \|\| t\.startsWith\(이름/.test(addons),
    '화면의 모든 select 를 건드리면 엉뚱한 칸이 초기화된다');

// 줄 조작은 모든 프레임이 이미 쓰는 길목으로 보낸다.
t('줄 조작 통로가 있다', /줄조작표/.test(util) && /type === 'remove'/.test(util) && /type === 'count'/.test(util));
t('내부 표식은 저장 전에 벗긴다', /const \{ \[줄조작표\]: _버림, \.\.\.나머지 \} = group;/.test(util),
    '안 벗기면 장바구니와 주문 payload 에 실려 서버까지 간다');

// 담기·바로구매·재고가 줄마다 돈다.
t('담기가 줄마다 담는다', /for \(const 단위 of purchaseUnits\(selectProductGroups\)\)/.test(util));
t('바로구매가 줄마다 만든다', /purchaseUnits\(selectProductGroups\)\.map\(/.test(util));
t('재고를 줄마다 본다', /for \(const 단위 of purchaseUnits\(selectProductGroups\)\)[\s\S]{0,200}maxOrderable/.test(util),
    '합쳐서 한 번만 보면 빨강은 남았는데 파랑이 품절인 경우를 놓친다');

// 금액은 반드시 공용 규칙으로 — 여기서 따로 더하면 화면과 청구가 갈린다.
t('줄 금액을 optionExtraPrice 로 구한다', /optionExtraPrice\(product, \{ groups: 줄\.groups \}\)/.test(lines));
t('아직 안 쌓인 줄은 다른 통로로 보낸다', /줄\.쌓인줄/.test(lines),
    'lines 에 없는 줄에 count/remove 를 보내면 그 줄만 안 먹는다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
