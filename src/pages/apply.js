import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import toast from 'react-hot-toast';
import axios from 'axios';
import MainSiteLayout, { MAIN_DOMAIN } from 'src/components/main-site/MainSiteLayout';
import AgreementBox from 'src/components/main-site/AgreementBox';
import { FRAMES } from 'src/components/main-site/frameList';

const initial = {
  business_name: '',
  business_number: '',
  mail_order_number: '',
  ceo_name: '',
  ceo_phone: '',
  ceo_email: '',
  manager_name: '',
  manager_phone: '',
  manager_email: '',
  cs_phone: '',
  referrer_name: '',
  desired_slug: '',
  selected_frame: '',
};

const isValidEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => /^[0-9-+\s()]{8,20}$/.test(v);
const isValidBizNo = (v) => /^[0-9]{10}$/.test(v.replace(/[\s-]/g, ''));
const isValidSlug = (v) => /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(v);

const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography sx={{ fontSize: 11, letterSpacing: 3, color: '#888', fontWeight: 700, mb: 1 }}>
      {title}
    </Typography>
    <Divider sx={{ borderColor: '#111', borderBottomWidth: 2, mb: 2.5 }} />
    {children}
  </Box>
);

const Field = ({ label, required, children }) => (
  <Box>
    <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.75, color: '#333' }}>
      {label}
      {required && <Box component="span" sx={{ color: '#d33', ml: 0.5 }}>*</Box>}
    </Typography>
    {children}
  </Box>
);

