import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync, readdirSync } from 'fs';

// 대시보드 맨 위 「쇼핑몰 오픈 준비」 안내 — 없애는 게 아니라 접는다.
//
// [왜 바꿨나 — 2026-08-31 요청]
// 원래는 X 를 누르면 setting_obj.onboarding_dismissed 가 저장되며 영영 사라졌다.
//   · 범위가 매장 전체다 — 직원 한 명이 누르면 사장님 화면에서도 없어진다.
//   · 기기를 가리지 않고, 되살리는 길이 **리포 어디에도 없었다**(DB 를 직접 고치는 수밖에).
// 인터넷을 잘 모르는 가맹점이 "이게 뭐지" 하고 확인을 누르면 그날로 안내를 잃었다.
//
// 그래서 「닫기」를 「접기」로 바꿨다. 이 검사는 그게 다시 '영구 숨김' 으로 돌아가지 못하게 못 박는다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 파일 = 'src/views/manager/dashboards/OnboardingChecklist.js';
const s = 읽기(파일);
const 코드 = 주석제거(s);

// ── 영구 숨김으로 되돌아가지 않는다 ──────────────────────────────────────
t('안내를 영구히 숨기지 않는다', !/onboarding_dismissed:\s*1/.test(코드),
    '없앨 거면 되살리는 길을 먼저 만들어야 한다 — 예전엔 그 길이 없었다');
t('닫기 확인 팝업이 없다', !/다시 표시되지 않습니다/.test(코드),
    '되돌릴 수 있는 동작이라 2차 확인이 필요 없다');
t('X(닫기) 아이콘을 쓰지 않는다', !/icon=['"]mdi:close['"]/.test(코드),
    'X 는 없앤다는 뜻으로 읽힌다 — 접는 것이므로 화살표를 쓴다');
t('아무것도 반환하지 않고 사라지는 길은 가맹점 판정뿐',
    (코드.match(/return null;/g) || []).length === 1,
    'SHOPGO 산하가 아닌 브랜드만 안 보여야 한다');

// ── 접기 동작 ────────────────────────────────────────────────────────────
t('접기 상태를 매장에 기억시킨다', /onboarding_collapsed:\s*다음\s*\?\s*1\s*:\s*0/.test(코드),
    '기억하지 않으면 새로고침마다 다시 펴져 접은 뜻이 없다');
t('접기와 펴기가 한 동작이다', /const 접기토글 = \(\) => \{[\s\S]{0,400}?const 다음 = !접힘;/.test(코드));
t('접힌 줄과 펼친 머리 둘 다 같은 동작을 부른다',
    (코드.match(/onClick=\{접기토글\}/g) || []).length === 2,
    '한쪽만 걸면 접히기만 하고 다시 못 편다');
t('접힌 줄에도 진행도가 보인다',
    /if \(접힘\) \{[\s\S]{0,900}?\{doneCount\}\/\{steps\.length\} 완료/.test(코드),
    '접어 두면 얼마나 남았는지 알 길이 없다');
// 접혀 있어도 상품 수를 세야 위 진행도가 맞는다.
t('접혀 있어도 상품 수를 센다', !/onboarding_dismissed == 1\) return;/.test(코드),
    '안 세면 접힌 줄의 n/m 이 틀린다');

// ── 예전에 닫아 버린 매장 되살리기 ───────────────────────────────────────
// DB 를 손대지 않고 옛 플래그를 '접힘' 으로 읽어 되살린다. 이게 요청의 핵심이다.
t('예전에 닫은 매장도 접힌 상태로 되살아난다',
    /so\?\.onboarding_collapsed == 1 \|\| so\?\.onboarding_dismissed == 1/.test(코드),
    '이게 없으면 이미 잃어버린 매장은 그대로 못 찾는다');
t('다시 펴면 옛 플래그를 지운다', /onboarding_dismissed:\s*0/.test(코드),
    '안 지우면 펴도 새로고침 때 또 접힌다');

// ── 화면 문구가 동작과 어긋나지 않는다 ────────────────────────────────────
t('문구가 아직 「✕로 닫을 수 있습니다」라고 하지 않는다', !/✕로 닫을 수 있습니다/.test(s),
    '동작은 접기인데 문구만 닫기로 남으면 손님이 헷갈린다');

// ── 되살리는 길 없이 영구 숨김을 되살리는 것을 막는다(다른 파일 포함) ──────
const 뒤지기 = (디렉토리, 담기 = []) => {
    for (const e of readdirSync(FRONT_ROOT + 디렉토리, { withFileTypes: true })) {
        const 경로 = `${디렉토리}/${e.name}`;
        if (e.isDirectory()) 뒤지기(경로, 담기);
        else if (e.name.endsWith('.js')) 담기.push(경로);
    }
    return 담기;
};
const 쓰는곳 = 뒤지기('src').filter((f) => /onboarding_dismissed/.test(주석제거(읽기(f))));
t('옛 플래그를 읽는 곳은 이 파일 하나뿐',
    쓰는곳.length === 1 && 쓰는곳[0].endsWith('OnboardingChecklist.js'),
    `지금: ${쓰는곳.join(', ') || '없음'}`);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
