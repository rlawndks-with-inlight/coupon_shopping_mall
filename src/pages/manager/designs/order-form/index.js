import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    Alert, Autocomplete, Button, Card, Divider, FormControlLabel, IconButton,
    MenuItem, Stack, Switch, TextField, Typography, Chip,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { apiManager } from 'src/utils/api';
import { useSettingsContext } from 'src/components/settings';
import {
    ORDER_FORM_TYPES, PII_TYPES, CHOICE_TYPES, DATE_TYPES, LENGTH_TYPES,
} from 'src/data/order-form-types';

// 주문서 추가 입력항목 — 본사 마스터 전용 관리 화면.
//
// 예약·출장 업체가 주문받을 때 행사일·행사장소 등을 물어야 하는데 방법이 없었다.
// 서식을 여기서 만들고 **어느 가맹점에 적용할지**를 지정한다.
// 가맹점은 이 화면을 보지도, 항목을 고치지도 못한다.
//
// ⚠ 지금 설계는 '주문서에서 한 번' 입력받는다. 그래서 적용된 몰에서는
//   예약 아닌 상품만 산 고객에게도 이 항목들이 뜬다 — 화면에서 그 사실을 밝힌다.

const 빈항목 = () => ({
    id: null, label: '', field_type: 'text', placeholder: '', is_required: 0,
    option_list: '', max_length: '', min_number: '', max_number: '', lead_days: '', max_days: '',
});

const 빈서식 = () => ({ id: null, name: '', guide: '', is_use: 1, fields: [], targets: [] });

