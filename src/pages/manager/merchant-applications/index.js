import {
  Card, Container, IconButton, Stack, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, Typography, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { findFrameByKey } from "src/components/main-site/frameList";

const STATUS_COLORS = {
  pending: { bg: '#fff4d6', color: '#8a5a00', label: '대기' },
  approved: { bg: '#d6f0d6', color: '#1d6b1d', label: '승인' },
  rejected: { bg: '#fde0e0', color: '#9b2222', label: '반려' },
};

const StatusChip = ({ status }) => {
  const meta = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 700, fontSize: 12, height: 24 }}
    />
  );
};

const MerchantApplicationsPage = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [memo, setMemo] = useState('');
  const [approveOpen, setApproveOpen] = useState(false);
  const [adminId, setAdminId] = useState('');

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = { page_size: 1000 };
      if (statusFilter) params.status = statusFilter;
      const { data: res } = await axios.get('/api/merchant-application/list', { params });
      if (res?.result === 100) {
        const rows = res.data?.content || res.data || [];
        setData(Array.isArray(rows) ? rows : []);
      }
    } catch (err) {
      toast.error('목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [statusFilter]);

  const openDetail = async (id) => {
    try {
      const { data: res } = await axios.get(`/api/merchant-application/${id}`);
      if (res?.result === 100) {
        setDetail(res.data);
        setMemo(res.data?.memo || '');
      }
    } catch (err) {
      toast.error('상세 조회 실패');
    }
  };

  const updateStatus = async (id, status, adminIdArg) => {
    try {
      const body = { id, status, memo };
      if (adminIdArg !== undefined) body.admin_id = adminIdArg;
      const { data: res } = await axios.put('/api/merchant-application/status', body);
      if (res?.result === 100) {
        toast.success(status === 'approved' ? '승인 및 개설 완료' : '상태 변경 완료');
        setApproveOpen(false);
        setDetail(null);
        fetchList();
      } else {
        toast.error(res?.message || '변경 실패');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || '변경 실패');
    }
  };

  const columns = [
    { id: 'id', label: 'No.', action: (r) => r.id },
    { id: 'created_at', label: '신청일시', action: (r) => (r.created_at ? String(r.created_at).slice(0, 19).replace('T', ' ') : '---') },
    { id: 'business_name', label: '사업자명', action: (r) => r.business_name },
    { id: 'ceo_name', label: '대표자', action: (r) => `${r.ceo_name} (${r.ceo_phone || '-'})` },
    { id: 'manager_name', label: '담당자', action: (r) => `${r.manager_name} (${r.manager_phone || '-'})` },
    { id: 'desired_slug', label: '희망 URL', action: (r) => r.desired_slug },
    {
      id: 'selected_frame',
      label: '프레임',
      action: (r) => {
        const f = findFrameByKey(r.selected_frame);
        return f ? `${f.no.toString().padStart(2, '0')} ${f.title}` : '---';
      },
    },
    { id: 'referrer_name', label: '영업추천인', action: (r) => r.referrer_name || '---' },
    { id: 'status', label: '상태', action: (r) => <StatusChip status={r.status} /> },
    {
      id: 'edit',
      label: '상세',
      action: (r) => (
        <IconButton onClick={() => openDetail(r.id)}>
          <Icon icon="material-symbols:visibility-outline" />
        </IconButton>
      ),
    },
  ];

  const FILTER_BUTTONS = [
    { value: '', label: '전체' },
    { value: 'pending', label: '대기' },
    { value: 'approved', label: '승인' },
    { value: 'rejected', label: '반려' },
  ];

  return (
    <Container maxWidth="xl">
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          {FILTER_BUTTONS.map((f) => (
            <Button
              key={f.label}
              variant={statusFilter === f.value ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" size="small" onClick={fetchList} startIcon={<Icon icon="material-symbols:refresh" />}>
            새로고침
          </Button>
        </Stack>
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((c) => <TableCell key={c.id}>{c.label}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      {loading ? '불러오는 중…' : '신청 내역이 없습니다.'}
                    </TableCell>
                  </TableRow>
                )}
                {data.map((r) => (
                  <TableRow key={r.id} hover>
                    {columns.map((c) => <TableCell key={c.id}>{c.action(r)}</TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>

      <Dialog open={!!detail} onClose={() => setDetail(null)} fullWidth maxWidth="md">
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 800 }}>
              신청 상세 — #{detail.id} {detail.business_name}
              <Box sx={{ ml: 1, display: 'inline-block' }}>
                <StatusChip status={detail.status} />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <DetailRow label="신청일시" value={String(detail.created_at).slice(0, 19).replace('T', ' ')} />
                <DetailRow label="사업자번호" value={detail.business_number} />
                <DetailRow label="통신판매업신고" value={detail.mail_order_number || '---'} />
                <DetailRow label="대표자" value={`${detail.ceo_name} / ${detail.ceo_phone} / ${detail.ceo_email || '-'}`} />
                <DetailRow label="담당자" value={`${detail.manager_name} / ${detail.manager_phone} / ${detail.manager_email || '-'}`} />
                <DetailRow label="고객센터" value={detail.cs_phone || '---'} />
                <DetailRow label="영업추천인" value={detail.referrer_name || '---'} />
                <DetailRow label="희망 URL" value={detail.desired_slug} />
                <DetailRow
                  label="프레임"
                  value={(() => {
                    const f = findFrameByKey(detail.selected_frame);
                    return f ? `${f.no.toString().padStart(2, '0')} — ${f.title}` : detail.selected_frame || '---';
                  })()}
                />
                <DetailRow
                  label="약정 동의"
                  value={`${detail.agreement_agreed ? '동의' : '미동의'} · ${detail.agreement_agreed_at || '-'} · ${detail.agreement_agreed_ip || '-'}`}
                />
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#666', mb: 1 }}>관리자 메모</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="내부 메모 (선택)"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetail(null)}>닫기</Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => updateStatus(detail.id, 'rejected')}
                disabled={detail.status === 'rejected'}
              >
                반려
              </Button>
              <Button
                variant="contained"
                onClick={() => { setAdminId(detail.desired_slug || ''); setApproveOpen(true); }}
                disabled={detail.status === 'approved'}
                sx={{ bgcolor: '#111', '&:hover': { bgcolor: '#000' } }}
              >
                승인
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={approveOpen} onClose={() => setApproveOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>가맹점 개설 승인</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{ fontSize: 13, color: '#555', lineHeight: 1.7, mb: 2 }}>
            가맹점과 <b>협의한 로그인 아이디</b>를 입력하세요. 초기 <b>비밀번호는 아이디와 동일</b>하게 생성됩니다.
            개설 후 가맹점이 로그인하여 <b>비밀번호 변경</b>(우측 상단 프로필 → 비밀번호 변경)하도록 안내해 주세요.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="가맹점 관리자 아이디"
            placeholder="영문/숫자/-/_ 3~20자"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value.trim())}
            autoFocus
          />
          <Typography sx={{ fontSize: 12, color: '#888', mt: 1.5 }}>
            접속: <b>{detail?.desired_slug || ''}.shopgo.co.kr/manager</b><br />
            아이디 / 초기 비밀번호: <b>{adminId || '-'}</b>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setApproveOpen(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={() => updateStatus(detail.id, 'approved', adminId)}
            disabled={!adminId || adminId.length < 3}
            sx={{ bgcolor: '#111', '&:hover': { bgcolor: '#000' } }}
          >
            승인 &amp; 개설
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const DetailRow = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Typography sx={{ fontSize: 11, color: '#888', fontWeight: 700, letterSpacing: 1, mb: 0.5 }}>{label}</Typography>
    <Typography sx={{ fontSize: 14, color: '#222' }}>{value}</Typography>
  </Grid>
);

MerchantApplicationsPage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;

export default MerchantApplicationsPage;
