import { useState, useEffect } from 'react';
import { useLocales } from 'src/locales';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { apiManager } from 'src/utils/api';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import {
  SECURITY_QUESTIONS,
  getSecurityQuestionPlaceholder,
  isValidSecurityAnswer,
  SECURITY_ANSWER_MIN_LENGTH,
} from 'src/data/security-questions';

// 로그인 후 '보안질문 설정' 안내 배너 + 설정 다이얼로그.
//
// 기존 회원은 보안질문이 없다(신규 기능). 비밀번호 분실 시 본인 확인 수단이 되므로
// 로그인 후 한 번씩 안내하되, 경고가 아니라 '권유' 톤으로 조용히 노출한다.
//
// 노출 조건(셋 다 만족해야만 렌더):
//   1) 로그인 상태 (user?.id > 0)
//   2) SHOPGO 본사 및 산하 가맹점 (isShopgoBrand) — 다른 클라이언트 브랜드는 기존 SMS 흐름 그대로
//   3) user.has_security_question === 0  (엄격 비교)
//      · 1        → 이미 설정 완료 → 미노출
//      · undefined → 배포 전 발급된 구 토큰(클레임 없음) → 미노출.
//        falsy 체크(!user.has_security_question)를 쓰면 구 토큰 사용자 전원에게
//        잘못된 안내가 뜨므로 반드시 === 0 으로 판별할 것.
//
// 닫기는 '세션 한정'(서버 저장 없음) — 설정하기 전까지 다음 로그인에 다시 안내된다.
//
// 매니저(가맹점) 페이지에서는 배너에 더해 설정 팝업이 세션당 한 번 자동으로 열린다.
// 가맹점 관리자 계정은 회원가입 폼이 없어(본사가 생성) 보안질문을 넣을 지점이 로그인 후뿐이고,
// 답변까지 잊으면 본사 초기화 외에 복구 수단이 없어 설정률이 중요하기 때문이다.
// 반면 스토어프론트(고객)는 자동으로 열지 않는다 — 가입 시 이미 받았고, 구매 흐름을 가로막으면 안 된다.
const DISMISS_KEY = 'sq_prompt_dismissed';
const AUTO_OPEN_KEY = 'sq_prompt_auto_opened';

