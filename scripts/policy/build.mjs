// 약관·개인정보처리방침·쇼핑몰 이용안내 본문 생성기.
//
// source/*.txt (원본 .docx 에서 뽑은 평문)를 읽어 화면이 그대로 그릴 수 있는
// 구조화 데이터(src/data/policy-content.js)로 만든다.
//
// 왜 스크립트인가:
//   29개 조문을 손으로 옮겨 적으면 반드시 어딘가 틀린다. 그리고 법무에서 원본이 오면
//   source/*.txt 만 갈아끼우고 다시 돌리면 된다.
//
// 원본에서 덜어내는 것(우리 서비스에 없는 기능):
//   - 적립금·쿠폰   : ShopGo 가맹점에서 쓰지 않기로 함
//   - 마케팅/광고   : 수신동의를 받지 않기로 함
//   - 이메일        : 가입에서 이메일을 수집하지 않는다(발송도 안 한다)
//   - 만14세 법정대리인 동의 : 연령 확인 절차를 두지 않으므로 '가입 불가'로 바꾼다
//
// 실행: node scripts/policy/build.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, 'source');
const OUT = path.join(HERE, '..', '..', 'src', 'data', 'policy-content.js');

const read = (name) => fs.readFileSync(path.join(SRC, name), 'utf8').replace(/\r\n/g, '\n');

// 정확히 한 번만 일치해야 한다. 원본이 바뀌어 자리가 사라지면 조용히 넘어가지 않고 멈춘다.
const cut = (text, needle, replacement = '') => {
  const n = text.split(needle).length - 1;
  if (n !== 1) throw new Error(`치환 대상이 ${n}번 일치(1번이어야 함): ${needle.slice(0, 60)}`);
  return text.replace(needle, replacement);
};
// 여러 줄 블록 삭제 — 시작줄부터 끝줄 직전까지
const cutBlock = (text, startLine, stopLine) => {
  const lines = text.split('\n');
  const s = lines.findIndex((l) => l.trim() === startLine);
  if (s < 0) throw new Error(`블록 시작을 못 찾음: ${startLine}`);
  const e = lines.findIndex((l, i) => i > s && l.trim() === stopLine);
  if (e < 0) throw new Error(`블록 끝을 못 찾음: ${stopLine}`);
  lines.splice(s, e - s);
  return lines.join('\n');
};

// ── 이용약관 ────────────────────────────────────────────────────────────
let terms = read('terms.txt');

// 제2조 정의에서 적립금·쿠폰 항목을 뺀다
terms = cut(terms, '⑤ “적립금”이란 “몰”이 정한 기준에 따라 회원에게 부여하여 상품 구매 등에 사용할 수 있도록 하는 전자적 지급수단을 말합니다.\n');
terms = cut(terms, '⑥ “쿠폰”이란 “몰”이 회원에게 제공하는 할인 또는 혜택을 받을 수 있는 전자적 증표를 말합니다.\n');

// 제11조 지급방법에서 적립금·쿠폰 줄을 뺀다
terms = cut(terms, '적립금 및 쿠폰\n');

// 제7조 회원자격 제한 사유에서도 쿠폰·적립금이 나온다
terms = cut(terms, '부정한 방법으로 쿠폰, 적립금 또는 기타 혜택을 취득하거나 사용한 경우',
  '부정한 방법으로 “몰”이 제공하는 혜택을 취득하거나 사용한 경우');

// 제21조 이용자 금지행위에도 나온다
terms = cut(terms, '비정상적인 방법으로 상품, 쿠폰, 적립금 등의 경제적 이익을 취득하는 행위',
  '비정상적인 방법으로 상품 등의 경제적 이익을 취득하는 행위');

// 제24조(적립금)·제25조(쿠폰) 통째로 삭제 → 이후 조 번호를 당긴다
terms = cutBlock(terms, '제24조(적립금)', '제26조(카카오톡 알림톡 및 문자 안내)');
const RENUMBER = [
  ['제26조(카카오톡 알림톡 및 문자 안내)', '제24조(주문·배송 안내 문자)'],
  ['제27조(고객상담)', '제25조(고객상담)'],
  ['제28조(분쟁해결)', '제26조(분쟁해결)'],
  ['제29조(재판권 및 준거법)', '제27조(재판권 및 준거법)'],
];
for (const [from, to] of RENUMBER) terms = cut(terms, from, to);

// 이메일을 수집하지 않으므로 통지·안내 수단에서 전자우편을 뺀다
terms = cut(terms,
  '① “몰”은 이 약관의 내용과 상호, 대표자 성명, 영업소 소재지 주소, 전화번호, 전자우편주소, 사업자등록번호, 통신판매업 신고번호 및 개인정보 보호책임자 등',
  '① “몰”은 이 약관의 내용과 상호, 대표자 성명, 영업소 소재지 주소, 전화번호, 사업자등록번호, 통신판매업 신고번호 및 개인정보 보호책임자 등');
