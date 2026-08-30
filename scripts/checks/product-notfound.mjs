import { readFileSync } from 'fs';

// 없는 상품 주소로 들어왔을 때 손님이 길을 잃지 않게 한다 (2026-08-30).
//
// [무엇이 있었나] 판매 중인 6개 프레임을 운영 화면에서 전부 태워 봤더니, 지운 상품이나
// 오래된 링크로 들어가면 프레임마다 이랬다.
//   · 프레임1·2 : 화면이 통째로 죽고 「Application error: a client-side exception has occurred」
//                 영어 한 줄만 떴다. **빠져나갈 버튼도 없었다.**
//                 원인은 ProductDetailsCarousel 의 한 줄 — 거기만 `?.` 가 빠져 있어
//                 `product.sub_images.length` 가 undefined.length 로 터졌다.
//   · 프레임5·6 : 「Loading...」 에서 영원히 멈췄다(영어).
//   · 프레임3·4 : 값이 하나도 없는 빈 상세 껍데기가 그려졌다.
//
// 인터넷을 잘 모르는 손님에게는 셋 다 '몰이 고장났다' 로 보인다. 여섯 프레임이 같은 안내를 쓰게 했다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(p, 'utf8').split(String.fromCharCode(13)).join('');

// 판매 중인 6개 프레임의 상품상세 화면
const 프레임 = [
    ['프레임1 shop:1', 'src/views/shop/demo-1/item/[id].js'],
    ['프레임2 shop:2', 'src/views/shop/demo-2/item/[id].js'],
    ['프레임3 blog:1', 'src/views/blog/product/id/demo-1.js'],
    ['프레임4 blog:2', 'src/views/blog/product/id/demo-2.js'],
    ['프레임5 blog:4', 'src/views/blog/product/id/demo-4.js'],
    ['프레임6 blog:9', 'src/views/blog/product/id/demo-9.js'],
];
for (const [이름, p] of 프레임) {
    const s = 읽기(p);
    t(`${이름} — 없는 상품 안내를 쓴다`, /import ProductNotFound/.test(s) && /<ProductNotFound/.test(s),
        '안내가 없으면 빈 껍데기·영어 Loading·백지 중 하나가 된다');
    t(`${이름} — 못 찾았을 때를 표시한다`, /setNotFound\(true\)/.test(s),
        '조회 실패를 기록하지 않으면 안내를 띄울 수가 없다');
}

// 공용 안내 화면 자체
const 안내 = 읽기('src/components/elements/shop/ProductNotFound.js');
t('안내가 한국어다', /상품을 찾을 수 없습니다\./.test(안내));
t('안내가 번역을 탄다', /translate\(/.test(안내),
    '문구를 그대로 박으면 외국어 화면에서도 한국어로 나간다');
t('돌아갈 길을 준다', /router\.push\('\/'\)/.test(안내) && /router\.push\('\/shop\/items'\)/.test(안내),
    '빠져나갈 버튼이 없으면 뒤로가기 말고는 방법이 없다');

// 화면을 죽이던 그 한 줄
const 캐러셀 = 읽기('src/views/@dashboard/e-commerce/details/ProductDetailsCarousel.js');
t('캐러셀이 sub_images 를 안전하게 읽는다',
    !/product\.sub_images\.length/.test(캐러셀) && /product\.sub_images\?\.length/.test(캐러셀),
    '이 한 줄 때문에 프레임1·2 화면이 통째로 죽었다');

// 손님이 눌러야 하는 버튼은 한국어여야 한다 (프레임5 만 영어로 박혀 있었다)
for (const [이름, p] of 프레임) {
    const s = 읽기(p);
    t(`${이름} — 살 수 있는 버튼이 한국어다`,
        !/>Add to Cart<|>Buy Now/.test(s),
        '인터넷을 모르는 손님에게 Add to Cart / Buy Now 는 읽히지 않는다');
}

for (const lang of ['ko', 'en', 'ja', 'cn', 'es']) {
    const dict = readFileSync(`src/locales/langs/${lang}.js`, 'utf8');
    t(`${lang} 사전에 안내 문구가 있다`,
        ['상품을 찾을 수 없습니다.', '판매가 끝났거나 주소가 잘못되었습니다.', '다른 상품 보기', '홈으로']
            .every((문구) => dict.includes(`"${문구}"`)));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