const SecurityQuestionBanner = ({ sx = {} }) => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  const { translate } = useLocales();
  const { user, initialize } = useAuthContext();

  // SSR/하이드레이션 안전: 첫 렌더는 무조건 숨김 → 마운트 후 세션 닫기 이력 확인.
  const [dismissed, setDismissed] = useState(true);
  const [saved, setSaved] = useState(false); // 저장 직후 즉시 숨김(토큰 재발급 지연 대비)
  const [open, setOpen] = useState(false);
  const [questionId, setQuestionId] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
    } catch (e) {
      // 프라이빗 모드 등 sessionStorage 접근 불가 → 컴포넌트 state 로만 동작
      setDismissed(false);
    }
  }, []);

  // 매니저 페이지 진입 시 설정 팝업 1회 자동 오픈(세션당 1회).
  // 아래 노출 게이트와 동일한 조건을 여기서 다시 검사한다 — 게이트는 early return 이라
  // 훅보다 뒤에 있어야 하므로 이 useEffect 안에서 판정해야 한다.
  useEffect(() => {
    if (dismissed || saved) return;
    if (!(user?.id > 0)) return;
    if (!isShopgoBrand(themeDnsData)) return;
    if (user?.has_security_question !== 0) return;
    if (!String(router?.pathname ?? '').startsWith('/manager')) return;
    try {
      if (sessionStorage.getItem(AUTO_OPEN_KEY) === '1') return;
      sessionStorage.setItem(AUTO_OPEN_KEY, '1');
    } catch (e) {
      // sessionStorage 사용 불가 → 이번 마운트에서 한 번만 열림(중복 방지는 포기)
    }
    setOpen(true);
  }, [dismissed, saved, user, themeDnsData, router?.pathname]);

  // --- 노출 게이트 (훅 선언 뒤에 위치해야 훅 순서가 깨지지 않음) ---
  if (dismissed || saved) return null;
  if (!(user?.id > 0)) return null;
  if (!isShopgoBrand(themeDnsData)) return null;
  if (user?.has_security_question !== 0) return null;

  const isManagerPage = String(router?.pathname ?? '').startsWith('/manager');
  const mainColor = themeDnsData?.theme_css?.main_color || '#2e7d32';

  const onDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch (e) {
      // 저장 실패해도 이번 렌더 트리 안에서는 state 로 숨겨진다
    }
  };

  const onOpen = () => {
    setQuestionId(0);
    setAnswer('');
    setOpen(true);
  };

  const onSave = async () => {
    if (loading) return;
    if (!(questionId > 0)) {
      toast.error(translate('보안질문을 선택해 주세요.'));
      return;
    }
    if (!isValidSecurityAnswer(answer)) {
      toast.error(`답변은 공백을 제외하고 ${SECURITY_ANSWER_MIN_LENGTH}자 이상 입력해 주세요.`);
      return;
    }
    setLoading(true);
    // PUT /api/auth/security-question/  (apiManager: 'update' = PUT)
    // params 에 id 키를 절대 넣지 말 것 — api.js 가 URL 뒤에 붙인다.
    const result = await apiManager('auth/security-question', 'update', {
      security_question_id: questionId,
      security_answer: answer, // 원본 그대로 전송(정규화·해시는 서버 담당)
    });
    setLoading(false);
    // api.js 는 실패 시 정확히 false 를 반환하고 메시지를 toast 한다.
    // 성공 응답의 data 가 비어있을 수 있으므로 falsy 가 아닌 === false 로 판별.
    if (result === false) return;
    toast.success(translate('보안질문이 등록되었습니다.'));
    setOpen(false);
    setSaved(true);
    try {
      // 인증 컨텍스트 재조회 → GET /api/auth 로 user 갱신 →
      // 서버가 재발급한 토큰의 has_security_question:1 이 반영되어 배너가 영구 미노출된다.
      await initialize();
    } catch (e) {
      // 갱신 실패해도 saved state 로 이번 세션은 숨김 유지
    }
  };

  const banner = (
    <Card
      variant="outlined"
      sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2, borderColor: '#e0e0e0', ...sx }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Icon icon="mdi:shield-key-outline" color={mainColor} width={22} height={22} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#222' }}>
              {translate('보안질문을 설정해 주세요')}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: '#888' }}>
              {translate('비밀번호를 잊었을 때 본인 확인용으로 사용됩니다. 1분이면 됩니다.')}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
          <Button
            size="small"
            variant="contained"
            onClick={onOpen}
            sx={{ whiteSpace: 'nowrap', bgcolor: mainColor, '&:hover': { bgcolor: mainColor, opacity: 0.9 } }}
          >
            {translate('설정하기')}
          </Button>
          <IconButton size="small" onClick={onDismiss} aria-label={translate('닫기')}>
            <Icon icon="mdi:close" fontSize="1.05rem" />
          </IconButton>
        </Stack>
      </Stack>
    </Card>
  );

  return (
    <>
      {isManagerPage ? (
        banner
      ) : (
        <Box sx={{ width: '92%', maxWidth: '1200px', margin: '1rem auto' }}>{banner}</Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontSize: 17, fontWeight: 700 }}>{translate('보안질문 설정')}</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: '#888', mb: 2 }}>{translate('비밀번호를 잊었을 때 본인 확인에 사용됩니다. 답변은 나중에 확인할 수 없으니 잊지 않을 내용으로 정해 주세요.')}</Typography>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="security-question-select-label">{translate('보안질문')}</InputLabel>
              <Select
                labelId="security-question-select-label"
                label={translate('보안질문')}
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
              >
                <MenuItem value={0} disabled>
                  {translate('보안질문을 먼저 선택해 주세요')}
                </MenuItem>
                {/* 질문 문구도 번역한다 — 고객이 보는 화면이다.
                    (사전에 없으면 i18next 가 키를 그대로 돌려주므로 한국어로 보인다) */}
                {SECURITY_QUESTIONS.map((q) => (
                  <MenuItem key={q.id} value={q.id}>
                    {translate(q.label)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label={translate('답변')}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={
                questionId > 0 ? `예) ${getSecurityQuestionPlaceholder(questionId)}` : '예) 상계동'
              }
              inputProps={{ maxLength: 50 }}
              helperText="띄어쓰기와 대소문자는 구분하지 않습니다."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSave();
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setOpen(false)} disabled={loading}>{translate('나중에')}</Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ bgcolor: mainColor, '&:hover': { bgcolor: mainColor, opacity: 0.9 } }}
          >{translate('저장')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SecurityQuestionBanner;
