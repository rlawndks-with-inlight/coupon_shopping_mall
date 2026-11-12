import { useEffect, useRef, useState } from 'react';
import {
  Button, Card, Chip, FormControlLabel, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { apiManager } from 'src/utils/api';
import { commarNumber } from 'src/utils/function';
import { 상태이름표 } from 'src/utils/order-excel-filter';

// 엑셀 내려받기 기록 — 최상위 관리자(level 50)만 본다(사장님 요청 2026-11-12).
// 주문 엑셀에는 손님 이름·연락처·주소가 그대로 들어가므로 누가·언제·어떤 조건으로·몇 건 받았는지 남긴다.
// 서버(excel_log.controller)가 50 미만은 막는다. 이 화면의 등급 확인은 안내용이다.
// 검색어는 내용을 남기지 않는다(손님 이름·전화번호가 검색어로 들어온다) — 썼는지만 보인다.

const 쪽크기 = 20;

const 조건글 = (r) => {
  if (r?.scope === 'selected') return '표에서 체크한 주문만';
  const c = r?.conditions ?? {};
  const 기간 = c.s_dt || c.e_dt ? `${c.s_dt || '처음'} ~ ${c.e_dt || '오늘'}` : '전체 기간';
  const 상태 = (c.statuses ?? []).map((k) => 상태이름표[k] ?? k).join(', ') || '-';
  return `${기간} · ${상태}${c.search ? ' · 검색어 적용' : ''}`;
};

const ExcelLogs = () => {
  const { user } = useAuthContext();
  const 최상위 = Number(user?.level) >= 50;
  const [전체몰, set전체몰] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const 조회번호 = useRef(0);

  useEffect(() => {
    if (!최상위) return;
    const 이번 = ++조회번호.current;
    setData(null);
    apiManager('excel-logs', 'list', { page, page_size: 쪽크기, ...(전체몰 ? { scope: 'all' } : {}) }).then((r) => {
      if (이번 === 조회번호.current) setData(r || { content: [], total: 0 });
    });
  }, [최상위, 전체몰, page]);

  if (!최상위) {
    return <Card sx={{ p: 3 }}><Typography>최상위 관리자만 볼 수 있는 화면입니다.</Typography></Card>;
  }
  const 끝쪽 = Math.max(1, Math.ceil(Number(data?.total ?? 0) / 쪽크기));
  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap spacing={1}>
          <Stack spacing={0.5}>
            <Typography variant="h6">엑셀 내려받기 기록</Typography>
            <Typography variant="body2" color="text.secondary">
              주문 엑셀을 누가·언제·어떤 조건으로·몇 건 받았는지 보여 줍니다. 최상위 관리자만 볼 수 있습니다.
            </Typography>
          </Stack>
          <FormControlLabel control={<Switch checked={전체몰} onChange={(e) => { set전체몰(e.target.checked); setPage(1); }} />} label="모든 몰 보기" />
        </Stack>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>받은 시각</TableCell>
                {전체몰 && <TableCell>몰</TableCell>}
                <TableCell>받은 사람</TableCell>
                <TableCell>조건</TableCell>
                <TableCell align="right">건수</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data === null ? (
                <TableRow><TableCell colSpan={6} sx={{ color: 'text.secondary' }}>불러오는 중…</TableCell></TableRow>
              ) : !(data?.content?.length) ? (
                <TableRow><TableCell colSpan={6} sx={{ color: 'text.secondary' }}>아직 기록이 없습니다.</TableCell></TableRow>
              ) : data.content.map((r) => (
                <TableRow key={r.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{String(r.created_at ?? '').replace('T', ' ').slice(0, 19)}</TableCell>
                  {전체몰 && <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.brand_name || `#${r.brand_id}`}</TableCell>}
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {r.user_name || `#${r.user_id}`}
                    {Number(r.user_level) >= 50 && <Chip size="small" label="최상위" sx={{ ml: 0.5, height: 20 }} />}
                  </TableCell>
                  <TableCell>{조건글(r)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{commarNumber(r.row_count)}건</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>{r.ip || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
          <Typography variant="body2" color="text.secondary">전체 {commarNumber(data?.total ?? 0)}건 · {page} / {끝쪽}쪽</Typography>
          <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>이전</Button>
          <Button size="small" variant="outlined" disabled={page >= 끝쪽} onClick={() => setPage((p) => p + 1)}>다음</Button>
        </Stack>
      </Stack>
    </Card>
  );
};
ExcelLogs.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ExcelLogs;
