// 「단일 상품 강조」 디자인 타입 미리보기 이미지를 만든다.
//
// 가맹점 요청(2026-08-24): "가맹점에서는 타입만 가지고 정확한 이미지를 알기 어렵습니다.
// 각 타입별로 이미지화 해서 보여줄 수 있게 요청 드립니다."
//
// 손으로 캡처하지 않는 이유 — 타입이 늘거나 디자인이 바뀌면 여기만 다시 돌리면 된다.
// (매니저 가이드 스크린샷 30장도 scripts/guide-pdf 가 같은 방식으로 만든다)
//
// 쓰는 법:
//   1) 관리자로 로그인된 개발 서버를 띄운다  (기본 http://localhost:2000)
//   2) node scripts/section-preview/capture.cjs [주소]
//   → public/section-preview/item-hero-N.png 로 저장된다
//
// ⚠ 로그인이 필요하다. 캡처 화면은 ManagerLayout 안에 있어서 비로그인이면 로그인 화면이 뜬다.
//   그래서 이 스크립트는 '로그인된 크롬 프로필' 을 쓰거나, 아래 LOGIN 값을 채워 자동 로그인한다.
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:2000';
const OUT = path.resolve(__dirname, '../../public/section-preview');
const PORT = 9711;
// 개발용 가맹점 계정. 운영 계정을 여기 적지 말 것 — 이 파일은 저장소에 남는다.
const LOGIN = { id: process.env.PREVIEW_ID || '', pw: process.env.PREVIEW_PW || '' };

