import { isShopgoMerchant } from 'src/utils/is-shopgo';

// ============================================================================
// 비밀번호 재설정용 고정 보안질문 8종 (SHOPGO 산하 가맹점 전용)
// 회원가입(질문 선택) · 아이디/비밀번호 찾기(질문 확인) · 로그인 후 설정 배너 ·
// 관리자 화면이 모두 이 파일 하나를 공유한다.
//
// !!!!! 경고 : id 는 영구값이다 !!!!!
// id 는 DB(users.security_question_id)에 정수로 그대로 저장된다.
// 순서 변경 · 재번호 · 삭제 절대 금지. (문구 다듬기는 가능, 질문 추가는 9번부터 append 만 허용)
// 순서를 바꾸면 이미 가입한 회원의 질문이 다른 질문으로 뒤바뀌어 본인확인이 영구히 불가능해진다.
// ============================================================================

const QUESTIONS = [
  { id: 1, label: '어릴 적 살던 동네 이름은?', placeholder: '상계동' },
  { id: 2, label: '어머니의 고향은?', placeholder: '안동' },
  { id: 3, label: '초등학교 때 가장 친했던 친구의 이름은?', placeholder: '김민수' },
  { id: 4, label: '어릴 적 별명은?', placeholder: '콩쥐' },
  { id: 5, label: '처음 키운 반려동물의 이름은?', placeholder: '초코' },
  { id: 6, label: '처음 일한 곳(아르바이트 포함)의 이름은?', placeholder: '스타벅스' },
  { id: 7, label: '기억에 남는 선생님의 성함은?', placeholder: '박영희' },
  { id: 8, label: '어릴 때 가장 좋아했던 만화·게임 제목은?', placeholder: '슬램덩크' },
];

// question 은 label 의 별칭(설계문서 호환용). map 으로 생성해 항상 label 과 동일함을 보장한다.
export const SECURITY_QUESTIONS = QUESTIONS.map((q) => ({ ...q, question: q.label }));

// 답변 최소 길이(정규화 후 기준). 서버 검증값과 동일해야 한다.
export const MIN_ANSWER_LENGTH = 2;
// 별칭(기존 코드 호환용)
export const SECURITY_ANSWER_MIN_LENGTH = MIN_ANSWER_LENGTH;

// 정규화 규칙(서버와 반드시 동일) : NFC 정규화 → 공백 전부 제거 → 소문자.
// 프론트 정규화는 "빈 답·너무 짧은 답 방지"용 길이 검증에만 쓴다.
// 해시 기준 정규화의 정본(authoritative)은 서버이며, 네트워크로는 사용자가 입력한 원문을 그대로 보낸다.
export const normalizeAnswer = (s) =>
  String(s ?? '')
    .normalize('NFC')
    .replace(/\s+/g, '')
    .toLowerCase();

// 별칭(기존 코드 호환용)
export const normalizeSecurityAnswer = normalizeAnswer;

export const getSecurityQuestion = (id) => SECURITY_QUESTIONS.find((q) => Number(q.id) === Number(id));

// 별칭(설계문서 호환용)
export const findSecurityQuestion = getSecurityQuestion;

// 질문 id → 질문 문구. 모르는 id 면 ''.
export const getSecurityQuestionLabel = (id) => getSecurityQuestion(id)?.label ?? '';

// 질문 id → 답변 입력 placeholder 예시. 모르는 id 면 ''.
export const getSecurityQuestionPlaceholder = (id) => getSecurityQuestion(id)?.placeholder ?? '';

export const isValidSecurityAnswer = (value) => normalizeAnswer(value).length >= MIN_ANSWER_LENGTH;

const looksLikeUser = (o) =>
  !!o &&
  typeof o === 'object' &&
  ('security_question_id' in o ||
    'security_answer' in o ||
    'user_name' in o ||
    'user_pw' in o ||
    'nickname' in o);

// 인자 순서를 (user) / (user, dns) / (dns, user) 모두 허용한다.
// 호출부가 9개 데모 화면에 흩어져 있어, 순서 실수 하나로 가입이 막히는 사고를 막기 위한 방어 로직.
const resolveArgs = (a, b) => (looksLikeUser(b) && !looksLikeUser(a) ? { user: b, dns: a } : { user: a, dns: b });

/**
 * 보안질문 입력 검증. 통과 시 '' , 실패 시 토스트에 띄울 메시지 문자열을 반환한다.
 * - validateSecurityQuestion(user)       : 호출부가 이미 isShopgoMerchant 로 게이팅한 경우
 * - validateSecurityQuestion(user, dns)  : themeDnsData 를 함께 넘기면 스스로 게이팅 → shopgo 가맹점이 아니면 항상 ''
 * ※ dns 를 넘기지 않으면 무조건 검증한다. 게이팅 없이 호출하면 다른 브랜드 가입이 막히므로 둘 중 하나는 반드시 지킬 것.
 */
export const validateSecurityQuestion = (...args) => {
  const { user, dns } = resolveArgs(args[0], args[1]);
  if (dns && !isShopgoMerchant(dns)) return '';
  if (!(Number(user?.security_question_id) > 0)) return '보안질문을 선택해 주세요.';
  if (!getSecurityQuestion(user?.security_question_id)) return '보안질문을 다시 선택해 주세요.';
  const answer = normalizeAnswer(user?.security_answer);
  if (!answer) return '보안질문의 답변을 입력해 주세요.';
  if (answer.length < MIN_ANSWER_LENGTH) return `답변은 ${MIN_ANSWER_LENGTH}자 이상 입력해 주세요.`;
  return '';
};

/**
 * 가입 payload 조각. shopgo 산하 가맹점이 아니면 빈 객체를 반환하므로
 * 다른 브랜드의 auth/sign-up 요청 바디는 한 글자도 변하지 않는다.
 * (apiManager 는 object-to-formdata 로 직렬화 → user 객체에 빈 키를 넣으면 모든 브랜드 바디가 바뀐다. 반드시 이 헬퍼 사용)
 * 서버 계약 : security_question_id (int 1..8), security_answer (원문 문자열, 서버가 정규화+해시)
 * 필드명이 바뀌면 이 함수 한 곳만 고치면 된다.
 */
export const securityQuestionPayload = (...args) => {
  const { user, dns } = resolveArgs(args[0], args[1]);
  if (!isShopgoMerchant(dns)) return {};
  return {
    security_question_id: Number(user?.security_question_id),
    security_answer: user?.security_answer,
  };
};
