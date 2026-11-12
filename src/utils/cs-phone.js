// 고객센터 전화번호 — 쇼핑몰 하단 「고객센터」 등에 나가는 번호.
//
// 1번: brands.phone_num (관리자 「회사정보」의 「고객센터 전화번호」, 가맹점 신청서의 「고객센터 번호」가 개설 때 들어온다)
// 2번: setting_obj.cs_phone_2 (「고객센터 전화번호 2 (선택)」, 2026-11-12). DB 칸을 늘리지 않으려고
//      로고 크기·배송 안내처럼 setting_obj 에 얹었다.
//
// 번호를 그리는 자리는 이 함수만 쓴다 — 프레임마다 따로 꺼내 쓰면 한쪽만 2번을 빠뜨린다.
// 약관·개인정보처리방침의 연락처는 문서 안에 하나만 있는 게 자연스러워 1번(phone_num)만 그대로 쓴다.

const 설정 = (dns) => {
  const so = dns?.setting_obj;
  if (so && typeof so === 'string') { try { return JSON.parse(so) ?? {}; } catch (e) { return {}; } }
  return so ?? {};
};

export const 고객센터번호들 = (dns) => {
  const 목록 = [dns?.phone_num, 설정(dns)?.cs_phone_2]
    .map((v) => String(v ?? '').trim())
    .filter((v) => v.length > 1); // 예전 화면들이 한 글자짜리 값(예: '-')을 '없음'으로 보던 규칙을 따른다
  return [...new Set(목록)];
};

// 번호 사이는 「 / 」 — 프레임5·6 하단이 「고객센터 · 번호」처럼 이미 가운뎃점을 쓰고 있어 섞이면 헷갈린다.
export const 고객센터번호표시 = (dns) => 고객센터번호들(dns).join(' / ');
