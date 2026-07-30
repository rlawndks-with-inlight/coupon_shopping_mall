import { useState, useEffect } from 'react';
import { Box, Typography, Stack, FormControlLabel, Checkbox, Divider } from '@mui/material';
import { POLICY_DOCS } from './policyContent';

// SHOPGO 가맹점 신청 약관 동의 — 항목별 개별 동의(개인정보보호법상 개별 동의 원칙).
// 필수 4종(이용약관·이용동의·개인정보처리방침·PG정책) 모두 체크해야 onChange(true) 전달.
// 관련 정책 3종(운영·해지·책임)은 열람(고지)용 링크.
const REQUIRED = POLICY_DOCS.filter((d) => d.consent === 'required');
const NOTICE = POLICY_DOCS.filter((d) => d.consent === 'notice');

const openDoc = (slug) => {
  if (typeof window !== 'undefined') window.open(`/policy/${slug}`, '_blank');
};

const AgreementBox = ({ onChange, error, errorText }) => {
  const [checked, setChecked] = useState(() => {
    const o = {};
    REQUIRED.forEach((d) => (o[d.slug] = false));
    return o;
  });

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
          label={<Typography sx={{ fontSize: 15, fontWeight: 800 }}>약관에 전체 동의합니다</Typography>}
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
                    <Box component="span" sx={{ color: '#d33', fontWeight: 700, mr: 0.5 }}>
                      [필수]
                    </Box>
                    {d.title}
                  </Typography>
                }
              />
              <Box
                component="button"
                type="button"
                onClick={() => openDoc(d.slug)}
                sx={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: '#888', fontSize: 12, textDecoration: 'underline', whiteSpace: 'nowrap', px: 0.5,
                }}
              >
                보기
              </Box>
            </Box>
          ))}
        </Stack>

        {/* 관련 정책(열람) */}
        <Divider sx={{ my: 1.5 }} />
        <Typography sx={{ fontSize: 12, color: '#999', mb: 0.75 }}>
          관련 정책 (가입 시 함께 적용됩니다 · 열람)
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.5}>
          {NOTICE.map((d) => (
            <Box
              key={d.slug}
              component="button"
              type="button"
              onClick={() => openDoc(d.slug)}
              sx={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: '#666', fontSize: 12, textDecoration: 'underline', p: 0,
              }}
            >
              {d.title}
            </Box>
          ))}
        </Stack>
      </Box>

      {error && (
        <Typography sx={{ fontSize: 12, color: '#d33', mt: 0.75 }}>
          {errorText || '필수 약관에 모두 동의해 주세요.'}
        </Typography>
      )}
    </Box>
  );
};

export default AgreementBox;
