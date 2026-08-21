import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync, existsSync } from 'fs';

// 프레임마다 갈려 있던 것들을 하나로 맞춘 뒤 다시 갈라지지 않게 잡아 둔다.
// (가맹점 피드백 2026-08-21)
//
//   · 주문내역 표의 머리 칸 수가 본문 칸 수와 달라 값이 한 칸씩 밀려 보였다
//   · 결제대기인데도 프레임에 따라 취소요청 버튼이 안 떴다(주문 객체를 안 넘겨서)
//   · 찜은 어떤 프레임엔 있고 어떤 프레임엔 없었다 — 안 쓰기로 하고 전부 감춘다
//   · 관리자 주문조회의 '구매시간' 이 결제 확정 전에는 늘 '--- ---' 이었다

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 주문내역 표: 머리 칸 수 = 본문 칸 수 ──────────────────────────────────
// 머리에만 있던 '구매자명'·이름 없는 맨 끝 칸 때문에 배송지부터 값이 왼쪽으로 밀렸다.
// 칸 수를 세어 비교한다 — 눈으로는 '왜 주문상태 자리에 날짜가 있지?' 로만 보인다.
for (const [파일, 표] of [
    ['src/components/elements/shop/common.js', 'HistoryTable'],
    ['src/components/elements/blog/common.js', 'HistoryTable'],
]) {
    const src = 읽기(파일);
    const i = src.indexOf(`export const ${표} = props =>`);
    const 끝 = src.indexOf('export const ', i + 20);
    const 조각 = src.slice(i, 끝 < 0 ? src.length : 끝);

    const 머리 = 조각.slice(조각.indexOf('TABLE_HEAD = ['), 조각.indexOf('];', 조각.indexOf('TABLE_HEAD = [')));
    // 주석 줄은 빼고 센다
    const 머리칸 = (머리.replace(/^\s*\/\/.*$/gm, '').match(/\{ id: /g) ?? []).length;
    const 조건부머리 = (머리.match(/\.\.\.\(/g) ?? []).length;

    // 주석 안의 <TableCell> 까지 세면 안 된다 — 옛 '주문일' 칸이 통째로 주석으로 남아 있다.
    const 본문 = 조각.slice(조각.indexOf('<TableBody>'), 조각.indexOf('</TableBody>'))
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
    const 본문칸 = (본문.match(/<TableCell[\s>]/g) ?? []).length;
    const 조건부본문 = (본문.match(/id == 64 \|\| themeDnsData\?\.id == 84/g) ?? []).length;

    const 이름 = 파일.split('/').slice(-2).join('/');
    t(`${이름} 표 머리와 본문 칸 수가 같다`, 머리칸 === 본문칸,
        `머리 ${머리칸} / 본문 ${본문칸}`);
    t(`${이름} 조건부 칸도 양쪽에 같이 있다`, 조건부머리 === 조건부본문,
        `머리 ${조건부머리} / 본문 ${조건부본문}`);
    t(`${이름} 이름 없는 빈 칸을 두지 않는다`, !/\{ id: '' \}/.test(머리));
}

// ── 취소요청은 모든 프레임에서 뜬다 ───────────────────────────────────────
// 버튼(OrderCancelButton)은 trx 로 상태를 판정한다. 목록을 평탄화하면서 그 객체를
// 안 실어 주면 판정이 항상 거짓이 되어 '이 프레임만 취소가 안 된다' 가 된다.
for (const n of [1, 2, 3, 4, 5]) {
    const f = `src/views/blog/auth/my-page/order/demo-${n}.js`;
    if (!existsSync(FRONT_ROOT + f)) continue;
    const s = 읽기(f);
    const 씀 = /<OrderCancelButton[\s\S]{0,80}trx=\{item[?.]*\.trx\}/.test(s);
    t(`blog order demo-${n} 취소 버튼이 있다`, 씀);
    if (!씀) continue;
    // 평탄화한 줄에 주문 원본이 실려 있는가(...trx 스프레드가 아니라 trx 자체여야 한다)
    // 실어 보내는 모양은 화면마다 다르다: `trx,` 한 줄이거나 `{ ...order, trx }` 이거나.
    t(`blog order demo-${n} 이 주문 원본을 넘긴다`,
        /^\s*trx,\s*$/m.test(s) || /,\s*trx\s*\}/.test(s),
        'flat 목록에 trx 가 없으면 버튼이 영영 안 뜬다');
}

// ── 찜은 어디에도 보이지 않는다 ───────────────────────────────────────────
const 스위치 = 읽기('src/data/wish.js');
t('찜 스위치가 꺼져 있다', /export const 찜기능사용 = false;/.test(스위치));

// 하트 버튼·메뉴가 스위치 없이 남아 있으면 그 프레임만 다시 찜이 보인다.
for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const f = `src/layouts/shop/shop/demo-${n}/header.js`;
    if (!existsSync(FRONT_ROOT + f)) continue;
    const s = 읽기(f);
    const 주석뺀 = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const 하트 = /heart/i.test(주석뺀);
    t(`shop demo-${n} 헤더: 찜이 스위치 뒤에 있다`, !하트 || 주석뺀.includes('찜기능사용'),
        '하트는 있는데 스위치가 없다');
    t(`shop demo-${n} 헤더: 메뉴에 찜 항목이 없다`, !/name: (translate\('찜목록'\)|"찜목록"|translate\('위시리스트'\))/.test(주석뺀));
}
// 주소를 직접 쳐도 안 보여야 한다.
const 찜페이지 = 읽기('src/pages/shop/auth/wish.js');
t('찜 주소로 들어와도 홈으로 보낸다',
    찜페이지.includes("if (!찜기능사용) router.replace('/shop')") && 찜페이지.includes('if (!찜기능사용) return'));
// 저장된 찜 데이터는 지우지 않는다(되돌릴 수 있어야 한다).
t('찜 데이터를 지우지는 않는다', existsSync(FRONT_ROOT + 'src/components/elements/shop/WishPanel.js'));

// ── 관리자 주문조회: 구매시간 ─────────────────────────────────────────────
const 관리자 = 읽기('src/pages/manager/orders/trx/[type].js');
t('승인 전에는 접수시각을 보여준다',
    관리자.includes("return 승인 || (row['created_at'] ?? '---');"),
    "trx_dt·trx_tm 은 PG 승인 시각이라 결제대기 건은 늘 비어 있다");

// ── 호버해야만 뜨는 메뉴가 없다 ───────────────────────────────────────────
// 터치 화면에서는 열 방법이 없고, 마우스에서도 '거기 뭐가 있다'를 알아야만 찾는다.
for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const f = `src/layouts/shop/shop/demo-${n}/header.js`;
    if (!existsSync(FRONT_ROOT + f)) continue;
    t(`shop demo-${n} 헤더에 호버 전용 메뉴가 없다`, !읽기(f).includes('isAuthMenuOver'));
}

// ── 혜택 안내 팝업 ────────────────────────────────────────────────────────
const 혜택 = 읽기('src/components/elements/shop/BenefitNotice.js');
t('혜택 안내 폭을 넓혔다', /maxWidth="md"/.test(혜택));
t('이미지를 눌러 원본을 볼 수 있다', /el\?\.tagName === 'IMG'/.test(혜택) && /cursor: 'zoom-in'/.test(혜택));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
