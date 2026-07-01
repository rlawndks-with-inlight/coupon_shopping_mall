import { Box, Typography, Stack, FormControlLabel, Checkbox } from '@mui/material';
import { useAgreement } from './agreementTextI18n';

const AgreementBox = ({ agreed, onChange, error, agreeLabel, errorText }) => {
  const { data, refNote } = useAgreement();
  const { title, intro, articles } = data;
  return (
    <Box>
      <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1.5, color: '#111' }}>
        {title}
      </Typography>
      {refNote && (
        <Typography sx={{ fontSize: 11, color: '#999', mb: 1, lineHeight: 1.5 }}>
          {refNote}
        </Typography>
      )}

      <Box
        sx={{
          height: 280,
          overflowY: 'auto',
          border: '1px solid #ddd',
          borderRadius: 1,
          p: 2,
          bgcolor: '#fafafa',
          fontSize: 12,
          lineHeight: 1.7,
          color: '#444',
        }}
      >
        <Stack spacing={1.5}>
          {intro.map((line, idx) => (
            <Typography key={`intro-${idx}`} sx={{ fontSize: 12, lineHeight: 1.7, color: '#444' }}>
              {line}
            </Typography>
          ))}

          {articles.map((article, idx) => (
            <Box key={`art-${idx}`} sx={{ pt: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#111', mb: 0.5 }}>
                {article.title}
              </Typography>
              {article.body.map((line, lineIdx) => (
                <Typography
                  key={`art-${idx}-${lineIdx}`}
                  sx={{ fontSize: 12, lineHeight: 1.7, color: '#444', whiteSpace: 'pre-wrap' }}
                >
                  {line}
                </Typography>
              ))}
            </Box>
          ))}
        </Stack>
      </Box>

      <FormControlLabel
        sx={{ mt: 1.5 }}
        control={
          <Checkbox
            checked={!!agreed}
            onChange={(e) => onChange(e.target.checked)}
            sx={{ color: error ? '#d33' : undefined }}
          />
        }
        label={
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
            {agreeLabel || '위 무료 쇼핑몰 제공 약정서 내용을 확인하였으며, 이에 동의합니다. (필수)'}
          </Typography>
        }
      />
      {error && (
        <Typography sx={{ fontSize: 12, color: '#d33', mt: 0.5 }}>
          {errorText || '약정서 동의가 필요합니다.'}
        </Typography>
      )}
    </Box>
  );
};

export default AgreementBox;
