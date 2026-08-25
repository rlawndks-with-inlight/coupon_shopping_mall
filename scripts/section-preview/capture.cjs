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
    // 배율 2 로 찍어 관리자 화면에서 줄여 써도 흐려지지 않게 한다.
    await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 1400, deviceScaleFactor: 2, mobile: false });

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
    let 만든수 = 0;
    for (let n = 1; n <= 8; n++) {
        await send('Page.navigate', { url: `${BASE}/manager/designs/preview-capture?type=${n}` });
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
          return { 이름: el.getAttribute('data-capture'), x: r.left + scrollX, y: r.top + scrollY,
                   w: Math.round(r.width), h: Math.round(r.height) };`);
        if (!b) { console.log(`  타입${n}: 상자를 못 찾음 (로그인 상태와 주소를 확인하세요)`); continue; }
        if (b.h < 20) { console.log(`  타입${n}: 높이 ${b.h} — 건너뜀`); continue; }
        // clip.scale 은 deviceScaleFactor 와 곱해진다 — 여기서 또 키우면 빈 그림이 나온다.
        const shot = await send('Page.captureScreenshot', {
            format: 'png', captureBeyondViewport: true,
            clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 },
        });
        const file = path.join(OUT, `${b.이름}.png`);
        fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
        console.log(`  ${b.이름}.png  ${b.w}x${b.h}  ${Math.round(fs.statSync(file).size / 1024)}KB`);
        만든수++;
    }

    console.log(`\n미리보기 ${만든수}장 → ${OUT}`);
    ws.close(); chrome.kill();
    process.exit(만든수 ? 0 : 1);
})().catch((e) => { console.error('실패:', e.message); process.exit(1); });
