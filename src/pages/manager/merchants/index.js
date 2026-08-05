import { useEffect, useState } from "react";
import {
  Card, Container, Stack, Typography, Button, Grid, Avatar, Box, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Alert,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { commarNumber, returnMoment } from "src/utils/function";

const PERIODS = [
  { key: 'all', label: '전체' },
  { key: 'today', label: '오늘' },
  { key: '7', label: '7일' },
  { key: '30', label: '30일' },
];

const TRX_STATUS = { 0: '결제대기', 1: '취소요청', 5: '결제완료', 10: '입고완료', 15: '출고완료', 20: '배송중', 25: '배송완료' };
const STATUS_ORDER = [0, 5, 10, 15, 20, 25];

const periodToRange = (key) => {
  if (key === 'all') return {};
  if (key === 'today') return { s_dt: returnMoment().substring(0, 10), e_dt: returnMoment().substring(0, 10) };
  return { s_dt: returnMoment(-Number(key)).substring(0, 10), e_dt: returnMoment().substring(0, 10) };
};

const SummaryCard = ({ label, value, suffix }) => (
  <Card sx={{ p: 2.5 }}>
    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{label}</Typography>
    <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
      {value}
      <Typography component="span" variant="subtitle1" sx={{ ml: 0.5, color: 'text.secondary' }}>{suffix}</Typography>
    </Typography>
  </Card>
);

const DnsLink = ({ dns }) => (
  <Box
    component="a"
    href={`https://${dns}`}
    target="_blank"
    rel="noopener noreferrer"
    sx={{ color: 'primary.main', textDecoration: 'underline', fontWeight: 600, '&:hover': { color: 'primary.dark' } }}
  >
    {dns}
  </Box>
);

// 전화번호는 tel: 링크로 렌더 (모바일에서 바로 통화 / PC에서 드래그 복사 가능).
// 값이 없으면 '-' 로 표시한다.
const PhoneLink = ({ value, variant = 'body2' }) => {
  if (!value) return <Typography variant={variant} sx={{ color: 'text.disabled' }}>-</Typography>;
  return (
    <Typography
      component="a"
      variant={variant}
      href={`tel:${String(value).replace(/[^0-9+]/g, '')}`}
      sx={{
        color: 'primary.main', textDecoration: 'none', userSelect: 'text',
        wordBreak: 'break-all', '&:hover': { textDecoration: 'underline' },
      }}
    >
      {value}
    </Typography>
  );
};

const MerchantsPage = () => {
  const [merchants, setMerchants] = useState([]);
  const [summary, setSummary] = useState({ merchant_count: 0, total_sales: 0, order_count: 0 });
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(false);

  // 상세 내역 모달
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 관리자 비밀번호 초기화 (확인 → 실행 → 결과)
  const [resetTarget, setResetTarget] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  const fetchData = async (key) => {
    setLoading(true);
    try {
      const { data: res } = await axios.get('/api/merchant-application/merchants', { params: periodToRange(key) });
      if (res?.result === 100) {
        setMerchants(res.data?.merchants || []);
        setSummary(res.data?.summary || { merchant_count: 0, total_sales: 0, order_count: 0 });
      }
    } catch (e) { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(period); }, [period]);

  const openDetail = async (m) => {
    // 상세 응답 도착 전까지 목록이 이미 가진 값으로 먼저 채워 깜빡임을 줄인다(고객센터 번호는 상세에서만 온다).
    setDetail({
      brand: {
        id: m.id, name: m.name, dns: m.dns, created_at: m.created_at,
        admin_user_id: m.admin_user_id, admin_user_name: m.admin_user_name,
        admin_name: m.admin_name, admin_phone_num: m.admin_phone_num,
      },
    });
    setDetailLoading(true);
    try {
      const { data: res } = await axios.get(`/api/merchant-application/merchants/${m.id}`, { params: periodToRange(period) });
      if (res?.result === 100) {
        setDetail(res.data);
      } else {
        toast.error(res?.message || '상세 조회 실패');
      }
    } catch (e) {
      toast.error('상세 조회 실패');
    } finally {
      setDetailLoading(false);
    }
  };

  const runResetAdminPw = async () => {
    if (!resetTarget || resetting) return;
    setResetting(true);
    try {
      const { data: res } = await axios.put(`/api/merchant-application/merchants/${resetTarget.id}/reset-admin-pw`);
      if (res?.result === 100) {
        const userName = res.data?.user_name || resetTarget.admin_user_name;
        toast.success('관리자 비밀번호를 초기화했습니다.');
        // 목록에는 변경되는 값이 없으므로 재조회하지 않음
        setResetResult({ brand_name: resetTarget.name, user_name: userName });
        setResetTarget(null);
      } else {
        toast.error(res?.message || '비밀번호 초기화 실패');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || '비밀번호 초기화 실패');
    } finally {
      setResetting(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1}>
          <Typography variant="h5">가맹점 현황</Typography>
          <Stack direction="row" spacing={1}>
            {PERIODS.map((p) => (
              <Button key={p.key} size="small" variant={period === p.key ? 'contained' : 'outlined'} onClick={() => setPeriod(p.key)}>
                {p.label}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><SummaryCard label="개설 가맹점" value={commarNumber(summary.merchant_count)} suffix="곳" /></Grid>
          <Grid item xs={12} sm={4}><SummaryCard label="기간 매출 합계" value={commarNumber(summary.total_sales)} suffix="원" /></Grid>
          <Grid item xs={12} sm={4}><SummaryCard label="기간 주문 합계" value={commarNumber(summary.order_count)} suffix="건" /></Grid>
        </Grid>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>가맹점</TableCell>
                  <TableCell>주소</TableCell>
                  <TableCell>개설일</TableCell>
                  <TableCell align="right">주문</TableCell>
                  <TableCell align="right">매출(원)</TableCell>
                  <TableCell align="center">관리자 계정 / 연락처</TableCell>
                  <TableCell align="center">상세</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {merchants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      {loading ? '불러오는 중…' : '개설된 가맹점이 없습니다.'}
                    </TableCell>
                  </TableRow>
                )}
                {merchants.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={m.logo_img} alt={m.name} sx={{ width: 32, height: 32 }}>
                          {(m.name || '?').slice(0, 1)}
                        </Avatar>
                        <Typography variant="subtitle2">{m.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell><DnsLink dns={m.dns} /></TableCell>
                    <TableCell>{m.created_at ? String(m.created_at).slice(0, 10) : '-'}</TableCell>
                    <TableCell align="right">{commarNumber(m.order_count)}</TableCell>
                    <TableCell align="right"><Typography variant="subtitle2">{commarNumber(m.sales)}</Typography></TableCell>
                    <TableCell align="center">
                      <Stack spacing={1} alignItems="center">
                        <Stack spacing={0.25} alignItems="center">
                          <Typography variant="subtitle2" sx={{ userSelect: 'text' }}>
                            {m.admin_user_name || '-'}
                          </Typography>
                          {/* 실명(name)은 '아이디 찾기'의 매칭 기준이라, 비어 있으면 그 계정은
                              아이디 찾기가 불가능하다 → 눈에 띄게 표시해 본사가 바로 알아채도록 한다. */}
                          {m.admin_name ? (
                            <Typography variant="caption" sx={{ color: 'text.secondary', userSelect: 'text' }}>
                              {m.admin_name}
                            </Typography>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'warning.main' }}>
                              이름 없음
                            </Typography>
                          )}
                          <PhoneLink value={m.admin_phone_num} variant="caption" />
                        </Stack>
                        <Tooltip
                          title={m.admin_user_id
                            ? `관리자 아이디: ${m.admin_user_name} · 비밀번호를 아이디와 동일하게 초기화합니다.`
                            : '관리자 계정이 없습니다.'}
                        >
                          <span>
                            <Button size="small" variant="outlined" color="warning"
                              startIcon={<Icon icon="solar:key-minimalistic-square-linear" />}
                              disabled={!m.admin_user_id}
                              onClick={() => setResetTarget(m)}>
                              비밀번호 초기화
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" startIcon={<Icon icon="solar:document-text-linear" />}
                        onClick={() => openDetail(m)}>
                        상세
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      <MerchantDetailDialog detail={detail} loading={detailLoading} period={period} onClose={() => setDetail(null)} />

      <ResetAdminPwConfirmDialog
        target={resetTarget}
        loading={resetting}
        onClose={() => { if (!resetting) setResetTarget(null); }}
        onConfirm={runResetAdminPw}
      />

      <ResetAdminPwResultDialog result={resetResult} onClose={() => setResetResult(null)} />
    </Container>
  );
};

const ResetAdminPwConfirmDialog = ({ target, loading, onClose, onConfirm }) => (
  <Dialog open={!!target} onClose={onClose} fullWidth maxWidth="xs">
    {target && (
      <>
        <DialogTitle sx={{ fontWeight: 800 }}>관리자 비밀번호 초기화</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Typography variant="body2">
              {`${target.name} 관리자 비밀번호를 초기화합니다. 새 비밀번호는 아이디(${target.admin_user_name})와 동일하게 설정됩니다.`}
            </Typography>
            <Alert severity="warning" sx={{ fontSize: 13 }}>
              초기화 후에는 이전 비밀번호로 로그인할 수 없습니다. 가맹점 관리자에게 새 비밀번호를 전달하고, 로그인 후 반드시 변경하도록 안내해 주세요.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>취소</Button>
          <Button variant="contained" color="warning" onClick={onConfirm} disabled={loading}>
            {loading ? '초기화 중…' : '초기화'}
          </Button>
        </DialogActions>
      </>
    )}
  </Dialog>
);

const ResetAdminPwResultDialog = ({ result, onClose }) => {
  const copyText = result
    ? `아이디: ${result.user_name} / 새 비밀번호: ${result.user_name}`
    : '';

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      toast.success('복사되었습니다.');
    } catch (e) {
      toast.error('복사에 실패했습니다. 직접 입력해 주세요.');
    }
  };

  return (
    <Dialog open={!!result} onClose={onClose} fullWidth maxWidth="xs">
      {result && (
        <>
          <DialogTitle sx={{ fontWeight: 800 }}>
            비밀번호 초기화 완료
            <Typography component="span" sx={{ ml: 1, fontSize: 13, fontWeight: 500, color: 'text.secondary' }}>
              {result.brand_name}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>아이디</Typography>
                    <Typography variant="subtitle2" sx={{ wordBreak: 'break-all' }}>{result.user_name}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>새 비밀번호</Typography>
                    <Typography variant="subtitle2" sx={{ wordBreak: 'break-all' }}>{result.user_name}</Typography>
                  </Stack>
                </Stack>
              </Card>
              <Alert severity="info" sx={{ fontSize: 13 }}>
                가맹점 관리자에게 위 정보를 전달하고, 로그인 후 반드시 비밀번호를 변경하도록 안내해 주세요.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" startIcon={<Icon icon="solar:copy-linear" />} onClick={onCopy}>
              복사
            </Button>
            <Button variant="contained" onClick={onClose}>확인</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

const MerchantDetailDialog = ({ detail, loading, period, onClose }) => {
  const periodLabel = PERIODS.find((p) => p.key === period)?.label || '전체';
  const brand = detail?.brand;
  const summary = detail?.summary;
  const orders = detail?.orders || [];

  return (
    <Dialog open={!!detail} onClose={onClose} fullWidth maxWidth="md">
      {brand && (
        <>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {brand.name} 상세 내역
            <Typography component="span" sx={{ ml: 1, fontSize: 13, fontWeight: 500 }}>
              <DnsLink dns={brand.dns} />
            </Typography>
            <Chip label={`기간: ${periodLabel}`} size="small" sx={{ ml: 1 }} />
          </DialogTitle>
          <DialogContent dividers>
            {loading ? (
              <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>불러오는 중…</Typography>
            ) : (
              <Stack spacing={3}>
                {/* 요약 */}
                <Grid container spacing={2}>
                  <Grid item xs={4}><SummaryCard label="기간 매출" value={commarNumber(summary?.total_sales || 0)} suffix="원" /></Grid>
                  <Grid item xs={4}><SummaryCard label="기간 주문" value={commarNumber(summary?.order_count || 0)} suffix="건" /></Grid>
                  <Grid item xs={4}><SummaryCard label="취소" value={commarNumber(summary?.cancel_count || 0)} suffix="건" /></Grid>
                </Grid>

                {/* 연락처 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>연락처</Typography>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>관리자 아이디 / 이름</Typography>
                        <Typography variant="subtitle2" sx={{ wordBreak: 'break-all', userSelect: 'text', textAlign: 'right' }}>
                          {brand.admin_user_name || '-'}
                          {/* 실명이 비면 아이디 찾기가 불가능한 계정이므로 눈에 띄게 표시 */}
                          {brand.admin_user_name && (
                            brand.admin_name
                              ? <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>{` / ${brand.admin_name}`}</Box>
                              : <Box component="span" sx={{ color: 'warning.main', fontWeight: 400 }}> / 이름 없음</Box>
                          )}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>관리자 연락처</Typography>
                        <PhoneLink value={brand.admin_phone_num} variant="subtitle2" />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>쇼핑몰 고객센터 번호</Typography>
                        <PhoneLink value={brand.phone_num} variant="subtitle2" />
                      </Stack>
                    </Stack>
                  </Card>
                </Box>

                {/* 상태별 집계 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>주문 상태별</Typography>
                  <Grid container spacing={1}>
                    {STATUS_ORDER.map((s) => (
                      <Grid item xs={6} sm={2} key={s}>
                        <Card variant="outlined" sx={{ p: 1.25, textAlign: 'center' }}>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{TRX_STATUS[s]}</Typography>
                          <Typography variant="h6">{commarNumber(summary?.status?.[s]?.cnt || 0)}</Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* 최근 주문 */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>최근 주문 (최대 30건)</Typography>
                  <TableContainer sx={{ maxHeight: 360 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>주문번호</TableCell>
                          <TableCell>구매자</TableCell>
                          <TableCell align="right">금액</TableCell>
                          <TableCell align="center">상태</TableCell>
                          <TableCell>일시</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.length === 0 && (
                          <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>주문 내역이 없습니다.</TableCell></TableRow>
                        )}
                        {orders.map((o) => (
                          <TableRow key={o.id} hover>
                            <TableCell>{o.id}</TableCell>
                            <TableCell>{o.buyer_name || '-'}</TableCell>
                            <TableCell align="right">{commarNumber(o.amount)}</TableCell>
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={o.is_cancel == 1 ? '취소' : (TRX_STATUS[o.trx_status] || '-')}
                                color={o.is_cancel == 1 ? 'error' : (o.trx_status >= 5 ? 'success' : 'default')}
                                variant={o.is_cancel == 1 ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                            <TableCell>
                              {o.created_at
                                ? String(o.created_at).slice(0, 16).replace('T', ' ')
                                : `${o.trx_dt || ''} ${o.trx_tm || ''}`.trim() || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" endIcon={<Icon icon="eva:external-link-fill" />} onClick={() => window.open(`https://${brand.dns}`)}>
              쇼핑몰 방문
            </Button>
            <Button onClick={onClose}>닫기</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

MerchantsPage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;

export default MerchantsPage;
