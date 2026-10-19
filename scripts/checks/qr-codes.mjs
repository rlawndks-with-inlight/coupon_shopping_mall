import { readFileSync } from 'fs';
import { FRONT_ROOT } from './_roots.mjs';

// 몰·상품 QR 코드(관리자, 2026-10-19). 매장 POP·전단·포장지에 인쇄해 손님이 찍으면 그 페이지로 간다.
//   · 주소는 그 몰의 실제 도메인(brands.dns) — 관리자 화면을 어느 도메인에서 열어도 손님이 갈 주소여야 한다.
//   · 상품 목록·상품 수정·기본설정 세 곳이 같은 창(QrDialog)을 쓴다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 창 = 읽기('src/components/manager/QrDialog.js');
t('QR 주소는 몰 도메인(dns)으로 만든다', /const dns = String\(themeDnsData\?\.dns \?\? ''\)\.trim\(\);\s*if \(dns\) return `https:\/\/\$\{dns\}`;/.test(창));
t('상품 QR 주소는 /shop/item/{id}/', /`\$\{몰주소\(themeDnsData\)\}\/shop\/item\/\$\{id\}\/`/.test(창));
t('인쇄용 이미지는 큰 QR(1024px)로 만든다', /<QRCodeCanvas value=\{url \|\| ''\} size=\{1024\}/.test(창));

const 목록 = 읽기('src/pages/manager/products/list.js');
const 수정 = 읽기('src/pages/manager/products/[edit_category]/[id].js');
const 설정 = 읽기('src/pages/manager/settings/default/[brand_id].js');
t('상품 목록에 QR 칸', /id: 'qr',[\s\S]{0,200}상품주소\(themeDnsData, row\?\.id\)/.test(목록) && /<QrDialog /.test(목록));
t('상품 수정 화면에 QR 버튼', /상품주소\(themeDnsData, item\?\.id\)/.test(수정) && /QR 코드/.test(수정));
t('기본설정에 내 쇼핑몰 QR', /내 쇼핑몰 QR/.test(설정) && /몰주소\(\{ dns: item\?\.dns \}\)/.test(설정));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