const CHROME = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
].find((p) => fs.existsSync(p));
if (!CHROME) { console.error('크롬을 찾지 못했습니다.'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sec-prev-'));
    const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
        `--user-data-dir=${profile}`, `--remote-debugging-port=${PORT}`, 'about:blank'], { stdio: 'ignore' });

    let t = null;
    for (let i = 0; i < 60 && !t; i++) {
        await sleep(250);
        try { t = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((x) => x.type === 'page' && x.webSocketDebuggerUrl); } catch { }
    }
    if (!t) { console.error('크롬에 붙지 못했습니다.'); chrome.kill(); process.exit(1); }

    const ws = new WebSocket(t.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    let id = 0; const 대기 = new Map();
    ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (m.id && 대기.has(m.id)) { const w = 대기.get(m.id); 대기.delete(m.id); m.error ? w.reject(new Error(JSON.stringify(m.error))) : w.resolve(m.result); }
    };
    const send = (m, p = {}) => new Promise((res, rej) => { const n = ++id; 대기.set(n, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: n, method: m, params: p })); });
    const ev = (x) => send('Runtime.evaluate', { expression: `Promise.resolve((async()=>{${x}})()).then(v=>JSON.stringify(v??null))`, returnByValue: true, awaitPromise: true })
        .then((r) => { try { return JSON.parse(r.result?.value ?? 'null'); } catch { return r.result?.value; } });

    await send('Page.enable'); await send('Runtime.enable');
    // 배율 1 로 찍는다(폭 960px 그대로).
    //
    // 처음엔 배율 2 로 찍었는데, 사진이 들어가는 섹션(배너·버튼형배너)이 **한 장에 1.7MB** 가 됐다.
    // 관리자 화면에서는 카드 폭(300px 남짓)으로 줄여 보여주므로 960px 이면 이미 3배가 넘는다.
    // 저장소에 들어가는 파일이라 무게가 곧 비용이다 — 필요 이상으로 키우지 않는다.
    await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1400, deviceScaleFactor: 1, mobile: false });

    const 렌더대기 = async (최소 = 100) => {
        for (let i = 0; i < 40; i++) {
            await sleep(1000);
            const n = await ev(`return (document.body.innerText||'').trim().length`);
            if (Number(n) > 최소) return true;
        }
        return false;
    };

    await send('Page.navigate', { url: `${BASE}/manager/designs/preview-capture` });
    await 렌더대기();
    await sleep(2000);

    // 로그인 화면이면 자동 로그인 시도
    const 로그인화면 = await ev(`return !!document.querySelector('input[type=password]')`);
    if (로그인화면) {
        if (!LOGIN.id || !LOGIN.pw) {
            console.error('로그인이 필요합니다. PREVIEW_ID / PREVIEW_PW 환경변수를 주세요.');
            console.error('  예) PREVIEW_ID=mbc01 PREVIEW_PW=mbc01 node scripts/section-preview/capture.cjs');
            ws.close(); chrome.kill(); process.exit(1);
        }
        await ev(`
          const set=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};
          const inputs=[...document.querySelectorAll('input')];
          const pw=inputs.find(i=>i.type==='password');
          const idf=inputs.find(i=>i!==pw);
          if(idf) set(idf, ${JSON.stringify(LOGIN.id)});
          if(pw) set(pw, ${JSON.stringify(LOGIN.pw)});
          await new Promise(r=>setTimeout(r,600));
          const b=[...document.querySelectorAll('button')].find(x=>/로그인/.test(x.textContent));
          if(b) b.click();
          return 1;`);
        await sleep(4000);
        await send('Page.navigate', { url: `${BASE}/manager/designs/preview-capture` });
        await 렌더대기();
        await sleep(2500);
    }

    // 타입마다 화면을 새로 연다.
    //
    // ⚠ 여덟 개를 한 화면에 쌓아 두고 찍었더니 아래쪽 타입의 사진이 빈 칸으로 나왔다.
    //   섹션 렌더러들이 LazyLoadImage 를 써서 **화면에 들어와야** 사진을 불러오는데,
    //   스크롤로 두 번 훑어도 마지막 타입은 끝내 안 실렸다.
    //   하나씩 열면 늘 화면 안에 있으므로 그 문제가 사라진다. 조금 느린 대신 확실하다.
    // 찍을 목록 — 디자인 타입 8종 + 섹션 종류들. 목록은 src/data/section-preview.js 가 갖는다.
    const 섹션소스 = fs.readFileSync(path.resolve(__dirname, '../../src/data/section-preview.js'), 'utf8');
    // skip: true 로 표시된 섹션은 뺀다(견본으로 제대로 안 그려지는 것 — 이유는 그 파일 주석).
    const 섹션타입들 = [...섹션소스.matchAll(/\{ type: '([a-z-]+)', label: '[^']*'(,?\s*skip: true)?/g)]
        .filter((m) => !m[2])
        .map((m) => m[1]);
    // 「홈 문구」 위치 안내 — 블로그 데모 4~9 (HOME_TEXT_SCHEMA 의 키)
    const 홈문구소스 = fs.readFileSync(path.resolve(__dirname, '../../src/data/home-texts.js'), 'utf8');
    const 홈데모들 = [...홈문구소스.matchAll(/^  (\d+): \{$/gm)].map((m) => Number(m[1]));

    const 찍을것 = [
        ...Array.from({ length: 8 }, (_, i) => ({ q: `type=${i + 1}`, 이름: `타입${i + 1}` })),
        ...섹션타입들.map((t) => ({ q: `section=${t}`, 이름: `섹션 ${t}` })),
        ...홈데모들.map((n) => ({ q: `hometext=${n}`, 이름: `홈문구 데모${n}` })),
    ];
    console.log(`찍을 것 ${찍을것.length}개 `
        + `(디자인 타입 8 · 섹션 ${섹션타입들.length} · 홈문구 ${홈데모들.length})
`);

    let 만든수 = 0;
    for (const 항목 of 찍을것) {
        await send('Page.navigate', { url: `${BASE}/manager/designs/preview-capture?${항목.q}` });
        await 렌더대기(30);
        await sleep(2200);
        // 사진이 다 실릴 때까지 기다린다. 안 실린 채로 찍으면 빈 칸이 된다.
        for (let i = 0; i < 20; i++) {
            const 남은 = await ev(`return [...document.images].filter(i => !i.complete || i.naturalWidth === 0).length`);
            if (Number(남은) === 0) break;
            await sleep(400);
        }
        const b = await ev(`
          const el = document.querySelector('[data-capture]');
          if (!el) return null;
          const r = el.getBoundingClientRect();
          const 상자 = { 이름: el.getAttribute('data-capture'), x: r.left + scrollX, y: r.top + scrollY,
                         w: Math.round(r.width), h: Math.round(r.height) };
          // 홈 문구 안내는 '번호가 붙은 자리' 만 보이면 된다.
          // 홈 전체를 위에서부터 찍으면 첫 화면(히어로)이 뷰포트 높이를 통째로 먹어서,
          // 정작 번호들은 1400px 아래에 깔린다. 번호가 든 구간만 잘라 낸다.
          const 번호 = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫'];
          const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let node; let 위 = Infinity; let 아래 = -Infinity;
          while (node = walk.nextNode()) {
            if (!번호.some((b) => (node.textContent || '').includes(b))) continue;
            const p = node.parentElement; if (!p) continue;
            const q = p.getBoundingClientRect();
            위 = Math.min(위, q.top + scrollY); 아래 = Math.max(아래, q.bottom + scrollY);
          }
          if (위 === Infinity) return 상자;
          // 번호만 딱 자르면 어느 자리인지 알 수 없다 — 앞뒤로 여백을 둬 주변이 함께 보이게 한다.
          const 시작 = Math.max(상자.y, 위 - 140);
          const 끝 = Math.min(상자.y + 상자.h, 아래 + 160);
          return { ...상자, y: 시작, h: Math.round(끝 - 시작), 번호구간: true };`);
        if (!b) { console.log(`  ${항목.이름}: 상자를 못 찾음 (로그인 상태와 주소를 확인하세요)`); continue; }
        if (b.h < 20) { console.log(`  ${항목.이름}: 높이 ${b.h} — 건너뜀`); continue; }
        // 너무 긴 것은 잘라 낸다. 크롬은 아주 큰 clip 을 요청하면
        // 'Unable to capture screenshot' 으로 거절한다.
        //
        // 한도가 둘인 이유: 섹션 미리보기는 '어떤 모양인지' 만 보이면 되지만,
        // 홈 문구 안내는 **번호가 하나라도 잘리면 그 칸을 못 찾는다** — 안내가 안 되는 것이다.
        // 처음엔 둘 다 1400 으로 잘랐다가, 여섯 장 중 다섯 장에서 번호가 **한 개도**
        // 안 보이는 채로 배포될 뻔했다(데모5·6·7·8·9 전멸, 데모4 는 7개 중 2개만).
        const 높이 = Math.min(b.h, b.번호구간 ? 2800 : 1400);
        // clip.scale 은 deviceScaleFactor 와 곱해진다 — 여기서 또 키우면 빈 그림이 나온다.
        let shot;
        try {
            shot = await send('Page.captureScreenshot', {
                format: 'png', captureBeyondViewport: true,
                clip: { x: b.x, y: b.y, width: b.w, height: 높이, scale: 1 },
            });
        } catch (e) {
            // 한 장이 실패해도 나머지는 계속 찍는다. 처음엔 여기서 통째로 멈춰
            // 앞서 찍은 것만 남고 뒤는 아예 안 만들어졌다.
            console.log(`  ${항목.이름}: 캡처 실패 — ${String(e.message).slice(0, 80)}`);
            continue;
        }
        const file = path.join(OUT, `${b.이름}.png`);
        fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
        console.log(`  ${b.이름}.png  ${b.w}x${높이}${높이 < b.h ? ` (원래 ${b.h}, 잘라냄)` : ''}`
            + `  ${Math.round(fs.statSync(file).size / 1024)}KB`);
        만든수++;
    }

    console.log(`\n미리보기 ${만든수}장 → ${OUT}`);
    ws.close(); chrome.kill();
    process.exit(만든수 ? 0 : 1);
})().catch((e) => { console.error('실패:', e.message); process.exit(1); });