const ApplyPage = () => {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  useEffect(() => {
    if (!router.isReady) return;
    const frameFromQuery = router.query.frame;
    if (frameFromQuery && FRAMES.some((f) => f.key === frameFromQuery)) {
      setForm((prev) => ({ ...prev, selected_frame: String(frameFromQuery) }));
    }
  }, [router.isReady, router.query.frame]);

  const validate = () => {
    const e = {};
    if (!form.business_name.trim()) e.business_name = '사업자명을 입력해 주세요';
    if (!isValidBizNo(form.business_number)) e.business_number = '사업자번호 10자리를 입력해 주세요';
    if (!form.ceo_name.trim()) e.ceo_name = '대표자명을 입력해 주세요';
    if (!isValidPhone(form.ceo_phone)) e.ceo_phone = '대표자 연락처를 확인해 주세요';
    if (!isValidEmail(form.ceo_email)) e.ceo_email = '이메일 형식을 확인해 주세요';
    if (!form.manager_name.trim()) e.manager_name = '담당자명을 입력해 주세요';
    if (!isValidPhone(form.manager_phone)) e.manager_phone = '담당자 연락처를 확인해 주세요';
    if (!isValidEmail(form.manager_email)) e.manager_email = '이메일 형식을 확인해 주세요';
    if (!isValidSlug(form.desired_slug)) {
      e.desired_slug = '영문 소문자/숫자/하이픈 3~30자 (시작·끝은 영숫자)';
    }
    if (!form.selected_frame) e.selected_frame = '프레임을 1개 선택해 주세요';
    if (!agreed) e.agreed = '약정서 동의가 필요합니다';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) {
      toast.error('입력값을 확인해 주세요');
      return;
    }
    setSubmitting(true);
    try {
      const trimmed = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
      );
      const payload = {
        ...trimmed,
        business_number: trimmed.business_number.replace(/[\s-]/g, ''),
        agreement_agreed: true,
      };
      const { data } = await axios.post('/api/merchant-application', payload);
      if (data?.result === 100) {
        toast.success('신청이 접수되었습니다');
        router.push('/apply-complete');
      } else if (data?.result === -101) {
        setErrors((prev) => ({ ...prev, desired_slug: '이미 사용 중인 URL명입니다' }));
        toast.error('이미 사용 중인 URL명입니다');
      } else {
        toast.error(data?.message || '접수 중 오류가 발생했습니다');
      }
    } catch (err) {
      toast.error('서버 오류로 접수에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={1} mb={4}>
        <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
          APPLICATION
        </Typography>
        <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 900, letterSpacing: '-1px' }}>
          온라인 쇼핑몰 신청서
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#666', mt: 0.5 }}>
          입력하신 내용을 확인 후 담당자가 연락드립니다. 모든 필수 항목 입력 후 약정서에 동의해 주세요.
        </Typography>
      </Stack>

      <Section title="01 · 사업자 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Field label="사업자명" required>
              <TextField
                fullWidth
                size="small"
                value={form.business_name}
                onChange={(e) => set('business_name', e.target.value)}
                error={!!errors.business_name}
                helperText={errors.business_name || ''}
              />
            </Field>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field label="사업자번호" required>
              <TextField
                fullWidth
                size="small"
                placeholder="10자리 숫자"
                value={form.business_number}
                onChange={(e) => set('business_number', e.target.value)}
                error={!!errors.business_number}
                helperText={errors.business_number || ''}
              />
            </Field>
          </Grid>
          <Grid item xs={12}>
            <Field label="통신판매업신고번호">
              <TextField
                fullWidth
                size="small"
                placeholder="예: 2024-서울강남-1234"
                value={form.mail_order_number}
                onChange={(e) => set('mail_order_number', e.target.value)}
              />
            </Field>
          </Grid>
        </Grid>
      </Section>

      <Section title="02 · 대표자 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Field label="대표자명" required>
              <TextField
                fullWidth
                size="small"
                value={form.ceo_name}
                onChange={(e) => set('ceo_name', e.target.value)}
                error={!!errors.ceo_name}
                helperText={errors.ceo_name || ''}
              />
            </Field>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="대표자 연락처" required>
              <TextField
                fullWidth
                size="small"
                placeholder="010-0000-0000"
                value={form.ceo_phone}
                onChange={(e) => set('ceo_phone', e.target.value)}
                error={!!errors.ceo_phone}
                helperText={errors.ceo_phone || ''}
              />
            </Field>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="대표자 이메일">
              <TextField
                fullWidth
                size="small"
                placeholder="ceo@example.com"
                value={form.ceo_email}
                onChange={(e) => set('ceo_email', e.target.value.trim())}
                error={!!errors.ceo_email}
                helperText={errors.ceo_email || ''}
              />
            </Field>
          </Grid>
        </Grid>
      </Section>

      <Section title="03 · 담당자 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Field label="담당자명" required>
              <TextField
                fullWidth
                size="small"
                value={form.manager_name}
                onChange={(e) => set('manager_name', e.target.value)}
                error={!!errors.manager_name}
                helperText={errors.manager_name || ''}
              />
            </Field>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="담당자 연락처" required>
              <TextField
                fullWidth
                size="small"
                placeholder="010-0000-0000"
                value={form.manager_phone}
                onChange={(e) => set('manager_phone', e.target.value)}
                error={!!errors.manager_phone}
                helperText={errors.manager_phone || ''}
              />
            </Field>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Field label="담당자 이메일">
              <TextField
                fullWidth
                size="small"
                placeholder="manager@example.com"
                value={form.manager_email}
                onChange={(e) => set('manager_email', e.target.value.trim())}
                error={!!errors.manager_email}
                helperText={errors.manager_email || ''}
              />
            </Field>
          </Grid>
        </Grid>
      </Section>

      <Section title="04 · 운영 정보">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Field label="고객센터 번호">
              <TextField
                fullWidth
                size="small"
                placeholder="1588-0000 등"
                value={form.cs_phone}
                onChange={(e) => set('cs_phone', e.target.value)}
              />
            </Field>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field label="영업추천인">
              <TextField
                fullWidth
                size="small"
                placeholder="추천인이 있으면 입력해 주세요"
                value={form.referrer_name}
                onChange={(e) => set('referrer_name', e.target.value)}
              />
            </Field>
          </Grid>
        </Grid>
      </Section>

      <Section title="05 · 쇼핑몰 주소 (가맹점명)">
        <Field label="사용하실 가맹점명" required>
          <TextField
            fullWidth
            size="small"
            placeholder="영문 소문자/숫자/하이픈"
            value={form.desired_slug}
            onChange={(e) => set('desired_slug', e.target.value.toLowerCase().trim())}
            error={!!errors.desired_slug}
            helperText={errors.desired_slug || `예시: ${form.desired_slug || '가맹점명'}.${MAIN_DOMAIN}`}
            InputProps={{
              endAdornment: <InputAdornment position="end">.{MAIN_DOMAIN}</InputAdornment>,
            }}
          />
        </Field>
      </Section>

      <Section title="06 · 프레임 선택">
        <Field label="원하시는 디자인 프레임" required>
          <TextField
            select
            fullWidth
            size="small"
            value={form.selected_frame}
            onChange={(e) => set('selected_frame', e.target.value)}
            error={!!errors.selected_frame}
            helperText={errors.selected_frame || ''}
          >
            <MenuItem value="">
              <em>프레임 선택</em>
            </MenuItem>
            {FRAMES.map((f) => (
              <MenuItem key={f.key} value={f.key}>
                {`${f.no.toString().padStart(2, '0')} — ${f.title} (${f.keyword})`}
              </MenuItem>
            ))}
          </TextField>
          <Typography sx={{ fontSize: 12, color: '#777', mt: 0.75 }}>
            프레임을 자세히 보려면{' '}
            <Box
              component="span"
              onClick={() => window.open('/frames', '_blank')}
              sx={{ color: '#111', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              프레임 페이지
            </Box>
            를 열어 미리보기 후 선택하세요.
          </Typography>
        </Field>
      </Section>

      <Section title="07 · 약정서">
        <AgreementBox agreed={agreed} onChange={setAgreed} error={!!errors.agreed} />
      </Section>

      {Object.keys(errors).length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          입력값을 확인해 주세요. 누락되거나 형식이 맞지 않는 항목이 있습니다.
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={() => router.push('/')}
          sx={{ borderColor: '#999', color: '#555', borderRadius: 999, px: 4, py: 1.25 }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitting}
          sx={{
            bgcolor: '#111',
            color: '#fff',
            fontWeight: 700,
            borderRadius: 999,
            px: 5,
            py: 1.25,
            '&:hover': { bgcolor: '#000' },
            '&.Mui-disabled': { bgcolor: '#999', color: '#fff' },
          }}
        >
          {submitting ? '접수 중…' : '신청서 제출'}
        </Button>
      </Stack>
    </Container>
  );
};

ApplyPage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default ApplyPage;
