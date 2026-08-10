// 배송 국가 목록.
//
// 국내(KR)는 다음 우편번호 팝업으로 입력하고, 그 외 국가는 자유입력 폼으로 받는다.
// 국내 주소를 계속 다음 우편번호로 받는 이유:
//   택배 송장 출력과 통관 신고에 쓰는 것은 행정안전부 표준 도로명주소 + 5자리 우편번호이고,
//   다음 우편번호 서비스는 그 DB 를 직접 받아 갱신한다(무료·무제한·API 키 불필요).
//   해외 주소 자동완성 API 는 자체 DB 라 표기가 다르고 한국 우편번호가 없거나 구 번호가 와서,
//   국내 주소를 그쪽으로 바꾸면 택배사 시스템이 못 읽는다.
//
// 목록은 전 세계 전체가 아니라 실제 배송이 나갈 만한 곳 위주다.
// 없는 나라가 필요해지면 여기에 한 줄만 추가하면 된다.
export const KOREA_CODE = 'KR';

export const COUNTRIES = [
    { code: 'KR', name: '대한민국', en: 'South Korea' },
    { code: 'US', name: '미국', en: 'United States' },
    { code: 'JP', name: '일본', en: 'Japan' },
    { code: 'CN', name: '중국', en: 'China' },
    { code: 'HK', name: '홍콩', en: 'Hong Kong' },
    { code: 'TW', name: '대만', en: 'Taiwan' },
    { code: 'SG', name: '싱가포르', en: 'Singapore' },
    { code: 'MY', name: '말레이시아', en: 'Malaysia' },
    { code: 'TH', name: '태국', en: 'Thailand' },
    { code: 'VN', name: '베트남', en: 'Vietnam' },
    { code: 'PH', name: '필리핀', en: 'Philippines' },
    { code: 'ID', name: '인도네시아', en: 'Indonesia' },
    { code: 'IN', name: '인도', en: 'India' },
    { code: 'AU', name: '호주', en: 'Australia' },
    { code: 'NZ', name: '뉴질랜드', en: 'New Zealand' },
    { code: 'CA', name: '캐나다', en: 'Canada' },
    { code: 'GB', name: '영국', en: 'United Kingdom' },
    { code: 'DE', name: '독일', en: 'Germany' },
    { code: 'FR', name: '프랑스', en: 'France' },
    { code: 'ES', name: '스페인', en: 'Spain' },
    { code: 'IT', name: '이탈리아', en: 'Italy' },
    { code: 'NL', name: '네덜란드', en: 'Netherlands' },
    { code: 'RU', name: '러시아', en: 'Russia' },
    { code: 'AE', name: '아랍에미리트', en: 'United Arab Emirates' },
    { code: 'SA', name: '사우디아라비아', en: 'Saudi Arabia' },
    { code: 'BR', name: '브라질', en: 'Brazil' },
    { code: 'MX', name: '멕시코', en: 'Mexico' },
];

// 해외배송 표식.
//
// country_code 컬럼은 VARCHAR(2) 라 나라 이름을 담을 수 없다(ISO 코드 자리다).
// 고객이 국가를 직접 입력하도록 바꾸면서, 코드 자리에는 '해외'라는 표식만 두고
// 실제로 입력한 나라 이름은 country_name(VARCHAR 60)에 담는다.
// ZZ 는 ISO 3166-1 에서 사용자 지정용으로 비워 둔 코드라 실제 국가와 겹치지 않는다.
export const OVERSEAS_CODE = 'ZZ';

export const isDomestic = (country_code) => String(country_code || KOREA_CODE) === KOREA_CODE;

// 화면에 보여줄 나라 이름.
// 고객이 직접 적은 이름(country_name)이 있으면 그것을 그대로 쓴다 — 목록에 없는 나라도 있다.
// 없으면 예전처럼 코드로 찾아보고, 그것도 없으면 코드를 그대로 보여준다.
export const getCountryName = (country_code, country_name) => {
    const typed = String(country_name ?? '').trim();
    if (typed) return typed;
    return COUNTRIES.find((c) => c.code === String(country_code || KOREA_CODE))?.name
        ?? String(country_code || KOREA_CODE);
};

// 해외 배송지 한 건을 한 줄 문자열로 — 주문내역·관리자 주문상세에서 그대로 보여준다.
// 해외 주소는 나라마다 순서가 달라 필드를 따로 배치하려 들면 화면마다 규칙이 갈린다.
// 표기는 국제 우편 관례대로 좁은 단위 → 넓은 단위 순으로 잇는다.
export const formatOverseasAddress = (row = {}) => [
    row?.addr,
    row?.detail_addr,
    row?.city,
    row?.state_region,
    row?.zonecode,
    getCountryName(row?.country_code, row?.country_name),
].map((v) => String(v ?? '').trim()).filter(Boolean).join(', ');
