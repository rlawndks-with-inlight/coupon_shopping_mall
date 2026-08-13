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

// 손님 입력항목 **서식 템플릿** — 본사 마스터 전용.
//
// ⚠ 이 화면에서 만든 것은 그 자체로는 어느 몰에도 안 뜬다. 만들어 두면
//   가맹점이 상품등록 화면에서 '서식 불러오기'로 **복사해** 쓴다.
//
// 왜 바뀌었나: 처음에는 여기서 가맹점을 고르면 그 몰 전체에 입력칸이 붙었다.
// 행사날짜는 가맹점의 성질이 아니라 상품의 성질이라, 같은 몰에서 답례품만 사는
// 손님에게도 행사날짜를 묻는 문제가 있었다. 그래서 실제 적용은 상품 단위로 옮기고,
// 이 화면은 '상품 100개에 같은 항목을 손으로 넣지 않게 해주는' 템플릿으로 남겼다.
//
// 복사한 뒤에는 상품의 것이다 — 여기서 템플릿을 고쳐도 이미 판매 중인 상품은 안 바뀐다.
// (바뀌면 이미 접수된 주문과 뜻이 어긋난다)

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

    // 가맹점을 고르는 흐름이 사라졌다 — 서식은 이제 어느 몰에도 직접 걸리지 않는 '틀'이고,
    // 실제 적용은 가맹점이 상품등록 화면에서 불러올 때 일어난다.
    // (가맹점 현황의 '?brand=' 딥링크도 함께 뺐다. 몰을 골라도 아무 일이 없으므로)

    useEffect(() => { if (router.isReady) settingPage(); }, [router.isReady]);

    const settingPage = async () => {
        const data = await apiManager('order-forms', 'list', {});
        setList((data?.content ?? []).map((t) => ({
            ...t,
            fields: t?.fields ?? [],
            targets: (t?.targets ?? []).map((x) => ({ brand_id: x.brand_id, dns: x.dns, name: x.brand_name })),
        })));
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
                예약·출장처럼 <b>주문받을 때 더 물어봐야 하는 업체</b>를 위한 <b>서식 템플릿</b>입니다.<br />
                <b>여기서 만든 것만으로는 어느 몰에도 나타나지 않습니다.</b> 가맹점이 상품등록 화면의
                [옵션] → &lsquo;손님이 적는 항목&rsquo;에서 <b>서식 불러오기</b>로 가져다 씁니다.
                상품 100개에 행사날짜를 하나씩 손으로 넣지 않게 해주는 것이 이 화면의 역할입니다.<br />
                불러온 뒤에는 <b>그 상품의 것</b>입니다 — 여기서 템플릿을 고쳐도 이미 판매 중인 상품은 바뀌지 않습니다.
                (바뀌면 이미 접수된 주문과 뜻이 어긋납니다)<br />
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

                        {/* 몰을 지정하는 칸을 뺐다.
                            적용은 이제 가맹점이 상품마다 하므로 여기서 골라 봐야 아무 일도 일어나지 않는다.
                            효과 없는 칸을 남겨 두면 '분명히 지정했는데 왜 안 뜨냐'는 문의가 된다.
                            (order_form_targets 테이블은 그대로 둔다 — 지우면 되돌릴 수 없다) */}

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
