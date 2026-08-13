import { useEffect, useState } from 'react';
import {
    Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, IconButton, Stack, TextField, Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { apiManager } from 'src/utils/api';
import { commarNumber } from 'src/utils/function';

// 주문 '줄' 단위 취소.
//
// 예전에는 취소가 주문 전체뿐이었다. 상품 a 1개 + 상품 b 2개를 담아 주문했을 때
// 'a 만 취소' 나 'b 1개만 취소' 가 불가능했다.
// 전체 주문의 28%가 상품 2줄 이상이라 드문 상황이 아니다.
//
// ⚠ 이 화면은 **수량만** 보낸다. 금액은 서버가 transaction_orders 를 다시 읽어 계산한다.
//   화면이 보낸 금액을 믿으면 10만원 주문에 100만원 환불을 걸 수 있다.
//   여기 보이는 '환불 예상액' 은 어디까지나 미리보기다 — 실제 환불액은 서버 응답으로 확인한다.

// 같은 클릭이 두 번 도착해도 DB(UNIQUE)가 두 번째를 막게 하는 키.
// 취소는 실제 환불이라 이중 실행이 곧 이중 환불이다. 버튼 잠금만으로는 부족하다.
const 새키 = () => `pc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const PartialCancelDialog = ({ open, onClose, trxId, onDone }) => {
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState(null);
    const [qty, setQty] = useState({});          // { [order_id]: 취소수량 }
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);
    const [idemKey, setIdemKey] = useState('');

    useEffect(() => {
        if (!open || !trxId) return;
        setLoading(true); setQty({}); setReason(''); setIdemKey(새키());
        (async () => {
            const r = await apiManager(`pays/cancel-partial/${trxId}`, 'get', {});
            setState(r ?? null);
            setLoading(false);
        })();
    }, [open, trxId]);

    const lines = state?.lines ?? [];
    const 고른수량 = (l) => Math.max(0, Math.min(Number(qty[l.order_id]) || 0, l.remain_count));
    const 고른줄 = lines.filter((l) => 고른수량(l) > 0);

    // 미리보기 금액. 서버와 같은 규칙으로 계산한다 —
    // 그 줄의 마지막 수량이면 나머지까지 포함한 '남은 금액 전부' 다.
    const 예상액 = 고른줄.reduce((s, l) => {
        const n = 고른수량(l);
        return s + (n === l.remain_count ? l.remain_amount : l.unit_price * n);
    }, 0);
    const 전부취소 = lines.length > 0 && lines.every((l) => 고른수량(l) === l.remain_count);

    const 실행 = async () => {
        if (!고른줄.length) { toast.error('취소할 상품과 수량을 선택해 주세요.'); return; }
        setBusy(true);
        const r = await apiManager(`pays/cancel-partial/${trxId}`, 'create', {
            items: 고른줄.map((l) => ({ order_id: l.order_id, qty: 고른수량(l) })),
            reason: reason || null,
            idem_key: idemKey,
        });
        setBusy(false);
        if (!r) return;                        // 실패 사유는 apiManager 가 토스트로 띄운다
        toast.success(`${commarNumber(r?.amount ?? 0)}원이 취소되었습니다.`);
        onDone?.();
        onClose?.();
    };

    return (
        <Dialog open={!!open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                부분 취소
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    취소할 상품과 수량을 고르면 그만큼만 환불됩니다.
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                {loading && <Typography sx={{ fontSize: 14, py: 2 }}>불러오는 중…</Typography>}

                {!loading && !state &&
                    <Alert severity="error">주문 정보를 불러오지 못했습니다.</Alert>}

                {!loading && state && !state.cancelable &&
                    <Alert severity="warning">
                        이미 취소되었거나 출고된 주문입니다. 출고 이후에는 반품/환불 절차로 처리해 주세요.
                    </Alert>}

                {/* 지원 안 하는 PG 에 부분취소를 걸면 전액이 취소된다 — 아예 못 누르게 한다 */}
                {!loading && state?.cancelable && !state.partial_supported &&
                    <Alert severity="warning">
                        이 주문의 결제수단은 부분 취소를 지원하지 않습니다. 전체 취소만 가능합니다.
                    </Alert>}

                {!loading && state?.cancelable && state.partial_supported &&
                    <Stack spacing={1.5}>
                        {lines.map((l) => (
                            <Stack key={l.order_id} direction="row" alignItems="center" spacing={1.5}
                                sx={{ opacity: l.remain_count === 0 ? 0.45 : 1 }}>
                                <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>{l.order_name}</Typography>
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                        개당 {commarNumber(l.unit_price)}원 · 주문 {l.order_count}개
                                        {l.cancel_count > 0 ? ` · 취소됨 ${l.cancel_count}개` : ''}
                                        {' · '}<b>남음 {l.remain_count}개</b>
                                    </Typography>
                                </Stack>
                                <TextField
                                    size="small" type="number" sx={{ width: 96 }}
                                    label="취소 수량"
                                    disabled={l.remain_count === 0 || busy}
                                    value={qty[l.order_id] ?? ''}
                                    onChange={(e) => setQty({ ...qty, [l.order_id]: e.target.value })}
                                    inputProps={{ min: 0, max: l.remain_count }}
                                />
                                <Button size="small" variant="outlined" disabled={l.remain_count === 0 || busy}
                                    onClick={() => setQty({ ...qty, [l.order_id]: l.remain_count })}>전부</Button>
                            </Stack>
                        ))}

                        <Divider />
                        <TextField
                            size="small" fullWidth label="취소 사유 (선택)" placeholder="예시) 고객 요청"
                            value={reason} disabled={busy}
                            onChange={(e) => setReason(e.target.value)}
                        />

                        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>환불 예상액</Typography>
                            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                                {commarNumber(예상액)}원
                            </Typography>
                        </Stack>
                        {/* 배송비 규칙은 서버가 판단한다. 여기서는 그 가능성만 알린다 —
                            화면이 배송비까지 계산하면 서버와 어긋났을 때 어느 쪽이 맞는지 알 수 없다. */}
                        <Typography sx={{ fontSize: 11.5, color: 'text.disabled', mt: -0.5 }}>
                            {전부취소
                                ? '전부 취소되므로 배송비도 함께 환불됩니다.'
                                : '부분 취소에는 배송비가 환불되지 않습니다. 남은 금액이 무료배송 기준에 못 미치면 배송비가 환불액에서 차감됩니다.'}
                            {' 최종 금액은 서버가 계산합니다.'}
                        </Typography>
                    </Stack>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>닫기</Button>
                <Button
                    variant="contained" color="error" onClick={실행}
                    disabled={busy || !state?.cancelable || !state?.partial_supported || !고른줄.length}
                >
                    {busy ? '취소 처리 중…' : `${commarNumber(예상액)}원 취소`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PartialCancelDialog;
