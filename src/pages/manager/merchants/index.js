import { useEffect, useState } from "react";
import {
  Card, Container, Stack, Typography, Button, Grid, Avatar, Box, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
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

const MerchantsPage = () => {
  const [merchants, setMerchants] = useState([]);
  const [summary, setSummary] = useState({ merchant_count: 0, total_sales: 0, order_count: 0 });
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(false);

  // 상세 내역 모달
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
    setDetail({ brand: { id: m.id, name: m.name, dns: m.dns, created_at: m.created_at } });
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
                  <TableCell align="center">상세</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {merchants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
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
    </Container>
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
