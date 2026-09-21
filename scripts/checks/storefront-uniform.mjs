import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
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

// ── 상품상세 헤더 ────────────────────────────────────────────────────────
// 상품상세만 로고 대신 뒤로가기가 뜨고 헤더가 사진 위에 투명하게 얹혔다.
// 그 화면에서만 어느 몰인지 안 보였다(가맹점 요청 2026-08-21 — 보통 헤더로 통일).
t('프레임3 상세는 상세모드가 아니다', 읽기('src/layouts/shop/blog/demo-1/header.js')
    .includes("setIsDetailPage(path == 'seller');"));
for (const n of [2, 3, 4, 5]) {
    const h = 읽기(`src/layouts/shop/blog/demo-${n}/header.js`);
    const 주석뺀 = h.replace(/\/\*[\s\S]*?\*\//g, '');
    t(`blog demo-${n} 상세에 뒤로가기를 안 띄운다`, !/if \(isProductPage\) \{[\s\S]{0,40}return true;/.test(주석뺀));
    t(`blog demo-${n} 상세 헤더가 투명하지 않다`, !주석뺀.includes('isProductPage) && scrollY < 350'));
}
// 헤더가 겹치지 않게 상세 화면이 그만큼 띄워야 한다 — 안 그러면 사진 위쪽이 헤더에 가린다.
for (const n of [1, 2, 3]) {
    t(`blog 상세 demo-${n} 이 헤더 높이만큼 띄운다`, 읽기(`src/views/blog/product/id/demo-${n}.js`).includes('padding-top:56px;'));
}
// 사진은 자르지 않는다(프레임5·6 과 같은 규칙).
for (const n of [1, 2, 3]) {
    t(`blog 상세 demo-${n} 사진을 자르지 않는다`, 읽기(`src/views/blog/product/id/demo-${n}.js`).includes("backgroundSize: 'contain'"));
}


// ── 마이페이지에서 회원탈퇴로 가는 길 ────────────────────────────────────
// 탈퇴 기능·화면은 6종이 늘 같았는데 입구만 갈려 있었다.
// 블로그형 4종은 닉네임 줄이 유일한 입구였고 거기 이름표가 없어 손님이 찾을 수 없었다.
// 개인정보처리방침은 「마이페이지 → 회원탈퇴」 메뉴를 쓰라고 안내한다 — 그 메뉴를 만들어 맞췄다(2026-09-17).
// 눈에 띄는 버튼으로 키우지 않는다. 확인 단계도 늘리지 않는다
// (개정 전자상거래법 제21조의2 '취소·탈퇴 등의 방해' — 탈퇴 의사를 2단계 이상 되묻는 것이 위반 예시다).
for (const 파일 of [
    'src/views/shop/demo-1/auth/my-page.js',
    'src/views/shop/demo-2/auth/my-page.js',
    'src/views/blog/auth/my-page/demo-1.js',
    'src/views/blog/auth/my-page/demo-2.js',
    'src/views/blog/auth/my-page/demo-4.js',
]) {
    const src = 읽기(파일);
    t(`${파일.split('/').slice(-2).join('/')} 마이페이지에 회원탈퇴 입구가 있다`,
        src.includes("router.push('/shop/auth/resign')") && src.includes("translate('회원탈퇴')"));
}
// 블로그형은 닉네임 줄이 입구다 — 거기 이름표가 붙어 있어야 한다.
for (const n of [1, 2, 4]) {
    const src = 읽기(`src/views/blog/auth/my-page/demo-${n}.js`);
    t(`blog demo-${n} 닉네임 줄에 「회원정보 수정」 이름표가 있다`,
        /\{user\.nickname\}[\s\S]{0,400}translate\('회원정보 수정'\)/.test(src));
}


// ── 푸터의 「비회원 주문조회」 ───────────────────────────────────────────
// 회원가입 없이 주문한 손님이 주문·배송을 확인하는 유일한 길이다.
// 예전에는 프레임5·6(BlogLayout6)만 푸터에 두었고, 1·2는 햄버거 메뉴 안,
// 3·4는 로그인 화면에만 있어 비회원이 도달할 방법이 사실상 없었다.
// 가맹점 이용가이드도 「쇼핑몰 하단 비회원 주문조회」 라고 안내한다 — 6종을 그 모양으로 맞췄다(2026-09-18).
// (카페24 기본도 로그인 화면에 두지만, 우체국쇼핑처럼 푸터에 상시 노출하는 쪽이 비회원에게 맞다)
for (const 푸터 of [
    'src/layouts/shop/shop/demo-1/footer.js',      // 프레임1
    'src/layouts/shop/shop/demo-2/footer.js',      // 프레임2
    'src/layouts/shop/blog/demo-1/footer.js',      // 프레임3
    'src/layouts/shop/blog/demo-2/footer.js',      // 프레임4
    'src/layouts/shop/blog/demo-6/BlogLayout6.js', // 프레임5·6
]) {
    const src = 읽기(푸터);
    t(`${푸터.split('/').slice(-2).join('/')} 푸터에 비회원 주문조회가 있다`,
        src.includes("router.push('/shop/auth/order-check')") && src.includes("translate('비회원 주문조회')"));
}


// ── 헤더 두 줄의 왼쪽 끝 맞추기 ─────────────────────────────────────────
// 로고·검색 줄(TopMenuContainer)과 카테고리 줄(CategoryContainer)은 폭이 같아야
// 왼쪽 끝이 한 열로 떨어진다. 숫자가 갈라져 있어서 실제로 어긋났다(2026-09-21 가맹점 제보):
//   프레임1 : 1622px/100% vs 1600px/90%  → 1280 에서 64px, 1920 에서 11px
//   프레임2 : 1500px/90%  vs 1600px/90%  → 1920 에서 50px
// 바깥 테두리 띠는 별도 div 라 이 폭과 무관하다 — 화면 끝까지 그대로 간다.
for (const [프레임, 파일] of [['프레임1', 'src/layouts/shop/shop/demo-1/header.js'],
                              ['프레임2', 'src/layouts/shop/shop/demo-2/header.js']]) {
    const src = 주석제거(읽기(파일));
    const 폭 = (이름) => {
        const i = src.indexOf(`const ${이름} = styled.div\``);
        if (i < 0) return null;
        const 조각 = src.slice(i, src.indexOf('`', i + 30 + 이름.length));
        const mw = 조각.match(/max-width:\s*(\d+)px/);
        const w = 조각.match(/width:\s*(\d+)%/);
        return mw && w ? `${mw[1]}px/${w[1]}%` : null;
    };
    const 위 = 폭('TopMenuContainer'), 아래 = 폭('CategoryContainer');
    t(`${프레임} 헤더 두 줄의 폭이 같다`, 위 !== null && 위 === 아래, `위=${위} 아래=${아래}`);
}


// ── 상품카드 사진 상자는 폭에 비율로 묶는다 (프레임2) ───────────────────
// 높이를 화면 폭 구간별 vw 로 따로 정하면 카드 폭(열 수로 결정)과 어긋나 상자 비율이
// PC 1.14 / 모바일 1.33 으로 달라지고, 사진이 cover 라 모바일에서 위아래가 더 잘린다
// (포스몰 제보 2026-09-21: "PC에선 온전한 사진이 모바일에선 잘린다").
// aspect-ratio 를 상품카드 설정 image.ratio(기본 1) 에서 받고, 값이 없는 옛 설정도 1 로 떨어져야 한다.
{
    const src = 주석제거(읽기('src/components/elements/shop/demo-2.js'));
    const 사진상자 = src.slice(src.indexOf('const ItemImgContainer = styled.div`'), src.indexOf('const ItemTextContainer'));
    t('프레임2 카드 사진 상자에 vw 고정 높이가 없다', !/height:\s*\d+(vw|px)/.test(사진상자), '높이를 폭 구간별로 다시 넣으면 PC·모바일 비율이 갈라진다');
    // 6종 통일(2026-09-22): 프레임2도 contain — 어느 비율로 올려도 잘리지 않는다. 배경 방식이라 no-repeat 이 필수다.
    t('프레임2 카드 사진이 contain + no-repeat 이다(잘리지 않고, 여백에 반복되지 않는다)',
        /backgroundSize: 'contain',\s*backgroundRepeat: 'no-repeat'/.test(src));
    t('프레임2 카드 사진이 image.ratio 비율로 폭에 묶여 있다',
        /aspectRatio:\s*`\$\{Number\(itemThemeCss\?\.image\?\.ratio\) > 0 \? Number\(itemThemeCss\.image\.ratio\) : 1\} \/ 1`/.test(src),
        'ratio 가 없는 옛 설정에서 aspectRatio 가 undefined 가 되면 상자가 0 높이로 접힌다');
}


// ── 상품카드 사진 상자 — 프레임1·4 도 같은 규칙 (2026-09-22) ─────────────
// 프레임1: 상자 높이가 화면 폭 구간별 vw 라 비율이 PC 1.07 / 모바일 1.40 — 사진이 잘리진 않아도(contain)
//          기기마다 사진 크기가 달랐다. 프레임2 처럼 aspect-ratio 로 폭에 묶는다.
// 프레임4: 사진에 object-fit 이 없어 기본값 fill 로 그려졌다 — 정사각 아닌 사진이 늘어난다.
//          상자(ItemContent)는 aspect-ratio 1/1 이어도 글자가 밀어 정사각이 안 지켜지므로 사진 자체를 정사각으로.
{
    const f1 = 주석제거(읽기('src/components/elements/shop/demo-1.js'));
    const 상자 = f1.slice(f1.indexOf('const ItemImgContainer = styled.div`'), f1.indexOf('const ItemTextContainer'));
    t('프레임1 카드 사진 상자에 vw/px 고정 높이가 없다', !/height:\s*\d+(vw|px)/.test(상자));
    t('프레임1 카드 사진 상자가 image.ratio 비율로 폭에 묶여 있다',
        /<ItemImgContainer style=\{\{ aspectRatio: `\$\{Number\(itemThemeCss\?\.image\?\.ratio\) > 0 \? Number\(itemThemeCss\.image\.ratio\) : 1\} \/ 1` \}\}>/.test(f1));
    t('프레임1 카드 사진은 contain(잘리지 않음)이고 상자를 꽉 채운다', /object-fit: contain;[\s\S]{0,60}width: 100%;[\s\S]{0,20}height: 100%;/.test(상자 + f1.slice(f1.indexOf('const ItemImg = styled(LazyLoadImage)'), f1.indexOf('export const Item1'))));

    const f4 = 주석제거(읽기('src/components/elements/blog/demo-2.js'));
    const 카드사진 = [...f4.matchAll(/<LazyLoadImage style=\{\{([^}]*)\}\} src=\{item\?\.product_img\} \/>/g)].map((m) => m[1]);
    t('프레임4 상품카드 사진 두 곳 모두 정사각 + 맞춤 방식이 있다',
        카드사진.length >= 2 && 카드사진.every((st) => /aspectRatio: '1 \/ 1'/.test(st) && /objectFit: '(contain|cover)'/.test(st)),
        `찾은 카드사진 ${카드사진.length}곳: ${카드사진.map((s) => s.trim()).join(' | ').slice(0, 160)}`);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
