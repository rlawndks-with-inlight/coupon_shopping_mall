import { Icon } from '@iconify/react';
import {
  Button,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Col } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import {
  getSecurityQuestionLabel,
  getSecurityQuestionPlaceholder,
  isValidSecurityAnswer,
} from 'src/data/security-questions';
import { apiManager } from 'src/utils/api';

// SMS 대신 '보안질문'으로 동작하는 아이디찾기 / 비밀번호 재설정 본문(공용).
//
// 이 컴포넌트는 최상위로 <Stack spacing={2}> 하나만 렌더한다(페이지 래퍼·타이틀·Tabs 없음).
// 호출부(스토어프론트 데모 / 블로그 데모 / 매니저 페이지)가 기존 SMS UI의 <Stack> 자리에
// 그대로 끼워 넣어 각 데모의 시각적 래퍼가 1픽셀도 바뀌지 않게 하기 위함이다.
//
// !! 노출 게이트는 호출부 책임 !!
//   const { themeDnsData } = useSettingsContext();
//   isShopgoBrand(themeDnsData) ? <FindInfoQuestion .../> : (기존 SMS JSX 그대로)
// 여기서 게이트를 걸면 게이트 미적용 호출부에서 화면이 통째로 비어버리므로 걸지 않는다.
//
// API (백엔드가 이 형태로 구현됨):
//   POST auth/find-id                  { name, phone_num }                               -> { users: [{ user_name }] }
//   POST auth/security-question        { user_name, name }                               -> { security_question_id }
//   POST auth/reset-password-by-answer { user_name, name, security_answer, new_password } -> success
// brand_id / root_id 는 apiManager 가 localStorage 의 themeDnsData 에서 자동 주입한다.
const FindInfoQuestion = ({
  tab, // 0 = 아이디 찾기, 1 = 비밀번호 재설정 ('0' / '1' 문자열도 허용 — 느슨한 비교)
  findType, // tab 별칭(데모들이 쓰는 router.query.type 변수명)
  router,
  loginPath = '/shop/auth/login',
  isManager = false,
  translate = (text) => text, // useLocales 를 쓰지 않는 데모/매니저 페이지에서는 그대로 통과
  slotProps = {}, // { button: sx } — 데모별 버튼 스타일(메인컬러 등) 유지용
}) => {
  const { themeDnsData } = useSettingsContext();

  const activeTab = tab ?? findType;

  const [loading, setLoading] = useState(false);
  const [obj, setObj] = useState({
    name: '',
    phone_num: '',
    user_name: '',
    security_question_id: 0,
    security_answer: '',
    password: '',
    passwordCheck: '',
    find_user_list: [],
    step: 'input', // 'input' -> 'answer' (탭1 전용)
  });

  const onChange = (key, value) => {
    setObj((prev) => ({ ...prev, [key]: value }));
  };

  const buttonSx = { height: '48px', ...(slotProps?.button ?? {}) };

  // 탭0 : 이름 + 휴대폰번호로 아이디 찾기
  const onFindId = async () => {
    if (!obj.name) {
      return toast.error(translate('이름을 입력해주세요.'));
    }
    if (!obj.phone_num) {
      return toast.error(translate('휴대폰번호를 입력해주세요.'));
    }
    setLoading(true);
    let result = await apiManager('auth/find-id', 'create', {
      name: obj.name,
      phone_num: obj.phone_num,
    });
    setLoading(false);
    if (result?.users?.length > 0) {
      setObj((prev) => ({ ...prev, find_user_list: result?.users }));
    } else if (result !== false) {
      // result === false 인 경우는 apiManager 가 서버 메시지를 이미 토스트한 상태.
      toast.error(translate('일치하는 회원 정보를 찾을 수 없습니다.'));
    }
  };

  // 탭1 step1 : 아이디 + 이름으로 등록된 보안질문 조회
  const onCheckSecurityQuestion = async () => {
    if (!obj.user_name) {
      return toast.error(translate('아이디를 입력해주세요.'));
    }
    if (!obj.name) {
      return toast.error(translate('이름을 입력해주세요.'));
    }
    setLoading(true);
    let result = await apiManager('auth/security-question', 'create', {
      user_name: obj.user_name,
      name: obj.name,
    });
    setLoading(false);
    if (result?.security_question_id > 0) {
      setObj((prev) => ({
        ...prev,
        security_question_id: result?.security_question_id,
        step: 'answer',
      }));
    } else if (result !== false) {
      toast.error(translate('일치하는 회원 정보를 찾을 수 없습니다.'));
    }
  };

  // 탭1 step2 : 답변 + 새 비밀번호로 재설정
  const onResetPassword = async () => {
    if (!isValidSecurityAnswer(obj.security_answer)) {
      return toast.error(translate('답변을 2자 이상 입력해주세요.'));
    }
    if (!obj.password) {
      return toast.error(translate('비밀번호를 입력해주세요.'));
    }
    if (obj.password != obj.passwordCheck) {
      return toast.error(translate('비밀번호가 일치하지 않습니다.'));
    }
    setLoading(true);
    let result = await apiManager('auth/reset-password-by-answer', 'create', {
      user_name: obj.user_name,
      name: obj.name,
      security_answer: obj.security_answer, // 정규화·해시는 서버에서만. 원문 그대로 전송.
      new_password: obj.password,
    });
    setLoading(false);
    // 실패(오답·잠금 등)시에는 apiManager 가 서버 메시지를 토스트하고, 여기서는
    // 입력값을 '하나도' 초기화하지 않는다(답변 1회 틀렸다고 새 비밀번호 재입력시키지 않기).
    if (result !== false) {
      toast.success(translate('성공적으로 비밀번호가 변경되었습니다.'));
      router.push(loginPath);
    }
  };

  // 승인된 문의 문구(문구 그대로 노출해야 하므로 translate 를 통과시키지 않는다)
  const contactFooter = (
    <Stack spacing={0.5} sx={{ pt: 0.5 }}>
      {isManager ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          비밀번호를 찾을 수 없으면 본사에 문의해 주세요. (office@forspay.com)
        </Typography>
      ) : (
        <>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            비밀번호를 찾을 수 없으면 고객센터로 문의해 주세요.
          </Typography>
          {themeDnsData?.phone_num ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {themeDnsData?.phone_num}
            </Typography>
          ) : (
            <></>
          )}
        </>
      )}
    </Stack>
  );

  return (
    <Stack spacing={2}>
      {activeTab == 0 && (
        <>
          {obj?.find_user_list?.length > 0 ? (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {translate('찾은 아이디')}
              </Typography>
              <Col>
                {obj?.find_user_list.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ padding: '0.5rem' }}>{item?.user_name}</div>
                    <Divider />
                  </div>
                ))}
              </Col>
              <Button
                variant="contained"
                sx={buttonSx}
                startIcon={<Icon icon="material-symbols:lock" style={{ marginBottom: '0.2rem' }} />}
                onClick={() => {
                  router.push(loginPath);
                }}
              >
                {translate('로그인하기')}
              </Button>
            </>
          ) : (
            <>
              <FormControl variant="outlined">
                <InputLabel>{translate('이름')}</InputLabel>
                <OutlinedInput
                  label={translate('이름')}
                  autoComplete="new-password"
                  value={obj.name}
                  onChange={(e) => {
                    onChange('name', e.target.value);
                  }}
                />
              </FormControl>
              <FormControl variant="outlined">
                <InputLabel>{translate('휴대폰번호')}</InputLabel>
                {/* type="number" 를 쓰면 하이픈을 아예 입력할 수 없어(붙여넣기 시 값이 비워짐)
                    '010-1234-5678' 형태로 적는 사용자가 진행하지 못한다.
                    서버는 blindIndex 에서 공백·하이픈을 제거해 비교하므로 두 형태 모두 매칭된다. */}
                <OutlinedInput
                  label={translate('휴대폰번호')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="new-password"
                  value={obj.phone_num}
                  onChange={(e) => {
                    onChange('phone_num', e.target.value);
                  }}
                />
              </FormControl>
              <Button variant="contained" sx={buttonSx} disabled={loading} onClick={onFindId}>
                {translate('아이디 찾기')}
              </Button>
            </>
          )}
        </>
      )}

      {activeTab == 1 && (
        <>
          {obj.step == 'answer' ? (
            <>
              <Col style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(145,158,171,0.12)' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {translate('보안질문')}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {getSecurityQuestionLabel(obj.security_question_id)}
                </Typography>
              </Col>
              <FormControl variant="outlined">
                <InputLabel>{translate('답변')}</InputLabel>
                <OutlinedInput
                  label={translate('답변')}
                  autoComplete="off"
                  placeholder={getSecurityQuestionPlaceholder(obj.security_question_id)}
                  value={obj.security_answer}
                  onChange={(e) => {
                    onChange('security_answer', e.target.value);
                  }}
                />
                <FormHelperText>{translate('띄어쓰기와 대소문자는 구분하지 않습니다.')}</FormHelperText>
              </FormControl>
              <FormControl variant="outlined">
                <InputLabel>{translate('새 비밀번호')}</InputLabel>
                <OutlinedInput
                  label={translate('새 비밀번호')}
                  type="password"
                  autoComplete="new-password"
                  value={obj.password}
                  onChange={(e) => {
                    onChange('password', e.target.value);
                  }}
                />
              </FormControl>
              <FormControl variant="outlined">
                <InputLabel>{translate('새 비밀번호 확인')}</InputLabel>
                <OutlinedInput
                  label={translate('새 비밀번호 확인')}
                  type="password"
                  autoComplete="new-password"
                  value={obj.passwordCheck}
                  onChange={(e) => {
                    onChange('passwordCheck', e.target.value);
                  }}
                />
              </FormControl>
              <Button
                variant="contained"
                sx={buttonSx}
                disabled={loading}
                startIcon={<Icon icon="material-symbols:lock" style={{ marginBottom: '0.2rem' }} />}
                onClick={onResetPassword}
              >
                {translate('비밀번호 변경')}
              </Button>
              <Button
                variant="text"
                size="small"
                sx={{ color: 'text.secondary', alignSelf: 'flex-start' }}
                onClick={() => {
                  setObj((prev) => ({
                    ...prev,
                    step: 'input',
                    security_question_id: 0,
                    security_answer: '',
                  }));
                }}
              >
                {translate('아이디·이름 다시 입력')}
              </Button>
            </>
          ) : (
            <>
              <FormControl variant="outlined">
                <InputLabel>{translate('아이디')}</InputLabel>
                <OutlinedInput
                  label={translate('아이디')}
                  autoComplete="new-password"
                  value={obj.user_name}
                  onChange={(e) => {
                    onChange('user_name', e.target.value);
                  }}
                />
              </FormControl>
              <FormControl variant="outlined">
                <InputLabel>{translate('이름')}</InputLabel>
                <OutlinedInput
                  label={translate('이름')}
                  autoComplete="new-password"
                  value={obj.name}
                  onChange={(e) => {
                    onChange('name', e.target.value);
                  }}
                />
              </FormControl>
              <Button variant="contained" sx={buttonSx} disabled={loading} onClick={onCheckSecurityQuestion}>
                {translate('다음')}
              </Button>
            </>
          )}
          {contactFooter}
        </>
      )}
    </Stack>
  );
};

export default FindInfoQuestion;
