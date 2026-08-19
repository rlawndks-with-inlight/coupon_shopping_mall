import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 기본 택배사.
//
// 붙잡아 두는 것:
//  · 설정과 주문관리가 **같은 목록**을 써야 한다. 목록이 갈리면 설정에서 고른 값이
//    주문 화면 드롭다운에 없어서, 골라 뒀는데 빈 칸으로 보인다(MUI Select 는 없는 값을 못 그린다).
//  · 기본값은 '시작값'일 뿐이다. 이미 택배사가 저장된 주문을 덮어쓰면 안 된다.
//  · 목록에서 사라진 택배사가 설정에 남아 있으면 없는 것으로 봐야 한다(같은 이유).

let pass = 0, fail = 0;
const eq = (n, g, w) => {
    if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
    else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); }
};

const { COURIER_LIST, 기본택배사 } = await import('file:///' + FRONT_ROOT + 'src/data/couriers.js');

eq('택배사 목록이 있다', COURIER_LIST.length > 5, true);
eq('설정한 택배사를 돌려준다', 기본택배사({ setting_obj: { default_courier: 'CJ대한통운' } }), 'CJ대한통운');
eq('설정이 없으면 빈 값', 기본택배사({ setting_obj: {} }), '');
eq('브랜드 정보가 없어도 안 죽는다', 기본택배사(undefined), '');
// 목록에 없는 값은 없는 것으로 본다 — 드롭다운이 빈 칸으로 뜨는 것을 막는다
eq('목록에 없는 택배사는 무시', 기본택배사({ setting_obj: { default_courier: '없어진택배' } }), '');

const 주문 = readFileSync(FRONT_ROOT + 'src/pages/manager/orders/trx/[type].js', 'utf8');
const 설정 = readFileSync(FRONT_ROOT + 'src/pages/manager/settings/default/[brand_id].js', 'utf8');

eq('주문관리가 공용 목록을 쓴다', /from 'src\/data\/couriers'/.test(주문), true);
eq('설정관리가 공용 목록을 쓴다', /from 'src\/data\/couriers'/.test(설정), true);
eq('주문관리에 목록을 다시 박아두지 않았다', /const COURIER_LIST = \[/.test(주문), false);

// 이미 저장된 택배사가 있으면 그것을 쓰고, 없을 때만 기본값으로 시작한다
eq('저장된 값이 우선', /useState\(isCourier \? maybeCourier : 기본택배사\(themeDnsData\)\)/.test(주문), true);
eq('설정에 기본 택배사 칸이 있다', /기본 택배사/.test(설정), true);
eq('지정 안 함을 고를 수 있다', /지정 안 함/.test(설정), true);

// displayEmpty 를 쓰면 값이 비어 있어도 칸에 '지정 안 함' 이 그려진다. 그런데 라벨은
// 값이 없다고 보고 안 올라가서, 두 글자가 그대로 겹쳐 보였다(실제로 그렇게 나갔다).
// 라벨을 손으로 올리고(shrink) 테두리 홈도 같이 뚫어 준다(notched).
// 끝을 '지정 안 함' 으로 잡으면 안 된다 — 그 말이 바로 위 주석에도 나와서 범위가 거기서
// 끊긴다(그렇게 잡았다가 멀쩡한 코드를 두고 검사가 울었다). 실제 코드 한 줄로 끊는다.
const 택배사칸 = 설정.slice(설정.indexOf('기본 택배사 —'), 설정.indexOf('COURIER_LIST.map'));
eq('라벨을 손으로 올린다', /<InputLabel shrink>기본 택배사<\/InputLabel>/.test(택배사칸), true);
eq('테두리 홈을 뚫는다', /<OutlinedInput notched label='기본 택배사' \/>/.test(택배사칸), true);
eq('겹치는 원인(displayEmpty)이 그대로 있다', /displayEmpty/.test(택배사칸), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
