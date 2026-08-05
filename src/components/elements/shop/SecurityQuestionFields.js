import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { isShopgoMerchant } from 'src/utils/is-shopgo';
import { SECURITY_QUESTIONS, getSecurityQuestion } from 'src/data/security-questions';

// 회원가입 '보안질문 + 답변' 입력 — SHOPGO 산하 가맹점(parent_id=98) 전용.
// shopgo 가맹점은 SMS 인증 없이 보안질문으로 비밀번호를 재설정하므로 이 질문이 유일한 본인확인 수단 → 필수 입력.
// 그 외 브랜드는 기존 SMS 플로우를 그대로 쓰므로 여기서 null 을 반환한다(각 데모 파일은 한 줄만 추가하면 됨).
//
// 사용법 (데모 sign-up.js 의 activeStep == 1 블록 마지막에 삽입) :
//   <SecurityQuestionFields user={user} setUser={setUser} />
// 검증은 '다음' 버튼 핸들러에서 :
//   const err = validateSecurityQuestion(user, themeDnsData);
//   if (err) { toast.error(err); return; }
// payload 는 securityQuestionPayload(themeDnsData, user) 로 합칠 것.
// (user useState 초기값에 security_* 키를 넣지 말 것 — object-to-formdata 가 모든 브랜드 요청 바디에 빈 값을 실어 보낸다)
export const SecurityQuestionFields = ({ user, setUser, style = { marginTop: '1rem' } }) => {
  const { themeDnsData } = useSettingsContext();
  const { translate } = useLocales();

  if (!isShopgoMerchant(themeDnsData)) return null;

  const selected = getSecurityQuestion(user?.security_question_id);

  return (
    <>
      <FormControl variant="outlined" style={{ width: '100%', ...style }}>
        <InputLabel>{translate('보안질문')}</InputLabel>
        <Select
          label={translate('보안질문')}
          value={user?.security_question_id ?? ''}
          onChange={(e) => {
            setUser({ ...user, ['security_question_id']: e.target.value });
          }}
        >
          {SECURITY_QUESTIONS.map((question) => (
            <MenuItem key={question.id} value={question.id}>{translate(question.label)}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label={translate('답변')}
        placeholder={selected ? selected.placeholder : translate('보안질문을 먼저 선택해 주세요')}
        onChange={(e) => {
          setUser({ ...user, ['security_answer']: e.target.value });
        }}
        value={user?.security_answer ?? ''}
        style={style}
        autoComplete='new-password'
        helperText={translate('비밀번호를 잊었을 때 본인 확인에 사용됩니다. 답변은 저장 후 다시 볼 수 없으니 꼭 기억해 주세요.')}
        onKeyPress={(e) => {
          if (e.key == 'Enter') {
          }
        }}
      />
    </>
  );
};

// 검증 로직의 정본은 src/data/security-questions.js 한 곳(질문 목록을 쓰는 다른 화면과 공유).
// 가입 화면이 컴포넌트와 검증기를 한 경로에서 import 할 수 있도록 여기서도 그대로 내보낸다.
export { validateSecurityQuestion } from 'src/data/security-questions';

export default SecurityQuestionFields;
