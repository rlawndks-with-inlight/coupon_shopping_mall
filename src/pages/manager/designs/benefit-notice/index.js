import { useEffect, useState } from 'react';
import {
    Alert, Button, Card, Divider, IconButton, Stack, Switch, TextField, Typography, FormControlLabel,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { toast } from 'react-hot-toast';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { apiManager } from 'src/utils/api';
import ReactQuillComponent from 'src/views/manager/react-quill';
import { useSettingsContext } from 'src/components/settings';

// 상품상세 '혜택 안내' — 본사 전용 관리 화면.
//
// ⚠ 여기서 저장하면 **전 가맹점 상품상세에 동시에 반영된다.** 가맹점은 끄지 못한다.
//   그래서 화면 맨 위에 그 사실을 먼저 밝히고, 저장 버튼도 줄마다 따로 둔다
//   (한 번에 전부 저장하면 실수로 다른 줄까지 같이 나간다).
//
// 문구는 한국어로만 쓰면 된다. 저장하면 번역 대기열에 올라가 영어·일본어·중국어·
// 스페인어가 자동으로 채워진다(lang_obj). 번역이 붙기까지 몇 분 걸릴 수 있고,
// 그 사이에는 외국어 화면에도 한국어 원문이 보인다.

const 빈줄 = () => ({
    id: null,
    label: '혜택',
    summary: '',
    icon_img: '',
    popup_title: '',
    sort: 0,
    is_show: 1,
    tabs: [],
});

const BenefitNoticePage = () => {
    const { themeDnsData } = useSettingsContext();
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);

    useEffect(() => {
        settingPage();
    }, []);

    const settingPage = async () => {
        const data = await apiManager('benefit-notices', 'list', {});
        setList((data?.content ?? []).map((n) => ({ ...n, tabs: n?.tabs ?? [] })));
        setLoading(false);
    };

    const 바꾸기 = (idx, key, value) => {
        setList((prev) => prev.map((n, i) => (i === idx ? { ...n, [key]: value } : n)));
    };

    const 탭바꾸기 = (idx, tabIdx, key, value) => {
        setList((prev) => prev.map((n, i) => {
            if (i !== idx) return n;
            const tabs = n.tabs.map((t, j) => (j === tabIdx ? { ...t, [key]: value } : t));
            return { ...n, tabs };
        }));
    };

    const 탭추가 = (idx) => {
        setList((prev) => prev.map((n, i) => (
            i === idx ? { ...n, tabs: [...n.tabs, { id: null, tab_title: '', tab_content: '' }] } : n
        )));
    };

    const 탭삭제 = (idx, tabIdx) => {
        setList((prev) => prev.map((n, i) => (
            i === idx ? { ...n, tabs: n.tabs.filter((t, j) => j !== tabIdx) } : n
        )));
    };

    const 탭이동 = (idx, tabIdx, 방향) => {
        setList((prev) => prev.map((n, i) => {
            if (i !== idx) return n;
            const tabs = [...n.tabs];
            const to = tabIdx + 방향;
            if (to < 0 || to >= tabs.length) return n;
            [tabs[tabIdx], tabs[to]] = [tabs[to], tabs[tabIdx]];
            return { ...n, tabs };
        }));
    };

    const 저장 = async (idx) => {
        const n = list[idx];
        if (!String(n.summary ?? '').trim()) {
            toast.error('요약 문구를 입력해 주세요. 상품상세에 이 글이 보입니다.');
            return;
        }
        // 제목 없는 탭은 서버가 버린다 — 저장하기 전에 미리 알린다.
        if (n.tabs.some((t) => !String(t.tab_title ?? '').trim())) {
            toast.error('탭 이름이 비어 있습니다. 비워 두면 그 탭은 저장되지 않습니다.');
            return;
        }
        const payload = {
            label: n.label, summary: n.summary, icon_img: n.icon_img,
            popup_title: n.popup_title, sort: Number(n.sort) || 0,
            is_show: n.is_show ? 1 : 0, tabs: n.tabs,
        };
        const result = n.id
            ? await apiManager('benefit-notices', 'update', { ...payload, id: n.id })
            : await apiManager('benefit-notices', 'create', payload);
        if (result) {
            toast.success('저장했습니다. 전 가맹점 상품상세에 반영됩니다.');
            settingPage();
        }
    };

    const 삭제 = async (idx) => {
        const n = list[idx];
        if (!n.id) { // 아직 저장 전이면 화면에서만 뺀다
            setList((prev) => prev.filter((x, i) => i !== idx));
            return;
        }
        if (!window.confirm('이 줄을 삭제하면 전 가맹점 상품상세에서 즉시 사라집니다. 삭제할까요?')) return;
        const result = await apiManager('benefit-notices', 'delete', { id: n.id });
        if (result) {
            toast.success('삭제했습니다.');
            settingPage();
        }
    };

    if (themeDnsData?.is_main_dns != 1) {
        return <Alert severity="warning">본사 계정에서만 사용할 수 있는 화면입니다.</Alert>;
    }
    if (loading) return <></>;

    return (
        <Stack spacing={2}>
            <Alert severity="warning" sx={{ fontSize: '0.85rem' }}>
                여기서 저장하면 <b>전 가맹점 상품상세 화면에 동시에 반영</b>됩니다. 가맹점은 끄거나 고칠 수 없습니다.<br />
                무이자 할부 같은 <b>결제 행사는 결제사(PG) 계약에 따라 실제 적용 여부가 갈립니다.</b> 확인된 내용만 올려 주세요.<br />
                문구는 한국어로만 쓰시면 됩니다 — 영어·일본어·중국어·스페인어는 저장 후 몇 분 안에 자동으로 채워집니다.
            </Alert>

            {list.length === 0 &&
                <Card sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    등록된 혜택 안내가 없습니다. 아래 버튼으로 추가하세요.
                </Card>}

            {list.map((n, idx) => (
                <Card key={n.id ?? `new-${idx}`} sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontWeight: 800 }}>
                                {n.id ? `혜택 줄 #${n.id}` : '새 혜택 줄'}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FormControlLabel
                                    control={<Switch checked={!!n.is_show} onChange={(e) => 바꾸기(idx, 'is_show', e.target.checked ? 1 : 0)} />}
                                    label="노출"
                                />
                                <Button variant="contained" onClick={() => 저장(idx)}>저장</Button>
                                <IconButton onClick={() => 삭제(idx)} aria-label="삭제"><Icon icon="mdi:trash-can-outline" /></IconButton>
                            </Stack>
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                label="라벨" value={n.label ?? ''} sx={{ width: { xs: '100%', md: 140 } }}
                                helperText="왼쪽에 붙는 말 (예: 혜택)"
                                onChange={(e) => 바꾸기(idx, 'label', e.target.value)} />
                            <TextField
                                label="요약 문구" value={n.summary ?? ''} fullWidth
                                helperText="상품상세에 보이는 한 줄 (예: 최대 12개월 무이자 할부)"
                                onChange={(e) => 바꾸기(idx, 'summary', e.target.value)} />
                            <TextField
                                label="순서" type="number" value={n.sort ?? 0} sx={{ width: { xs: '100%', md: 100 } }}
                                helperText="작을수록 위"
                                onChange={(e) => 바꾸기(idx, 'sort', e.target.value)} />
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                            <TextField
                                label="팝업 제목" value={n.popup_title ?? ''} fullWidth
                                helperText="비우면 라벨을 그대로 씁니다 (예: 카드 혜택 안내)"
                                onChange={(e) => 바꾸기(idx, 'popup_title', e.target.value)} />
                            <TextField
                                label="아이콘 이미지 주소" value={n.icon_img ?? ''} fullWidth
                                helperText="요약 문구 앞에 붙는 작은 이미지(선택). 비워도 됩니다"
                                onChange={(e) => 바꾸기(idx, 'icon_img', e.target.value)} />
                        </Stack>

                        <Divider />
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>팝업 내용</Typography>
                            <Button size="small" startIcon={<Icon icon="mdi:plus" />} onClick={() => 탭추가(idx)}>탭 추가</Button>
                        </Stack>
                        {/* 탭이 하나도 없으면 고객 화면에서 눌러도 아무 일이 없다 — 화면에도 그렇게 알린다 */}
                        {n.tabs.length === 0 &&
                            <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                                탭이 없으면 상품상세에 글만 보이고 눌러도 팝업이 열리지 않습니다.
                            </Alert>}
                        {n.tabs.map((tab, tabIdx) => (
                            <Card key={tab.id ?? `new-tab-${tabIdx}`} variant="outlined" sx={{ p: 2 }}>
                                <Stack spacing={1.5}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <TextField
                                            label="탭 이름" size="small" value={tab.tab_title ?? ''} fullWidth
                                            onChange={(e) => 탭바꾸기(idx, tabIdx, 'tab_title', e.target.value)} />
                                        <IconButton size="small" onClick={() => 탭이동(idx, tabIdx, -1)} aria-label="위로"><Icon icon="mdi:arrow-up" /></IconButton>
                                        <IconButton size="small" onClick={() => 탭이동(idx, tabIdx, 1)} aria-label="아래로"><Icon icon="mdi:arrow-down" /></IconButton>
                                        <IconButton size="small" onClick={() => 탭삭제(idx, tabIdx)} aria-label="탭 삭제"><Icon icon="mdi:close" /></IconButton>
                                    </Stack>
                                    {/* 이미지를 붙여 넣으면 자동으로 업로드된다(에디터가 처리). 카드사 로고를 여기에 넣는다. */}
                                    <ReactQuillComponent
                                        value={tab.tab_content ?? ''}
                                        setValue={(v) => 탭바꾸기(idx, tabIdx, 'tab_content', v)}
                                    />
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                </Card>
            ))}

            <Button
                variant="outlined"
                startIcon={<Icon icon="mdi:plus" />}
                onClick={() => setList((prev) => [...prev, { ...빈줄(), sort: prev.length }])}
            >
                혜택 줄 추가
            </Button>
        </Stack>
    );
};

BenefitNoticePage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default BenefitNoticePage;
