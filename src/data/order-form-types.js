// 주문서 추가 입력항목의 유형 정의 — 관리화면(고르기)과 주문서(그리기)가 함께 쓴다.
//
// ⚠ value 는 DB(order_form_fields.field_type)에 그대로 저장되고 백엔드 화이트리스트와
//   같아야 한다. 여기서 이름만 바꾸면 이미 저장된 항목이 'text' 로 폴백된다.
//   (백엔드: controllers/order_form.controller.js 의 FIELD_TYPES)

export const ORDER_FORM_TYPES = [
  { value: 'text', label: '한 줄 텍스트', hint: '희망 1순위, 아기 이름 등' },
  { value: 'textarea', label: '여러 줄 텍스트', hint: '요청사항' },
  { value: 'number', label: '숫자', hint: '인원수, 테이블 수' },
  { value: 'date', label: '날짜 (달력)', hint: '행사일 — 준비 기간 제한 가능' },
  { value: 'time', label: '시간', hint: '행사 시작 시각' },
  { value: 'datetime', label: '날짜 + 시간', hint: '방문 일시' },
  { value: 'select', label: '선택 (1개)', hint: '층수, 주차 가능 여부' },
  { value: 'multiselect', label: '선택 (여러 개)', hint: '필요 장비' },
  { value: 'tel', label: '전화번호', hint: '현장 담당자 — 암호화 저장' },
  { value: 'address', label: '주소 (우편번호 검색)', hint: '행사 장소 — 암호화 저장' },
  { value: 'agree', label: '동의 체크', hint: '취소·환불 규정 확인' },
  { value: 'file', label: '파일 첨부', hint: '시안·로고 이미지' },
];

// 개인정보라 저장할 때 암호화되는 유형. 관리화면에서 그 사실을 알려주는 데 쓴다.
// (실제 암호화는 백엔드 utils.js/order-form.js 가 한다)
export const PII_TYPES = ['tel', 'address'];

// 보기 목록(option_list)을 쓰는 유형
export const CHOICE_TYPES = ['select', 'multiselect'];
// 달력을 쓰는 유형 — 리드타임(오늘+N일) 설정이 붙는다
export const DATE_TYPES = ['date', 'datetime'];
// 글자수 제한이 의미 있는 유형
export const LENGTH_TYPES = ['text', 'textarea'];

export const typeLabel = (value) =>
  ORDER_FORM_TYPES.find((t) => t.value === value)?.label ?? value;

// 줄바꿈으로 구분된 보기 목록 → 배열
export const parseOptionList = (raw) =>
  String(raw ?? '').split('\n').map((s) => s.trim()).filter(Boolean);

// 오늘 기준 선택 가능한 날짜 범위. lead_days 를 안 주면 제한 없음.
//
// 왜 필요한가: 출장·제작은 준비 기간이 있는데, 내일 행사를 예약해 버리면
// 업체가 취소 전화를 돌려야 한다. 달력에서 아예 못 고르게 막는다.
// (네이버·카페24 는 이 항목이 텍스트라 막지 못하고 안내문으로만 부탁한다)
export const dateRange = (field, today = new Date()) => {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const shift = (days) => {
    const d = new Date(base);
    d.setDate(d.getDate() + Number(days));
    return d;
  };
  return {
    min: field?.lead_days > 0 ? shift(field.lead_days) : base,
    max: field?.max_days > 0 ? shift(field.max_days) : null,
  };
};

// 필수 항목이 다 찼는지. 주문서가 결제로 넘어가기 전에 부른다.
// 채워야 할 첫 항목의 라벨을 돌려준다(없으면 null) — 사용자에게 무엇이 빠졌는지 말해줘야 한다.
export const findMissingRequired = (fields = [], values = {}) => {
  for (const f of fields) {
    if (!f?.is_required) continue;
    const v = values[String(f.id)];
    if (f.field_type === 'agree') {
      if (v !== true && v !== 1 && v !== '1') return f;
      continue;
    }
    if (Array.isArray(v)) {
      if (!v.length) return f;
      continue;
    }
    if (v === undefined || v === null || !String(v).trim()) return f;
  }
  return null;
};
