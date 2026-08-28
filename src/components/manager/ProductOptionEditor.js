import { useEffect, useMemo, useState } from 'react';
import {
    Box, Button, Divider, FormControl, FormControlLabel, IconButton, InputAdornment, InputLabel,
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

// 돈·수량 칸에 음수가 들어가지 못하게 한다.
//
// type="number" 는 스피너를 줄 뿐 키보드로 '-' 를 치는 것을 막지 않는다.
// 옵션 변동가가 음수면 손님이 그 옵션을 고르는 것만으로 결제금액이 깎인다 —
// 서버(product-options.js)에서도 막지만, 여기서 막아야 가맹점이 저장 전에 알아차린다.
// 빈 문자열은 그대로 둔다. 재고에서 '비움 = 무제한' 이라는 뜻이기 때문이다.
const 음수막기 = (v) => (String(v ?? '').trim() === '' ? '' : String(Math.max(0, parseInt(v) || 0)));
const 음수막기속성 = { inputProps: { min: 0 } };

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
    //
    // 새 옵션에는 화면 전용 식별자(_k)를 붙인다. 아래 옵션키() 참고 —
    // 이게 있어야 아직 저장 전인 옵션도 이름과 무관하게 같은 조합으로 따라간다.
    // 백엔드는 모르는 필드라 그냥 무시한다.
    const 새옵션키 = () => `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const 새옵션 = () => ({ option_name: '', option_price: 0, stock_qty: '', is_soldout: 0, _k: 새옵션키() });

    // 그룹을 만들면 빈 항목 한 줄을 같이 놓는다.
    // 빈 그룹은 저장할 때 서버가 통째로 버린다(cleanOptionGroups) — 고를 수 있는 항목이
    // 하나도 없는 그룹이 붙으면 그 상품은 아예 못 팔기 때문이다.
    // 그래서 이름만 적고 '항목 추가'를 안 누른 가맹점에게는 적은 내용이 말없이 사라진 것처럼 보였다.
    // 한 줄을 미리 놓아 두면 무엇을 채워야 하는 자리인지가 화면에 그대로 드러난다.
    const 그룹추가 = (type) => setGroups([...groups, {
        group_name: '', group_description: '', group_type: type,
        is_able_duplicate_select: type === 추가상품 ? 1 : 0, options: [새옵션()],
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
        options: [...(groups[gIdx]?.options ?? []), 새옵션()],
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
    //
    // ⚠ 조합을 **이름으로 묶으면 안 된다.** 예전에 그렇게 했다가 이런 일이 났다:
    //     블랙/S 추가금 5,000 · 재고 20  →  '블랙' 을 '블랙(무광)' 으로 고치는 순간
    //     블랙(무광)/S 추가금 0 · 재고 무제한   (경고도 없이 초기화)
    //   오타 하나 고치려다 조합표를 처음부터 다시 채워야 했다.
    //   같은 이름 옵션을 둘 만들면 조합 줄이 중복으로 생기기도 했다.
    //
    // 그래서 이름 대신 '옵션 식별자' 로 묶는다.
    //   저장된 옵션 → id:5      (이름을 바꿔도 그대로)
    //   새 옵션    → tmp_xxx    (저장 전이라 id 가 없다)
    //   둘 다 없으면(옛 폼 상태) 이름으로 떨어진다 — 예전과 같게 동작한다.
    //
    // 백엔드로는 여전히 option_names 를 보낸다(서버가 이름 → id 로 푼다).
    // 이름은 아래 동기화에서 늘 최신으로 다시 채우므로, 이름을 바꿔도 같은 옵션으로 저장된다.
    const 옵션키 = (o) => o?._k ? String(o._k)
        : o?.id ? `id:${o.id}`
        : `name:${String(o?.option_name ?? '').trim()}`;

    const 조합목록 = useMemo(() => {
        const 축 = 종류별(선택옵션)
            .map(({ g }) => 살아있는(g.options)
                .filter((o) => String(o?.option_name ?? '').trim())
                .map((o) => ({ k: 옵션키(o), name: String(o.option_name).trim() })))
            .filter((칸) => 칸.length > 0);
        if (!축.length) return [];
        return 축.reduce((acc, 칸) => acc.flatMap((prev) => 칸.map((x) => [...prev, x])), [[]]);
    }, [JSON.stringify(groups)]);

    const 조합키 = (keys) => [...keys].sort().join(' ');
    const 조합찾기 = (keys) => (item?.combinations ?? []).find(
        (c) => 조합키(c?.option_keys ?? []) === 조합키(keys));

    useEffect(() => {
        // 서버에서 온 조합(combo_key = 옵션 id 결합)을 화면이 쓰는 형태로 바꾼다. 한 번만.
        // 식별자(option_keys)는 id 에서 바로 나오므로 이름을 나중에 고쳐도 흔들리지 않는다.
        const list = item?.combinations ?? [];
        if (!list.length || list[0]?.option_keys) return;
        const 이름 = {};
        for (const g of groups) for (const o of (g?.options ?? [])) if (o?.id) 이름[String(o.id)] = o.option_name;
        set({
            combinations: list.map((c) => {
                const ids = String(c?.combo_key ?? '').split('-').filter(Boolean);
                return {
                    ...c,
                    option_keys: ids.map((id) => `id:${id}`),
                    option_names: ids.map((id) => 이름[id]).filter(Boolean),
                };
            }).filter((c) => c.option_names.length === c.option_keys.length && c.option_keys.length > 0),
        });
    }, [item?.combinations, groups]);

    // 화면에 뜬 조합표를 **그대로** item.combinations 에 맞춘다(빈 줄도 포함).
    //
    // ⚠ 이게 없으면 손대지 않은 조합은 저장되지 않는다. 그러면 손님 화면에서
    //   `findCombination` 이 그 조합을 못 찾아 '판매하지 않습니다' 로 막힌다 —
    //   6개 조합 중 1개만 값을 고친 가맹점은 **나머지 5개를 못 파는** 상태가 된다.
    //   화면에 0원으로 보이는 줄은 '0원짜리 조합'이지 '없는 조합'이 아니다.
    // 옵션을 지워서 사라진 조합도 여기서 함께 떨어져 나간다.
    useEffect(() => {
        if (!조합형 || !조합목록.length) return;
        // ⚠ 위 변환(combo_key → option_keys)이 아직 안 끝났으면 손대지 않는다.
        //   먼저 돌면 기존 값을 하나도 못 찾아 전부 0원·무제한으로 깔아 버리고,
        //   그 뒤엔 변환 조건(option_keys 없음)도 깨져서 서버 값이 영영 안 돌아온다.
        //   즉 가맹점이 상품을 열기만 해도 조합표가 날아간다.
        const 아직변환전 = (item?.combinations ?? []).some(
            (c) => c?.combo_key && !(c?.option_keys?.length > 0));
        if (아직변환전) return;
        const 기존 = new Map((item?.combinations ?? [])
            .filter((c) => (c?.option_keys?.length ?? 0) > 0)
            .map((c) => [조합키(c.option_keys), c]));
        // 값(추가금·재고)은 식별자로 찾아 그대로 잇고, 이름만 지금 이름으로 다시 채운다.
        // 이렇게 해야 이름을 고쳐도 값이 살아남고, 저장할 때는 바뀐 이름으로 나간다.
        const 맞춘것 = 조합목록.map((칸) => {
            const keys = 칸.map((x) => x.k);
            const names = 칸.map((x) => x.name);
            const 옛것 = 기존.get(조합키(keys));
            return 옛것
                ? { ...옛것, option_keys: keys, option_names: names }
                : { option_keys: keys, option_names: names, add_price: 0, stock_qty: '' };
        });
        // 달라졌을 때만 넣는다 — 매 렌더 set 하면 무한 루프가 된다.
        // 이름만 바뀐 경우도 '달라진 것' 으로 봐야 저장 payload 가 최신 이름으로 간다.
        const 같다 = JSON.stringify(item?.combinations ?? []) === JSON.stringify(맞춘것);
        if (!같다) set({ combinations: 맞춘것 });
    }, [조합형, 조합목록, item?.combinations]);

    // 조합표 일괄 적용 · 접기 상태
    const [일괄, set일괄] = useState({ add_price: '', stock_qty: '' });
    const [조합펼침, set조합펼침] = useState(false);
    // 빈 칸은 건드리지 않는다 — '재고만 한 번에' 도 되어야 한다.
    const 일괄적용 = () => {
        const patch = {};
        if (String(일괄.add_price).trim() !== '') patch.add_price = 일괄.add_price;
        if (String(일괄.stock_qty).trim() !== '') patch.stock_qty = 일괄.stock_qty;
        if (!Object.keys(patch).length) { toast.error('적용할 값을 넣어 주세요.'); return; }
        set({ combinations: (item?.combinations ?? []).map((c) => ({ ...c, ...patch })) });
        toast.success(`${조합목록.length}개 조합에 적용했습니다.`);
    };

    const 조합수정 = (keys, names, patch) => {
        const list = [...(item?.combinations ?? [])];
        const idx = list.findIndex((c) => 조합키(c?.option_keys ?? []) === 조합키(keys));
        if (idx >= 0) list[idx] = { ...list[idx], ...patch };
        else list.push({ option_keys: keys, option_names: names, add_price: 0, stock_qty: '', ...patch });
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
                                onChange={(e) => 옵션수정(gIdx, oIdx, { option_price: 음수막기(e.target.value) })}
                                inputProps={{ min: 0 }}
                            />
                        </FormControl>}
                    {!(조합형 && !추가상품인가) &&
                        <TextField
                            size="small" sx={{ width: 130 }} type="number" label="재고"
                            placeholder="무제한"
                            value={o?.stock_qty ?? ''}
                            onChange={(e) => 옵션수정(gIdx, oIdx, { stock_qty: 음수막기(e.target.value) })}
                            InputProps={음수막기속성}
                        />}
                    {/* 옵션 단위 품절.
                        상품 전체 품절은 '판매상태' 에 이미 있지만, '검정만 잠깐 안 판다' 를
                        표현할 방법이 없었다. 재고를 0 으로 바꿨다가 원래 수를 기억해
                        되돌리는 수밖에 없었다 — 재고를 건드리지 않고 잠글 수 있어야 한다.
                        백엔드(product_options.is_soldout)는 예전부터 받고 있었다. */}
                    <FormControlLabel
                        sx={{ mr: 0, whiteSpace: 'nowrap', ...숨김 }}
                        control={<Switch size="small" disabled={disabled}
                            checked={!!o?.is_soldout}
                            onChange={(e) => 옵션수정(gIdx, oIdx, { is_soldout: e.target.checked ? 1 : 0 })} />}
                        label={<Typography sx={{ fontSize: 12 }}>품절</Typography>}
                    />
                    <IconButton sx={숨김} onClick={() => 옵션삭제(gIdx, oIdx)}>
                        <Icon icon="material-symbols:delete-outline" />
                    </IconButton>
                </Row>
            ))}
        </Stack>
    );

    // 손님 화면 요약 —
    // 설정만 보고는 '내 손님이 무엇을 보게 되는지' 가 안 그려진다. 특히 '선택 옵션'과
    // '추가 상품' 은 이름만 다르고 칸 모양이 같아서, 어느 쪽에 넣었는지 헷갈린 채 저장하기 쉽다.
    // 실제 상품 화면을 여기 띄우면 프레임 테마까지 끌고 와야 하므로, 사실만 요약해 보여 준다.
    const 요약 = useMemo(() => {
        const 필수 = 종류별(선택옵션).map(({ g }) => ({
            name: String(g?.group_name ?? '').trim() || '(이름 없음)',
            n: 살아있는(g?.options).length,
        }));
        const 추가 = 종류별(추가상품).flatMap(({ g }) => 살아있는(g?.options).map((o) => ({
            name: String(o?.option_name ?? '').trim() || '(이름 없음)',
            price: Number(o?.option_price) || 0,
        })));
        const 입력 = 살아있는(fields).map((f) => ({
            label: String(f?.label ?? '').trim() || '(이름 없음)',
            required: !!f?.is_required,
        }));
        const 한정 = Number(item?.purchase_limit) > 0 ? Number(item.purchase_limit) : 0;
        return { 필수, 추가, 입력, 한정 };
    }, [JSON.stringify(groups), JSON.stringify(fields), item?.purchase_limit]);

    return (
        <Stack spacing={4}>
            {/* ⓪ 손님이 보게 될 것 ---------------------------------------------- */}
            {(요약.필수.length > 0 || 요약.추가.length > 0 || 요약.입력.length > 0 || 요약.한정 > 0) &&
                <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.75 }}>손님이 보게 될 것</Typography>
                    <Stack spacing={0.35}>
                        {요약.필수.map((g) => (
                            <Typography key={'r' + g.name} sx={{ fontSize: 13 }}>
                                · <b>{g.name}</b> — 반드시 골라야 합니다 ({g.n}개 중 1개)
                                {조합형 ? ' · 조합별 가격' : ''}
                            </Typography>
                        ))}
                        {요약.추가.length > 0 &&
                            <Typography sx={{ fontSize: 13 }}>
                                · <b>추가 상품</b> — 원하는 것만 고릅니다 ({요약.추가.map((o) =>
                                    `${o.name}${o.price ? ` +${o.price.toLocaleString()}원` : ''}`).join(', ')})
                            </Typography>}
                        {요약.입력.map((f) => (
                            <Typography key={'f' + f.label} sx={{ fontSize: 13 }}>
                                · <b>{f.label}</b> — 손님이 직접 적습니다{f.required ? ' (필수)' : ' (선택)'}
                            </Typography>
                        ))}
                        {요약.한정 > 0 &&
                            <Typography sx={{ fontSize: 13 }}>
                                · <b>한정 상품</b> — 1인 {요약.한정}개까지 · 회원만 구매
                            </Typography>}
                        {요약.필수.length === 0 && 요약.추가.length === 0 &&
                            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
                                · 고를 것이 없어 바로 담을 수 있습니다.
                            </Typography>}
                    </Stack>
                </Box>}

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
                </Row>
                {/* 두 방식 정의 — 고르기 전에 차이를 알 수 있게 둘 다 항상 보여주고, 지금 선택한 쪽을 진하게 표시.
                    예전엔 활성 모드 한 줄만 떠서 무엇이 다른지 몰랐다(가맹점 지적). */}
                <Stack spacing={0.5} sx={{ mt: 0.25 }}>
                    <Typography sx={{ fontSize: 12, color: 조합형 ? 'text.disabled' : 'text.primary', lineHeight: 1.5 }}>
                        <b>따로 고르기</b> — 옵션마다 가격·재고를 각각 매깁니다. 손님이 고른 옵션들의 추가금이 합산됩니다.
                        <span style={{ color: '#9aa0a6' }}> (예: 화이트+0원, 사이즈 L+2,000원 → 화이트·L 선택 시 판매가+2,000원)</span>
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 조합형 ? 'text.primary' : 'text.disabled', lineHeight: 1.5 }}>
                        <b>조합으로 고르기</b> — 색상×사이즈처럼 옵션을 조합한 경우마다 가격·재고를 따로 정합니다.
                        <span style={{ color: '#9aa0a6' }}> (예: 검정/M만 품절, 빨강/L만 +3,000원처럼 조합별로 다르게)</span>
                    </Typography>
                </Stack>
                {종류별(선택옵션).map(({ g, idx }) => 옵션줄(g, idx, false))}
                <Button variant="outlined" sx={{ height: 48, ...숨김 }}
                    onClick={() => 그룹추가(선택옵션)}>선택 옵션 추가</Button>
            </Stack>

            {/* ② 조합표 -------------------------------------------------------- */}
            {조합형 && 조합목록.length > 0 &&
                <Stack spacing={1}>
                    {라벨('조합별 가격 · 재고')}
                    {도움말(`${조합목록.length}개 조합. 재고를 비우면 무제한입니다.`)}

                    {/* 일괄 적용 —
                        옵션이 늘면 조합은 곱으로 늘어난다(색상5 × 사이즈5 × 재질4 = 100줄).
                        한 칸씩 채우게 두면 실제로는 못 쓰는 기능이 된다.
                        대부분은 '전부 같은 값' 이거나 '몇 개만 예외' 라, 한 번에 깔고
                        예외만 고치는 편이 빠르다. */}
                    <Row style={{ columnGap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', rowGap: '0.5rem', ...숨김 }}>
                        <Typography sx={{ fontSize: 12, color: 'text.disabled', mr: 0.5 }}>전체에 한 번에</Typography>
                        <FormControl variant="outlined" size="small" sx={{ width: 140 }}>
                            <InputLabel>추가금</InputLabel>
                            <OutlinedInput
                                label="추가금" type="number" value={일괄.add_price}
                                endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                onChange={(e) => set일괄({ ...일괄, add_price: 음수막기(e.target.value) })}
                                inputProps={{ min: 0 }} />
                        </FormControl>
                        <TextField size="small" sx={{ width: 120 }} type="number" label="재고"
                            placeholder="무제한" value={일괄.stock_qty}
                            onChange={(e) => set일괄({ ...일괄, stock_qty: 음수막기(e.target.value) })}
                            InputProps={음수막기속성} />
                        <Button variant="outlined" size="small" sx={{ height: 40 }}
                            onClick={일괄적용}>{조합목록.length}개 조합에 적용</Button>
                    </Row>

                    {/* 줄이 많으면 접어 둔다. 스무 줄이 넘어가면 아래 항목(입력항목·상품정보)이
                        화면 밖으로 밀려 그런 칸이 있다는 것조차 모르게 된다. */}
                    {조합목록.length > 20 && !조합펼침 &&
                        <Button variant="text" size="small" sx={{ alignSelf: 'flex-start' }}
                            onClick={() => set조합펼침(true)}>
                            조합 {조합목록.length}개 모두 보기
                        </Button>}
                    <Stack spacing={0.75}>
                        {(조합목록.length > 20 && !조합펼침 ? 조합목록.slice(0, 20) : 조합목록).map((칸) => {
                            const keys = 칸.map((x) => x.k);
                            const names = 칸.map((x) => x.name);
                            const c = 조합찾기(keys) ?? {};
                            return (
                                // key 는 이름이 아니라 식별자로 잡는다 — 이름이 같은 옵션이 있어도 줄이 안 겹친다
                                <Row key={keys.join('-')} style={{ columnGap: '0.5rem' }}>
                                    <Typography sx={{ flexGrow: 1, fontSize: 14 }}>{names.join(' / ')}</Typography>
                                    <FormControl variant="outlined" size="small" sx={{ width: 150 }}>
                                        <InputLabel>추가금</InputLabel>
                                        <OutlinedInput
                                            label="추가금" type="number" value={c?.add_price ?? 0}
                                            endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                            onChange={(e) => 조합수정(keys, names, { add_price: 음수막기(e.target.value) })}
                                            inputProps={{ min: 0 }}
                                        />
                                    </FormControl>
                                    <TextField
                                        size="small" sx={{ width: 130 }} type="number" label="재고" placeholder="무제한"
                                        value={c?.stock_qty ?? ''}
                                        onChange={(e) => 조합수정(keys, names, { stock_qty: 음수막기(e.target.value) })}
                                        InputProps={음수막기속성}
                                    />
                                    {/* 조합 단위 품절 — 재고를 건드리지 않고 그 조합만 잠근다 */}
                                    <FormControlLabel
                                        sx={{ mr: 0, whiteSpace: 'nowrap', ...숨김 }}
                                        control={<Switch size="small" disabled={disabled}
                                            checked={!!c?.is_soldout}
                                            onChange={(e) => 조합수정(keys, names, { is_soldout: e.target.checked ? 1 : 0 })} />}
                                        label={<Typography sx={{ fontSize: 12 }}>품절</Typography>}
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

            {/* 한정판 — 1인당 구매 개수 -------------------------------------------- */}
            <Stack spacing={1}>
                {라벨('한정판 (1인당 구매 개수)')}
                {도움말('비우면 제한 없습니다. 숫자를 넣으면 그 상품은 회원만 살 수 있습니다 — 비회원은 같은 사람인지 확인할 방법이 없어 제한이 지켜지지 않습니다.')}
                <TextField
                    size="small" sx={{ width: 200 }} type="number" placeholder="제한 없음"
                    label="1인 최대 구매 수량"
                    value={item?.purchase_limit ?? ''}
                    onChange={(e) => set({ purchase_limit: 음수막기(e.target.value) })}
                    InputProps={음수막기속성}
                />
                {Number(item?.purchase_limit) > 0 &&
                    도움말('⚠ 이 상품은 비회원이 구매할 수 없게 됩니다. 취소된 주문은 개수에서 빠집니다.')}
            </Stack>

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
