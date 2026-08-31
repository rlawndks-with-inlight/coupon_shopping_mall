import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 상품 사진을 손가락으로 밀어 넘길 수 있는가.
//
// 제보(2026-08-31, 모바일): "상품 슬라이드가 드래그가 안 된다."
// 재 보니 프레임마다 사진 영역의 만듦새가 달라 두 갈래로 나뉘어 있었다.
//
//   · 프레임1·2 (shop 1·2)   : react-slick — 터치는 되는데 draggable:false 라 PC 마우스는 안 됐다.
//   · 프레임3·4 (blog 1·2)   : react-slick 기본값 — 둘 다 됐다.
//   · 프레임5·6 (blog 4·9)   : **슬라이더가 아예 없다.** 큰 <img> 한 장 + 아래 썸네일 버튼뿐이라
//                              밀어도 아무 일이 없었다(사진 4장짜리 상품에서 실측).
//
// 그래서 앞은 draggable 을 되살리고, 뒤는 imageSwipeHandlers 로 미는 동작만 얹었다.
// 슬라이더를 끼우지 않은 이유는 ProductThumbs.js 주석에 적어 뒀다(사진 칸 모양이 프레임마다 다르다).

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 프레임1·2 : react-slick 큰 이미지 ────────────────────────────────────
const 캐러셀 = 읽기('src/views/@dashboard/e-commerce/details/ProductDetailsCarousel.js');
t('큰 이미지를 마우스로도 끌 수 있다', /draggable:\s*true/.test(캐러셀),
    'draggable:false 로 되돌리면 휴대폰은 되는데 PC 만 안 되는 상태로 돌아간다');
t('draggable:false 가 남아 있지 않다', !/draggable:\s*false/.test(주석제거(캐러셀)));

// ── 어느 프레임에서도 미는 것을 끄지 않는다 ───────────────────────────────
// swipe·touchMove 를 끄면 휴대폰에서 사진이 통째로 안 넘어간다.
for (const f of [
    'src/views/@dashboard/e-commerce/details/ProductDetailsCarousel.js',
    'src/views/blog/product/id/demo-1.js',
    'src/views/blog/product/id/demo-2.js',
    'src/views/blog/product/id/demo-3.js',
]) {
    const s = 주석제거(읽기(f));
    t(`${f.split('/').pop()} : 미는 동작을 끄지 않았다`,
        !/swipe:\s*false/.test(s) && !/touchMove:\s*false/.test(s));
}

// ── 프레임5·6 계열 : 슬라이더 없이 손가락 동작만 얹은 화면 ─────────────────
const 썸 = 읽기('src/components/elements/shop/ProductThumbs.js');
t('미는 동작 도우미가 있다', /export const imageSwipeHandlers = /.test(썸));
// 훅으로 만들면 안 된다 — 이 화면들은 조기 return 이 images 보다 위에 있어서
// 훅을 그 자리에서 부르면 훅 순서가 깨지고 화면이 백지가 된다.
t('훅이 아니라 그냥 함수다', !/^\s*(export )?const imageSwipeHandlers[\s\S]{0,400}?use(Ref|State|Memo|Callback)\(/m.test(썸),
    '조기 return 아래에서 부르므로 훅이면 순서가 깨진다');
// 세로 스크롤을 잡아먹으면 화면을 굴릴 수 없게 된다.
t('세로로 움직이면 사진을 건드리지 않는다', /Math\.abs\(dx\) <= Math\.abs\(dy\)/.test(썸),
    '가로/세로를 안 가리면 화면을 굴릴 때마다 사진이 넘어간다');
t('스크롤을 막지 않는다', !/preventDefault/.test(주석제거(썸)));
// 끝에서 멈춘다 — 썸네일도 순환하지 않으므로 둘이 어긋나면 안 된다.
t('끝에서 멈춘다(순환하지 않는다)', /다음 < 0 \|\| 다음 > 장수 - 1/.test(썸));
// 사진이 한 장이면 아무 동작도 걸지 않는다(빈 손짓에 반응하면 이상하다).
t('사진이 한 장이면 아무것도 안 한다', /장수 < 2[\s\S]{0,60}return \{\};/.test(썸));

// 썸네일을 쓰는 화면 전부에 같은 손동작이 걸려 있어야 한다.
// 하나만 빠지면 그 프레임에서만 조용히 안 된다 — 프레임이 늘 때 실제로 그렇게 샌다.
for (const n of [4, 5, 6, 7, 8, 9]) {
    const f = `src/views/blog/product/id/demo-${n}.js`;
    const s = 읽기(f);
    if (!/ProductThumbs/.test(s)) continue;
    t(`blog demo-${n} : 큰 사진을 밀 수 있다`,
        /imageSwipeHandlers\(images, imgIdx, setImgIdx\)/.test(s) && /imageSwipeHandlers/.test(s.split('\n')[0] + s),
        '썸네일은 있는데 미는 동작이 없으면 제보와 같은 상태가 된다');
    t(`blog demo-${n} : 도우미를 불러온다`,
        /import ProductThumbs, \{[^}]*imageSwipeHandlers[^}]*\} from 'src\/components\/elements\/shop\/ProductThumbs'/.test(s));
    // 썸네일과 같은 상태를 써야 둘이 어긋나지 않는다.
    t(`blog demo-${n} : 썸네일과 같은 상태를 쓴다`,
        /activeIndex=\{imgIdx\} onSelect=\{setImgIdx\}/.test(s));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
