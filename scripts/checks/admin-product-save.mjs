import { readFileSync } from 'fs';
import { FRONT_ROOT } from './_roots.mjs';

// 관리자 상품 저장·관리자 화면 휴대폰 폭 — 2026-10-14 관리자 점검에서 잡은 것들.
//
//   · 개별사진·설명사진 목록은 화면이 직접 올린다(apiManager 의 단일 사진 처리와 별개).
//     한 장이 실패하면 url 없이 넘어가 **안내 없이 빠진 채 저장**됐다(3장 중 1장 실패 → 2장 저장).
//   · 옵션 빈 줄 안내가 「옵션 이름을 입력」이라 이미 채운 그룹 이름 칸을 가리키는 줄 알았다(칸 이름은 「항목명」).
//   · 휴대폰 폭에서 대시보드 기간 버튼·기본설정 탭이 화면 밖으로 밀렸다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 상품 = 읽기('src/pages/manager/products/[edit_category]/[id].js');
t('사진을 한 장이라도 못 올리면 상품을 저장하지 않는다',
  /const 못올린수 = \[\.\.\.\(upload_files \|\| \[\]\), \.\.\.\(upload_files_d \|\| \[\]\)\]\.filter\(\(u\) => !u\?\.url\)\.length;\s*if \(못올린수 > 0\) \{[\s\S]{0,200}return;/.test(상품));
t('옵션 빈 줄 안내는 화면의 칸 이름(항목명)으로 말한다',
  /항목명이 비어 있는 줄이 있습니다/.test(상품) && !/의 옵션 이름을 입력해 주세요/.test(상품));

for (const f of ['src/views/manager/dashboards/demo-2.js', 'src/views/manager/dashboards/blog-1.js', 'src/views/manager/dashboards/demo-4.js']) {
  const s = 읽기(f);
  t(`${f.split('/').pop()} 기간 버튼 줄이 넘치면 다음 줄로`,
    /flexWrap: 'wrap'[\s\S]{0,120}<Button[\s\S]{0,160}onClickDateButton\(0\)/.test(s) && !/sx=\{\{ flexGrow: 1 \}\} onClick=\{\(\) => onClickDateButton/.test(s));
}
const 설정 = 읽기('src/pages/manager/settings/default/[brand_id].js');
t('기본설정 탭 줄이 넘치면 다음 줄로', /columnGap: '0\.5rem', rowGap: '0\.5rem', flexWrap: 'wrap' \}\}>\s*\{tab_list\.map/.test(설정));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
