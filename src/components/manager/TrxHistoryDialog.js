import { useEffect, useState } from 'react';
import {
    Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Chip,
} from '@mui/material';
import toast from 'react-hot-toast';
import { apiManager } from 'src/utils/api';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';

// 주문 한 건의 상태 변경 이력(가맹점 요청서 2026-09-11 「결제 상태변경 히스토리」).
//
// 카페24 「주문 처리이력」·네이버 스마트스토어 「주문 이력」과 같은 꼴 — 일시 · 내용 · 처리자 · 비고.
// 서버(transaction_status_logs)가 남긴 것만 보여 준다. 이력 기능 전(2026-09-14 이전)의 주문은 비어 있다.
//
// 메모(2026-11-06 가맹점 요청 "이력에서 수정 및 추가"): 관리자가 이력에 직접 글을 남긴다.
//   자동 기록(상태 변경·승인·취소·송장)은 고칠 수 없다 — 분쟁 때 이력을 믿을 수 있어야 한다(사장님 결정).
//   메모는 쓴 사람 본인(또는 본사)만 고치거나 지운다. 서버가 행마다 can_edit 로 알려 준다.
const 종류글 = {
    status: '상태 변경',
    approve: '결제 승인',
    cancel_request: '취소요청',
    cancel: '취소',
    failed: '결제실패/미완료 정리',
    pay_fail: '결제창 실패 사유',
    invoice: '송장',
    memo: '메모',
    reason_edit: '사유 수정',
};
const 종류색 = { status: 'default', approve: 'success', cancel_request: 'warning', cancel: 'error', failed: 'default', pay_fail: 'default', invoice: 'info', memo: 'secondary', reason_edit: 'warning' };
const 메모최대 = 500; // 서버 note 칸 크기
const 사유최대 = 200; // 서버가 취소 사유를 자르는 길이

const 처리자글 = (r) => {
    if (r?.actor_type === 'system') return '시스템(PG 통지·자동)';
    if (r?.actor_type === 'customer') return r?.actor_name ? `손님 · ${r.actor_name}` : '손님';
    return r?.actor_name ? `관리자 · ${r.actor_name}` : (r?.actor_id ? `관리자 #${r.actor_id}` : '관리자');
};

const 내용글 = (r) => {
    // 상태가 바뀐 일은 전→후로, 아니면 비고(취소 금액·수량 등)를 그대로
    if (r?.from_text && r?.to_text) return `${r.from_text} → ${r.to_text}`;
    if (r?.to_text) return `→ ${r.to_text}`;
    return r?.note || 종류글[r?.kind] || r?.kind;
};

const 일시글 = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

// 사유를 고치는 동안 위에 보여 줄 '사유를 뺀 취소 설명' — 사유는 아래 입력칸에 있다
const 취소사유없는글 = (r) => {
    const 글 = String(r?.note ?? '');
    const 사유 = r?.cancel_reason ? ` / 사유: ${r.cancel_reason}` : '';
    return 사유 ? 글.replace(사유, '') : 글;
};

const 비고글 = (r) => {
    if (r?.kind === 'memo') return r?.edited_at ? `수정됨 ${일시글(r.edited_at)}` : '';
    if (r?.kind === 'cancel') return r?.edited_at ? `사유 수정됨 ${일시글(r.edited_at)}` : '';
    // 상태가 바뀐 줄은 내용에 전→후를 썼으니 비고에 note 를 따로 보여 준다
    return (r?.from_text && r?.to_text) || r?.to_text ? (r?.note || '') : '';
};

