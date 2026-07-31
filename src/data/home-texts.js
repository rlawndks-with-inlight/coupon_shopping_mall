// 블로그 단일상품 데모의 홈 화면 하드코딩 문구를 가맹점이 직접 편집하게 하는 스키마.
// - 저장 위치: setting_obj.home_texts['demo'+N] (데모별 객체)
// - 데모는 값이 없으면(''), 자기 기본값(placeholder와 동일)을 그대로 표시 → 미입력이라도 안전.
// - 편집 UI: /manager/designs/home-texts (현재 데모의 필드만 렌더).
// 새 데모/필드를 지원하려면 여기 추가하고, 해당 데모 파일에서 t.키 || '기본값' 으로 읽으면 됨.
export const HOME_TEXT_SCHEMA = {
  4: {
    label: '데모 4 (미니멀 모노크롬)',
    fields: [
      { key: 'edition', label: '에디션 표기', placeholder: '№ 001' },
      { key: 'type_value', label: '타입 값', placeholder: 'Signature' },
      { key: 'bignum1_label', label: '지표1 라벨', placeholder: 'Premium' },
      { key: 'bignum2_label', label: '지표2 라벨', placeholder: 'Crafted' },
      { key: 'bignum3_label', label: '지표3 라벨', placeholder: 'Timeless' },
      { key: 'bignum4_label', label: '지표4 라벨', placeholder: 'Unique' },
      { key: 'brand_intro', label: '브랜드 소개(The Brand)', placeholder: '단 하나의 제품에 집중하는 브랜드…', multiline: true },
    ],
  },
  5: {
    label: '데모 5 (다크 럭셔리)',
    fields: [
      { key: 'spec_heading', label: '스펙 섹션 제목', placeholder: 'Excellence, Defined' },
      { key: 'spec1_title', label: '스펙1 제목', placeholder: 'Pure Craftsmanship' },
      { key: 'spec1_desc', label: '스펙1 설명', placeholder: '한 땀 한 땀 정성으로 완성된 장인의 작품.', multiline: true },
      { key: 'spec2_title', label: '스펙2 제목', placeholder: 'Rare Materials' },
      { key: 'spec2_desc', label: '스펙2 설명', placeholder: '세계 각지에서 엄선된 최고의 원료만을 사용.', multiline: true },
      { key: 'spec3_title', label: '스펙3 제목', placeholder: 'Timeless Elegance' },
      { key: 'spec3_desc', label: '스펙3 설명', placeholder: '유행에 흔들리지 않는 영원한 아름다움.', multiline: true },
      { key: 'story_quote', label: '스토리 인용구', placeholder: '완벽을 추구한다는 것은…', multiline: true },
    ],
  },
  6: {
    label: '데모 6 (소프트 에디토리얼)',
    fields: [
      { key: 'feature_heading', label: '특징 섹션 제목', placeholder: 'Why (브랜드명)' },
      { key: 'feature1_title', label: '특징1 제목', placeholder: 'Premium Quality' },
      { key: 'feature1_desc', label: '특징1 설명', placeholder: '최고급 원료와 장인의 손길로 완성된 품질…', multiline: true },
      { key: 'feature2_title', label: '특징2 제목', placeholder: 'Thoughtful Design' },
      { key: 'feature2_desc', label: '특징2 설명', placeholder: '오랜 시간 다듬어진 디자인…', multiline: true },
      { key: 'feature3_title', label: '특징3 제목', placeholder: 'Time-honored' },
      { key: 'feature3_desc', label: '특징3 설명', placeholder: '전통과 현대의 조화…', multiline: true },
      { key: 'story_body', label: '스토리 본문', placeholder: '오랜 시간 연구와 다듬음을 거쳐…', multiline: true },
      { key: 'final_title', label: '하단 CTA 제목', placeholder: 'Experience (브랜드명)' },
      { key: 'final_desc', label: '하단 CTA 설명', placeholder: '지금 바로 시그니처를 만나보세요…', multiline: true },
    ],
  },
  7: {
    label: '데모 7 (일본 젠/와비사비)',
    fields: [
      { key: 'philosophy', label: '철학 문구', placeholder: '오래 지속되는 것에는 이유가 있습니다…', multiline: true },
      { key: 'value1_title', label: '가치1 제목', placeholder: '없음의 미학' },
      { key: 'value1_desc', label: '가치1 설명', placeholder: '덜어내는 것이 곧 본질을 드러내는 길…', multiline: true },
      { key: 'value2_title', label: '가치2 제목', placeholder: '비움의 공간' },
      { key: 'value2_desc', label: '가치2 설명', placeholder: '여백이 있기에 의미가 채워집니다.', multiline: true },
      { key: 'value3_title', label: '가치3 제목', placeholder: '조화의 손길' },
      { key: 'value3_desc', label: '가치3 설명', placeholder: '자연과 사람 사이, 조용한 균형을 추구합니다.', multiline: true },
    ],
  },
  8: {
    label: '데모 8 (브루탈리스트)',
    fields: [
      { key: 'manifesto', label: '메인 문구', placeholder: 'One product. Zero compromise.', multiline: true },
      { key: 'fact1_num', label: '지표1 숫자', placeholder: '01' },
      { key: 'fact1_label', label: '지표1 설명', placeholder: 'Single SKU' },
      { key: 'fact2_num', label: '지표2 숫자', placeholder: '100' },
      { key: 'fact2_label', label: '지표2 설명', placeholder: '% quality' },
      { key: 'fact3_num', label: '지표3 숫자', placeholder: '∞' },
      { key: 'fact3_label', label: '지표3 설명', placeholder: 'Dedication' },
      { key: 'fact4_num', label: '지표4 숫자', placeholder: '0' },
      { key: 'fact4_label', label: '지표4 설명', placeholder: 'Filler' },
      { key: 'cta_title', label: '하단 버튼 제목', placeholder: 'Get it now' },
      { key: 'cta_sub', label: '하단 버튼 부제목', placeholder: 'tap anywhere to purchase' },
    ],
  },
  9: {
    label: '데모 9 (파스텔 드림)',
    fields: [
      { key: 'quote', label: '인용 문구', placeholder: '하나만 만들어도 제대로…', multiline: true },
      { key: 'final_title', label: '하단 제목', placeholder: '지금이 (브랜드명)과 함께할 순간이에요 💕', multiline: true },
    ],
  },
};

export const getHomeTextSchema = (blogDemoNum) => HOME_TEXT_SCHEMA[Number(blogDemoNum)] || null;
