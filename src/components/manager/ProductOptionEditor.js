import { useEffect, useMemo, useState } from 'react';
import {
    Box, Button, Divider, FormControl, IconButton, InputAdornment, InputLabel,
    MenuItem, OutlinedInput, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import toast from 'react-hot-toast';
import { Row } from 'src/components/elements/styled-components';
import { apiManager } from 'src/utils/api';
import { ORDER_FORM_TYPES, CHOICE_TYPES, DATE_TYPES, LENGTH_TYPES, PII_TYPES } from 'src/data/order-form-types';

// 상품 옵션 통합 편집 — 상품등록/수정 화면의 [옵션] 한 곳.
//
// 왜 통합했나 (실제 운영 데이터에서 확인한 것):
//   예전엔 '상품특성'과 '상품옵션'이 따로 있었고 뜻이 겹쳤다.
//   가맹점이 넣은 특성 6건 중 5건이 오용이었다 — 키·값을 뒤집어 넣거나(한국/한국),
//   특성값에 가격을 적었다(영상 = 10000). 아무도 이 칸이 무엇인지 몰랐다는 뜻이다.
//   그리고 옵션은 '그룹마다 반드시 1개'가 강제라 추가상품을 만들 수 없어서,
//   한복·스냅을 선택지 1개짜리 그룹으로 만든 상품은 355,000원을 붙여야만 살 수 있었다.
//
// 그래서 뜻이 안 겹치게 넷으로 가른다(네이버 스마트스토어·카페24와 같은 구분):
//   ① 상품정보  보여만 준다        원산지 · 제조사
//   ② 선택옵션  골라야 산다        색상 · 사이즈
//   ③ 추가상품  안 골라도 산다     한복 +10,000
//   ④ 입력항목  손님이 적는다      행사날짜 · 각인문구

const 선택옵션 = 0;
const 추가상품 = 1;

const 라벨 = (t) => <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{t}</Typography>;
const 도움말 = (t) => <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: -0.5 }}>{t}</Typography>;