const TrxHistoryDialog = ({ open, onClose, trxId }) => {
    const { user } = useAuthContext();
    const 메모가능 = Number(user?.level) >= 40; // 서버도 40 이상만 받는다
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [failed, setFailed] = useState(false);
    const [새메모, set새메모] = useState('');
    const [고치는중, set고치는중] = useState({ id: 0, note: '' });
    // 취소 사유 고치기(2026-11-06 요청) — 취소 줄의 사유 부분만. 금액·수량은 서버가 그대로 둔다.
    const [사유고치는중, set사유고치는중] = useState({ id: 0, reason: '' });
    const [바쁨, set바쁨] = useState(false);

    const 불러오기 = async () => {
        const r = await apiManager(`transactions/${trxId}/logs`, 'get', {});
        if (!r) setFailed(true);
        else setLogs(Array.isArray(r?.logs) ? r.logs : []);
        setLoading(false);
    };

    useEffect(() => {
        if (!open || !trxId) return;
        setLoading(true); setFailed(false); setLogs([]); set새메모(''); set고치는중({ id: 0, note: '' }); set사유고치는중({ id: 0, reason: '' });
        불러오기();
    }, [open, trxId]);

    const 메모추가 = async () => {
        const note = 새메모.trim();
        if (!note || 바쁨) return;
        set바쁨(true);
        const r = await apiManager(`transactions/${trxId}/logs`, 'create', { note });
        set바쁨(false);
        if (!r) return; // 실패 사유는 apiManager 가 토스트로 띄운다
        set새메모('');
        toast.success('메모를 남겼습니다.');
        불러오기();
    };

    const 메모저장 = async () => {
        const note = 고치는중.note.trim();
        if (!note || 바쁨) return;
        set바쁨(true);
        const r = await apiManager(`transactions/${trxId}/logs`, 'update', { id: 고치는중.id, note });
        set바쁨(false);
        if (!r) return;
        set고치는중({ id: 0, note: '' });
        toast.success('메모를 고쳤습니다.');
        불러오기();
    };

    const 사유저장 = async () => {
        if (바쁨) return;
        set바쁨(true);
        const r = await apiManager(`transactions/${trxId}/logs`, 'update', { id: `${사유고치는중.id}/reason`, reason: 사유고치는중.reason.trim() });
        set바쁨(false);
        if (!r) return;
        set사유고치는중({ id: 0, reason: '' });
        toast.success('취소 사유를 고쳤습니다.');
        불러오기();
    };

    const 메모삭제 = async (row) => {
        if (바쁨 || !window.confirm('이 메모를 지울까요? 지운 메모는 되돌릴 수 없습니다.')) return;
        set바쁨(true);
        const r = await apiManager(`transactions/${trxId}/logs`, 'delete', { id: row.id });
        set바쁨(false);
        if (!r) return;
        toast.success('메모를 지웠습니다.');
        불러오기();
    };

    return (
        <Dialog open={!!open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                상태 변경 이력
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    누가 언제 주문 상태·송장을 바꿨는지, 승인·취소가 언제 일어났는지 순서대로 보여 줍니다.
                    {메모가능 ? ' 아래에서 메모를 남길 수 있습니다(자동 기록은 고칠 수 없고, 메모는 쓴 사람만 고칠 수 있습니다).' : ''}
                </Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {loading && <Typography sx={{ fontSize: 14, p: 2 }}>불러오는 중…</Typography>}
                {!loading && failed && <Alert severity="error" sx={{ m: 2 }}>이력을 불러오지 못했습니다.</Alert>}
                {!loading && !failed && logs.length === 0 &&
                    <Alert severity="info" sx={{ m: 2 }}>
                        기록된 이력이 없습니다. 이력 기능이 들어가기 전(2026-09-14 이전)에 처리된 주문이거나, 아직 상태가 바뀐 적이 없는 주문입니다.
                    </Alert>}
                {!loading && !failed && logs.length > 0 &&
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>일시</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>구분</TableCell>
                                <TableCell>내용</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>처리자</TableCell>
                                <TableCell>비고</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 13 }}>{일시글(r.created_at)}</TableCell>
                                    <TableCell><Chip size="small" label={종류글[r.kind] || r.kind} color={종류색[r.kind] || 'default'} variant="soft" /></TableCell>
                                    <TableCell sx={{ fontSize: 13, fontWeight: 600, whiteSpace: r.kind === 'memo' ? 'pre-wrap' : undefined, wordBreak: 'break-all' }}>
                                        {고치는중.id === r.id ? (
                                            <Stack spacing={1}>
                                                <TextField size="small" multiline minRows={2} fullWidth autoFocus
                                                    value={고치는중.note} disabled={바쁨}
                                                    inputProps={{ maxLength: 메모최대 }}
                                                    onChange={(e) => set고치는중({ id: r.id, note: e.target.value })} />
                                                <Stack direction="row" spacing={1}>
                                                    <Button size="small" variant="contained" disabled={바쁨 || !고치는중.note.trim()} onClick={메모저장}>저장</Button>
                                                    <Button size="small" disabled={바쁨} onClick={() => set고치는중({ id: 0, note: '' })}>취소</Button>
                                                </Stack>
                                            </Stack>
                                        ) : 사유고치는중.id === r.id ? (
                                            <Stack spacing={1}>
                                                <div>{취소사유없는글(r)}</div>
                                                <TextField size="small" fullWidth autoFocus label="취소 사유" placeholder="비우면 사유를 지웁니다"
                                                    value={사유고치는중.reason} disabled={바쁨}
                                                    inputProps={{ maxLength: 사유최대 }}
                                                    onChange={(e) => set사유고치는중({ id: r.id, reason: e.target.value })} />
                                                <Stack direction="row" spacing={1}>
                                                    <Button size="small" variant="contained" disabled={바쁨 || 사유고치는중.reason.trim() === (r.cancel_reason ?? '')} onClick={사유저장}>저장</Button>
                                                    <Button size="small" disabled={바쁨} onClick={() => set사유고치는중({ id: 0, reason: '' })}>취소</Button>
                                                </Stack>
                                            </Stack>
                                        ) : 내용글(r)}
                                    </TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 13 }}>{처리자글(r)}</TableCell>
                                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                                        {비고글(r)}
                                        {r.can_edit && 고치는중.id !== r.id &&
                                            <Stack direction="row" spacing={0.5} sx={{ mt: 비고글(r) ? 0.5 : 0 }}>
                                                <Button size="small" sx={{ minWidth: 0, px: 0.75 }} disabled={바쁨}
                                                    onClick={() => set고치는중({ id: r.id, note: r.note ?? '' })}>수정</Button>
                                                <Button size="small" color="error" sx={{ minWidth: 0, px: 0.75 }} disabled={바쁨}
                                                    onClick={() => 메모삭제(r)}>삭제</Button>
                                            </Stack>}
                                        {r.can_edit_reason && 사유고치는중.id !== r.id &&
                                            <Button size="small" sx={{ minWidth: 0, px: 0.75, mt: 비고글(r) ? 0.5 : 0, whiteSpace: 'nowrap' }} disabled={바쁨}
                                                onClick={() => set사유고치는중({ id: r.id, reason: r.cancel_reason ?? '' })}>
                                                {r.cancel_reason ? '사유 수정' : '사유 입력'}
                                            </Button>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>}
                {!loading && !failed && 메모가능 &&
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ p: 2, alignItems: { sm: 'flex-start' } }}>
                        <TextField size="small" multiline minRows={1} maxRows={4} fullWidth
                            placeholder="메모 남기기 (예: 고객과 통화 — 교환 접수)"
                            value={새메모} disabled={바쁨}
                            inputProps={{ maxLength: 메모최대 }}
                            onChange={(e) => set새메모(e.target.value)} />
                        <Button variant="contained" sx={{ whiteSpace: 'nowrap' }} disabled={바쁨 || !새메모.trim()} onClick={메모추가}>메모 추가</Button>
                    </Stack>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TrxHistoryDialog;