const OrderFormPage = () => {
    const { themeDnsData } = useSettingsContext();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);
    const [merchants, setMerchants] = useState([]);

    // 가맹점 현황에서 '?brand=<id>' 로 넘어온다 — 그 가맹점을 고른 채로 시작한다.
    // 가맹점 목록에서 출발해 그 몰 것을 만지는 흐름을 만들기 위한 것이다
    // (마스터는 가맹점 어드민에 로그인할 수 없어서, 대신 여기서 그 몰을 고른 상태로 연다).
    const 넘어온가맹점 = Number(router.query?.brand) || 0;

    useEffect(() => { if (router.isReady) settingPage(); }, [router.isReady]);

    const settingPage = async () => {
        const [data, m] = await Promise.all([
            apiManager('order-forms', 'list', {}),
            apiManager('order-forms/merchants', 'list', {}),
        ]);
        const merchantList = m?.content ?? [];
        let rows = (data?.content ?? []).map((t) => ({
            ...t,
            fields: t?.fields ?? [],
            targets: (t?.targets ?? []).map((x) => ({ brand_id: x.brand_id, dns: x.dns, name: x.brand_name })),
        }));

        if (넘어온가맹점) {
            const 걸린것 = rows.filter((t) => t.targets.some((g) => Number(g.brand_id) === 넘어온가맹점));
            if (걸린것.length > 0) {
                // 그 몰에 걸린 서식만 먼저 보여준다 — 서식이 여럿일 때 찾아 헤매지 않게.
                rows = [...걸린것, ...rows.filter((t) => !걸린것.includes(t))];
            } else {
                // 아직 없으면 그 가맹점이 선택된 빈 서식을 하나 열어 둔다(저장 전이라 DB 에는 없다).
                const b = merchantList.find((x) => Number(x.id) === 넘어온가맹점);
                if (b) rows = [{ ...빈서식(), targets: [{ brand_id: b.id, dns: b.dns, name: b.name }] }, ...rows];
            }
        }

        setList(rows);
        setMerchants(merchantList);
        setLoading(false);
    };

    const 바꾸기 = (i, key, v) => setList((p) => p.map((t, idx) => (idx === i ? { ...t, [key]: v } : t)));
    const 항목바꾸기 = (i, j, key, v) => setList((p) => p.map((t, idx) => (
        idx === i ? { ...t, fields: t.fields.map((f, k) => (k === j ? { ...f, [key]: v } : f)) } : t
    )));
    const 항목추가 = (i) => setList((p) => p.map((t, idx) => (idx === i ? { ...t, fields: [...t.fields, 빈항목()] } : t)));
    const 항목삭제 = (i, j) => setList((p) => p.map((t, idx) => (idx === i ? { ...t, fields: t.fields.filter((f, k) => k !== j) } : t)));
    const 항목이동 = (i, j, dir) => setList((p) => p.map((t, idx) => {
        if (idx !== i) return t;
        const fs = [...t.fields]; const to = j + dir;
        if (to < 0 || to >= fs.length) return t;
        [fs[j], fs[to]] = [fs[to], fs[j]];
        return { ...t, fields: fs };
    }));

    const 저장 = async (i) => {
        const t = list[i];
        if (!String(t.name ?? '').trim()) { toast.error('서식 이름을 입력해 주세요.'); return; }
        if (t.fields.some((f) => !String(f.label ?? '').trim())) {
            toast.error('이름이 빈 항목이 있습니다. 비워 두면 저장되지 않습니다.'); return;
        }
        // 보기 목록이 없는 선택 항목은 고객이 아무것도 고를 수 없다 — 저장 전에 잡는다.
        const 빈보기 = t.fields.find((f) => CHOICE_TYPES.includes(f.field_type) && !String(f.option_list ?? '').trim());
        if (빈보기) { toast.error(`'${빈보기.label}' 의 보기 목록을 입력해 주세요. 비어 있으면 고객이 고를 수 없습니다.`); return; }

        const payload = {
            name: t.name, guide: t.guide, is_use: t.is_use ? 1 : 0,
            fields: t.fields, targets: t.targets.map((x) => ({ brand_id: x.brand_id })),
        };
        const result = t.id
            ? await apiManager('order-forms', 'update', { ...payload, id: t.id })
            : await apiManager('order-forms', 'create', payload);
        if (result) { toast.success('저장했습니다.'); settingPage(); }
    };

    const 삭제 = async (i) => {
        const t = list[i];
        if (!t.id) { setList((p) => p.filter((x, idx) => idx !== i)); return; }
        if (!window.confirm('이 서식을 삭제하면 적용된 가맹점 주문서에서 즉시 사라집니다.\n(이미 접수된 주문의 입력값은 그대로 남습니다) 삭제할까요?')) return;
        const result = await apiManager('order-forms', 'delete', { id: t.id });
        if (result) { toast.success('삭제했습니다.'); settingPage(); }
    };

    if (themeDnsData?.is_main_dns != 1) {
        return <Alert severity="warning">본사 계정에서만 사용할 수 있는 화면입니다.</Alert>;
    }
    if (loading) return <></>;

    return (
        <Stack spacing={2}>
            <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                예약·출장처럼 <b>주문받을 때 더 물어봐야 하는 업체</b>를 위한 기능입니다.
                서식을 만들고 <b>적용할 가맹점</b>을 고르면, 그 몰의 <b>상품상세</b>에 입력칸이 생깁니다
                (네이버 스마트스토어의 &lsquo;구매자 작성형 옵션&rsquo;과 같은 자리).<br />
                값은 <b>장바구니에 담을 때 상품마다</b> 붙습니다 — 행사일이 다른 상품을 두 개 담아도 각각 남습니다.<br />
                지금은 그 몰의 <b>모든 상품</b>에 나타납니다. 예약 상품과 일반 상품이 섞인 몰이라면
                <b>필수는 꼭 필요한 것만</b> 지정해 주세요.<br />
                문구는 한국어로만 쓰시면 됩니다. 나머지 4개 언어는 저장 후 자동으로 채워집니다.
            </Alert>

            {list.length === 0 &&
                <Card sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    만들어 둔 서식이 없습니다. 아래 버튼으로 추가하세요.
                </Card>}

            {list.map((t, i) => (
                <Card key={t.id ?? `new-${i}`} sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontWeight: 800 }}>{t.id ? `서식 #${t.id}` : '새 서식'}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FormControlLabel
                                    control={<Switch checked={!!t.is_use} onChange={(e) => 바꾸기(i, 'is_use', e.target.checked ? 1 : 0)} />}
                                    label="사용" />
                                <Button variant="contained" onClick={() => 저장(i)}>저장</Button>
                                <IconButton onClick={() => 삭제(i)} aria-label="삭제"><Icon icon="mdi:trash-can-outline" /></IconButton>
                            </Stack>
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField label="서식 이름" value={t.name ?? ''} sx={{ width: { xs: '100%', md: 260 } }}
                                helperText="관리용입니다. 고객에게는 안 보입니다 (예: 예약·출장형)"
                                onChange={(e) => 바꾸기(i, 'name', e.target.value)} />
                            <TextField label="주문서 안내 문구" value={t.guide ?? ''} fullWidth
                                helperText="입력칸 위에 뜨는 한 줄 (예: 행사 준비를 위해 아래 내용을 알려주세요)"
                                onChange={(e) => 바꾸기(i, 'guide', e.target.value)} />
                        </Stack>

                        {/* 적용 가맹점 — 여기서 고른 몰의 주문서에만 나타난다 */}
                        <Autocomplete
                            multiple
                            options={merchants}
                            value={t.targets}
                            getOptionLabel={(o) => `${o.dns}${o.name ? ` (${o.name})` : ''}`}
                            isOptionEqualToValue={(o, v) => Number(o.id ?? o.brand_id) === Number(v.brand_id)}
                            onChange={(e, v) => 바꾸기(i, 'targets', v.map((x) => ({
                                brand_id: Number(x.id ?? x.brand_id), dns: x.dns, name: x.name,
                            })))}
                            renderInput={(params) => (
                                <TextField {...params} label="적용할 가맹점"
                                    helperText="고르지 않으면 어디에도 나타나지 않습니다" />
                            )}
                        />

                        <Divider />
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>입력 항목</Typography>
                            <Button size="small" startIcon={<Icon icon="mdi:plus" />} onClick={() => 항목추가(i)}>항목 추가</Button>
                        </Stack>
                        {t.fields.length === 0 &&
                            <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
                                항목이 하나도 없으면 주문서에 아무것도 뜨지 않습니다.
                            </Alert>}

                        {t.fields.map((f, j) => (
                            <Card key={f.id ?? `new-f-${j}`} variant="outlined" sx={{ p: 2 }}>
                                <Stack spacing={1.5}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
                                        <TextField label="항목 이름" size="small" value={f.label ?? ''} sx={{ flex: 1 }}
                                            onChange={(e) => 항목바꾸기(i, j, 'label', e.target.value)} />
                                        <TextField label="유형" size="small" select value={f.field_type ?? 'text'}
                                            sx={{ width: { xs: '100%', md: 210 } }}
                                            onChange={(e) => 항목바꾸기(i, j, 'field_type', e.target.value)}>
                                            {ORDER_FORM_TYPES.map((o) => (
                                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                            ))}
                                        </TextField>
                                        <FormControlLabel
                                            control={<Switch checked={!!f.is_required}
                                                onChange={(e) => 항목바꾸기(i, j, 'is_required', e.target.checked ? 1 : 0)} />}
                                            label="필수" />
                                        <Stack direction="row">
                                            <IconButton size="small" onClick={() => 항목이동(i, j, -1)} aria-label="위로"><Icon icon="mdi:arrow-up" /></IconButton>
                                            <IconButton size="small" onClick={() => 항목이동(i, j, 1)} aria-label="아래로"><Icon icon="mdi:arrow-down" /></IconButton>
                                            <IconButton size="small" onClick={() => 항목삭제(i, j)} aria-label="삭제"><Icon icon="mdi:close" /></IconButton>
                                        </Stack>
                                    </Stack>

                                    <TextField label="도움말" size="small" value={f.placeholder ?? ''} fullWidth
                                        helperText="입력칸 아래에 작게 보입니다"
                                        onChange={(e) => 항목바꾸기(i, j, 'placeholder', e.target.value)} />

                                    {/* 유형마다 필요한 설정만 보여준다 — 다 보여주면 무엇을 채워야 할지 알 수 없다 */}
                                    {CHOICE_TYPES.includes(f.field_type) &&
                                        <TextField label="보기 목록" size="small" multiline minRows={3} value={f.option_list ?? ''}
                                            helperText="한 줄에 하나씩 (예: 1층 / 엘리베이터 있음 / 엘리베이터 없음)"
                                            onChange={(e) => 항목바꾸기(i, j, 'option_list', e.target.value)} />}

                                    {LENGTH_TYPES.includes(f.field_type) &&
                                        <TextField label="최대 글자수" size="small" type="number" value={f.max_length ?? ''}
                                            sx={{ width: 200 }} helperText="비우면 제한 없음"
                                            onChange={(e) => 항목바꾸기(i, j, 'max_length', e.target.value)} />}

                                    {f.field_type === 'number' &&
                                        <Stack direction="row" spacing={1.5}>
                                            <TextField label="최소값" size="small" type="number" value={f.min_number ?? ''} sx={{ width: 160 }}
                                                onChange={(e) => 항목바꾸기(i, j, 'min_number', e.target.value)} />
                                            <TextField label="최대값" size="small" type="number" value={f.max_number ?? ''} sx={{ width: 160 }}
                                                onChange={(e) => 항목바꾸기(i, j, 'max_number', e.target.value)} />
                                        </Stack>}

                                    {/* 리드타임 — 출장·제작 준비 기간. 달력에서 아예 못 고르게 막는다. */}
                                    {DATE_TYPES.includes(f.field_type) &&
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'flex-start' }}>
                                            <TextField label="며칠 뒤부터 선택 가능" size="small" type="number" value={f.lead_days ?? ''}
                                                sx={{ width: 220 }}
                                                helperText="준비 기간. 7이면 오늘부터 7일 뒤부터 고를 수 있습니다"
                                                onChange={(e) => 항목바꾸기(i, j, 'lead_days', e.target.value)} />
                                            <TextField label="며칠 이내까지" size="small" type="number" value={f.max_days ?? ''}
                                                sx={{ width: 200 }} helperText="비우면 제한 없음"
                                                onChange={(e) => 항목바꾸기(i, j, 'max_days', e.target.value)} />
                                        </Stack>}

                                    {PII_TYPES.includes(f.field_type) &&
                                        <Chip size="small" color="info" variant="outlined" sx={{ alignSelf: 'flex-start' }}
                                            label="개인정보 — 암호화해서 저장됩니다" />}
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                </Card>
            ))}

            <Button variant="outlined" startIcon={<Icon icon="mdi:plus" />}
                onClick={() => setList((p) => [...p, 빈서식()])}>
                서식 추가
            </Button>
        </Stack>
    );
};

OrderFormPage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default OrderFormPage;
