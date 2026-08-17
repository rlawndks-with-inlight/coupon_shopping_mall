import { useState, useEffect } from 'react';
import { Box, Typography, Stack, FormControlLabel, Checkbox, Divider, Dialog, DialogTitle, DialogContent, IconButton, useMediaQuery } from '@mui/material';
import { Icon } from '@iconify/react';
import { POLICY_DOCS, getPolicyDoc } from './policyContent';
import { useLandingT } from './landingStrings';
import { policyLabelKey } from './MainSiteLayout';

// SHOPGO 가맹점 신청 약관 동의 — 항목별 개별 동의(개인정보보호법상 개별 동의 원칙).
// 필수 4종(이용약관·이용동의·개인정보처리방침·PG정책) 모두 체크해야 onChange(true) 전달.
// 관련 정책 3종(운영·해지·책임)은 열람(고지)용 링크.
const REQUIRED = POLICY_DOCS.filter((d) => d.consent === 'required');
const NOTICE = POLICY_DOCS.filter((d) => d.consent === 'notice');

// 문단 유형 판별 → 장/조/부칙 강조 (policy 페이지와 동일 규칙)
const lineKind = (s) => {
  if (/^제\s*\d+\s*장/.test(s)) return 'chapter';
  if (/^제\s*\d+\s*조/.test(s)) return 'article';
  if (/^부칙/.test(s)) return 'article';
  return 'body';
};

const AgreementBox = ({ onChange, error, errorText }) => {
  const t = useLandingT();
  // 약관 '문서'는 한국어 원문뿐이지만 이름·라벨은 보고 있는 화면의 언어로 띄운다.
  const 제목 = (d) => t[policyLabelKey(d.slug)] || d.title.replace('SHOPGO ', '');
  const [checked, setChecked] = useState(() => {
    const o = {};
    REQUIRED.forEach((d) => (o[d.slug] = false));
    return o;
  });

  const [viewSlug, setViewSlug] = useState(null);
  const viewDoc = viewSlug ? getPolicyDoc(viewSlug) : null;
  const fullScreen = useMediaQuery('(max-width:600px)');

  const allChecked = REQUIRED.every((d) => checked[d.slug]);

  useEffect(() => {
    onChange?.(allChecked);
  }, [allChecked]);

  const toggleAll = (v) => {
    const o = {};
    REQUIRED.forEach((d) => (o[d.slug] = v));
    setChecked(o);
  };
  const toggleOne = (slug, v) => setChecked((prev) => ({ ...prev, [slug]: v }));

  return (
    <Box>
      <Box
        sx={{
          border: `1px solid ${error ? '#d33' : '#ddd'}`,
          borderRadius: 1.5,
          p: { xs: 2, sm: 2.5 },
          bgcolor: '#fafafa',
        }}
      >
        {/* 전체 동의 */}
        <FormControlLabel
          control={<Checkbox checked={allChecked} onChange={(e) => toggleAll(e.target.checked)} />}
          label={<Typography sx={{ fontSize: 15, fontWeight: 800 }}>{t.agreeAllLabel}</Typography>}
        />
        <Divider sx={{ my: 1.5 }} />

        {/* 필수 약관 개별 동의 */}
        <Stack spacing={0.5}>
          {REQUIRED.map((d) => (
            <Box key={d.slug} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormControlLabel
                sx={{ mr: 0 }}
                control={
                  <Checkbox
                    size="small"
                    checked={!!checked[d.slug]}
                    onChange={(e) => toggleOne(d.slug, e.target.checked)}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13.5 }}>
                    <Box component="span" sx={{ color: '#84cc16', fontWeight: 700, mr: 0.5 }}>
                      {t.agreeRequiredTag}
                    </Box>
                    {제목(d)}
                  </Typography>
                }
              />
              <Box
                component="button"
                type="button"
                onClick={() => setViewSlug(d.slug)}
                sx={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: '#888', fontSize: 12, textDecoration: 'underline', whiteSpace: 'nowrap', px: 0.5,
                }}
              >
                {t.agreeViewBtn}
              </Box>
            </Box>
          ))}
        </Stack>

        {/* 관련 정책(열람) */}
        <Divider sx={{ my: 1.5 }} />
        <Typography sx={{ fontSize: 12, color: '#999', mb: 0.75 }}>
          {t.agreeNoticeTitle}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
          {NOTICE.map((d) => (
            <Box
              key={d.slug}
              component="button"
              type="button"
              onClick={() => setViewSlug(d.slug)}
              sx={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: '#666', fontSize: 12, textDecoration: 'underline', p: 0,
              }}
            >
              {제목(d)}
            </Box>
          ))}
        </Stack>
      </Box>

      {error && (
        <Typography sx={{ fontSize: 12, color: '#d33', mt: 0.75 }}>
          {errorText || t.agreeAllError}
        </Typography>
      )}

      {/* 약관 보기 — 새 창 대신 팝업(모달) */}
      <Dialog
        open={!!viewDoc}
        onClose={() => setViewSlug(null)}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        scroll="paper"
        PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 2, maxHeight: fullScreen ? '100%' : '85vh' } }}
      >
        {viewDoc && (
          <>
            <DialogTitle sx={{ pr: 6, fontSize: 18, fontWeight: 800 }}>
              {제목(viewDoc)}
              {viewDoc.effectiveDate && (
                <Typography sx={{ fontSize: 12, color: '#999', fontWeight: 400, mt: 0.5 }}>
                  {t.policyEffective}: {viewDoc.effectiveDate} · {t.policyKoreanOnly}
                </Typography>
              )}
              <IconButton
                aria-label="닫기"
                onClick={() => setViewSlug(null)}
                sx={{ position: 'absolute', right: 8, top: 8, color: '#888' }}
              >
                <Icon icon="mdi:close" />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {viewDoc.lines.map((line, i) => {
                const kind = lineKind(line);
                if (kind === 'chapter') {
                  return (
                    <Typography key={i} sx={{ fontSize: 16, fontWeight: 800, mt: 3, mb: 1.25, color: '#111' }}>
                      {line}
                    </Typography>
                  );
                }
                if (kind === 'article') {
                  return (
                    <Typography key={i} sx={{ fontSize: 14.5, fontWeight: 700, mt: 2, mb: 0.75, color: '#222' }}>
                      {line}
                    </Typography>
                  );
                }
                return (
                  // 여기만 keep-all 을 직접 준다. 이유가 둘이다.
                  //  ① Dialog 는 포털이라 DOM 상 body 바로 밑에 붙는다 — 레이아웃의 줄바꿈 규칙을 상속 못 받는다.
                  //  ② 약관 본문은 화면 언어와 무관하게 늘 한국어다 — 화면 언어가 아니라 글의 언어를 따라야 한다.
                  <Typography key={i} sx={{ fontSize: 13.5, color: '#444', lineHeight: 1.85, mb: 0.75, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
                    {line}
                  </Typography>
                );
              })}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AgreementBox;
