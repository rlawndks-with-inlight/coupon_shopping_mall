import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';

// 다음 우편번호 검색창이 화면을 죽이지 않게 잠근다.
//
// 무슨 일이 있었나(가맹점 신고 2026-08-21, 마이페이지 › 주소지설정):
//   주소를 고르는 순간 화면이 통째로 죽었다.
//     NotFoundError: Failed to execute 'removeChild' on 'Node'
//   react-daum-postcode 는 autoClose(기본 true)일 때 oncomplete 에서
//   **React 가 그린 div 를 라이브러리가 직접 지운다**(lib/DaumPostcodeEmbed.js 의 wrap.current.remove()).
//   그 다음 리렌더에서 React 가 같은 노드를 지우려다 터진다. 우리 화면은 onComplete 에서
//   상태를 바꿔 곧바로 리렌더하므로 반드시 걸린다 — 주소지설정과 주문서 배송지 양쪽.
//
// 그래서 우편번호 창은 PostcodeBox 하나만 쓴다. 직접 그리면 이 사고가 그대로 돌아온다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 감싼 컴포넌트가 실제로 autoClose 를 끄는가 ────────────────────────────
const box = 읽기('src/components/elements/shop/PostcodeBox.js');
t('PostcodeBox 가 autoClose 를 끈다', /autoClose=\{false\}/.test(box));
t('PostcodeBox 가 onComplete 를 그대로 넘긴다', /onComplete=\{onComplete\}/.test(box));

// 라이브러리가 정말 그 동작인지 확인한다 — 버전이 올라가 고쳐지면 이 검사도 갱신해야 한다.
// (고쳐졌더라도 autoClose 를 끄는 것 자체는 안전한 쪽이라 그대로 둔다)
const libPath = FRONT_ROOT + 'node_modules/react-daum-postcode/lib/DaumPostcodeEmbed.js';
if (existsSync(libPath)) {
    const lib = readFileSync(libPath, 'utf8');
    t('라이브러리가 여전히 자기 손으로 DOM 을 지운다(전제 확인)',
        /wrap\.current\.remove\(\)/.test(lib),
        '라이브러리가 바뀌었다 — PostcodeBox 주석을 다시 확인할 것');
} else {
    console.log('  (node_modules 가 없어 라이브러리 확인은 건너뜀)');
}

// ── 아무도 직접 그리지 않는가 ─────────────────────────────────────────────
const 훑기 = (dir, out = []) => {
    for (const name of readdirSync(FRONT_ROOT + dir)) {
        const rel = dir + '/' + name;
        if (statSync(FRONT_ROOT + rel).isDirectory()) 훑기(rel, out);
        else if (/\.jsx?$/.test(name)) out.push(rel);
    }
    return out;
};
const 파일들 = 훑기('src');
const 직접 = 파일들.filter((f) =>
    f !== 'src/components/elements/shop/PostcodeBox.js' && 읽기(f).includes('react-daum-postcode'));
t('PostcodeBox 말고는 라이브러리를 직접 쓰지 않는다', 직접.length === 0, 직접.join(' / '));

// ── 쓰는 자리가 완료 시 창을 닫는가 ───────────────────────────────────────
// autoClose 를 껐으므로 닫는 책임은 우리 쪽에 있다. 안 닫으면 주소를 골라도 검색창이 남는다.
const 쓰는곳 = 파일들.filter((f) => 읽기(f).includes('<PostcodeBox'));
t('우편번호 창을 쓰는 화면이 있다', 쓰는곳.length >= 2, 쓰는곳.join(' / '));
for (const f of 쓰는곳) {
    const s = 읽기(f);
    const m = s.match(/<PostcodeBox[^>]*onComplete=\{(\w+)\}/);
    t(`${f.split('/').pop()} 이 완료 처리를 넘긴다`, !!m);
    if (!m) continue;
    const 이름 = m[1];
    const i = s.indexOf(`const ${이름} = `);
    const 본문 = i > 0 ? s.slice(i, s.indexOf('\n  }', i) + 4) : '';
    // 창을 닫는 방법은 화면마다 다르다(별도 Dialog 를 닫거나, 폼으로 되돌리거나).
    t(`${f.split('/').pop()} 이 고르고 나면 창을 닫는다`,
        /setPostOpen\(false\)|is_open_daum_post: false|setPostcodeOpen\(false\)/.test(본문),
        이름 + ' 안에서 닫는 코드를 못 찾았다');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
