import { useEffect, useState } from 'react';
import {
    Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Table, TableBody, TableCell, TableHead, TableRow, Typography, Chip,
} from '@mui/material';
import { apiManager } from 'src/utils/api';

// 주문 한 건의 상태 변경 이력(가맹점 요청서 2026-09-11 「결제 상태변경 히스토리」).
//
// 카페24 「주문 처리이력」·네이버 스마트스토어 「주문 이력」과 같은 꼴 — 일시 · 내용 · 처리자 · 비고.
// 서버(transaction_status_logs)가 남긴 것만 보여 준다. 이력 기능 전(2026-09-14 이전)의 주문은 비어 있다.
const 종류글 = {
    status: '상태 변경',
    approve: '결제 승인',
    cancel_request: '취소요청',
    cancel: '취소',
    failed: '결제실패/미완료 정리',
};
const 종류색 = { status: 'default', approve: 'success', cancel_request: 'warning', cancel: 'error', failed: 'default' };

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

const TrxHistoryDialog = ({ open, onClose, trxId }) => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!open || !trxId) return;
        setLoading(true); setFailed(false); setLogs([]);
        (async () => {
            const r = await apiManager(`transactions/${trxId}/logs`, 'get', {});
            if (!r) setFailed(true);
            else setLogs(Array.isArray(r?.logs) ? r.logs : []);
            setLoading(false);
        })();
    }, [open, trxId]);

    return (
        <Dialog open={!!open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                상태 변경 이력
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    누가 언제 주문 상태를 바꿨는지, 승인·취소가 언제 일어났는지 순서대로 보여 줍니다.
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
                                    <TableCell sx={{ fontSize: 13, fontWeight: 600 }}>{내용글(r)}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 13 }}>{처리자글(r)}</TableCell>
                                    {/* 상태가 바뀐 줄은 내용에 전→후를 썼으니 비고에 note 를 따로 보여 준다 */}
                                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{(r?.from_text && r?.to_text) || r?.to_text ? (r?.note || '') : ''}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TrxHistoryDialog;
