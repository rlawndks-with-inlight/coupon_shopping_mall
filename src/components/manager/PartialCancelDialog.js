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
    // 확인 단계. 이 버튼은 PG 에 실제 환불을 걸고, 취소한 결제를 되돌리는 수단은 없다 —
    // 잘못 눌렀으면 손님에게 다시 결제를 받아야 한다. 게다가 [전부] 버튼이 실행 버튼
    // 바로 옆이라 잘못 누르기 쉬운 자리다.
    // 모달 위에 모달을 띄우는 대신 이 다이얼로그를 두 단계로 쓴다(자체 Modal 은 본문을 못 넣는다).
    const [확인단계, set확인단계] = useState(false);

    useEffect(() => {
        if (!open || !trxId) return;
        setLoading(true); setQty({}); setReason(''); setIdemKey(새키()); set확인단계(false);
        (async () => {
            const r = await apiManager(`pays/cancel-partial/${trxId}`, 'get', {});
            setState(r ?? null);
            // 고객이 취소요청한 상품·수량을 미리 채운다 — 관리자가 고객 요청을 손으로 옮겨 적지 않게,
            // 그리고 '부분인지 전체인지, 어떤 상품인지' 를 그 자리에서 바로 보게 한다.
            if (r?.has_request) {
                const pre = {};
                (r.lines ?? []).forEach((l) => {
                    const n = Math.min(Number(l.requested_count) || 0, Number(l.remain_count) || 0);
                    if (n > 0) pre[l.order_id] = String(n);
                });
                setQty(pre);
                if (r.request_reason) setReason(r.request_reason);
            }
            setLoading(false);
        })();
    }, [open, trxId]);

    const lines = state?.lines ?? [];
    const 고른수량 = (l) => Math.max(0, Math.min(Number(qty[l.order_id]) || 0, l.remain_count));
    const 고른줄 = lines.filter((l) => 고른수량(l) > 0);

    // 입력을 받는 그 자리에서 남은 수량으로 깎는다.
    //
    // 예전엔 입력값을 그대로 담아 두고 계산할 때만 깎았다. 그래서 남음이 3개인데 12 를
    // 치면 칸에는 12 가 남고 환불 예상액은 3개분으로 떴다 — 왜 다른지 알 방법이 없었다.
    // inputProps 의 max 는 스피너 화살표만 막을 뿐, 키보드로 친 값·붙여넣기는 안 막는다.
    const 수량입력 = (l, v) => {
        const 숫자 = String(v ?? '').replace(/[^0-9]/g, '');
        setQty({ ...qty, [l.order_id]: 숫자 === '' ? '' : String(Math.min(Number(숫자), l.remain_count)) });
    };

    // 미리보기 금액. 서버와 같은 규칙으로 계산한다 —
    // 그 줄의 마지막 수량이면 나머지까지 포함한 '남은 금액 전부' 다.
    const 예상액 = 고른줄.reduce((s, l) => {
        const n = 고른수량(l);
        return s + (n === l.remain_count ? l.remain_amount : l.unit_price * n);
    }, 0);
    const 전부취소 = lines.length > 0 && lines.every((l) => 고른수량(l) === l.remain_count);

    // 고객이 낸 취소요청 요약 — 부분/전체인지, 어떤 상품 몇 개인지.
    const 요청줄 = lines.filter((l) => Number(l.requested_count) > 0);
    const 요청합계 = lines.reduce((s, l) => s + Math.min(Number(l.requested_count) || 0, l.remain_count), 0);
    const 남은합계 = lines.reduce((s, l) => s + l.remain_count, 0);
    const 전체요청 = 요청줄.length > 0 && 요청합계 >= 남은합계;

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
                {확인단계 ? '이대로 취소할까요?' : '부분 취소'}
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {확인단계
                        ? '아래 내용으로 결제를 취소합니다. 취소한 결제는 되돌릴 수 없습니다.'
                        : '취소할 상품과 수량을 고르면 그만큼만 환불됩니다.'}
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                {/* 확인 단계 — 무엇을 몇 개, 얼마인지 그대로 적는다.
                    금액만 보여 주면 무엇이 취소되는지 모른 채 확인을 누르게 된다. */}
                {확인단계 &&
                    <Stack spacing={1.25}>
                        {고른줄.map((l) => (
                            <Stack key={l.order_id} direction="row" justifyContent="space-between" spacing={2}>
                                {/* 이름을 자르지 않는다. 확인 화면에서 제일 읽어야 할 것이 '무엇을 취소하는가' 인데
                                    noWrap 이면 긴 상품명이 말줄임표로 끊겨, 비슷한 이름 둘을 구분할 수 없다.
                                    minWidth:0 이 있어야 flex 안에서 줄바꿈이 먹는다. */}
                                <Typography sx={{ fontSize: 14, minWidth: 0 }}>{l.order_name}</Typography>
                                <Typography sx={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    {고른수량(l)}개
                                </Typography>
                            </Stack>
                        ))}
                        <Divider />
                        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>환불 예상액</Typography>
                            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{commarNumber(예상액)}원</Typography>
                        </Stack>
                        {reason &&
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>사유 — {reason}</Typography>}
                        <Alert severity={전부취소 ? 'info' : 'warning'} sx={{ py: 0.5 }}>
                            <Typography variant="caption">
                                {전부취소
                                    ? '주문 전체가 취소되며 배송비도 함께 환불됩니다.'
                                    : '부분 취소라 배송비는 환불되지 않습니다. 남은 금액이 무료배송 기준에 못 미치면 배송비가 환불액에서 차감됩니다.'}
                            </Typography>
                        </Alert>
                    </Stack>}

                {!확인단계 && loading && <Typography sx={{ fontSize: 14, py: 2 }}>불러오는 중…</Typography>}

                {!확인단계 && !loading && !state &&
                    <Alert severity="error">주문 정보를 불러오지 못했습니다.</Alert>}

                {!확인단계 && !loading && state && !state.cancelable &&
                    <Alert severity="warning">
                        이미 취소되었거나 출고된 주문입니다. 출고 이후에는 반품/환불 절차로 처리해 주세요.
                    </Alert>}

                {/* 지원 안 하는 PG 에 부분취소를 걸면 전액이 취소된다 — 아예 못 누르게 한다 */}
                {!확인단계 && !loading && state?.cancelable && !state.partial_supported &&
                    <Alert severity="warning">
                        이 주문의 결제수단은 부분 취소를 지원하지 않습니다. 전체 취소만 가능합니다.
                    </Alert>}

                {!확인단계 && !loading && state?.cancelable && state.partial_supported &&
                    <Stack spacing={1.5}>
                        {/* 고객이 취소요청을 낸 경우 — 부분/전체인지, 어떤 상품 몇 개인지 한눈에 보여준다.
                            요청 수량은 아래 칸에 미리 채워져 있으니 관리자는 확인 후 실행만 하면 된다. */}
                        {state?.has_request && (
                            <Alert severity="info" sx={{ py: 0.5 }}>
                                <Typography variant="caption">
                                    고객이 <b>{전체요청 ? '전체' : '부분'} 취소</b>를 요청했습니다
                                    {요청줄.length > 0
                                        ? ` — ${요청줄.map((l) => `${l.order_name} ${Math.min(Number(l.requested_count), l.remain_count)}개`).join(', ')}`
                                        : ''}
                                    . 요청 수량을 미리 채웠으니 확인 후 실행하세요.
                                    {state?.request_reason ? ` · 사유: ${state.request_reason}` : ''}
                                </Typography>
                            </Alert>
                        )}
                        {lines.map((l) => (
                            <Stack key={l.order_id} direction="row" alignItems="center" spacing={1.5}
                                sx={{ opacity: l.remain_count === 0 ? 0.45 : 1 }}>
                                <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{l.order_name}</Typography>
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                                        개당 {commarNumber(l.unit_price)}원 · 주문 {l.order_count}개
                                        {l.cancel_count > 0 ? ` · 취소됨 ${l.cancel_count}개` : ''}
                                        {Number(l.requested_count) > 0 ? ` · 고객요청 ${Math.min(Number(l.requested_count), l.remain_count)}개` : ''}
                                        {' · '}<b>남음 {l.remain_count}개</b>
                                    </Typography>
                                </Stack>
                                <TextField
                                    size="small" type="number" sx={{ width: 96 }}
                                    label="취소 수량"
                                    disabled={l.remain_count === 0 || busy}
                                    value={qty[l.order_id] ?? ''}
                                    onChange={(e) => 수량입력(l, e.target.value)}
                                    inputProps={{ min: 0, max: l.remain_count, inputMode: 'numeric' }}
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
            {/* 두 단계로 나눈 이유 —
                [전부] 버튼이 실행 버튼 바로 옆이라 잘못 누르기 쉬운데, 이 버튼은 PG 에
                실제 환불을 걸고 되돌릴 수단이 없다. 한 번 더 보고 누르게 한다. */}
            <DialogActions>
                {!확인단계 && <>
                    <Button onClick={onClose} disabled={busy}>닫기</Button>
                    <Button
                        variant="contained" color="error" onClick={() => set확인단계(true)}
                        disabled={busy || !state?.cancelable || !state?.partial_supported || !고른줄.length}
                    >
                        {`${commarNumber(예상액)}원 취소하기`}
                    </Button>
                </>}
                {확인단계 && <>
                    <Button onClick={() => set확인단계(false)} disabled={busy}>뒤로</Button>
                    <Button variant="contained" color="error" onClick={실행} disabled={busy}>
                        {busy ? '취소 처리 중…' : '네, 취소합니다'}
                    </Button>
                </>}
            </DialogActions>
        </Dialog>
    );
};

export default PartialCancelDialog;
