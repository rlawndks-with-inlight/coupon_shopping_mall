import { BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 신규 가맹점의 기본 게시판(공지사항 · 1:1문의).
//
// [무엇이 문제였나]
// 몰을 만드는 길이 둘인데 한쪽에만 있었다.
//   ① 가맹점 신청 승인 (merchant_application.controller)  ← 있었다
//   ② 브랜드설정 → 브랜드 추가 (brand.controller)         ← 없었다
// ② 로 만든 몰은 게시판이 통째로 없는 채로 시작한다. 게시판 생성은 레벨50(본사) 전용이라
// 가맹점 사장님이 스스로 만들 수도 없고, 대시보드 '문의관리' 카드도 빈 채로 남는다.
//
// 자체 도메인을 쓰는 가맹점은 shopgo 신청 화면을 안 거치므로 **반드시 ② 로 들어온다**.
// 그래서 이 구멍이 실제로 드러난다(2026-08-25).
//
// 함수는 utils.js/seed-boards.js 하나로 두고 두 경로가 그것을 부른다 —
// 복사해 두면 한쪽만 고쳐지고, 그게 애초에 이 문제가 생긴 방식이다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

if (!백엔드있음) {
    console.log('  (백엔드 저장소가 없어 건너뜀)');
    console.log('\n통과 0 / 실패 0');
    process.exit(0);
}
const 읽기 = (p) => readFileSync(BACK_ROOT + p, 'utf8');
const 유틸 = 읽기('utils.js/seed-boards.js');

// ── 함수를 실제로 돌린다 ─────────────────────────────────────────────────
// insertQuery 와 readPool 을 가짜로 끼워 넣고, 무엇을 만드는지 값으로 확인한다.
const 만들기 = (기존제목 = []) => {
    const 만든것 = [];
    const 소스 = 유틸
        .replace(/^import[^\n]*\n/gm, '')
        .replace(/export const /g, 'const ')
        .replace(/export default[^\n]*\n?/g, '');
    const { seedDefaultBoards } = new Function('insertQuery', 'readPool',
        소스 + '\nreturn { seedDefaultBoards };'
    )(
        async (table, row) => { 만든것.push({ table, row }); return { insertId: 1 }; },
        { query: async () => [기존제목.map((x) => ({ post_category_title: x }))] }
    );
    return { seedDefaultBoards, 만든것 };
};

{
    const { seedDefaultBoards, 만든것 } = 만들기([]);
    await seedDefaultBoards(130);
    t('게시판 두 개를 만든다', 만든것.length === 2);
    t('전부 post_categories 에 넣는다', 만든것.every((x) => x.table === 'post_categories'));
    t('브랜드 id 가 박힌다', 만든것.every((x) => x.row.brand_id === 130));

    const 공지 = 만든것.find((x) => x.row.post_category_title === '공지사항')?.row;
    const 문의 = 만든것.find((x) => x.row.post_category_title === '1:1문의')?.row;
    t('공지사항이 있다', !!공지);
    t('1:1문의가 있다', !!문의);
    // 공지: 손님은 읽기만. 회원이 글을 쓸 수 있으면 공지가 아니라 자유게시판이 된다.
    t('공지사항은 손님이 글을 못 쓴다', 공지?.is_able_user_add === 0);
    t('공지사항은 누구나 읽는다', 공지?.post_category_read_type === 0);
    // 문의: 남의 문의가 서로 보이면 개인정보가 샌다.
    t('1:1문의는 회원이 글을 쓸 수 있다', 문의?.is_able_user_add === 1,
        '못 쓰면 문의함이 아니라 읽기 전용 게시판이 된다');
    t('1:1문의는 본인·관리자만 본다', 문의?.post_category_read_type === 1,
        '0 이면 남의 문의 내용이 서로 보인다 — 개인정보가 샌다');
    t('둘 다 최상위 게시판이다', 만든것.every((x) => x.row.parent_id === -1));
}
// 멱등 — 두 번 불러도 중복으로 안 만든다.
{
    const { seedDefaultBoards, 만든것 } = 만들기(['공지사항', '1:1문의']);
    await seedDefaultBoards(130);
    t('이미 있으면 다시 만들지 않는다', 만든것.length === 0,
        '개설을 두 번 눌러도, 백필을 돌려도 안전해야 한다');
}
{
    const { seedDefaultBoards, 만든것 } = 만들기(['공지사항']);
    await seedDefaultBoards(130);
    t('빠진 것만 채운다', 만든것.length === 1 && 만든것[0].row.post_category_title === '1:1문의');
}
{
    const { seedDefaultBoards, 만든것 } = 만들기([]);
    await seedDefaultBoards(undefined);
    t('브랜드 id 가 없으면 아무것도 안 만든다', 만든것.length === 0);
}

// ── 몰을 만드는 두 경로가 모두 부르는가 ──────────────────────────────────
// 여기가 이 검사의 핵심이다. 한쪽만 부르던 것이 애초의 문제였다.
const 신청 = 주석제거(읽기('controllers/merchant_application.controller.js'));
const 브랜드 = 주석제거(읽기('controllers/brand.controller.js'));

t('신청 승인 경로가 부른다', /seedDefaultBoards\(/.test(신청));
t('브랜드설정 경로가 부른다', /seedDefaultBoards\(result\?\.insertId\)/.test(브랜드),
    '자체 도메인 가맹점은 신청 화면을 안 거치고 반드시 이 경로로 들어온다');
t('두 경로가 같은 파일을 가져온다',
    /from "\.\.\/utils\.js\/seed-boards\.js"/.test(신청) && /from "\.\.\/utils\.js\/seed-boards\.js"/.test(브랜드),
    '복사해 두면 한쪽만 고쳐진다 — 그게 이 문제가 생긴 방식이다');
t('컨트롤러가 게시판 목록을 따로 들고 있지 않다',
    !/post_category_title: '공지사항'/.test(신청) && !/post_category_title: '공지사항'/.test(브랜드),
    '정의는 utils.js/seed-boards.js 한 곳에만 있어야 한다');
// 게시판 만들다 실패해도 몰 생성은 성공이어야 한다 — 브랜드 행과 관리자 계정이 이미 만들어졌다.
t('게시판 실패가 몰 생성을 막지 않는다', /try \{\s*await seedDefaultBoards/.test(브랜드),
    '여기서 에러를 내면 이미 만들어진 브랜드와 관리자 계정이 붕 뜬다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