terms = cut(terms,
  '① “몰”이 회원에게 통지하는 경우 회원이 등록한 전자우편주소, 휴대전화번호, 문자메시지, 카카오톡 알림톡 또는 서비스 내 알림 등의 방법으로 할 수 있습니다.',
  '① “몰”이 회원에게 통지하는 경우 회원이 등록한 휴대전화번호, 문자메시지 또는 서비스 내 알림 등의 방법으로 할 수 있습니다.');
terms = cut(terms,
  '① “몰”은 회원가입, 주문접수, 결제, 배송, 취소, 교환, 반품, 환불 및 기타 서비스 이용에 필요한 비광고성 정보를 카카오톡 알림톡, 문자메시지, 전자우편 등의 방법으로 안내할 수 있습니다.',
  '① “몰”은 회원가입, 주문접수, 결제, 배송, 취소, 교환, 반품, 환불 및 기타 서비스 이용에 필요한 비광고성 정보를 문자메시지 등의 방법으로 안내할 수 있습니다.');
terms = cut(terms,
  '② 카카오톡 알림톡 수신이 불가능하거나 이용자가 알림톡을 차단한 경우 일반 문자메시지 등 다른 방법으로 안내할 수 있습니다.\n');
terms = cut(terms,
  '① “몰”은 고객의 주문, 배송, 교환·반품, 환불 및 서비스 이용과 관련된 상담을 고객센터, 게시판, 전자우편, 카카오톡 상담 등 “몰”이 제공하는 방법을 통해 운영할 수 있습니다.',
  '① “몰”은 고객의 주문, 배송, 교환·반품, 환불 및 서비스 이용과 관련된 상담을 고객센터 및 게시판 등 “몰”이 제공하는 방법을 통해 운영할 수 있습니다.');
// 광고성 정보 수신동의 조항 — 마케팅을 하지 않으므로 뺀다
terms = cut(terms,
  '④ 광고성 정보를 발송하는 경우에는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관계 법령이 정하는 바에 따라 별도의 수신동의 절차를 거칩니다.\n');

// 브랜드 값으로 채울 자리
terms = terms.replace(/\[회사명\]/g, '{{company}}').replace(/\[쇼핑몰명\]/g, '{{shop}}');
terms = cut(terms, '본 약관은 [2026년 ○월 ○일]부터 시행합니다.', '본 약관은 {{date}}부터 시행합니다.');

// ── 개인정보처리방침 ────────────────────────────────────────────────────
let privacy = read('privacy.txt');

// 처리목적에서 마케팅·광고 전체 삭제
privacy = cutBlock(privacy, '⑤ 마케팅 및 광고', '2. 처리하는 개인정보의 항목');

// 회원가입 수집항목을 실제 가입폼과 맞춘다
privacy = cutBlock(privacy, '필수항목', '② 상품 주문 및 배송');
privacy = cut(privacy, '① 회원가입\n',
  '① 회원가입\n필수항목\n아이디\n비밀번호\n이름\n휴대전화번호\n닉네임\n비밀번호 재설정용 보안질문 및 답변\n');

// 이메일을 받지 않는다 — 각 항목에서 이메일주소 줄 제거
privacy = privacy.split('\n').filter((l) => l.trim() !== '이메일주소').join('\n');

// 위탁 — 실제로 위탁하는 것만 남긴다
privacy = cut(privacy, '수탁자 : [㈜우진플랫폼]', '수탁자 : ㈜우진플랫폼');
privacy = cut(privacy, '수탁자 : [택배회사명 또는 배송업체]', '수탁자 : 판매자가 지정한 택배사');
privacy = cut(privacy, '수탁자 : [㈜페이레터, ㈜나이스정보통신, ㈜NHNKCP, ㈜한국정보통신, ㈜KSNET ]',
  '수탁자 : ㈜페이레터, ㈜나이스정보통신, ㈜NHNKCP, ㈜한국정보통신, ㈜KSNET');
privacy = cutBlock(privacy, '문자·카카오톡·알림 발송업체', '※ 실제 이용하는 업체만 기재하고 사용하지 않는 업체는 삭제합니다.');
privacy = cut(privacy, '※ 실제 이용하는 업체만 기재하고 사용하지 않는 업체는 삭제합니다.\n');

// 연령 확인 절차를 두지 않으므로 '법정대리인 동의'가 아니라 '가입 불가'로 고지한다
privacy = cut(privacy,
  '만 14세 미만 아동의 개인정보를 처리하는 경우에는 관계 법령에 따라 법정대리인의 동의를 받으며, 법정대리인은 해당 아동의 개인정보에 대해 법령에서 정한 권리를 행사할 수 있습니다.',
  '회사는 만 14세 미만 아동의 회원가입을 받지 않으며, 만 14세 미만 아동의 개인정보를 수집하지 않습니다.');

