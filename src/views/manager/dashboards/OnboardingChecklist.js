import { useMemo, useState } from 'react';
import { Card, Box, Stack, Typography, Button, LinearProgress, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';

// 신규 가맹점 온보딩 체크리스트 — 대시보드 상단.
// 완료 여부는 이미 로드된 데이터로 자동 감지. 필수(카테고리·상품·결제) 완료 시 자동으로 사라짐.
// '닫기' 시 setting_obj.onboarding_dismissed 저장(서버·매장 공유) → 이후 미노출.
const OnboardingChecklist = () => {
  const router = useRouter();
  const { themeDnsData, themeCategoryList } = useSettingsContext();
  const [hidden, setHidden] = useState(false);

  const dns = themeDnsData ?? {};
  const so = dns.setting_obj ?? {};
  const isShop = Number(dns.shop_demo_num) > 0;
  const isBlog = Number(dns.blog_demo_num) > 0;

  const catDone = (themeCategoryList ?? []).some((g) => (g?.product_categories?.length ?? 0) > 0);
  const catRoute = (themeCategoryList ?? [])[0]?.id
    ? `/manager/products/categories/${(themeCategoryList ?? [])[0]?.id}`
    : '/manager/products/category-groups';

  const steps = useMemo(() => {
    const settingRoute = `/manager/settings/default/${dns?.id}`;
    const list = [
      { key: 'basic', label: '쇼핑몰 기본정보 (상호·로고)', tag: '권장', done: !!dns?.logo_img, route: settingRoute },
      { key: 'company', label: '회사·판매자 정보', tag: '권장', done: !!dns?.company_name, route: settingRoute },
      { key: 'delivery', label: '배송비 설정', tag: '권장', note: '미설정 시 무료배송', done: Number(so?.delivery_fee_default) > 0 || Number(so?.free_ship_min) > 0, route: settingRoute },
      { key: 'category', label: '카테고리 등록', tag: '필수', required: true, done: catDone, route: catRoute },
      { key: 'product', label: '상품 등록', tag: '필수', required: true, done: (dns?.products?.length ?? 0) > 0, route: '/manager/products/list', note: catDone ? '' : '카테고리를 먼저 등록하세요' },
      ...(isBlog ? [{ key: 'featured', label: '대표 상품 지정 (단일·소수 상품 데모)', tag: '권장', done: (so?.featured_product_ids?.length ?? 0) > 0, route: settingRoute }] : []),
      { key: 'payment', label: '결제수단 연결', tag: '필수', required: true, hqManaged: true, done: (dns?.payment_modules?.length ?? 0) > 0 },
      { key: 'design', label: '메인페이지 꾸미기', tag: '권장', done: ((dns?.shop_obj?.length ?? 0) + (dns?.blog_obj?.length ?? 0)) > 0, route: isBlog && !isShop ? '/manager/designs/blog-main/all' : '/manager/designs/main/all' },
    ];
    return list;
  }, [dns, so, themeCategoryList, catDone, catRoute, isBlog, isShop]);

  const doneCount = steps.filter((s) => s.done).length;
  const requiredAllDone = steps.filter((s) => s.required).every((s) => s.done);
  const dismissed = so?.onboarding_dismissed == 1;

  // 필수(판매 준비) 완료 or 닫기 or 이전 닫기 이력 → 미노출
  if (hidden || dismissed || requiredAllDone) return null;
  // 마스터(shopgo 본사)는 대상 아님
  if (dns?.is_main_dns == 1) return null;

  const onDismiss = () => {
    setHidden(true);
    apiManager('brands', 'update', {
      id: dns?.id,
      setting_obj: { ...so, onboarding_dismissed: 1 },
    }).catch(() => {});
  };

  const mainColor = dns?.theme_css?.main_color || '#2e7d32';

  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2, borderColor: '#e0e0e0' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 800 }}>🚀 쇼핑몰 오픈 준비</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: 13, color: '#888' }}>{doneCount}/{steps.length} 완료</Typography>
          <IconButton size="small" onClick={onDismiss} aria-label="닫기">
            <Icon icon="mdi:close" fontSize="1.1rem" />
          </IconButton>
        </Stack>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={Math.round((doneCount / steps.length) * 100)}
        sx={{ height: 6, borderRadius: 3, mb: 1.5, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: mainColor } }}
      />

      <Stack divider={<Box sx={{ borderTop: '1px solid #f2f2f2' }} />}>
        {steps.map((s) => {
          const statusIcon = s.done
            ? { icon: 'mdi:check-circle', color: mainColor }
            : s.hqManaged
              ? { icon: 'mdi:progress-clock', color: '#f0a020' }
              : { icon: 'mdi:checkbox-blank-circle-outline', color: '#ccc' };
          return (
            <Stack key={s.key} direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                <Icon icon={statusIcon.icon} color={statusIcon.color} width={20} height={20} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: s.done ? 400 : 600, color: s.done ? '#999' : '#222', textDecoration: s.done ? 'line-through' : 'none' }}>
                    <Box component="span" sx={{ fontSize: 11, fontWeight: 700, color: s.tag === '필수' ? '#d33' : '#aaa', mr: 0.75 }}>[{s.tag}]</Box>
                    {s.label}
                  </Typography>
                  {!s.done && s.note && (
                    <Typography sx={{ fontSize: 11, color: '#f0a020' }}>{s.note}</Typography>
                  )}
                </Box>
              </Stack>
              {s.done ? (
                <Typography sx={{ fontSize: 12, color: mainColor, whiteSpace: 'nowrap', pl: 1 }}>완료</Typography>
              ) : s.hqManaged ? (
                <Typography sx={{ fontSize: 12, color: '#f0a020', whiteSpace: 'nowrap', pl: 1 }}>본사 연결 대기중</Typography>
              ) : (
                <Button size="small" variant="outlined" onClick={() => router.push(s.route)} sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                  바로가기
                </Button>
              )}
            </Stack>
          );
        })}
      </Stack>

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #e5e5e5' }}>
        <Typography sx={{ fontSize: 13 }}>
          <Box component="span" sx={{ fontWeight: 700 }}>판매 준비: </Box>
          <Box component="span" sx={{ color: '#d33', fontWeight: 700 }}>아직</Box>
          <Box component="span" sx={{ color: '#888' }}> — 카테고리·상품·결제수단이 모두 완료되면 판매가 시작됩니다.</Box>
        </Typography>
      </Box>
    </Card>
  );
};

export default OnboardingChecklist;
