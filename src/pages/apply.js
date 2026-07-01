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
import { useSubpageT, useFrameT } from 'src/components/main-site/landingStrings';

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
  const st = useSubpageT();
  const ft = useFrameT();
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
    if (!form.business_name.trim()) e.business_name = st('apply.vBizName');
    if (!isValidBizNo(form.business_number)) e.business_number = st('apply.vBizNo');
    if (!form.ceo_name.trim()) e.ceo_name = st('apply.vCeoName');
    if (!isValidPhone(form.ceo_phone)) e.ceo_phone = st('apply.vCeoPhone');
    if (!isValidEmail(form.ceo_email)) e.ceo_email = st('apply.vEmail');
    if (!form.manager_name.trim()) e.manager_name = st('apply.vMgrName');
    if (!isValidPhone(form.manager_phone)) e.manager_phone = st('apply.vMgrPhone');
    if (!isValidEmail(form.manager_email)) e.manager_email = st('apply.vEmail');
    if (!isValidSlug(form.desired_slug)) {
      e.desired_slug = st('apply.vSlug');
    }
    if (!form.selected_frame) e.selected_frame = st('apply.vFrame');
    if (!agreed) e.agreed = st('apply.vAgreed');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) {
      toast.error(st('apply.tCheckInput'));
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
        toast.success(st('apply.tSuccess'));
        router.push('/apply-complete');
      } else if (data?.result === -101) {
        setErrors((prev) => ({ ...prev, desired_slug: st('apply.tDupSlug') }));
        toast.error(st('apply.tDupSlug'));
      } else {
        toast.error(data?.message || st('apply.tError'));
      }
    } catch (err) {
      toast.error(st('apply.tServerError'));
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
          {st('apply.title')}
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#666', mt: 0.5 }}>
          {st('apply.desc')}
        </Typography>
      </Stack>

      <Section title={st('apply.sec1')}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Field label={st('apply.fBizName')} required>
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
            <Field label={st('apply.fBizNo')} required>
              <TextField
                fullWidth
                size="small"
                placeholder={st('apply.phBizNo')}
                value={form.business_number}
                onChange={(e) => set('business_number', e.target.value)}
                error={!!errors.business_number}
                helperText={errors.business_number || ''}
              />
            </Field>
          </Grid>
          <Grid item xs={12}>
            <Field label={st('apply.fMailOrder')}>
              <TextField
                fullWidth
                size="small"
                placeholder={st('apply.phMailOrder')}
                value={form.mail_order_number}
                onChange={(e) => set('mail_order_number', e.target.value)}
              />
            </Field>
          </Grid>
        </Grid>
      </Section>

      <Section title={st('apply.sec2')}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Field label={st('apply.fCeoName')} required>
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
            <Field label={st('apply.fCeoPhone')} required>
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
            <Field label={st('apply.fCeoEmail')}>
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

      <Section title={st('apply.sec3')}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Field label={st('apply.fMgrName')} required>
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
            <Field label={st('apply.fMgrPhone')} required>
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
            <Field label={st('apply.fMgrEmail')}>
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

      <Section title={st('apply.sec4')}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Field label={st('apply.fCsPhone')}>
              <TextField
                fullWidth
                size="small"
                placeholder={st('apply.phCsPhone')}
                value={form.cs_phone}
                onChange={(e) => set('cs_phone', e.target.value)}
              />
            </Field>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field label={st('apply.fReferrer')}>
              <TextField
                fullWidth
                size="small"
                placeholder={st('apply.phReferrer')}
                value={form.referrer_name}
                onChange={(e) => set('referrer_name', e.target.value)}
              />
            </Field>
          </Grid>
        </Grid>
      </Section>

      <Section title={st('apply.sec5')}>
        <Field label={st('apply.fSlug')} required>
          <TextField
            fullWidth
            size="small"
            placeholder={st('apply.phSlug')}
            value={form.desired_slug}
            onChange={(e) => set('desired_slug', e.target.value.toLowerCase().trim())}
            error={!!errors.desired_slug}
            helperText={errors.desired_slug || `${st('apply.exampleLabel')}: ${form.desired_slug || st('apply.slugExampleWord')}.${MAIN_DOMAIN}`}
            InputProps={{
              endAdornment: <InputAdornment position="end">.{MAIN_DOMAIN}</InputAdornment>,
            }}
          />
        </Field>
      </Section>

      <Section title={st('apply.sec6')}>
        <Field label={st('apply.fFrame')} required>
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
              <em>{st('apply.framePlaceholder')}</em>
            </MenuItem>
            {FRAMES.map((f) => {
              const fi = ft(f.key);
              return (
              <MenuItem key={f.key} value={f.key}>
                {`${f.no.toString().padStart(2, '0')} — ${fi.title} (${fi.keyword})`}
              </MenuItem>
              );
            })}
          </TextField>
          <Typography sx={{ fontSize: 12, color: '#777', mt: 0.75 }}>
            {st('apply.frameHintPre')}
            <Box
              component="span"
              onClick={() => window.open('/frames', '_blank')}
              sx={{ color: '#111', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {st('apply.frameHintLink')}
            </Box>
            {st('apply.frameHintPost')}
          </Typography>
        </Field>
      </Section>

      <Section title={st('apply.sec7')}>
        <AgreementBox
          agreed={agreed}
          onChange={setAgreed}
          error={!!errors.agreed}
          agreeLabel={st('apply.agreeLabel')}
          errorText={st('apply.agreeError')}
        />
      </Section>

      {Object.keys(errors).length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {st('apply.alertWarn')}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={() => router.push('/')}
          sx={{ borderColor: '#999', color: '#555', borderRadius: 999, px: 4, py: 1.25 }}
        >
          {st('apply.cancel')}
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
          {submitting ? st('apply.submitting') : st('apply.submit')}
        </Button>
      </Stack>
    </Container>
  );
};

ApplyPage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default ApplyPage;
