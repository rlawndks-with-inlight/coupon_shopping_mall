import { useMemo, useState } from 'react';
import {
    Box, Dialog, DialogContent, DialogTitle, IconButton, Tab, Tabs, useMediaQuery,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';

// 상품상세 '혜택 안내' — 가격 아래 한 줄, 누르면 팝업.
//
// 내용은 **본사가 한 곳에서** 넣고 전 가맹점에 그대로 나간다(가맹점은 끄지 못한다).
// 무이자 할부 같은 행사는 결제사 계약에 딸린 것이라 몰마다 다르면 안 되기 때문이다.
//
// ⚠ 이 컴포넌트는 프레임 6개(쇼핑몰형2 · 블로그형2 · 랜딩형2)에 그대로 들어간다.
//   프레임마다 스타일 체계가 다르다 — 프레임1·2는 MUI, 3~6은 themeObj.font_size 와
//   인라인 스타일이다. 그래서 여기서는 **색·글자크기를 스스로 정하지 않는다.**
//   기본값은 눈에 안 띄는 회색 계열이고, 프레임이 tone 으로 덮어쓴다.
//   (색을 여기에 박으면 어두운 프레임에서 글자가 사라진다)
//
// 비어 있으면 아무것도 그리지 않는다. 본사가 아직 안 넣었거나 다른 클라이언트 몰이면
// 목록이 비는데, 그때 빈 줄이 남으면 가격 아래 여백만 늘어난다.

const 기본톤 = {
    labelColor: '#888',
    textColor: '#333',
    fontSize: 13,
    labelWidth: 52,
    gap: 10,
    rowGap: 6,
};

export const useBenefitNotices = () => {
    const { themeBenefitNotices, themeBenefitNoticeTabs } = useSettingsContext();
    return useMemo(() => {
        const notices = Array.isArray(themeBenefitNotices) ? themeBenefitNotices : [];
        const tabs = Array.isArray(themeBenefitNoticeTabs) ? themeBenefitNoticeTabs : [];
        return notices.map((n) => ({
            ...n,
            tabs: tabs.filter((t) => Number(t?.notice_id) === Number(n?.id)),
        }));
    }, [themeBenefitNotices, themeBenefitNoticeTabs]);
};

const BenefitNotice = ({ tone = {}, sx = {} }) => {
    const { translate, currentLang } = useLocales();
    const { themeDnsData } = useSettingsContext();
    const list = useBenefitNotices();
    const [openId, setOpenId] = useState(null);
    const [tabIdx, setTabIdx] = useState(0);
    const fullScreen = useMediaQuery('(max-width:600px)');

    const t = { ...기본톤, ...tone };
    const open = list.find((n) => n.id === openId);

    // 배송 안내(가맹점별). 관리자 '설정관리 › 배송비설정' 탭에서 setting_obj.delivery_info 로 저장한다.
    // 혜택(본사 공통) 바로 아래에 렌더한다. Quill 빈 값(<p><br></p>·&nbsp;)은 없는 것으로 본다.
    const deliveryHtml = themeDnsData?.setting_obj?.delivery_info ?? '';
    const hasDelivery = /<img/i.test(deliveryHtml)
        || deliveryHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim().length > 0;

    // 혜택도 없고 배송 안내도 없으면 아무것도 그리지 않는다(가격 아래 빈 여백 방지).
    if (!(list.length > 0) && !hasDelivery) return null;

    const 열기 = (n) => {
        if (!(n?.tabs?.length > 0)) return; // 볼 내용이 없으면 누를 것도 없다
        setTabIdx(0);
        setOpenId(n.id);
    };

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', rowGap: `${t.rowGap}px`, ...sx }}>
                {list.map((n) => {
                    const 누를수있음 = n?.tabs?.length > 0;
                    return (
                        <Box
                            key={n.id}
                            onClick={() => 열기(n)}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                columnGap: `${t.gap}px`,
                                fontSize: `${t.fontSize}px`,
                                lineHeight: 1.6,
                                cursor: 누를수있음 ? 'pointer' : 'default',
                                // 모바일에서 손가락으로 누를 수 있는 최소 높이
                                minHeight: 누를수있음 ? 24 : 'auto',
                            }}
                        >
                            <Box sx={{ color: t.labelColor, flex: `0 0 ${t.labelWidth}px`, whiteSpace: 'nowrap' }}>
                                {formatLang(n, 'label', currentLang)}
                            </Box>
                            <Box sx={{ color: t.textColor, display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: '6px', minWidth: 0 }}>
                                {n?.icon_img ? (
                                    <Box
                                        component="img"
                                        src={n.icon_img}
                                        alt=""
                                        sx={{ height: 16, width: 'auto', verticalAlign: 'middle' }}
                                    />
                                ) : null}
                                <Box component="span" sx={{ wordBreak: 'keep-all' }}>
                                    {formatLang(n, 'summary', currentLang)}
                                </Box>
                                {누를수있음 ? (
                                    <Icon icon="mdi:chevron-right" width={16} height={16} style={{ flexShrink: 0, opacity: 0.6 }} />
                                ) : null}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* 배송 안내(가맹점별) — 혜택 바로 아래. 톤(색·글자크기)은 프레임이 준 값을 그대로 따른다. */}
            {hasDelivery ? (
                <Box
                    sx={{
                        mt: list.length > 0 ? `${t.rowGap + 4}px` : 0,
                        fontSize: `${t.fontSize}px`,
                        color: t.textColor,
                        lineHeight: 1.7,
                        wordBreak: 'keep-all',
                        '& img': { maxWidth: '100%', height: 'auto' },
                        '& p': { margin: '0 0 4px' },
                        '& table': { width: '100%', borderCollapse: 'collapse' },
                    }}
                    dangerouslySetInnerHTML={{ __html: deliveryHtml }}
                />
            ) : null}

            {/* 팝업. 약관 보기 팝업과 같은 방식이라 6개 프레임 위에서 동작이 검증돼 있다.
                폭이 sm(600px) 이라 이미지를 넣으면 그만큼 줄어들어 글씨가 뭉개져 보였다
                (가맹점 피드백 2026-08-21). 안내문 한 장이 들어갈 만큼 md 로 넓혔다. */}
            <Dialog
                open={!!open}
                onClose={() => setOpenId(null)}
                maxWidth="md"
                fullWidth
                fullScreen={fullScreen}
                scroll="paper"
                PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 2, maxHeight: fullScreen ? '100%' : '85vh' } }}
            >
                {open ? (
                    <>
                        <DialogTitle sx={{ pr: 6, fontSize: 18, fontWeight: 800 }}>
                            {formatLang(open, 'popup_title', currentLang) || formatLang(open, 'label', currentLang)}
                            <IconButton
                                onClick={() => setOpenId(null)}
                                aria-label={translate('닫기')}
                                sx={{ position: 'absolute', right: 8, top: 8 }}
                            >
                                <Icon icon="mdi:close" />
                            </IconButton>
                        </DialogTitle>
                        {/* 탭이 하나뿐이면 막대를 감춘다 — 고를 것이 없는데 탭만 보이면 군더더기다 */}
                        {open.tabs.length > 1 ? (
                            <Tabs
                                value={Math.min(tabIdx, open.tabs.length - 1)}
                                onChange={(e, v) => setTabIdx(v)}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ px: 2, borderBottom: '1px solid #eee', minHeight: 44 }}
                            >
                                {open.tabs.map((tab) => (
                                    <Tab
                                        key={tab.id}
                                        label={formatLang(tab, 'tab_title', currentLang)}
                                        sx={{ fontWeight: 700, minHeight: 44 }}
                                    />
                                ))}
                            </Tabs>
                        ) : null}
                        <DialogContent dividers={open.tabs.length <= 1}>
                            {/* 본문은 본사 관리자(레벨50)가 Quill 로 쓴 HTML 이다.
                                이미지가 팝업 폭을 넘지 않게 막아 둔다 — 카드사 로고를 큰 원본으로
                                올리면 그대로 가로 스크롤이 생긴다. */}
                            {/* 이미지를 누르면 원본을 새 창으로 연다 — 팝업을 아무리 넓혀도
                                원본이 더 큰 안내문은 있기 마련이라, 크게 볼 길을 하나 둔다.
                                본문이 HTML 이라 각 img 에 핸들러를 달 수 없어 위임으로 받는다. */}
                            <Box
                                onClick={(e) => {
                                    const el = e.target;
                                    if (el?.tagName === 'IMG' && el?.src) window.open(el.src, '_blank', 'noopener,noreferrer');
                                }}
                                sx={{
                                    fontSize: 14,
                                    lineHeight: 1.75,
                                    wordBreak: 'keep-all',
                                    '& img': { maxWidth: '100%', height: 'auto', cursor: 'zoom-in' },
                                    '& table': { width: '100%', borderCollapse: 'collapse' },
                                    '& p': { margin: '0 0 8px' },
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: formatLang(open.tabs[Math.min(tabIdx, open.tabs.length - 1)], 'tab_content', currentLang) ?? '',
                                }}
                            />
                        </DialogContent>
                    </>
                ) : null}
            </Dialog>
        </>
    );
};

export default BenefitNotice;