// 보호책임자 — 브랜드 값으로 채운다. 값이 없는 줄은 화면에서 렌더하지 않는다.
privacy = cut(privacy, '성명 : [성명]', '성명 : {{pvcyName}}');
privacy = cut(privacy, '전화번호 : [전화번호]\n이메일 : [이메일주소]\n개인정보 관련 문의 담당부서\n부서명 : [담당부서]\n전화번호 : [전화번호]\n이메일 : [이메일주소]\n',
  '전화번호 : {{phone}}\n');
privacy = cut(privacy, '직책 : [직책]\n');
// 담당부서를 두지 않으므로 뒤에 이어지는 안내 문장에서도 뺀다
privacy = cut(privacy,
  '이용자는 회사의 서비스를 이용하면서 발생한 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 또는 담당부서에 문의할 수 있습니다.',
  '이용자는 회사의 서비스를 이용하면서 발생한 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의할 수 있습니다.');
privacy = cut(privacy, '개인정보 보호책임자\n성명', '개인정보 보호책임자\n성명');
privacy = privacy.replace(/\[회사명\]/g, '{{company}}').replace(/\[업체명\]/g, '{{company}}');
privacy = cut(privacy, '본 개인정보처리방침은 **[2026년 ○월 ○일]**부터 시행합니다.', '본 개인정보처리방침은 {{date}}부터 시행합니다.');

// ── 쇼핑몰 이용안내 ─────────────────────────────────────────────────────
let guide = read('guide.txt');
guide = cut(guide,
  '회원으로 가입하시면 주문내역 확인, 쿠폰 및 적립금 등 쇼핑몰에서 제공하는 다양한 혜택을 보다 편리하게 이용하실 수 있습니다.',
  '회원으로 가입하시면 주문내역 확인 등 쇼핑몰에서 제공하는 기능을 보다 편리하게 이용하실 수 있습니다.');

// ── 블록으로 자르기 ─────────────────────────────────────────────────────
const GUIDE_HEADINGS = new Set([
  '상품 주문방법', '결제안내', '배송안내', '교환 및 반품안내',
  '취소 및 환불안내', '주문조회', '고객센터 안내',
]);

const toBlocks = (text, { docTitle, headings }) => {
  const out = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line === docTitle) continue;                     // 제목은 화면이 그린다
    if (/^제\d+조\(/.test(line) || /^\d+\.\s/.test(line) || line === '부칙' || headings?.has(line)) {
      out.push(['h', line]);
    } else if (/^[①-⑳]/.test(line) || /^※/.test(line) || /다\.$|요\.$|습니다\.$/.test(line)) {
      out.push(['p', line]);
    } else {
      out.push(['li', line]);                            // 각 호 나열
    }
  }
  return out;
};

const TERMS = toBlocks(terms, { docTitle: '인터넷 쇼핑몰 『{{shop}} 사이버몰』 이용약관' });
const PRIVACY = toBlocks(privacy, { docTitle: '개인정보처리방침' });
const GUIDE = toBlocks(guide, { docTitle: '쇼핑몰 이용안내', headings: GUIDE_HEADINGS });

const banned = [/적립금/, /쿠폰/, /소셜 로그인/, /마케팅/, /이메일주소/];
for (const [name, blocks] of [['약관', TERMS], ['방침', PRIVACY], ['안내', GUIDE]]) {
  for (const [, v] of blocks) {
    for (const re of banned) {
      if (re.test(v)) throw new Error(`${name}에 빼기로 한 표현이 남았다: ${re} :: ${v.slice(0, 70)}`);
    }
  }
}

const dump = (name, blocks) =>
  `export const ${name} = [\n` +
  blocks.map(([t, v]) => `  ['${t}', ${JSON.stringify(v)}],`).join('\n') +
  `\n];\n`;

const header = `// ⚠ 이 파일은 자동 생성된다. 직접 고치지 마라.
//    원본: scripts/policy/source/*.txt  ·  생성: node scripts/policy/build.mjs
//
// 블록 형식: ['h'|'p'|'li', 문자열]
//   h  = 조 제목        p  = 항(①②③) 또는 문단        li = 각 호 나열
// {{company}} {{shop}} {{date}} {{pvcyName}} {{phone}} 는 화면에서 브랜드 값으로 채운다.
`;

fs.writeFileSync(OUT, header + '\n' + dump('TERMS', TERMS) + '\n' + dump('PRIVACY', PRIVACY) + '\n' + dump('GUIDE', GUIDE));
console.log(`생성 완료 — 약관 ${TERMS.length}블록 / 방침 ${PRIVACY.length}블록 / 안내 ${GUIDE.length}블록`);
console.log(`조문 수: ${TERMS.filter(([t, v]) => t === 'h' && /^제\d+조/.test(v)).length}`);
