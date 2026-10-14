import { readFileSync } from 'fs';
import { FRONT_ROOT } from './_roots.mjs';

// 관리자 편집기(상품설명 등)에 이미지를 여러 장 넣을 수 있는지 본다.
//
// 무슨 일이 있었나(2026-10-14, 해담수산 「상품설명에 이미지가 하나밖에 안 올라간다」):
//   · 이미지 버튼은 Quill 기본 동작이라 파일을 한 장만 고를 수 있었다.
//   · 고른 그림은 base64 로 편집기에 들어갔고, onChange 가 '<img src="' 로 자른 뒤 '"></p>' 까지를 그림으로 봤다.
//     그림 뒤에 다른 그림이나 글자가 이어지면 잘못 잘려 atob 에서 터졌다. 그 뒤로는 상태가 굳었다.
//   · 업로드를 기다린 뒤 '그때의 내용' 으로 덮어써서, 업로드 중에 연달아 넣은 그림이 사라졌다(3장 → 1장).

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 편집기 = 읽기('src/views/manager/react-quill.js');
t('이미지 버튼은 여러 장을 고를 수 있다', /handlers:\s*\{[\s\S]*image:\s*function[\s\S]*input\.multiple = true/.test(편집기));
t('이미지 버튼은 먼저 올리고 주소를 넣는다(base64 를 넣지 않는다)', /insertEmbed\(index, 'image', r\.url/.test(편집기));
t("base64 를 '\"></p>' 로 잘라 내지 않는다", !/split\(`"><\/p>`\)/.test(편집기), '그림 뒤에 다른 것이 이어지면 잘못 잘린다');
t('업로드가 끝나면 최신 내용에 반영한다(latestRef)', /latestRef\.current = html/.test(편집기) && /setValueRef\.current\(바뀐\)/.test(편집기));
t('같은 그림을 두 번 올리지 않는다', /올리는중\.current\.has\(data\)/.test(편집기));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