const ProductOptionEditor = ({ item, setItem, disabled = false }) => {
    const groups = item?.groups ?? [];
    const characters = item?.characters ?? [];
    const fields = item?.order_form_fields ?? [];
    const 조합형 = Number(item?.option_mode) === 1;

    const set = (patch) => setItem({ ...item, ...patch });
    const setGroups = (g) => set({ groups: g });

    const 살아있는 = (list) => (list ?? []).filter((x) => x?.is_delete != 1);
    const 종류별 = (type) => groups
        .map((g, idx) => ({ g, idx }))
        .filter(({ g }) => g?.is_delete != 1 && (Number(g?.group_type) || 0) === type);

    // ── 그룹/옵션 조작 ───────────────────────────────────────────────────────
    const 그룹추가 = (type) => setGroups([...groups, {
        group_name: '', group_description: '', group_type: type,
        is_able_duplicate_select: type === 추가상품 ? 1 : 0, options: [],
    }]);
    const 그룹수정 = (idx, patch) => {
        const next = [...groups];
        next[idx] = { ...next[idx], ...patch };
        setGroups(next);
    };
    const 그룹삭제 = (idx) => {
        const next = [...groups];
        if (next[idx]?.id) next[idx] = { ...next[idx], is_delete: 1 };
        else next.splice(idx, 1);
        setGroups(next);
    };
    const 옵션추가 = (gIdx) => 그룹수정(gIdx, {
        options: [...(groups[gIdx]?.options ?? []), { option_name: '', option_price: 0, stock_qty: '', is_soldout: 0 }],
    });
    const 옵션수정 = (gIdx, oIdx, patch) => {
        const opts = [...(groups[gIdx]?.options ?? [])];
        opts[oIdx] = { ...opts[oIdx], ...patch };
        그룹수정(gIdx, { options: opts });
    };
    const 옵션삭제 = (gIdx, oIdx) => {
        const opts = [...(groups[gIdx]?.options ?? [])];
        if (opts[oIdx]?.id) opts[oIdx] = { ...opts[oIdx], is_delete: 1 };
        else opts.splice(oIdx, 1);
        그룹수정(gIdx, { options: opts });
    };

    // ── 조합표 ───────────────────────────────────────────────────────────────
    //
    // 선택옵션들의 모든 짝을 만든다(색상 2개 × 사이즈 3개 = 6줄).
    // 조합은 **이름으로** 들고 있는다 — 새로 만든 옵션은 아직 id 가 없어서
    // id 로 묶으면 저장 전에는 조합을 만들 수 없다(백엔드가 이름을 id 로 푼다).
    const 조합목록 = useMemo(() => {
        const 축 = 종류별(선택옵션)
            .map(({ g }) => 살아있는(g.options).map((o) => String(o.option_name ?? '').trim()).filter(Boolean))
            .filter((names) => names.length > 0);
        if (!축.length) return [];
        return 축.reduce((acc, names) => acc.flatMap((prev) => names.map((n) => [...prev, n])), [[]]);
    }, [JSON.stringify(groups)]);

    // 저장된 조합을 이름 기준으로 찾는다. 서버는 combo_key(=옵션 id 결합)로 주므로
    // 처음 불러올 때 id → 이름으로 한 번 풀어 둔다(아래 useEffect).
    const 조합찾기 = (names) => (item?.combinations ?? []).find(
        (c) => JSON.stringify([...(c?.option_names ?? [])].sort()) === JSON.stringify([...names].sort()));

    useEffect(() => {
        // 서버에서 온 조합(combo_key)을 화면이 쓰는 형태(option_names)로 바꾼다. 한 번만.
        const list = item?.combinations ?? [];
        if (!list.length || list[0]?.option_names) return;
        const 이름 = {};
        for (const g of groups) for (const o of (g?.options ?? [])) if (o?.id) 이름[String(o.id)] = o.option_name;
        set({
            combinations: list.map((c) => ({
                ...c,
                option_names: String(c?.combo_key ?? '').split('-').map((id) => 이름[id]).filter(Boolean),
            })).filter((c) => c.option_names.length > 0),
        });
    }, [item?.combinations, groups]);

    const 조합수정 = (names, patch) => {
        const list = [...(item?.combinations ?? [])];
        const idx = list.findIndex((c) => JSON.stringify([...(c?.option_names ?? [])].sort()) === JSON.stringify([...names].sort()));
        if (idx >= 0) list[idx] = { ...list[idx], ...patch };
        else list.push({ option_names: names, add_price: 0, stock_qty: '', ...patch });
        set({ combinations: list });
    };

    // ── 손님 입력항목 ────────────────────────────────────────────────────────
    const [템플릿, set템플릿] = useState([]);
    useEffect(() => {
        (async () => {
            const r = await apiManager('order-forms/templates', 'list');
            set템플릿(r?.content ?? []);
        })();
    }, []);

    const 항목수정 = (idx, patch) => {
        const next = [...fields];
        next[idx] = { ...next[idx], ...patch };
        set({ order_form_fields: next });
    };
    const 항목삭제 = (idx) => {
        const next = [...fields];
        if (next[idx]?.id) next[idx] = { ...next[idx], is_delete: 1 };
        else next.splice(idx, 1);
        set({ order_form_fields: next });
    };
    const 템플릿불러오기 = (tpl) => {
        if (!tpl?.fields?.length) return;
        // **복사**한다. 참조가 아니다 — 본사가 나중에 서식을 고쳐도 이 상품은 안 바뀐다.
        // id 를 떼야 이 상품의 새 항목으로 저장된다.
        set({
            order_form_fields: [...fields, ...tpl.fields.map(({ id, template_id, ...f }) => ({ ...f }))],
        });
        toast.success(`'${tpl.name}' 서식을 불러왔습니다. 필요 없는 항목은 지우고 저장하세요.`);
    };

    // ── 상품정보(특성) ───────────────────────────────────────────────────────
    const 특성수정 = (idx, patch) => {
        const next = [...characters];
        next[idx] = { ...next[idx], ...patch };
        set({ characters: next });
    };
    const 특성삭제 = (idx) => {
        const next = [...characters];
        if (next[idx]?.id) next[idx] = { ...next[idx], is_delete: 1 };
        else next.splice(idx, 1);
        set({ characters: next });
    };

    const 숨김 = disabled ? { display: 'none' } : {};

    const 옵션줄 = (g, gIdx, 추가상품인가) => (
        <Stack key={g?.id ?? gIdx} spacing={1} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Row style={{ columnGap: '0.5rem' }}>
                <TextField
                    disabled={disabled} sx={{ flexGrow: 1 }} size="small"
                    label={추가상품인가 ? '추가상품 묶음 이름' : '옵션 이름'}
                    placeholder={추가상품인가 ? '예시) 촬영 추가' : '예시) 색상'}
                    value={g?.group_name ?? ''}
                    onChange={(e) => 그룹수정(gIdx, { group_name: e.target.value })}
                />
                <Button variant="outlined" size="small" sx={{ height: 40, ...숨김 }}
                    onClick={() => 옵션추가(gIdx)}>항목 추가</Button>
                <IconButton sx={숨김} onClick={() => 그룹삭제(gIdx)}>
                    <Icon icon="material-symbols:delete-outline" />
                </IconButton>
            </Row>
            {살아있는(g?.options).length === 0 &&
                도움말('고를 항목이 없으면 저장되지 않습니다. 항목을 추가해 주세요.')}
            {(g?.options ?? []).map((o, oIdx) => o?.is_delete == 1 ? null : (
                <Row key={o?.id ?? oIdx} style={{ columnGap: '0.5rem' }}>
                    <TextField
                        size="small" sx={{ flexGrow: 1 }} label="항목명"
                        placeholder={추가상품인가 ? '예시) 성장영상' : '예시) 블랙'}
                        value={o?.option_name ?? ''}
                        onChange={(e) => 옵션수정(gIdx, oIdx, { option_name: e.target.value })}
                    />
                    {/* 조합형에서는 선택옵션의 개별 가격을 안 쓴다 — 조합표에서 매긴다.
                        칸을 남겨 두면 여기 넣은 값이 반영 안 되는 이유를 알 수 없다. */}
                    {!(조합형 && !추가상품인가) &&
                        <FormControl variant="outlined" size="small" sx={{ width: 150 }}>
                            <InputLabel>{추가상품인가 ? '가격' : '변동가'}</InputLabel>
                            <OutlinedInput
                                label={추가상품인가 ? '가격' : '변동가'} type="number"
                                value={o?.option_price ?? 0}
                                endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                onChange={(e) => 옵션수정(gIdx, oIdx, { option_price: e.target.value })}
                            />
                        </FormControl>}
                    {!(조합형 && !추가상품인가) &&
                        <TextField
                            size="small" sx={{ width: 130 }} type="number" label="재고"
                            placeholder="무제한"
                            value={o?.stock_qty ?? ''}
                            onChange={(e) => 옵션수정(gIdx, oIdx, { stock_qty: e.target.value })}
                        />}
                    <IconButton sx={숨김} onClick={() => 옵션삭제(gIdx, oIdx)}>
                        <Icon icon="material-symbols:delete-outline" />
                    </IconButton>
                </Row>
            ))}
        </Stack>
    );

    return (
        <Stack spacing={4}>
            {/* ① 선택옵션 ------------------------------------------------------ */}
            <Stack spacing={1.5}>
                {라벨('선택 옵션')}
                {도움말('손님이 반드시 골라야 살 수 있는 것입니다. 색상·사이즈처럼요.')}
                <Row style={{ columnGap: '0.75rem', alignItems: 'center' }}>
                    <ToggleButtonGroup
                        exclusive size="small" disabled={disabled}
                        value={조합형 ? 1 : 0}
                        onChange={(e, v) => v !== null && set({ option_mode: v })}
                    >
                        <ToggleButton value={0}>따로 고르기</ToggleButton>
                        <ToggleButton value={1}>조합으로 고르기</ToggleButton>
                    </ToggleButtonGroup>
                    <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                        {조합형
                            ? '색상×사이즈처럼 조합마다 가격·재고를 따로 매깁니다.'
                            : '옵션마다 변동가·재고를 각각 매깁니다.'}
                    </Typography>
                </Row>
                {종류별(선택옵션).map(({ g, idx }) => 옵션줄(g, idx, false))}
                <Button variant="outlined" sx={{ height: 48, ...숨김 }}
                    onClick={() => 그룹추가(선택옵션)}>선택 옵션 추가</Button>
            </Stack>

            {/* ② 조합표 -------------------------------------------------------- */}
            {조합형 && 조합목록.length > 0 &&
                <Stack spacing={1}>
                    {라벨('조합별 가격 · 재고')}
                    {도움말(`${조합목록.length}개 조합. 재고를 비우면 무제한입니다.`)}
                    <Stack spacing={0.75}>
                        {조합목록.map((names) => {
                            const c = 조합찾기(names) ?? {};
                            return (
                                <Row key={names.join('-')} style={{ columnGap: '0.5rem' }}>
                                    <Typography sx={{ flexGrow: 1, fontSize: 14 }}>{names.join(' / ')}</Typography>
                                    <FormControl variant="outlined" size="small" sx={{ width: 150 }}>
                                        <InputLabel>추가금</InputLabel>
                                        <OutlinedInput
                                            label="추가금" type="number" value={c?.add_price ?? 0}
                                            endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                            onChange={(e) => 조합수정(names, { add_price: e.target.value })}
                                        />
                                    </FormControl>
                                    <TextField
                                        size="small" sx={{ width: 130 }} type="number" label="재고" placeholder="무제한"
                                        value={c?.stock_qty ?? ''}
                                        onChange={(e) => 조합수정(names, { stock_qty: e.target.value })}
                                    />
                                </Row>
                            );
                        })}
                    </Stack>
                </Stack>}

            {/* 옵션이 없는 상품의 재고 ------------------------------------------- */}
            {종류별(선택옵션).length === 0 &&
                <Stack spacing={1}>
                    {라벨('재고')}
                    {도움말('비우면 무제한입니다. 0을 넣으면 품절로 표시되고 구매가 막힙니다.')}
                    <TextField
                        size="small" sx={{ width: 200 }} type="number" placeholder="무제한"
                        value={item?.stock_qty ?? ''}
                        onChange={(e) => set({ stock_qty: e.target.value })}
                    />
                </Stack>}

            <Divider />

            {/* ③ 추가상품 ------------------------------------------------------ */}
            <Stack spacing={1.5}>
                {라벨('추가 상품')}
                {도움말('안 골라도 살 수 있는 것입니다. 손님이 필요한 것만 고릅니다. 여러 개 고를 수 있습니다.')}
                {종류별(추가상품).map(({ g, idx }) => 옵션줄(g, idx, true))}
                <Button variant="outlined" sx={{ height: 48, ...숨김 }}
                    onClick={() => 그룹추가(추가상품)}>추가 상품 만들기</Button>
            </Stack>

            <Divider />

            {/* ④ 손님 입력항목 ------------------------------------------------- */}
            <Stack spacing={1.5}>
                {라벨('손님이 적는 항목')}
                {도움말('행사날짜·각인문구처럼 손님에게 직접 받아야 하는 내용입니다. 상품 상세에서 가격 아래에 나타납니다.')}
                {템플릿.length > 0 &&
                    <Row style={{ columnGap: '0.5rem', flexWrap: 'wrap' }}>
                        <Typography sx={{ fontSize: 12, color: 'text.disabled', lineHeight: '32px' }}>서식 불러오기</Typography>
                        {템플릿.map((t) => (
                            <Button key={t.id} size="small" variant="outlined" sx={숨김}
                                onClick={() => 템플릿불러오기(t)}>{t.name}</Button>
                        ))}
                    </Row>}
                {fields.map((f, idx) => f?.is_delete == 1 ? null : (
                    <Stack key={f?.id ?? idx} spacing={1} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Row style={{ columnGap: '0.5rem' }}>
                            <TextField
                                size="small" sx={{ flexGrow: 1 }} label="항목 이름" placeholder="예시) 행사일"
                                value={f?.label ?? ''}
                                onChange={(e) => 항목수정(idx, { label: e.target.value })}
                            />
                            <TextField
                                select size="small" sx={{ width: 190 }} label="입력 방식"
                                value={f?.field_type ?? 'text'}
                                onChange={(e) => 항목수정(idx, { field_type: e.target.value })}
                            >
                                {ORDER_FORM_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                            </TextField>
                            <Row style={{ alignItems: 'center' }}>
                                <Switch size="small" checked={!!f?.is_required}
                                    onChange={(e) => 항목수정(idx, { is_required: e.target.checked ? 1 : 0 })} />
                                <Typography sx={{ fontSize: 13 }}>필수</Typography>
                            </Row>
                            <IconButton sx={숨김} onClick={() => 항목삭제(idx)}>
                                <Icon icon="material-symbols:delete-outline" />
                            </IconButton>
                        </Row>
                        <TextField
                            size="small" fullWidth label="도움말 (선택)" placeholder="입력칸 아래에 작게 보입니다"
                            value={f?.placeholder ?? ''}
                            onChange={(e) => 항목수정(idx, { placeholder: e.target.value })}
                        />
                        {CHOICE_TYPES.includes(f?.field_type) &&
                            <TextField
                                size="small" fullWidth multiline minRows={3} label="보기 목록"
                                placeholder={'한 줄에 하나씩\n1층\n2층\n지하'}
                                value={f?.option_list ?? ''}
                                onChange={(e) => 항목수정(idx, { option_list: e.target.value })}
                            />}
                        {DATE_TYPES.includes(f?.field_type) &&
                            <Row style={{ columnGap: '0.5rem' }}>
                                <TextField
                                    size="small" type="number" sx={{ width: 200 }} label="준비 기간(일)"
                                    placeholder="예시) 7"
                                    helperText="오늘부터 N일 이후만 고를 수 있습니다"
                                    value={f?.lead_days ?? ''}
                                    onChange={(e) => 항목수정(idx, { lead_days: e.target.value })}
                                />
                                <TextField
                                    size="small" type="number" sx={{ width: 200 }} label="예약 가능 범위(일)"
                                    placeholder="예시) 180"
                                    helperText="너무 먼 날짜를 막습니다"
                                    value={f?.max_days ?? ''}
                                    onChange={(e) => 항목수정(idx, { max_days: e.target.value })}
                                />
                            </Row>}
                        {LENGTH_TYPES.includes(f?.field_type) &&
                            <TextField
                                size="small" type="number" sx={{ width: 200 }} label="최대 글자수"
                                value={f?.max_length ?? ''}
                                onChange={(e) => 항목수정(idx, { max_length: e.target.value })}
                            />}
                        {PII_TYPES.includes(f?.field_type) &&
                            도움말('개인정보라 암호화해서 저장됩니다.')}
                    </Stack>
                ))}
                <Button variant="outlined" sx={{ height: 48, ...숨김 }}
                    onClick={() => set({ order_form_fields: [...fields, { label: '', field_type: 'text', is_required: 0 }] })}>
                    입력 항목 추가
                </Button>
            </Stack>

            <Divider />

            {/* ⑤ 상품정보(특성) ------------------------------------------------ */}
            <Stack spacing={1.5}>
                {라벨('상품 정보')}
                {도움말('원산지·제조사처럼 보여주기만 하는 내용입니다. 손님이 고르는 것이 아닙니다. 고르게 하려면 위의 선택 옵션을 쓰세요.')}
                {characters.map((c, idx) => c?.is_delete == 1 ? null : (
                    <Row key={c?.id ?? idx} style={{ columnGap: '0.5rem' }}>
                        <TextField
                            disabled={disabled} sx={{ flexGrow: 1 }} size="small" label="항목" placeholder="예시) 원산지"
                            value={c?.character_name ?? ''}
                            onChange={(e) => 특성수정(idx, { character_name: e.target.value })}
                        />
                        <TextField
                            disabled={disabled} sx={{ flexGrow: 1 }} size="small" label="내용" placeholder="예시) 국내산"
                            value={c?.character_value ?? ''}
                            onChange={(e) => 특성수정(idx, { character_value: e.target.value })}
                        />
                        <IconButton sx={숨김} onClick={() => 특성삭제(idx)}>
                            <Icon icon="material-symbols:delete-outline" />
                        </IconButton>
                    </Row>
                ))}
                <Button variant="outlined" sx={{ height: 48, ...숨김 }}
                    onClick={() => set({ characters: [...characters, { character_name: '', character_value: '' }] })}>
                    상품 정보 추가
                </Button>
            </Stack>
        </Stack>
    );
};

export default ProductOptionEditor;
