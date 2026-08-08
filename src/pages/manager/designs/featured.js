import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { Container, Card, Stack, Typography, Button, Autocomplete, TextField, Avatar, Alert, CircularProgress } from '@mui/material';
import { toast } from 'react-hot-toast';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import { commarNumber } from 'src/utils/function';

// 단일/소수 상품 데모(블로그 4~9)용 대표 상품 지정 — 가맹점이 디자인관리에서 직접 설정.
// setting_obj.featured_product_ids에 저장(+ 하위호환 featured_product_id 미러).
const FEATURED_BLOG_DEMOS = [4, 5, 6, 7, 8, 9];

// 후보 목록을 한 번에 불러오는 개수. 대부분의 가맹점은 이 안에 다 들어오고,
// 넘치면 아래 서버 검색(디바운스)으로 보충한다.
const OPTION_PAGE_SIZE = 200;

// 비공개(status=5) 상품은 고객 화면 조회(shop/product/:id)에서 걸러지므로
// 대표상품으로 지정해도 홈이 '준비중'으로 남는다 → 후보에서 아예 제외한다.
const isSelectable = (p) => p?.id > 0 && p?.status != 5;

const mergeById = (base = [], add = []) => {
  const merged = [...base];
  add.forEach((p) => {
    if (!merged.some((m) => String(m?.id) === String(p?.id))) merged.push(p);
  });
  return merged;
};

const FeaturedProductPage = () => {
  const { themeDnsData } = useSettingsContext();
  const so = themeDnsData?.setting_obj ?? {};
  const isSingleProductBlog = FEATURED_BLOG_DEMOS.includes(Number(themeDnsData?.blog_demo_num));

  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState([]);
  const [loadedAll, setLoadedAll] = useState(true); // 첫 페이지에 브랜드 상품이 전부 담겼는지
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [saving, setSaving] = useState(false);

  // 저장된 대표상품 id 목록. 문자열로 고정해 useEffect 의존성으로 쓴다(배열은 매 렌더 새 참조).
  const savedIdsKey = JSON.stringify(so?.featured_product_ids ?? (so?.featured_product_id ? [so.featured_product_id] : []));

  // 후보 목록은 브랜드의 '실제 판매 상품'에서 가져온다.
  //  themeDnsData.products 를 쓰면 안 된다 — 그건 shop.controller.setting 이
  //  shop_obj/blog_obj(홈 섹션)에 이미 배치된 상품 id 만 IN 절에 넣어 만든 목록이라,
  //  홈 섹션 배치 UI 가 없는 블로그 4~9 프레임에서는 영원히 0건이다(= 지정 자체가 불가능했다).
  const fetchProducts = async (search) => {
    setLoading(true);
    const result = await apiManager('products', 'list', {
      page: 1,
      page_size: OPTION_PAGE_SIZE,
      search: search ?? '',
      order: 'id',
    });
    setLoading(false);
    return result;
  };

  // 최초 로드: 최신 등록순으로 후보를 채운다.
  useEffect(() => {
    let alive = true;
    (async () => {
      const result = await fetchProducts('');
      if (!alive || !result?.content) return;
      setOptions(result.content.filter(isSelectable));
      setLoadedAll((result?.total ?? 0) <= result.content.length);
    })();
    return () => { alive = false; };
  }, [themeDnsData?.id]);

  // 상품이 많아 첫 페이지에 다 못 담긴 브랜드만 서버 검색으로 보충한다(디바운스).
  //  전부 불러온 경우엔 Autocomplete 기본 클라이언트 필터로 충분하다.
  useEffect(() => {
    if (loadedAll || !keyword) return;
    let alive = true;
    const timer = setTimeout(async () => {
      const result = await fetchProducts(keyword);
      if (!alive || !result?.content) return;
      setOptions((prev) => mergeById(prev, result.content.filter(isSelectable)));
    }, 350);
    return () => { alive = false; clearTimeout(timer); };
  }, [keyword, loadedAll]);

  // 저장된 대표상품은 후보 첫 페이지에 없을 수 있으므로 id 로 직접 조회해 채운다.
  useEffect(() => {
    let alive = true;
    const ids = JSON.parse(savedIdsKey);
    if (!(ids?.length > 0)) {
      setSelected([]);
      return undefined;
    }
    (async () => {
      const list = await Promise.all(ids.map((id) => apiManager('products', 'get', { id })));
      if (!alive) return;
      setSelected(list.filter((p) => p?.id > 0));
    })();
    return () => { alive = false; };
  }, [themeDnsData?.id, savedIdsKey]);

  // 선택된 항목이 후보에 없으면 MUI 가 값-옵션 불일치 경고를 내므로 합쳐서 넘긴다.
  const allOptions = useMemo(() => mergeById(options, selected), [options, selected]);

  const onSave = async () => {
    setSaving(true);
    const ids = selected.map((p) => p?.id);
    const result = await apiManager('brands', 'update', {
      id: themeDnsData?.id,
      setting_obj: { ...so, featured_product_ids: ids, featured_product_id: ids[0] ?? '' },
    });
    setSaving(false);
    if (result) {
      toast.success('대표 상품이 저장되었습니다.');
      window.location.reload();
    }
  };

  return (
    <>
      <Head><title>대표 상품 관리</title></Head>
      <Container maxWidth="sm" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 900 }}>대표 상품 관리</Typography>
          <Typography sx={{ fontSize: 13.5, color: '#666', lineHeight: 1.7 }}>
            홈 화면에 노출할 대표 상품을 지정합니다. <b>첫 번째</b>가 메인으로, <b>2개 이상</b> 선택하면 나머지는 하단 그리드에 표시됩니다.
          </Typography>
        </Stack>

        {!isSingleProductBlog && (
          <Alert severity="info" sx={{ mb: 2 }}>
            이 설정은 <b>단일·소수 상품 블로그 데모</b>에서만 홈에 반영됩니다. 현재 프레임에는 표시되지 않을 수 있습니다.
          </Alert>
        )}

        <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          <Autocomplete
            multiple
            fullWidth
            loading={loading}
            options={allOptions}
            value={selected}
            getOptionLabel={(p) => p?.product_name ?? ''}
            isOptionEqualToValue={(a, b) => String(a?.id) === String(b?.id)}
            onChange={(e, value) => setSelected(value)}
            onInputChange={(e, value, reason) => {
              // 서버 검색은 상품이 많아 첫 페이지에 다 못 담긴 경우에만 위 useEffect 에서 돈다.
              if (reason === 'input') setKeyword(value);
            }}
            noOptionsText={loading ? '불러오는 중...' : '판매 상품이 없습니다. 먼저 상품을 등록해 주세요.'}
            renderOption={(props, p) => (
              <li {...props} key={p?.id}>
                <Avatar src={p?.product_img} variant="rounded" sx={{ width: 32, height: 32, mr: 1 }} />
                <span style={{ flex: 1 }}>{p?.product_name}</span>
                <span style={{ color: '#888', fontSize: 13 }}>{commarNumber(p?.product_sale_price || p?.product_price || 0)}원</span>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="대표 상품 선택"
                placeholder="상품명으로 검색"
                helperText="비공개 상품은 고객 화면에 노출되지 않아 목록에서 제외됩니다."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button variant="contained" onClick={onSave} disabled={saving}>
              저장
            </Button>
          </Stack>
        </Card>
      </Container>
    </>
  );
};

FeaturedProductPage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default FeaturedProductPage;
