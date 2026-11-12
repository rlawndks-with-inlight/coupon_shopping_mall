import { useEffect, useRef, useState } from 'react';
import {
    Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography,
} from '@mui/material';
import { commarNumber } from 'src/utils/function';
import { apiManager } from 'src/utils/api';
import { 엑셀상태목록, 엑셀조건, 기간범위, 기간버튼, 날글 } from 'src/utils/order-excel-filter';

// 주문 엑셀 내려받기 창(가맹점 요청 2026-11-12).
//
// 예전엔 버튼을 누르면 지금 보고 있는 메뉴의 조건(기간·상태)이 그대로 내려갔다.
// 결제완료와 배송중을 한 파일로 받으려면 메뉴를 옮겨 두 번 받아 합쳐야 했다.
// 이제 창에서 기간·상태를 고른다. 처음엔 지금 보는 조건이 채워져 있어서 그대로 받으면 예전과 같다.
//
// 고르는 규칙(상태 목록·처음 체크·기간)은 src/utils/order-excel-filter.js — 검사(order-admin-1112)가 그 함수를 직접 돌린다.

const OrderExcelDialog = ({ open, onClose, dns, 처음조건, 선택수 = 0, 받는중 = false, onDownload }) => {
    const 상태목록 = 엑셀상태목록(dns);
    const [범위, set범위] = useState('조건');
    const [s_dt, setSDt] = useState('');
    const [e_dt, setEDt] = useState('');
    const [상태, set상태] = useState([]);
    const [검색어적용, set검색어적용] = useState(true);
    const [건수, set건수] = useState(null);
    const 세기번호 = useRef(0);

    // 열 때마다 지금 화면 조건으로 채운다
    useEffect(() => {
        if (!open) return;
        setSDt(처음조건?.s_dt || '');
        setEDt(처음조건?.e_dt || '');
        set상태(처음조건?.statuses ?? []);
        set검색어적용(true);
        set범위(선택수 > 0 ? '선택' : '조건');
    }, [open]);

    const 검색어 = 처음조건?.search || '';
    const 조건 = 엑셀조건({ s_dt, e_dt, statuses: 상태, search: 검색어적용 ? 검색어 : '' });

    // 조건에 맞는 건수를 미리 센다(내려받기 전에 몇 건인지 보여 준다)
    useEffect(() => {
        if (!open || 범위 !== '조건') return;
        if (!상태.length) { set건수(0); return; }
        const 이번 = ++세기번호.current;
        set건수(null);
        const 타이머 = setTimeout(async () => {
            const r = await apiManager('transactions', 'list', { ...조건, page: 1, page_size: 1 });
            if (이번 === 세기번호.current) set건수(Number(r?.total ?? 0));
        }, 300);
        return () => clearTimeout(타이머);
    }, [open, 범위, s_dt, e_dt, 상태.join(','), 검색어적용]);

    const 기간고르기 = (key) => {
        const [시작, 끝] = 기간범위(key);
        setSDt(날글(시작));
        setEDt(날글(끝));
    };
    const 지금기간 = 기간버튼.find(([key]) => { const [a, b] = 기간범위(key); return 날글(a) === s_dt && 날글(b) === e_dt; })?.[0];
    const 상태토글 = (key) => set상태((앞) => (앞.includes(key) ? 앞.filter((k) => k !== key) : [...앞, key]));
    const 모두 = 상태목록.length > 0 && 상태목록.every((s) => 상태.includes(s.key));

    const 조건모드 = 범위 === '조건';
    const 받을수있음 = 조건모드 ? 상태.length > 0 && 건수 !== 0 : 선택수 > 0;

    return (
        <Dialog open={open} onClose={받는중 ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>엑셀 내려받기</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    <RadioGroup value={범위} onChange={(e) => set범위(e.target.value)}>
                        <FormControlLabel value="조건" control={<Radio size="small" />} label="조건을 골라 받기" />
                        <FormControlLabel value="선택" control={<Radio size="small" />} disabled={!선택수}
                            label={선택수 ? `표에서 체크한 ${선택수}건만 받기` : '표에서 체크한 주문만 받기 (체크한 주문이 없습니다)'} />
                    </RadioGroup>

                    {조건모드 && <>
                        <Stack spacing={1}>
                            <Typography variant="subtitle2">기간 (주문일 기준)</Typography>
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                {기간버튼.map(([key, 이름]) => (
                                    <Button key={key} size="small" variant={지금기간 === key ? 'contained' : 'outlined'} onClick={() => 기간고르기(key)}>{이름}</Button>
                                ))}
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <TextField size="small" type="date" label="시작일" value={s_dt} onChange={(e) => setSDt(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                                <Typography color="text.secondary">~</Typography>
                                <TextField size="small" type="date" label="종료일" value={e_dt} onChange={(e) => setEDt(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
                            </Stack>
                        </Stack>

                        <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="subtitle2">주문 상태</Typography>
                                <Button size="small" onClick={() => set상태(모두 ? [] : 상태목록.map((s) => s.key))}>{모두 ? '모두 해제' : '모두 선택'}</Button>
                            </Stack>
                            <Stack direction="row" flexWrap="wrap" useFlexGap columnGap={1}>
                                {상태목록.map((s) => (
                                    <FormControlLabel key={s.key} sx={{ mr: 0, minWidth: 150 }}
                                        control={<Checkbox size="small" checked={상태.includes(s.key)} onChange={() => 상태토글(s.key)} />}
                                        label={s.label} />
                                ))}
                            </Stack>
                        </Stack>

                        {검색어 &&
                            <FormControlLabel
                                control={<Checkbox size="small" checked={검색어적용} onChange={(e) => set검색어적용(e.target.checked)} />}
                                label={`검색어 「${검색어}」 도 적용`} />}

                        <Typography variant="body2" sx={{ fontWeight: 700, color: 건수 === 0 || !상태.length ? 'error.main' : 'text.primary' }}>
                            {!상태.length ? '주문 상태를 하나 이상 고르세요.'
                                : 건수 === null ? '건수를 세는 중…'
                                    : 건수 === 0 ? '조건에 맞는 주문이 없습니다.'
                                        : `조건에 맞는 주문 ${commarNumber(건수)}건${건수 > 10000 ? '. 한 번에 10,000건까지 받으니 기간을 나눠 받아 주세요.' : ''}`}
                        </Typography>
                    </>}

                    <Typography variant="caption" color="text.secondary">
                        파일에는 구매자·받는사람의 이름, 연락처, 주소가 그대로 들어갑니다. 받은 파일은 필요한 곳에만 쓰고 보관에 주의해 주세요. 내려받으면 받은 사람과 시각, 건수가 기록됩니다.
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={받는중}>닫기</Button>
                <Button variant="contained" disabled={!받을수있음 || 받는중}
                    onClick={() => onDownload(조건모드 ? { 조건 } : { 선택: true })}>
                    {받는중 ? '내려받는 중…' : '내려받기'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderExcelDialog;
