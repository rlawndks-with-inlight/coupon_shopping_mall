import { useEffect, useState } from "react";
import { Card, Container, Grid, Stack, Typography, Button, Box } from "@mui/material";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import axios from "axios";
import { commarNumber, returnMoment } from "src/utils/function";
import { PATH_MANAGER } from "src/data/manager-data";

const PERIODS = [
  { key: 'all', label: '전체' },
  { key: 'today', label: '오늘' },
  { key: '7', label: '7일' },
  { key: '30', label: '30일' },
];

const StatCard = ({ label, value, suffix, color = 'primary', icon, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      p: 3, height: '100%', cursor: onClick ? 'pointer' : 'default', transition: '0.15s',
      '&:hover': onClick ? { boxShadow: 8, transform: 'translateY(-2px)' } : {},
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      {icon && (
        <Box sx={{
          width: 48, height: 48, borderRadius: 1.5, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: `${color}.lighter`, color: `${color}.main`,
        }}>
          <Icon icon={icon} width={26} />
        </Box>
      )}
      <Box>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{label}</Typography>
        <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
          {value}
          {suffix && <Typography component="span" variant="subtitle1" sx={{ ml: 0.5, color: 'text.secondary' }}>{suffix}</Typography>}
        </Typography>
      </Box>
    </Stack>
  </Card>
);

export const MasterDashboard = () => {
  const router = useRouter();
  const [appStats, setAppStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [summary, setSummary] = useState({ merchant_count: 0, total_sales: 0, order_count: 0 });
  const [period, setPeriod] = useState('all');

  const periodToRange = (key) => {
    if (key === 'all') return {};
    if (key === 'today') return { s_dt: returnMoment().substring(0, 10), e_dt: returnMoment().substring(0, 10) };
    return { s_dt: returnMoment(-Number(key)).substring(0, 10), e_dt: returnMoment().substring(0, 10) };
  };

  const fetchApps = async () => {
    try {
      const { data: res } = await axios.get('/api/merchant-application/list', { params: { page_size: 1000 } });
      if (res?.result === 100) {
        const rows = res.data?.content || res.data || [];
        const s = { pending: 0, approved: 0, rejected: 0 };
        rows.forEach((r) => { if (s[r.status] !== undefined) s[r.status] += 1; });
        setAppStats(s);
      }
    } catch (e) { /* silent */ }
  };

  const fetchSales = async (key) => {
    try {
      const { data: res } = await axios.get('/api/merchant-application/merchants', { params: periodToRange(key) });
      if (res?.result === 100) setSummary(res.data?.summary || { merchant_count: 0, total_sales: 0, order_count: 0 });
    } catch (e) { /* silent */ }
  };

  useEffect(() => { fetchApps(); }, []);
  useEffect(() => { fetchSales(period); }, [period]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={4}>
        {/* 가맹점 신청 */}
        <Stack spacing={2}>
          <Typography variant="h6">가맹점 신청</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <StatCard label="신청 대기" value={commarNumber(appStats.pending)} suffix="건" color="warning"
                icon="solar:clock-circle-bold-duotone" onClick={() => router.push(PATH_MANAGER.merchantApplications)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard label="승인 · 개설" value={commarNumber(appStats.approved)} suffix="건" color="success"
                icon="solar:check-circle-bold-duotone" onClick={() => router.push(PATH_MANAGER.merchantApplications)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard label="반려" value={commarNumber(appStats.rejected)} suffix="건" color="error"
                icon="solar:close-circle-bold-duotone" onClick={() => router.push(PATH_MANAGER.merchantApplications)} />
            </Grid>
          </Grid>
          <Box>
            <Button variant="contained" startIcon={<Icon icon="solar:users-group-rounded-bold" />}
              onClick={() => router.push(PATH_MANAGER.merchantApplications)}>
              가맹점 신청 관리로 이동
            </Button>
          </Box>
        </Stack>

        {/* 전체 가맹점 매출 */}
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1}>
            <Typography variant="h6">전체 가맹점 매출</Typography>
            <Stack direction="row" spacing={1}>
              {PERIODS.map((p) => (
                <Button key={p.key} size="small" variant={period === p.key ? 'contained' : 'outlined'} onClick={() => setPeriod(p.key)}>
                  {p.label}
                </Button>
              ))}
            </Stack>
          </Stack>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <StatCard label="개설 가맹점" value={commarNumber(summary.merchant_count)} suffix="곳" color="info"
                icon="solar:shop-bold-duotone" onClick={() => router.push(PATH_MANAGER.merchants)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard label="기간 매출" value={commarNumber(summary.total_sales)} suffix="원" color="primary"
                icon="solar:wad-of-money-bold-duotone" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard label="기간 주문" value={commarNumber(summary.order_count)} suffix="건" color="secondary"
                icon="solar:cart-large-2-bold-duotone" />
            </Grid>
          </Grid>
          <Box>
            <Button variant="outlined" startIcon={<Icon icon="solar:chart-2-bold" />} onClick={() => router.push(PATH_MANAGER.merchants)}>
              가맹점별 현황 상세 보기
            </Button>
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
};

export default MasterDashboard;
