import { useEffect, useMemo, useState } from 'react';
import { Card, Box, Stack, Typography, Button, LinearProgress, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';
import { useSettingsContext } from 'src/components/settings';
import { useModal } from 'src/components/dialog/ModalProvider';
import { apiManager } from 'src/utils/api';
import { isShopgoMerchant } from 'src/utils/is-shopgo';
import { HOME_TEXT_SCHEMA } from 'src/data/home-texts';

// 신규 가맹점 온보딩 체크리스트 — 대시보드 상단.
// 완료 여부는 이미 로드된 데이터로 자동 감지(표시용). 필수 완료로 "자동으로 사라지지는 않음".
// 사용자가 '닫기'(X) → 2차 확인 후에만 setting_obj.onboarding_dismissed 저장(서버·매장 공유) → 이후 미노출.
const OnboardingChecklist = () => {
  const router = useRouter();
  const { setModal } = useModal();
  const { themeDnsData, themeCategoryList } = useSettingsContext();
  const [hidden, setHidden] = useState(false);

  const dns = themeDnsData ?? {};
  const so = dns.setting_obj ?? {};
  const isShop = Number(dns.shop_demo_num) > 0;
  const isBlog = Number(dns.blog_demo_num) > 0;
  // 대표 상품 지정은 단일/소수 상품 데모(블로그 4~9, useFeaturedProduct 사용)만 해당.
  // 섹션 빌더형(블로그 1·2·3)은 blog_obj로 상품 배치 → 대표상품 무관.
  const isSingleProductBlog = [4, 5, 6, 7, 8, 9].includes(Number(dns.blog_demo_num));
  // 메인페이지관리(섹션 편집)가 존재하는 데모인지. 고정 레이아웃 데모는 편집 대상이 없으므로
  // '메인페이지 꾸미기'를 띄우면 영영 미완료로 남고 클릭해도 메뉴가 없다. → 홈 문구로 대체.
  // shop 4·5·6·9는 HomeDemo1을 감싸는 구조라 shop_obj를 쓴다(= 섹션빌더). shop 7·8·10, blog 4~9는 고정 레이아웃.
  const isSectionBuilder = [1, 2, 3, 4, 5, 6, 9].includes(Number(dns.shop_demo_num))
    || [1, 2, 3].includes(Number(dns.blog_demo_num));
  const hasHomeTexts = Object.keys(HOME_TEXT_SCHEMA).map(Number).includes(Number(dns.blog_demo_num));

  // '상품 등록' 완료 여부는 상품 목록 API 로 직접 센다.
  //
  // 예전엔 themeDnsData.products 를 봤는데 그 값은 채워지지 않는다
  // (디자인관리 › 대표 상품의 후보 목록이 늘 비어 있던 것과 같은 원인이다).
  // 그래서 상품을 아무리 등록해도 '상품 등록'이 미완료로 남고 '판매 준비: 아직'이
  // 영영 고정됐다 — 체크리스트가 끝나지 않으니 신규 가맹점은 뭘 더 해야 하는지 알 수 없었다.
  //
  // null = 아직 확인 전(완료로 치지 않는다). 목록은 1건만 받아 개수만 본다.
  const [productCount, setProductCount] = useState(null);
  useEffect(() => {
    let alive = true;
    // 체크리스트가 뜨지 않는 브랜드에서는 굳이 부르지 않는다(아래 early return 과 같은 조건).
    if (!dns?.id || !isShopgoMerchant(dns) || so?.onboarding_dismissed == 1) return;
    (async () => {
      const result = await apiManager('products', 'list', { page: 1, page_size: 1 });
      if (!alive || !result) return;
      setProductCount(Number(result?.total ?? result?.content?.length ?? 0) || 0);
    })();
    return () => { alive = false; };
  }, [dns?.id, so?.onboarding_dismissed]);

  const catDone = (themeCategoryList ?? []).some((g) => (g?.product_categories?.length ?? 0) > 0);
  // 마이그레이션 브랜드는 합성 그룹 id=0(falsy) 이므로 존재 여부로 판단(?? 0 로 0 도 유효 라우팅).
  const catRoute = (themeCategoryList ?? [])[0]
    ? `/manager/products/categories/${(themeCategoryList ?? [])[0]?.id ?? 0}`
    : '/manager/products/category-groups';

  const steps = useMemo(() => {
    const settingRoute = `/manager/settings/default/${dns?.id}`;
    const list = [
      { key: 'basic', label: '쇼핑몰 기본정보 (상호·로고)', tag: '권장', done: !!dns?.logo_img, route: settingRoute },
      { key: 'company', label: '회사·판매자 정보', tag: '권장', done: !!dns?.company_name, route: settingRoute },
      { key: 'delivery', label: '배송비 설정', tag: '권장', note: '미설정 시 무료배송', done: Number(so?.delivery_fee_default) > 0 || Number(so?.free_ship_min) > 0, route: settingRoute },
      { key: 'category', label: '카테고리 등록', tag: '필수', required: true, done: catDone, route: catRoute },
      { key: 'product', label: '상품 등록', tag: '필수', required: true, done: (productCount ?? 0) > 0, route: '/manager/products/list', note: catDone ? '' : '카테고리를 먼저 등록하세요' },
      ...(isSingleProductBlog ? [{ key: 'featured', label: '대표 상품 지정', tag: '조건부', done: (so?.featured_product_ids?.length ?? 0) > 0, route: '/manager/designs/featured' }] : []),
      { key: 'payment', label: '결제수단 연결', tag: '필수', required: true, hqManaged: true, done: (dns?.payment_modules?.length ?? 0) > 0 },
      ...(isSectionBuilder ? [{ key: 'design', label: '메인페이지 꾸미기', tag: '권장', done: ((dns?.shop_obj?.length ?? 0) + (dns?.blog_obj?.length ?? 0)) > 0, route: isBlog && !isShop ? '/manager/designs/blog-main/all' : '/manager/designs/main/all' }] : []),
      ...(!isSectionBuilder && hasHomeTexts ? [{ key: 'home-texts', label: '홈 화면 문구 작성', tag: '권장', note: '미입력 시 기본 문구', done: Object.keys(so?.home_texts ?? {}).length > 0, route: '/manager/designs/home-texts' }] : []),
    ];
    return list;
  }, [dns, so, themeCategoryList, catDone, catRoute, isBlog, isShop, isSingleProductBlog, isSectionBuilder, hasHomeTexts, productCount]);

  const doneCount = steps.filter((s) => s.done).length;
  const requiredAllDone = steps.filter((s) => s.required).every((s) => s.done);
  const dismissed = so?.onboarding_dismissed == 1;

  // 닫기(X→2차확인) 또는 이전 닫기 이력 → 미노출. (필수 완료로는 자동으로 사라지지 않음)
  if (hidden || dismissed) return null;
  // SHOPGO 산하 가맹점만 대상 (본사·타 클라이언트 브랜드 제외)
  if (!isShopgoMerchant(dns)) return null;

  const doDismiss = () => {
    setHidden(true);
    apiManager('brands', 'update', {
      id: dns?.id,
      setting_obj: { ...so, onboarding_dismissed: 1 },
    }).catch(() => {});
  };
  // X 클릭 → 2차 확인 후에만 영구 숨김
  const onDismiss = () => {
    setModal({
      func: () => doDismiss(),
      icon: 'mdi:close-circle-outline',
      title: '이 안내를 닫으시겠어요? 닫으면 다시 표시되지 않습니다.',
    });
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
                  {/* 완료 항목은 취소선 대신 색만 옅게 — 취소선은 '더는 못 고친다'는 인상을 준다. */}
                  <Typography sx={{ fontSize: 14, fontWeight: s.done ? 400 : 600, color: s.done ? '#9a9aa2' : '#222' }}>
                    <Box component="span" sx={{ fontSize: 11, fontWeight: 700, color: s.tag === '필수' ? '#d33' : '#aaa', mr: 0.75 }}>[{s.tag}]</Box>
                    {s.label}
                  </Typography>
                  {!s.done && s.note && (
                    <Typography sx={{ fontSize: 11, color: '#f0a020' }}>{s.note}</Typography>
                  )}
                </Box>
              </Stack>
              {/* 완료 항목도 '완료' 표시는 유지하되 수정 버튼을 함께 둔다.
                  기존엔 완료되면 버튼이 사라져 배송비·회사정보 등을 다시 고치러 갈 길이 막혔다.
                  본사가 처리하는 항목(결제수단)은 가맹점이 손댈 수 없으므로 버튼 없이 상태만 표시. */}
              {s.hqManaged && !s.done ? (
                <Typography sx={{ fontSize: 12, color: '#f0a020', whiteSpace: 'nowrap', pl: 1 }}>본사 연결 대기중</Typography>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 1 }}>
                  {s.done && (
                    <Typography sx={{ fontSize: 12, color: mainColor, whiteSpace: 'nowrap' }}>완료</Typography>
                  )}
                  {s.route && (
                    <Button size="small" variant="outlined" onClick={() => router.push(s.route)} sx={{ whiteSpace: 'nowrap' }}>
                      {s.done ? '수정' : '바로가기'}
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          );
        })}
      </Stack>

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #e5e5e5' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontSize: 13 }}>
            <Box component="span" sx={{ fontWeight: 700 }}>판매 준비: </Box>
            {requiredAllDone ? (
              <>
                <Box component="span" sx={{ color: mainColor, fontWeight: 700 }}>완료</Box>
                <Box component="span" sx={{ color: '#888' }}> — 판매를 시작할 수 있어요. 이 안내는 우측 상단 ✕로 닫을 수 있습니다.</Box>
              </>
            ) : (
              <>
                <Box component="span" sx={{ color: '#d33', fontWeight: 700 }}>아직</Box>
                <Box component="span" sx={{ color: '#888' }}> — 카테고리·상품·결제수단이 모두 완료되면 판매가 시작됩니다.</Box>
              </>
            )}
          </Typography>
          <Button size="small" onClick={() => router.push('/manager/guide')} sx={{ whiteSpace: 'nowrap' }} startIcon={<Icon icon="mdi:book-open-variant" />}>
            이용가이드
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

export default OnboardingChecklist;
